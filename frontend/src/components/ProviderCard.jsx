import { Link } from 'react-router-dom';

const SERVICE_ICONS = {
  'Electrician': '⚡',
  'Plumber': '🔧',
  'Carpenter': '🪚',
  'Painter': '🎨',
  'HVAC Technician': '❄️',
  'Locksmith': '🔑',
  'Cleaner': '🧹',
  'Gardener': '🌱',
};

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-sm ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProviderCard({ provider }) {
  const icon = SERVICE_ICONS[provider.service_type] || '🛠️';
  const initials = provider.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{provider.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg">{icon}</span>
                <span className="text-blue-600 font-medium text-sm">{provider.service_type}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-bold text-gray-900">${provider.hourly_rate}<span className="text-sm font-normal text-gray-500">/hr</span></p>
              <span className={`badge ${provider.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {provider.is_available ? '● Available' : '● Busy'}
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <Stars rating={provider.rating} />
            <span className="text-sm text-gray-500">({provider.total_reviews} reviews)</span>
          </div>

          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{provider.description}</p>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>📍 {provider.location}</span>
              <span>🏆 {provider.years_experience}y exp</span>
            </div>
            <Link to={`/providers/${provider.id}`} className="btn-primary text-sm py-1.5 px-4">
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
