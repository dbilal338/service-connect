import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import OrderCard from '../components/OrderCard';

const ACTIVE = ['pending', 'quoted', 'accepted', 'in_progress', 'provider_done'];

export default function ConsumerDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    axios.get('/api/orders').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'active',    label: t('active'),    filter: o => ACTIVE.includes(o.status) },
    { id: 'completed', label: t('completed'), filter: o => o.status === 'confirmed' },
    { id: 'cancelled', label: t('cancelled'), filter: o => o.status === 'cancelled' },
  ];

  const filtered = orders.filter(tabs.find(t => t.id === tab)?.filter || (() => true));
  const counts = {
    active:    orders.filter(o => ACTIVE.includes(o.status)).length,
    completed: orders.filter(o => o.status === 'confirmed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="fade-in">
      {/* User header */}
      <div className="px-4 py-4" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar w-10 h-10 text-sm">{user.name[0]}</div>
            <div>
              <p className="font-bold text-white text-sm">{user.name}</p>
              <p className="text-slate-400 text-xs">{user.phone || user.email}</p>
            </div>
          </div>
          <button onClick={logout} className="text-xs text-slate-400 font-medium py-1.5 px-3 rounded-lg active:bg-white/10">
            {t('logout')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: t('active'),    count: counts.active,    color: 'text-blue-400',  bg: 'bg-blue-500/15'  },
            { label: t('completed'), count: counts.completed, color: 'text-green-400', bg: 'bg-green-500/15' },
            { label: t('cancelled'), count: counts.cancelled, color: 'text-red-400',   bg: 'bg-red-500/15'   },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* New service CTA */}
      <div className="px-4 pt-4">
        <Link to="/browse" className="flex items-center gap-3 rounded-2xl px-4 py-3.5 active:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 16px rgba(22,163,74,0.28)' }}>
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🔍</div>
          <div>
            <p className="font-bold text-white text-sm">{t('newOrder')}</p>
            <p className="text-green-200 text-xs">{t('nearbyProviders')}</p>
          </div>
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/70 ml-auto flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mx-4 mt-4">
        {tabs.map(tab_ => (
          <button key={tab_.id} onClick={() => setTab(tab_.id)}
            className={`flex-1 pb-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === tab_.id ? 'border-green-600 text-green-600' : 'border-transparent text-slate-400'
            }`}>
            {tab_.label} {counts[tab_.id] > 0 && <span className="text-xs opacity-70">({counts[tab_.id]})</span>}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold text-slate-700">{t('noOrders')}</p>
            {tab === 'active' && (
              <Link to="/browse" className="mt-3 inline-block text-green-600 font-semibold text-sm">
                {t('browse')} →
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 stagger">
            {filtered.map(o => <OrderCard key={o.id} order={o} role="consumer" />)}
          </div>
        )}
      </div>
    </div>
  );
}
