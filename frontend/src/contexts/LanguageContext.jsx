import { createContext, useContext } from 'react';

const STRINGS = {
  appName: 'Karigarr', tagline: "Pakistan's #1 Service Marketplace",
  home: 'Home', browse: 'Browse', orders: 'Orders', chat: 'Messages', profile: 'Profile',
  offers: 'Packages', myOffers: 'My Packages',
  searchPlaceholder: 'Search Bijli Mistri, Plumber...', search: 'Search',
  popularServices: 'Popular Services', nearbyProviders: 'Top Providers',
  viewAll: 'View All', bookNow: 'Book Now', callNow: 'Call', chatNow: 'Message',
  available: 'Available', notAvailable: 'Busy',
  perVisit: '/visit', perHour: '/hr', perDay: '/day', experience: 'yrs',
  myOrders: 'My Orders', newOrder: 'New Booking', active: 'Active',
  completed: 'Completed', cancelled: 'Cancelled', pending: 'Pending',
  conversations: 'Messages', typeMessage: 'Type a message...', send: 'Send',
  noConversations: 'No messages yet. Book a service to start chatting!',
  fixedPriceServices: 'Fixed Price Services',
  addPackage: 'Add Package', packageTitle: 'Package Title', packageDesc: 'Description',
  packagePrice: 'Price (Rs)', packageCategory: 'Category',
  login: 'Sign In', register: 'Create Account', logout: 'Sign Out',
  email: 'Email Address', password: 'Password', name: 'Full Name', phone: 'Phone Number',
  customer: 'Customer', provider: 'Service Provider',
  serviceType: 'Service Type', hourlyRate: 'Rate (Rs / visit)', city: 'City',
  experience2: 'Years of Experience', bio: 'About Me',
  loading: 'Loading...', error: 'Something went wrong',
  save: 'Save Changes', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
  currency: 'Rs',
  bijli_mistri: 'Bijli Mistri', plumber: 'Plumber', carpenter: 'Carpenter',
  painter: 'Painter', ac_mechanic: 'AC Mechanic', gardener: 'Gardener',
  cleaner: 'Cleaner', driver: 'Driver', cook: 'Cook', tutor: 'Tutor',
  status_pending: 'Awaiting Quote', status_quoted: 'Quote Sent',
  status_accepted: 'Confirmed', status_in_progress: 'In Progress',
  status_provider_done: 'Work Done', status_confirmed: 'Completed', status_cancelled: 'Cancelled',
  sendQuote: 'Send Quote', acceptAndPay: 'Accept & Confirm',
  startWork: 'Start Work', markComplete: 'Mark Complete', confirmDone: 'Confirm Done',
  leaveReview: 'Leave a Review', cancelOrder: 'Cancel Order', quotedPrice: 'Quoted Price',
  address: 'Address', scheduledDate: 'Preferred Date', description: 'Job Description',
  submitRating: 'Submit Review',
  installApp: 'Get the App', installDesc: 'Add to home screen for the full app experience',
  installBtn: 'Install Now', iosInstall: 'Tap Share → "Add to Home Screen"',
  howItWorks: 'How It Works',
  step1Title: 'Find a Pro', step1Desc: 'Browse verified professionals near you',
  step2Title: 'Book Instantly', step2Desc: 'Pick a time and confirm in seconds',
  step3Title: 'Job Done', step3Desc: 'Professional comes to your doorstep',
  joinAsProvider: 'Earn with Your Skills', joinDesc: 'Join thousands of earners on Karigarr',
  signUpNow: 'Get Started Free',
  demoCredentials: 'Demo Accounts',
  providerDemo: 'Provider: ali@demo.com', consumerDemo: 'Customer: ahmed@demo.com',
  demoPassword: 'Password: password123',
  noProviders: 'No providers found', noOrders: 'No orders yet',
  filter: 'Filter', allCategories: 'All Services', maxRate: 'Max Rate (Rs)',
  orderDetail: 'Order Details', finalPrice: 'Final Price (Rs)',
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const t = (key) => STRINGS[key] ?? key;
  return (
    <LanguageContext.Provider value={{ t, lang: 'en', isUrdu: false }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
