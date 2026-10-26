import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Edit3, 
  Trash2, 
  Plus, 
  Download,
  Calendar
} from 'lucide-react';

export const TransactionsView = ({ 
  transactions, 
  currency = '₹', 
  onOpenAddModal, 
  onEditTx, 
  onDeleteTx 
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    const matchesSearch = 
      tx.title.toLowerCase().includes(search.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase())) ||
      tx.category.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  // Export to CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Title', 'Type', 'Amount', 'Category', 'Payment Method', 'Date', 'Notes'];
    const rows = filtered.map(t => [
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      `"${t.category}"`,
      `"${t.paymentMethod}"`,
      new Date(t.date).toISOString().split('T')[0],
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expense_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Transactions History</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Inspect, filter, edit, or export your full financial records
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleExportCSV}
            className="btn btn-secondary"
            disabled={filtered.length === 0}
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={onOpenAddModal}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 240px', background: 'var(--bg-input)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by title, notes, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              width: '100%',
              fontSize: '0.9rem',
            }}
          />
        </div>

        {/* Filter Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-control"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="all">All Types (Income & Expenses)</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>

        {/* Filter Category */}
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-control"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Record</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Payment Method</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((tx) => (
                  <tr 
                    key={tx._id}
                    style={{ 
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: tx.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {tx.type === 'income' ? (
                            <ArrowDownLeft size={18} color="#10b981" />
                          ) : (
                            <ArrowUpRight size={18} color="#ef4444" />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{tx.title}</div>
                          {tx.notes && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.notes}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                      }}>
                        {tx.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                      {tx.paymentMethod}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: tx.type === 'income' ? '#34d399' : '#f87171' }}>
                      {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => onEditTx(tx)}
                          title="Edit"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-color)',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            color: '#818cf8',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => onDeleteTx(tx._id)}
                          title="Delete"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            color: '#f87171',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No matching transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
