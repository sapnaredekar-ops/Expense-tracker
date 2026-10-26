/**
 * Comprehensive Automated Verification Test Suite
 * Tests all 10 security and functionality requirements in an isolated test database.
 */

const mongoose = require('mongoose');
const express = require('express');
const http = require('http');

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');

const authRoutes = require('../routes/auth');
const transactionRoutes = require('../routes/transactions');
const adminRoutes = require('../routes/admin');

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/expense_tracker_test_security';
let server;
let baseUrl;

async function fetchJson(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('  RUNNING VERIFICATION SUITE FOR FINAI ADMIN CONTROLS  ');
  console.log('======================================================\n');

  // Connect to isolated test database
  await mongoose.connect(TEST_DB_URI);
  console.log('🔌 Connected to isolated test DB: expense_tracker_test_security');
  await mongoose.connection.db.dropDatabase();

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/ai', require('../routes/ai'));
  app.use('/api/admin', adminRoutes);

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  const testResults = [];
  function record(title, passed, note = '') {
    testResults.push({ title, passed, note });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${title} ${note ? `(${note})` : ''}`);
  }

  try {
    // 1. Normal user can register and log in
    const regRes = await fetchJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Normal User',
        email: 'user@example.com',
        password: 'password123',
        currency: '₹',
        monthlyBudget: 25000,
      }),
    });
    const userRegistered = regRes.status === 201 && regRes.data.token && regRes.data.role === 'user';
    const userToken = regRes.data.token;
    const userId = regRes.data._id;

    const loginRes = await fetchJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', password: 'password123' }),
    });
    const userLoginSuccess = loginRes.status === 200 && loginRes.data.token;
    record('Requirement 1: Normal user can register and log in', userRegistered && userLoginSuccess);

    // 2. Normal user can manage only their own transactions
    const addTx1 = await fetchJson('/api/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        title: 'User Lunch',
        amount: 350,
        type: 'expense',
        category: 'Food & Dining',
      }),
    });
    const userTxId = addTx1.data?._id;

    // Create a second user to test cross-tenant isolation
    const regUser2 = await fetchJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'User Two',
        email: 'user2@example.com',
        password: 'password123',
      }),
    });
    const user2Token = regUser2.data.token;

    // User 2 adds transaction
    const addTx2 = await fetchJson('/api/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${user2Token}` },
      body: JSON.stringify({
        title: 'User Two Gadget',
        amount: 5000,
        type: 'expense',
        category: 'Electronics',
      }),
    });
    const user2TxId = addTx2.data?._id;

    // User 1 lists transactions - must NOT see User 2's transaction
    const user1List = await fetchJson('/api/transactions', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const onlyOwnTx = user1List.data.length === 1 && user1List.data[0]._id === userTxId;

    // User 1 attempts to update User 2's transaction - must be blocked (401/403)
    const unauthorizedUpdate = await fetchJson(`/api/transactions/${user2TxId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ title: 'Hacked Title' }),
    });
    const updateBlocked = unauthorizedUpdate.status === 401 || unauthorizedUpdate.status === 403;
    record('Requirement 2: Normal user can manage only their own transactions', onlyOwnTx && updateBlocked);

    // 3 & 4. Normal user cannot call administrator APIs directly
    const userAdminAttempt1 = await fetchJson('/api/admin/stats', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const userAdminAttempt2 = await fetchJson('/api/admin/users', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const normalUserBlocked = userAdminAttempt1.status === 403 && userAdminAttempt2.status === 403;
    record('Requirements 3 & 4: Normal user cannot call administrator APIs directly', normalUserBlocked, `Status ${userAdminAttempt1.status}`);

    // Create administrator via direct model (simulating CLI setup)
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@finai.com',
      password: 'AdminPassword123!',
      role: 'admin',
      isActive: true,
    });

    // 5. Administrator can access authorized admin features
    const adminLoginRes = await fetchJson('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@finai.com', password: 'AdminPassword123!' }),
    });
    const adminToken = adminLoginRes.data?.token;

    const adminStatsRes = await fetchJson('/api/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminUsersRes = await fetchJson('/api/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminAuditRes = await fetchJson('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminFeaturesAccess = adminStatsRes.status === 200 && adminUsersRes.status === 200 && adminAuditRes.status === 200;
    record('Requirement 5: Administrator can access authorized admin features', adminFeaturesAccess);

    // 6. Invalid credentials are rejected
    const badAdminLogin = await fetchJson('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@finai.com', password: 'WrongPassword' }),
    });
    const badUserLogin = await fetchJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', password: 'WrongPassword' }),
    });
    const invalidCredsRejected = badAdminLogin.status === 401 && badUserLogin.status === 401;
    record('Requirement 6: Invalid credentials are rejected', invalidCredsRejected);

    // 7. Tokens without administrator privileges are rejected by admin APIs
    const noAdminTokenRes = await fetchJson('/api/admin/system-health', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const unprivilegedRejected = noAdminTokenRes.status === 403;
    record('Requirement 7: Tokens without administrator privileges are rejected by admin APIs', unprivilegedRejected);

    // 8. Users cannot promote themselves to administrator
    // Test A: via registration payload injection
    const exploitReg = await fetchJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Attacker',
        email: 'attacker@example.com',
        password: 'password123',
        role: 'admin',
      }),
    });
    const regRoleSanitized = exploitReg.data?.role === 'user';

    // Test B: via profile update payload injection
    const exploitProfile = await fetchJson('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${exploitReg.data.token}` },
      body: JSON.stringify({ role: 'admin' }),
    });
    const profileRoleSanitized = exploitProfile.data?.role === 'user';

    // Verify in database directly
    const attackerInDb = await User.findById(exploitReg.data._id);
    const dbRoleSanitized = attackerInDb.role === 'user';
    record('Requirement 8: Users cannot promote themselves to administrator', regRoleSanitized && profileRoleSanitized && dbRoleSanitized);

    // 9. Existing financial data remains unchanged
    const originalTx = await Transaction.findById(userTxId);
    const financialDataIntact = originalTx && originalTx.amount === 350 && originalTx.title === 'User Lunch';
    record('Requirement 9: Existing financial data remains unchanged', financialDataIntact);

    // 10. Existing dashboard, analytics, and AI functionality continue working
    const userStats = await fetchJson('/api/transactions/stats/summary', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const aiInsights = await fetchJson('/api/ai/insights', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const dashboardAndAiWork = userStats.status === 200 && userStats.data.totalExpense === 350 && aiInsights.status === 200 && aiInsights.data.healthRating;
    record('Requirement 10: Existing dashboard, analytics, and AI functionality continue working', dashboardAndAiWork);

    // Extra Security Test: Deactivated User cannot call APIs
    const deactivateUser = await fetchJson(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ isActive: false }),
    });
    const deactivatedAttempt = await fetchJson('/api/transactions', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const deactivationEnforced = deactivateUser.status === 200 && deactivatedAttempt.status === 403;
    record('Extra Control: Account deactivation immediately revokes user API access', deactivationEnforced);

    // Extra Security Test: Admin cannot deactivate themselves (lockout protection)
    const selfDeactivateAttempt = await fetchJson(`/api/admin/users/${adminUser._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ isActive: false }),
    });
    const selfLockoutPrevented = selfDeactivateAttempt.status === 400;
    record('Extra Control: Administrator self-lockout prevention safeguard', selfLockoutPrevented);

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
    server.close();
  }

  const allPassed = testResults.every((r) => r.passed);
  console.log('\n======================================================');
  console.log(allPassed ? '🎉 ALL 10/10 CORE REQUIREMENTS + SAFEGUARDS PASSED' : '⚠️ SOME TESTS FAILED');
  console.log('======================================================\n');
}

runTests();
