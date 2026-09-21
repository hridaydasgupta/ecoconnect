import { useState, useEffect, useCallback } from "react";
import { getMyOrders, getMyBatches, createBatch, getAvailableAgents, assignAgent } from "../../api/endpoints";
import { useToast, ToastContainer } from "../../components/Toast";

const wasteEmoji = t => ({SUGARCANE:"🌾",COCONUT:"🥥",FLOWER:"🌸",FRUIT_PULP:"🍊",DAIRY:"🥛",PAPER:"📄",PLASTIC:"♻️",METAL:"⚙️"}[t?.toUpperCase()]||"🗑️");
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "-";
const statusBadge = s => ({PLANNED:"badge-yellow",IN_PROGRESS:"badge-orange",COMPLETED:"badge-green",CANCELLED:"badge-red"}[s]||"badge-gray");
const shortId = id => id ? id.slice(0,8).toUpperCase() : "—";

export default function PickupBatches() {
  const [orders, setOrders]         = useState([]);
  const [batches, setBatches]       = useState([]);
  const [selected, setSelected]     = useState([]);
  const [schedDate, setSchedDate]   = useState("");
  const [creating, setCreating]     = useState(false);
  const [createMsg, setCreateMsg]   = useState({type:"",text:""});
  const [agents, setAgents]         = useState([]);
  const [agentModal, setAgentModal] = useState(null);
  const [assignMsg, setAssignMsg]   = useState("");
  const [loading, setLoading]       = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [or, br] = await Promise.all([getMyOrders(), getMyBatches()]);
      const allOrders = Array.isArray(or.data) ? or.data : [];
      setOrders(allOrders.filter(o => o.status === "CONFIRMED"));
      setBatches(Array.isArray(br.data) ? br.data : []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleSelect = id => setSelected(s => s.includes(id) ? s.filter(i=>i!==id) : [...s, id]);

  const handleCreateBatch = async () => {
    if (selected.length === 0) { setCreateMsg({type:"error",text:"Select at least one order."}); return; }
    if (!schedDate) { setCreateMsg({type:"error",text:"Select a scheduled date."}); return; }
    setCreating(true); setCreateMsg({type:"",text:""});
    try {
      await createBatch({ orderIds: selected, scheduledDate: schedDate });
      setCreateMsg({type:"success",text:"Batch created successfully!"});
      setSelected([]); setSchedDate("");
      await fetchData();
    } catch(e) { setCreateMsg({type:"error",text:e?.response?.data?.message||"Failed to create batch."}); }
    finally { setCreating(false); }
  };

  const openAssignModal = async (batch) => {
    setAgentModal(batch); setAssignMsg("");
    try { const r = await getAvailableAgents(); setAgents(Array.isArray(r.data)?r.data:[]); }
    catch(e) { setAgents([]); }
  };

  const handleAssign = async (agentId) => {
    setAssignMsg("");
    try {
      await assignAgent(agentModal.id, { agentId });
      setAssignMsg("Agent assigned successfully!");
      setAgentModal(null);
      await fetchData();
    } catch(e) { setAssignMsg(e?.response?.data?.message||"Failed to assign agent."); }
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"/><span>Loading...</span></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">🚚 Pickup Batches</h1>
        <p className="page-subtitle">Group confirmed orders into pickup trips and assign agents</p>
      </div>

      {/* Create Batch */}
      <div className="card" style={{marginBottom:24}}>
        <div className="card-title" style={{marginBottom:4}}>Create New Batch</div>
        <div className="card-subtitle" style={{marginBottom:16}}>Select CONFIRMED orders to group into one trip</div>

        {createMsg.text && <div className={`alert ${createMsg.type==="success"?"alert-success":"alert-error"}`} style={{marginBottom:12}}>{createMsg.text}</div>}

        {orders.length === 0 ? (
          <div className="empty-state" style={{padding:"24px 0"}}><div className="empty-state-icon">📦</div><h3>No confirmed orders</h3><p>Accept listings from the matched feed first.</p></div>
        ) : (
          <>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {orders.map(o => (
                <label key={o.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:selected.includes(o.id)?"rgba(16,185,129,0.07)":"rgba(255,255,255,0.02)",border:`1px solid ${selected.includes(o.id)?"rgba(16,185,129,0.3)":"var(--glass-border)"}`,borderRadius:8,cursor:"pointer",transition:"all 0.15s"}}>
                  <input type="checkbox" checked={selected.includes(o.id)} onChange={()=>toggleSelect(o.id)} style={{width:16,height:16,accentColor:"var(--accent-green)"}} />
                  <span style={{fontSize:22}}>{wasteEmoji(o.wasteType)}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,color:"var(--text-primary)",fontSize:14}}>
                      {o.wasteType?.replace("_"," ") || "Unknown"} — {o.quantity} {o.unit}
                    </div>
                    <div style={{fontSize:12,color:"var(--text-secondary)"}}>
                      Order #{shortId(o.id)} · <span style={{color:"var(--emerald-400)",fontWeight:600}}>₹{o.agreedPrice}</span>
                      {o.generatorName && <span style={{color:"var(--text-muted)"}}> · {o.generatorName}</span>}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div style={{display:"flex",gap:12,alignItems:"flex-end"}}>
              <div className="form-group" style={{flex:1,marginBottom:0}}>
                <label className="form-label">Scheduled Date</label>
                <input className="form-input" type="date" value={schedDate} onChange={e=>setSchedDate(e.target.value)} min={new Date().toISOString().split("T")[0]} required />
              </div>
              <button className="btn btn-primary" onClick={handleCreateBatch} disabled={creating} style={{height:42,whiteSpace:"nowrap"}}>
                {creating ? "Creating..." : "🚚 Create Batch"}
              </button>
            </div>
            {selected.length>0 && <div style={{fontSize:12,color:"var(--text-muted)",marginTop:8}}>{selected.length} order{selected.length!==1?"s":""} selected</div>}
          </>
        )}
      </div>

      {/* My Batches */}
      <div>
        <div style={{fontSize:16,fontWeight:700,marginBottom:16,color:"var(--text-primary)"}}>My Batches ({batches.length})</div>
        {batches.length===0 ? (
          <div className="card"><div className="empty-state"><div className="empty-state-icon">🚛</div><h3>No batches yet</h3><p>Create your first pickup batch above.</p></div></div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[...batches].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).map(b => (
              <div key={b.id} className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,marginBottom:14}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:15,color:"var(--text-primary)"}}>Batch #{shortId(b.id)}</div>
                    <div style={{fontSize:13,color:"var(--text-secondary)",marginTop:2}}>
                      📅 {fmtDate(b.scheduledDate)}
                      {b.totalWeightKg && <span> · ⚖️ {b.totalWeightKg} kg</span>}
                    </div>
                    {/* AI Route Badge — smart display */}
                    {b.totalDistanceKm != null && b.totalDistanceKm > 0 && (
                      <div style={{marginTop:5,display:"inline-flex",alignItems:"center",gap:6,background:"linear-gradient(135deg,rgba(59,130,246,0.1),rgba(0,214,143,0.07))",border:"1px solid rgba(59,130,246,0.2)",borderRadius:8,padding:"4px 10px",fontSize:12}}>
                        <span style={{color:"var(--blue-400)",fontWeight:700}}>🤖 AI Route: {b.totalDistanceKm.toFixed(1)} km</span>
                        <span style={{fontSize:10,background:"rgba(0,214,143,0.15)",color:"var(--emerald-400)",padding:"1px 6px",borderRadius:20,fontWeight:600}}>Optimized</span>
                      </div>
                    )}
                    {b.totalDistanceKm === 0 && (
                      <div style={{marginTop:5,display:"inline-flex",alignItems:"center",gap:6,background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:8,padding:"4px 10px",fontSize:12}}>
                        <span style={{color:"var(--amber-400)",fontWeight:600}}>🤖 AI Optimized</span>
                        <span style={{fontSize:10,color:"var(--text-muted)"}}>📍 Set generator GPS for distance</span>
                      </div>
                    )}
                    {b.agentName && <div style={{fontSize:12,color:"var(--emerald-400)",marginTop:4,fontWeight:600}}>🚛 {b.agentName}</div>}
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span className={`badge ${statusBadge(b.status)}`}>{b.status}</span>
                    {b.status==="PLANNED" && !b.agentName && (
                      <button className="btn btn-primary btn-sm" onClick={()=>openAssignModal(b)}>👤 Assign Agent</button>
                    )}
                    {b.agentName && <span style={{fontSize:12,color:"var(--emerald-400)",fontWeight:600}}>🚛 {b.agentName}</span>}
                  </div>
                </div>

                {Array.isArray(b.stops) && b.stops.length>0 && (
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <div style={{fontSize:12,color:"var(--text-muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>Stops ({b.stops.length})</div>
                    {[...b.stops].sort((a,c)=>a.sequence-c.sequence).map(s => (
                      <div key={s.stopId||s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"rgba(255,255,255,0.02)",borderRadius:8,border:"1px solid var(--glass-border)"}}>
                        <div style={{width:24,height:24,borderRadius:"50%",background:"var(--accent-blue)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{s.sequence||"?"}</div>
                        <span style={{fontSize:20}}>{wasteEmoji(s.wasteType)}</span>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:13,color:"var(--text-primary)"}}>{s.generatorName}</div>
                          <div style={{fontSize:12,color:"var(--text-secondary)"}}>{s.wasteType?.replace("_"," ")} · {s.quantity} kg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Agent Modal */}
      {agentModal && (
        <div className="modal-overlay" onClick={()=>setAgentModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Assign Agent — Batch #{shortId(agentModal.id)}</div>
              <button className="modal-close" onClick={()=>setAgentModal(null)}>✕</button>
            </div>
            {assignMsg && <div className="alert alert-success" style={{marginBottom:12}}>{assignMsg}</div>}
            {agents.length===0 ? (
              <div className="empty-state"><div className="empty-state-icon">🚛</div><h3>No agents available</h3><p>No logistics agents are registered yet.</p></div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {agents.map(a => (
                  <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid var(--glass-border)",borderRadius:8}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,var(--accent-blue),var(--accent-purple))",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,flexShrink:0}}>
                      {a.name?.charAt(0)?.toUpperCase()||"A"}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,color:"var(--text-primary)"}}>{a.name}</div>
                      <div style={{fontSize:12,color:"var(--text-secondary)"}}>{a.phone}</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={()=>handleAssign(a.id)}>Assign</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
