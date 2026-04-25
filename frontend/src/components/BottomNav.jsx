import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

const HomeIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75v-5.25h-4.5V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
  </svg>
);
const SearchIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
  </svg>
);
const TagIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
  </svg>
);
const ChatIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);
const UserIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function BottomNav() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = () => axios.get('/api/chat/unread-count').then(r => setUnread(r.data.count)).catch(() => {});
    fetchUnread();
    const iv = setInterval(fetchUnread, 15000);
    return () => clearInterval(iv);
  }, [user]);

  const profilePath = user?.role === 'provider' ? '/provider-dashboard' : '/dashboard';

  const tabs = [
    { path: '/',         label: t('home'),    Icon: HomeIcon   },
    { path: '/browse',   label: t('browse'),  Icon: SearchIcon },
    { path: '/offers',   label: t('offers'),  Icon: TagIcon    },
    { path: '/chat',     label: t('chat'),    Icon: ChatIcon, badge: unread > 0 ? unread : null, requiresAuth: true },
    { path: profilePath, label: t('profile'), Icon: UserIcon,  requiresAuth: true },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      {tabs.map(({ path, label, Icon, badge, requiresAuth }) => {
        if (requiresAuth && !user) return null;
        const active = isActive(path);
        return (
          <NavLink
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              active ? 'text-green-600' : 'text-slate-400'
            }`}
          >
            {active && (
              <span className="absolute top-0 w-8 h-0.5 bg-green-500 rounded-full" style={{ borderRadius: '0 0 4px 4px' }} />
            )}
            <span className="relative">
              <Icon active={active} />
              {badge && (
                <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </span>
            <span className={`text-[10px] font-semibold leading-none ${active ? 'text-green-600' : 'text-slate-400'}`}>
              {label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
