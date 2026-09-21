import { useState, useEffect } from "react";
import { getWallet } from "../../api/endpoints";

const fmtDate = d => d ? new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "-";
const shortId = id => id ? id.slice(0,8).toUpperCase() : "—";

export default function PlantWallet() {
  const [wallet, setWallet]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    (async () => {
      try { const r = await getWallet(); setWallet(r.data); }
      catch(e) { setError(e?.response?.data?.message||"Failed to load wallet."); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="loading-container"><div className="loading-spinner"/><span>Loading wallet...</span></div>;
  if (error)   return <div style={{padding:32}}><div className="alert alert-error">⚠️ {error}</div></div>;

  const txns = Array.isArray(wallet?.transactions) ? [...wallet.transactions].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)) : [];
  const balance = parseFloat(wallet?.balance??0).toFixed(2);
  const totalDebit = txns.filter(t=>t.type==="DEBIT").reduce((s,t)=>s+parseFloat(t.amount||0),0).toFixed(2);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">💰 Plant Wallet</h1>
        <p className="page-subtitle">Your spending history and current balance</p>
      </div>

      <div className="wallet-balance-card">
        <div className="wallet-balance-label">📤 Total Paid Out</div>
        <div className="wallet-balance-amount" style={{
          background: 'linear-gradient(135deg, var(--red-400), var(--orange-400))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          ₹{Math.abs(parseFloat(balance)).toFixed(2)}
        </div>
        <div style={{fontSize:13, color:'rgba(255,255,255,0.5)', marginTop:6}}>
          Payments made to generators for waste pickups
        </div>
        <div style={{display:"flex",gap:40,justifyContent:"center",marginTop:16}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:4}}>Total Paid</div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--red-400)"}}>₹{totalDebit}</div>
          </div>
          <div style={{width:1,background:"rgba(255,255,255,0.15)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:4}}>Transactions</div>
            <div style={{fontSize:20,fontWeight:700}}>{txns.length}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{marginBottom:16}}>Transaction History</div>
        {txns.length===0 ? (
          <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No transactions yet</h3><p>Payments will appear here after order pickups are completed.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Type</th><th>Amount</th><th>Order ID</th><th>Date</th></tr></thead>
              <tbody>
                {txns.map((t,i) => {
                  const isCredit = t.type==="CREDIT";
                  return (
                    <tr key={t.id||i}>
                      <td><span className={`badge ${isCredit?"badge-green":"badge-red"}`}>{isCredit?"⬆️ CREDIT":"⬇️ DEBIT"}</span></td>
                      <td><strong style={{color:isCredit?"#4ade80":"#f87171"}}>{isCredit?"+":"-"}₹{parseFloat(t.amount||0).toFixed(2)}</strong></td>
                      <td><code style={{background:"rgba(255,255,255,0.05)",padding:"2px 8px",borderRadius:4,fontSize:12}}>#{shortId(t.relatedOrderId)}</code></td>
                      <td style={{fontSize:13,color:"var(--text-muted)"}}>{fmtDate(t.createdAt)}</td>
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
