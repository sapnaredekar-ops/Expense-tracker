const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const { protect, requireAdmin } = require('../middleware/auth');

// Protect all admin routes with authentication and admin role verification
router.use(protect);
router.use(requireAdmin);

// @route GET /api/admin/stats
// Aggregate application-wide metrics (protects individual user privacy)
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      totalTransactions,
      transactionAggregates,
      categoryDistribution,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ role: 'admin' }),
      Transaction.countDocuments(),
      Transaction.aggregate([
        {
          $group: {
            _id: '$type',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { type: 'expense' } },
        {
          $group: {
            _id: '$category',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 8 },
      ]),
    ]);

    let totalPlatformIncome = 0;
    let totalPlatformExpense = 0;

    transactionAggregates.forEach((item) => {
      if (item._id === 'income') totalPlatformIncome = item.totalAmount;
      if (item._id === 'expense') totalPlatformExpense = item.totalAmount;
    });

    const averageTxPerUser = totalUsers > 0 ? (totalTransactions / totalUsers).toFixed(1) : 0;

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      totalTransactions,
      totalPlatformIncome,
      totalPlatformExpense,
      platformVolume: totalPlatformIncome + totalPlatformExpense,
      averageTxPerUser: Number(averageTxPerUser),
      categoryDistribution: categoryDistribution.map((c) => ({
        category: c._id,
        amount: c.totalAmount,
        count: c.count,
      })),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: error.message || 'Error compiling administrative analytics' });
  }
});

// @route GET /api/admin/users
// Paginated, searchable user directory with aggregate statistics (never exposes passwords or hashes)
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const statusFilter = req.query.status; // 'active', 'inactive', 'all'
    const roleFilter = req.query.role; // 'user', 'admin', 'all'

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (statusFilter === 'active') {
      filter.isActive = { $ne: false };
    } else if (statusFilter === 'inactive') {
      filter.isActive = false;
    }

    if (roleFilter && roleFilter !== 'all') {
      filter.role = roleFilter;
    }

    const totalMatching = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Attach transaction counts for each user without leaking individual financial items
    const userIds = users.map((u) => u._id);
    const txCounts = await Transaction.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);

    const txCountMap = {};
    txCounts.forEach((tc) => {
      txCountMap[tc._id.toString()] = tc.count;
    });

    const enrichedUsers = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role || 'user',
      isActive: u.isActive !== false,
      currency: u.currency || '₹',
      monthlyBudget: u.monthlyBudget || 0,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin || null,
      transactionCount: txCountMap[u._id.toString()] || 0,
    }));

    res.json({
      users: enrichedUsers,
      page,
      limit,
      totalPages: Math.ceil(totalMatching / limit) || 1,
      totalUsers: totalMatching,
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: error.message || 'Error fetching user directory' });
  }
});

// @route PATCH /api/admin/users/:id/status
// Toggle user activation / deactivation status with safeguards
router.patch('/users/:id/status', async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive boolean flag is required' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Guard: Prevent an administrator from deactivating their own active account
    if (targetUser._id.toString() === req.user._id.toString() && !isActive) {
      return res.status(400).json({ message: 'Self-deactivation is prohibited to prevent lockout' });
    }

    // Guard: Prevent deactivating the last active admin
    if (targetUser.role === 'admin' && !isActive) {
      const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: { $ne: false } });
      if (activeAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot deactivate the sole remaining active administrator' });
      }
    }

    targetUser.isActive = isActive;
    await targetUser.save({ validateBeforeSave: false });

    // Record audit log
    await AuditLog.create({
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      adminId: req.user._id,
      adminEmail: req.user.email,
      targetUserId: targetUser._id,
      targetUserEmail: targetUser.email,
      details: `Administrator ${req.user.email} changed user ${targetUser.email} status to ${isActive ? 'ACTIVE' : 'DEACTIVATED'}`,
      ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
    });

    res.json({
      message: `User status updated to ${isActive ? 'active' : 'deactivated'}`,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        isActive: targetUser.isActive,
      },
    });
  } catch (error) {
    console.error('Admin update status error:', error);
    res.status(500).json({ message: error.message || 'Error updating user status' });
  }
});

// @route GET /api/admin/audit-logs
// View audit log records
router.get('/audit-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json(logs);
  } catch (error) {
    console.error('Admin audit logs error:', error);
    res.status(500).json({ message: error.message || 'Error fetching audit logs' });
  }
});

// @route GET /api/admin/system-health
// System metrics and server health
router.get('/system-health', async (req, res) => {
  try {
    const uptimeSeconds = Math.floor(process.uptime());
    const memUsage = process.memoryUsage();
    const systemFreeMem = os.freemem();
    const systemTotalMem = os.totalmem();

    const dbState = mongoose.connection.readyState;
    const dbStateLabels = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };

    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: `${os.type()} ${os.arch()}`,
      uptimeSeconds,
      uptimeFormatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
      memory: {
        heapUsedMB: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMB: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
        rssMB: (memUsage.rss / 1024 / 1024).toFixed(2),
        systemFreePercent: ((systemFreeMem / systemTotalMem) * 100).toFixed(1),
      },
      database: {
        status: dbStateLabels[dbState] || 'Unknown',
        host: mongoose.connection.host || 'localhost',
        name: mongoose.connection.name || 'expense_tracker',
      },
    });
  } catch (error) {
    console.error('Admin system health error:', error);
    res.status(500).json({ message: error.message || 'Error fetching system health metrics' });
  }
});

module.exports = router;
