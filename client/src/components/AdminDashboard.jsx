import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Receipt, 
  Activity, 
  ShieldCheck, 
  Search, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Server, 
  Cpu, 
  Database, 
  FileText, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  PieChart as PieIcon,
} from 'lucide-react';
import { api } from '../services/api';

export const AdminDashboard = ({ user, onSwitchToUserView }) => {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [usersData, setUsersData] = useState({ users: [], totalPages: 1, totalUsers: 0, page: 1 });
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'audit' | 'system'

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Load Top-Level Metrics & System Health
  const loadDashboardData = async () => {
    try {
      const [statsRes, healthRes] = await Promise.all([
        api.getAdminStats(),
        api.getSystemHealth(),
      ]);
      setStats(statsRes);
      setHealth(healthRes);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
      setActionError(err.message || 'Failed to load administrative analytics');
    }
  };

  // Load User Directory with Pagination & Search
  const loadUsers = async (targetPage = page, query = searchQuery, status = statusFilter) => {
    setUsersLoading(true);
    try {
      const res = await api.getAdminUsers({
        page: targetPage,
        limit: 8,
        search: query,
        status,
      });
      setUsersData(res);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load Audit Logs
  const loadAuditLogs = async () => {
    try {
      const logs = await api.getAuditLogs(40);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadDashboardData(), loadUsers(1, '', 'all'), loadAuditLogs()]);
      setLoading(false);
    };
    init();
  }, []);

  // Handle Search Input Debounce / Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers(1, searchQuery, statusFilter);
  };

  // Handle User Activation Toggle
  const handleToggleStatus = async (targetUser) => {
    const nextStatus = !targetUser.isActive;
    const confirmMsg = nextStatus
      ? `Activate account for "${targetUser.name}" (${targetUser.email})?`
      : `Deactivate account for "${targetUser.name}" (${targetUser.email})? They will immediately lose access to their account.`;

    if (!window.confirm(confirmMsg)) return;

    setActionMessage(null);
    setActionError(null);

    try {
      await api.toggleUserStatus(targetUser._id, nextStatus);
      setActionMessage(`Account for ${targetUser.email} is now ${nextStatus ? 'ACTIVE' : 'DEACTIVATED'}.`);
      // Refresh user list and audit logs
      await loadUsers(page, searchQuery, statusFilter);
      await loadAuditLogs();
      await loadDashboardData();
    } catch (err) {
      setActionError(err.message || 'Failed to update user status.');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        color: '#f43f5e',
        fontSize: '1.1rem',
        fontWeight: 600,
        gap: '12px',
      }}>
        <RefreshCw size={24} className="spin" />
        <span>Loading Admin Control Center...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner Alert / Status Messages */}
      {actionMessage && (
        <div style={{
          padding: '12px 18px',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '12px',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.9rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} />
            <span>{actionMessage}</span>
          </div>
          <button 
            onClick={() => setActionMessage(null)} 
            style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div style={{
          padding: '12px 18px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '12px',
          color: '#f87171',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.9rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{actionError}</span>
          </div>
          <button 
            onClick={() => setActionError(null)} 
            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '24px',
        backgroundColor: '#0c111d',
        borderRadius: '20px',
        border: '1px solid rgba(225, 29, 72, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(225, 29, 72, 0.4)',
          }}>
            <ShieldCheck size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Admin Governance Center
              </h1>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(225, 29, 72, 0.2)',
                color: '#fb7185',
                border: '1px solid rgba(225, 29, 72, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Security Level 1
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px' }}>
              Logged in as <strong style={{ color: '#ffffff' }}>{user.name}</strong> ({user.email}) • Aggregated Platform Analytics & Account Management
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              loadDashboardData();
              loadUsers(page, searchQuery, statusFilter);
              loadAuditLogs();
            }}
            className="btn btn-secondary"
            title="Refresh telemetry"
            style={{ padding: '10px 16px', fontSize: '0.88rem' }}
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>

          {onSwitchToUserView && (
            <button
              onClick={onSwitchToUserView}
              className="btn btn-primary"
              style={{
                padding: '10px 16px',
                fontSize: '0.88rem',
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              }}
            >
              <span>Personal Expense View</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Sub-Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px',
      }}>
        {[
          { id: 'overview', label: 'Platform Telemetry', icon: Activity },
          { id: 'users', label: `User Management (${stats?.totalUsers || 0})`, icon: Users },
          { id: 'audit', label: `Audit Log (${auditLogs.length})`, icon: FileText },
          { id: 'system', label: 'System Health', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isActive ? 'rgba(225, 29, 72, 0.15)' : 'transparent',
                color: isActive ? '#fb7185' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={18} color={isActive ? '#fb7185' : 'var(--text-muted)'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & TELEMETRY */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
          }}>
            <div className="card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Registered Users
                  </span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                    {stats?.totalUsers || 0}
                  </div>
                </div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Users size={22} color="#818cf8" />
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} />
                <span>{stats?.activeUsers || 0} Active ({stats?.inactiveUsers || 0} Deactivated)</span>
              </div>
            </div>

            <div className="card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Platform Transactions
                  </span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                    {stats?.totalTransactions || 0}
                  </div>
                </div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Receipt size={22} color="#06b6d4" />
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
                Avg {stats?.averageTxPerUser || 0} records per registered user
              </div>
            </div>

            <div className="card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Global Platform Volume
                  </span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                    ₹{(stats?.platformVolume || 0).toLocaleString()}
                  </div>
                </div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TrendingUp size={22} color="#10b981" />
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                Aggregated system turnover (Income & Outflows)
              </div>
            </div>

            <div className="card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Active Server Node
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>
                    {health?.status === 'operational' ? 'ONLINE' : 'DEGRADED'}
                  </div>
                </div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Server size={22} color="#10b981" />
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                Uptime: {health?.uptimeFormatted || 'N/A'}
              </div>
            </div>
          </div>

          {/* Aggregate Category Breakdown Across Platform */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <PieIcon size={20} color="#f43f5e" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Platform-Wide Expense Categories (Aggregated)</h3>
            </div>
            {stats?.categoryDistribution && stats.categoryDistribution.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {stats.categoryDistribution.map((cat, idx) => (
                  <div key={idx} style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>{cat.category}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {cat.count} transactions recorded
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#f43f5e', fontSize: '1rem' }}>
                        ₹{cat.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No expense records found across platform yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT DIRECTORY */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '24px' }}>
          {/* Search & Filter Header */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Registered Users Directory</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                Search, inspect activity statistics, and govern user account status without exposing private financial logs.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '36px', width: '260px' }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                  loadUsers(1, searchQuery, e.target.value);
                }}
                className="form-control"
                style={{ width: '130px' }}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Deactivated</option>
              </select>

              <button type="submit" className="btn btn-secondary" style={{ padding: '10px 14px' }}>
                Search
              </button>
            </form>
          </div>

          {/* Users Table */}
          {usersLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading user registry...
            </div>
          ) : usersData.users.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No users found matching query.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 14px' }}>User</th>
                    <th style={{ padding: '12px 14px' }}>Role</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>Tx Count</th>
                    <th style={{ padding: '12px 14px' }}>Registered</th>
                    <th style={{ padding: '12px 14px' }}>Last Login</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.users.map((u) => {
                    const isCurrentUser = u._id === user._id;
                    return (
                      <tr key={u._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{u.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: u.role === 'admin' ? 'rgba(225, 29, 72, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                            color: u.role === 'admin' ? '#fb7185' : '#818cf8',
                            border: `1px solid ${u.role === 'admin' ? 'rgba(225, 29, 72, 0.4)' : 'rgba(99, 102, 241, 0.3)'}`,
                            textTransform: 'uppercase',
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.8rem',
                            color: u.isActive ? '#10b981' : '#f87171',
                          }}>
                            {u.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td style={{ padding: '14px', fontWeight: 600 }}>
                          {u.transactionCount}
                        </td>
                        <td style={{ padding: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          {isCurrentUser ? (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Current Session
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                backgroundColor: u.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                borderColor: u.isActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                                color: u.isActive ? '#f87171' : '#34d399',
                              }}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
          }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Showing Page {usersData.page} of {usersData.totalPages} ({usersData.totalUsers} total users)
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={page <= 1}
                onClick={() => {
                  const p = page - 1;
                  setPage(p);
                  loadUsers(p, searchQuery, statusFilter);
                }}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              <button
                disabled={page >= usersData.totalPages}
                onClick={() => {
                  const p = page + 1;
                  setPage(p);
                  loadUsers(p, searchQuery, statusFilter);
                }}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Security & Administrative Audit Registry</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                Immutable trail of administrative logins, user state modifications, and security events.
              </p>
            </div>
            <button onClick={loadAuditLogs} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              <RefreshCw size={14} />
              <span>Refresh Registry</span>
            </button>
          </div>

          {auditLogs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No audit logs recorded yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 14px' }}>Timestamp</th>
                    <th style={{ padding: '12px 14px' }}>Action</th>
                    <th style={{ padding: '12px 14px' }}>Admin</th>
                    <th style={{ padding: '12px 14px' }}>Target</th>
                    <th style={{ padding: '12px 14px' }}>Details</th>
                    <th style={{ padding: '12px 14px' }}>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: log.action.includes('DEACTIVATED') 
                            ? 'rgba(239, 68, 68, 0.2)' 
                            : log.action.includes('LOGIN')
                            ? 'rgba(6, 182, 212, 0.15)'
                            : 'rgba(16, 185, 129, 0.15)',
                          color: log.action.includes('DEACTIVATED') 
                            ? '#f87171' 
                            : log.action.includes('LOGIN')
                            ? '#38bdf8'
                            : '#34d399',
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{log.adminEmail}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {log.targetUserEmail || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{log.details}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SYSTEM HEALTH */}
      {activeTab === 'system' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <Cpu size={22} color="#06b6d4" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Host & Runtime Environment</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Node.js Version:</span>
                <span style={{ fontWeight: 600 }}>{health?.nodeVersion}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Operating System:</span>
                <span style={{ fontWeight: 600 }}>{health?.platform}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Server Uptime:</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>{health?.uptimeFormatted}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Host Free Memory:</span>
                <span style={{ fontWeight: 600 }}>{health?.memory?.systemFreePercent}% free</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <Database size={22} color="#10b981" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Database Infrastructure</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>MongoDB Connection:</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>{health?.database?.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Connected Host:</span>
                <span style={{ fontWeight: 600 }}>{health?.database?.host}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Database Name:</span>
                <span style={{ fontWeight: 600 }}>{health?.database?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Process RSS Heap:</span>
                <span style={{ fontWeight: 600 }}>{health?.memory?.rssMB} MB</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
