import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const categories = ['Electrical', 'Plumbing', 'Internet', 'HVAC', 'Maintenance', 'Other'];
const priorities = ['Low', 'Medium', 'High'];

export default function ComplaintFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: categories[0],
    priority: 'Medium',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/complaints', form);
      setSubmitted(true);
      setTimeout(() => navigate(`/complaints/${response.data.data._id}`), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-view form-view">
      <div className="form-card">
        <div className="panel-header compact form-header">
          <div>
            <button type="button" className="back-link" onClick={() => navigate('/complaints')}>← Back to complaints</button>
            <p className="eyebrow">New complaint</p>
            <h1>Create Complaint</h1>
          </div>
        </div>

        <p className="form-subtitle">Tell us what went wrong and we will help get it resolved.</p>

        <form onSubmit={handleSubmit} className="complaint-form">
          <div className="field-section">
            <h3>Issue details</h3>

            <label>
              Title
              <input placeholder="e.g. AC not cooling in the office" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>

            <label>
              Description
              <textarea placeholder="Describe the problem in detail" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="5" required />
            </label>
          </div>

          <div className="two-column">
            <label>
              Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <label>
              Priority
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Location
            <input placeholder="e.g. Floor 2, Room 204" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </label>

          {error && <div className="error-box">{error}</div>}
          {submitted && <div className="success-box">✓ Complaint submitted successfully</div>}

          <div className="button-row">
            <button type="button" className="button button-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="button button-primary auth-submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit complaint'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
