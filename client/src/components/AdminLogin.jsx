import React, { useState } from 'react';
import { Shield, Lock, Mail, User, ArrowLeft, ArrowRight, AlertTriangle, KeyRound, CheckCircle2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLogin = ({ onBackToUserLogin }) => {
  const { adminLogin, adminRegister } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await adminLogin(email, password);
      } else {
        await adminRegister({
          name,
          email,
          password,
          adminSecret,
        });
      }
    } catch (err) {
      setError(err.message || (isLogin ? 'Administrator authentication failed. Unauthorized credentials.' : 'Administrator registration failed.'));
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
      background: 'radial-gradient(ellipse at 50% 20%, rgba(225, 29, 72, 0.12) 0%, rgba(15, 23, 42, 0.98) 70%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '540px',
        backgroundColor: '#0c111d',
        borderRadius: '24px',
        border: '1px solid rgba(225, 29, 72, 0.35)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(225, 29, 72, 0.15)',
        padding: '38px 36px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle Top Red Security Accent Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #e11d48, #f43f5e, #fb7185)',
        }} />

        {/* Top Controls: Return to User Login & Mode Toggle Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <button
            onClick={onBackToUserLogin}
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              padding: '6px 0',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <ArrowLeft size={16} />
            <span>Return to User Login</span>
          </button>

          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(225, 29, 72, 0.2)',
            color: '#fb7185',
            border: '1px solid rgba(225, 29, 72, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Restricted Admin Zone
          </span>
        </div>

        {/* Header Badge & Title */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.2) 0%, rgba(244, 63, 94, 0.05) 100%)',
            border: '1px solid rgba(225, 29, 72, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            boxShadow: '0 8px 24px rgba(225, 29, 72, 0.25)',
          }}>
            <Shield size={30} color="#f43f5e" />
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            {isLogin ? 'FinAI Administrator Portal' : 'Register New Administrator'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
            {isLogin 
              ? 'Restricted perimeter for system governance, platform telemetry, and account management.'
              : 'Create a authorized administrative account. Requires valid system Administrator Passcode.'}
          </p>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          padding: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSuccessMsg('');
            }}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isLogin ? '#e11d48' : 'transparent',
              color: isLogin ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <KeyRound size={16} />
            <span>Admin Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSuccessMsg('');
            }}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: !isLogin ? '#e11d48' : 'transparent',
              color: !isLogin ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <UserPlus size={16} />
            <span>Admin Register</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(225, 29, 72, 0.15)',
            border: '1px solid rgba(225, 29, 72, 0.4)',
            borderRadius: '12px',
            color: '#fda4af',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}>
            <AlertTriangle size={18} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '12px',
            color: '#34d399',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}>
            <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="#f43f5e" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Security Lead"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                required
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderColor: 'rgba(225, 29, 72, 0.25)',
                  color: '#ffffff',
                }}
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} color="#f43f5e" />
              <span>Administrator Email *</span>
            </label>
            <input
              type="email"
              placeholder="admin@finai.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
              autoFocus
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(225, 29, 72, 0.25)',
                color: '#ffffff',
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: isLogin ? '24px' : '16px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} color="#f43f5e" />
              <span>{isLogin ? 'Master Password *' : 'Create Master Password (min 8 chars) *'}</span>
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
              minLength={isLogin ? 1 : 8}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(225, 29, 72, 0.25)',
                color: '#ffffff',
              }}
            />
          </div>

          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <Key size={14} color="#f43f5e" />
                  <span>Admin Passcode Verification *</span>
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showSecret ? "text" : "password"}
                  placeholder="Enter server Admin Secret Passcode"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="form-control"
                  required
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderColor: 'rgba(225, 29, 72, 0.25)',
                    color: '#ffffff',
                    paddingRight: '40px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                  title={showSecret ? "Hide Passcode" : "Show Passcode"}
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.98rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(225, 29, 72, 0.4)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            {isLogin ? <KeyRound size={18} /> : <UserPlus size={18} />}
            <span>
              {loading 
                ? (isLogin ? 'Authenticating Admin...' : 'Provisioning Admin Account...') 
                : (isLogin ? 'Authenticate as Admin' : 'Complete Administrator Registration')}
            </span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Footer info */}
        <div style={{
          marginTop: '26px',
          paddingTop: '18px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span>Strict server-side validation against privilege escalation.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span>All administrative registrations & logins are recorded in audit logs.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
