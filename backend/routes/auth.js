const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'service_connect_secret_2024';

router.post('/register', (req, res) => {
  const { name, email, password, phone, role, service_type, hourly_rate, description, years_experience, location } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing required fields' });

  const existing = db.users.findOne(u => u.email === email);
  if (existing) return res.status(400).json({ error: 'Email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const user = db.users.insert({ name, email, password: hash, phone: phone || null, role });

  if (role === 'provider') {
    db.profiles.insert({ user_id: user.id, service_type: service_type || 'General', hourly_rate: Number(hourly_rate) || 0, description: description || '', years_experience: Number(years_experience) || 0, location: location || '', rating: 0, total_reviews: 0, is_available: true });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.findOne(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

router.post('/google', (req, res) => {
  const { email, name, firebase_uid } = req.body;
  if (!email || !firebase_uid) return res.status(400).json({ error: 'Missing required fields' });

  let user = db.users.findOne(u => u.firebase_uid === firebase_uid || u.email === email);

  if (!user) {
    user = db.users.insert({ name: name || email.split('@')[0], email, firebase_uid, password: null, phone: null, role: 'consumer' });
  } else if (!user.firebase_uid) {
    user = db.users.update(user.id, { firebase_uid });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.users.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safeUser } = user;
  const profile = user.role === 'provider' ? db.profiles.findOne(p => p.user_id === user.id) : null;
  res.json({ ...safeUser, profile });
});

module.exports = router;
