const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/providers', require('./routes/providers'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/chat',      require('./routes/chat'));
app.use('/api/offers',    require('./routes/offers'));
app.use('/api/admin',     require('./routes/admin'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const distPath = path.join(__dirname, '../frontend/dist');

app.use(express.static(distPath, {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  },
}));

// SPA fallback — always send fresh HTML
app.get('*', (_, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
