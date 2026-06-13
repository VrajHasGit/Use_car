import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { autoFillFromInq } from '../../utils/relations';

export const StkModal = ({ isOpen, onClose, onSave, editData, quickInqId }) => {
  const [formData, setFormData] = useState({
  "sk_inqid": "",
  "sk_regn": "",
  "sk_chas": "",
  "sk_eng": "",
  "sk_make": "",
  "sk_model": "",
  "sk_var": "",
  "sk_year": "",
  "sk_ryear": "",
  "sk_fuel": "",
  "sk_trans": "",
  "sk_color": "",
  "sk_km": "",
  "sk_own": "",
  "sk_stat": "",
  "sk_loc": "",
  "sk_pdate": "",
  "sk_insval": "",
  "sk_rc": "",
  "sk_photos": "",
  "sk_pp": "",
  "sk_refurb": "",
  "sk_rto": "",
  "sk_ins": "",
  "sk_sp": "",
  "sk_sp2": "",
  "sk_sp3": "",
  "sk_360": "",
  "sk_portal": "",
  "sk_mkt": ""
});

  useEffect(() => {
    if (isOpen && quickInqId) {
      setFormData(prev => ({ ...prev, sk_inqid: quickInqId }));
      autoFillFromInq(quickInqId).then(inqData => {
        if (inqData) {
          setFormData(prev => ({
            ...prev,
            sk_make: inqData.make || '',
            sk_model: inqData.model || '',
            sk_var: inqData.variant || '',
            sk_year: inqData.year || '',
            sk_fuel: inqData.fuel || ''
          }));
        }
      });
    }
  }, [isOpen, quickInqId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'sk_inqid' && value.length >= 5) {
      autoFillFromInq(value).then(inqData => {
        if (inqData) {
          setFormData(prev => ({
            ...prev,
            sk_make: inqData.make || '',
            sk_model: inqData.model || '',
            sk_var: inqData.variant || '',
            sk_year: inqData.year || '',
            sk_fuel: inqData.fuel || ''
          }));
        }
      });
    }
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'stk'), { ...formData, createdAt: new Date().toISOString() });
      if (onSave) { await onSave(formData); } else { onClose(); }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay on" id="m_stk">
 <div className="mbox"><div className="m-hdr"><div className="m-hdr-icon">ðŸ­</div><h3>Car Stock</h3><button className="m-close" onClick={onClose} >âœ•</button></div>
 <div className="m-body">
  <div style={{"background":"rgba(255,107,0,.07)","border":"1px solid rgba(255,107,0,.25)","borderRadius":"var(--radius-sm)","padding":"10px 14px","marginBottom":"14px","display":"flex","alignItems":"center","gap":"10px"}}>
   <span style={{"fontSize":"18px"}}>âš¡</span>
   <div className="fg" style={{"margin":"0","flex":"1"}}>
    <label style={{"color":"var(--or3)","fontSize":"10px","fontWeight":"700","letterSpacing":".8px","textTransform":"uppercase","marginBottom":"4px","display":"block"}}>Purchase INQ ID â€” Auto-Fill All Fields</label>
    <input id="sk_inqid" name="sk_inqid" value={formData['sk_inqid'] || ''} onChange={handleChange} placeholder="INQ-2025-0001 â€” type karo, sab fill ho jayega" style={{"background":"var(--bg)","border":"1px solid rgba(255,107,0,.4)","color":"var(--text)","borderRadius":"var(--radius-sm)","padding":"8px 12px","fontFamily":"inherit","fontSize":"12px","width":"100%"}}  />
   </div>
  </div>
  <div className="grid3"><div className="fg"><label>Registration No. * <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto-Fill by RegNo</span></label><input id="sk_regn" name="sk_regn" value={formData['sk_regn'] || ''} onChange={handleChange} placeholder="GJ-01-AB-1234"  /></div><div className="fg"><label>Chassis Number</label><input id="sk_chas" name="sk_chas" value={formData['sk_chas'] || ''} onChange={handleChange} placeholder="17-char VIN" /></div><div className="fg"><label>Engine Number</label><input id="sk_eng" name="sk_eng" value={formData['sk_eng'] || ''} onChange={handleChange} placeholder="Engine No." /></div></div>
  <div className="grid3"><div className="fg"><label>Make *</label><select id="sk_make" name="sk_make" value={formData['sk_make'] || ''} onChange={handleChange}><option value="">Select Brand</option></select></div><div className="fg"><label>Model</label><input id="sk_model" name="sk_model" value={formData['sk_model'] || ''} onChange={handleChange} placeholder="Model name" /></div><div className="fg"><label>Variant</label><input id="sk_var" name="sk_var" value={formData['sk_var'] || ''} onChange={handleChange} placeholder="Variant" /></div></div>
  <div className="grid3"><div className="fg"><label>Mfg Year</label><select id="sk_year" name="sk_year" value={formData['sk_year'] || ''} onChange={handleChange}><option value="">Year</option></select></div><div className="fg"><label>Registration Year</label><select id="sk_ryear" name="sk_ryear" value={formData['sk_ryear'] || ''} onChange={handleChange}><option value="">Year</option></select></div><div className="fg"><label>Fuel Type</label><select id="sk_fuel" name="sk_fuel" value={formData['sk_fuel'] || ''} onChange={handleChange}><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option><option>Hybrid</option><option>Petrol+CNG</option></select></div></div>
  <div className="grid3"><div className="fg"><label>Transmission</label><select id="sk_trans" name="sk_trans" value={formData['sk_trans'] || ''} onChange={handleChange}><option>Manual</option><option>Automatic</option><option>AMT</option><option>CVT</option><option>DCT</option></select></div><div className="fg"><label>Color</label><select id="sk_color" name="sk_color" value={formData['sk_color'] || ''} onChange={handleChange}><option>White</option><option>Silver</option><option>Grey</option><option>Black</option><option>Red</option><option>Blue</option><option>Brown</option><option>Other</option></select></div><div className="fg"><label>KM Driven</label><input type="number" id="sk_km" name="sk_km" value={formData['sk_km'] || ''} onChange={handleChange} placeholder="KM" /></div></div>
  <div className="grid3"><div className="fg"><label>Number of Owners</label><select id="sk_own" name="sk_own" value={formData['sk_own'] || ''} onChange={handleChange}><option>1st</option><option>2nd</option><option>3rd</option><option>4th+</option></select></div><div className="fg"><label>Stock Status</label><select id="sk_stat" name="sk_stat" value={formData['sk_stat'] || ''} onChange={handleChange} ><option>In Stock</option><option>Under Refurb</option><option>Ready for Sale</option><option>Sold</option><option>On Hold</option><option>Cancelled</option></select></div><div className="fg"><label>Stock Location</label><input id="sk_loc" name="sk_loc" value={formData['sk_loc'] || ''} onChange={handleChange} placeholder="Parking location" /></div></div>
  <div className="grid2"><div className="fg"><label>Purchase Date</label><input type="date" id="sk_pdate" name="sk_pdate" value={formData['sk_pdate'] || ''} onChange={handleChange} /></div><div className="fg"><label>Insurance Validity</label><input type="date" id="sk_insval" name="sk_insval" value={formData['sk_insval'] || ''} onChange={handleChange} /></div></div>
  <div className="grid2"><div className="fg"><label>RC Available</label><select id="sk_rc" name="sk_rc" value={formData['sk_rc'] || ''} onChange={handleChange}><option>Yes</option><option>No</option><option>Applied</option></select></div><div className="fg"><label>Photos Uploaded</label><select id="sk_photos" name="sk_photos" value={formData['sk_photos'] || ''} onChange={handleChange}><option>Yes</option><option>No</option></select></div></div>
  <div className="sect-lbl"><i className="fa fa-calculator"></i> Cost & Pricing â€” AUTO CALCULATION</div>
  <div className="grid3"><div className="fg"><label>Purchase Price â‚¹ *</label><input type="number" id="sk_pp" name="sk_pp" value={formData['sk_pp'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Refurb Cost â‚¹</label><input type="number" id="sk_refurb" name="sk_refurb" value={formData['sk_refurb'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>RTO Transfer Cost â‚¹</label><input type="number" id="sk_rto" name="sk_rto" value={formData['sk_rto'] || ''} onChange={handleChange} placeholder="0"  /></div></div>
  <div className="grid3"><div className="fg"><label>Insurance Cost â‚¹</label><input type="number" id="sk_ins" name="sk_ins" value={formData['sk_ins'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Total Cost Price â‚¹ (AUTO)</label><div className="calc-out" id="sk_tcp">â‚¹ 0</div></div><div className="fg"><label>Sale Price â‚¹</label><input type="number" id="sk_sp" name="sk_sp" value={formData['sk_sp'] || ''} onChange={handleChange} placeholder="0"  /></div></div>
  <div className="grid3"><div className="fg"><label>2nd Price â‚¹ (Floor)</label><input type="number" id="sk_sp2" name="sk_sp2" value={formData['sk_sp2'] || ''} onChange={handleChange} placeholder="0" /></div><div className="fg"><label>3rd Price â‚¹ (Minimum)</label><input type="number" id="sk_sp3" name="sk_sp3" value={formData['sk_sp3'] || ''} onChange={handleChange} placeholder="0" /></div><div className="fg"><label>Profit / Loss â‚¹ (AUTO)</label><div className="calc-out" id="sk_profit">â‚¹ 0</div></div></div>
  <div className="calc-panel">
   <div className="calc-row"><span className="cl">Purchase Price</span><span id="sks1">â‚¹ 0</span></div>
   <div className="calc-row"><span className="cl">+ Refurbishment</span><span id="sks2">â‚¹ 0</span></div>
   <div className="calc-row"><span className="cl">+ RTO Transfer</span><span id="sks3">â‚¹ 0</span></div>
   <div className="calc-row"><span className="cl">+ Insurance</span><span id="sks4">â‚¹ 0</span></div>
   <div className="calc-row"><span className="cl">= Total Cost</span><span id="sks5">â‚¹ 0</span></div>
   <div className="calc-row"><span className="cl">Sale Price</span><span id="sks6">â‚¹ 0</span></div>
   <div className="calc-row"><span style={{"color":"var(--or2)"}}>PROFIT / LOSS</span><span id="sks7" style={{"color":"var(--success)"}}>â‚¹ 0</span></div>
  </div>
  <div className="grid3" style={{"marginTop":"14px"}}><div className="fg"><label>360Â° Video</label><select id="sk_360" name="sk_360" value={formData['sk_360'] || ''} onChange={handleChange}><option>No</option><option>Yes</option></select></div><div className="fg"><label>Listed on Portal</label><select id="sk_portal" name="sk_portal" value={formData['sk_portal'] || ''} onChange={handleChange}><option>No</option><option>OLX</option><option>CarDekho</option><option>Cars24</option><option>All</option></select></div><div className="fg"><label>Marketing</label><select id="sk_mkt" name="sk_mkt" value={formData['sk_mkt'] || ''} onChange={handleChange}><option>None</option><option>Social Media</option><option>WhatsApp</option><option>YouTube</option><option>All</option></select></div></div>
 </div>
 <div className="m-foot"><button className="btn btn-out"  onClick={onClose}>Cancel</button><button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save Stock</button></div></div>
</div>
  );
};

