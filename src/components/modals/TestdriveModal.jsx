import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const TestdriveModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
  "td_date": "",
  "td_time": "",
  "td_dur": "",
  "td_cname": "",
  "td_mob": "",
  "td_sinid": "",
  "td_regn": "",
  "td_mm": "",
  "td_year": "",
  "td_kmbefore": "",
  "td_kmafter": "",
  "td_dby": "",
  "td_stat": "",
  "td_fb": "",
  "td_rem": ""
});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'testdrive'), { ...formData, createdAt: new Date().toISOString() });
      if (onSave) { await onSave(formData); } else { onClose(); }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_testdrive">
 <div className="mbox"><div className="m-hdr"><div className="m-hdr-icon">ðŸš—</div><h3>Schedule Test Drive</h3><button className="m-close" onClick={onClose} >âœ•</button></div>
 <div className="m-body">
  <div className="grid3"><div className="fg"><label>Date *</label><input type="date" id="td_date" name="td_date" value={formData['td_date'] || ''} onChange={handleChange} /></div><div className="fg"><label>Time *</label><input type="time" id="td_time" name="td_time" value={formData['td_time'] || ''} onChange={handleChange} value="10:00" /></div><div className="fg"><label>Duration</label><select id="td_dur" name="td_dur" value={formData['td_dur'] || ''} onChange={handleChange}><option>15 mins</option><option>30 mins</option><option>45 mins</option><option>60 mins</option></select></div></div>
  <div className="grid3"><div className="fg"><label>Customer Name *</label><input id="td_cname" name="td_cname" value={formData['td_cname'] || ''} onChange={handleChange} placeholder="Customer name" /></div><div className="fg"><label>Mobile *</label><input type="tel" id="td_mob" name="td_mob" value={formData['td_mob'] || ''} onChange={handleChange} placeholder="10-digit mobile" maxLength="10" /></div><div className="fg"><label>Sales Inquiry ID</label><input id="td_sinid" name="td_sinid" value={formData['td_sinid'] || ''} onChange={handleChange} placeholder="SIN-2025-0001" /></div></div>
  <div className="grid3"><div className="fg"><label>Vehicle (Reg No.)</label><input id="td_regn" name="td_regn" value={formData['td_regn'] || ''} onChange={handleChange} placeholder="GJ-01-AB-1234" /></div><div className="fg"><label>Make / Model</label><input id="td_mm" name="td_mm" value={formData['td_mm'] || ''} onChange={handleChange} placeholder="Maruti Swift VXI" /></div><div className="fg"><label>Year</label><input id="td_year" name="td_year" value={formData['td_year'] || ''} onChange={handleChange} placeholder="2019" /></div></div>
  <div className="grid3"><div className="fg"><label>KM Before</label><input type="number" id="td_kmbefore" name="td_kmbefore" value={formData['td_kmbefore'] || ''} onChange={handleChange} placeholder="52000" /></div><div className="fg"><label>KM After</label><input type="number" id="td_kmafter" name="td_kmafter" value={formData['td_kmafter'] || ''} onChange={handleChange} placeholder="" /></div><div className="fg"><label>Driven By</label><select id="td_dby" name="td_dby" value={formData['td_dby'] || ''} onChange={handleChange}><option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option></select></div></div>
  <div className="grid2"><div className="fg"><label>Status</label><select id="td_stat" name="td_stat" value={formData['td_stat'] || ''} onChange={handleChange}><option>Scheduled</option><option>In Progress</option><option>Completed</option><option>Cancelled</option></select></div><div className="fg"><label>Customer Feedback</label><select id="td_fb" name="td_fb" value={formData['td_fb'] || ''} onChange={handleChange}><option>-</option><option>Very Interested</option><option>Interested</option><option>Not Interested</option><option>Need Time</option></select></div></div>
  <div className="fg"><label>Remarks</label><input id="td_rem" name="td_rem" value={formData['td_rem'] || ''} onChange={handleChange} placeholder="Notes" /></div>
 </div>
 <div className="m-foot"><button className="btn btn-out"  onClick={onClose}>Cancel</button><button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save</button></div></div>
</div>
  );
};

