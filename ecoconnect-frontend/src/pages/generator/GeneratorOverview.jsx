import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyListings, getWallet } from '../../api/endpoints';

const wasteEmoji = (type) =>
  ({ SUGARCANE:'🌾', COCONUT:'🥥', FLOWER:'🌸', FRUIT_PULP:'🍊', DAIRY:'🥛', PAPER:'📄', PLASTIC:'♻️', METAL:'⚙️' }[type?.toUpperCase()] || '🗑️');

const statusBadge = (s) =>
  ({ LISTED:'badge-green', MATCHED:'badge-blue', COMPLETED:'badge-purple', DISCARDED:'badge-red' }[s] || 'badge-gray');

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '-';

export default function GeneratorOverview() {
  const [listings, setListings] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [lr, wr] = await Promise.all([getMyListings(), getWallet()]);
        setListings(Array.isArray(lr.data) ? lr.data : []);
        setWallet(wr.data);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load dashboard.');
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><span>Loading overview...</span></div>;

  const active = listings.filter(l => l.status === 'LISTED' || l.status === 'MATCHED').length;
  const completed = listings.filter(l => l.status === 'COMPLETED').length;
  const balance = parseFloat(wallet?.balance ?? 0).toFixed(2);
  const recent = [...listings].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🌾 Generator Overview</h1>
          <p className="page-subtitle">Monitor your waste listings and earnings at a glance</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/generator/new-listing')}>➕ New Listing</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon green">📋</div><div><div className="stat-value">{listings.length}</div><div className="stat-label">Total Listings</div></div></div>
        <div className="stat-card"><div className="stat-icon blue">🟢</div><div><div className="stat-value">{active}</div><div className="stat-label">Active Listings</div></div></div>
        <div className="stat-card"><div className="stat-icon purple">✅</div><div><div className="stat-value">{completed}</div><div className="stat-label">Completed</div></div></div>
        <div className="stat-card"><div className="stat-icon green">💰</div><div><div className="stat-value">₹{balance}</div><div className="stat-label">Wallet Balance</div></div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Listings</div>
            <div className="card-subtitle">Your last 5 listings</div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/generator/listings')}>View All →</button>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗂️</div>
            <h3>No listings yet</h3>
            <p>Create your first listing to start earning from waste</p>
            <button className="btn btn-primary" style={{marginTop:16}} onClick={() => navigate('/generator/new-listing')}>➕ Create Listing</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Waste Type</th><th>Quantity</th><th>Status</th><th>Expires At</th></tr></thead>
              <tbody>
                {recent.map(l => (
                  <tr key={l.id}>
                    <td><strong>{wasteEmoji(l.wasteType)} {l.wasteType?.replace('_',' ')}</strong></td>
                    <td>{l.quantity} {l.unit}</td>
                    <td><span className={`badge ${statusBadge(l.status)}`}>{l.status}</span></td>
                    <td>{fmtDate(l.expiresAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
