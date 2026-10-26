import React, { useState } from 'react';
import { Wallet, Sparkles, ArrowRight, ShieldCheck, PieChart, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ onOpenAdminLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    currency: '₹',
    monthlyBudget: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick login
  const handleQuickDemo = async () => {
    setError('');
    setLoading(true);
    try {
      // Try login first, or register demo if doesn't exist
      try {
        await login('demo@finai.com', 'demo123456');
      } catch {
        await register({
          name: 'Demo Student',
          email: 'demo@finai.com',
          password: 'demo123456',
          currency: '₹',
          monthlyBudget: 35000,
        });
      }
    } catch (err) {
      setError('Could not sign into demo user. Try manual login/register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1050px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
        backgroundColor: '#0d1322',
      }}>
        {/* Left Hero & Feature Spotlight */}
        <div style={{
          padding: '44px 38px',
          background: 'linear-gradient(135deg, rgba(30, 41, 75, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.5)',
              }}>
                <Wallet size={26} color="#ffffff" />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>FinAI Tracker</h2>
            </div>

            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: '1.2', marginBottom: '16px' }}>
              AI-Powered Personal <br />
              <span style={{ background: 'linear-gradient(90deg, #818cf8, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Expense Management
              </span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: '1.6', marginBottom: '32px' }}>
              Built with the MERN Stack and Google Gemini AI. Take complete control of your finances, visualize monthly cashflow, and receive automated savings intelligence.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} color="#818cf8" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>AI Spending Advisor</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Detects unusual expenditures & provides saving recommendations</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PieChart size={18} color="#06b6d4" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Interactive Financial Analytics</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Visual pie charts, monthly comparison graphs, and CSV reports</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Secure MERN Architecture</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>JWT encrypted authentication and MongoDB transaction storage</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '36px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={handleQuickDemo}
              disabled={loading}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px', borderColor: 'rgba(99, 102, 241, 0.4)' }}
            >
              <TrendingUp size={18} color="#818cf8" />
              <span>Launch Instant Demo Account</span>
            </button>
          </div>
        </div>

        {/* Right Form Container */}
        <div style={{ padding: '44px 38px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {isLogin ? 'Sign In to FinAI' : 'Create an Account'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              {isLogin ? 'Enter your credentials to access your financial dashboard' : 'Join and start tracking your expenses intelligently'}
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '18px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Alex Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="form-control"
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="form-control"
                  >
                    <option value="₹">₹ (INR)</option>
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Target Budget</label>
                  <input
                    type="number"
                    placeholder="30000"
                    value={formData.monthlyBudget}
                    onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '12px' }}
            >
              <span>{loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Now'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account yet?" : 'Already registered?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#818cf8',
                fontWeight: 600,
                cursor: 'pointer',
                marginLeft: '8px',
              }}
            >
              {isLogin ? 'Create one now' : 'Sign In here'}
            </button>
          </div>

          {onOpenAdminLogin && (
            <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={onOpenAdminLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <span>🛡️ Administrator Access Portal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
