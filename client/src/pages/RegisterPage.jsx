import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppContext } from '../App';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useContext(AppContext);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', form);
      login(response.data.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-visual">
          <div className="brand-row auth-brand-row">
            <div className="brand-mark">F</div>
            <span className="brand-name">FixIt</span>
          </div>
          <p className="eyebrow">Built for speed</p>
          <h1>Get your workspace ready.</h1>
          <p className="auth-copy">
            Sign up for a clean complaint workflow that keeps reporting, tracking, and resolution in one place.
          </p>
          <div className="auth-mini-grid">
            <div className="mini-metric">
              <strong>3 steps</strong>
              <span>Submit, track, resolve</span>
            </div>
            <div className="mini-metric">
              <strong>100%</strong>
              <span>Clear visibility</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <p className="eyebrow">Create account</p>
            <h2>Join FixIt</h2>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>
              Password
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </label>

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="button button-primary auth-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
