import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORIES, CITIES } from '../constants';

export default function Register() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') || 'consumer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    service_type: 'bijli_mistri', hourly_rate: '', description: '', years_experience: '', location: CITIES[0],
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register({ ...form, role, hourly_rate: Number(form.hourly_rate), years_experience: Number(form.years_experience) });
      navigate(user.role === 'provider' ? '/provider-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || t('error'));
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      {/* Branded header */}
      <div className="px-5 pt-7 pb-7 text-center" style={{ background: 'linear-gradient(160deg, #0f172a, #14532d)' }}>
        <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white font-black text-lg mx-auto mb-2.5" style={{ boxShadow: '0 8px 24px rgba(22,163,74,0.4)' }}>SC</div>
        <h1 className="text-white text-lg font-bold">{t('register')}</h1>
        <p className="text-slate-400 text-xs mt-0.5">{t('tagline')}</p>
      </div>

      <div className="px-4 -mt-4 pb-6">
        <div className="card">
          {/* Role Toggle */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-5">
            <button type="button" onClick={() => setRole('consumer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                role === 'consumer' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'
              }`}>
              👤 {t('customer')}
            </button>
            <button type="button" onClick={() => setRole('provider')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                role === 'provider' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'
              }`}>
              🛠️ {t('provider')}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t('name')}</label>
              <input required value={form.name} onChange={set('name')} className="input" placeholder="Muhammad Ali" />
            </div>
            <div>
              <label className="label">{t('phone')}</label>
              <input value={form.phone} onChange={set('phone')} className="input" placeholder="0300-1234567" />
            </div>
            <div>
              <label className="label">{t('email')}</label>
              <input type="email" required value={form.email} onChange={set('email')} className="input" placeholder="ali@example.com" />
            </div>
            <div>
              <label className="label">{t('password')}</label>
              <input type="password" required minLength={6} value={form.password} onChange={set('password')} className="input" placeholder="Min 6 characters" />
            </div>

            {role === 'provider' && (
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">🛠️ Professional Details</p>
                <div>
                  <label className="label">{t('serviceType')}</label>
                  <select value={form.service_type} onChange={set('service_type')} className="input">
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">{t('hourlyRate')}</label>
                  <input type="number" required value={form.hourly_rate} onChange={set('hourly_rate')} className="input" placeholder="e.g. 800" min="0" />
                </div>
                <div>
                  <label className="label">{t('city')}</label>
                  <select value={form.location} onChange={set('location')} className="input">
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{t('experience2')}</label>
                  <input type="number" value={form.years_experience} onChange={set('years_experience')} className="input" placeholder="5" min="0" />
                </div>
                <div>
                  <label className="label">{t('bio')}</label>
                  <textarea value={form.description} onChange={set('description')} className="input resize-none" rows={3}
                    placeholder="Tell clients about your experience..." />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('loading')}
                </span>
              ) : t('register')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account? <Link to="/login" className="text-green-600 font-bold">{t('login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
