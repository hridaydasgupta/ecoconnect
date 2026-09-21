import React, { useEffect, useState, useCallback } from 'react';
import { getAssignedBatches, getAgentHistory, updateStopStatus } from '../../api/endpoints';

/* ── helpers ── */
const wasteEmoji = (type) =>
  ({ SUGARCANE: '🌾', COCONUT: '🥥', FLOWER: '🌸', FRUIT_PULP: '🍊',
     DAIRY: '🥛', PAPER: '📄', PLASTIC: '♻️', METAL: '⚙️' }[type?.toUpperCase()] || '🗑️');

const statusBadge = (s) =>
  ({ PENDING: 'badge-yellow', ARRIVED: 'badge-blue', COMPLETED: 'badge-green',
     FAILED: 'badge-red', PLANNED: 'badge-yellow', IN_PROGRESS: 'badge-orange' }[s] || 'badge-gray');

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }) : '—';

/* ── Complete Stop Modal ── */
function CompleteStopModal({ stop, onConfirm, onClose, loading }) {
  const [actualWeight, setActualWeight] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const w = parseFloat(actualWeight);
    if (!actualWeight || isNaN(w) || w <= 0) {
      setErr('Please enter a valid weight (kg).');
      return;
    }
    onConfirm(stop.stopId, w);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">✅ Complete Stop</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
            padding: '14px 16px', border: '1px solid var(--glass-border)',
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Stop Details
            </div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              {wasteEmoji(stop.wasteType)} {stop.generatorName || 'Generator'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Type: <strong>{stop.wasteType}</strong> · Qty: <strong>{stop.quantity ?? '—'} kg</strong>
            </div>
          </div>
        </div>

        {err && (
          <div className="alert alert-error" style={{ marginBottom: '14px' }}>
            <span>⚠️</span> {err}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Actual Weight Collected (kg) *</label>
            <input
              type="number"
              min="0"
              step="0.1"
              className="form-input"
              placeholder="e.g. 45.5"
              value={actualWeight}
              onChange={(e) => { setActualWeight(e.target.value); setErr(''); }}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? 'Saving…' : '✅ Mark as Completed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Stop Timeline Item ── */
function StopItem({ stop, idx, onMarkArrived, onOpenComplete, actionLoading }) {
  const stopId     = stop.stopId;
  const isLoading  = actionLoading === stopId;
  const lat        = stop.latitude ?? null;
  const lng        = stop.longitude ?? null;

  const circleColor = {
    COMPLETED:   'var(--accent-green)',
    ARRIVED:     'var(--accent-blue)',
    IN_PROGRESS: 'var(--accent-orange)',
    FAILED:      'var(--accent-red)',
    PENDING:     'var(--accent-yellow)',
    PLANNED:     'var(--accent-yellow)',
  }[stop.status] || 'var(--text-muted)';

  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
      {/* ── Left: Number + Connector ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: circleColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700, color: '#fff',
          boxShadow: `0 0 10px ${circleColor}55`,
        }}>
          {stop.status === 'COMPLETED' ? '✓' : stop.status === 'FAILED' ? '✗' : idx + 1}
        </div>
        <div className="step-connector" style={{ height: '28px' }} />
      </div>

      {/* ── Right: Stop Card ── */}
      <div className="stop-card" style={{ flex: 1, marginBottom: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          {/* Info */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
              {stop.generatorName || stop.generator?.name || `Stop #${idx + 1}`}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {wasteEmoji(stop.wasteType)}&nbsp;
              <strong>{stop.wasteType || '—'}</strong>
              &nbsp;·&nbsp;{stop.quantity ?? '—'} kg
            </div>
            {lat != null && lng != null && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                📍 {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
              </div>
            )}
            {stop.arrivedAt && (
              <div style={{ fontSize: '12px', color: 'var(--emerald-400)', marginTop: '6px' }}>
                {stop.status === 'COMPLETED' ? '✅ Completed' : '🚗 Arrived'} · {fmtDate(stop.arrivedAt)}
              </div>
            )}
            {stop.actualWeight != null && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Actual weight: <strong>{stop.actualWeight} kg</strong>
              </div>
            )}
          </div>

          {/* Status + Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <span className={`badge ${statusBadge(stop.status)}`}>
              {stop.status}
            </span>

            {stop.status === 'PENDING' && (
              <button
                className="btn btn-outline btn-sm"
                style={{ borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }}
                onClick={() => onMarkArrived(stopId)}
                disabled={isLoading}
              >
                {isLoading ? '…' : '🚗 Mark Arrived'}
              </button>
            )}

            {stop.status === 'ARRIVED' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onOpenComplete(stop)}
                disabled={isLoading}
              >
                {isLoading ? '…' : '✅ Complete Stop'}
              </button>
            )}

            {stop.status === 'FAILED' && (
              <span style={{ fontSize: '12px', color: 'var(--accent-red)' }}>
                ✗ Stop failed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Batch Card ── */
function BatchCard({ batch, onMarkArrived, onOpenComplete, actionLoading }) {
  const stops = batch.stops || batch.pickupStops || [];
  const id    = (batch._id || batch.id || '');

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      {/* Header */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'monospace', fontSize: '13px',
              color: 'var(--text-muted)', letterSpacing: '0.5px',
            }}>
              #{id.slice(0, 8)}…
            </span>
            <span className={`badge ${statusBadge(batch.status)}`}>
              {batch.status}
            </span>
          </div>
          <div style={{ marginTop: '6px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {batch.scheduledDate && (
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                🗓️ {fmtDate(batch.scheduledDate)}
              </span>
            )}
            {batch.totalWeightKg != null && (
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                ⚖️ {batch.totalWeightKg} kg total
              </span>
            )}
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              📦 {stops.length} stop{stops.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* AI Optimized Route info */}
        {batch.totalDistanceKm != null && batch.totalDistanceKm > 0 && (
          <div style={{
            background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(0,214,143,0.07))',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: '10px', padding: '8px 14px', fontSize: '13px',
            display: 'flex', flexDirection: 'column', gap: '2px',
          }}>
            <div style={{ color: 'var(--blue-400)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              🤖 AI Route: {Number(batch.totalDistanceKm).toFixed(1)} km
              <span style={{ fontSize: 10, background: 'rgba(0,214,143,0.15)', color: 'var(--emerald-400)', padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>
                Optimized
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Nearest Neighbor TSP Heuristic</div>
          </div>
        )}
        {batch.totalDistanceKm === 0 && (
          <div style={{
            background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '10px', padding: '8px 14px', fontSize: '12px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ color: 'var(--amber-400)', fontWeight: 600 }}>🤖 AI Optimized</span>
            <span style={{ color: 'var(--text-muted)' }}>📍 Generator GPS not set</span>
          </div>
        )}
      </div>

      <hr className="divider" style={{ margin: '8px 0 20px' }} />

      {/* Timeline */}
      {stops.length === 0 ? (
        <div className="empty-state" style={{ padding: '24px' }}>
          <div className="empty-state-icon" style={{ fontSize: '28px' }}>📭</div>
          <h3>No stops in this batch</h3>
        </div>
      ) : (
        <div>
          {stops
            .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
            .map((stop, idx) => (
              <StopItem
                key={stop.stopId || idx}
                stop={stop}
                idx={idx}
                onMarkArrived={onMarkArrived}
                onOpenComplete={onOpenComplete}
                actionLoading={actionLoading}
              />
            ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function AgentTrips() {
  const [batches,       setBatches]       = useState([]);
  const [history,       setHistory]       = useState([]);
  const [activeTab,     setActiveTab]     = useState('active');  // 'active' | 'history'
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError,   setActionError]   = useState('');
  const [completeStop,  setCompleteStop]  = useState(null);
  const [modalLoading,  setModalLoading]  = useState(false);
  const [locSharing,    setLocSharing]    = useState(true);

  /* ── fetch active + history ── */
  const fetchBatches = useCallback(async () => {
    try {
      const [activeRes, historyRes] = await Promise.all([
        getAssignedBatches(),
        getAgentHistory(),
      ]);
      setBatches(activeRes.data || []);
      setHistory(historyRes.data || []);
    } catch {
      setError('Failed to load your trips. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  /* ── mark arrived ── */
  const handleMarkArrived = async (stopId) => {
    setActionLoading(stopId);
    setActionError('');
    try {
      await updateStopStatus(stopId, { status: 'ARRIVED' });
      await fetchBatches();
    } catch {
      setActionError('Failed to update stop status. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  /* ── complete stop (via modal) ── */
  const handleCompleteStop = async (stopId, actualWeight) => {
    setModalLoading(true);
    setActionError('');
    try {
      await updateStopStatus(stopId, { status: 'COMPLETED', actualWeight: Number(actualWeight) });
      setCompleteStop(null);
      await fetchBatches();
    } catch {
      setActionError('Failed to complete stop. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="fade-in">
      {/* ── Page Header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">🚚 My Trips</h1>
          <p className="page-subtitle">Manage your assigned pickup batches and stops.</p>
        </div>

        {/* ── Live Location Indicator ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
          borderRadius: '12px', padding: '10px 16px',
        }}>
          {locSharing ? (
            <>
              <span className="pulse-dot" />
              <span style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: 600 }}>
                Sharing location…
              </span>
            </>
          ) : (
            <>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'var(--text-muted)', display: 'inline-block',
              }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Location off
              </span>
            </>
          )}
          <button
            className={`btn btn-sm ${locSharing ? 'btn-danger' : 'btn-success'}`}
            onClick={() => setLocSharing(!locSharing)}
            style={{ padding: '4px 12px', fontSize: '12px' }}
          >
            {locSharing ? 'Stop Sharing' : 'Start Sharing'}
          </button>
        </div>
      </div>

      {/* ── Global Errors ── */}
      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}
      {actionError && (
        <div className="alert alert-error">
          <span>⚠️</span> {actionError}
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[{id:'active',label:`🚚 Active (${batches.length})`},{id:'history',label:`📋 History (${history.filter(b=>b.status==='COMPLETED'||b.status==='CANCELLED').length})`}].map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
            style={{padding:'8px 18px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:600,fontSize:13,
              background:activeTab===tab.id?'var(--emerald-500)':'rgba(255,255,255,0.06)',
              color:activeTab===tab.id?'#fff':'var(--text-secondary)',transition:'all 0.15s'}}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <span>Loading your trips…</span>
        </div>
      ) : activeTab === 'active' ? (
        batches.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">🚛</div>
              <h3>No active trips</h3>
              <p>Your pickup batches will appear here once assigned by a plant.</p>
            </div>
          </div>
        ) : (
          batches.map((batch) => (
            <BatchCard
              key={batch._id || batch.id}
              batch={batch}
              onMarkArrived={handleMarkArrived}
              onOpenComplete={setCompleteStop}
              actionLoading={actionLoading}
            />
          ))
        )
      ) : (
        /* History tab — completed/cancelled trips, read-only */
        history.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED').length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No completed trips yet</h3>
              <p>Completed deliveries will appear here.</p>
            </div>
          </div>
        ) : (
          history
            .filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED')
            .map((batch) => (
              <BatchCard
                key={batch._id || batch.id}
                batch={batch}
                onMarkArrived={() => {}}
                onOpenComplete={() => {}}
                actionLoading={null}
              />
            ))
        )
      )}

      {/* ── Complete Stop Modal ── */}
      {completeStop && (
        <CompleteStopModal
          stop={completeStop}
          onConfirm={handleCompleteStop}
          onClose={() => setCompleteStop(null)}
          loading={modalLoading}
        />
      )}
    </div>
  );
}
