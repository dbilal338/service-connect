import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const rootPaths = ['/', '/browse', '/offers', '/chat', '/dashboard', '/provider-dashboard', '/login', '/register'];
  const isRoot = rootPaths.some(p => location.pathname === p);
  const showBack = !isRoot;

  const getTitle = () => {
    const p = location.pathname;
    if (p === '/') return t('appName');
    if (p.startsWith('/browse')) return t('browse');
    if (p.startsWith('/offers')) return t('fixedPriceServices');
    if (p.startsWith('/chat')) return t('conversations');
    if (p.startsWith('/dashboard')) return t('myOrders');
    if (p.startsWith('/provider-dashboard')) return t('profile');
    if (p.startsWith('/orders/')) return t('orderDetail');
    if (p.startsWith('/providers/')) return t('profile');
    if (p.startsWith('/login')) return t('login');
    if (p.startsWith('/register')) return t('register');
    return t('appName');
  };

  return (
    <header className="top-bar">
      {showBack ? (
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0 active:bg-slate-200 transition-colors">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      ) : (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white font-black text-xs select-none">SC</div>
        </div>
      )}

      <h1 className="flex-1 font-bold text-slate-900 text-[15px] text-center truncate px-2">{getTitle()}</h1>

      <div className="flex items-center gap-2 flex-shrink-0">
        {!user && !['/login', '/register'].includes(location.pathname) && (
          <button onClick={() => navigate('/login')} className="text-xs font-bold text-white bg-green-600 px-3 py-1.5 rounded-lg active:bg-green-700">
            {t('login')}
          </button>
        )}
      </div>
    </header>
  );
}
