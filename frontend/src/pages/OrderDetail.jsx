import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORY_MAP, formatPKR, ORDER_STATUS_FLOW } from '../constants';

const STATUS_CFG = {
  pending:       { icon: '⏳', colorCls: 'bg-amber-50  text-amber-700',  key: 'status_pending' },
  quoted:        { icon: '💬', colorCls: 'bg-blue-50   text-blue-700',   key: 'status_quoted' },
  accepted:      { icon: '✅', colorCls: 'bg-indigo-50 text-indigo-700', key: 'status_accepted' },
  in_progress:   { icon: '🔨', colorCls: 'bg-orange-50 text-orange-700', key: 'status_in_progress' },
  provider_done: { icon: '🎯', colorCls: 'bg-purple-50 text-purple-700', key: 'status_provider_done' },
  confirmed:     { icon: '🏆', colorCls: 'bg-green-50  text-green-700',  key: 'status_confirmed' },
  cancelled:     { icon: '❌', colorCls: 'bg-red-50    text-red-700',    key: 'status_cancelled' },
};

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 text-xs font-medium">{label}</span>
      <span className={`text-sm font-semibold text-right max-w-[60%] ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>{value}</span>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quotePrice, setQuotePrice] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [showReview, setShowReview] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    axios.get(`/api/orders/${id}`)
      .then(r => { setOrder(r.data); setFinalPrice(r.data.quoted_price || ''); })
      .catch(() => navigate(-1)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const action = async (endpoint, data = {}) => {
    setActing(true); setError('');
    try { await axios.put(`/api/orders/${id}/${endpoint}`, data); load(); }
    catch (err) { setError(err.response?.data?.error || t('error')); }
    finally { setActing(false); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setActing(true);
    try { await axios.post(`/api/orders/${id}/review`, review); setShowReview(false); load(); }
    catch (err) { setError(err.response?.data?.error || t('error')); }
    finally { setActing(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!order) return null;

  const cfg = STATUS_CFG[order.status] || STATUS_CFG.pending;
  const stepIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const isConsumer = user.id === order.consumer_id;
  const isProvider = user.id === order.provider_id;
  const cat = CATEGORY_MAP[order.service_type];

  const otherName = isConsumer ? order.provider_name : order.consumer_name;
  const otherPhone = isConsumer ? order.provider_phone : order.consumer_phone;

  return (
    <div className="fade-in pb-6">
      {/* Status banner */}
      <div className={`px-4 py-4 ${cfg.colorCls}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{cfg.icon}</span>
          <div>
            <h2 className="font-bold text-base">{t(cfg.key)}</h2>
            <p className="text-xs opacity-75 mt-0.5">Order #{order.id} · {new Date(order.created_at).toLocaleDateString('en-PK')}</p>
          </div>
          {order.quoted_price && (
            <div className="ml-auto text-right">
              <p className="font-black text-lg">{formatPKR(order.quoted_price)}</p>
              <p className="text-[11px] opacity-60">{t('quotedPrice')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress steps */}
      {order.status !== 'cancelled' && (
        <div className="px-4 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center">
            {ORDER_STATUS_FLOW.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i < stepIndex ? 'bg-blue-600 text-white' : i === stepIndex ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-400'
                }`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                {i < ORDER_STATUS_FLOW.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 rounded-full ${i < stepIndex ? 'bg-blue-600' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">⚠️ {error}</div>
      )}

      {/* Details */}
      <div className="px-4 mt-4 card">
        <h3 className="font-bold text-slate-900 text-sm mb-1">{t('orderDetail')}</h3>
        {cat && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2 ${cat.bg} ${cat.text}`}>
            {cat.icon} {cat.label}
          </div>
        )}
        <Row label={t('description')} value={order.description} />
        <Row label={t('address')} value={order.address} />
        {order.scheduled_date && <Row label={t('scheduledDate')} value={new Date(order.scheduled_date).toLocaleDateString('en-PK')} />}
        {order.quoted_price && <Row label={t('quotedPrice')} value={formatPKR(order.quoted_price)} highlight />}
        {order.final_price && order.status === 'confirmed' && <Row label="Final Price" value={formatPKR(order.final_price)} highlight />}
        {order.payment_status === 'paid' && <Row label="Payment" value="✅ Confirmed" />}
      </div>

      {/* Other party */}
      <div className="px-4 mt-3 card">
        <div className="flex items-center gap-3">
          <div className="avatar w-11 h-11 text-sm">{otherName?.[0] || '?'}</div>
          <div className="flex-1">
            <p className="font-bold text-slate-900 text-sm">{otherName}</p>
            <a href={`tel:${otherPhone}`} className="text-blue-600 text-xs font-medium">📞 {otherPhone}</a>
          </div>
          <span className="text-xs text-slate-400">{isConsumer ? 'Provider' : 'Client'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 mt-3 space-y-2.5">

        {/* Provider: send quote */}
        {isProvider && order.status === 'pending' && (
          <div className="card space-y-3">
            <p className="font-bold text-slate-900 text-sm">{t('sendQuote')}</p>
            <input type="number" value={quotePrice} onChange={e => setQuotePrice(e.target.value)}
              placeholder="Enter quote in Rs" className="input" min="0" />
            <button onClick={() => action('quote', { quoted_price: Number(quotePrice) })} disabled={!quotePrice || acting} className="btn-primary btn-sm">
              {t('sendQuote')} {quotePrice && `— ${formatPKR(quotePrice)}`}
            </button>
          </div>
        )}

        {/* Consumer: accept quote */}
        {isConsumer && order.status === 'quoted' && (
          <div className="card space-y-3">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-blue-700 font-bold text-sm">{t('quotedPrice')}: {formatPKR(order.quoted_price)}</p>
              <p className="text-blue-500 text-xs mt-0.5">Accepting confirms your booking</p>
            </div>
            <button onClick={() => action('accept')} disabled={acting} className="btn-success">
              {t('acceptAndPay')} — {formatPKR(order.quoted_price)}
            </button>
          </div>
        )}

        {/* Provider: start work */}
        {isProvider && order.status === 'accepted' && (
          <button onClick={() => action('start')} disabled={acting} className="btn-primary">
            🔨 {t('startWork')}
          </button>
        )}

        {/* Provider: mark done */}
        {isProvider && order.status === 'in_progress' && (
          <div className="card space-y-3">
            <p className="font-bold text-slate-900 text-sm">{t('markComplete')}</p>
            <input type="number" value={finalPrice} onChange={e => setFinalPrice(e.target.value)}
              placeholder={`${t('finalPrice')} (default: ${formatPKR(order.quoted_price)})`} className="input" min="0" />
            <button onClick={() => action('done', { final_price: finalPrice ? Number(finalPrice) : null })} disabled={acting} className="btn-success">
              🎯 {t('markComplete')}
            </button>
          </div>
        )}

        {/* Consumer: confirm done */}
        {isConsumer && order.status === 'provider_done' && (
          <div className="card space-y-3">
            <p className="text-purple-700 text-sm font-medium">Provider has marked the work complete. Please confirm if you're satisfied.</p>
            <button onClick={() => action('confirm')} disabled={acting} className="btn-success">
              ✅ {t('confirmDone')}
            </button>
          </div>
        )}

        {/* Consumer: leave review */}
        {isConsumer && order.status === 'confirmed' && !showReview && (
          <button onClick={() => setShowReview(true)} className="btn-secondary">
            ⭐ {t('leaveReview')}
          </button>
        )}

        {showReview && (
          <div className="card space-y-3 fade-in">
            <p className="font-bold text-slate-900 text-sm">{t('leaveReview')}</p>
            <div>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setReview(p => ({ ...p, rating: n }))}
                    className={`text-3xl transition-colors leading-none ${n <= review.rating ? 'text-amber-400' : 'text-slate-200'}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea value={review.comment} onChange={e => setReview(p => ({ ...p, comment: e.target.value }))}
              placeholder="How was the service?" className="input resize-none" rows={3} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowReview(false)} className="btn-secondary btn-sm" style={{ width: 'auto', flex: 1 }}>{t('cancel')}</button>
              <button onClick={submitReview} disabled={acting} className="btn-primary btn-sm" style={{ flex: 2 }}>{t('submitRating')}</button>
            </div>
          </div>
        )}

        {/* Cancel */}
        {!['confirmed', 'cancelled'].includes(order.status) && (
          <button onClick={() => { if (confirm(t('cancelOrder') + '?')) action('cancel'); }} disabled={acting} className="btn-danger">
            {t('cancelOrder')}
          </button>
        )}
      </div>
    </div>
  );
}
