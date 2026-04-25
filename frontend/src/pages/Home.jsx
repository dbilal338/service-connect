import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES, formatPKR } from '../constants';
import ProviderCard from '../components/ProviderCard';

export default function Home() {
  const { t, isUrdu } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [topProviders, setTopProviders] = useState([]);

  useEffect(() => {
    axios.get('/api/providers').then(r => setTopProviders(r.data.slice(0, 4))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/browse?q=${encodeURIComponent(search)}`);
    else navigate('/browse');
  };

  return (
    <div className="fade-in">
      {/* Hero Banner */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)' }}>
        <div className="px-5 pt-6 pb-8">
          {user && (
            <p className="text-blue-200 text-sm mb-1">
              {isUrdu ? 'خوش آمدید،' : 'Welcome back,'} <span className="font-bold text-white">{user.name.split(' ')[0]}</span> 👋
            </p>
          )}
          <h1 className="text-white text-2xl font-extrabold leading-tight mb-1">
            {isUrdu ? 'مقامی ماہرین تلاش کریں' : 'Find Local Experts'}
          </h1>
          <p className="text-blue-200 text-sm mb-5">
            {isUrdu ? 'بجلی مستری، پلمبر، بڑھئی اور مزید' : 'Bijli Mistri, Plumber, Carpenter & more'}
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-white rounded-xl pl-9 pr-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm outline-none"
              />
            </div>
            <button type="submit" className="bg-green-500 active:bg-green-600 text-white font-bold px-5 rounded-xl flex-shrink-0 transition-colors">
              {t('search')}
            </button>
          </form>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute top-4 -right-4 w-20 h-20 bg-white/5 rounded-full" />
      </section>

      {/* Category Grid */}
      <section className="px-4 py-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title mb-0">{t('popularServices')}</h2>
          <Link to="/browse" className="text-xs font-semibold text-blue-600">{t('viewAll')}</Link>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {CATEGORIES.slice(0, 8).map(cat => (
            <Link
              key={cat.id}
              to={`/browse?service=${cat.id}`}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl ${cat.bg} active:opacity-80 transition-opacity`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className={`text-[10px] font-bold ${cat.text} text-center leading-tight`}>
                {isUrdu ? cat.urdu : cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Fixed Price Offers Banner */}
      <section className="px-4 mb-5">
        <Link to="/offers" className="block rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="text-4xl">💰</div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm">{t('fixedPriceServices')}</h3>
              <p className="text-green-100 text-xs mt-0.5">
                {isUrdu ? 'پنکھا لگانا Rs 500 · AC سروسنگ Rs 1500' : 'Fan Install Rs 500 · AC Service Rs 1500'}
              </p>
            </div>
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </section>

      {/* Top Providers */}
      {topProviders.length > 0 && (
        <section className="px-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title mb-0">{t('nearbyProviders')}</h2>
            <Link to="/browse" className="text-xs font-semibold text-blue-600">{t('viewAll')}</Link>
          </div>
          <div className="flex flex-col gap-3">
            {topProviders.map(p => <ProviderCard key={p.id} provider={p} />)}
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="px-4 mb-5">
        <h2 className="section-title">{t('howItWorks')}</h2>
        <div className="flex flex-col gap-3">
          {[
            { num: '1', emoji: '🔍', title: t('step1Title'), desc: t('step1Desc') },
            { num: '2', emoji: '📋', title: t('step2Title'), desc: t('step2Desc') },
            { num: '3', emoji: '✅', title: t('step3Title'), desc: t('step3Desc') },
          ].map(s => (
            <div key={s.num} className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-base flex items-center justify-center flex-shrink-0">
                {s.num}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Credentials */}
      <section className="px-4 mb-6">
        <div className="card bg-amber-50 border border-amber-200">
          <h3 className="font-bold text-amber-800 text-sm mb-2">🎭 {t('demoCredentials')}</h3>
          <div className="space-y-1 text-xs text-amber-700">
            <p>{t('providerDemo')}</p>
            <p>{t('consumerDemo')}</p>
            <p className="font-semibold">{t('demoPassword')}</p>
          </div>
          <button onClick={() => navigate('/login')} className="mt-3 w-full bg-amber-500 text-white font-bold py-2 rounded-xl text-sm active:bg-amber-600">
            {t('login')} →
          </button>
        </div>
      </section>

      {/* Join as Provider CTA */}
      {!user && (
        <section className="px-4 mb-8">
          <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}>
            <div className="px-5 py-5 text-center">
              <div className="text-3xl mb-2">🛠️</div>
              <h3 className="text-white font-bold text-base">{t('joinAsProvider')}</h3>
              <p className="text-blue-200 text-xs mt-1 mb-4">{t('joinDesc')}</p>
              <Link to="/register?role=provider" className="inline-block bg-white text-blue-700 font-bold px-6 py-2.5 rounded-xl text-sm active:bg-blue-50">
                {t('signUpNow')}
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
