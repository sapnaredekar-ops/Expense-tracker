const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');

router.use(protect);

// Helper function: Rule-based Financial Intelligence Engine
function generateSmartFinancialInsights(user, transactions, summary) {
  const { totalIncome, totalExpense, balance, savingsRate, categoryBreakdown } = summary;
  const insights = [];
  const actionItems = [];

  // 1. Health Status
  let healthRating = 'Good';
  let healthSummary = '';

  if (totalIncome === 0 && totalExpense > 0) {
    healthRating = 'Critical';
    healthSummary = 'Expenses are accumulating without any recorded income. Immediate cashflow attention is required.';
    actionItems.push('Log all regular income sources to track net flow accurately.');
  } else if (totalExpense > totalIncome) {
    healthRating = 'Needs Attention';
    healthSummary = `You are currently spending ${(totalExpense - totalIncome).toLocaleString()} more than your recorded earnings. Your net balance is negative.`;
    actionItems.push('Review high discretionary expense categories to bring spending below income.');
  } else if (savingsRate >= 30) {
    healthRating = 'Excellent';
    healthSummary = `Superb financial discipline! You are saving ${savingsRate}% of your income, exceeding the recommended 20% benchmark.`;
    actionItems.push('Consider allocating surplus funds into systematic investment plans (SIPs) or emergency funds.');
  } else if (savingsRate >= 15) {
    healthRating = 'Healthy';
    healthSummary = `You are maintaining a steady savings rate of ${savingsRate}%. Good foundation for future goals.`;
    actionItems.push('Aim to increase your savings rate to 20-30% by trimming small recurring expenses.');
  } else {
    healthRating = 'Moderate';
    healthSummary = `Your savings rate is ${savingsRate}%. A slight increase in savings will provide a more secure safety net.`;
    actionItems.push('Implement the 50/30/20 budget rule (50% Needs, 30% Wants, 20% Savings).');
  }

  // 2. Category specific insights
  if (categoryBreakdown && categoryBreakdown.length > 0) {
    const topCategory = categoryBreakdown[0];
    insights.push({
      type: 'warning',
      title: `Dominant Outflow: ${topCategory.category}`,
      message: `${topCategory.category} accounts for ${topCategory.percentage}% (${user.currency || '₹'}${topCategory.amount.toLocaleString()}) of your total expenses.`,
    });

    // Check for Food & Dining / Entertainment
    const leisureCats = categoryBreakdown.filter(c => 
      ['Food & Dining', 'Entertainment', 'Shopping', 'Hobbies', 'Travel'].includes(c.category)
    );
    const leisureTotal = leisureCats.reduce((sum, c) => sum + c.amount, 0);
    const leisurePercent = totalExpense > 0 ? ((leisureTotal / totalExpense) * 100).toFixed(1) : 0;

    if (leisurePercent > 35) {
      insights.push({
        type: 'caution',
        title: 'High Lifestyle & Discretionary Spend',
        message: `Dining, Shopping, and Entertainment make up ${leisurePercent}% of your outflows. Cutting 10% here could save ${user.currency || '₹'}${Math.round(leisureTotal * 0.1).toLocaleString()} each month.`,
      });
      actionItems.push('Set weekly spending caps for dining out and impulse shopping.');
    }
  }

  // 3. Monthly budget check
  if (user.monthlyBudget && user.monthlyBudget > 0) {
    const budgetUsedPercent = ((totalExpense / user.monthlyBudget) * 100).toFixed(1);
    if (totalExpense > user.monthlyBudget) {
      insights.push({
        type: 'danger',
        title: 'Budget Overrun Alert',
        message: `You have exceeded your monthly budget of ${user.currency || '₹'}${user.monthlyBudget.toLocaleString()} by ${user.currency || '₹'}${(totalExpense - user.monthlyBudget).toLocaleString()} (${budgetUsedPercent}% utilized).`,
      });
    } else {
      insights.push({
        type: 'success',
        title: 'Within Monthly Budget',
        message: `You have utilized ${budgetUsedPercent}% of your ${user.currency || '₹'}${user.monthlyBudget.toLocaleString()} budget. Remaining allowance: ${user.currency || '₹'}${(user.monthlyBudget - totalExpense).toLocaleString()}.`,
      });
    }
  }

  // Fallback / default action items
  if (actionItems.length === 0) {
    actionItems.push('Keep recording transactions regularly to uncover deeper trends.');
    actionItems.push('Build an emergency fund equivalent to 3-6 months of essential expenses.');
  }

  return {
    healthRating,
    healthSummary,
    insights,
    actionItems,
    projectedMonthlySavings: Math.max(0, balance),
    aiEngine: 'Built-in Smart Analytics Engine',
  };
}

// @route GET /api/ai/insights
// Generate AI spending advisor analysis and personalized tips
router.get('/insights', async (req, res) => {
  try {
    const user = req.user;
    const transactions = await Transaction.find({ user: user._id }).sort({ date: -1 }).limit(100);

    // Compute basic totals
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = {};

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      }
    });

    const categoryBreakdown = Object.keys(categoryMap)
      .map((cat) => ({
        category: cat,
        amount: categoryMap[cat],
        percentage: totalExpense > 0 ? ((categoryMap[cat] / totalExpense) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const summary = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      savingsRate: totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0,
      categoryBreakdown,
    };

    if (transactions.length === 0) {
      return res.json({
        healthRating: 'No Data Yet',
        healthSummary: 'Welcome to your AI Expense Advisor! Record your first income and expense transactions to unlock real-time financial intelligence.',
        insights: [
          {
            type: 'info',
            title: 'Start Tracking',
            message: 'Add your salary or monthly allowance and your daily spends using the quick add form.',
          },
        ],
        actionItems: [
          'Add your monthly income',
          'Add recent expenses (Groceries, Rent, Bills, Dining)',
          'Set your monthly budget in Profile settings',
        ],
        projectedMonthlySavings: 0,
        aiEngine: 'Awaiting Records',
      });
    }

    // Try Gemini API if key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a certified professional personal finance and wealth advisor. 
Analyze the following financial data for user ${user.name} (Currency: ${user.currency || '₹'}):
- Total Income: ${summary.totalIncome}
- Total Expenses: ${summary.totalExpense}
- Net Balance: ${summary.balance}
- Savings Rate: ${summary.savingsRate}%
- Monthly Target Budget: ${user.monthlyBudget || 'Not set'}
- Top Expense Categories: ${JSON.stringify(categoryBreakdown.slice(0, 6))}
- Recent Transactions Sample: ${JSON.stringify(
          transactions.slice(0, 15).map(t => ({ title: t.title, amount: t.amount, type: t.type, category: t.category, date: t.date }))
        )}

Return ONLY a valid JSON object strictly matching this schema with NO markdown code fences or backticks:
{
  "healthRating": "Excellent" | "Healthy" | "Moderate" | "Needs Attention" | "Critical",
  "healthSummary": "Concise summary of their financial posture and behavior",
  "insights": [
    {
      "type": "warning" | "caution" | "success" | "info" | "danger",
      "title": "Short title",
      "message": "Specific observation on spending anomalies or patterns"
    }
  ],
  "actionItems": [
    "Practical actionable tip 1",
    "Practical actionable tip 2",
    "Practical actionable tip 3"
  ],
  "projectedMonthlySavings": number
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        let text = response.text.trim();
        // Remove markdown formatting if present
        text = text.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

        const parsed = JSON.parse(text);
        return res.json({
          ...parsed,
          aiEngine: 'Google Gemini 2.5 Flash',
        });
      } catch (geminiError) {
        console.warn('Gemini API call failed or key invalid, falling back to smart rule engine:', geminiError.message);
        const fallback = generateSmartFinancialInsights(user, transactions, summary);
        return res.json({
          ...fallback,
          aiEngine: 'Built-in Smart Analytics Engine (Gemini fallback)',
        });
      }
    }

    // If no Gemini key, use the comprehensive rule-based intelligence engine
    const insights = generateSmartFinancialInsights(user, transactions, summary);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error generating AI insights' });
  }
});

// @route POST /api/ai/ask
// Interactive financial chat assistant with user's financial context
router.post('/ask', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const user = req.user;
    const transactions = await Transaction.find({ user: user._id }).sort({ date: -1 }).limit(50);

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = {};

    transactions.forEach((tx) => {
      if (tx.type === 'income') totalIncome += tx.amount;
      else {
        totalExpense += tx.amount;
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      }
    });

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are an AI Spending Advisor assisting ${user.name}.
Financial context:
- Currency: ${user.currency || '₹'}
- Total Income: ${totalIncome}
- Total Expense: ${totalExpense}
- Balance: ${totalIncome - totalExpense}
- Expense Categories: ${JSON.stringify(categoryMap)}
- Budget: ${user.monthlyBudget || 'Not set'}

User question: "${message}"
Provide a helpful, friendly, and practical financial guidance response (around 2 to 4 paragraphs or bullet points).`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        return res.json({ reply: response.text });
      } catch (geminiError) {
        console.warn('Gemini chat error:', geminiError.message);
      }
    }

    // Built-in intelligent conversational responses
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('save') || lower.includes('saving')) {
      reply = `Based on your records, you have earned ${user.currency || '₹'}${totalIncome.toLocaleString()} and spent ${user.currency || '₹'}${totalExpense.toLocaleString()}, leaving a net balance of ${user.currency || '₹'}${(totalIncome - totalExpense).toLocaleString()}.\n\nTo increase your savings:\n1. Target discretionary categories such as Dining, Entertainment, and impulsive shopping.\n2. Apply the 50/30/20 rule: allocate 50% for essentials, 30% for lifestyle, and automate 20% into savings on payday.\n3. Establish an emergency fund covering at least 3 months of basic living expenses.`;
    } else if (lower.includes('budget') || lower.includes('limit')) {
      reply = user.monthlyBudget > 0
        ? `Your current monthly budget is ${user.currency || '₹'}${user.monthlyBudget.toLocaleString()}. You have spent ${user.currency || '₹'}${totalExpense.toLocaleString()} (${((totalExpense / user.monthlyBudget) * 100).toFixed(1)}% of your limit). ${totalExpense > user.monthlyBudget ? 'You are currently over budget; consider putting a temporary freeze on non-essential purchases.' : 'You are currently tracking within your budget limit!'}`
        : `You haven't set a monthly budget yet! Setting a budget helps prevent overspending. Navigate to your Profile or Budget settings to configure a monthly ceiling.`;
    } else if (lower.includes('category') || lower.includes('spend') || lower.includes('where')) {
      const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
      if (topCategories.length > 0) {
        reply = `Here is where most of your money goes:\n` + topCategories.slice(0, 4).map(([cat, amt]) => `• ${cat}: ${user.currency || '₹'}${amt.toLocaleString()}`).join('\n') + `\n\nFocusing on small adjustments in the top category can generate significant monthly savings!`;
      } else {
        reply = `You have not logged any expenses yet. Once you log your spending, I can tell you exactly which categories consume most of your budget.`;
      }
    } else {
      reply = `Hello ${user.name}! As your AI Spending Advisor, I analyze your income of ${user.currency || '₹'}${totalIncome.toLocaleString()} and total expenditures of ${user.currency || '₹'}${totalExpense.toLocaleString()}.\n\nYou can ask me:\n- "How can I save more money?"\n- "Am I sticking to my budget?"\n- "Where am I spending the most?"\n- "Give me tips for cutting food and entertainment expenses."`;
    }

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error processing AI chat' });
  }
});

module.exports = router;
