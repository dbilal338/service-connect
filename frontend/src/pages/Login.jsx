import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'provider' ? '/provider-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || t('error'));
    } finally { setLoading(false); }
  };

  const quickLogin = (email) => setForm(p => ({ ...p, email, password: 'password123' }));

  return (
    <div className="page py-8 fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-3">SC</div>
        <h1 className="text-xl font-bold text-slate-900">{t('appName')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('tagline')}</p>
      </div>

      <div className="card">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">{t('email')}</label>
            <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="input" placeholder="ali@example.com" />
          </div>
          <div>
            <label className="input-label">{t('password')}</label>
            <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('loading')}</span>
            ) : t('login')}
          </button>
        </form>

        <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-bold text-amber-800 mb-2">🎭 {t('demoCredentials')}</p>
          <button onClick={() => quickLogin('ali@demo.com')} className="w-full text-left text-xs text-amber-700 py-1.5 px-2 rounded-lg active:bg-amber-100 transition-colors">
            🛠️ {t('providerDemo')}
          </button>
          <button onClick={() => quickLogin('ahmed@demo.com')} className="w-full text-left text-xs text-amber-700 py-1.5 px-2 rounded-lg active:bg-amber-100 transition-colors">
            👤 {t('consumerDemo')}
          </button>
          <p className="text-[11px] text-amber-600 mt-1 px-2">{t('demoPassword')}</p>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          {t('or')} <Link to="/register" className="text-blue-600 font-semibold">{t('register')}</Link>
        </p>
      </div>
    </div>
  );
}
