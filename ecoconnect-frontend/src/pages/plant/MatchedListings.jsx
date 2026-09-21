import { useState, useEffect, useCallback, useRef } from "react";
import { getMatchedListings, acceptListing, getPriceRecommendation } from "../../api/endpoints";

const wasteEmoji = t => ({SUGARCANE:"🌾",COCONUT:"🥥",FLOWER:"🌸",FRUIT_PULP:"🍊",DAIRY:"🥛",PAPER:"📄",PLASTIC:"♻️",METAL:"⚙️"}[t?.toUpperCase()]||"🗑️");
const fmtDate = d => d ? new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "-";

const AUTO_REFRESH_SEC = 60;

export default function MatchedListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [modal, setModal]       = useState(null);
  const [price, setPrice]       = useState("");
  const [accepting, setAccepting] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_SEC);
  const countdownRef = useRef(null);

  // AI Price Recommendation state
  const [aiRec, setAiRec]         = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchListings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try { const r = await getMatchedListings(); setListings(Array.isArray(r.data) ? r.data : []); }
    catch(e) { setError(e?.response?.data?.message || "Failed to load matched listings. Make sure you have set your Plant Preferences first."); }
    finally { if (!silent) setLoading(false); setCountdown(AUTO_REFRESH_SEC); }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // Auto-refresh countdown
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { fetchListings(true); return AUTO_REFRESH_SEC; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [fetchListings]);

  // Open modal + trigger AI price recommendation
  const openModal = async (listing) => {
    setModal(listing); setPrice(""); setSuccess(""); setError(""); setAiRec(null);
    // Call AI Knowledge-based System for price suggestion
    setAiLoading(true);
    try {
      const res = await getPriceRecommendation({
        wasteType: listing.wasteType,
        quantityKg: listing.quantity,
        distanceKm: listing.distanceKm ?? 0,
        urgencyScore: listing.urgencyScore ?? 0,
      });
      setAiRec(res.data);
      // Auto-fill with AI recommended price
      setPrice(res.data.recommendedPrice?.toString() ?? "");
    } catch { /* AI optional — don't block */ }
    finally { setAiLoading(false); }
  };
  const closeModal = () => { setModal(null); setPrice(""); };

  const handleAccept = async () => {
    if (!price || parseFloat(price) <= 0) { setError("Enter a valid agreed price."); return; }
    setAccepting(true); setError("");
    try {
      await acceptListing(modal.id, { agreedPrice: parseFloat(price) });
      setSuccess("Order placed successfully!");
      closeModal();
      await fetchListings();
    } catch(e) {
      setError(e?.response?.data?.message || "Failed to accept listing.");
    } finally { setAccepting(false); }
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"/><span>Finding matched listings...</span></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🔍 Matched Listings</h1>
          <p className="page-subtitle">Waste listings compatible with your preferences, sorted by urgency then distance</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => fetchListings(false)}>
          🔄 Refresh <span style={{opacity:0.6,fontSize:11,marginLeft:4}}>({countdown}s)</span>
        </button>
      </div>

      {error   && !modal && <div className="alert alert-error"   style={{marginBottom:16}}>{error}</div>}
      {success && <div className="alert alert-success" style={{marginBottom:16}}>✅ {success}</div>}

      {listings.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">🔍</div><h3>No matched listings found</h3><p>Make sure your Plant Preferences are set with accepted waste types and radius. Listings from nearby generators will appear here.</p></div></div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
          {listings.map(l => (
            <div key={l.id} className="card" style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <span style={{fontSize:40,lineHeight:1}}>{wasteEmoji(l.wasteType)}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:17,color:"var(--text-primary)"}}>{l.wasteType?.replace("_"," ")}</div>
                  <div style={{fontSize:13,color:"var(--text-secondary)"}}>by {l.generatorName || "Generator"}</div>
                </div>
                <span className={`badge ${(l.urgencyScore||0)>=100?"badge-red":"badge-yellow"}`}>
                  {(l.urgencyScore||0)>=100?"🔥 Urgent":"Normal"}
                </span>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:6,fontSize:13}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"var(--text-muted)"}}>Quantity</span>
                  <strong style={{color:"var(--text-primary)"}}>{l.quantity} {l.unit}</strong>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"var(--text-muted)"}}>Distance</span>
                  <span style={{color:"var(--text-secondary)"}}>{l.distanceKm != null ? l.distanceKm.toFixed(1)+" km away" : "Distance unknown"}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"var(--text-muted)"}}>Expires At</span>
                  <span style={{color:"var(--text-secondary)"}}>{fmtDate(l.expiresAt)}</span>
                </div>
              </div>

              <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={() => openModal(l)}>
                ✅ Accept Order
              </button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Accept Order — {wasteEmoji(modal.wasteType)} {modal.wasteType?.replace("_"," ")}</div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div style={{fontSize:13,color:"var(--text-secondary)",marginBottom:16}}>
              {modal.quantity} {modal.unit} from <strong>{modal.generatorName}</strong>
              {modal.distanceKm != null && <span> · {modal.distanceKm.toFixed(1)} km away</span>}
            </div>

            {/* ── AI Price Recommendation Panel ── */}
            {aiLoading && (
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:8,marginBottom:14,fontSize:13}}>
                <div style={{width:14,height:14,border:"2px solid rgba(59,130,246,0.3)",borderTopColor:"var(--accent-blue)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                <span style={{color:"var(--accent-blue)"}}>🤖 AI analysing market rates...</span>
              </div>
            )}
            {aiRec && !aiLoading && (
              <div style={{background:"linear-gradient(135deg,rgba(0,214,143,0.07),rgba(59,130,246,0.06))",border:"1px solid rgba(0,214,143,0.2)",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                  <span style={{fontSize:16}}>🤖</span>
                  <span style={{fontWeight:700,fontSize:13,color:"var(--accent-green)"}}>AI Price Recommendation</span>
                  <span style={{fontSize:10,background:"rgba(0,214,143,0.15)",color:"var(--accent-green)",padding:"2px 7px",borderRadius:20,fontWeight:600}}>Knowledge-based System</span>
                </div>
                <div style={{fontSize:15,fontWeight:700,color:"var(--text-primary)",marginBottom:4}}>
                  ₹{aiRec.totalPriceLow} – ₹{aiRec.totalPriceHigh}
                  <span style={{fontSize:12,color:"var(--accent-green)",marginLeft:8}}>✦ Recommended: ₹{aiRec.recommendedPrice}</span>
                </div>
                <div style={{fontSize:11,color:"var(--text-muted)",marginBottom:6}}>
                  ₹{aiRec.perKgLow}–₹{aiRec.perKgHigh}/kg · Auto-filled below
                </div>
                {/* Rule Reasoning Trace */}
                <details style={{cursor:"pointer"}}>
                  <summary style={{fontSize:11,color:"var(--text-muted)",userSelect:"none"}}>🔍 View AI reasoning ({aiRec.reasoning?.length} rules fired)</summary>
                  <ul style={{margin:"6px 0 0 0",padding:"0 0 0 16px",fontSize:11,color:"var(--text-secondary)",lineHeight:1.7}}>
                    {aiRec.reasoning?.map((r,i) => <li key={i}>{r}</li>)}
                  </ul>
                </details>
              </div>
            )}
            {/* ──────────────────────────────────── */}

            {error && <div className="alert alert-error" style={{marginBottom:12}}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Agreed Price (₹)</label>
              <input className="form-input" type="number" placeholder="e.g. 500" min="1" step="1"
                value={price} onChange={e => setPrice(e.target.value)} autoFocus />
              <small style={{color:"var(--text-muted)",fontSize:12,marginTop:4,display:"block"}}>This amount will be credited to the generator and debited from your wallet on pickup completion.</small>
            </div>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button className="btn btn-outline" style={{flex:1}} onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" style={{flex:1,justifyContent:"center"}} onClick={handleAccept} disabled={accepting}>
                {accepting ? "Placing Order..." : "✅ Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
