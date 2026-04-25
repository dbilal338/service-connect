import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const STATUS_STEPS = ['pending', 'quoted', 'accepted', 'in_progress', 'provider_done', 'confirmed'];

const STATUS_CONFIG = {
  pending: { label: 'Awaiting Quote', desc: 'Waiting for provider to send a quote', icon: '⏳', color: 'text-yellow-600 bg-yellow-50' },
  quoted: { label: 'Quote Received', desc: 'Provider has sent a price quote', icon: '💬', color: 'text-blue-600 bg-blue-50' },
  accepted: { label: 'Accepted & Paid', desc: 'Quote accepted, payment confirmed', icon: '✅', color: 'text-indigo-600 bg-indigo-50' },
  in_progress: { label: 'Work In Progress', desc: 'Provider is currently working', icon: '🔨', color: 'text-orange-600 bg-orange-50' },
  provider_done: { label: 'Work Done', desc: 'Provider has marked work complete', icon: '🎯', color: 'text-purple-600 bg-purple-50' },
  confirmed: { label: 'Completed', desc: 'Order confirmed and closed', icon: '🏆', color: 'text-green-600 bg-green-50' },
  cancelled: { label: 'Cancelled', desc: 'This order was cancelled', icon: '❌', color: 'text-red-600 bg-red-50' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
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
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const action = async (endpoint, data = {}) => {
    setActing(true);
    setError('');
    try {
      await axios.put(`/api/orders/${id}/${endpoint}`, data);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setActing(true);
    try {
      await axios.post(`/api/orders/${id}/review`, review);
      setShowReview(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!order) return null;

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isConsumer = user.id === order.consumer_id;
  const isProvider = user.id === order.provider_id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline text-sm mb-6 inline-block">← Back</button>

      {/* Status Banner */}
      <div className={`rounded-xl p-5 mb-6 ${cfg.color}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{cfg.icon}</span>
          <div>
            <h2 className="text-xl font-bold">{cfg.label}</h2>
            <p className="text-sm opacity-80">{cfg.desc}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm opacity-70">Order #{order.id}</p>
            <p className="text-xs opacity-60">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {order.status !== 'cancelled' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i <= stepIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>{i < stepIndex ? '✓' : i + 1}</div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 ${i < stepIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 px-0">
            {STATUS_STEPS.map(s => (
              <span key={s} className="text-center" style={{width: `${100/STATUS_STEPS.length}%`}}>
                {STATUS_CONFIG[s]?.label.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Details */}
        <div className="card">
          <h3 className="font-semibold mb-4">Order Details</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Service Type</p>
              <p className="font-medium">{order.service_type}</p>
            </div>
            <div>
              <p className="text-gray-500">Description</p>
              <p className="font-medium">{order.description}</p>
            </div>
            <div>
              <p className="text-gray-500">Address</p>
              <p className="font-medium">{order.address}</p>
            </div>
            {order.scheduled_date && (
              <div>
                <p className="text-gray-500">Scheduled Date</p>
                <p className="font-medium">{new Date(order.scheduled_date).toLocaleDateString()}</p>
              </div>
            )}
            {order.quoted_price && (
              <div>
                <p className="text-gray-500">Quoted Price</p>
                <p className="font-bold text-xl text-blue-600">${order.quoted_price}</p>
              </div>
            )}
            {order.final_price && order.status === 'confirmed' && (
              <div>
                <p className="text-gray-500">Final Price</p>
                <p className="font-bold text-xl text-green-600">${order.final_price}</p>
              </div>
            )}
            {order.payment_status === 'paid' && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-lg p-2">
                <span>💳</span> <span className="font-medium">Payment Confirmed</span>
              </div>
            )}
          </div>
        </div>

        {/* People */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3">{isConsumer ? 'Provider' : 'Client'}</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                {(isConsumer ? order.provider_name : order.consumer_name)?.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{isConsumer ? order.provider_name : order.consumer_name}</p>
                <a href={`tel:${isConsumer ? order.provider_phone : order.consumer_phone}`}
                  className="text-blue-600 text-sm hover:underline">
                  📞 {isConsumer ? order.provider_phone : order.consumer_phone}
                </a>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h3 className="font-semibold mb-3">Actions</h3>
            <div className="space-y-2">

              {/* Provider: send quote */}
              {isProvider && order.status === 'pending' && (
                <div className="space-y-2">
                  <input type="number" value={quotePrice} onChange={e => setQuotePrice(e.target.value)}
                    placeholder="Enter quote price ($)" className="input" min="0" />
                  <button onClick={() => action('quote', { quoted_price: Number(quotePrice) })} disabled={!quotePrice || acting}
                    className="btn-primary w-full">Send Quote</button>
                </div>
              )}

              {/* Consumer: accept quote + pay */}
              {isConsumer && order.status === 'quoted' && (
                <div>
                  <div className="bg-blue-50 rounded-lg p-3 mb-3 text-sm text-blue-700">
                    <strong>Quoted Price: ${order.quoted_price}</strong><br/>
                    Accepting will simulate payment
                  </div>
                  <button onClick={() => action('accept')} disabled={acting}
                    className="btn-success w-full">✅ Accept & Pay ${order.quoted_price}</button>
                </div>
              )}

              {/* Provider: start work */}
              {isProvider && order.status === 'accepted' && (
                <button onClick={() => action('start')} disabled={acting} className="btn-primary w-full">
                  🔨 Start Work
                </button>
              )}

              {/* Provider: mark done */}
              {isProvider && order.status === 'in_progress' && (
                <div className="space-y-2">
                  <input type="number" value={finalPrice} onChange={e => setFinalPrice(e.target.value)}
                    placeholder={`Final price (default: $${order.quoted_price})`} className="input" min="0" />
                  <button onClick={() => action('done', { final_price: finalPrice ? Number(finalPrice) : null })} disabled={acting}
                    className="btn-success w-full">🎯 Mark Work Complete</button>
                </div>
              )}

              {/* Consumer: confirm completion */}
              {isConsumer && order.status === 'provider_done' && (
                <div>
                  <div className="bg-purple-50 rounded-lg p-3 mb-3 text-sm text-purple-700">
                    Provider has marked the work as done. Please confirm if you are satisfied.
                  </div>
                  <button onClick={() => action('confirm')} disabled={acting}
                    className="btn-success w-full">✅ Confirm Work Completed</button>
                </div>
              )}

              {/* Consumer: leave review */}
              {isConsumer && order.status === 'confirmed' && !showReview && (
                <button onClick={() => setShowReview(true)} className="btn-secondary w-full">
                  ⭐ Leave a Review
                </button>
              )}

              {showReview && (
                <form onSubmit={submitReview} className="space-y-2 border-t pt-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rating</label>
                    <div className="flex gap-1 mt-1">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} type="button" onClick={() => setReview(p => ({...p, rating: n}))}
                          className={`text-2xl ${n <= review.rating ? 'text-yellow-400' : 'text-gray-200'} hover:text-yellow-400 transition-colors`}>
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea value={review.comment} onChange={e => setReview(p => ({...p, comment: e.target.value}))}
                    placeholder="How was the service?" className="input resize-none text-sm" rows={3} />
                  <div className="flex gap-2">
                    <button type="submit" disabled={acting} className="btn-primary flex-1 text-sm">Submit Review</button>
                    <button type="button" onClick={() => setShowReview(false)} className="btn-secondary text-sm px-4">Cancel</button>
                  </div>
                </form>
              )}

              {/* Cancel */}
              {!['confirmed', 'cancelled'].includes(order.status) && (
                <button onClick={() => { if (confirm('Cancel this order?')) action('cancel'); }} disabled={acting}
                  className="btn-danger w-full text-sm">Cancel Order</button>
              )}

              {order.status === 'cancelled' && (
                <p className="text-center text-gray-400 text-sm">This order has been cancelled</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
