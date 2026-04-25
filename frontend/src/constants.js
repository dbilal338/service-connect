export const CATEGORIES = [
  { id: 'bijli_mistri', label: 'Bijli Mistri', urdu: 'بجلی مستری', icon: '⚡', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  { id: 'plumber',      label: 'Plumber',      urdu: 'پلمبر',       icon: '🔧', bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200' },
  { id: 'carpenter',    label: 'Carpenter',    urdu: 'بڑھئی',       icon: '🪚', bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200' },
  { id: 'painter',      label: 'Painter',      urdu: 'پینٹر',       icon: '🎨', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  { id: 'ac_mechanic',  label: 'AC Mechanic',  urdu: 'اے سی میکینک', icon: '❄️', bg: 'bg-cyan-100',   text: 'text-cyan-700',   border: 'border-cyan-200' },
  { id: 'gardener',     label: 'Gardener',     urdu: 'مالی',         icon: '🌿', bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200' },
  { id: 'cleaner',      label: 'Cleaner',      urdu: 'صفائی والا',   icon: '🧹', bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-200' },
  { id: 'driver',       label: 'Driver',       urdu: 'ڈرائیور',      icon: '🚗', bg: 'bg-slate-100',  text: 'text-slate-700',  border: 'border-slate-200' },
  { id: 'cook',         label: 'Cook',         urdu: 'باورچی',       icon: '👨‍🍳', bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200' },
  { id: 'tutor',        label: 'Tutor',        urdu: 'استاد',        icon: '📚', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

export const formatPKR = (amount) => {
  if (amount === null || amount === undefined || amount === '') return 'Rs --';
  return `Rs ${Number(amount).toLocaleString('en-PK')}`;
};

export const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad', 'Sialkot', 'Hyderabad'];

export const ORDER_STATUS_FLOW = ['pending', 'quoted', 'accepted', 'in_progress', 'provider_done', 'confirmed'];
