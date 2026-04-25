import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES, formatPKR } from '../constants';
import ProviderCard from '../components/ProviderCard';

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [topProviders, setTopProviders] = useState([]);

  useEffect(() => {
    axios.get('/api/providers').then(r => setTopProviders(r.data.slice(0, 4))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/browse?q=${encodeURIComponent(search)}` : '/browse');
  };

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 55%, #14532d 100%)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full" style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 -left-10 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
        </div>
        <div className="relative px-5 pt-7 pb-8">
          {user && (
            <p className="text-slate-400 text-sm mb-1">
              Welcome back, <span className="font-bold text-white">{user.name.split(' ')[0]}</span> 👋
            </p>
          )}
          <h1 className="text-white text-[26px] font-extrabold leading-tight mb-1.5">
            Find Local<br />
            <span className="text-gradient">Professionals</span>
          </h1>
          <p className="text-slate-400 text-sm mb-5">
            Bijli Mistri, Plumber, Carpenter & more — at your door
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/15 text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <button type="submit" className="bg-green-600 active:bg-green-700 text-white font-bold px-5 rounded-xl flex-shrink-0 transition-colors" style={{ boxShadow: '0 4px 16px rgba(22,163,74,0.4)' }}>
              {t('search')}
            </button>
          </form>

          {/* Quick stats */}
          <div className="flex gap-4 mt-5">
            {[['500+', 'Professionals'], ['10K+', 'Jobs Done'], ['4.8★', 'Rating']].map(([val, label]) => (
              <div key={label} className="flex flex-col">
                <span className="text-white font-extrabold text-base leading-tight">{val}</span>
                <span className="text-slate-400 text-[11px]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="px-4 py-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900 text-base">{t('popularServices')}</h2>
          <Link to="/browse" className="text-xs font-semibold text-green-600">{t('viewAll')}</Link>
        </div>
        <div className="grid grid-cols-4 gap-2.5 stagger">
          {CATEGORIES.slice(0, 8).map(cat => (
            <Link
              key={cat.id}
              to={`/browse?service=${cat.id}`}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl ${cat.bg} active:opacity-75 transition-opacity`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className={`text-[10px] font-bold ${cat.text} text-center leading-tight`}>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Fixed Price Banner */}
      <section className="px-4 mb-5">
        <Link to="/offers" className="block rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 20px rgba(22,163,74,0.3)' }}>
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl">💰</div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm">{t('fixedPriceServices')}</h3>
              <p className="text-green-100 text-xs mt-0.5">Fan Install Rs 500 · AC Service Rs 1500</p>
            </div>
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/70 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </section>

      {/* Top Providers */}
      {topProviders.length > 0 && (
        <section className="px-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-900 text-base">{t('nearbyProviders')}</h2>
            <Link to="/browse" className="text-xs font-semibold text-green-600">{t('viewAll')}</Link>
          </div>
          <div className="flex flex-col gap-3 stagger">
            {topProviders.map(p => <ProviderCard key={p.id} provider={p} />)}
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="px-4 mb-5">
        <h2 className="font-bold text-slate-900 text-base mb-3">{t('howItWorks')}</h2>
        <div className="flex flex-col gap-3">
          {[
            { num: '1', emoji: '🔍', title: t('step1Title'), desc: t('step1Desc'), color: 'bg-blue-600' },
            { num: '2', emoji: '📋', title: t('step2Title'), desc: t('step2Desc'), color: 'bg-green-600' },
            { num: '3', emoji: '✅', title: t('step3Title'), desc: t('step3Desc'), color: 'bg-purple-600' },
          ].map(s => (
            <div key={s.num} className="card flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full ${s.color} text-white font-black text-base flex items-center justify-center flex-shrink-0`}>
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
      <section className="px-4 mb-5">
        <div className="card" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a' }}>
          <h3 className="font-bold text-amber-800 text-sm mb-2">🎭 {t('demoCredentials')}</h3>
          <div className="space-y-1 text-xs text-amber-700">
            <p>{t('providerDemo')}</p>
            <p>{t('consumerDemo')}</p>
            <p className="font-semibold">{t('demoPassword')}</p>
          </div>
          <button onClick={() => navigate('/login')} className="mt-3 w-full bg-amber-500 text-white font-bold py-2.5 rounded-xl text-sm active:bg-amber-600">
            Try Demo →
          </button>
        </div>
      </section>

      {/* Join as Provider */}
      {!user && (
        <section className="px-4 mb-8">
          <div className="rounded-2xl overflow-hidden text-center px-5 py-6" style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}>
            <div className="text-4xl mb-3">🛠️</div>
            <h3 className="text-white font-bold text-base">{t('joinAsProvider')}</h3>
            <p className="text-blue-200 text-xs mt-1 mb-4">{t('joinDesc')}</p>
            <Link to="/register?role=provider" className="inline-block bg-white text-blue-700 font-bold px-6 py-2.5 rounded-xl text-sm active:bg-blue-50">
              {t('signUpNow')}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
