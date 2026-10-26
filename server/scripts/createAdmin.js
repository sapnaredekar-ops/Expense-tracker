#!/usr/bin/env node
/**
 * One-time CLI Setup Script to safely create or promote the first Administrator account.
 * Usage:
 *   node server/scripts/createAdmin.js
 * Or with environment variables / CLI arguments:
 *   node server/scripts/createAdmin.js --name "Super Admin" --email admin@finai.com --password "SecureAdmin123!"
 */

const readline = require('readline');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense_tracker';

function askQuestion(query, hidden = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) parsed.name = args[++i];
    if (args[i] === '--email' && args[i + 1]) parsed.email = args[++i];
    if (args[i] === '--password' && args[i + 1]) parsed.password = args[++i];
  }
  return parsed;
}

async function run() {
  console.log('\n======================================================');
  console.log('       FinAI Tracker - Initial Admin Setup CLI         ');
  console.log('======================================================\n');

  const cliArgs = parseCliArgs();

  let name = cliArgs.name || process.env.INITIAL_ADMIN_NAME;
  let email = cliArgs.email || process.env.INITIAL_ADMIN_EMAIL;
  let password = cliArgs.password || process.env.INITIAL_ADMIN_PASSWORD;

  if (!email || !password) {
    if (!name) name = await askQuestion('Enter Administrator Full Name [Administrator]: ');
    if (!name) name = 'Administrator';

    if (!email) email = await askQuestion('Enter Administrator Email Address: ');
    if (!password) password = await askQuestion('Enter Secure Password (min 8 characters): ');
  }

  if (!email || !password) {
    console.error('❌ Error: Email and password are required.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long for administrative security.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Connected to MongoDB successfully.');

    // Check if user already exists
    let existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`ℹ️ User ${email} is already an Administrator.`);
        // Allow password update if requested
        existingUser.password = password;
        existingUser.isActive = true;
        await existingUser.save();
        console.log(`🔑 Administrator password was refreshed successfully.`);
      } else {
        existingUser.role = 'admin';
        existingUser.password = password;
        existingUser.isActive = true;
        await existingUser.save();
        console.log(`🛡️ Existing user ${email} was promoted to Administrator role.`);
      }

      await AuditLog.create({
        action: 'ADMIN_PROVISIONED',
        adminId: existingUser._id,
        adminEmail: existingUser.email,
        details: 'Admin account provisioned or updated via secure CLI tool',
        ipAddress: '127.0.0.1 (CLI)',
      });
    } else {
      const newAdmin = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: 'admin',
        isActive: true,
      });

      await AuditLog.create({
        action: 'ADMIN_PROVISIONED',
        adminId: newAdmin._id,
        adminEmail: newAdmin.email,
        details: 'Initial administrator account created via CLI tool',
        ipAddress: '127.0.0.1 (CLI)',
      });

      console.log(`\n✅ Administrator created successfully!`);
      console.log(`   Name:  ${newAdmin.name}`);
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Role:  ${newAdmin.role}`);
    }

    console.log('\n======================================================');
    console.log('🎉 Admin setup completed.');
    console.log('You can now log in at the Admin Portal.');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to provision administrator:', err.message);
    process.exit(1);
  }
}

run();
