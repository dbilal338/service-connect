import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORY_MAP, formatPKR } from '../constants';

export default function OfferCard({ offer, onBook }) {
  const { t, isUrdu } = useLanguage();
  const navigate = useNavigate();
  const cat = CATEGORY_MAP[offer.category];

  const stars = Math.round(offer.provider_rating || 0);

  return (
    <div className="card fade-in">
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${cat?.bg || 'bg-blue-100'}`}>
          {cat?.icon || '🔧'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm leading-snug">{offer.title}</h3>
          <p className="text-slate-500 text-xs mt-0.5 leading-relaxed line-clamp-2">{offer.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-blue-600 font-bold text-base">{formatPKR(offer.price)}</div>
          <div className="text-slate-400 text-[11px]">{isUrdu ? cat?.urdu : cat?.label}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <button
          onClick={() => navigate(`/providers/${offer.provider_id}`)}
          className="flex items-center gap-2 min-w-0"
        >
          <div className="avatar w-7 h-7 text-xs">{offer.provider_name?.[0] || '?'}</div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-700 truncate">{offer.provider_name}</div>
            <div className="flex items-center gap-1">
              {'★'.repeat(stars)}<span className="text-slate-300">{'★'.repeat(5 - stars)}</span>
              <span className="text-slate-400 text-[10px]">({offer.provider_reviews || 0})</span>
            </div>
          </div>
        </button>
        <button
          onClick={() => onBook(offer)}
          className="flex-shrink-0 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl active:bg-blue-700 transition-colors"
        >
          {t('bookNow')}
        </button>
      </div>
    </div>
  );
}
