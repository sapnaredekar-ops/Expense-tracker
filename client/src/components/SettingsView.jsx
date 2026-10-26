import React, { useState } from 'react';
import { User, Wallet, Save, Key, Check } from 'lucide-react';

export const SettingsView = ({ user, onUpdateProfile }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    currency: user?.currency || '₹',
    monthlyBudget: user?.monthlyBudget || '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await onUpdateProfile({
        name: formData.name,
        currency: formData.currency,
        monthlyBudget: Number(formData.monthlyBudget) || 0,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '700px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Profile & Financial Preferences</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Configure your user details, default currency, and monthly budget limits
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '28px' }}>
        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            color: '#34d399',
            fontSize: '0.9rem',
            marginBottom: '18px',
          }}>
            <Check size={18} />
            <span>Preferences updated successfully!</span>
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '0.9rem',
            marginBottom: '18px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* User Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-control"
              required
            />
          </div>

          {/* Email (Readonly) */}
          <div className="form-group">
            <label className="form-label">Email Address (Registered)</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="form-control"
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Email address cannot be modified.
            </span>
          </div>

          {/* Currency Symbol Selection */}
          <div className="form-group">
            <label className="form-label">Preferred Currency Symbol</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="form-control"
            >
              <option value="₹">₹ - Indian Rupee (INR)</option>
              <option value="$">$ - US Dollar (USD)</option>
              <option value="€">€ - Euro (EUR)</option>
              <option value="£">£ - British Pound (GBP)</option>
              <option value="¥">¥ - Japanese Yen (JPY)</option>
              <option value="AED">AED - UAE Dirham</option>
              <option value="C$">C$ - Canadian Dollar</option>
            </select>
          </div>

          {/* Monthly Target Budget */}
          <div className="form-group">
            <label className="form-label">Target Monthly Expense Budget ({formData.currency})</label>
            <input
              type="number"
              min="0"
              step="100"
              placeholder="e.g., 25000"
              value={formData.monthlyBudget}
              onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
              className="form-control"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              FinAI will track and alert you if your expenses surpass this threshold.
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ marginTop: '12px' }}
          >
            <Save size={18} />
            <span>{saving ? 'Saving Preferences...' : 'Save Preferences'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
