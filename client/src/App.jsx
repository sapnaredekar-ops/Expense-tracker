import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TransactionsView } from './components/TransactionsView';
import { VisualAnalyticsView } from './components/VisualAnalyticsView';
import { AiAdvisorView } from './components/AiAdvisorView';
import { SettingsView } from './components/SettingsView';
import { TransactionModal } from './components/TransactionModal';
import { AuthModal } from './components/AuthModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

export function App() {
  const { user, loading: authLoading, logout, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    savingsRate: 0,
    transactionCount: 0,
    categoryBreakdown: [],
    monthlyTrends: [],
  });
  
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Load user transactions, summary and AI insights
  const refreshAllData = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [txList, stats] = await Promise.all([
        api.getTransactions(),
        api.getStatsSummary(),
      ]);

      setTransactions(txList);
      setSummary(stats);

      // If user has no transactions yet, seed some helpful sample data for demonstration
      if (txList.length === 0) {
        await seedSampleTransactions();
        return;
      }

      // Load AI insights
      loadAiInsights();
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const seedSampleTransactions = async () => {
    try {
      const samples = [
        { title: 'Monthly Salary', amount: 65000, type: 'income', category: 'Salary', paymentMethod: 'Bank Transfer', date: new Date(Date.now() - 15 * 86400000) },
        { title: 'Freelance Project Stipend', amount: 15000, type: 'income', category: 'Freelance & Consulting', paymentMethod: 'UPI / Online', date: new Date(Date.now() - 5 * 86400000) },
        { title: 'Apartment Rent', amount: 18000, type: 'expense', category: 'Rent & Housing', paymentMethod: 'Bank Transfer', date: new Date(Date.now() - 14 * 86400000) },
        { title: 'Supermarket Groceries', amount: 6200, type: 'expense', category: 'Groceries', paymentMethod: 'UPI / Online', date: new Date(Date.now() - 10 * 86400000) },
        { title: 'Weekend Dining & Lounge', amount: 4800, type: 'expense', category: 'Food & Dining', paymentMethod: 'Credit Card', date: new Date(Date.now() - 7 * 86400000) },
        { title: 'Electricity & Wifi Bill', amount: 2800, type: 'expense', category: 'Utilities & Bills', paymentMethod: 'UPI / Online', date: new Date(Date.now() - 4 * 86400000) },
        { title: 'Fuel & Cab Commute', amount: 3100, type: 'expense', category: 'Transportation & Fuel', paymentMethod: 'UPI / Online', date: new Date(Date.now() - 2 * 86400000) },
      ];

      for (const sample of samples) {
        await api.addTransaction(sample);
      }

      const [txList, stats] = await Promise.all([
        api.getTransactions(),
        api.getStatsSummary(),
      ]);
      setTransactions(txList);
      setSummary(stats);
      loadAiInsights();
    } catch (e) {
      console.error('Failed to seed sample records:', e);
    }
  };

  const loadAiInsights = async () => {
    setAiLoading(true);
    try {
      const insights = await api.getAiInsights();
      setAiInsights(insights);
    } catch (err) {
      console.error('Failed to load AI insights:', err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // If user logged in as admin, default view can be admin
      if (user.role === 'admin' && activeTab === 'dashboard') {
        setActiveTab('admin');
      }
      refreshAllData();
    }
  }, [user]);

  // Handle Save Transaction (create or update)
  const handleSaveTransaction = async (txData, id) => {
    if (id) {
      await api.updateTransaction(id, txData);
    } else {
      await api.addTransaction(txData);
    }
    await refreshAllData();
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await api.deleteTransaction(id);
      await refreshAllData();
    }
  };

  const handleOpenAddModal = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  const handleEditTx = (tx) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  if (authLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        color: '#818cf8',
        fontSize: '1.2rem',
        fontWeight: 600,
      }}>
        Loading FinAI Tracker...
      </div>
    );
  }

  // Not authenticated: render either Admin Login or standard user Auth Modal
  if (!user) {
    if (showAdminLogin) {
      return <AdminLogin onBackToUserLogin={() => setShowAdminLogin(false)} />;
    }
    return <AuthModal onOpenAdminLogin={() => setShowAdminLogin(true)} />;
  }

  // Guard: if user has role !== 'admin' and activeTab is 'admin', revert immediately to dashboard
  const effectiveTab = (activeTab === 'admin' && user.role !== 'admin') ? 'dashboard' : activeTab;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Permanent Sidebar Navigation */}
      <Sidebar 
        activeTab={effectiveTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={logout} 
        onOpenAddModal={handleOpenAddModal} 
      />

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        padding: effectiveTab === 'admin' ? '28px 36px' : '36px 42px',
        overflowY: 'auto',
        maxHeight: '100vh',
      }}>
        {effectiveTab === 'admin' && user.role === 'admin' && (
          <AdminDashboard 
            user={user} 
            onSwitchToUserView={() => setActiveTab('dashboard')} 
          />
        )}

        {effectiveTab === 'dashboard' && (
          <Dashboard 
            user={user}
            summary={summary}
            recentTransactions={transactions}
            aiInsights={aiInsights}
            onOpenAddModal={handleOpenAddModal}
            onEditTx={handleEditTx}
            onDeleteTx={handleDeleteTransaction}
            setActiveTab={setActiveTab}
          />
        )}

        {effectiveTab === 'transactions' && (
          <TransactionsView 
            transactions={transactions}
            currency={user.currency}
            onOpenAddModal={handleOpenAddModal}
            onEditTx={handleEditTx}
            onDeleteTx={handleDeleteTransaction}
          />
        )}

        {effectiveTab === 'analytics' && (
          <VisualAnalyticsView 
            summary={summary}
            currency={user.currency}
          />
        )}

        {effectiveTab === 'ai-advisor' && (
          <AiAdvisorView 
            user={user}
            aiInsights={aiInsights}
            onRefreshInsights={loadAiInsights}
            refreshing={aiLoading}
          />
        )}

        {effectiveTab === 'settings' && (
          <SettingsView 
            user={user}
            onUpdateProfile={updateProfile}
          />
        )}
      </main>

      {/* Modal for Adding / Editing Transaction */}
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTx={editingTx}
        currency={user.currency}
      />
    </div>
  );
}

export default App;

