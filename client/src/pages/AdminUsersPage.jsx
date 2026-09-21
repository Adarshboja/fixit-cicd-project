import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });

  useEffect(() => {
    api.get('/auth/users').then((response) => { setUsers(response.data.data || []); setState({ loading: false, error: '' }); }).catch(() => setState({ loading: false, error: 'Unable to load users.' }));
  }, []);

  return <section className="page-view"><div className="page-view-header"><div><p className="eyebrow">Administration</p><h2>Users</h2><p className="page-description">Review the people using your FixIt workspace.</p></div></div><div className="panel-card"><div className="table-wrapper">{state.loading ? <div className="skeleton-list"><span /><span /><span /></div> : state.error ? <div className="error-state"><h3>{state.error}</h3></div> : <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>{users.map((user) => <tr key={user._id}><td><strong>{user.name}</strong></td><td>{user.email}</td><td><span className={`badge ${user.role === 'ADMIN' ? 'in-progress' : 'pending'}`}>{user.role}</span></td><td>{new Date(user.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table>}</div></div></section>;
}
