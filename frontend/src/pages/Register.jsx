import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSubmitting(true);
    try {
      await register(name, email, password, role, phone, nationality, gender);
      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card p-8">
      <h2 className="text-2xl font-bold mb-6">Register</h2>
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm">
          Registration successful! Taking you to the home page…
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            required
            autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password (min 6)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input"
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone (optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
            placeholder="+91 xxxxxxxxxx"
            autoComplete="tel"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nationality (optional)</label>
          <input
            type="text"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="input"
            placeholder="e.g., Indian"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Gender (optional)</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="input"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-slate-600 text-sm">
        Already have an account? <Link to="/login" className="text-primary-600 font-medium">Login</Link>
      </p>
    </div>
  );
}
