import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function InstallPrompt() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const dismissed = localStorage.getItem('sc_install_dismissed');

  useEffect(() => {
    if (dismissed) return;
    const standalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (standalone) return;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window).MSStream;
    setIsIOS(ios);

    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setShow(true); };
    window.addEventListener('beforeinstallprompt', handler);

    if (ios) setTimeout(() => setShow(true), 4000);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShow(false);
      setDeferredPrompt(null);
    }
  };

  const dismiss = () => { setShow(false); localStorage.setItem('sc_install_dismissed', '1'); };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 slide-up" style={{ bottom: 'calc(4rem + var(--safe-bottom) + 12px)' }}>
      <div className="card shadow-xl border border-blue-100 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl">📱</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{t('installApp')}</p>
            <p className="text-blue-100 text-xs mt-0.5 leading-relaxed">
              {isIOS ? t('iosInstall') : t('installDesc')}
            </p>
          </div>
          <button onClick={dismiss} className="text-blue-200 hover:text-white text-xl leading-none flex-shrink-0 p-1">×</button>
        </div>
        {!isIOS && (
          <button
            onClick={install}
            className="mt-3 w-full bg-white text-blue-600 font-bold py-2.5 rounded-xl text-sm active:bg-blue-50 transition-colors"
          >
            {t('installBtn')} ✓
          </button>
        )}
      </div>
    </div>
  );
}
