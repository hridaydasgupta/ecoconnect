import { useState } from 'react';
import { createListing } from '../../api/endpoints';
import { useToast, ToastContainer } from '../../components/Toast';

const WASTE_TYPES = [
  { value:'SUGARCANE', label:'🌾 Sugarcane' }, { value:'COCONUT', label:'🥥 Coconut' },
  { value:'FLOWER', label:'🌸 Flower' },       { value:'FRUIT_PULP', label:'🍊 Fruit Pulp' },
  { value:'DAIRY', label:'🥛 Dairy' },         { value:'PAPER', label:'📄 Paper' },
  { value:'PLASTIC', label:'♻️ Plastic' },     { value:'METAL', label:'⚙️ Metal' },
];

const init = { wasteType:'SUGARCANE', quantity:'', unit:'KG', pickupDeadlineTime:'', onExpiryAction:'CARRY_FORWARD' };

export default function CreateListing() {
  const [form, setForm] = useState(init);
  const [loading, setLoading] = useState(false);
  const { toasts, removeToast, toast } = useToast();

  const handle = e => setForm(f => ({...f, [e.target.name]: e.target.value}));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.quantity || parseFloat(form.quantity) <= 0) {
      toast.error('Enter a valid quantity greater than 0', 'Validation Error');
      return;
    }
    setLoading(true);
    try {
      await createListing({ ...form, quantity: parseFloat(form.quantity) });
      toast.success('Listing created! Recycling plants in your area will be notified.', '🎉 Success');
      setForm(init);
    } catch(e) {
      toast.error(e?.response?.data?.message || 'Failed to create listing. Please try again.', 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="page-header">
        <div>
          <h1 className="page-title">➕ Create Waste Listing</h1>
          <p className="page-subtitle">Post your waste for collection and earn wallet credits</p>
        </div>
      </div>

      <div style={{maxWidth:620}}>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Waste Type</label>
              <select className="form-select" name="wasteType" value={form.wasteType} onChange={handle} required>
                {WASTE_TYPES.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" name="quantity" type="number" placeholder="e.g. 120" min="0.1" step="0.1" value={form.quantity} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-select" name="unit" value={form.unit} onChange={handle}>
                  <option value="KG">Kilograms (KG)</option>
                  <option value="TONNES">Tonnes</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pickup Deadline Time</label>
              <input className="form-input" name="pickupDeadlineTime" type="time" value={form.pickupDeadlineTime} onChange={handle} required />
              <small style={{color:'var(--text-muted)',fontSize:12,marginTop:4,display:'block'}}>Latest time for pickup to happen today. If already past, auto-shifts to tomorrow.</small>
            </div>

            <div className="form-group">
              <label className="form-label">If Nobody Picks Up By Deadline...</label>
              <div style={{display:'flex', gap:10, marginTop:6}}>
                <button type="button"
                  className={`btn ${form.onExpiryAction==='CARRY_FORWARD' ? 'btn-primary' : 'btn-outline'}`}
                  style={{flex:1, justifyContent:'center'}}
                  onClick={() => setForm(f=>({...f, onExpiryAction:'CARRY_FORWARD'}))}>
                  🔄 Carry Forward<br/><small style={{fontWeight:400,fontSize:11}}>Extend by 1 day</small>
                </button>
                <button type="button"
                  className={`btn ${form.onExpiryAction==='DISCARD' ? 'btn-danger' : 'btn-outline'}`}
                  style={{flex:1, justifyContent:'center'}}
                  onClick={() => setForm(f=>({...f, onExpiryAction:'DISCARD'}))}>
                  🗑️ Discard<br/><small style={{fontWeight:400,fontSize:11}}>Delete automatically</small>
                </button>
              </div>
            </div>

            {form.quantity && (
              <div style={{background:'rgba(0,214,143,0.06)',border:'1px solid rgba(0,214,143,0.15)',borderRadius:10,padding:'14px 18px',marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:32}}>
                  {({SUGARCANE:'🌾',COCONUT:'🥥',FLOWER:'🌸',FRUIT_PULP:'🍊',DAIRY:'🥛',PAPER:'📄',PLASTIC:'♻️',METAL:'⚙️'}[form.wasteType]||'🗑️')}
                </span>
                <div>
                  <div style={{fontWeight:700,color:'var(--text-primary)'}}>{form.quantity} {form.unit} of {form.wasteType.replace('_',' ')}</div>
                  <div style={{fontSize:13,color:'var(--text-secondary)'}}>Deadline: {form.pickupDeadlineTime||'—'} · On expiry: {form.onExpiryAction.replace('_',' ')}</div>
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{width:'100%',justifyContent:'center'}}>
              {loading ? '⏳ Creating...' : '➕ Create Listing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
