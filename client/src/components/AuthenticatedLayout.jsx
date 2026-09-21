import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AppContext } from '../App';
import { useContext } from 'react';

const userItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '⌂', end: true },
  { label: 'My Complaints', path: '/complaints', icon: '▣', end: true },
  { label: 'New Complaint', path: '/complaints/new', icon: '+', end: true },
  { label: 'Settings', path: '/settings', icon: '⚙', end: true },
];

const adminItems = [
  { label: 'Dashboard', path: '/admin', icon: '⌂', end: true },
  { label: 'All Complaints', path: '/admin/complaints', icon: '▣', end: true },
  { label: 'Users', path: '/admin/users', icon: '◎', end: true },
  { label: 'Settings', path: '/settings', icon: '⚙', end: true },
];

export default function AuthenticatedLayout() {
  const { user, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let active = true;
    api.get('/complaints')
      .then((response) => {
        if (active) setComplaints(response.data.data || []);
      })
      .catch(() => {
        if (active) setComplaints([]);
      });
    return () => { active = false; };
  }, [location.pathname]);

  useEffect(() => {
    setSidebarOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return complaints.filter((complaint) => [
      complaint.title,
      complaint.category,
      complaint.location,
      complaint._id,
    ].some((value) => String(value || '').toLowerCase().includes(query))).slice(0, 6);
  }, [complaints, search]);

  const items = user?.role === 'ADMIN' ? adminItems : userItems;
  const initials = (user?.name || 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell page-shell">
      {sidebarOpen && <button type="button" className="drawer-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar-shell ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <Link className="brand-row" to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}>
            <div className="brand-mark">F</div>
            <span className="brand-name">FixIt</span>
          </Link>
        </div>
        <nav className="sidebar-nav" aria-label="Application navigation">
          {items.map((item) => (
            <NavLink key={item.label} to={item.path} end={item.end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button type="button" className="nav-item nav-logout" onClick={handleLogout}>
            <span className="nav-icon">↩</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar-app">
          <div className="topbar-heading">
            <button type="button" className="menu-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <p className="eyebrow">{user?.role === 'ADMIN' ? 'Operations' : 'Workspace'}</p>
              <h1>{user?.role === 'ADMIN' ? 'Admin overview' : `Good morning, ${user?.name || 'there'}.`}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="global-search">
              <span>⌕</span>
              <input
                aria-label="Search complaints"
                placeholder="Search complaints"
                value={search}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => { setSearch(event.target.value); setSearchOpen(true); }}
                onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false); }}
              />
              {search && <button type="button" aria-label="Clear search" className="clear-search" onClick={() => setSearch('')}>×</button>}
              {searchOpen && search.trim() && (
                <div className="search-results" role="listbox">
                  {results.length ? results.map((complaint) => (
                    <Link key={complaint._id} to={`/complaints/${complaint._id}`} role="option" className="search-result">
                      <strong>{complaint.title}</strong>
                      <span>{complaint.category} · {complaint.status}</span>
                    </Link>
                  )) : <p className="search-empty">No complaints found.</p>}
                </div>
              )}
            </div>
            <div className="profile-chip">
              <div className="avatar">{initials}</div>
              <div><strong>{user?.name || 'User'}</strong><span>{user?.role || 'USER'}</span></div>
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
