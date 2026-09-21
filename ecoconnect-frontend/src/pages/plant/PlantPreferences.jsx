import { useState, useEffect } from "react";
import { setPlantPreferences, getPlantPreferences } from "../../api/endpoints";

const WASTE_TYPES = [
  {v:"SUGARCANE",e:"🌾"},{v:"COCONUT",e:"🥥"},{v:"FLOWER",e:"🌸"},
  {v:"FRUIT_PULP",e:"🍊"},{v:"DAIRY",e:"🥛"},{v:"PAPER",e:"📄"},
  {v:"PLASTIC",e:"♻️"},{v:"METAL",e:"⚙️"},
];

const initForm = { acceptedWasteTypes:[], preferredRadiusKm:25, minQuantityKg:0, maxCapacityKg:"", notifyInstantly:true };

export default function PlantPreferences() {
  const [form, setForm]       = useState(initForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await getPlantPreferences();
        const d = r.data;
        if (d) setForm({ acceptedWasteTypes:d.acceptedWasteTypes||[], preferredRadiusKm:d.preferredRadiusKm||25, minQuantityKg:d.minQuantityKg||0, maxCapacityKg:d.maxCapacityKg||"", notifyInstantly:d.notifyInstantly!==false });
      } catch { /* first time — no prefs yet */ }
      finally { setLoading(false); }
    })();
  }, []);

  const toggleWaste = v => setForm(f => ({ ...f, acceptedWasteTypes: f.acceptedWasteTypes.includes(v) ? f.acceptedWasteTypes.filter(x=>x!==v) : [...f.acceptedWasteTypes, v] }));

  const handleSave = async () => {
    if (form.acceptedWasteTypes.length === 0) { setError("Select at least one waste type."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      await setPlantPreferences({ ...form, preferredRadiusKm:parseFloat(form.preferredRadiusKm), minQuantityKg:parseFloat(form.minQuantityKg||0), maxCapacityKg:form.maxCapacityKg?parseFloat(form.maxCapacityKg):null });
      setSuccess("Preferences saved! The matched listings feed will update accordingly.");
    } catch(e) { setError(e?.response?.data?.message||"Failed to save preferences."); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"/><span>Loading preferences...</span></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">⚙️ Plant Preferences</h1>
        <p className="page-subtitle">Configure what waste types you accept and your pickup radius</p>
      </div>

      <div style={{maxWidth:620}}>
        {success && <div className="alert alert-success" style={{marginBottom:16}}>✅ {success}</div>}
        {error   && <div className="alert alert-error"   style={{marginBottom:16}}>⚠️ {error}</div>}

        <div className="card" style={{marginBottom:16}}>
          <div className="card-title" style={{marginBottom:4}}>Accepted Waste Types</div>
          <div className="card-subtitle" style={{marginBottom:14}}>Only listings with these types will appear in your matched feed</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {WASTE_TYPES.map(w => {
              const sel = form.acceptedWasteTypes.includes(w.v);
              return (
                <button key={w.v} type="button" onClick={()=>toggleWaste(w.v)}
                  style={{padding:"12px 8px",border:`1px solid ${sel?"rgba(0,214,143,0.4)":"var(--glass-border)"}`,borderRadius:10,background:sel?"rgba(0,214,143,0.08)":"transparent",cursor:"pointer",textAlign:"center",transition:"all 0.15s",color:sel?"var(--accent-green)":"var(--text-secondary)"}}>
                  <div style={{fontSize:24,marginBottom:4}}>{w.e}</div>
                  <div style={{fontSize:11,fontWeight:600}}>{w.v.replace("_"," ")}</div>
                </button>
              );
            })}
          </div>
          {form.acceptedWasteTypes.length>0 && <div style={{fontSize:12,color:"var(--accent-green)",marginTop:10}}>{form.acceptedWasteTypes.length} type{form.acceptedWasteTypes.length!==1?"s":""} selected</div>}
        </div>

        <div className="card">
          <div className="card-title" style={{marginBottom:16}}>Location & Capacity Settings</div>
          <div className="form-grid" style={{marginBottom:0}}>
            <div className="form-group">
              <label className="form-label">Preferred Radius (km)</label>
              <input className="form-input" type="number" min="1" max="500" value={form.preferredRadiusKm} onChange={e=>setForm(f=>({...f,preferredRadiusKm:e.target.value}))} />
              <small style={{color:"var(--text-muted)",fontSize:12}}>Listings beyond this radius are excluded from your feed</small>
            </div>
            <div className="form-group">
              <label className="form-label">Min Quantity (kg)</label>
              <input className="form-input" type="number" min="0" value={form.minQuantityKg} onChange={e=>setForm(f=>({...f,minQuantityKg:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Capacity per Trip (kg)</label>
              <input className="form-input" type="number" min="1" placeholder="Optional" value={form.maxCapacityKg} onChange={e=>setForm(f=>({...f,maxCapacityKg:e.target.value}))} />
              <small style={{color:"var(--text-muted)",fontSize:12}}>Batch creation will warn if total weight exceeds this</small>
            </div>
            <div className="form-group">
              <label className="form-label">Notify Instantly</label>
              <label style={{display:"flex",alignItems:"center",gap:10,marginTop:8,cursor:"pointer"}}>
                <input type="checkbox" checked={form.notifyInstantly} onChange={e=>setForm(f=>({...f,notifyInstantly:e.target.checked}))} style={{width:18,height:18,accentColor:"var(--accent-green)"}} />
                <span style={{fontSize:14,color:"var(--text-secondary)"}}>Get notified when new matching listings appear</span>
              </label>
            </div>
          </div>

          <hr className="divider" />
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{width:"100%",justifyContent:"center"}}>
            {saving ? "⏳ Saving..." : "💾 Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
