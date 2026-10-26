import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  PiggyBank, 
  Target,
  Sparkles,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Plus
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e', '#a855f7'];

export const Dashboard = ({ 
  user, 
  summary, 
  recentTransactions, 
  aiInsights, 
  onOpenAddModal, 
  onEditTx, 
  onDeleteTx,
  setActiveTab 
}) => {
  const currency = user?.currency || '₹';
  const monthlyBudget = user?.monthlyBudget || 0;

  const budgetProgress = monthlyBudget > 0 
    ? Math.min(100, ((summary.totalExpense / monthlyBudget) * 100).toFixed(1))
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner / Welcome */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            Welcome back, <span style={{ background: 'linear-gradient(90deg, #818cf8, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Here is your financial pulse and AI-curated spending insights.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setActiveTab('ai-advisor')}
            className="btn btn-secondary"
            style={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}
          >
            <Sparkles size={18} color="#818cf8" />
            <span>AI Advisor</span>
          </button>
          <button 
            onClick={onOpenAddModal}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '18px',
      }}>
        {/* Net Balance */}
        <div className="glass-panel" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Net Balance</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={20} color="#818cf8" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: summary.balance >= 0 ? '#ffffff' : '#f87171' }}>
            {currency}{summary.balance?.toLocaleString()}
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: summary.balance >= 0 ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {summary.balance >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{summary.balance >= 0 ? 'Surplus Cashflow' : 'Deficit Cashflow'}</span>
          </div>
        </div>

        {/* Total Income */}
        <div className="glass-panel" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Income</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownLeft size={20} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>
            +{currency}{summary.totalIncome?.toLocaleString()}
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Accumulated earnings
          </div>
        </div>

        {/* Total Expenses */}
        <div className="glass-panel" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Expenses</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={20} color="#ef4444" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171' }}>
            -{currency}{summary.totalExpense?.toLocaleString()}
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Savings Rate: <strong style={{ color: '#ffffff' }}>{summary.savingsRate}%</strong>
          </div>
        </div>

        {/* Monthly Budget */}
        <div className="glass-panel" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Target Budget</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {monthlyBudget > 0 ? `${currency}${monthlyBudget.toLocaleString()}` : 'Not Set'}
          </div>
          <div style={{ marginTop: '8px' }}>
            {monthlyBudget > 0 ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Used: {budgetProgress}%</span>
                  <span>{currency}{Math.max(0, monthlyBudget - summary.totalExpense).toLocaleString()} left</span>
                </div>
                <div style={{ height: '6px', borderRadius: '4px', backgroundColor: '#1e293b', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${budgetProgress}%`, 
                    backgroundColor: budgetProgress > 90 ? '#ef4444' : budgetProgress > 70 ? '#f59e0b' : '#10b981',
                    borderRadius: '4px' 
                  }} />
                </div>
              </div>
            ) : (
              <span 
                onClick={() => setActiveTab('settings')}
                style={{ fontSize: '0.78rem', color: '#818cf8', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Set budget in profile
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI Quick Insight Highlight Card */}
      {aiInsights && (
        <div 
          className="glass-panel"
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Sparkles size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#818cf8', letterSpacing: '0.05em' }}>
                  AI Financial Health: {aiInsights.healthRating || 'Evaluating'}
                </span>
                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
                  {aiInsights.aiEngine}
                </span>
              </div>
              <p style={{ fontSize: '0.94rem', color: '#e2e8f0', marginTop: '4px', maxWidth: '800px' }}>
                {aiInsights.healthSummary}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('ai-advisor')}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 16px', whiteSpace: 'nowrap' }}
          >
            View Full AI Report →
          </button>
        </div>
      )}

      {/* Visual Charts Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '24px',
      }}>
        {/* Income vs Expenses Trend */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Monthly Cashflow Trends</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Income vs Expenses</span>
          </div>
          {summary.monthlyTrends && summary.monthlyTrends.length > 0 ? (
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.monthlyTrends}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    formatter={(val) => `${currency}${val.toLocaleString()}`}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" name="Income" />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" name="Expense" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No monthly data to render chart
            </div>
          )}
        </div>

        {/* Top Expense Categories Breakdown */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Expense Category Distribution</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top Outflows</span>
          </div>
          {summary.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', height: '240px' }}>
              <div style={{ flex: 1, height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.categoryBreakdown.slice(0, 5)}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {summary.categoryBreakdown.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      formatter={(val) => `${currency}${val.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {summary.categoryBreakdown.slice(0, 4).map((cat, idx) => (
                  <div key={cat.category} style={{ fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.category}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, color: '#ffffff', paddingLeft: '14px' }}>
                      {cat.percentage}% ({currency}{cat.amount.toLocaleString()})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Add expenses to see category distribution
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Transactions</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Showing latest financial activity
            </p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            View All ({summary.transactionCount})
          </button>
        </div>

        {recentTransactions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentTransactions.slice(0, 5).map((tx) => (
              <div
                key={tx._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: tx.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {tx.type === 'income' ? (
                      <ArrowDownLeft size={20} color="#10b981" />
                    ) : (
                      <ArrowUpRight size={20} color="#ef4444" />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tx.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{new Date(tx.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{tx.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: tx.type === 'income' ? '#34d399' : '#f87171',
                  }}>
                    {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      onClick={() => onEditTx(tx)}
                      style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.74rem', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteTx(tx._id)}
                      style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.74rem', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
            borderRadius: '12px',
          }}>
            <CreditCard size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p>No transactions recorded yet.</p>
            <button
              onClick={onOpenAddModal}
              className="btn btn-primary"
              style={{ marginTop: '14px', fontSize: '0.85rem' }}
            >
              Log your first transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
