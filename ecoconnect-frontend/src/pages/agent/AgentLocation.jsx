import React, { useState, useEffect, useRef } from 'react';
import { updateLocation } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

export default function AgentLocation() {
  const { user } = useAuth();

  const [coords,    setCoords]    = useState({ lat: '', lng: '' });
  const [detecting, setDetecting] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState('');
  const [error,     setError]     = useState('');
  const [autoMode,  setAutoMode]  = useState(false);
  const intervalRef = useRef(null);

  /* ── GPS detect ── */
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setDetecting(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        });
        setDetecting(false);
      },
      () => {
        setError('Unable to retrieve your location. Please allow location access.');
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* ── Auto-update every 30 s ── */
  useEffect(() => {
    if (autoMode) {
      // push immediately, then every 30 s
      const pushLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              await updateLocation({
                latitude:  pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
              setCoords({
                lat: pos.coords.latitude.toFixed(6),
                lng: pos.coords.longitude.toFixed(6),
              });
              setSuccess(`Auto-updated at ${new Date().toLocaleTimeString('en-IN')}`);
              setError('');
            } catch {
              setError('Auto-update failed.');
            }
          },
          () => setError('Failed to get GPS position.')
        );
      };
      pushLocation();
      intervalRef.current = setInterval(pushLocation, 30_000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoMode]);

  /* ── Manual save ── */
  const handleSave = async (e) => {
    e.preventDefault();
    const lat = parseFloat(coords.lat);
    const lng = parseFloat(coords.lng);
    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid coordinates or use GPS detection.');
      return;
    }
    if (lat < -90 || lat > 90) { setError('Latitude must be between -90 and 90.'); return; }
    if (lng < -180 || lng > 180) { setError('Longitude must be between -180 and 180.'); return; }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateLocation({ latitude: lat, longitude: lng });
      setSuccess('✅ Location updated successfully!');
    } catch {
      setError('Failed to update location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      {/* ── Page Header ── */}
      <div className="page-header">
        <h1 className="page-title">📍 Update Location</h1>
        <p className="page-subtitle">
          Keep your location up-to-date so the platform can track your position.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '20px' }}>
        {/* ── Left: Location Form ── */}
        <div>
          {/* Auto-share banner */}
          <div style={{
            background: autoMode
              ? 'rgba(0,214,143,0.08)'
              : 'rgba(255,255,255,0.04)',
            border: `1px solid ${autoMode ? 'rgba(0,214,143,0.25)' : 'var(--glass-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {autoMode
                ? <span className="pulse-dot" />
                : <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }} />
              }
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: autoMode ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                  {autoMode ? 'Auto-sharing location every 30s' : 'Auto-sharing is off'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Keeps your position current for dispatchers
                </div>
              </div>
            </div>
            <button
              className={`btn btn-sm ${autoMode ? 'btn-danger' : 'btn-success'}`}
              onClick={() => setAutoMode(!autoMode)}
            >
              {autoMode ? '⏹ Stop Auto-Share' : '▶ Start Auto-Share'}
            </button>
          </div>

          {/* Manual form */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Manual Coordinates</h2>
                <p className="card-subtitle">Enter or detect your GPS coordinates</p>
              </div>
            </div>

            {success && (
              <div className="alert alert-success">
                <span>✅</span> {success}
              </div>
            )}
            {error && (
              <div className="alert alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* GPS Detect */}
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', marginBottom: '18px', justifyContent: 'center' }}
              onClick={detectLocation}
              disabled={detecting}
            >
              {detecting ? (
                <>
                  <div style={{
                    width: '14px', height: '14px',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderTopColor: 'var(--text-primary)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Detecting location…
                </>
              ) : (
                '📡 Detect My Location'
              )}
            </button>

            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="e.g. 19.075983"
                    value={coords.lat}
                    onChange={(e) => setCoords({ ...coords, lat: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="e.g. 72.877656"
                    value={coords.lng}
                    onChange={(e) => setCoords({ ...coords, lng: e.target.value })}
                  />
                </div>
              </div>

              {coords.lat && coords.lng && (
                <div style={{
                  marginTop: '14px',
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.18)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  color: 'var(--accent-blue)',
                }}>
                  📌 Coordinates: <strong>{coords.lat}</strong>,&nbsp;<strong>{coords.lng}</strong>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '18px', justifyContent: 'center' }}
                disabled={saving || !coords.lat || !coords.lng}
              >
                {saving ? 'Saving…' : '💾 Save Location'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: Info Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Agent card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '18px',
              }}>
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>{user?.name || 'Agent'}</div>
                <div style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: 500 }}>
                  🚚 Logistics Agent
                </div>
              </div>
            </div>

            <hr className="divider" />

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Email</span>
                <strong style={{ color: 'var(--text-primary)' }}>{user?.email || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Role</span>
                <strong style={{ color: 'var(--text-primary)' }}>AGENT</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Current Coords</span>
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '12px' }}>
                  {coords.lat && coords.lng
                    ? `${coords.lat}, ${coords.lng}`
                    : 'Not set'}
                </strong>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
              💡 Tips
            </h3>
            <ul style={{
              listStyle: 'none', padding: 0, margin: 0,
              display: 'flex', flexDirection: 'column', gap: '10px',
            }}>
              {[
                { icon: '📡', text: 'Use "Detect My Location" for the most accurate GPS fix.' },
                { icon: '🔄', text: 'Enable Auto-Share during active pickups for real-time tracking.' },
                { icon: '🌐', text: 'Location sharing requires browser permission — allow when prompted.' },
                { icon: '🔋', text: 'Auto-share updates every 30 seconds to balance accuracy and battery.' },
              ].map((tip, i) => (
                <li key={i} style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                  fontSize: '13px', color: 'var(--text-secondary)',
                }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{tip.icon}</span>
                  {tip.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Why it matters */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,214,143,0.08), rgba(59,130,246,0.06))',
            border: '1px solid rgba(0,214,143,0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 18px',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '6px' }}>
              🌿 Why This Matters
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Real-time location data helps EcoConnect optimize routes, reduce fuel consumption,
              and ensure timely waste pickups — contributing directly to a greener supply chain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
