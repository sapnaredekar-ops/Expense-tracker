import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Save } from 'lucide-react';

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance & Consulting',
  'Investments & Dividends',
  'Business Profit',
  'Allowance / Gift',
  'Rental Income',
  'Other Income',
];

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Rent & Housing',
  'Utilities & Bills',
  'Transportation & Fuel',
  'Shopping & Apparel',
  'Entertainment & Leisure',
  'Healthcare & Medical',
  'Education & Courses',
  'Personal Care',
  'Travel & Vacations',
  'Debt / EMI Payments',
  'Other Expense',
];

const PAYMENT_METHODS = [
  'UPI / Online',
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Other',
];

export const TransactionModal = ({ isOpen, onClose, onSave, editingTx, currency = '₹' }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: EXPENSE_CATEGORIES[0],
    paymentMethod: 'UPI / Online',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTx) {
      setFormData({
        title: editingTx.title || '',
        amount: editingTx.amount || '',
        type: editingTx.type || 'expense',
        category: editingTx.category || (editingTx.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
        paymentMethod: editingTx.paymentMethod || 'UPI / Online',
        date: editingTx.date ? new Date(editingTx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: editingTx.notes || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: EXPENSE_CATEGORIES[0],
        paymentMethod: 'UPI / Online',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setError('');
  }, [editingTx, isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      setError('Please provide title and amount');
      return;
    }

    if (Number(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave(formData, editingTx?._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const currentCategories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 16, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '28px',
          position: 'relative',
          backgroundColor: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
              {editingTx ? 'Edit Transaction' : 'Record Transaction'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Log income earnings or everyday expenditures
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Income vs Expense Toggle */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            padding: '4px',
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            marginBottom: '18px',
          }}>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: formData.type === 'expense' ? '#ef4444' : 'transparent',
                color: formData.type === 'expense' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: formData.type === 'income' ? '#10b981' : 'transparent',
                color: formData.type === 'income' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              Income (+)
            </button>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Transaction Title / Description *</label>
            <input
              type="text"
              placeholder="e.g., Grocery shopping, Monthly salary, Coffee"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-control"
              required
            />
          </div>

          {/* Amount & Date in 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Amount ({currency}) *</label>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="form-control"
              >
                {currentCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="form-control"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g., Dinner with team, receipt no #29"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-control"
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '22px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : editingTx ? 'Update Record' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
