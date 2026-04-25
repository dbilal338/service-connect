import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProviderCard from '../components/ProviderCard';

const SERVICES = ['All', 'Electrician', 'Plumber', 'Carpenter', 'Painter', 'HVAC Technician', 'Locksmith', 'Cleaner', 'Gardener'];
const SERVICE_ICONS = { 'Electrician':'⚡','Plumber':'🔧','Carpenter':'🪚','Painter':'🎨','HVAC Technician':'❄️','Locksmith':'🔑','Cleaner':'🧹','Gardener':'🌱','All':'🛠️' };

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('service') || 'All');
  const [maxRate, setMaxRate] = useState('');

  const fetchProviders = async (service, rate) => {
    setLoading(true);
    try {
      const params = {};
      if (service && service !== 'All') params.service_type = service;
      if (rate) params.max_rate = rate;
      const r = await axios.get('/api/providers', { params });
      setProviders(r.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(filter, maxRate); }, [filter]);

  const handleFilter = (s) => {
    setFilter(s);
    setSearchParams(s !== 'All' ? { service: s } : {});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Find Service Professionals</h1>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-6">
        {SERVICES.map(s => (
          <button key={s} onClick={() => handleFilter(s)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              filter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}>
            <span>{SERVICE_ICONS[s]}</span> {s}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Max rate:</label>
          <input type="number" value={maxRate} onChange={e => setMaxRate(e.target.value)} placeholder="Any"
            className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="text-sm text-gray-500">/hr</span>
          <button onClick={() => fetchProviders(filter, maxRate)} className="btn-primary text-sm py-1.5 px-4">Filter</button>
        </div>
        <span className="text-sm text-gray-500 ml-auto">{providers.length} professional{providers.length !== 1 ? 's' : ''} found</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-medium">No professionals found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
        </div>
      )}
    </div>
  );
}
