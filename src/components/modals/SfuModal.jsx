import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const SfuModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
  "sf_inqid": "",
  "sf_cname": "",
  "sf_mob": "",
  "sf_make": "",
  "sf_model": "",
  "sf_regn": "",
  "sf_date": "",
  "sf_mode": "",
  "sf_seq": "",
  "sf_stat": "",
  "sf_nfd": "",
  "sf_exec": "",
  "sf_rem": ""
});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'sfu'), { ...formData, createdAt: new Date().toISOString() });
      if (onSave) { await onSave(formData); } else { onClose(); }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_sfu">
 <div className="mbox"><div className="m-hdr"><div className="m-hdr-icon">ðŸ’¬</div><h3>Sales Follow-Up</h3><button className="m-close" onClick={onClose} >âœ•</button></div>
 <div className="m-body">
  <div className="grid3"><div className="fg"><label>Inquiry ID <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto-Fill</span></label><input id="sf_inqid" name="sf_inqid" value={formData['sf_inqid'] || ''} onChange={handleChange} placeholder="SIN-2025-0001"  /></div><div className="fg"><label>Customer Name</label><input id="sf_cname" name="sf_cname" value={formData['sf_cname'] || ''} onChange={handleChange} placeholder="Name" /></div><div className="fg"><label>Mobile</label><input id="sf_mob" name="sf_mob" value={formData['sf_mob'] || ''} onChange={handleChange} type="tel" placeholder="Mobile" /></div></div>
  <div className="grid3"><div className="fg"><label>Make <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto</span></label><input id="sf_make" name="sf_make" value={formData['sf_make'] || ''} onChange={handleChange} placeholder="e.g. Maruti" /></div><div className="fg"><label>Model <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto</span></label><input id="sf_model" name="sf_model" value={formData['sf_model'] || ''} onChange={handleChange} placeholder="e.g. Swift VXI" /></div><div className="fg"><label>Reg No. <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto</span></label><input id="sf_regn" name="sf_regn" value={formData['sf_regn'] || ''} onChange={handleChange} placeholder="GJ-01-AB-1234" /></div></div>
  <div className="grid3"><div className="fg"><label>Follow-Up Date *</label><input type="date" id="sf_date" name="sf_date" value={formData['sf_date'] || ''} onChange={handleChange} /></div><div className="fg"><label>Mode</label><select id="sf_mode" name="sf_mode" value={formData['sf_mode'] || ''} onChange={handleChange}><option>Call</option><option>WhatsApp</option><option>Visit</option><option>Email</option></select></div><div className="fg"><label>Sequence</label><select id="sf_seq" name="sf_seq" value={formData['sf_seq'] || ''} onChange={handleChange}><option>1st Call</option><option>2nd Call</option><option>3rd Call</option><option>Final Call</option></select></div></div>
  <div className="grid3"><div className="fg"><label>Status</label><select id="sf_stat" name="sf_stat" value={formData['sf_stat'] || ''} onChange={handleChange}><option>Interested</option><option>Not Interested</option><option>Callback</option><option>Site Visit</option><option>Closed-Won</option><option>Closed-Lost</option></select></div><div className="fg"><label>Next Follow-Up Date</label><input type="date" id="sf_nfd" name="sf_nfd" value={formData['sf_nfd'] || ''} onChange={handleChange} /></div><div className="fg"><label>Executive</label><select id="sf_exec" name="sf_exec" value={formData['sf_exec'] || ''} onChange={handleChange}><option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option></select></div></div>
  <div className="grid1"><div className="fg"><label>Remarks</label><textarea id="sf_rem" name="sf_rem" value={formData['sf_rem'] || ''} onChange={handleChange} placeholder="Notesâ€¦"></textarea></div></div>
 </div>
 <div className="m-foot"><button className="btn btn-out"  onClick={onClose}>Cancel</button><button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save</button></div></div>
</div>
  );
};

