import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders, getWallet, getMyBatches } from "../../api/endpoints";

const wasteEmoji = t => ({SUGARCANE:"🌾",COCONUT:"🥥",FLOWER:"🌸",FRUIT_PULP:"🍊",DAIRY:"🥛",PAPER:"📄",PLASTIC:"♻️",METAL:"⚙️"}[t?.toUpperCase()]||"🗑️");
const statusBadge = s => ({LISTED:"badge-green",MATCHED:"badge-blue",COMPLETED:"badge-purple",DISCARDED:"badge-red",CONFIRMED:"badge-blue",PLANNED:"badge-yellow",IN_PROGRESS:"badge-orange",FAILED:"badge-red"}[s]||"badge-gray");
const fmtDate = d => d ? new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "-";

export default function PlantOverview() {
  const [orders, setOrders]   = useState([]);
  const [batches, setBatches] = useState([]);
  const [wallet, setWallet]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [or, br, wr] = await Promise.all([getMyOrders(), getMyBatches(), getWallet()]);
        setOrders(Array.isArray(or.data) ? or.data : []);
        setBatches(Array.isArray(br.data) ? br.data : []);
        setWallet(wr.data);
      } catch(e) { setError(e?.response?.data?.message || "Failed to load overview."); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="loading-container"><div className="loading-spinner"/><span>Loading...</span></div>;

  const activeBatches   = batches.filter(b => b.status === "PLANNED" || b.status === "IN_PROGRESS").length;
  const completedOrders = orders.filter(o => o.status === "COMPLETED").length;
  const balance         = parseFloat(wallet?.balance ?? 0).toFixed(2);
  const recentOrders    = [...orders].sort((a,b)=>new Date(b.matchedAt)-new Date(a.matchedAt)).slice(0,5);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏭 Plant Overview</h1>
          <p className="page-subtitle">Monitor your orders, batches and wallet</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/plant/feed")}>🔍 Find Listings</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue">📋</div><div><div className="stat-value">{orders.length}</div><div className="stat-label">Total Orders</div></div></div>
        <div className="stat-card"><div className="stat-icon orange">🚚</div><div><div className="stat-value">{activeBatches}</div><div className="stat-label">Active Batches</div></div></div>
        <div className="stat-card"><div className="stat-icon purple">✅</div><div><div className="stat-value">{completedOrders}</div><div className="stat-label">Completed Orders</div></div></div>
        <div className="stat-card">
          <div className="stat-icon red">📤</div>
          <div>
            <div className="stat-value" style={{color:'var(--red-400)'}}>
              ₹{Math.abs(parseFloat(balance)).toFixed(2)}
            </div>
            <div className="stat-label">Total Spent</div>
            <div style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>
              Payments made for waste pickups
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div><div className="card-title">Recent Orders</div><div className="card-subtitle">Last 5 orders placed</div></div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate("/plant/orders")}>View All →</button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📦</div><h3>No orders yet</h3><p>Browse the matched listings feed to place your first order.</p><button className="btn btn-primary" style={{marginTop:16}} onClick={()=>navigate("/plant/feed")}>🔍 Browse Listings</button></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Waste Type</th><th>Quantity</th><th>Price</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td><strong>{wasteEmoji(o.wasteType)} {o.wasteType?.replace("_"," ") || "—"}</strong></td>
                    <td>{o.quantity != null ? <strong>{o.quantity} <span style={{fontSize:11,color:"var(--text-muted)"}}>{o.unit||"KG"}</span></strong> : "—"}</td>
                    <td style={{color:"var(--emerald-400)",fontWeight:600}}>₹{parseFloat(o.agreedPrice||0).toFixed(2)}</td>
                    <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                    <td style={{fontSize:13,color:"var(--text-muted)"}}>{fmtDate(o.matchedAt)}</td>
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
