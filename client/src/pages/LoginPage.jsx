import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppContext } from '../App';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AppContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', form);
      login(response.data.data);
      navigate(response.data.data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
          <p className="eyebrow">Operations, simplified</p>
          <h1>One place for every issue.</h1>
          <p className="auth-copy">
            Report problems, assign urgency, and keep service work moving with confidence.
          </p>
          <div className="auth-mini-grid">
            <div className="mini-metric">
              <strong>128</strong>
              <span>Open tickets</span>
            </div>
            <div className="mini-metric">
              <strong>24h</strong>
              <span>Avg. response</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2 className="eyebrow">Welcome back</h2>
            <h2>Sign in</h2>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>
              Password
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </label>

            <div className="auth-inline-row">
              <label className="checkbox-row">
                <input type="checkbox" readOnly />
                <span>Remember me</span>
              </label>
              <Link to="/register">Create account</Link>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="button button-primary auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            Need an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
