const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const FILES = {
  users:         path.join(DATA_DIR, 'users.json'),
  profiles:      path.join(DATA_DIR, 'profiles.json'),
  orders:        path.join(DATA_DIR, 'orders.json'),
  reviews:       path.join(DATA_DIR, 'reviews.json'),
  conversations: path.join(DATA_DIR, 'conversations.json'),
  messages:      path.join(DATA_DIR, 'messages.json'),
  offers:        path.join(DATA_DIR, 'offers.json'),
  team_members:  path.join(DATA_DIR, 'team_members.json'),
};

const load = (file) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; } };
const save = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

class Table {
  constructor(file) { this.file = file; this.data = load(file); }
  _save() { save(this.file, this.data); }
  nextId() { return this.data.length === 0 ? 1 : Math.max(...this.data.map(r => r.id)) + 1; }
  insert(record) {
    const row = { id: this.nextId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...record };
    this.data.push(row);
    this._save();
    return row;
  }
  findAll(predicate) { return predicate ? this.data.filter(predicate) : [...this.data]; }
  findOne(predicate) { return this.data.find(predicate) || null; }
  findById(id) { return this.data.find(r => r.id === Number(id)) || null; }
  update(id, updates) {
    const idx = this.data.findIndex(r => r.id === Number(id));
    if (idx === -1) return null;
    this.data[idx] = { ...this.data[idx], ...updates, updated_at: new Date().toISOString() };
    this._save();
    return this.data[idx];
  }
  delete(id) { this.data = this.data.filter(r => r.id !== Number(id)); this._save(); }
}

const db = {
  users:         new Table(FILES.users),
  profiles:      new Table(FILES.profiles),
  orders:        new Table(FILES.orders),
  reviews:       new Table(FILES.reviews),
  conversations: new Table(FILES.conversations),
  messages:      new Table(FILES.messages),
  offers:        new Table(FILES.offers),
  team_members:  new Table(FILES.team_members),
};

function seedData() {
  if (db.users.data.length > 0) return;

  const hash = bcrypt.hashSync('password123', 10);

  const providers = [
    { name: 'Muhammad Ali', email: 'ali@demo.com', phone: '0300-1234501', service: 'bijli_mistri', rate: 800, exp: 8, loc: 'Karachi', desc: 'All electrical work — wiring, meter installation, switchboards. 8 years experience. Residential and commercial electrical work.', rating: 4.8, reviews: 42 },
    { name: 'Abdul Rahman', email: 'rahman@demo.com', phone: '0300-1234502', service: 'plumber', rate: 600, exp: 12, loc: 'Lahore', desc: 'Pipe fitting, leak repair, taps, water tank installation. All residential and commercial plumbing. Fast service available.', rating: 4.9, reviews: 87 },
    { name: 'Shahid Mehmood', email: 'shahid@demo.com', phone: '0300-1234503', service: 'carpenter', rate: 1200, exp: 15, loc: 'Islamabad', desc: 'Furniture, wardrobes, doors, windows. High-quality woodwork. Home and office furniture.', rating: 4.7, reviews: 31 },
    { name: 'Farhan Khan', email: 'farhan@demo.com', phone: '0300-1234504', service: 'painter', rate: 500, exp: 10, loc: 'Rawalpindi', desc: 'Home, office, and shop painting. Interior and exterior work. Premium quality paints used.', rating: 4.6, reviews: 19 },
    { name: 'Imran Sheikh', email: 'imran@demo.com', phone: '0300-1234505', service: 'ac_mechanic', rate: 1500, exp: 9, loc: 'Karachi', desc: 'AC servicing, repair, and installation. All brands. Gas charging, compressor replacement, filter cleaning.', rating: 4.5, reviews: 56 },
    { name: 'Zubair Ahmed', email: 'zubair@demo.com', phone: '0300-1234506', service: 'gardener', rate: 400, exp: 11, loc: 'Lahore', desc: 'Garden maintenance, planting, lawn mowing, tree trimming. Residential and commercial gardening.', rating: 4.4, reviews: 44 },
    { name: 'Nasir Hussain', email: 'nasir@demo.com', phone: '0300-1234507', service: 'cleaner', rate: 350, exp: 7, loc: 'Islamabad', desc: 'Home cleaning, office cleaning, deep cleaning. Professional and trustworthy. Brings own equipment.', rating: 4.9, reviews: 67 },
    { name: 'Tariq Mahmood', email: 'tariq@demo.com', phone: '0300-1234508', service: 'driver', rate: 700, exp: 5, loc: 'Karachi', desc: 'Personal driver, office drop, airport transfer. Courteous and skilled. Own vehicle not included.', rating: 4.7, reviews: 15 },
    { name: 'Khalid Anwar', email: 'khalid@demo.com', phone: '0300-1234509', service: 'cook', rate: 900, exp: 14, loc: 'Lahore', desc: 'Pakistani, Mughlai, and Chinese cuisine. Party catering, home cooking. All types of dishes prepared.', rating: 4.8, reviews: 38 },
    { name: 'Asif Ali', email: 'asif@demo.com', phone: '0300-1234510', service: 'tutor', rate: 500, exp: 6, loc: 'Rawalpindi', desc: 'Maths, Science, English, Computer. Matric to graduation level. Home visits available.', rating: 4.6, reviews: 29 },
  ];

  providers.forEach(p => {
    const user = db.users.insert({ name: p.name, email: p.email, password: hash, phone: p.phone, role: 'provider' });
    db.profiles.insert({ user_id: user.id, service_type: p.service, hourly_rate: p.rate, description: p.desc, years_experience: p.exp, location: p.loc, rating: p.rating, total_reviews: p.reviews, is_available: true });
  });

  db.users.insert({ name: 'Ahmed Consumer', email: 'ahmed@demo.com', password: hash, phone: '0321-9999999', role: 'consumer' });

  // Seed some demo offers
  const provUsers = db.users.findAll(u => u.role === 'provider');
  const offerData = [
    { idx: 0, title: 'Ceiling Fan Installation', desc: 'Install a ceiling fan including wiring and fitting', price: 500, cat: 'bijli_mistri' },
    { idx: 0, title: 'Switchboard Replacement', desc: 'Replace old switchboard with new one', price: 800, cat: 'bijli_mistri' },
    { idx: 1, title: 'Tap Replacement', desc: 'Replace a household water tap', price: 400, cat: 'plumber' },
    { idx: 1, title: 'Pipe Leak Repair', desc: 'Fix a leaking water pipe', price: 600, cat: 'plumber' },
    { idx: 4, title: 'AC Full Service', desc: 'Complete servicing of a 1-ton AC unit', price: 1500, cat: 'ac_mechanic' },
    { idx: 4, title: 'AC Gas Refill', desc: 'Recharge AC refrigerant gas', price: 2500, cat: 'ac_mechanic' },
    { idx: 2, title: 'Wardrobe Repair', desc: 'Fix a wooden wardrobe', price: 800, cat: 'carpenter' },
    { idx: 3, title: 'One Room Painting', desc: 'Full paint job for one room', price: 3500, cat: 'painter' },
  ];

  offerData.forEach(o => {
    if (provUsers[o.idx]) {
      db.offers.insert({ provider_id: provUsers[o.idx].id, title: o.title, description: o.desc, price: o.price, category: o.cat, is_active: true });
    }
  });
}

seedData();
module.exports = db;
