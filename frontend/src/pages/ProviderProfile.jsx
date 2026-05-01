import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORY_MAP, formatPKR } from '../constants';
import OfferCard from '../components/OfferCard';

function Stars({ rating }) {
  const r = Math.round(rating || 0);
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-sm leading-none ${i <= r ? 'text-amber-400' : 'text-white/30'}`}>★</span>
      ))}
    </span>
  );
}

export default function ProviderProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookForm, setShowBookForm] = useState(false);
  const [form, setForm] = useState({ description: '', address: '', scheduled_date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      axios.get(`/api/providers/${id}`),
      axios.get('/api/offers'),
    ]).then(([pr, or]) => {
      setProvider(pr.data);
      setOffers(or.data.filter(o => o.provider_id === Number(id)));
    }).catch(() => navigate('/browse')).finally(() => setLoading(false));
  }, [id]);

  const startChat = async () => {
    if (!user) return navigate('/login');
    try {
      const r = await axios.post('/api/chat/conversations/start', { other_user_id: Number(id) });
      navigate(`/chat/${r.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start chat. Please try again.');
    }
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.role !== 'consumer') return setError('Only customers can place orders');
    setSubmitting(true); setError('');
    try {
      await axios.post('/api/orders', { provider_id: Number(id), ...form });
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.error || t('error')); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!provider) return null;

  const cat = CATEGORY_MAP[provider.service_type];
  const initials = provider.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fade-in pb-6">
      {/* Profile header */}
      <div className="px-4 py-5" style={{ background: 'linear-gradient(160deg, #0f172a, #14532d)' }}>
        <div className="flex items-start gap-4">
          <div className="avatar w-16 h-16 text-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-lg">{provider.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base">{cat?.icon || '🛠️'}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cat?.bg || 'bg-green-100'} ${cat?.text || 'text-green-800'}`}>
                {cat?.label || provider.service_type}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <Stars rating={provider.rating} />
              <span className="text-slate-400 text-xs">{(provider.rating || 0).toFixed(1)} ({provider.total_reviews})</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-white font-black text-xl">{formatPKR(provider.hourly_rate)}</p>
            <p className="text-slate-400 text-xs">{t('perVisit')}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${provider.is_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {provider.is_available ? `● ${t('available')}` : `● ${t('notAvailable')}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-slate-400 text-xs">
          <span>📍 {provider.location}</span>
          <span>🏆 {provider.years_experience} {t('experience')}</span>
        </div>
      </div>

      {/* Action buttons — visible to everyone; auth-gated actions redirect to login */}
      {(!user || user.id !== Number(id)) && (
        <div className="flex gap-2 px-4 py-3 bg-white border-b border-slate-100">
          <button onClick={startChat} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl active:bg-slate-200 transition-colors">
            💬 {t('chatNow')}
          </button>
          <a href={`tel:${provider.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl active:bg-slate-200 transition-colors">
            📞 {t('callNow')}
          </a>
          {(!user || user.role === 'consumer') && (
            <button
              onClick={() => { if (!user) return navigate('/login'); setShowBookForm(!showBookForm); }}
              disabled={user && !provider.is_available}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl active:bg-green-700 disabled:opacity-50 transition-colors"
            >
              📋 {t('bookNow')}
            </button>
          )}
        </div>
      )}

      {/* Book form */}
      {showBookForm && user?.role === 'consumer' && (
        <div className="px-4 py-4 bg-green-50 border-b border-green-100 fade-in">
          {error && <div className="text-red-600 text-sm mb-3">⚠️ {error}</div>}
          <form onSubmit={submitOrder} className="space-y-3">
            <div>
              <label className="label">{t('description')}</label>
              <textarea required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="input resize-none" rows={2} placeholder={t('description')} />
            </div>
            <div>
              <label className="label">{t('address')}</label>
              <input required value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                className="input" placeholder="Your home address" />
            </div>
            <div>
              <label className="label">{t('scheduledDate')}</label>
              <input type="date" value={form.scheduled_date} onChange={e => setForm(p => ({ ...p, scheduled_date: e.target.value }))}
                className="input" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowBookForm(false)} className="btn-outline btn-sm" style={{ flex: 1 }}>
                {t('cancel')}
              </button>
              <button type="submit" disabled={submitting} className="btn-primary btn-sm" style={{ flex: 2 }}>
                {submitting ? t('loading') : t('bookNow')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* About */}
      <div className="px-4 py-4">
        <h2 className="font-bold text-slate-900 text-sm mb-2">ℹ️ About</h2>
        <div className="card">
          <p className="text-slate-600 text-sm leading-relaxed">{provider.description}</p>
        </div>
      </div>

      {/* Fixed Price Offers */}
      {offers.length > 0 && (
        <div className="px-4 pb-4">
          <h2 className="font-bold text-slate-900 text-sm mb-2">💰 {t('fixedPriceServices')}</h2>
          <div className="flex flex-col gap-3">
            {offers.map(o => (
              <OfferCard key={o.id} offer={o} onBook={() => {
                if (!user) navigate('/login');
                else navigate('/offers');
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {provider.reviews?.length > 0 && (
        <div className="px-4 pb-4">
          <h2 className="font-bold text-slate-900 text-sm mb-2">⭐ Reviews ({provider.reviews.length})</h2>
          <div className="card divide-y divide-slate-100">
            {provider.reviews.map((r, i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800 text-sm">{r.consumer_name}</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm leading-none ${s <= r.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-slate-500 text-xs leading-relaxed">{r.comment}</p>}
                <p className="text-[11px] text-slate-400 mt-1">{new Date(r.created_at).toLocaleDateString('en-PK')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
