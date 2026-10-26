import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e', '#a855f7'];

export const VisualAnalyticsView = ({ summary, currency = '₹' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Visual Financial Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Interactive charts and graphical reports illustrating your cashflow distribution and monthly changes
        </p>
      </div>

      {/* Summary KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Tracked Inflow</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>
            {currency}{summary.totalIncome?.toLocaleString()}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Tracked Outflow</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f87171', marginTop: '4px' }}>
            {currency}{summary.totalExpense?.toLocaleString()}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net Savings Rate</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#818cf8', marginTop: '4px' }}>
            {summary.savingsRate}%
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transaction Count</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
            {summary.transactionCount}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px' }}>
        {/* Monthly Inflow vs Outflow Bar Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Monthly Comparison</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Income earned vs Expenses spent side-by-side
          </p>

          {summary.monthlyTrends && summary.monthlyTrends.length > 0 ? (
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.monthlyTrends}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    formatter={(val) => `${currency}${val.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No monthly trend data available
            </div>
          )}
        </div>

        {/* Expense Category Breakdown Pie Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Category Outflow Distribution</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Visual share of every expense category
          </p>

          {summary.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {summary.categoryBreakdown.map((entry, index) => (
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
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No expense breakdown recorded
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Table */}
      {summary.categoryBreakdown && summary.categoryBreakdown.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Category Spending Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {summary.categoryBreakdown.map((cat, idx) => (
              <div 
                key={cat.category}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.category}</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                  {currency}{cat.amount.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {cat.percentage}% of overall expenses
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
