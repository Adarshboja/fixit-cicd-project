import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useContext } from 'react';
import { AppContext } from '../App';

const steps = ['Created', 'Pending', 'In Progress', 'Resolved'];

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AppContext);
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await api.get(`/complaints/${id}`);
        setComplaint(response.data.data);
        setStatus(response.data.data.status);
      } catch (error) {
        setError(error.response?.status === 404 ? 'Complaint not found.' : error.response?.status === 403 ? 'You do not have permission to view this complaint.' : 'Unable to connect to the server.');
      }
    };

    fetchComplaint();
  }, [id]);

  if (error) return <section className="page-view"><div className="error-state"><h2>{error}</h2><button type="button" className="button button-secondary" onClick={() => navigate('/complaints')}>Back to complaints</button></div></section>;
  if (!complaint) return <section className="page-view"><div className="detail-card skeleton-detail"><span /></div></section>;

  const activeIndex = steps.indexOf(complaint.status);

  const updateStatus = async () => {
    setSaving(true);
    try {
      const response = await api.put(`/complaints/${id}/status`, { status });
      setComplaint(response.data.data);
    } catch (requestError) {
      setError(requestError.response?.status === 403 ? 'You do not have permission to perform this action.' : requestError.response?.data?.message || 'Unable to update status.');
    } finally { setSaving(false); }
  };

  return (
    <section className="page-view complaint-detail-view">
      <div className="detail-card">
        <div className="detail-topbar">
          <button type="button" className="button button-secondary small" onClick={() => navigate('/complaints')}>← Back to complaints</button>
          <span className="detail-breadcrumb">Dashboard / Complaints / #{complaint._id.slice(-6)}</span>
        </div>

        <div className="detail-header-row">
          <div>
            <p className="eyebrow">Complaint details</p>
            <h1>{complaint.title}</h1>
          </div>
          <div className="detail-status-wrap">
            <span className={`badge ${complaint.status.toLowerCase().replace(/\s+/g, '-')}`}>{complaint.status}</span>
            <span className={`priority-pill ${complaint.priority.toLowerCase()}`}>{complaint.priority}</span>
          </div>
        </div>

        <div className="detail-content-grid">
          <div className="detail-main-panel">
            <div className="field-box">
              <p className="field-label">Description</p>
              <p className="field-value">{complaint.description}</p>
            </div>

            <div className="info-grid">
              <div className="mini-info-box">
                <p className="field-label">Category</p>
                <p className="field-value strong">{complaint.category}</p>
              </div>
              <div className="mini-info-box">
                <p className="field-label">Created by</p>
                <p className="field-value strong">{complaint.createdBy?.name || 'You'}</p>
              </div>
              <div className="mini-info-box">
                <p className="field-label">Location</p>
                <p className="field-value strong">{complaint.location}</p>
              </div>
              <div className="mini-info-box">
                <p className="field-label">Created</p>
                <p className="field-value strong">{new Date(complaint.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="mini-info-box">
                <p className="field-label">Last updated</p>
                <p className="field-value strong">{new Date(complaint.updatedAt || complaint.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <aside className="detail-side-panel">
            <div className="field-box">
              <p className="field-label">Ticket summary</p>
              <div className="summary-stack">
                <div><span>Issue</span><strong>{complaint.category}</strong></div>
                <div><span>Priority</span><strong>{complaint.priority}</strong></div>
                <div><span>Location</span><strong>{complaint.location}</strong></div>
              </div>
            </div>
            {user?.role === 'ADMIN' && <div className="field-box admin-status-box"><p className="field-label">Admin action</p><label>Update status<select value={status} onChange={(event) => setStatus(event.target.value)}><option>Pending</option><option>In Progress</option><option>Resolved</option></select></label><button type="button" className="button button-primary" disabled={saving || status === complaint.status} onClick={updateStatus}>{saving ? 'Updating...' : 'Update status'}</button></div>}
          </aside>
        </div>

        <div className="status-timeline">
          {steps.map((step, index) => (
            <div key={step} className={`timeline-step ${index <= activeIndex ? 'active' : ''}`}>
              <span className="timeline-node" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
