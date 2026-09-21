import { useContext, useState } from 'react';
import { AppContext } from '../App';
import api from '../services/api';

export default function SettingsPage() {
  const { user, login } = useContext(AppContext);
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const saveProfile = async (event) => {
    event.preventDefault(); setSaving(true); setFeedback({ type: '', message: '' });
    try {
      const response = await api.put('/auth/profile', profile);
      const token = localStorage.getItem('fixit-token');
      login({ ...response.data.data, token });
      setFeedback({ type: 'success', message: 'Profile updated successfully.' });
    } catch (error) { setFeedback({ type: 'error', message: error.response?.data?.message || 'Unable to update profile.' }); }
    finally { setSaving(false); }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (password.newPassword !== password.confirmPassword) { setFeedback({ type: 'error', message: 'New passwords do not match.' }); return; }
    setSaving(true); setFeedback({ type: '', message: '' });
    try { await api.put('/auth/password', { currentPassword: password.currentPassword, newPassword: password.newPassword }); setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' }); setFeedback({ type: 'success', message: 'Password changed successfully.' }); }
    catch (error) { setFeedback({ type: 'error', message: error.response?.data?.message || 'Unable to change password.' }); }
    finally { setSaving(false); }
  };

  return <section className="page-view settings-view"><div className="page-view-header"><div><p className="eyebrow">Account</p><h2>Settings</h2><p className="page-description">Manage your profile and account security.</p></div></div>{feedback.message && <div className={`${feedback.type}-box`}>{feedback.message}</div>}<div className="settings-grid"><form className="panel-card settings-card" onSubmit={saveProfile}><div className="panel-header compact"><div><p className="eyebrow">Profile</p><h3>Personal information</h3></div></div><label>Name<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required /></label><label>Email<input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required /></label><label>Role<input value={user?.role || 'USER'} readOnly /></label><button className="button button-primary" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button></form><form className="panel-card settings-card" onSubmit={changePassword}><div className="panel-header compact"><div><p className="eyebrow">Security</p><h3>Change password</h3></div></div><label>Current password<input type="password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} required /></label><label>New password<input type="password" minLength="6" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} required /></label><label>Confirm new password<input type="password" minLength="6" value={password.confirmPassword} onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })} required /></label><button className="button button-secondary" disabled={saving}>{saving ? 'Updating...' : 'Change password'}</button></form></div></section>;
}
