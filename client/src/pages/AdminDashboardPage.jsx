import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'all', priority: 'all' });
  const [state, setState] = useState({ loading: true, error: '', action: '' });

  const fetchComplaints = async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const response = await api.get('/complaints');
      setComplaints(response.data.data || []);
      setState((current) => ({ ...current, loading: false }));
    } catch (error) {
      setState({ loading: false, error: 'Unable to connect to the server.', action: '' });
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const filtered = useMemo(() => complaints.filter((complaint) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch = !query || [complaint.title, complaint.category, complaint.location, complaint._id, complaint.createdBy?.name].some((value) => String(value || '').toLowerCase().includes(query));
    return matchesSearch && (filters.status === 'all' || complaint.status === filters.status) && (filters.priority === 'all' || complaint.priority === filters.priority);
  }), [complaints, filters]);

  const updateStatus = async (id, status) => {
    setState((current) => ({ ...current, action: id }));
    try {
      await api.put(`/complaints/${id}/status`, { status });
      await fetchComplaints();
    } catch (error) {
      setState((current) => ({ ...current, error: error.response?.status === 403 ? 'You do not have permission to perform this action.' : error.response?.data?.message || 'Unable to update status.' }));
    } finally { setState((current) => ({ ...current, action: '' })); }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm('Delete this complaint?')) return;
    setState((current) => ({ ...current, action: id }));
    try { await api.delete(`/complaints/${id}`); await fetchComplaints(); }
    catch (error) { setState((current) => ({ ...current, error: error.response?.data?.message || 'Unable to delete complaint.' })); }
    finally { setState((current) => ({ ...current, action: '' })); }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter((item) => item.status === 'Pending').length,
    inProgress: complaints.filter((item) => item.status === 'In Progress').length,
    resolved: complaints.filter((item) => item.status === 'Resolved').length,
    high: complaints.filter((item) => item.priority === 'High').length,
  };

  return <section className="page-view admin-view"><div className="page-view-header"><div><p className="eyebrow">Operations</p><h2>Admin dashboard</h2><p className="page-description">Review incoming reports, manage priority, and move each complaint through resolution.</p></div></div>{state.error && <div className="error-box">{state.error}</div>}<div className="stats-grid"><div className="kpi-card"><div className="kpi-head"><span className="kpi-icon blue" />Total</div><strong>{stats.total}</strong><small>All complaints</small></div><div className="kpi-card"><div className="kpi-head"><span className="kpi-icon amber" />Pending</div><strong>{stats.pending}</strong><small>Awaiting triage</small></div><div className="kpi-card"><div className="kpi-head"><span className="kpi-icon indigo" />In progress</div><strong>{stats.inProgress}</strong><small>Active work</small></div><div className="kpi-card"><div className="kpi-head"><span className="kpi-icon green" />Resolved</div><strong>{stats.resolved}</strong><small>Closed successfully</small></div><div className="kpi-card"><div className="kpi-head"><span className="kpi-icon red" />High priority</div><strong>{stats.high}</strong><small>Needs close attention</small></div></div><div className="panel-card"><div className="panel-header"><div><p className="eyebrow">Queue</p><h3>Complaint management</h3></div><div className="filters-row admin-filters"><input aria-label="Search all complaints" placeholder="Search complaints" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /><select aria-label="Admin status filter" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="all">All statuses</option><option>Pending</option><option>In Progress</option><option>Resolved</option></select><select aria-label="Admin priority filter" value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}><option value="all">All priorities</option><option>Low</option><option>Medium</option><option>High</option></select></div></div>{state.loading ? <div className="skeleton-list"><span /><span /><span /></div> : filtered.length === 0 ? <div className="empty-state"><h3>No complaints match these filters</h3><p>Try clearing a filter or wait for a new report.</p></div> : <div className="table-wrapper"><table><thead><tr><th>ID</th><th>Complaint</th><th>User</th><th>Priority</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>{filtered.map((complaint) => { const nextStatus = complaint.status === 'Pending' ? 'In Progress' : complaint.status === 'In Progress' ? 'Resolved' : null; return <tr key={complaint._id}><td>#{complaint._id.slice(-6)}</td><td><Link className="table-title-wrap" to={`/complaints/${complaint._id}`}><strong>{complaint.title}</strong><span>{complaint.category} · {complaint.location}</span></Link></td><td>{complaint.createdBy?.name || 'User'}</td><td><span className={`priority-pill ${complaint.priority.toLowerCase()}`}>{complaint.priority}</span></td><td><span className={`badge ${complaint.status.toLowerCase().replace(/\s+/g, '-')}`}>{complaint.status}</span></td><td>{new Date(complaint.createdAt).toLocaleDateString()}</td><td className="action-cell">{nextStatus && <button type="button" className="tiny-button" disabled={state.action === complaint._id} onClick={() => updateStatus(complaint._id, nextStatus)}>{state.action === complaint._id ? 'Saving...' : `→ ${nextStatus}`}</button>}<button type="button" className="tiny-button danger" disabled={state.action === complaint._id} onClick={() => deleteComplaint(complaint._id)}>Delete</button></td></tr>; })}</tbody></table></div>}</div></section>;
}
