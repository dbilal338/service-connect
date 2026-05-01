const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const enrichOrder = (order, role) => {
  const consumer = db.users.findById(order.consumer_id);
  const provider = db.users.findById(order.provider_id);
  const profile = db.profiles.findOne(p => p.user_id === order.provider_id);
  return {
    ...order,
    consumer_name: consumer?.name,
    provider_name: provider?.name,
    service_type: profile?.service_type,
    hourly_rate: profile?.hourly_rate,
  };
};

router.post('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'consumer') return res.status(403).json({ error: 'Only consumers can place orders' });
  const { provider_id, description, address, scheduled_date } = req.body;
  if (!provider_id || !description || !address) return res.status(400).json({ error: 'Missing fields' });

  const provider = db.users.findById(provider_id);
  if (!provider || provider.role !== 'provider') return res.status(404).json({ error: 'Provider not found' });

  const order = db.orders.insert({ consumer_id: req.user.id, provider_id: Number(provider_id), description, address, scheduled_date: scheduled_date || null, status: 'pending', quoted_price: null, final_price: null, payment_status: 'unpaid', consumer_confirmed: false });
  res.json(order);
});

router.get('/', authMiddleware, (req, res) => {
  let orders;
  if (req.user.role === 'consumer') {
    orders = db.orders.findAll(o => o.consumer_id === req.user.id);
  } else {
    orders = db.orders.findAll(o => o.provider_id === req.user.id);
  }
  orders = orders.map(o => enrichOrder(o)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(orders);
});

router.get('/:id', authMiddleware, (req, res) => {
  const order = db.orders.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.consumer_id !== req.user.id && order.provider_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
  res.json(enrichOrder(order));
});

router.put('/:id/quote', authMiddleware, (req, res) => {
  if (req.user.role !== 'provider') return res.status(403).json({ error: 'Only providers can quote' });
  const order = db.orders.findById(req.params.id);
  if (!order || order.provider_id !== req.user.id) return res.status(403).json({ error: 'Not your order' });
  if (order.status !== 'pending') return res.status(400).json({ error: 'Can only quote pending orders' });
  const { quoted_price } = req.body;
  if (!quoted_price) return res.status(400).json({ error: 'Price required' });
  const updated = db.orders.update(order.id, { status: 'quoted', quoted_price: Number(quoted_price) });
  res.json(enrichOrder(updated));
});

router.put('/:id/accept', authMiddleware, (req, res) => {
  if (req.user.role !== 'consumer') return res.status(403).json({ error: 'Only consumers can accept' });
  const order = db.orders.findById(req.params.id);
  if (!order || order.consumer_id !== req.user.id) return res.status(403).json({ error: 'Not your order' });
  if (order.status !== 'quoted') return res.status(400).json({ error: 'Order must be quoted first' });
  const updated = db.orders.update(order.id, { status: 'accepted', payment_status: 'paid' });
  res.json(enrichOrder(updated));
});

router.put('/:id/start', authMiddleware, (req, res) => {
  if (req.user.role !== 'provider') return res.status(403).json({ error: 'Only providers can start' });
  const order = db.orders.findById(req.params.id);
  if (!order || order.provider_id !== req.user.id) return res.status(403).json({ error: 'Not your order' });
  if (order.status !== 'accepted') return res.status(400).json({ error: 'Order must be accepted first' });

  const activeOrder = db.orders.findOne(o => o.provider_id === req.user.id && o.status === 'in_progress' && o.id !== order.id);
  if (activeOrder) return res.status(400).json({ error: 'You must complete your current active order first' });

  const updated = db.orders.update(order.id, { status: 'in_progress' });
  res.json(enrichOrder(updated));
});

router.put('/:id/done', authMiddleware, (req, res) => {
  if (req.user.role !== 'provider') return res.status(403).json({ error: 'Only providers can mark done' });
  const order = db.orders.findById(req.params.id);
  if (!order || order.provider_id !== req.user.id) return res.status(403).json({ error: 'Not your order' });
  if (order.status !== 'in_progress') return res.status(400).json({ error: 'Order must be in progress' });
  const { final_price } = req.body;
  const updated = db.orders.update(order.id, { status: 'provider_done', final_price: Number(final_price) || order.quoted_price });
  res.json(enrichOrder(updated));
});

router.put('/:id/confirm', authMiddleware, (req, res) => {
  if (req.user.role !== 'consumer') return res.status(403).json({ error: 'Only consumers can confirm' });
  const order = db.orders.findById(req.params.id);
  if (!order || order.consumer_id !== req.user.id) return res.status(403).json({ error: 'Not your order' });
  if (order.status !== 'provider_done') return res.status(400).json({ error: 'Provider must mark work done first' });
  const updated = db.orders.update(order.id, { status: 'confirmed', consumer_confirmed: true });
  res.json(enrichOrder(updated));
});

router.put('/:id/cancel', authMiddleware, (req, res) => {
  const order = db.orders.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.consumer_id !== req.user.id && order.provider_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
  if (['confirmed', 'cancelled'].includes(order.status)) return res.status(400).json({ error: 'Cannot cancel this order' });
  const updated = db.orders.update(order.id, { status: 'cancelled' });
  res.json(enrichOrder(updated));
});

router.post('/:id/review', authMiddleware, (req, res) => {
  if (req.user.role !== 'consumer') return res.status(403).json({ error: 'Only consumers can review' });
  const order = db.orders.findById(req.params.id);
  if (!order || order.consumer_id !== req.user.id) return res.status(403).json({ error: 'Not your order' });
  if (order.status !== 'confirmed') return res.status(400).json({ error: 'Can only review completed orders' });

  const existing = db.reviews.findOne(r => r.order_id === order.id);
  if (existing) return res.status(400).json({ error: 'Already reviewed' });

  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating 1-5 required' });

  db.reviews.insert({ order_id: order.id, consumer_id: req.user.id, provider_id: order.provider_id, rating: Number(rating), comment: comment || '' });

  const providerReviews = db.reviews.findAll(r => r.provider_id === order.provider_id);
  const avg = providerReviews.reduce((s, r) => s + r.rating, 0) / providerReviews.length;
  const profile = db.profiles.findOne(p => p.user_id === order.provider_id);
  if (profile) db.profiles.update(profile.id, { rating: Math.round(avg * 10) / 10, total_reviews: providerReviews.length });

  res.json({ success: true });
});

module.exports = router;
