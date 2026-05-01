import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect already-authenticated users (handles page refresh while logged in)
  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.role === 'provider' ? '/provider-dashboard' : '/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

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

  const quickLogin = (email) => setForm({ email, password: 'password123' });

  return (
    <div className="fade-in">
      {/* Branded header */}
      <div className="px-5 pt-8 pb-8 text-center" style={{ background: 'linear-gradient(160deg, #0f172a, #14532d)' }}>
        <img src="/logo.png" alt="Karigarr" className="h-20 w-auto mx-auto mb-3 rounded-2xl object-contain" style={{ boxShadow: '0 8px 24px rgba(22,163,74,0.4)' }} />
        <h1 className="text-white text-xl font-bold">{t('appName')}</h1>
        <p className="text-slate-400 text-sm mt-1">{t('tagline')}</p>
      </div>

      <div className="px-4 -mt-4">
        <div className="card">
          <h2 className="font-bold text-slate-900 text-lg mb-5">{t('login')}</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t('email')}</label>
              <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input" placeholder="ali@example.com" />
            </div>
            <div>
              <label className="label">{t('password')}</label>
              <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="input" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('loading')}
                </span>
              ) : t('login')}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-5 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a' }}>
            <p className="text-xs font-bold text-amber-800 mb-2">🎭 {t('demoCredentials')}</p>
            <button onClick={() => quickLogin('ali@demo.com')} className="w-full text-left text-xs text-amber-700 py-2 px-2.5 rounded-xl active:bg-amber-100 transition-colors flex items-center gap-2">
              🛠️ <span>{t('providerDemo')}</span>
            </button>
            <button onClick={() => quickLogin('ahmed@demo.com')} className="w-full text-left text-xs text-amber-700 py-2 px-2.5 rounded-xl active:bg-amber-100 transition-colors flex items-center gap-2">
              👤 <span>{t('consumerDemo')}</span>
            </button>
            <p className="text-[11px] text-amber-600 mt-1.5 px-2.5 font-semibold">{t('demoPassword')}</p>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            New here? <Link to="/register" className="text-green-600 font-bold">{t('register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
