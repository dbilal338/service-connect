import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Login() {
  const { login, loginWithGoogle, user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const user = await loginWithGoogle();
      navigate(user.role === 'provider' ? '/provider-dashboard' : '/dashboard');
    } catch (err) {
      if (!['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(err.code)) {
        setError(err.response?.data?.error || err.message || 'Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

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

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold text-slate-700 active:bg-slate-50 transition-colors shadow-sm"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {googleLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

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
