import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORIES, CITIES, formatPKR } from '../constants';
import OrderCard from '../components/OrderCard';

const STATUS_TABS = {
  new:    { statuses: ['pending'] },
  quoted: { statuses: ['quoted'] },
  active: { statuses: ['accepted', 'in_progress', 'provider_done'] },
  done:   { statuses: ['confirmed'] },
};

export default function ProviderDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('new');
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [offers, setOffers] = useState([]);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [offerForm, setOfferForm] = useState({ title: '', description: '', price: '', category: 'bijli_mistri' });
  const [savingOffer, setSavingOffer] = useState(false);
  const [offerError, setOfferError] = useState('');

  const loadData = async () => {
    try {
      const [ordersRes, statsRes, meRes, offersRes] = await Promise.all([
        axios.get('/api/orders'),
        axios.get('/api/providers/dashboard/stats'),
        axios.get('/api/auth/me'),
        axios.get('/api/offers/my'),
      ]);
      setOrders(ordersRes.data);
      setStats(statsRes.data.stats);
      setActiveOrder(statsRes.data.activeOrder);
      setProfile(meRes.data.profile);
      setProfileForm(meRes.data.profile || {});
      setOffers(offersRes.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = orders.filter(o => STATUS_TABS[tab]?.statuses.includes(o.status));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/providers/profile', profileForm);
      await loadData();
      setEditProfile(false);
    } catch (err) { alert(err.response?.data?.error || t('error')); }
    finally { setSaving(false); }
  };

  const addOffer = async (e) => {
    e.preventDefault();
    setSavingOffer(true); setOfferError('');
    try {
      await axios.post('/api/offers', { ...offerForm, price: Number(offerForm.price) });
      setOfferForm({ title: '', description: '', price: '', category: 'bijli_mistri' });
      setShowAddOffer(false);
      await loadData();
    } catch (err) { setOfferError(err.response?.data?.error || t('error')); }
    finally { setSavingOffer(false); }
  };

  const toggleOffer = async (offer) => {
    try { await axios.put(`/api/offers/${offer.id}`, { is_active: !offer.is_active }); await loadData(); } catch { /* ignore */ }
  };

  const deleteOffer = async (offer) => {
    if (!confirm('Delete this offer?')) return;
    try { await axios.delete(`/api/offers/${offer.id}`); await loadData(); } catch { /* ignore */ }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const tabKeys = Object.keys(STATUS_TABS);
  const tabLabels = { new: t('pending'), quoted: 'Quoted', active: t('active'), done: t('completed') };
  const cat = profile ? CATEGORIES.find(c => c.id === profile.service_type) : null;

  return (
    <div className="fade-in pb-6">
      {/* Header */}
      <div className="px-4 py-4" style={{ background: 'linear-gradient(135deg, #0f172a, #14532d)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar w-11 h-11 text-sm">{user.name[0]}</div>
            <div>
              <p className="font-bold text-white text-sm">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {cat && <span className="text-xs">{cat.icon}</span>}
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cat?.bg || 'bg-green-100/20'} ${cat?.text || 'text-green-300'}`}>
                  {cat?.label || 'Provider'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${profile?.is_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {profile?.is_available ? `● ${t('available')}` : `● ${t('notAvailable')}`}
            </div>
            <button onClick={logout} className="text-xs text-slate-400 p-1.5">{t('logout')}</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: 'Orders', value: stats?.total_orders || 0, color: 'text-blue-400', bg: 'bg-blue-500/15' },
            { label: t('completed'), value: stats?.completed_orders || 0, color: 'text-green-400', bg: 'bg-green-500/15' },
            { label: t('active'), value: stats?.active_orders || 0, color: 'text-orange-400', bg: 'bg-orange-500/15' },
            { label: 'Earned', value: formatPKR(stats?.total_earned || 0), color: 'text-purple-400', bg: 'bg-purple-500/15', small: true },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-2.5 text-center`}>
              <p className={`font-black ${s.color} ${s.small ? 'text-xs' : 'text-xl'} leading-tight`}>{s.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active order alert */}
      {activeOrder && (
        <div className="mx-4 mt-4 rounded-2xl px-4 py-3" style={{ background: 'linear-gradient(135deg, #fff7ed, #fed7aa)', border: '1px solid #fdba74' }}>
          <p className="text-orange-700 font-bold text-sm">🔨 Currently Working</p>
          <p className="text-sm text-slate-700 font-medium mt-0.5">{activeOrder.consumer_name}</p>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{activeOrder.description}</p>
        </div>
      )}

      {/* Profile edit */}
      <div className="mx-4 mt-4 card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 text-sm">👤 {t('profile')}</h3>
          <button onClick={() => setEditProfile(!editProfile)} className="text-xs font-semibold text-green-600">
            {editProfile ? t('cancel') : t('edit')}
          </button>
        </div>
        {editProfile ? (
          <form onSubmit={saveProfile} className="space-y-3">
            <div>
              <label className="label">{t('serviceType')}</label>
              <select value={profileForm.service_type || ''} onChange={e => setProfileForm(p => ({ ...p, service_type: e.target.value }))} className="input">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('hourlyRate')}</label>
              <input type="number" value={profileForm.hourly_rate || ''} onChange={e => setProfileForm(p => ({ ...p, hourly_rate: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">{t('city')}</label>
              <select value={profileForm.location || ''} onChange={e => setProfileForm(p => ({ ...p, location: e.target.value }))} className="input">
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('bio')}</label>
              <textarea value={profileForm.description || ''} onChange={e => setProfileForm(p => ({ ...p, description: e.target.value }))} className="input resize-none text-sm" rows={3} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!profileForm.is_available} onChange={e => setProfileForm(p => ({ ...p, is_available: e.target.checked }))} className="w-4 h-4 rounded accent-green-600" />
              <span className="text-sm text-slate-700 font-medium">{t('available')} for new work</span>
            </label>
            <button type="submit" disabled={saving} className="btn-primary btn-sm">{saving ? t('loading') : t('save')}</button>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-slate-400">Rate</span><p className="font-bold text-slate-900 mt-0.5">{formatPKR(profile?.hourly_rate)}</p></div>
            <div><span className="text-slate-400">City</span><p className="font-bold text-slate-900 mt-0.5">{profile?.location || '—'}</p></div>
            <div><span className="text-slate-400">Rating</span><p className="font-bold text-slate-900 mt-0.5">⭐ {(profile?.rating || 0).toFixed(1)} ({profile?.total_reviews})</p></div>
            <div><span className="text-slate-400">Experience</span><p className="font-bold text-slate-900 mt-0.5">{profile?.years_experience} {t('experience')}</p></div>
          </div>
        )}
      </div>

      {/* Fixed Price Offers */}
      <div className="mx-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 text-sm">💰 {t('myOffers')}</h3>
          <button onClick={() => setShowAddOffer(!showAddOffer)}
            className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-xl active:bg-green-200 transition-colors">
            {showAddOffer ? t('cancel') : `+ ${t('addPackage')}`}
          </button>
        </div>

        {showAddOffer && (
          <div className="card mb-3 fade-in">
            {offerError && <div className="text-red-600 text-xs mb-3">⚠️ {offerError}</div>}
            <form onSubmit={addOffer} className="space-y-3">
              <div>
                <label className="label">{t('packageTitle')}</label>
                <input required value={offerForm.title} onChange={e => setOfferForm(p => ({ ...p, title: e.target.value }))} className="input" placeholder="e.g. Fan Installation" />
              </div>
              <div>
                <label className="label">{t('packageDesc')}</label>
                <input value={offerForm.description} onChange={e => setOfferForm(p => ({ ...p, description: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">{t('packagePrice')} (Rs)</label>
                <input type="number" required value={offerForm.price} onChange={e => setOfferForm(p => ({ ...p, price: e.target.value }))} className="input" placeholder="500" min="0" />
              </div>
              <div>
                <label className="label">{t('packageCategory')}</label>
                <select value={offerForm.category} onChange={e => setOfferForm(p => ({ ...p, category: e.target.value }))} className="input">
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <button type="submit" disabled={savingOffer} className="btn-primary btn-sm">{savingOffer ? t('loading') : t('addPackage')}</button>
            </form>
          </div>
        )}

        {offers.length === 0 && !showAddOffer ? (
          <div className="card text-center py-6 text-slate-400">
            <p className="text-2xl mb-2">💰</p>
            <p className="text-sm">No packages yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {offers.map(o => {
              const oc = CATEGORIES.find(c => c.id === o.category);
              return (
                <div key={o.id} className={`card flex items-center gap-3 ${!o.is_active ? 'opacity-50' : ''}`}>
                  <span className="text-xl">{oc?.icon || '🔧'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{o.title}</p>
                    <p className="text-green-600 font-bold text-xs">{formatPKR(o.price)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => toggleOffer(o)} className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${o.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {o.is_active ? 'Active' : 'Off'}
                    </button>
                    <button onClick={() => deleteOffer(o)} className="text-red-400 text-sm p-1 active:text-red-600">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Orders tabs */}
      <div className="mt-5">
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar px-4">
          {tabKeys.map(k => {
            const count = orders.filter(o => STATUS_TABS[k].statuses.includes(o.status)).length;
            return (
              <button key={k} onClick={() => setTab(k)}
                className={`flex-shrink-0 pb-2.5 pr-5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  tab === k ? 'border-green-600 text-green-600' : 'border-transparent text-slate-400'
                }`}>
                {tabLabels[k]} {count > 0 && <span className="text-xs opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>
        <div className="px-4 pt-4 flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-sm font-medium">{t('noOrders')}</p>
            </div>
          ) : filtered.map(o => <OrderCard key={o.id} order={o} role="provider" />)}
        </div>
      </div>
    </div>
  );
}
