import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORY_MAP, formatPKR } from '../constants';

function Stars({ rating }) {
  const r = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-sm leading-none ${i <= r ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
      ))}
    </div>
  );
}

export default function ProviderCard({ provider }) {
  const { t, isUrdu } = useLanguage();
  const cat = CATEGORY_MAP[provider.service_type];
  const initials = provider.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Link to={`/providers/${provider.id}`} className="block card active:shadow-md transition-shadow fade-in">
      <div className="flex items-start gap-3">
        <div className="avatar w-12 h-12 text-base flex-shrink-0" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-[15px] leading-tight">{provider.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base">{cat?.icon || '🛠️'}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat?.bg || 'bg-blue-100'} ${cat?.text || 'text-blue-700'}`}>
                  {isUrdu ? cat?.urdu : (cat?.label || provider.service_type)}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-base font-bold text-slate-900">{formatPKR(provider.hourly_rate)}</p>
              <p className="text-[10px] text-slate-400">{t('perVisit')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Stars rating={provider.rating} />
            <span className="text-xs text-slate-500">{(provider.rating || 0).toFixed(1)} ({provider.total_reviews})</span>
            <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${provider.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {provider.is_available ? `● ${t('available')}` : `● ${t('notAvailable')}`}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{provider.description}</p>

          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span>📍 {provider.location}</span>
            <span>🏆 {provider.years_experience} {t('experience')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
