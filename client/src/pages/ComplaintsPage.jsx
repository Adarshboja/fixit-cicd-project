import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

const initialFilters = { search: '', status: 'all', priority: 'all', category: 'all' };

export default function ComplaintsPage() {
  const location = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [state, setState] = useState({ loading: true, error: '' });

  const loadComplaints = async () => {
    setState({ loading: true, error: '' });
    try {
      const response = await api.get('/complaints');
      setComplaints(response.data.data || []);
    } catch (error) {
      setState({ loading: false, error: error.response?.status === 401 ? 'Your session has expired. Please log in again.' : 'Unable to connect to the server.' });
      return;
    }
    setState({ loading: false, error: '' });
  };

  useEffect(() => { loadComplaints(); }, []);

  const filtered = useMemo(() => complaints.filter((complaint) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch = !query || [complaint.title, complaint.category, complaint.location, complaint._id].some((value) => String(value || '').toLowerCase().includes(query));
    return matchesSearch && (filters.status === 'all' || complaint.status === filters.status) && (filters.priority === 'all' || complaint.priority === filters.priority) && (filters.category === 'all' || complaint.category === filters.category);
  }), [complaints, filters]);

  const categories = [...new Set(complaints.map((complaint) => complaint.category))];

  return (
    <section className="page-view">
      <div className="page-view-header">
        <div><p className="eyebrow">Workspace</p><h2>My complaints</h2><p className="page-description">Track every issue you have reported and follow its progress.</p></div>
        <Link className="button button-primary" to="/complaints/new">New complaint</Link>
      </div>
      <div className="panel-card filter-panel">
        <div className="filters-row">
          <input aria-label="Search my complaints" placeholder="Search title, category, location, or ID" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
          <select aria-label="Filter by status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="all">All statuses</option><option>Pending</option><option>In Progress</option><option>Resolved</option></select>
          <select aria-label="Filter by priority" value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}><option value="all">All priorities</option><option>Low</option><option>Medium</option><option>High</option></select>
          <select aria-label="Filter by category" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}><option value="all">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
          <button type="button" className="button button-secondary small" onClick={() => setFilters(initialFilters)}>Clear filters</button>
        </div>
      </div>
      <div className="panel-card">
        {state.loading ? <div className="skeleton-list"><span /><span /><span /></div> : state.error ? <div className="error-state"><h3>Could not load complaints</h3><p>{state.error}</p><button type="button" className="button button-secondary" onClick={loadComplaints}>Try again</button></div> : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">+</div><h3>{complaints.length ? 'No matching complaints' : 'No complaints yet'}</h3><p>{complaints.length ? 'Try adjusting your filters.' : 'Create your first complaint to start tracking service work.'}</p>{!complaints.length && <Link className="button button-primary" to="/complaints/new">Create complaint</Link>}</div> : <div className="complaint-list">{filtered.map((complaint) => <Link key={complaint._id} to={`/complaints/${complaint._id}`} className="complaint-row"><div className="complaint-meta"><span className="complaint-id">#{complaint._id.slice(-6)}</span><h3>{complaint.title}</h3></div><div className="complaint-info"><span>{complaint.category}</span><span>{complaint.location}</span></div><span className={`badge ${complaint.status.toLowerCase().replace(/\s+/g, '-')}`}>{complaint.status}</span><time>{new Date(complaint.createdAt).toLocaleDateString()}</time></Link>)}</div>}
      </div>
      <p className="results-count">Showing {filtered.length} of {complaints.length} complaints {location.pathname === '/complaints' ? '' : '.'}</p>
    </section>
  );
}
