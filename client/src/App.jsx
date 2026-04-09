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
  const [form, setForm] = useState({ company:'', role:'', status:'Applied', notes:'', jdLink:'', salaryRange:'', dateApplied: new Date().toISOString().split('T')[0] });
  const [editId, setEditId] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [jd, setJd] = useState('');
  const [parsing, setParsing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [parseError, setParseError] = useState('');

  useEffect(() => { if (token) fetchApps(); }, [token]);

  const fetchApps = async () => {
    try {
      const res = await fetch(`${API}/applications`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setApps(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch apps:', e);
    }
  };

  const handleAuth = async () => {
    setError('');
    try {
      const res = await fetch(`${API}/auth/${isRegister ? 'register' : 'login'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) { localStorage.setItem('token', data.token); setToken(data.token); }
      else setError(data.message || 'Error');
    } catch (e) {
      setError('Connection error. Is the server running?');
    }
  };

  const handleParseJD = () => {
    if (!jd.trim()) { setParseError('Please paste a job description first.'); return; }
    setParseError('');
    setParsing(true);
    setSuggestions([]);
    fetch(`${API}/ai/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ jd })
    })
    .then(r => r.json())
    .then(data => {
      setForm(f => ({ ...f, company: data.company || f.company, role: data.role || f.role }));
      return fetch(`${API}/ai/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: data.role, skills: data.skills || [] })
      });
    })
    .then(r => r.json())
    .then(bullets => {
      setSuggestions(Array.isArray(bullets) ? bullets : []);
      setParsing(false);
    })
    .catch(e => { setParseError('AI parsing failed. Please try again.'); setParsing(false); });
  };

  const handleSubmit = async () => {
    if (!form.company || !form.role) { alert('Company and Role are required.'); return; }
    const url = editId ? `${API}/applications/${editId}` : `${API}/applications`;
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setForm({ company:'', role:'', status:'Applied', notes:'', jdLink:'', salaryRange:'', dateApplied: new Date().toISOString().split('T')[0] });
    setShowForm(false); setEditId(null); setJd(''); setSuggestions([]); setParseError(''); fetchApps();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
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
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ company:'', role:'', status:'Applied', notes:'', jdLink:'', salaryRange:'', dateApplied: new Date().toISOString().split('T')[0] }); setJd(''); setSuggestions([]); setParseError(''); }}>+ Add Application</button>
          <button onClick={logout} className="logout">Logout</button>
        </div>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editId ? 'Edit' : 'Add'} Application</h2>
            <textarea placeholder="Paste Job Description here for AI parsing..." value={jd} onChange={e => setJd(e.target.value)} className="jd-input" />
            <button type="button" onClick={handleParseJD} className="parse-btn" disabled={parsing}>
              {parsing ? '⏳ Parsing...' : '🤖 Parse with AI'}
            </button>
            {parseError && <p className="error">{parseError}</p>}
            {suggestions.length > 0 && (
              <div className="suggestions">
                <h4>✨ AI Resume Suggestions:</h4>
                {suggestions.map((s, i) => (
                  <div key={i} className="suggestion-item">
                    <p>{s}</p>
                    <button type="button" onClick={() => navigator.clipboard.writeText(s)}>Copy</button>
                  </div>
                ))}
              </div>
            )}
            <input placeholder="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
            <input placeholder="Role" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
            <input placeholder="JD Link" value={form.jdLink} onChange={e => setForm({...form, jdLink: e.target.value})} />
            <input placeholder="Salary Range (e.g. 8-12 LPA)" value={form.salaryRange} onChange={e => setForm({...form, salaryRange: e.target.value})} />
            <label style={{fontSize:'12px', color:'#666'}}>Date Applied</label>
            <input type="date" value={form.dateApplied} onChange={e => setForm({...form, dateApplied: e.target.value})} />
            <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="btn-group">
              <button type="button" onClick={handleSubmit}>Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="kanban">
        {STATUSES.map(status => (
          <div key={status} className="column" onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(status)}>
            <h3>{status} <span className="count">{apps.filter(a => a.status === status).length}</span></h3>
            {apps.filter(a => a.status === status).length === 0 && (
              <p className="empty-col">No applications</p>
            )}
            {apps.filter(a => a.status === status).map(app => (
              <div key={app._id} className="card" draggable onDragStart={() => setDragging(app)}>
                <h4>{app.company}</h4>
                <p>{app.role}</p>
                {app.salaryRange && <p className="salary">💰 {app.salaryRange}</p>}
                <p className="date">📅 {new Date(app.dateApplied || app.createdAt).toLocaleDateString()}</p>
                <div className="card-actions">
                  <button type="button" onClick={() => { setForm({company:app.company,role:app.role,status:app.status,notes:app.notes||'',jdLink:app.jdLink||'',salaryRange:app.salaryRange||'',dateApplied:app.dateApplied?.split('T')[0]||new Date().toISOString().split('T')[0]}); setEditId(app._id); setShowForm(true); setSuggestions([]); setParseError(''); }}>Edit</button>
                  <button type="button" onClick={() => handleDelete(app._id)} className="del">Delete</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}