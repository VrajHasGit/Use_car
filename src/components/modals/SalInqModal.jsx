import React, { useState, useEffect } from 'react';
import { today } from '../../utils/helpers';
import { autoFillFromStockId } from '../../utils/relations';
import { useData } from '../../contexts/DataContext';

const MAKES = ['Maruti Suzuki','Hyundai','Tata','Honda','Toyota','Mahindra','Kia','Renault','Nissan','Volkswagen','Skoda','MG','Jeep','Other'];
const YEARS = Array.from({ length: 2025 - 2000 + 1 }, (_, i) => String(2025 - i));
const CITIES = ['Ahmedabad','Surat','Vadodara','Rajkot','Gandhinagar','Bhavnagar','Jamnagar','Junagadh','Anand','Nadiad','Mehsana','Other'];

const INIT = {
  source: 'Walk-in', date: today(), branch: 'SG Highway',
  buyerName: '', mobile: '', altMobile: '', email: '', city: '', state: 'Gujarat', address: '',
  budget: '', makePref: '', model: '', fuel: 'Any', trans: 'Any', color: 'Any',
  km: '', yearFrom: '', yearTo: '', assigned: 'Ritesh Shah', status: 'New', nextFU: '', remarks: '',
  linkedStock: ''
};

export const SalInqModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState(INIT);
  const [saving, setSaving] = useState(false);
  const [filling, setFilling] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const { data } = useData();

  // Available stock vehicles for the picker
  const availableStock = (data?.stk || []).filter(r => r.status === 'In Stock' || r.status === 'Ready for Sale');

  useEffect(() => {
    if (editData) setFormData({ ...INIT, ...editData });
    else setFormData({ ...INIT, date: today() });
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const set = (field, val) => setFormData(p => ({ ...p, [field]: val }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const doFillFromStock = async (stkId) => {
    if (!stkId || stkId.length < 5) return;
    setFilling(true);
    const d = await autoFillFromStockId(stkId);
    if (d) {
      setFormData(prev => ({
        ...prev,
        linkedStock: stkId,
        makePref: d.make || d.sk_make || prev.makePref,
        model: d.model || d.sk_model || prev.model,
        fuel: d.fuel || d.sk_fuel || prev.fuel,
        trans: d.trans || d.sk_trans || prev.trans,
        color: d.color || d.sk_color || prev.color,
        yearFrom: d.year || d.sk_year || prev.yearFrom,
        yearTo: d.year || d.sk_year || prev.yearTo,
        km: d.km || d.sk_km || prev.km,
        budget: d.sprice || d.sp || d.sk_sp || prev.budget,
      }));
    }
    setFilling(false);
  };

  const handleStockIdChange = (e) => {
    const val = e.target.value;
    set('linkedStock', val);
    doFillFromStock(val);
  };

  const handlePickStock = (stk) => {
    const stkId = stk.stkId || stk.id;
    setFormData(prev => ({
      ...prev,
      linkedStock: stkId,
      makePref: stk.make || stk.sk_make || prev.makePref,
      model: stk.model || stk.sk_model || prev.model,
      fuel: stk.fuel || stk.sk_fuel || prev.fuel,
      trans: stk.trans || stk.sk_trans || prev.trans,
      color: stk.color || stk.sk_color || prev.color,
      yearFrom: stk.year || stk.sk_year || prev.yearFrom,
      yearTo: stk.year || stk.sk_year || prev.yearTo,
      km: stk.km || stk.sk_km || prev.km,
      budget: stk.sprice || stk.sp || stk.sk_sp || prev.budget,
    }));
    setShowPicker(false);
  };

  const handleSave = async () => {
    if (!formData.buyerName.trim()) return alert('Buyer Name is required.');
    setSaving(true);
    try { await onSave(formData); } finally { setSaving(false); }
  };

  return (
    <div className="overlay on" id="m_sal_inq">
      <div className="mbox">
        <div className="m-hdr">
          <div className="m-hdr-icon">🏷️</div>
          <h3>{editData ? 'Edit Sales Inquiry' : 'New Sales Inquiry'}</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">
          {/* ⚡ Stock Link Banner */}
          <div style={{ background: 'rgba(5,150,105,.07)', border: '1px solid rgba(5,150,105,.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🚗</span>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#059669', fontSize: 10, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                Link Stock Vehicle {filling ? '⏳ Loading…' : '⚡ Auto-Fill'}
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  name="linkedStock"
                  value={formData.linkedStock}
                  onChange={handleStockIdChange}
                  placeholder="STK-2025-0001"
                  style={{ background: 'var(--bg)', border: '1px solid rgba(5,150,105,.4)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontFamily: 'inherit', fontSize: 12, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPicker(!showPicker)}
                  className="btn btn-out btn-sm"
                  style={{ whiteSpace: 'nowrap', borderColor: '#059669', color: '#059669' }}
                >
                  <i className="fa fa-warehouse"></i> {showPicker ? 'Close' : 'Pick from Stock'}
                </button>
              </div>
            </div>
          </div>

          {/* Stock Picker Dropdown */}
          {showPicker && (
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', marginBottom: 14, maxHeight: 200, overflowY: 'auto' }}>
              {availableStock.length > 0 ? availableStock.map(stk => (
                <div
                  key={stk.id}
                  onClick={() => handlePickStock(stk)}
                  style={{ padding: '8px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(5,150,105,.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 700, color: '#059669', fontFamily: "'Space Grotesk',sans-serif", minWidth: 110 }}>{stk.stkId || stk.id?.slice(0, 12)}</span>
                  <span style={{ fontWeight: 600 }}>{stk.make || stk.sk_make} {stk.model || stk.sk_model}</span>
                  <span style={{ color: 'var(--text3)' }}>({stk.year || stk.sk_year})</span>
                  <span style={{ color: 'var(--or1)', fontFamily: "'Space Grotesk',sans-serif" }}>{stk.regNo || stk.sk_regn}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--success)', fontWeight: 700 }}>₹{Number(stk.sprice || stk.sp || stk.sk_sp || 0).toLocaleString('en-IN')}</span>
                </div>
              )) : (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>No vehicles in stock</div>
              )}
            </div>
          )}

          <div className="grid3">
            <div className="fg"><label>Source *</label>
              <select name="source" value={formData.source} onChange={handleChange}>
                <option>Walk-in</option><option>Call</option><option>Online/OLX</option>
                <option>Reference</option><option>CarDekho</option><option>Cars24</option>
                <option>Social Media</option><option>WhatsApp</option>
              </select>
            </div>
            <div className="fg"><label>Date *</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} />
            </div>
            <div className="fg"><label>Branch</label>
              <select name="branch" value={formData.branch} onChange={handleChange}>
                <option>SG Highway</option><option>Vastral</option><option>Head Office</option>
              </select>
            </div>
          </div>

          <div className="sect-lbl"><i className="fa fa-user"></i> Buyer Details</div>
          <div className="grid3">
            <div className="fg"><label>Buyer Name *</label>
              <input name="buyerName" value={formData.buyerName} onChange={handleChange} placeholder="Full name" />
            </div>
            <div className="fg"><label>Mobile *</label>
              <input name="mobile" value={formData.mobile} onChange={handleChange} type="tel" maxLength="10" placeholder="10 digit" />
            </div>
            <div className="fg"><label>Alt Mobile</label>
              <input name="altMobile" value={formData.altMobile} onChange={handleChange} type="tel" maxLength="10" placeholder="Optional" />
            </div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Email</label>
              <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="email@example.com" />
            </div>
            <div className="fg"><label>City</label>
              <select name="city" value={formData.city} onChange={handleChange}>
                <option value="">Select City</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="fg"><label>State</label>
              <input name="state" value={formData.state} readOnly
                style={{ background: 'rgba(16,185,129,.08)', borderColor: 'var(--success)', color: 'var(--success)', fontWeight: 600 }} />
            </div>
          </div>
          <div className="grid1"><div className="fg"><label>Address</label>
            <input name="address" value={formData.address} onChange={handleChange} placeholder="Full address" />
          </div></div>

          <div className="sect-lbl"><i className="fa fa-car"></i> Vehicle Preference</div>
          <div className="grid3">
            <div className="fg"><label>Budget ₹</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="Max budget" />
            </div>
            <div className="fg"><label>Preferred Make {formData.linkedStock && <span style={{ color: '#059669', fontSize: 10 }}>⚡ from Stock</span>}</label>
              <select name="makePref" value={formData.makePref} onChange={handleChange}>
                <option value="">Any Brand</option>
                {MAKES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="fg"><label>Preferred Model {formData.linkedStock && <span style={{ color: '#059669', fontSize: 10 }}>⚡ from Stock</span>}</label>
              <input name="model" value={formData.model} onChange={handleChange} placeholder="Any model" />
            </div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Fuel Preference</label>
              <select name="fuel" value={formData.fuel} onChange={handleChange}>
                <option>Any</option><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option>
              </select>
            </div>
            <div className="fg"><label>Transmission</label>
              <select name="trans" value={formData.trans} onChange={handleChange}>
                <option>Any</option><option>Manual</option><option>Automatic</option><option>AMT</option>
              </select>
            </div>
            <div className="fg"><label>Color Preference</label>
              <select name="color" value={formData.color} onChange={handleChange}>
                <option>Any</option><option>White</option><option>Silver</option><option>Black</option><option>Red</option><option>Blue</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Max KM</label>
              <input type="number" name="km" value={formData.km} onChange={handleChange} placeholder="Max KM" />
            </div>
            <div className="fg"><label>Year From</label>
              <select name="yearFrom" value={formData.yearFrom} onChange={handleChange}>
                <option value="">Any</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="fg"><label>Year To</label>
              <select name="yearTo" value={formData.yearTo} onChange={handleChange}>
                <option value="">Any</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="grid3">
            <div className="fg"><label>Assigned To</label>
              <select name="assigned" value={formData.assigned} onChange={handleChange}>
                <option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option>
                <option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option>
                <option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option>
              </select>
            </div>
            <div className="fg"><label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option>New</option><option>In-Progress</option><option>Closed-Won</option><option>Closed-Lost</option><option>Hold</option>
              </select>
            </div>
            <div className="fg"><label>Next Follow-Up Date</label>
              <input type="date" name="nextFU" value={formData.nextFU} onChange={handleChange} />
            </div>
          </div>
          <div className="grid1"><div className="fg"><label>Remarks</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Additional notes…" />
          </div></div>
        </div>
        <div className="m-foot">
          <button className="btn btn-out" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-or" onClick={handleSave} disabled={saving}>
            {saving ? <><i className="fa fa-spinner fa-spin"></i> Saving…</> : <><i className="fa fa-save"></i> Save Inquiry</>}
          </button>
        </div>
      </div>
    </div>
  );
};
