import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const DnModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
  "dn_obid": "",
  "dn_id": "",
  "dn_date": "",
  "dn_cname": "",
  "dn_mob": "",
  "dn_addr": "",
  "dn_regn": "",
  "dn_mm": "",
  "dn_yrclr": "",
  "dn_km": "",
  "dn_fuel": "",
  "dn_bat": "",
  "dn_keys": "",
  "dn_tools": "",
  "dn_spare": "",
  "dn_jack": "",
  "dn_manual": "",
  "dn_acc": "",
  "dn_rc": "",
  "dn_ins": "",
  "dn_puc": "",
  "dn_f28": "",
  "dn_f29": "",
  "dn_f30": "",
  "dn_ins_exp": "",
  "dn_puc_exp": "",
  "dn_fc_exp": "",
  "dn_by": "",
  "dn_stat": "",
  "dn_rem": ""
});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'dn'), { ...formData, createdAt: new Date().toISOString() });
      alert('Record saved successfully!');
      onClose();
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_dn">
 <div className="mbox" style={{"maxWidth":"860px"}}>
  <div className="m-hdr"><div className="m-hdr-icon">📋</div><h3>Delivery Note</h3><button className="m-close" onClick={onClose} >✕</button></div>
  <div className="m-body">
   <div style={{"background":"rgba(8,145,178,.1)","border":"1px solid rgba(8,145,178,.3)","borderRadius":"8px","padding":"10px 14px","marginBottom":"14px","fontSize":"12px","color":"#67E8F9"}}>
    <i className="fa fa-bolt" style={{"color":"var(--or1)"}}></i> Booking ID dalo → Customer, Vehicle auto-fill ho jayega
   </div>
   <div className="grid3">
    <div className="fg"><label>Booking ID <span style={{"color":"var(--or1)","fontSize":"10px"}}>⚡ Auto-Fill</span></label><input id="dn_obid" name="dn_obid" value={formData['dn_obid'] || ''} onChange={handleChange} placeholder="SOB-2025-0001"  /></div>
    <div className="fg"><label>DN Number</label><input id="dn_id" name="dn_id" value={formData['dn_id'] || ''} onChange={handleChange} placeholder="DN-2025-0001" readOnly /></div>
    <div className="fg"><label>Date *</label><input type="date" id="dn_date" name="dn_date" value={formData['dn_date'] || ''} onChange={handleChange} /></div>
   </div>
   <div className="grid3">
    <div className="fg"><label>Customer Name</label><input id="dn_cname" name="dn_cname" value={formData['dn_cname'] || ''} onChange={handleChange} placeholder="Full name" /></div>
    <div className="fg"><label>Mobile</label><input id="dn_mob" name="dn_mob" value={formData['dn_mob'] || ''} onChange={handleChange} placeholder="10-digit mobile" maxLength="10" /></div>
    <div className="fg"><label>Address</label><input id="dn_addr" name="dn_addr" value={formData['dn_addr'] || ''} onChange={handleChange} placeholder="Customer address" /></div>
   </div>
   <div className="grid3">
    <div className="fg"><label>Registration No.</label><input id="dn_regn" name="dn_regn" value={formData['dn_regn'] || ''} onChange={handleChange} placeholder="GJ-01-AB-1234" style={{"fontWeight":"700","color":"var(--or2)"}} /></div>
    <div className="fg"><label>Make / Model</label><input id="dn_mm" name="dn_mm" value={formData['dn_mm'] || ''} onChange={handleChange} placeholder="Maruti Swift VXI" /></div>
    <div className="fg"><label>Year / Color</label><input id="dn_yrclr" name="dn_yrclr" value={formData['dn_yrclr'] || ''} onChange={handleChange} placeholder="2020 / White" /></div>
   </div>
   <div className="grid3">
    <div className="fg"><label>KM at Delivery</label><input type="number" id="dn_km" name="dn_km" value={formData['dn_km'] || ''} onChange={handleChange} placeholder="52000" /></div>
    <div className="fg"><label>Fuel Level</label><select id="dn_fuel" name="dn_fuel" value={formData['dn_fuel'] || ''} onChange={handleChange}><option>Empty</option><option>1/4</option><option>1/2</option><option>3/4</option><option>Full</option></select></div>
    <div className="fg"><label>Battery Condition</label><select id="dn_bat" name="dn_bat" value={formData['dn_bat'] || ''} onChange={handleChange}><option>Good</option><option>Weak</option><option>New</option></select></div>
   </div>
   <fieldset style={{"border":"1px solid rgba(255,255,255,.1)","borderRadius":"8px","padding":"12px","marginBottom":"12px"}}>
    <legend style={{"color":"var(--or1)","fontSize":"11px","fontWeight":"700","padding":"0 8px"}}>KEYS & ACCESSORIES</legend>
    <div className="grid3">
     <div className="fg"><label>No. of Keys</label><select id="dn_keys" name="dn_keys" value={formData['dn_keys'] || ''} onChange={handleChange}><option>1</option><option>2</option><option>3</option></select></div>
     <div className="fg"><label>Tool Kit</label><select id="dn_tools" name="dn_tools" value={formData['dn_tools'] || ''} onChange={handleChange}><option>Yes</option><option>No</option><option>Partial</option></select></div>
     <div className="fg"><label>Spare Tyre</label><select id="dn_spare" name="dn_spare" value={formData['dn_spare'] || ''} onChange={handleChange}><option>Yes</option><option>No</option></select></div>
    </div>
    <div className="grid3">
     <div className="fg"><label>Jack</label><select id="dn_jack" name="dn_jack" value={formData['dn_jack'] || ''} onChange={handleChange}><option>Yes</option><option>No</option></select></div>
     <div className="fg"><label>Owner Manual</label><select id="dn_manual" name="dn_manual" value={formData['dn_manual'] || ''} onChange={handleChange}><option>Yes</option><option>No</option></select></div>
     <div className="fg"><label>Charger / Accessories</label><input id="dn_acc" name="dn_acc" value={formData['dn_acc'] || ''} onChange={handleChange} placeholder="Mat, Sunfilm, etc." /></div>
    </div>
   </fieldset>
   <fieldset style={{"border":"1px solid rgba(255,255,255,.1)","borderRadius":"8px","padding":"12px","marginBottom":"12px"}}>
    <legend style={{"color":"var(--or1)","fontSize":"11px","fontWeight":"700","padding":"0 8px"}}>DOCUMENTS GIVEN TO BUYER</legend>
    <div className="grid3">
     <div className="fg"><label>RC Book</label><select id="dn_rc" name="dn_rc" value={formData['dn_rc'] || ''} onChange={handleChange}><option>Original</option><option>Smart Card</option><option>Pending</option></select></div>
     <div className="fg"><label>Insurance</label><select id="dn_ins" name="dn_ins" value={formData['dn_ins'] || ''} onChange={handleChange}><option>Transferred</option><option>New Policy</option><option>Pending</option></select></div>
     <div className="fg"><label>PUC Certificate</label><select id="dn_puc" name="dn_puc" value={formData['dn_puc'] || ''} onChange={handleChange}><option>Given</option><option>Pending</option></select></div>
    </div>
    <div className="grid3">
     <div className="fg"><label>Form 28 (NOC)</label><select id="dn_f28" name="dn_f28" value={formData['dn_f28'] || ''} onChange={handleChange}><option>Given</option><option>NA</option><option>Pending</option></select></div>
     <div className="fg"><label>Form 29</label><select id="dn_f29" name="dn_f29" value={formData['dn_f29'] || ''} onChange={handleChange}><option>Given</option><option>Pending</option></select></div>
     <div className="fg"><label>Form 30</label><select id="dn_f30" name="dn_f30" value={formData['dn_f30'] || ''} onChange={handleChange}><option>Given</option><option>Pending</option></select></div>
    </div>
   </fieldset>
   <fieldset style={{"border":"1px solid rgba(255,255,255,.1)","borderRadius":"8px","padding":"12px","marginBottom":"12px"}}>
    <legend style={{"color":"var(--or1)","fontSize":"11px","fontWeight":"700","padding":"0 8px"}}>DOCUMENT EXPIRY DATES</legend>
    <div className="grid3">
     <div className="fg"><label>Insurance Valid Till</label><input type="date" id="dn_ins_exp" name="dn_ins_exp" value={formData['dn_ins_exp'] || ''} onChange={handleChange} /></div>
     <div className="fg"><label>PUC Valid Till</label><input type="date" id="dn_puc_exp" name="dn_puc_exp" value={formData['dn_puc_exp'] || ''} onChange={handleChange} /></div>
     <div className="fg"><label>Fitness Certificate (FC)</label><input type="date" id="dn_fc_exp" name="dn_fc_exp" value={formData['dn_fc_exp'] || ''} onChange={handleChange} /></div>
    </div>
   </fieldset>
   <div className="grid3">
    <div className="fg"><label>Delivered By</label><select id="dn_by" name="dn_by" value={formData['dn_by'] || ''} onChange={handleChange}><option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option></select></div>
    <div className="fg"><label>Status</label><select id="dn_stat" name="dn_stat" value={formData['dn_stat'] || ''} onChange={handleChange}><option>Draft</option><option>Issued</option><option>Signed</option></select></div>
    <div className="fg"><label>Remarks</label><input id="dn_rem" name="dn_rem" value={formData['dn_rem'] || ''} onChange={handleChange} placeholder="Notes / pending items" /></div>
   </div>
  </div>
  <div className="m-foot">
   <button className="btn btn-out"  onClick={onClose}>Cancel</button>
   <button className="btn btn-bl" ><i className="fa fa-print"></i> Print</button>
   <button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save</button>
  </div>
 </div>
</div>
  );
};
