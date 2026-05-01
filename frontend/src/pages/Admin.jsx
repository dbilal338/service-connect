import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { formatPKR } from '../constants';

const ORDER_STATUSES = ['pending', 'quoted', 'accepted', 'in_progress', 'provider_done', 'confirmed', 'cancelled'];

const STATUS_COLORS = {
  pending: 'badge-amber', quoted: 'badge-blue', accepted: 'badge-purple',
  in_progress: 'badge-orange', provider_done: 'badge-purple', confirmed: 'badge-green', cancelled: 'badge-red',
};

const ROLE_PERMS = {
  admin:     { manageUsers: true,  manageOrders: true,  manageProviders: true,  manageTeam: true  },
  manager:   { manageUsers: true,  manageOrders: true,  manageProviders: true,  manageTeam: false },
  support:   { manageUsers: false, manageOrders: true,  manageProviders: false, manageTeam: false },
  moderator: { manageUsers: false, manageOrders: false, manageProviders: true,  manageTeam: false },
};

const ROLE_BADGE = {
  admin: 'bg-red-100 text-red-700', manager: 'bg-purple-100 text-purple-700',
  support: 'bg-blue-100 text-blue-700', moderator: 'bg-amber-100 text-amber-700',
};

const ROLE_DESC = {
  manager:   'Full access · except team management',
  support:   'View all · change order status',
  moderator: 'View all · verify/unverify providers',
};

export default function Admin() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('admin_session')); } catch { return null; }
  });
  const [tab, setTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [providers, setProviders] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const h = { 'x-admin-token': session.token };
      const reqs = [
        axios.get('/api/admin/users',     { headers: h }),
        axios.get('/api/admin/orders',    { headers: h }),
        axios.get('/api/admin/providers', { headers: h }),
      ];
      if (session.role === 'admin') reqs.push(axios.get('/api/admin/team', { headers: h }));
      const res = await Promise.all(reqs);
      setUsers(res[0].data);
      setOrders(res[1].data);
      setProviders(res[2].data);
      if (res[3]) setTeam(res[3].data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { if (session) loadData(); }, [session, loadData]);

  const logout = () => {
    sessionStorage.removeItem('admin_session');
    setSession(null);
    setTab('dashboard');
  };

  if (!session) {
    return <LoginScreen onLogin={s => {
      sessionStorage.setItem('admin_session', JSON.stringify(s));
      setSession(s);
    }} />;
  }

  const perms = ROLE_PERMS[session.role] || {};
  const revenue = orders
    .filter(o => o.status === 'confirmed' && o.final_price)
    .reduce((sum, o) => sum + Number(o.final_price), 0);

  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'users',     label: `Users (${users.length})` },
    { key: 'providers', label: `Providers (${providers.length})` },
    { key: 'orders',    label: `Orders (${orders.length})` },
    ...(session.role === 'admin' ? [{ key: 'team', label: 'Team' }] : []),
  ];

  return (
    <div className="fade-in pb-6">
      <div className="px-4 py-4" style={{ background: 'linear-gradient(160deg, #0f172a, #14532d)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-black text-lg">Admin Panel</h1>
            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
              {session.username}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${ROLE_BADGE[session.role]}`}>
                {session.role}
              </span>
            </p>
          </div>
          <button onClick={logout} className="text-xs text-slate-400 border border-slate-600 px-3 py-1.5 rounded-lg active:bg-slate-700 transition-colors">
            Logout
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Total Users"      value={users.length}       color="text-blue-400" />
          <StatCard label="Total Orders"     value={orders.length}      color="text-amber-400" />
          <StatCard label="Total Providers"  value={providers.length}   color="text-green-400" />
          <StatCard label="Total Revenue"    value={formatPKR(revenue)} color="text-purple-400" />
        </div>
      </div>

      <div className="flex border-b border-slate-200 bg-white sticky top-[52px] z-10 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-shrink-0 py-3 px-3 text-xs font-bold transition-colors whitespace-nowrap ${
              tab === key ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-4 py-4">
          {tab === 'dashboard' && <DashboardTab orders={orders} users={users} providers={providers} revenue={revenue} />}
          {tab === 'users'     && <UsersTab users={users} perms={perms} token={session.token} onRefresh={loadData} />}
          {tab === 'providers' && <ProvidersTab providers={providers} perms={perms} token={session.token} onRefresh={loadData} />}
          {tab === 'orders'    && <OrdersTab orders={orders} perms={perms} token={session.token} onRefresh={loadData} />}
          {tab === 'team' && session.role === 'admin' && <TeamTab team={team} token={session.token} onRefresh={loadData} />}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white/10 rounded-xl p-3">
      <p className={`font-black text-xl leading-tight ${color}`}>{value}</p>
      <p className="text-slate-400 text-[11px] mt-0.5">{label}</p>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/admin/login', { username, password });
      onLogin(data);
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in flex items-center justify-center min-h-[70vh] px-4">
      <div className="card w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg, #0f172a, #14532d)' }}>
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="font-black text-xl text-slate-900">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Karigarr Management</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input type="text" required value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              className="input" placeholder="Enter username" autoFocus />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              className="input" placeholder="Enter password" />
          </div>
          <button type="submit" disabled={loading} className="btn-dark">
            {loading ? 'Signing in…' : 'Access Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}

function DashboardTab({ orders, users, providers, revenue }) {
  const summary = [
    ['Consumers',          users.filter(u => u.role === 'consumer').length,       'text-blue-600'],
    ['Total Providers',    providers.length,                                        'text-green-600'],
    ['Verified Providers', providers.filter(p => p.is_verified).length,            'text-green-600'],
    ['Available Providers',providers.filter(p => p.is_available).length,           'text-green-600'],
    ['Completed Orders',   orders.filter(o => o.status === 'confirmed').length,     'text-purple-600'],
    ['Cancelled Orders',   orders.filter(o => o.status === 'cancelled').length,     'text-red-500'],
    ['Total Revenue',      formatPKR(revenue),                                      'text-purple-600'],
  ];

  return (
    <div className="space-y-4">
      <div className="card divide-y divide-slate-50">
        <h2 className="font-bold text-slate-800 text-sm pb-2">Platform Summary</h2>
        {summary.map(([label, val, color]) => (
          <div key={label} className="flex justify-between items-center py-2 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className={`font-black ${color}`}>{val}</span>
          </div>
        ))}
      </div>

      {orders.length > 0 && (
        <div>
          <h2 className="font-bold text-slate-800 text-sm mb-2">Recent Orders</h2>
          <div className="space-y-2">
            {orders.slice(0, 6).map(o => (
              <div key={o.id} className="card py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Order #{o.id}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{o.consumer_name} → {o.provider_name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(o.created_at).toLocaleDateString('en-PK')}
                      {o.final_price ? ` · ${formatPKR(o.final_price)}` : ''}
                    </p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[o.status] || 'badge-slate'} flex-shrink-0`}>
                    {o.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTab({ users, perms, token, onRefresh }) {
  const [busy, setBusy] = useState(null);

  const changeRole = async (u) => {
    setBusy(u.id + '-role');
    try {
      await axios.put(`/api/admin/users/${u.id}/role`,
        { role: u.role === 'consumer' ? 'provider' : 'consumer' },
        { headers: { 'x-admin-token': token } }
      );
      onRefresh();
    } catch {} finally { setBusy(null); }
  };

  const deleteUser = async (u) => {
    if (!window.confirm(`Delete "${u.name}"? This cannot be undone.`)) return;
    setBusy(u.id + '-del');
    try {
      await axios.delete(`/api/admin/users/${u.id}`, { headers: { 'x-admin-token': token } });
      onRefresh();
    } catch {} finally { setBusy(null); }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 font-semibold">{users.length} total users</p>
      {users.map(u => (
        <div key={u.id} className="card">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-slate-900 text-sm truncate">{u.name}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                  u.role === 'provider' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>{u.role}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{u.email}</p>
              <p className="text-[11px] text-slate-400">{u.phone} · {new Date(u.created_at).toLocaleDateString('en-PK')}</p>
            </div>
            {perms.manageUsers && (
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button onClick={() => changeRole(u)} disabled={busy === u.id + '-role'}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 active:bg-slate-200 whitespace-nowrap">
                  {busy === u.id + '-role' ? '…' : u.role === 'consumer' ? '→ Provider' : '→ Consumer'}
                </button>
                <button onClick={() => deleteUser(u)} disabled={busy === u.id + '-del'}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-600 active:bg-red-100">
                  {busy === u.id + '-del' ? '…' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProvidersTab({ providers, perms, token, onRefresh }) {
  const [busy, setBusy] = useState(null);

  const toggleVerify = async (p) => {
    setBusy(p.id);
    try {
      await axios.put(`/api/admin/providers/${p.id}/verify`,
        { verified: !p.is_verified },
        { headers: { 'x-admin-token': token } }
      );
      onRefresh();
    } catch {} finally { setBusy(null); }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 font-semibold">{providers.length} providers registered</p>
      {providers.map(p => (
        <div key={p.id} className="card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                {p.is_verified && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">✓ Verified</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{p.email} · {p.phone}</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {p.service_type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} · {p.location} · {formatPKR(p.hourly_rate)}/visit
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[11px] text-slate-400">⭐ {(p.rating || 0).toFixed(1)} ({p.total_reviews} reviews)</span>
                <span className={`text-[11px] font-semibold ${p.is_available ? 'text-green-600' : 'text-red-500'}`}>
                  ● {p.is_available ? 'Available' : 'Busy'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{p.years_experience} yrs exp</p>
            </div>
            {perms.manageProviders && (
              <button
                onClick={() => toggleVerify(p)}
                disabled={busy === p.id}
                className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                  p.is_verified
                    ? 'bg-red-50 text-red-600 active:bg-red-100'
                    : 'bg-green-50 text-green-700 active:bg-green-100'
                }`}
              >
                {busy === p.id ? '…' : p.is_verified ? 'Unverify' : 'Verify'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function OrdersTab({ orders, perms, token, onRefresh }) {
  const [busy, setBusy] = useState(null);

  const changeStatus = async (orderId, status) => {
    setBusy(orderId);
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, { status }, { headers: { 'x-admin-token': token } });
      onRefresh();
    } catch {} finally { setBusy(null); }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 font-semibold">{orders.length} total orders</p>
      {orders.map(o => (
        <div key={o.id} className="card">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="font-bold text-slate-900 text-sm">Order #{o.id}</p>
              <p className="text-xs text-slate-500 mt-0.5">{o.consumer_name} → {o.provider_name}</p>
            </div>
            <span className={`badge ${STATUS_COLORS[o.status] || 'badge-slate'} flex-shrink-0`}>
              {o.status?.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-600 line-clamp-2">{o.description}</p>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <span>📍 {o.address}</span>
            {o.final_price && <span className="font-semibold text-slate-700">{formatPKR(o.final_price)}</span>}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{new Date(o.created_at).toLocaleDateString('en-PK')}</p>
          {perms.manageOrders && (
            <select
              value={o.status}
              onChange={e => changeStatus(o.id, e.target.value)}
              disabled={busy === o.id}
              className="mt-2 w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 text-slate-700 font-medium"
            >
              {ORDER_STATUSES.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}

function TeamTab({ team, token, onRefresh }) {
  const [form, setForm] = useState({ username: '', password: '', role: 'support' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await axios.post('/api/admin/team', form, { headers: { 'x-admin-token': token } });
      setForm({ username: '', password: '', role: 'support' });
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team member');
    } finally { setCreating(false); }
  };

  const remove = async (m) => {
    if (!window.confirm(`Remove "${m.username}" from the team?`)) return;
    setDeleting(m.id);
    try {
      await axios.delete(`/api/admin/team/${m.id}`, { headers: { 'x-admin-token': token } });
      onRefresh();
    } catch {} finally { setDeleting(null); }
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="font-bold text-slate-900 text-sm mb-3">Add Team Member</h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2 mb-3 text-xs">{error}</div>
        )}
        <form onSubmit={create} className="space-y-3">
          <div>
            <label className="label">Username</label>
            <input type="text" required value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="input" placeholder="e.g. manager1" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="input" placeholder="Set a strong password" />
          </div>
          <div>
            <label className="label">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input">
              <option value="manager">Manager — full access except team mgmt</option>
              <option value="support">Support — view all, manage orders</option>
              <option value="moderator">Moderator — view all, verify providers</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-400">{ROLE_DESC[form.role]}</p>
          <button type="submit" disabled={creating} className="btn-dark">
            {creating ? 'Creating…' : 'Create Team Member'}
          </button>
        </form>
      </div>

      <div>
        <p className="text-xs text-slate-500 font-semibold mb-2">
          {team.length} team member{team.length !== 1 ? 's' : ''}
        </p>
        {team.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-6">No team members yet</p>
        ) : (
          <div className="space-y-2">
            {team.map(m => (
              <div key={m.id} className="card flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900 text-sm">{m.username}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${ROLE_BADGE[m.role]}`}>
                      {m.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{ROLE_DESC[m.role]}</p>
                  <p className="text-[11px] text-slate-400">{new Date(m.created_at).toLocaleDateString('en-PK')}</p>
                </div>
                <button
                  onClick={() => remove(m)}
                  disabled={deleting === m.id}
                  className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-600 active:bg-red-100"
                >
                  {deleting === m.id ? '…' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
