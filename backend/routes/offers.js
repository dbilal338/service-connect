const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { category } = req.query;
  let offers = db.offers.findAll(o => o.is_active);
  if (category) offers = offers.filter(o => o.category === category);

  const enriched = offers.map(o => {
    const user = db.users.findById(o.provider_id);
    const profile = db.profiles.findOne(p => p.user_id === o.provider_id);
    return {
      ...o,
      provider_name: user?.name,
      provider_rating: profile?.rating,
      provider_location: profile?.location,
      provider_reviews: profile?.total_reviews,
    };
  });

  res.json(enriched);
});

router.get('/my', auth, (req, res) => {
  if (req.user.role !== 'provider') return res.status(403).json({ error: 'Not a provider' });
  res.json(db.offers.findAll(o => o.provider_id === req.user.id));
});

router.post('/', auth, (req, res) => {
  if (req.user.role !== 'provider') return res.status(403).json({ error: 'Not a provider' });
  const { title, description, price, category } = req.body;
  if (!title || !price || !category) return res.status(400).json({ error: 'title, price, category required' });

  const offer = db.offers.insert({
    provider_id: req.user.id,
    title: title.trim(),
    description: (description || '').trim(),
    price: Number(price),
    category,
    is_active: true,
  });
  res.json(offer);
});

router.put('/:id', auth, (req, res) => {
  const offer = db.offers.findById(req.params.id);
  if (!offer) return res.status(404).json({ error: 'Not found' });
  if (offer.provider_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { title, description, price, is_active } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description.trim();
  if (price !== undefined) updates.price = Number(price);
  if (is_active !== undefined) updates.is_active = is_active;

  res.json(db.offers.update(offer.id, updates));
});

router.delete('/:id', auth, (req, res) => {
  const offer = db.offers.findById(req.params.id);
  if (!offer) return res.status(404).json({ error: 'Not found' });
  if (offer.provider_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  db.offers.delete(offer.id);
  res.json({ success: true });
});

router.post('/:id/book', auth, (req, res) => {
  if (req.user.role !== 'consumer') return res.status(403).json({ error: 'Consumers only' });
  const offer = db.offers.findById(req.params.id);
  if (!offer || !offer.is_active) return res.status(404).json({ error: 'Offer not found' });

  const { address, scheduled_date } = req.body;
  if (!address) return res.status(400).json({ error: 'address required' });

  const order = db.orders.insert({
    consumer_id: req.user.id,
    provider_id: offer.provider_id,
    description: offer.title,
    address,
    scheduled_date: scheduled_date || null,
    status: 'accepted',
    quoted_price: offer.price,
    final_price: null,
    payment_status: 'pending',
    consumer_confirmed: false,
    offer_id: offer.id,
  });

  res.json(order);
});

module.exports = router;
