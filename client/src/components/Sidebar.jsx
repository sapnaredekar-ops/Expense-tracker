import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Sparkles, 
  PieChart, 
  Settings, 
  LogOut,
  Wallet,
  TrendingUp,
  User,
  ShieldAlert
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenAddModal }) => {
  return null; // Integrated into full modern layout
};

export const Sidebar = ({ activeTab, setActiveTab, user, onLogout, onOpenAddModal }) => {
  const isAdmin = user && user.role === 'admin';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'analytics', label: 'Visual Analytics', icon: PieChart },
    { id: 'ai-advisor', label: 'AI Advisor', icon: Sparkles, badge: 'AI' },
    { id: 'settings', label: 'Budget & Profile', icon: Settings },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Portal', icon: ShieldAlert, badge: 'Admin' }] : []),
  ];

  return (
    <aside style={{
      width: '270px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 28px 8px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
        }}>
          <Wallet size={24} color="#ffffff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>FinAI Tracker</h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Smart Spending
          </span>
        </div>
      </div>

      {/* Quick Action Button */}
      <div style={{ marginBottom: '24px', padding: '0 4px' }}>
        <button 
          onClick={onOpenAddModal}
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '0.95rem' }}
        >
          <TrendingUp size={18} />
          <span>+ Add Transaction</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.18), rgba(99, 102, 241, 0.05))' : 'transparent',
                color: isActive ? '#818cf8' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease',
                position: 'relative',
              }}
            >
              <Icon size={20} color={isActive ? '#818cf8' : '#94a3b8'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  color: '#ffffff',
                }}>
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '25%',
                  bottom: '25%',
                  width: '3px',
                  backgroundColor: '#6366f1',
                  borderRadius: '3px 0 0 3px',
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div style={{
        padding: '14px',
        borderRadius: '14px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <User size={18} color="#818cf8" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'User'}
              </span>
              {isAdmin && (
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(225, 29, 72, 0.25)',
                  color: '#fb7185',
                  border: '1px solid rgba(225, 29, 72, 0.4)',
                }}>
                  ADMIN
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Sign Out"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
