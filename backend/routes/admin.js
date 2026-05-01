const express = require('express');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');
const db = require('../db');

const router = express.Router();
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'KING12@i8';

// Accepts main admin token OR a team member session token
const adminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  if (token === ADMIN_PASSWORD) {
    req.adminRole = 'admin';
    return next();
  }

  const member = db.team_members.findOne(m => m.session_token === token);
  if (member) {
    req.adminRole = member.role;
    req.teamMember = member;
    return next();
  }

  res.status(401).json({ error: 'Unauthorized' });
};

const requireAdmin = (req, res, next) => {
  if (req.adminRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
};

const canManageUsers = (req, res, next) => {
  if (['admin', 'manager'].includes(req.adminRole)) return next();
  res.status(403).json({ error: 'Insufficient permissions' });
};

const canManageOrders = (req, res, next) => {
  if (['admin', 'manager', 'support'].includes(req.adminRole)) return next();
  res.status(403).json({ error: 'Insufficient permissions' });
};

const canManageProviders = (req, res, next) => {
  if (['admin', 'manager', 'moderator'].includes(req.adminRole)) return next();
  res.status(403).json({ error: 'Insufficient permissions' });
};

// Login (no auth required)
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.json({ role: 'admin', username: 'admin', token: ADMIN_PASSWORD });
  }

  const member = db.team_members.findOne(m => m.username === username);
  if (member && bcrypt.compareSync(password, member.password)) {
    const token = randomBytes(32).toString('hex');
    db.team_members.update(member.id, { session_token: token });
    return res.json({ role: member.role, username: member.username, token });
  }

  res.status(401).json({ error: 'Invalid username or password' });
});

// Users
router.get('/users', adminAuth, (req, res) => {
  const users = db.users.findAll().map(({ password, ...u }) => u);
  res.json(users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

router.put('/users/:id/role', adminAuth, canManageUsers, (req, res) => {
  const { role } = req.body;
  if (!['consumer', 'provider'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const updated = db.users.update(req.params.id, { role });
  if (!updated) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = updated;
  res.json(safe);
});

router.delete('/users/:id', adminAuth, canManageUsers, (req, res) => {
  const user = db.users.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  db.users.delete(req.params.id);
  const profile = db.profiles.findOne(p => p.user_id === Number(req.params.id));
  if (profile) db.profiles.delete(profile.id);
  res.json({ ok: true });
});

// Orders
router.get('/orders', adminAuth, (req, res) => {
  const orders = db.orders.findAll().map(o => {
    const consumer = db.users.findById(o.consumer_id);
    const provider = db.users.findById(o.provider_id);
    return { ...o, consumer_name: consumer?.name, provider_name: provider?.name };
  });
  res.json(orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

router.put('/orders/:id/status', adminAuth, canManageOrders, (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'quoted', 'accepted', 'in_progress', 'provider_done', 'confirmed', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const updated = db.orders.update(req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
});

// Providers
router.get('/providers', adminAuth, (req, res) => {
  const providers = db.users.findAll(u => u.role === 'provider').map(user => {
    const profile = db.profiles.findOne(p => p.user_id === user.id);
    if (!profile) return null;
    const { password, ...safeUser } = user;
    return { ...profile, ...safeUser, profile_id: profile.id };
  }).filter(Boolean);
  res.json(providers);
});

router.put('/providers/:userId/verify', adminAuth, canManageProviders, (req, res) => {
  const profile = db.profiles.findOne(p => p.user_id === Number(req.params.userId));
  if (!profile) return res.status(404).json({ error: 'Provider not found' });
  const updated = db.profiles.update(profile.id, { is_verified: Boolean(req.body.verified) });
  res.json(updated);
});

// Team management (admin only)
router.get('/team', adminAuth, requireAdmin, (req, res) => {
  const members = db.team_members.findAll().map(({ password, session_token, ...m }) => m);
  res.json(members.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

router.post('/team', adminAuth, requireAdmin, (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !['manager', 'support', 'moderator'].includes(role)) {
    return res.status(400).json({ error: 'username, password, and valid role are required' });
  }
  if (db.team_members.findOne(m => m.username === username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  const member = db.team_members.insert({ username, password: hashed, role, session_token: null });
  const { password: _, session_token: __, ...safe } = member;
  res.json(safe);
});

router.delete('/team/:id', adminAuth, requireAdmin, (req, res) => {
  const member = db.team_members.findById(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  db.team_members.delete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
