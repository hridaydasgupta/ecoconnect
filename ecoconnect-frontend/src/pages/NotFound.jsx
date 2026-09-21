import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = {
    GENERATOR:       '/generator',
    RECYCLING_PLANT: '/plant',
    LOGISTICS_AGENT: '/agent',
  }[user?.role] || '/login';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 24,
      textAlign: 'center',
      padding: '40px 20px',
      background: 'var(--bg-primary)',
    }}>
      {/* Big 404 */}
      <div style={{
        fontSize: '120px',
        fontWeight: 900,
        lineHeight: 1,
        background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        userSelect: 'none',
      }}>
        404
      </div>

      <div style={{ fontSize: '40px' }}>🌿</div>

      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 360, margin: '0 auto' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          className="btn btn-outline"
          onClick={() => navigate(-1)}
        >
          ← Go Back
        </button>
        <Link to={dashboardPath} className="btn btn-primary">
          🏠 Go to Dashboard
        </Link>
      </div>

      {/* Info card */}
      <div style={{
        marginTop: 12,
        background: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 24px',
        maxWidth: 320,
        fontSize: 13,
        color: 'var(--text-muted)',
      }}>
        If you think this is a mistake, check the URL or contact your administrator.
      </div>
    </div>
  );
}
