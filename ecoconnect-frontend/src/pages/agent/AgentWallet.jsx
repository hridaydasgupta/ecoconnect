import { useState, useEffect } from 'react';
import { getWallet } from '../../api/endpoints';

const fmtDate = d =>
  d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—';

const shortId = id => id ? id.slice(0, 8).toUpperCase() : '—';

export default function AgentWallet() {
  const [wallet, setWallet]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try { const r = await getWallet(); setWallet(r.data); }
      catch (e) { setError(e?.response?.data?.message || 'Failed to load wallet.'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="loading-container"><div className="loading-spinner"/><span>Loading wallet...</span></div>;
  if (error)   return <div style={{padding:32}}><div className="alert alert-error">⚠️ {error}</div></div>;

  const txns = Array.isArray(wallet?.transactions)
    ? [...wallet.transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  const balance     = parseFloat(wallet?.balance ?? 0).toFixed(2);
  const totalEarned = txns.filter(t => t.type === 'CREDIT').reduce((s, t) => s + parseFloat(t.amount || 0), 0).toFixed(2);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">💰 My Earnings</h1>
        <p className="page-subtitle">Your delivery earnings and transaction history</p>
      </div>

      {/* Balance Card */}
      <div className="wallet-balance-card" style={{ marginBottom: 24 }}>
        <div className="wallet-balance-label">🚛 Total Earnings</div>
        <div className="wallet-balance-amount" style={{
          background: 'linear-gradient(135deg, var(--emerald-400), var(--teal-400))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          ₹{parseFloat(balance).toFixed(2)}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
          Earned from completed pickup deliveries
        </div>
        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Total Earned</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--emerald-400)' }}>₹{totalEarned}</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Deliveries</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{txns.length}</div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Transaction History</div>
        {txns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No earnings yet</h3>
            <p>Complete your first delivery stop to start earning.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Type</th><th>Amount</th><th>Order ID</th><th>Date</th></tr>
              </thead>
              <tbody>
                {txns.map((t, i) => {
                  const isCredit = t.type === 'CREDIT';
                  return (
                    <tr key={t.id || i}>
                      <td><span className={`badge ${isCredit ? 'badge-green' : 'badge-red'}`}>{isCredit ? '⬆️ CREDIT' : '⬇️ DEBIT'}</span></td>
                      <td><strong style={{ color: isCredit ? 'var(--emerald-400)' : 'var(--red-400)' }}>{isCredit ? '+' : '-'}₹{parseFloat(t.amount || 0).toFixed(2)}</strong></td>
                      <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>#{shortId(t.relatedOrderId)}</code></td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{fmtDate(t.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
