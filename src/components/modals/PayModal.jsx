import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const PayModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
  "py_obid": "",
  "py_sobid": "",
  "py_name": "",
  "py_contact": "",
  "py_regn": "",
  "py_mm": "",
  "py_finbank": "",
  "py_finamt": "",
  "py_date": "",
  "py_type": "",
  "py_mode": "",
  "py_ref": "",
  "py_bank": "",
  "py_pto": "",
  "py_pby": "",
  "py_amt": "",
  "py_total": "",
  "py_prev": "",
  "py_hold": "",
  "py_auth": "",
  "py_rem": ""
});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'pay'), { ...formData, createdAt: new Date().toISOString() });
      if (onSave) { await onSave(formData); } else { onClose(); }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_pay">
 <div className="mbox"><div className="m-hdr"><div className="m-hdr-icon">ðŸ’³</div><h3>Payment Record</h3><button className="m-close" onClick={onClose} >âœ•</button></div>
 <div className="m-body">
  
  <div style={{"background":"rgba(255,107,0,.07)","border":"1px solid rgba(255,107,0,.25)","borderRadius":"var(--radius-sm)","padding":"10px 14px","marginBottom":"12px","display":"grid","gridTemplateColumns":"1fr 1fr","gap":"10px"}}>
   <div className="fg" style={{"margin":"0"}}>
    <label style={{"color":"var(--or3)","fontSize":"10px","fontWeight":"700","letterSpacing":".8px","textTransform":"uppercase","marginBottom":"4px","display":"block"}}>âš¡ Order Booking ID (OB)</label>
    <input id="py_obid" name="py_obid" value={formData['py_obid'] || ''} onChange={handleChange} placeholder="OB-2025-0001" style={{"background":"var(--bg)","border":"1px solid rgba(255,107,0,.4)","color":"var(--text)","borderRadius":"var(--radius-sm)","padding":"8px 12px","fontFamily":"inherit","fontSize":"12px","width":"100%"}}  />
   </div>
   <div className="fg" style={{"margin":"0"}}>
    <label style={{"color":"#059669","fontSize":"10px","fontWeight":"700","letterSpacing":".8px","textTransform":"uppercase","marginBottom":"4px","display":"block"}}>âš¡ Sales Order Booking ID (SOB)</label>
    <input id="py_sobid" name="py_sobid" value={formData['py_sobid'] || ''} onChange={handleChange} placeholder="SOB-2025-0001" style={{"background":"var(--bg)","border":"1px solid rgba(5,150,105,.4)","color":"var(--text)","borderRadius":"var(--radius-sm)","padding":"8px 12px","fontFamily":"inherit","fontSize":"12px","width":"100%"}}  />
   </div>
  </div>
  <div className="grid3"><div className="fg"><label>Buyer Name</label><input id="py_name" name="py_name" value={formData['py_name'] || ''} onChange={handleChange} placeholder="Name" /></div><div className="fg"><label>Mobile</label><input id="py_contact" name="py_contact" value={formData['py_contact'] || ''} onChange={handleChange} placeholder="Contact No." readOnly /></div><div className="fg"><label>Vehicle Reg No. <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto</span></label><input id="py_regn" name="py_regn" value={formData['py_regn'] || ''} onChange={handleChange} placeholder="GJ-01-AB-1234" readOnly /></div></div>
  <div className="grid3"><div className="fg"><label>Car Details <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto</span></label><input id="py_mm" name="py_mm" value={formData['py_mm'] || ''} onChange={handleChange} placeholder="Make Model" readOnly /></div><div className="fg"><label>Finance Bank <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto</span></label><input id="py_finbank" name="py_finbank" value={formData['py_finbank'] || ''} onChange={handleChange} placeholder="Bank name (if financed)" readOnly /></div><div className="fg"><label>Finance Amount â‚¹ <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto</span></label><input type="number" id="py_finamt" name="py_finamt" value={formData['py_finamt'] || ''} onChange={handleChange} placeholder="0" readOnly /></div></div>
  <div className="grid3"><div className="fg"><label>Payment Date *</label><input type="date" id="py_date" name="py_date" value={formData['py_date'] || ''} onChange={handleChange} /></div><div className="fg"><label>Payment Type *</label><select id="py_type" name="py_type" value={formData['py_type'] || ''} onChange={handleChange}><option>Token</option><option>Part Payment</option><option>Full Payment</option><option>Finance Disbursement</option><option>Refund</option></select></div><div className="fg"><label>Payment Mode</label><select id="py_mode" name="py_mode" value={formData['py_mode'] || ''} onChange={handleChange}><option>Cash</option><option>NEFT</option><option>RTGS</option><option>UPI</option><option>Cheque</option><option>DD</option></select></div></div>
  <div className="grid3"><div className="fg"><label>Cheque / UTR Number</label><input id="py_ref" name="py_ref" value={formData['py_ref'] || ''} onChange={handleChange} placeholder="Reference No." /></div></div>
  <div className="grid3"><div className="fg"><label>Bank Name</label><input id="py_bank" name="py_bank" value={formData['py_bank'] || ''} onChange={handleChange} placeholder="Bank name" /></div><div className="fg"><label>Paid To</label><input id="py_pto" name="py_pto" value={formData['py_pto'] || ''} onChange={handleChange} placeholder="Receiver name / account" /></div><div className="fg"><label>Paid By</label><select id="py_pby" name="py_pby" value={formData['py_pby'] || ''} onChange={handleChange}><option>Admin</option><option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option></select></div></div>
  <div className="sect-lbl"><i className="fa fa-calculator"></i> Amount Calculation â€” AUTO</div>
  <div className="grid3"><div className="fg"><label>Payment Amount â‚¹ *</label><input type="number" id="py_amt" name="py_amt" value={formData['py_amt'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Total Sale Amount â‚¹</label><input type="number" id="py_total" name="py_total" value={formData['py_total'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Previously Paid â‚¹</label><input type="number" id="py_prev" name="py_prev" value={formData['py_prev'] || ''} onChange={handleChange} placeholder="0"  /></div></div>
  <div className="calc-panel">
   <div className="calc-row"><span className="cl">Total Amount</span><span id="py_s1">â‚¹ 0</span></div>
   <div className="calc-row"><span className="cl">Previously Paid</span><span id="py_s2">â‚¹ 0</span></div>
   <div className="calc-row"><span className="cl">This Payment</span><span id="py_s3">â‚¹ 0</span></div>
   <div className="calc-row"><span style={{"color":"var(--warn)"}}>BALANCE PENDING</span><span id="py_bal" style={{"color":"var(--warn)"}}>â‚¹ 0</span></div>
  </div>
  <div className="grid3" style={{"marginTop":"14px"}}><div className="fg"><label>Hold Payment</label><input id="py_hold" name="py_hold" value={formData['py_hold'] || ''} onChange={handleChange} placeholder="NOC / RC / Key pending?" /></div><div className="fg"><label>Authorized By</label><select id="py_auth" name="py_auth" value={formData['py_auth'] || ''} onChange={handleChange}><option>Admin</option><option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option></select></div><div className="fg"><label>Remarks</label><input id="py_rem" name="py_rem" value={formData['py_rem'] || ''} onChange={handleChange} placeholder="Notes" /></div></div>
 </div>
 <div className="m-foot"><button className="btn btn-out"  onClick={onClose}>Cancel</button><button className="btn btn-bl" ><i className="fa fa-file-contract"></i> àªµà«‡àªšàª¾àª£ àª–àª¤ / Delivery Note</button><button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Record Payment</button></div></div>
</div>
  );
};

