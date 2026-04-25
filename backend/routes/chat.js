const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/conversations/start', auth, (req, res) => {
  const { other_user_id } = req.body;
  if (!other_user_id) return res.status(400).json({ error: 'other_user_id required' });

  const otherUser = db.users.findById(other_user_id);
  if (!otherUser) return res.status(404).json({ error: 'User not found' });

  let conv = db.conversations.findOne(c =>
    (c.participant1_id === req.user.id && c.participant2_id === Number(other_user_id)) ||
    (c.participant2_id === req.user.id && c.participant1_id === Number(other_user_id))
  );

  if (!conv) {
    conv = db.conversations.insert({ participant1_id: req.user.id, participant2_id: Number(other_user_id) });
  }

  const { password: _, ...safe } = otherUser;
  res.json({ ...conv, other_user: safe });
});

router.get('/conversations', auth, (req, res) => {
  const convs = db.conversations.findAll(c =>
    c.participant1_id === req.user.id || c.participant2_id === req.user.id
  );

  const enriched = convs.map(conv => {
    const otherId = conv.participant1_id === req.user.id ? conv.participant2_id : conv.participant1_id;
    const other = db.users.findById(otherId);
    const msgs = db.messages.findAll(m => m.conversation_id === conv.id);
    const lastMsg = msgs[msgs.length - 1] || null;
    const unread = msgs.filter(m => m.sender_id !== req.user.id && !m.is_read).length;
    const { password: _, ...safeOther } = other || {};
    return { ...conv, other_user: safeOther, last_message: lastMsg, unread_count: unread };
  }).sort((a, b) => {
    const at = a.last_message?.created_at || a.created_at;
    const bt = b.last_message?.created_at || b.created_at;
    return new Date(bt) - new Date(at);
  });

  res.json(enriched);
});

router.get('/conversations/:id/messages', auth, (req, res) => {
  const conv = db.conversations.findById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Not found' });
  if (conv.participant1_id !== req.user.id && conv.participant2_id !== req.user.id)
    return res.status(403).json({ error: 'Forbidden' });

  const msgs = db.messages.findAll(m => m.conversation_id === conv.id);
  msgs.forEach(m => {
    if (m.sender_id !== req.user.id && !m.is_read) db.messages.update(m.id, { is_read: true });
  });

  const otherId = conv.participant1_id === req.user.id ? conv.participant2_id : conv.participant1_id;
  const other = db.users.findById(otherId);
  const { password: _, ...safeOther } = other || {};

  res.json({
    conversation: { ...conv, other_user: safeOther },
    messages: db.messages.findAll(m => m.conversation_id === conv.id),
  });
});

router.post('/conversations/:id/messages', auth, (req, res) => {
  const conv = db.conversations.findById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Not found' });
  if (conv.participant1_id !== req.user.id && conv.participant2_id !== req.user.id)
    return res.status(403).json({ error: 'Forbidden' });

  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'text required' });

  const msg = db.messages.insert({ conversation_id: conv.id, sender_id: req.user.id, text: text.trim(), is_read: false });
  res.json(msg);
});

router.get('/unread-count', auth, (req, res) => {
  const convs = db.conversations.findAll(c =>
    c.participant1_id === req.user.id || c.participant2_id === req.user.id
  );
  let total = 0;
  convs.forEach(c => {
    total += db.messages.findAll(m => m.conversation_id === c.id && m.sender_id !== req.user.id && !m.is_read).length;
  });
  res.json({ count: total });
});

module.exports = router;
