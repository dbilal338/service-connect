import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORIES, formatPKR } from '../constants';
import OfferCard from '../components/OfferCard';

function BookModal({ offer, onConfirm, onClose }) {
  const { t } = useLanguage();
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="w-full bg-white rounded-t-3xl p-6 pb-8 slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        <h3 className="font-bold text-slate-900 text-base mb-0.5">{offer.title}</h3>
        <p className="text-green-600 font-black text-xl mb-5">{formatPKR(offer.price)}</p>
        <div className="space-y-3">
          <div>
            <label className="label">{t('address')} *</label>
            <input value={address} onChange={e => setAddress(e.target.value)} className="input" placeholder="Your home address" />
          </div>
          <div>
            <label className="label">{t('scheduledDate')}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" min={new Date().toISOString().split('T')[0]} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-outline btn-sm" style={{ flex: 1 }}>{t('cancel')}</button>
          <button
            onClick={() => address && onConfirm({ address, scheduled_date: date })}
            disabled={!address}
            className="btn-primary btn-sm"
            style={{ flex: 2 }}
          >
            {t('bookNow')} — {formatPKR(offer.price)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OffersPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');
  const [bookTarget, setBookTarget] = useState(null);
  const [booking, setBooking] = useState(false);

  const load = async (cat) => {
    setLoading(true);
    try {
      const r = await axios.get('/api/offers', { params: cat ? { category: cat } : {} });
      setOffers(r.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { load(activeFilter); }, [activeFilter]);

  const handleBook = async ({ address, scheduled_date }) => {
    if (!user) { navigate('/login'); return; }
    setBooking(true);
    try {
      const r = await axios.post(`/api/offers/${bookTarget.id}/book`, { address, scheduled_date });
      setBookTarget(null);
      navigate(`/orders/${r.data.id}`);
    } catch (err) {
      alert(err.response?.data?.error || t('error'));
    } finally { setBooking(false); }
  };

  return (
    <div className="fade-in pb-6">
      {/* Banner */}
      <div className="px-4 pt-4 pb-2">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 20px rgba(22,163,74,0.3)' }}>
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">💰</div>
            <div>
              <h2 className="text-white font-bold text-sm">{t('fixedPriceServices')}</h2>
              <p className="text-green-100 text-xs mt-0.5">Fixed prices — no surprises</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-4 pt-3 mb-2">
        <button
          onClick={() => setActiveFilter('')}
          className={`flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-semibold border transition-colors ${
            !activeFilter ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          🛠️ All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border transition-colors ${
              activeFilter === cat.id ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💰</p>
            <p className="font-semibold text-slate-700">No offers in this category</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 stagger">
            {offers.map(o => <OfferCard key={o.id} offer={o} onBook={setBookTarget} />)}
          </div>
        )}
      </div>

      {bookTarget && (
        <BookModal
          offer={bookTarget}
          onConfirm={handleBook}
          onClose={() => setBookTarget(null)}
        />
      )}
    </div>
  );
}
