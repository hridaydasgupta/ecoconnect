import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssignedBatches, getWallet } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

/* ── helpers ── */
const statusBadge = (s) =>
  ({ PENDING: 'badge-yellow', ARRIVED: 'badge-blue', COMPLETED: 'badge-green',
     FAILED: 'badge-red', PLANNED: 'badge-yellow', IN_PROGRESS: 'badge-orange' }[s] || 'badge-gray');

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }) : '—';

export default function AgentOverview() {
  const { user } = useAuth();
  const [batches, setBatches]   = useState([]);
  const [wallet,  setWallet]    = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [batchRes, walletRes] = await Promise.all([getAssignedBatches(), getWallet()]);
        setBatches(batchRes.data || []);
        setWallet(walletRes.data);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── derived stats ── */
  const totalTrips  = batches.length;
  const activeTrips = batches.filter(b =>
    b.status === 'PLANNED' || b.status === 'IN_PROGRESS').length;
  const completedStops = batches.reduce((acc, b) => {
    const stops = b.stops || b.pickupStops || [];
    return acc + stops.filter(s => s.status === 'COMPLETED').length;
  }, 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="fade-in">
      {/* ── Page Header ── */}
      <div className="page-header">
        <h1 className="page-title">
          {greeting()}, {user?.name?.split(' ')[0] || 'Agent'} 👋
        </h1>
        <p className="page-subtitle">
          Here's a snapshot of your logistics activity today.
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <span>Loading your stats…</span>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue" style={{ fontSize: '22px' }}>🚚</div>
              <div>
                <div className="stat-value">{totalTrips}</div>
                <div className="stat-label">Total Assigned Trips</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange" style={{ fontSize: '22px' }}>⚡</div>
              <div>
                <div className="stat-value">{activeTrips}</div>
                <div className="stat-label">Active Trips</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green" style={{ fontSize: '22px' }}>✅</div>
              <div>
                <div className="stat-value">{completedStops}</div>
                <div className="stat-label">Completed Stops</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green" style={{ fontSize: '22px' }}>💰</div>
              <div>
                <div className="stat-value">₹{parseFloat(wallet?.balance ?? 0).toFixed(2)}</div>
                <div className="stat-label">Wallet Balance</div>
              </div>
            </div>
          </div>

          {/* ── Quick Summary Table ── */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Assigned Batches</h2>
                <p className="card-subtitle">Quick overview of all your pickup batches</p>
              </div>
              <Link to="/agent/trips" className="btn btn-primary btn-sm">
                🚚 View All Trips
              </Link>
            </div>

            {batches.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>No batches assigned yet</h3>
                <p>You'll see your pickup batches here once they're assigned.</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Batch ID</th>
                      <th>Scheduled Date</th>
                      <th>Status</th>
                      <th>Stops</th>
                      <th>Total Weight</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => {
                      const stops = batch.stops || batch.pickupStops || [];
                      const id    = (batch._id || batch.id || '').slice(0, 8);
                      return (
                        <tr key={batch._id || batch.id}>
                          <td>
                            <strong style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                              #{id}…
                            </strong>
                          </td>
                          <td>{fmtDate(batch.scheduledDate)}</td>
                          <td>
                            <span className={`badge ${statusBadge(batch.status)}`}>
                              {batch.status}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                              {stops.length}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                              {' '}stop{stops.length !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td>
                            {batch.totalWeightKg
                              ? <><strong>{batch.totalWeightKg}</strong> kg</>
                              : '—'}
                          </td>
                          <td>
                            <Link
                              to="/agent/trips"
                              className="btn btn-outline btn-sm"
                            >
                              🗺️ View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
