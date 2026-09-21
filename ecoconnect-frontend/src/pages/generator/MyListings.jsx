import { useState, useEffect, useCallback } from 'react';
import { getMyListings, reconfirmListing } from '../../api/endpoints';

const wasteEmoji = t => ({SUGARCANE:'🌾',COCONUT:'🥥',FLOWER:'🌸',FRUIT_PULP:'🍊',DAIRY:'🥛',PAPER:'📄',PLASTIC:'♻️',METAL:'⚙️'}[t?.toUpperCase()]||'🗑️');
const statusBadge = s => ({LISTED:'badge-green',MATCHED:'badge-blue',COMPLETED:'badge-purple',DISCARDED:'badge-red'}[s]||'badge-gray');
const fmtDate = d => d ? new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '-';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [msg, setMsg]           = useState('');
  const [reconfId, setReconfId] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError('');
    try { const r = await getMyListings(); setListings(Array.isArray(r.data)?r.data:[]); }
    catch(e) { setError(e?.response?.data?.message||'Failed to load listings'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleReconfirm = async (id) => {
    setReconfId(id); setMsg('');
    try {
      await reconfirmListing(id, {});
      setMsg('✅ Listing reconfirmed! Timer reset — you have another grace period.');
      await fetch();
    } catch(e) { setMsg('❌ '+(e?.response?.data?.message||'Reconfirm failed')); }
    finally { setReconfId(null); }
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"/><span>Loading listings...</span></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 My Listings</h1>
          <p className="page-subtitle">All your waste listings — {listings.length} total</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetch}>🔄 Refresh</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {msg   && <div className={`alert ${msg.startsWith('✅')?'alert-success':'alert-error'}`} style={{marginBottom:16}}>{msg}</div>}

      {listings.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">🗂️</div><h3>No listings yet</h3><p>Create your first listing to start earning from waste.</p></div></div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
          {listings.map(l => {
            const showReconfirm = l.status==='LISTED' && (l.carryForwardCount||0) > 0;
            return (
              <div key={l.id} className="card" style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:36,lineHeight:1}}>{wasteEmoji(l.wasteType)}</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:15,color:'var(--text-primary)'}}>{l.wasteType?.replace('_',' ')}</div>
                      <div style={{fontSize:13,color:'var(--text-secondary)'}}>{l.quantity} {l.unit}</div>
                    </div>
                  </div>
                  <span className={`badge ${statusBadge(l.status)}`}>{l.status}</span>
                </div>

                <div style={{display:'flex',flexDirection:'column',gap:6,fontSize:13}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{color:'var(--text-muted)'}}>Expires At</span>
                    <span style={{color:'var(--text-secondary)',fontWeight:500}}>{fmtDate(l.expiresAt)}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{color:'var(--text-muted)'}}>On Expiry</span>
                    <span style={{color:'var(--text-secondary)'}}>{l.onExpiryAction==='CARRY_FORWARD'?'🔄 Carry Forward':'🗑️ Discard'}</span>
                  </div>
                </div>

                {(l.carryForwardCount||0) > 0 && (
                  <div style={{background:'rgba(234,179,8,0.1)',border:'1px solid rgba(234,179,8,0.25)',borderRadius:8,padding:'8px 12px',fontSize:12,color:'#eab308',display:'flex',alignItems:'center',gap:6}}>
                    ⚠️ Carried forward {l.carryForwardCount} time{l.carryForwardCount>1?'s':''} — reconfirm to avoid auto-discard!
                  </div>
                )}

                {showReconfirm && (
                  <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}
                    onClick={() => handleReconfirm(l.id)} disabled={reconfId===l.id}>
                    {reconfId===l.id ? '⏳ Reconfirming...' : '✔️ Reconfirm Listing'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
