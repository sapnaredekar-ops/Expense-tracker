const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route POST /api/auth/register
// Public registration: strictly enforces 'user' role and ignores any client-supplied role
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, currency, monthlyBudget } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Always enforce role: 'user' for public registration
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      isActive: true,
      lastLogin: new Date(),
      currency: currency || '₹',
      monthlyBudget: Number(monthlyBudget) || 0,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      currency: user.currency,
      monthlyBudget: user.monthlyBudget,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

// @route POST /api/auth/login
// Regular user login (also permits admin to log in to user view if needed)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (user.isActive === false) {
        return res.status(403).json({ message: 'Account is deactivated. Please contact an administrator.' });
      }

      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        isActive: user.isActive,
        currency: user.currency,
        monthlyBudget: user.monthlyBudget,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
});

// @route POST /api/auth/admin/login
// Separate secure administrator login endpoint
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide administrator email and password' });
    }

    const admin = await User.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid administrator credentials' });
    }

    // Role verification
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: You do not possess administrator authorization' });
    }

    // Active status verification
    if (admin.isActive === false) {
      return res.status(403).json({ message: 'Administrator account is currently deactivated' });
    }

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    // Record audit log entry
    await AuditLog.create({
      action: 'ADMIN_LOGIN',
      adminId: admin._id,
      adminEmail: admin.email,
      details: 'Administrator authenticated successfully to Admin Portal',
      ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
    });

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      currency: admin.currency,
      monthlyBudget: admin.monthlyBudget,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during administrator login' });
  }
});

// @route POST /api/auth/admin/register
// Dedicated Administrator registration endpoint protected by an Admin Secret Passcode
router.post('/admin/register', async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (!name || !email || !password || !adminSecret) {
      return res.status(400).json({ message: 'Name, email, password, and Admin Secret Passcode are all required.' });
    }

    const expectedSecret = process.env.ADMIN_REGISTRATION_SECRET;
    if (adminSecret.trim() !== expectedSecret.trim()) {
      return res.status(403).json({ message: 'Invalid Admin Secret Passcode. Unauthorized registration attempt.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Administrator password must be at least 8 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account already exists with this email address.' });
    }

    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin',
      isActive: true,
      lastLogin: new Date(),
    });

    await AuditLog.create({
      action: 'ADMIN_REGISTERED',
      adminId: admin._id,
      adminEmail: admin.email,
      details: 'New administrator registered via Admin Portal using verified secret passcode',
      ipAddress: req.ip || req.connection?.remoteAddress || '127.0.0.1',
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      currency: admin.currency,
      monthlyBudget: admin.monthlyBudget,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during administrator registration' });
  }
});

// @route GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

// @route PUT /api/auth/profile
// Sanitize profile update to prevent modifying role or isActive status
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Never accept role or isActive changes from this general profile route
    user.name = req.body.name || user.name;
    user.currency = req.body.currency || user.currency;
    if (req.body.monthlyBudget !== undefined) {
      user.monthlyBudget = Number(req.body.monthlyBudget);
    }
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role || 'user',
      isActive: updatedUser.isActive,
      currency: updatedUser.currency,
      monthlyBudget: updatedUser.monthlyBudget,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating profile' });
  }
});

module.exports = router;
