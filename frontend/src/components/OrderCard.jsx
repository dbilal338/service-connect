import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  pending: { label: 'Awaiting Quote', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  quoted: { label: 'Quote Received', color: 'bg-blue-100 text-blue-700', icon: '💬' },
  accepted: { label: 'Accepted', color: 'bg-indigo-100 text-indigo-700', icon: '✅' },
  in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-700', icon: '🔨' },
  provider_done: { label: 'Work Done — Confirm?', color: 'bg-purple-100 text-purple-700', icon: '🎯' },
  confirmed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: '🏆' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '❌' },
};

export default function OrderCard({ order, role }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const otherParty = role === 'consumer' ? order.provider_name : order.consumer_name;
  const phone = role === 'consumer' ? order.provider_phone : order.consumer_phone;

  return (
    <Link to={`/orders/${order.id}`} className="block card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
            {order.service_type && <span className="badge bg-gray-100 text-gray-600">{order.service_type}</span>}
          </div>
          <h3 className="font-semibold text-gray-900">{role === 'consumer' ? `Provider: ${otherParty}` : `Client: ${otherParty}`}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{order.description}</p>
          <p className="text-xs text-gray-400 mt-2">📍 {order.address} • {new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <div className="text-right flex-shrink-0">
          {order.quoted_price && (
            <p className="text-lg font-bold text-gray-900">${order.quoted_price}</p>
          )}
          {phone && (
            <a href={`tel:${phone}`} onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1">
              📞 Call
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}
