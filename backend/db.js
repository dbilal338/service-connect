const fs = require('fs');
const path = require('path');

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

module.exports = db;
