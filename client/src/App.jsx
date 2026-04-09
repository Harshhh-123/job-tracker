import { useState, useEffect } from 'react';
import './App.css';

const API = 'http://localhost:5000/api';

const STATUSES = ['Applied','Phone Screen','Interview','Offer','Rejected'];

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [apps, setApps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company:'', role:'', status:'Applied', notes:'', jdLink:'' });
  const [editId, setEditId] = useState(null);
  const [dragging, setDragging] = useState(null);

  useEffect(() => { if (token) fetchApps(); }, [token]);

  const fetchApps = async () => {
    const res = await fetch(`${API}/applications`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setApps(Array.isArray(data) ? data : []);
  };

  const handleAuth = async () => {
    setError('');
    const res = await fetch(`${API}/auth/${isRegister ? 'register' : 'login'}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) { localStorage.setItem('token', data.token); setToken(data.token); }
    else setError(data.message || 'Error');
  };

  const handleSubmit = async () => {
    const url = editId ? `${API}/applications/${editId}` : `${API}/applications`;
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setForm({ company:'', role:'', status:'Applied', notes:'', jdLink:'' });
    setShowForm(false); setEditId(null); fetchApps();
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/applications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchApps();
  };

  const handleDrop = async (status) => {
    if (!dragging) return;
    await fetch(`${API}/applications/${dragging._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...dragging, status }) });
    setDragging(null); fetchApps();
  };

  const logout = () => { localStorage.removeItem('token'); setToken(null); };

  if (!token) return (
    <div className="auth-container">
      <h1>Job Tracker</h1>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      {error && <p className="error">{error}</p>}
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleAuth}>{isRegister ? 'Register' : 'Login'}</button>
      <p onClick={() => setIsRegister(!isRegister)} className="toggle">
        {isRegister ? 'Already have account? Login' : "Don't have account? Register"}
      </p>
    </div>
  );

  return (
    <div className="app">
      <div className="header">
        <h1>Job Tracker</h1>
        <div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ company:'', role:'', status:'Applied', notes:'', jdLink:'' }); }}>+ Add Application</button>
          <button onClick={logout} className="logout">Logout</button>
        </div>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editId ? 'Edit' : 'Add'} Application</h2>
            <input placeholder="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
            <input placeholder="Role" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
            <input placeholder="JD Link" value={form.jdLink} onChange={e => setForm({...form, jdLink: e.target.value})} />
            <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="btn-group">
              <button onClick={handleSubmit}>Save</button>
              <button onClick={() => setShowForm(false)} className="cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="kanban">
        {STATUSES.map(status => (
          <div key={status} className="column" onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(status)}>
            <h3>{status} <span className="count">{apps.filter(a => a.status === status).length}</span></h3>
            {apps.filter(a => a.status === status).map(app => (
              <div key={app._id} className="card" draggable onDragStart={() => setDragging(app)}>
                <h4>{app.company}</h4>
                <p>{app.role}</p>
                <p className="date">{new Date(app.dateApplied).toLocaleDateString()}</p>
                <div className="card-actions">
                  <button onClick={() => { setForm({company:app.company,role:app.role,status:app.status,notes:app.notes||'',jdLink:app.jdLink||''}); setEditId(app._id); setShowForm(true); }}>Edit</button>
                  <button onClick={() => handleDelete(app._id)} className="del">Delete</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}