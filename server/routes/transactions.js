const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// Apply protect middleware to all transaction routes
router.use(protect);

// @route GET /api/transactions
// Get all transactions with optional query filters (month, year, type, category, search)
router.get('/', async (req, res) => {
  try {
    const { type, category, startDate, endDate, search, limit = 100 } = req.query;

    let query = { user: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit));

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching transactions' });
  }
});

// @route POST /api/transactions
// Create a new transaction
router.post('/', async (req, res) => {
  try {
    const { title, amount, type, category, date, notes, paymentMethod } = req.body;

    if (!title || amount === undefined || !type || !category) {
      return res.status(400).json({ message: 'Title, amount, type, and category are required' });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount: Number(amount),
      type,
      category,
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
      paymentMethod: paymentMethod || 'UPI / Online',
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating transaction' });
  }
});

// @route PUT /api/transactions/:id
// Update an existing transaction
router.put('/:id', async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this transaction' });
    }

    const { title, amount, type, category, date, notes, paymentMethod } = req.body;

    transaction.title = title !== undefined ? title : transaction.title;
    transaction.amount = amount !== undefined ? Number(amount) : transaction.amount;
    transaction.type = type !== undefined ? type : transaction.type;
    transaction.category = category !== undefined ? category : transaction.category;
    transaction.date = date !== undefined ? new Date(date) : transaction.date;
    transaction.notes = notes !== undefined ? notes : transaction.notes;
    transaction.paymentMethod = paymentMethod !== undefined ? paymentMethod : transaction.paymentMethod;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating transaction' });
  }
});

// @route DELETE /api/transactions/:id
// Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this transaction' });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting transaction' });
  }
});

// @route GET /api/transactions/summary
// Get financial totals, monthly statistics, and category breakdowns
router.get('/stats/summary', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: 1 });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = {};
    const monthlyMap = {};

    transactions.forEach((tx) => {
      const amt = tx.amount;
      const d = new Date(tx.date);
      const monthYear = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;

      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { month: monthYear, income: 0, expense: 0, net: 0, timestamp: d.getTime() };
      }

      if (tx.type === 'income') {
        totalIncome += amt;
        monthlyMap[monthYear].income += amt;
      } else {
        totalExpense += amt;
        monthlyMap[monthYear].expense += amt;

        if (!categoryMap[tx.category]) {
          categoryMap[tx.category] = 0;
        }
        categoryMap[tx.category] += amt;
      }

      monthlyMap[monthYear].net = monthlyMap[monthYear].income - monthlyMap[monthYear].expense;
    });

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;

    // Convert category map to array sorted by highest expense
    const categoryBreakdown = Object.keys(categoryMap)
      .map((cat) => ({
        category: cat,
        amount: categoryMap[cat],
        percentage: totalExpense > 0 ? ((categoryMap[cat] / totalExpense) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly trends array sorted by date
    const monthlyTrends = Object.values(monthlyMap).sort((a, b) => a.timestamp - b.timestamp);

    res.json({
      totalIncome,
      totalExpense,
      balance,
      savingsRate: Number(savingsRate),
      transactionCount: transactions.length,
      categoryBreakdown,
      monthlyTrends,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error computing financial summary' });
  }
});

module.exports = router;
