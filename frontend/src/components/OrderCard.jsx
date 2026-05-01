import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORY_MAP, formatPKR } from '../constants';

const STATUS_CFG = {
  pending:       { key: 'status_pending',       cls: 's-pending',       icon: '⏳' },
  quoted:        { key: 'status_quoted',         cls: 's-quoted',        icon: '💬' },
  accepted:      { key: 'status_accepted',       cls: 's-accepted',      icon: '✅' },
  in_progress:   { key: 'status_in_progress',    cls: 's-in_progress',   icon: '🔨' },
  provider_done: { key: 'status_provider_done',  cls: 's-provider_done', icon: '🎯' },
  confirmed:     { key: 'status_confirmed',      cls: 's-confirmed',     icon: '🏆' },
  cancelled:     { key: 'status_cancelled',      cls: 's-cancelled',     icon: '❌' },
};

export default function OrderCard({ order, role }) {
  const { t } = useLanguage();
  const cfg = STATUS_CFG[order.status] || STATUS_CFG.pending;
  const otherName = role === 'consumer' ? order.provider_name : order.consumer_name;
  const cat = CATEGORY_MAP[order.service_type];

  return (
    <Link to={`/orders/${order.id}`} className="block card active:scale-[0.99] transition-transform fade-in">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${cat?.bg || 'bg-slate-100'}`}>
          {cat?.icon || '🛠️'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className={`badge ${cfg.cls} text-[11px]`}>{cfg.icon} {t(cfg.key)}</span>
              <h3 className="font-semibold text-slate-900 text-sm mt-1 truncate">{otherName}</h3>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{order.description}</p>
            </div>
            {order.quoted_price && (
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-slate-900 text-sm">{formatPKR(order.quoted_price)}</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-slate-400">📍 {order.address?.slice(0, 30)}{order.address?.length > 30 ? '…' : ''}</p>
            <p className="text-[11px] text-slate-400">{new Date(order.created_at).toLocaleDateString('en-PK')}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
