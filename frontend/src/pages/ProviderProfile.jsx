import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-xl ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  );
}

const SERVICE_ICONS = { 'Electrician':'⚡','Plumber':'🔧','Carpenter':'🪚','Painter':'🎨','HVAC Technician':'❄️','Locksmith':'🔑','Cleaner':'🧹','Gardener':'🌱' };

export default function ProviderProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOrder, setShowOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({ description: '', address: '', scheduled_date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    axios.get(`/api/providers/${id}`)
      .then(r => setProvider(r.data))
      .catch(() => navigate('/browse'))
      .finally(() => setLoading(false));
  }, [id]);

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.role !== 'consumer') return setOrderError('Only consumers can place orders');
    setSubmitting(true);
    setOrderError('');
    try {
      await axios.post('/api/orders', { provider_id: Number(id), ...orderForm });
      navigate('/dashboard');
    } catch (err) {
      setOrderError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!provider) return null;

  const initials = provider.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const icon = SERVICE_ICONS[provider.service_type] || '🛠️';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/browse" className="text-blue-600 hover:underline text-sm mb-6 inline-block">← Back to Browse</Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left — Profile */}
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{provider.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-blue-600 font-semibold text-lg">{provider.service_type}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Stars rating={provider.rating} />
                  <span className="text-gray-600">{provider.rating.toFixed(1)} ({provider.total_reviews} reviews)</span>
                </div>
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                  <span>📍 {provider.location}</span>
                  <span>🏆 {provider.years_experience} years experience</span>
                  <span className={`font-medium ${provider.is_available ? 'text-green-600' : 'text-red-500'}`}>
                    {provider.is_available ? '● Available' : '● Currently Busy'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">${provider.hourly_rate}</p>
                <p className="text-gray-500 text-sm">per hour</p>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-gray-600 leading-relaxed">{provider.description}</p>
            </div>

            <div className="mt-4 flex gap-3">
              <a href={`tel:${provider.phone}`} className="btn-secondary flex items-center gap-2">
                📞 Call {provider.phone}
              </a>
            </div>
          </div>

          {/* Reviews */}
          {provider.reviews && provider.reviews.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                {provider.reviews.map((r, i) => (
                  <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{r.consumer_name}</span>
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-sm ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Book */}
        <div>
          <div className="card sticky top-20">
            <h3 className="font-semibold text-lg mb-4">Book {provider.name}</h3>

            {!user ? (
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-4">Sign in to book this service</p>
                <Link to="/login" className="btn-primary w-full block text-center">Sign In to Book</Link>
              </div>
            ) : user.role === 'provider' ? (
              <p className="text-gray-500 text-sm">Providers cannot book services.</p>
            ) : !showOrder ? (
              <div>
                <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-blue-700">
                  <strong>Hourly Rate:</strong> ${provider.hourly_rate}/hr<br/>
                  <span className="text-xs">Provider will send you a final quote</span>
                </div>
                <button onClick={() => setShowOrder(true)} disabled={!provider.is_available} className="btn-primary w-full">
                  {provider.is_available ? 'Request Service' : 'Currently Unavailable'}
                </button>
              </div>
            ) : (
              <form onSubmit={submitOrder} className="space-y-3">
                {orderError && <div className="bg-red-50 text-red-600 rounded p-2 text-sm">{orderError}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Describe the work needed</label>
                  <textarea required value={orderForm.description} onChange={e => setOrderForm(p => ({...p, description: e.target.value}))}
                    className="input resize-none" rows={3} placeholder="e.g. Kitchen faucet is leaking, need replacement..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Address</label>
                  <input required value={orderForm.address} onChange={e => setOrderForm(p => ({...p, address: e.target.value}))}
                    className="input" placeholder="123 Main St, City" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date (optional)</label>
                  <input type="date" value={orderForm.scheduled_date} onChange={e => setOrderForm(p => ({...p, scheduled_date: e.target.value}))}
                    className="input" min={new Date().toISOString().split('T')[0]} />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
                <button type="button" onClick={() => setShowOrder(false)} className="btn-secondary w-full text-sm">
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
