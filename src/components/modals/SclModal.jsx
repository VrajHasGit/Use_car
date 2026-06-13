import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const SclModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
  "sc_inqid": "",
  "sc_stkid": "",
  "sc_bname": "",
  "sc_mob": "",
  "sc_make": "",
  "sc_model": "",
  "sc_regn": "",
  "sc_date": "",
  "sc_stat": "",
  "sc_mrp": "",
  "sc_disc": "",
  "sc_tok": "",
  "sc_pm": "",
  "sc_ins": "",
  "sc_rto": "",
  "sc_oth": "",
  "sc_rem": "",
  "sc_dby": ""
});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'scl'), { ...formData, createdAt: new Date().toISOString() });
      if (onSave) { await onSave(formData); } else { onClose(); }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_scl">
 <div className="mbox"><div className="m-hdr"><div className="m-hdr-icon">ðŸ†</div><h3>Sales Closer</h3><button className="m-close" onClick={onClose} >âœ•</button></div>
 <div className="m-body">
  <div className="grid3"><div className="fg"><label>Inquiry ID <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto-Fill</span></label><input id="sc_inqid" name="sc_inqid" value={formData['sc_inqid'] || ''} onChange={handleChange} placeholder="SIN-2025-0001"  /></div><div className="fg"><label>Stock ID <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto-Fill</span></label><input id="sc_stkid" name="sc_stkid" value={formData['sc_stkid'] || ''} onChange={handleChange} placeholder="STK-2025-0001"  /></div><div className="fg"><label>Buyer Name</label><input id="sc_bname" name="sc_bname" value={formData['sc_bname'] || ''} onChange={handleChange} placeholder="Name" /></div></div>
  <div className="grid3"><div className="fg"><label>Mobile</label><input id="sc_mob" name="sc_mob" value={formData['sc_mob'] || ''} onChange={handleChange} type="tel" placeholder="Mobile" /></div><div className="fg"><label>Make <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto</span></label><input id="sc_make" name="sc_make" value={formData['sc_make'] || ''} onChange={handleChange} placeholder="e.g. Maruti" /></div><div className="fg"><label>Model <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto</span></label><input id="sc_model" name="sc_model" value={formData['sc_model'] || ''} onChange={handleChange} placeholder="e.g. Swift VXI" /></div></div>
  <div className="grid3"><div className="fg"><label>Reg No. <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto</span></label><input id="sc_regn" name="sc_regn" value={formData['sc_regn'] || ''} onChange={handleChange} placeholder="GJ-01-AB-1234" /></div><div className="fg"><label>Close Date</label><input type="date" id="sc_date" name="sc_date" value={formData['sc_date'] || ''} onChange={handleChange} /></div><div className="fg"><label>Status</label><select id="sc_stat" name="sc_stat" value={formData['sc_stat'] || ''} onChange={handleChange}><option>Confirmed</option><option>Cancelled</option><option>On Hold</option></select></div></div>
  <div className="grid3"><div className="fg"><label>MRP / Listed Price â‚¹</label><input type="number" id="sc_mrp" name="sc_mrp" value={formData['sc_mrp'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Discount â‚¹</label><input type="number" id="sc_disc" name="sc_disc" value={formData['sc_disc'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Final Sale Price â‚¹ (Auto)</label><div className="calc-out" id="sc_final">â‚¹ 0</div></div></div>
  <div className="sect-lbl"><i className="fa fa-money-bill-wave"></i> Token / Charges</div>
  <div className="grid3"><div className="fg"><label>Token Amount â‚¹</label><input type="number" id="sc_tok" name="sc_tok" value={formData['sc_tok'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Token Mode</label><select id="sc_pm" name="sc_pm" value={formData['sc_pm'] || ''} onChange={handleChange}><option>Cash</option><option>NEFT</option><option>RTGS</option><option>UPI</option><option>Cheque</option><option>Finance</option></select></div><div className="fg"><label>Insurance Charge â‚¹</label><input type="number" id="sc_ins" name="sc_ins" value={formData['sc_ins'] || ''} onChange={handleChange} placeholder="0"  /></div></div>
  <div className="grid3"><div className="fg"><label>RTO Charge â‚¹</label><input type="number" id="sc_rto" name="sc_rto" value={formData['sc_rto'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Other Charges â‚¹</label><input type="number" id="sc_oth" name="sc_oth" value={formData['sc_oth'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Total Amount â‚¹ (Auto)</label><div className="calc-out" id="sc_total">â‚¹ 0</div></div></div>
  <div className="grid2"><div className="fg"><label>Remarks</label><input id="sc_rem" name="sc_rem" value={formData['sc_rem'] || ''} onChange={handleChange} placeholder="Notes" /></div><div className="fg"><label>Closer By</label><select id="sc_dby" name="sc_dby" value={formData['sc_dby'] || ''} onChange={handleChange}><option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option></select></div></div>
 </div>
 <div className="m-foot"><button className="btn btn-out"  onClick={onClose}>Cancel</button><button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save</button></div></div>
</div>
  );
};

