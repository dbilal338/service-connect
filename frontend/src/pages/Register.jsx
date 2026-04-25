import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SERVICES = ['Electrician','Plumber','Carpenter','Painter','HVAC Technician','Locksmith','Cleaner','Gardener'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') || 'consumer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    service_type: 'Electrician', hourly_rate: '', description: '', years_experience: '', location: ''
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register({ ...form, role, hourly_rate: Number(form.hourly_rate), years_experience: Number(form.years_experience) });
      navigate(user.role === 'provider' ? '/provider-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-5xl">🔧</span>
          <h1 className="text-2xl font-bold mt-3">Create your account</h1>
        </div>

        <div className="card">
          {/* Role Toggle */}
          <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
            <button type="button" onClick={() => setRole('consumer')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${role === 'consumer' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              👤 I need services
            </button>
            <button type="button" onClick={() => setRole('provider')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${role === 'provider' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              🛠️ I provide services
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required value={form.name} onChange={set('name')} className="input" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input value={form.phone} onChange={set('phone')} className="input" placeholder="+1-555-0000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={set('email')} className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required minLength={6} value={form.password} onChange={set('password')} className="input" placeholder="Min 6 characters" />
            </div>

            {role === 'provider' && (
              <>
                <div className="border-t pt-4 mt-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Professional Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                      <select value={form.service_type} onChange={set('service_type')} className="input">
                        {SERVICES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                      <input type="number" required value={form.hourly_rate} onChange={set('hourly_rate')} className="input" placeholder="75" min="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years Experience</label>
                      <input type="number" value={form.years_experience} onChange={set('years_experience')} className="input" placeholder="5" min="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input value={form.location} onChange={set('location')} className="input" placeholder="Downtown" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Description</label>
                    <textarea value={form.description} onChange={set('description')} className="input resize-none" rows={3} placeholder="Tell clients about your experience and skills..." />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
