const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const enrichProvider = (user) => {
  const profile = db.profiles.findOne(p => p.user_id === user.id);
  if (!profile) return null;
  const { password, phone, ...safeUser } = user;
  // spread safeUser last so id = user.id (needed for /providers/:id and chat)
  return { ...profile, ...safeUser, profile_id: profile.id };
};

router.get('/dashboard/stats', authMiddleware, (req, res) => {
  if (req.user.role !== 'provider') return res.status(403).json({ error: 'Not a provider' });

  const myOrders = db.orders.findAll(o => o.provider_id === req.user.id);
  const stats = {
    total_orders: myOrders.length,
    completed_orders: myOrders.filter(o => o.status === 'confirmed').length,
    active_orders: myOrders.filter(o => ['pending','quoted','accepted','in_progress','provider_done'].includes(o.status)).length,
    total_earned: myOrders.filter(o => o.status === 'confirmed').reduce((s, o) => s + (o.final_price || 0), 0),
  };

  const activeOrder = myOrders.find(o => ['accepted','in_progress','provider_done'].includes(o.status));
  let enrichedActive = null;
  if (activeOrder) {
    const consumer = db.users.findById(activeOrder.consumer_id);
    enrichedActive = { ...activeOrder, consumer_name: consumer?.name };
  }

  res.json({ stats, activeOrder: enrichedActive });
});

router.get('/', (req, res) => {
  const { service_type, max_rate } = req.query;
  let providers = db.users.findAll(u => u.role === 'provider').map(enrichProvider).filter(Boolean);
  if (service_type) providers = providers.filter(p => p.service_type === service_type);
  if (max_rate) providers = providers.filter(p => p.hourly_rate <= Number(max_rate));
  providers.sort((a, b) => b.rating - a.rating || b.total_reviews - a.total_reviews);
  res.json(providers);
});

router.get('/:id', (req, res) => {
  const user = db.users.findById(req.params.id);
  if (!user || user.role !== 'provider') return res.status(404).json({ error: 'Provider not found' });
  const provider = enrichProvider(user);
  if (!provider) return res.status(404).json({ error: 'Provider not found' });

  const reviews = db.reviews.findAll(r => r.provider_id === Number(req.params.id))
    .slice(-10).reverse()
    .map(r => {
      const consumer = db.users.findById(r.consumer_id);
      return { ...r, consumer_name: consumer?.name };
    });

  res.json({ ...provider, reviews });
});

router.put('/profile', authMiddleware, (req, res) => {
  if (req.user.role !== 'provider') return res.status(403).json({ error: 'Not a provider' });
  const profile = db.profiles.findOne(p => p.user_id === req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const { hourly_rate, description, years_experience, location, is_available, service_type } = req.body;
  const updates = {};
  if (hourly_rate !== undefined) updates.hourly_rate = Number(hourly_rate);
  if (description !== undefined) updates.description = description;
  if (years_experience !== undefined) updates.years_experience = Number(years_experience);
  if (location !== undefined) updates.location = location;
  if (is_available !== undefined) updates.is_available = is_available;
  if (service_type !== undefined) updates.service_type = service_type;

  const updated = db.profiles.update(profile.id, updates);
  res.json(updated);
});

module.exports = router;
