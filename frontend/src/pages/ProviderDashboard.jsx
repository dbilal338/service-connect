import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import OrderCard from '../components/OrderCard';

const SERVICES = ['Electrician','Plumber','Carpenter','Painter','HVAC Technician','Locksmith','Cleaner','Gardener'];

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('new');
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const [ordersRes, statsRes, meRes] = await Promise.all([
      axios.get('/api/orders'),
      axios.get('/api/providers/dashboard/stats'),
      axios.get('/api/auth/me'),
    ]);
    setOrders(ordersRes.data);
    setStats(statsRes.data.stats);
    setActiveOrder(statsRes.data.activeOrder);
    setProfile(meRes.data.profile);
    setProfileForm(meRes.data.profile || {});
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const STATUS_TABS = {
    new: { label: 'New Requests', statuses: ['pending'] },
    quoted: { label: 'Quoted', statuses: ['quoted'] },
    active: { label: 'Active', statuses: ['accepted', 'in_progress', 'provider_done'] },
    done: { label: 'Completed', statuses: ['confirmed'] },
  };

  const filtered = orders.filter(o => STATUS_TABS[tab]?.statuses.includes(o.status));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/providers/profile', profileForm);
      await loadData();
      setEditProfile(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Provider Dashboard</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="card">
            <h3 className="font-semibold mb-4">Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Orders', value: stats?.total_orders || 0, color: 'text-blue-600' },
                { label: 'Completed', value: stats?.completed_orders || 0, color: 'text-green-600' },
                { label: 'Active', value: stats?.active_orders || 0, color: 'text-orange-500' },
                { label: 'Earned', value: `$${(stats?.total_earned || 0).toFixed(0)}`, color: 'text-purple-600' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Order Alert */}
          {activeOrder && (
            <div className="card border-orange-200 bg-orange-50">
              <p className="text-orange-700 font-semibold text-sm mb-1">🔨 Currently Working</p>
              <p className="text-sm font-medium">{activeOrder.consumer_name}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{activeOrder.description}</p>
              <p className="text-xs text-orange-600 mt-2 font-medium">Complete this order before accepting new ones</p>
            </div>
          )}

          {/* Profile Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">My Profile</h3>
              <button onClick={() => setEditProfile(!editProfile)} className="text-sm text-blue-600 hover:underline">
                {editProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editProfile ? (
              <form onSubmit={saveProfile} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Service Type</label>
                  <select value={profileForm.service_type || ''} onChange={e => setProfileForm(p => ({...p, service_type: e.target.value}))} className="input mt-1 text-sm">
                    {SERVICES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Hourly Rate ($)</label>
                  <input type="number" value={profileForm.hourly_rate || ''} onChange={e => setProfileForm(p => ({...p, hourly_rate: e.target.value}))} className="input mt-1 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Location</label>
                  <input value={profileForm.location || ''} onChange={e => setProfileForm(p => ({...p, location: e.target.value}))} className="input mt-1 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Bio</label>
                  <textarea value={profileForm.description || ''} onChange={e => setProfileForm(p => ({...p, description: e.target.value}))} className="input mt-1 text-sm resize-none" rows={3} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="avail" checked={!!profileForm.is_available} onChange={e => setProfileForm(p => ({...p, is_available: e.target.checked ? 1 : 0}))} />
                  <label htmlFor="avail" className="text-sm text-gray-600">Available for new work</label>
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full text-sm py-2">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Service:</strong> {profile?.service_type}</p>
                <p><strong>Rate:</strong> ${profile?.hourly_rate}/hr</p>
                <p><strong>Location:</strong> {profile?.location || '—'}</p>
                <p><strong>Rating:</strong> ⭐ {profile?.rating?.toFixed(1)} ({profile?.total_reviews} reviews)</p>
                <p><strong>Status:</strong> <span className={profile?.is_available ? 'text-green-600' : 'text-red-500'}>{profile?.is_available ? 'Available' : 'Busy'}</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Right — Orders */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex border-b border-gray-200 mb-4 -mx-6 px-6 overflow-x-auto">
              {Object.entries(STATUS_TABS).map(([key, { label }]) => {
                const count = orders.filter(o => STATUS_TABS[key].statuses.includes(o.status)).length;
                return (
                  <button key={key} onClick={() => setTab(key)}
                    className={`px-3 py-2 font-medium text-sm whitespace-nowrap transition-colors border-b-2 -mb-px ${
                      tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}>
                    {label} {count > 0 && <span className="ml-1 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">{count}</span>}
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">📋</p>
                <p className="font-medium">No orders here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(o => <OrderCard key={o.id} order={o} role="provider" />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
