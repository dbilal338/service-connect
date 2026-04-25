import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORIES } from '../constants';
import ProviderCard from '../components/ProviderCard';

export default function Browse() {
  const { t, isUrdu } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(searchParams.get('service') || '');
  const [maxRate, setMaxRate] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const fetch = async (service, rate) => {
    setLoading(true);
    try {
      const params = {};
      if (service) params.service_type = service;
      if (rate) params.max_rate = rate;
      const r = await axios.get('/api/providers', { params });
      setProviders(r.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const svc = searchParams.get('service') || '';
    setActiveFilter(svc);
    fetch(svc, maxRate);
  }, [searchParams]);

  const handleFilter = (id) => {
    const newFilter = activeFilter === id ? '' : id;
    setActiveFilter(newFilter);
    setSearchParams(newFilter ? { service: newFilter } : {});
  };

  const applyRate = () => { fetch(activeFilter, maxRate); setShowFilter(false); };

  return (
    <div className="page pb-6">
      {/* Category scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 mb-4">
        <button
          onClick={() => handleFilter('')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-colors border ${
            !activeFilter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          🛠️ {t('allCategories')}
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleFilter(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-colors border ${
              activeFilter === cat.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {cat.icon} {isUrdu ? cat.urdu : cat.label}
          </button>
        ))}
      </div>

      {/* Filter + count row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {loading ? '...' : `${providers.length} ${isUrdu ? 'نتیجے' : 'found'}`}
        </p>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg"
        >
          🔧 {t('filter')} {maxRate && `≤ Rs ${maxRate}`}
        </button>
      </div>

      {/* Rate filter panel */}
      {showFilter && (
        <div className="card mb-4 fade-in">
          <label className="input-label">{t('maxRate')} (Rs)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={maxRate}
              onChange={e => setMaxRate(e.target.value)}
              placeholder="e.g. 1000"
              className="input"
            />
            <button onClick={applyRate} className="flex-shrink-0 btn btn-primary btn-sm" style={{ width: 'auto' }}>
              {t('search')}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">{t('loading')}</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🔍</p>
          <p className="font-semibold text-slate-700">{t('noProviders')}</p>
          <button onClick={() => { setActiveFilter(''); setMaxRate(''); setSearchParams({}); }} className="mt-3 text-blue-600 text-sm font-medium">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
        </div>
      )}
    </div>
  );
}
