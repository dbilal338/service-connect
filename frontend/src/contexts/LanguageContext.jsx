import { createContext, useContext, useState, useEffect } from 'react';

const T = {
  en: {
    appName: 'Service Connect', tagline: "Pakistan's #1 Service Marketplace",
    home: 'Home', browse: 'Browse', orders: 'Orders', chat: 'Chat', profile: 'Profile',
    offers: 'Packages', myOffers: 'My Packages',
    searchPlaceholder: 'Search Bijli Mistri, Plumber...', search: 'Search',
    popularServices: 'Popular Services', nearbyProviders: 'Top Providers',
    viewAll: 'View All', bookNow: 'Book Now', callNow: 'Call Now', chatNow: 'Chat',
    available: 'Available', notAvailable: 'Not Available',
    perVisit: '/visit', perHour: '/hr', perDay: '/day', experience: 'yrs exp',
    rating: 'Rating', reviews: 'reviews',
    myOrders: 'My Orders', newOrder: 'New Order', active: 'Active',
    completed: 'Completed', cancelled: 'Cancelled', pending: 'Pending',
    conversations: 'Messages', typeMessage: 'Type a message...', send: 'Send',
    noConversations: 'No conversations yet. Start by booking a service!',
    fixedPriceServices: 'Fixed Price Services', bookAtFixedPrice: 'Book at Fixed Price',
    addPackage: 'Add Service Package', packageTitle: 'Package Title', packageDesc: 'Description',
    packagePrice: 'Fixed Price (Rs)', packageCategory: 'Category',
    login: 'Login', register: 'Sign Up', logout: 'Logout',
    email: 'Email Address', password: 'Password', name: 'Full Name', phone: 'Phone Number',
    iAmA: 'I am a...', customer: 'Customer', provider: 'Service Provider',
    serviceType: 'Service Type', hourlyRate: 'Rate (Rs/visit)', city: 'City',
    experience2: 'Years Experience', bio: 'About Me',
    loading: 'Loading...', error: 'Something went wrong', tryAgain: 'Try Again',
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
    confirm: 'Confirm', back: 'Back', close: 'Close', next: 'Next',
    or: 'or', and: 'and', for: 'for',
    currency: 'Rs',
    bijli_mistri: 'Bijli Mistri', plumber: 'Plumber', carpenter: 'Carpenter',
    painter: 'Painter', ac_mechanic: 'AC Mechanic', gardener: 'Gardener',
    cleaner: 'Cleaner', driver: 'Driver', cook: 'Cook', tutor: 'Tutor',
    // Order status
    status_pending: 'New Request', status_quoted: 'Quote Sent', status_accepted: 'Accepted',
    status_in_progress: 'In Progress', status_provider_done: 'Work Done', status_confirmed: 'Completed',
    status_cancelled: 'Cancelled',
    // Order actions
    sendQuote: 'Send Quote', acceptAndPay: 'Accept & Pay', startWork: 'Start Work',
    markComplete: 'Mark Complete', confirmDone: 'Confirm Done', leaveReview: 'Leave Review',
    cancelOrder: 'Cancel Order', quotedPrice: 'Quoted Price',
    address: 'Address', scheduledDate: 'Scheduled Date', description: 'Description',
    submitRating: 'Submit Rating',
    // Install prompt
    installApp: 'Install App', installDesc: 'Add to home screen for the best experience',
    installBtn: 'Install', iosInstall: 'Tap the share button then "Add to Home Screen"',
    howItWorks: 'How It Works',
    step1Title: 'Find a Provider', step1Desc: 'Browse verified local professionals',
    step2Title: 'Book Service', step2Desc: 'Choose a time and confirm booking',
    step3Title: 'Get It Done', step3Desc: 'Professional comes to your doorstep',
    joinAsProvider: 'Join as a Provider', joinDesc: 'Start earning by offering your skills',
    signUpNow: 'Sign Up Now',
    demoCredentials: 'Demo Credentials',
    providerDemo: 'Provider: ali@demo.com', consumerDemo: 'Customer: ahmed@demo.com',
    demoPassword: 'Password: password123',
    noProviders: 'No providers found', noOrders: 'No orders yet',
    filter: 'Filter', allCategories: 'All Services', maxRate: 'Max Rate (Rs)',
    orderDetail: 'Order Detail', orderProgress: 'Progress',
    finalPrice: 'Final Price (Rs)',
  },
  ur: {
    appName: 'سروس کنیکٹ', tagline: 'پاکستان کا نمبر ون سروس مارکیٹ',
    home: 'گھر', browse: 'تلاش', orders: 'آرڈرز', chat: 'بات چیت', profile: 'پروفائل',
    offers: 'پیکجز', myOffers: 'میرے پیکجز',
    searchPlaceholder: 'بجلی مستری، پلمبر تلاش کریں...', search: 'تلاش',
    popularServices: 'مقبول خدمات', nearbyProviders: 'بہترین فراہم کنندگان',
    viewAll: 'سب دیکھیں', bookNow: 'ابھی بک کریں', callNow: 'ابھی کال کریں', chatNow: 'چیٹ',
    available: 'دستیاب', notAvailable: 'دستیاب نہیں',
    perVisit: '/وزٹ', perHour: '/گھنٹہ', perDay: '/دن', experience: 'سال تجربہ',
    rating: 'ریٹنگ', reviews: 'تجزیے',
    myOrders: 'میرے آرڈرز', newOrder: 'نیا آرڈر', active: 'فعال',
    completed: 'مکمل', cancelled: 'منسوخ', pending: 'زیر التواء',
    conversations: 'پیغامات', typeMessage: 'پیغام لکھیں...', send: 'بھیجیں',
    noConversations: 'ابھی کوئی گفتگو نہیں۔ خدمت بک کر کے شروع کریں!',
    fixedPriceServices: 'مقررہ قیمت خدمات', bookAtFixedPrice: 'مقررہ قیمت پر بک کریں',
    addPackage: 'پیکج شامل کریں', packageTitle: 'پیکج کا نام', packageDesc: 'تفصیل',
    packagePrice: 'قیمت (روپے)', packageCategory: 'زمرہ',
    login: 'لاگ ان', register: 'رجسٹر کریں', logout: 'لاگ آؤٹ',
    email: 'ای میل', password: 'پاس ورڈ', name: 'پورا نام', phone: 'فون نمبر',
    iAmA: 'میں ہوں...', customer: 'گاہک', provider: 'خدمت فراہم کنندہ',
    serviceType: 'خدمت کی قسم', hourlyRate: 'ریٹ (روپے/وزٹ)', city: 'شہر',
    experience2: 'سال تجربہ', bio: 'میرے بارے میں',
    loading: 'لوڈ ہو رہا ہے...', error: 'کچھ غلط ہو گیا', tryAgain: 'دوبارہ کوشش',
    save: 'محفوظ کریں', cancel: 'منسوخ', delete: 'حذف', edit: 'ترمیم',
    confirm: 'تصدیق', back: 'واپس', close: 'بند', next: 'آگے',
    or: 'یا', and: 'اور', for: 'کے لیے',
    currency: 'روپے',
    bijli_mistri: 'بجلی مستری', plumber: 'پلمبر', carpenter: 'بڑھئی',
    painter: 'پینٹر', ac_mechanic: 'اے سی میکینک', gardener: 'مالی',
    cleaner: 'صفائی والا', driver: 'ڈرائیور', cook: 'باورچی', tutor: 'استاد',
    status_pending: 'نئی درخواست', status_quoted: 'کوٹ بھیجا', status_accepted: 'قبول کیا',
    status_in_progress: 'کام جاری', status_provider_done: 'کام مکمل', status_confirmed: 'تصدیق شدہ',
    status_cancelled: 'منسوخ',
    sendQuote: 'کوٹ بھیجیں', acceptAndPay: 'قبول کریں', startWork: 'کام شروع کریں',
    markComplete: 'مکمل کریں', confirmDone: 'تصدیق کریں', leaveReview: 'تجزیہ دیں',
    cancelOrder: 'آرڈر منسوخ کریں', quotedPrice: 'کوٹ قیمت',
    address: 'پتہ', scheduledDate: 'تاریخ', description: 'تفصیل',
    submitRating: 'ریٹنگ جمع کریں',
    installApp: 'ایپ انسٹال کریں', installDesc: 'بہترین تجربے کے لیے ہوم اسکرین پر شامل کریں',
    installBtn: 'انسٹال کریں', iosInstall: 'شیئر بٹن دبائیں پھر "Add to Home Screen" منتخب کریں',
    howItWorks: 'کیسے کام کرتا ہے',
    step1Title: 'فراہم کنندہ تلاش کریں', step1Desc: 'مقامی ماہرین تلاش کریں',
    step2Title: 'خدمت بک کریں', step2Desc: 'وقت منتخب کریں اور بک کریں',
    step3Title: 'کام مکمل ہو', step3Desc: 'ماہر آپ کے گھر آتا ہے',
    joinAsProvider: 'فراہم کنندہ بنیں', joinDesc: 'اپنی مہارت سے کمائیں',
    signUpNow: 'ابھی رجسٹر کریں',
    demoCredentials: 'ڈیمو اکاؤنٹ',
    providerDemo: 'فراہم کنندہ: ali@demo.com', consumerDemo: 'گاہک: ahmed@demo.com',
    demoPassword: 'پاس ورڈ: password123',
    noProviders: 'کوئی فراہم کنندہ نہیں', noOrders: 'ابھی کوئی آرڈر نہیں',
    filter: 'فلٹر', allCategories: 'تمام خدمات', maxRate: 'زیادہ سے زیادہ قیمت',
    orderDetail: 'آرڈر تفصیل', orderProgress: 'پیشرفت',
    finalPrice: 'آخری قیمت (روپے)',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('sc_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('sc_lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ur' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang === 'ur' ? 'ur' : 'en');
  }, [lang]);

  const t = (key) => T[lang][key] ?? T.en[key] ?? key;
  const toggleLang = () => setLang(l => l === 'en' ? 'ur' : 'en');

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, isUrdu: lang === 'ur' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
