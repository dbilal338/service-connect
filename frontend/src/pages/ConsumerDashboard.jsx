import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import OrderCard from '../components/OrderCard';

const STATUS_GROUPS = {
  active: ['pending', 'quoted', 'accepted', 'in_progress', 'provider_done'],
  completed: ['confirmed'],
  cancelled: ['cancelled'],
};

export default function ConsumerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    axios.get('/api/orders').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => STATUS_GROUPS[tab]?.includes(o.status));
  const counts = {
    active: orders.filter(o => STATUS_GROUPS.active.includes(o.status)).length,
    completed: orders.filter(o => o.status === 'confirmed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-gray-500">Welcome back, {user.name}</p>
        </div>
        <Link to="/browse" className="btn-primary">+ New Service</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active', count: counts.active, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', count: counts.completed, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Cancelled', count: counts.cancelled, color: 'text-red-500', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`card ${s.bg} border-0`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {Object.keys(STATUS_GROUPS).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 font-medium text-sm capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t} {counts[t] > 0 && <span className="ml-1 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">{counts[t]}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg font-medium">No {tab} orders</p>
          {tab === 'active' && <Link to="/browse" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Browse services →</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => <OrderCard key={o.id} order={o} role="consumer" />)}
        </div>
      )}
    </div>
  );
}
