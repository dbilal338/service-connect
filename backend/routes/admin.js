const express = require('express');
const db = require('../db');

const router = express.Router();
const ADMIN_TOKEN = 'KING12@i8';

const adminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

router.get('/users', adminAuth, (req, res) => {
  const users = db.users.findAll().map(({ password, ...u }) => u);
  res.json(users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

router.get('/orders', adminAuth, (req, res) => {
  const orders = db.orders.findAll().map(o => {
    const consumer = db.users.findById(o.consumer_id);
    const provider = db.users.findById(o.provider_id);
    return { ...o, consumer_name: consumer?.name, provider_name: provider?.name };
  });
  res.json(orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

router.get('/providers', adminAuth, (req, res) => {
  const providers = db.users.findAll(u => u.role === 'provider').map(user => {
    const profile = db.profiles.findOne(p => p.user_id === user.id);
    if (!profile) return null;
    const { password, ...safeUser } = user;
    return { ...profile, ...safeUser, profile_id: profile.id };
  }).filter(Boolean);
  res.json(providers);
});

router.put('/providers/:userId/verify', adminAuth, (req, res) => {
  const profile = db.profiles.findOne(p => p.user_id === Number(req.params.userId));
  if (!profile) return res.status(404).json({ error: 'Provider not found' });
  const updated = db.profiles.update(profile.id, { is_verified: Boolean(req.body.verified) });
  res.json(updated);
});

module.exports = router;
