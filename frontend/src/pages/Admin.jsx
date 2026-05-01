import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { formatPKR } from '../constants';

const ADMIN_TOKEN = 'KING12@i8';
const SESSION_KEY = 'admin_auth';

const STATUS_COLORS = {
  pending: 'badge-amber', quoted: 'badge-blue', accepted: 'badge-purple',
  in_progress: 'badge-orange', provider_done: 'badge-purple', confirmed: 'badge-green', cancelled: 'badge-red',
};

function adminHeaders() {
  return { 'x-admin-token': ADMIN_TOKEN };
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [tab, setTab] = useState('providers');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [u, o, p] = await Promise.all([
        axios.get('/api/admin/users', { headers: adminHeaders() }),
        axios.get('/api/admin/orders', { headers: adminHeaders() }),
        axios.get('/api/admin/providers', { headers: adminHeaders() }),
      ]);
      setUsers(u.data);
      setOrders(o.data);
      setProviders(p.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pw === ADMIN_TOKEN) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
    } else {
      setPwError('Incorrect password');
    }
  };

  const toggleVerify = async (provider) => {
    try {
      const { data } = await axios.put(
        `/api/admin/providers/${provider.id}/verify`,
        { verified: !provider.is_verified },
        { headers: adminHeaders() }
      );
      setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, is_verified: data.is_verified } : p));
    } catch {
      // ignore
    }
  };

  if (!authed) {
    return (
      <div className="fade-in flex items-center justify-center min-h-[70vh] px-4">
        <div className="card w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto mb-3">A</div>
            <h1 className="font-black text-xl text-slate-900">Admin Panel</h1>
            <p className="text-slate-500 text-sm mt-1">Karigarr Management</p>
          </div>
          {pwError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
              {pwError}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Admin Password</label>
              <input
                type="password"
                required
                value={pw}
                onChange={e => { setPw(e.target.value); setPwError(''); }}
                className="input"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            <button type="submit" className="btn-dark">Access Admin Panel</button>
          </form>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: users.length, color: 'text-blue-600' },
    { label: 'Total Orders', value: orders.length, color: 'text-amber-600' },
    { label: 'Providers', value: providers.length, color: 'text-green-600' },
    { label: 'Verified', value: providers.filter(p => p.is_verified).length, color: 'text-purple-600' },
  ];

  return (
    <div className="fade-in pb-6">
      {/* Header */}
      <div className="px-4 py-4" style={{ background: 'linear-gradient(160deg, #0f172a, #1e293b)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-lg">Admin Panel</h1>
            <p className="text-slate-400 text-xs mt-0.5">Karigarr Management Dashboard</p>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false); }}
            className="text-xs text-slate-400 border border-slate-600 px-3 py-1.5 rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-2 text-center">
              <p className={`font-black text-lg ${s.color}`}>{s.value}</p>
              <p className="text-slate-400 text-[10px] leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white sticky top-[52px] z-10">
        {[['providers', 'Providers'], ['users', 'Users'], ['orders', 'Orders']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
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
          {tab === 'providers' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-semibold">{providers.length} providers registered</p>
              {providers.map(p => (
                <div key={p.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                        {p.is_verified && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">Verified</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{p.email} · {p.phone}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {p.service_type?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} · {p.location} · {formatPKR(p.hourly_rate)}/visit
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ⭐ {(p.rating || 0).toFixed(1)} ({p.total_reviews} reviews) · {p.years_experience} yrs exp
                      </p>
                      <p className="text-xs mt-0.5">
                        <span className={`font-semibold ${p.is_available ? 'text-green-600' : 'text-red-500'}`}>
                          {p.is_available ? '● Available' : '● Busy'}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => toggleVerify(p)}
                      className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                        p.is_verified
                          ? 'bg-red-50 text-red-600 active:bg-red-100'
                          : 'bg-green-50 text-green-700 active:bg-green-100'
                      }`}
                    >
                      {p.is_verified ? 'Unverify' : 'Verify'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'users' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-semibold">{users.length} total users</p>
              {users.map(u => (
                <div key={u.id} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{u.email} · {u.phone}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Joined {new Date(u.created_at).toLocaleDateString('en-PK')}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      u.role === 'provider' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role === 'provider' ? 'Provider' : 'Consumer'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-semibold">{orders.length} total orders</p>
              {orders.map(o => (
                <div key={o.id} className="card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Order #{o.id}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {o.consumer_name} → {o.provider_name}
                      </p>
                    </div>
                    <span className={`badge ${STATUS_COLORS[o.status] || 'badge-slate'} flex-shrink-0`}>
                      {o.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{o.description}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                    <span>📍 {o.address}</span>
                    {o.final_price && <span className="font-semibold text-slate-700">{formatPKR(o.final_price)}</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {new Date(o.created_at).toLocaleDateString('en-PK')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
