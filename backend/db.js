const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const FILES = {
  users: path.join(DATA_DIR, 'users.json'),
  profiles: path.join(DATA_DIR, 'profiles.json'),
  orders: path.join(DATA_DIR, 'orders.json'),
  reviews: path.join(DATA_DIR, 'reviews.json'),
};

const load = (file) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; }
};
const save = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

class Table {
  constructor(file) {
    this.file = file;
    this.data = load(file);
  }
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

  delete(id) {
    this.data = this.data.filter(r => r.id !== Number(id));
    this._save();
  }
}

const db = {
  users: new Table(FILES.users),
  profiles: new Table(FILES.profiles),
  orders: new Table(FILES.orders),
  reviews: new Table(FILES.reviews),
};

// Seed demo data
function seedData() {
  if (db.users.data.length > 0) return;

  const hash = bcrypt.hashSync('password123', 10);

  const providers = [
    { name: 'Mike Johnson', email: 'mike@demo.com', phone: '+1-555-0101', service: 'Electrician', rate: 75, exp: 8, loc: 'Downtown', desc: 'Licensed electrician with 8 years experience. Residential & commercial wiring, panel upgrades, EV charger installation.', rating: 4.8, reviews: 42 },
    { name: 'Sarah Williams', email: 'sarah@demo.com', phone: '+1-555-0102', service: 'Plumber', rate: 85, exp: 12, loc: 'Northside', desc: 'Master plumber specializing in repairs, installations, and emergency services. Available 7 days a week.', rating: 4.9, reviews: 87 },
    { name: 'Carlos Rivera', email: 'carlos@demo.com', phone: '+1-555-0103', service: 'Carpenter', rate: 65, exp: 15, loc: 'Westside', desc: 'Custom furniture, cabinets, flooring, and general carpentry. Quality craftsmanship guaranteed.', rating: 4.7, reviews: 31 },
    { name: 'David Chen', email: 'david@demo.com', phone: '+1-555-0104', service: 'Electrician', rate: 80, exp: 6, loc: 'Eastside', desc: 'Smart home installation, lighting design, electrical troubleshooting. Certified and insured.', rating: 4.6, reviews: 19 },
    { name: 'Emma Thompson', email: 'emma@demo.com', phone: '+1-555-0105', service: 'Painter', rate: 55, exp: 10, loc: 'Southside', desc: 'Interior and exterior painting, wallpaper removal, color consultation. Clean and professional work.', rating: 4.8, reviews: 56 },
    { name: 'James Wilson', email: 'james@demo.com', phone: '+1-555-0106', service: 'Plumber', rate: 90, exp: 20, loc: 'Downtown', desc: '20 years experience. Sewer line repair, water heater installation, bathroom remodels.', rating: 5.0, reviews: 103 },
    { name: 'Priya Patel', email: 'priya@demo.com', phone: '+1-555-0107', service: 'HVAC Technician', rate: 95, exp: 9, loc: 'Midtown', desc: 'AC/heating installation, maintenance, and repair. All major brands serviced.', rating: 4.5, reviews: 28 },
    { name: 'Tom Baker', email: 'tom@demo.com', phone: '+1-555-0108', service: 'Locksmith', rate: 60, exp: 5, loc: 'Northside', desc: 'Lock installation, rekeying, emergency lockout service. Available 24/7.', rating: 4.7, reviews: 15 },
    { name: 'Lisa Garcia', email: 'lisa@demo.com', phone: '+1-555-0109', service: 'Cleaner', rate: 45, exp: 7, loc: 'Downtown', desc: 'Deep cleaning, move-in/out cleaning, regular maintenance. Eco-friendly products.', rating: 4.9, reviews: 67 },
    { name: 'Ahmed Hassan', email: 'ahmed@demo.com', phone: '+1-555-0110', service: 'Gardener', rate: 40, exp: 11, loc: 'Westside', desc: 'Lawn care, landscaping, tree trimming, garden design. Seasonal packages available.', rating: 4.4, reviews: 44 },
  ];

  providers.forEach(p => {
    const user = db.users.insert({ name: p.name, email: p.email, password: hash, phone: p.phone, role: 'provider' });
    db.profiles.insert({ user_id: user.id, service_type: p.service, hourly_rate: p.rate, description: p.desc, years_experience: p.exp, location: p.loc, rating: p.rating, total_reviews: p.reviews, is_available: true });
  });

  db.users.insert({ name: 'Alex Consumer', email: 'alex@demo.com', password: hash, phone: '+1-555-9999', role: 'consumer' });
}

seedData();
module.exports = db;
