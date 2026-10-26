const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide transaction title'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide transaction amount'],
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Transaction type must be income or expense'],
  },
  category: {
    type: String,
    required: [true, 'Please provide category'],
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI / Online', 'Bank Transfer', 'Other'],
    default: 'UPI / Online',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
