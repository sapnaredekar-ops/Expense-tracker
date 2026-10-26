const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'ADMIN_LOGIN',
      'ADMIN_REGISTERED',
      'USER_ACTIVATED',
      'USER_DEACTIVATED',
      'USER_CREATED',
      'SETTINGS_UPDATED',
      'ADMIN_PROVISIONED',
    ],
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  adminEmail: {
    type: String,
    required: true,
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  targetUserEmail: {
    type: String,
    default: null,
  },
  details: {
    type: String,
    default: '',
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
