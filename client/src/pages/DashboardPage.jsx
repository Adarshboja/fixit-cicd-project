import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function DashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', search: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get('/complaints');
        setComplaints(response.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus = filters.status === 'all' || complaint.status === filters.status;
    const matchesPriority = filters.priority === 'all' || complaint.priority === filters.priority;
    const matchesSearch =
      complaint.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      complaint.description.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter((item) => item.status === 'Pending').length,
    inProgress: complaints.filter((item) => item.status === 'In Progress').length,
    resolved: complaints.filter((item) => item.status === 'Resolved').length,
  };

  return (
    <section className="page-view dashboard-view">
      <div className="page-view-header">
        <div><p className="eyebrow">Overview</p><h2>Your dashboard</h2><p className="page-description">A live view of your service requests and current resolution progress.</p></div>
        <Link className="button button-primary" to="/complaints/new">Create complaint</Link>
      </div>
        <section className="stats-grid">
          <div className="kpi-card">
            <div className="kpi-head"><span className="kpi-icon blue">◉</span><span>Total</span></div>
            <strong>{stats.total}</strong>
            <small>Across all complaints</small>
          </div>
          <div className="kpi-card">
            <div className="kpi-head"><span className="kpi-icon amber">◉</span><span>Pending</span></div>
            <strong>{stats.pending}</strong>
            <small>Needing attention</small>
          </div>
          <div className="kpi-card">
            <div className="kpi-head"><span className="kpi-icon indigo">◉</span><span>In progress</span></div>
            <strong>{stats.inProgress}</strong>
            <small>Currently active</small>
          </div>
          <div className="kpi-card">
            <div className="kpi-head"><span className="kpi-icon green">◉</span><span>Resolved</span></div>
            <strong>{stats.resolved}</strong>
            <small>Completed successfully</small>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel-card panel-large">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Recent complaints</p>
                <h2>Latest activity</h2>
              </div>
              <Link className="button button-primary small" to="/complaints/new">Create complaint</Link>
            </div>

            {loading ? (
              <div className="skeleton-list">
                <span />
                <span />
                <span />
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">+</div>
                <h3>No complaints yet</h3>
                <p>Create your first complaint and track it here.</p>
                <Link className="button button-primary" to="/complaints/new">Create Complaint</Link>
              </div>
            ) : (
              <div className="complaint-list">
                {filteredComplaints.slice(0, 5).map((complaint) => (
                  <Link key={complaint._id} to={`/complaints/${complaint._id}`} className="complaint-row">
                    <div className="complaint-meta">
                      <span className="complaint-id">#{complaint._id.slice(-6)}</span>
                      <h3>{complaint.title}</h3>
                    </div>
                    <div className="complaint-info">
                      <span>{complaint.category}</span>
                      <span>{complaint.priority}</span>
                    </div>
                    <div className="complaint-status-wrap">
                      <span className={`badge ${complaint.status.toLowerCase().replace(/\s+/g, '-')}`}>{complaint.status}</span>
                    </div>
                    <time>{new Date(complaint.createdAt).toLocaleDateString()}</time>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="panel-card panel-aside">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Summary</p>
                <h2>Status breakdown</h2>
              </div>
            </div>

            <div className="summary-list">
              <div className="summary-row">
                <span className="status-indicator pending" />
                <span>Pending</span>
                <strong>{stats.pending}</strong>
              </div>
              <div className="summary-row">
                <span className="status-indicator in-progress" />
                <span>In Progress</span>
                <strong>{stats.inProgress}</strong>
              </div>
              <div className="summary-row">
                <span className="status-indicator resolved" />
                <span>Resolved</span>
                <strong>{stats.resolved}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="panel-card full-width-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Operations</p>
              <h2>Complaint queue</h2>
            </div>
            <div className="table-controls">
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="all">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
                <option value="all">All priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Complaint</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint._id}>
                    <td>#{complaint._id.slice(-6)}</td>
                    <td>
                      <div className="table-title-wrap">
                        <strong>{complaint.title}</strong>
                        <span>{complaint.location}</span>
                      </div>
                    </td>
                    <td>{complaint.category}</td>
                    <td>
                      <span className={`priority-pill ${complaint.priority.toLowerCase()}`}>{complaint.priority}</span>
                    </td>
                    <td>
                      <span className={`badge ${complaint.status.toLowerCase().replace(/\s+/g, '-')}`}>{complaint.status}</span>
                    </td>
                    <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/complaints/${complaint._id}`} className="link-button">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
    </section>
  );
}
