import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../../api/endpoints";

const wasteEmoji = t => ({SUGARCANE:"🌾",COCONUT:"🥥",FLOWER:"🌸",FRUIT_PULP:"🍊",DAIRY:"🥛",PAPER:"📄",PLASTIC:"♻️",METAL:"⚙️"}[t?.toUpperCase()]||"🗑️");
const statusBadge = s => ({CONFIRMED:"badge-blue",COMPLETED:"badge-green",CANCELLED:"badge-red"}[s]||"badge-gray");
const fmtDate = d => d ? new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "-";
const shortId = id => id ? id.slice(0,8).toUpperCase() : "—";

export default function MyOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try { const r = await getMyOrders(); setOrders(Array.isArray(r.data)?r.data:[]); }
      catch(e) { setError(e?.response?.data?.message||"Failed to load orders."); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="loading-container"><div className="loading-spinner"/><span>Loading orders...</span></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 My Orders</h1>
          <p className="page-subtitle">{orders.length} total order{orders.length!==1?"s":""}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/plant/batches")}>🚚 Create Batch</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">📦</div><h3>No orders yet</h3><p>Accept a listing from the matched feed to create your first order.</p><button className="btn btn-primary" style={{marginTop:16}} onClick={()=>navigate("/plant/feed")}>🔍 Browse Matched Listings</button></div></div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr><th>Order ID</th><th>Waste Type</th><th>Generator</th><th>Quantity</th><th>Agreed Price</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {[...orders].sort((a,b)=>new Date(b.matchedAt)-new Date(a.matchedAt)).map(o => (
                  <tr key={o.id}>
                    <td><code style={{background:"rgba(255,255,255,0.05)",padding:"2px 8px",borderRadius:4,fontSize:12,letterSpacing:"0.05em"}}>#{shortId(o.id)}</code></td>
                    <td><strong>{wasteEmoji(o.wasteType)} {o.wasteType?.replace("_"," ")||"—"}</strong></td>
                    <td style={{color:"var(--text-secondary)"}}>{o.generatorName || "—"}</td>
                    <td style={{color:"var(--text-secondary)"}}>
                      {o.quantity != null
                        ? <strong>{o.quantity} <span style={{fontSize:11,color:"var(--text-muted)"}}>{o.unit || "KG"}</span></strong>
                        : "—"}
                    </td>
                    <td><strong style={{color:"var(--emerald-400)"}}>₹{parseFloat(o.agreedPrice||0).toFixed(2)}</strong></td>
                    <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                    <td style={{fontSize:13,color:"var(--text-muted)"}}>{fmtDate(o.matchedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
