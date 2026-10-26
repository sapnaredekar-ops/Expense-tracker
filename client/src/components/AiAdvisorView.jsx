import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  RefreshCw,
  Bot
} from 'lucide-react';
import { api } from '../services/api';

export const AiAdvisorView = ({ 
  user, 
  aiInsights, 
  onRefreshInsights, 
  refreshing 
}) => {
  const currency = user?.currency || '₹';
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello ${user?.name}! I am your AI Spending Advisor. I analyze your income, categorize your expenditures, detect spending anomalies, and help you meet your savings target. Ask me anything about your finances!`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || chatLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await api.askAiAdvisor(userMsg);
      setMessages((prev) => [...prev, { role: 'assistant', text: res.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev, 
        { role: 'assistant', text: 'Apologies, I encountered an error while processing your request. Please try again.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const getStatusBadge = (rating) => {
    switch (rating?.toLowerCase()) {
      case 'excellent':
      case 'healthy':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: CheckCircle2 };
      case 'moderate':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: AlertTriangle };
      case 'needs attention':
      case 'critical':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: ShieldAlert };
      default:
        return { color: '#818cf8', bg: 'rgba(99, 102, 241, 0.15)', icon: Lightbulb };
    }
  };

  const badge = getStatusBadge(aiInsights?.healthRating);
  const StatusIcon = badge.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* View Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>AI Spending Advisor</h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              color: '#ffffff',
            }}>
              Powered by AI
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Intelligent spending analysis, budgeting recommendations, and conversational wealth advisor
          </p>
        </div>

        <button 
          onClick={onRefreshInsights}
          disabled={refreshing}
          className="btn btn-secondary"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Analyzing...' : 'Re-analyze Spending'}</span>
        </button>
      </div>

      {/* Main Insights Panel */}
      {aiInsights && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Health Assessment */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FINANCIAL HEALTH STATUS</span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: badge.bg,
                color: badge.color,
                fontWeight: 700,
                fontSize: '0.82rem',
              }}>
                <StatusIcon size={14} />
                <span>{aiInsights.healthRating || 'Evaluating'}</span>
              </div>
            </div>

            <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#f1f5f9', marginBottom: '16px' }}>
              {aiInsights.healthSummary}
            </p>

            <div style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span>Active AI Engine:</span>
              <strong style={{ color: '#818cf8' }}>{aiInsights.aiEngine}</strong>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lightbulb size={20} color="#f59e0b" />
              <span>Recommended Next Steps</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {aiInsights.actionItems && aiInsights.actionItems.length > 0 ? (
                aiInsights.actionItems.map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.88rem',
                    }}
                  >
                    <span style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      backgroundColor: 'rgba(99, 102, 241, 0.2)', 
                      color: '#818cf8', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ color: '#e2e8f0' }}>{item}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pending action items.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Identified Anomalies / Specific Observations */}
      {aiInsights?.insights && aiInsights.insights.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Key Spending Patterns & Anomalies</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {aiInsights.insights.map((ins, i) => (
              <div 
                key={i}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#ffffff', marginBottom: '6px' }}>
                  {ins.title}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {ins.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive AI Financial Chatbot */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Interactive Spending Advisor Chat</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Ask personalized questions about budgeting, cuts, or saving tactics
            </span>
          </div>
        </div>

        {/* Chat message history */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((m, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  backgroundColor: m.role === 'user' ? '#4f46e5' : '#1e293b',
                  color: '#ffffff',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border-color)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '10px 16px',
                borderRadius: '14px',
                backgroundColor: '#1e293b',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                border: '1px solid var(--border-color)',
              }}>
                FinAI Advisor is thinking...
              </div>
            </div>
          )}
        </div>

        {/* Chat Input form */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
          <input
            type="text"
            placeholder="Ask me: 'How can I save more money?' or 'What category should I trim?'"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="form-control"
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={chatLoading || !inputText.trim()}
            className="btn btn-primary"
            style={{ padding: '0 20px' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
