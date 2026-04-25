import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const SERVICES = [
  { name: 'Electrician', icon: '⚡', desc: 'Wiring, panels, smart home' },
  { name: 'Plumber', icon: '🔧', desc: 'Pipes, leaks, installations' },
  { name: 'Carpenter', icon: '🪚', desc: 'Furniture, cabinets, flooring' },
  { name: 'Painter', icon: '🎨', desc: 'Interior & exterior painting' },
  { name: 'HVAC Technician', icon: '❄️', desc: 'AC, heating, ventilation' },
  { name: 'Locksmith', icon: '🔑', desc: 'Locks, security, lockouts' },
  { name: 'Cleaner', icon: '🧹', desc: 'Deep clean, regular service' },
  { name: 'Gardener', icon: '🌱', desc: 'Lawn care, landscaping' },
];

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Find Trusted Local Professionals
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Connect with verified electricians, plumbers, carpenters and more in your area. Get quotes, pay securely, and confirm when the job is done.
          </p>
          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="What service do you need?"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button type="submit" className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Service Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">Browse by Service</h2>
        <p className="text-center text-gray-500 mb-10">Tap a category to find professionals near you</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SERVICES.map(s => (
            <Link key={s.name} to={`/browse?service=${encodeURIComponent(s.name)}`}
              className="card hover:shadow-md hover:border-blue-200 transition-all text-center cursor-pointer group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">{s.icon}</div>
              <h3 className="font-semibold text-gray-900">{s.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-900">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '🔍', title: 'Find a Pro', desc: 'Browse verified professionals, check ratings, and view hourly rates.' },
              { step: '2', icon: '💬', title: 'Get a Quote', desc: 'Request service, receive a custom quote, and pay securely online.' },
              { step: '3', icon: '✅', title: 'Confirm & Done', desc: 'You control when the job is complete — confirm when satisfied.' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Are you a professional?</h2>
        <p className="text-gray-500 mb-6 max-w-xl mx-auto">Join hundreds of service providers already growing their business on ServiceConnect. Set your own rates and manage your schedule.</p>
        <Link to="/register?role=provider" className="btn-primary text-base px-8 py-3 inline-block">
          Join as a Provider
        </Link>
      </section>
    </div>
  );
}
