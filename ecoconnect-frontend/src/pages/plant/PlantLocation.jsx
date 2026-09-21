import { useState } from "react";
import { updateLocation } from "../../api/endpoints";

const PRESETS = [
  { label:"Mumbai Centre", lat:"19.0760", lng:"72.8777" },
  { label:"Pune Centre",   lat:"18.5204", lng:"73.8567" },
  { label:"Navi Mumbai",   lat:"19.0330", lng:"73.0297" },
  { label:"Thane",         lat:"19.2183", lng:"72.9781" },
];

export default function PlantLocation() {
  const [lat, setLat]         = useState("");
  const [lng, setLng]         = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");

  const applyPreset = p => { setLat(p.lat); setLng(p.lng); setSuccess(""); setError(""); };
  const detectGPS   = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      pos => { setLat(pos.coords.latitude.toFixed(6)); setLng(pos.coords.longitude.toFixed(6)); },
      ()  => setError("Could not detect location.")
    );
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(""); setSuccess("");
    const latitude=parseFloat(lat), longitude=parseFloat(lng);
    if (isNaN(latitude)||latitude<-90||latitude>90)   { setError("Latitude must be -90 to 90."); return; }
    if (isNaN(longitude)||longitude<-180||longitude>180) { setError("Longitude must be -180 to 180."); return; }
    setLoading(true);
    try {
      await updateLocation({ latitude, longitude });
      setSuccess("Plant location updated to ("+latitude.toFixed(4)+", "+longitude.toFixed(4)+")!");
    } catch(e) { setError(e?.response?.data?.message||"Failed to update location."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">📍 Plant Location</h1>
        <p className="page-subtitle">Your location is used to calculate distance to generators for smart matching</p>
      </div>
      <div style={{maxWidth:560}}>
        {success && <div className="alert alert-success" style={{marginBottom:16}}>✅ {success}</div>}
        {error   && <div className="alert alert-error"   style={{marginBottom:16}}>⚠️ {error}</div>}
        <div className="card" style={{marginBottom:16}}>
          <div className="card-title" style={{marginBottom:12}}>Quick Presets</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {PRESETS.map(p => <button key={p.label} type="button" className="btn btn-outline btn-sm" style={{justifyContent:"flex-start"}} onClick={()=>applyPreset(p)}>📍 {p.label}</button>)}
          </div>
          <hr className="divider"/>
          <button type="button" className="btn btn-outline" style={{width:"100%",justifyContent:"center"}} onClick={detectGPS}>🎯 Use GPS Location</button>
        </div>
        <div className="card">
          <div className="card-title" style={{marginBottom:16}}>Enter Coordinates</div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input className="form-input" type="number" placeholder="e.g. 19.0760" value={lat} onChange={e=>setLat(e.target.value)} step="0.0001" required/>
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input className="form-input" type="number" placeholder="e.g. 72.8777" value={lng} onChange={e=>setLng(e.target.value)} step="0.0001" required/>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{width:"100%",justifyContent:"center"}}>
              {loading?"Updating...":"📍 Update Location"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
