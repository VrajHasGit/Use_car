import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const DelModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
  "dl_obid": "",
  "dl_cname": "",
  "dl_veh": "",
  "dl_regn": "",
  "dl_exp": "",
  "dl_act": "",
  "dl_by": "",
  "dl_stat": "",
  "dl_rem": ""
});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'del'), { ...formData, createdAt: new Date().toISOString() });
      alert('Record saved successfully!');
      onClose();
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_del">
 <div className="mbox"><div className="m-hdr"><div className="m-hdr-icon">🚚</div><h3>Delivery Record</h3><button className="m-close" onClick={onClose} >✕</button></div>
 <div className="m-body">
  <div className="grid3"><div className="fg"><label>Booking ID <span style={{"color":"var(--or1)","fontSize":"10px"}}>⚡ Auto-Fill</span></label><input id="dl_obid" name="dl_obid" value={formData['dl_obid'] || ''} onChange={handleChange} placeholder="OB-2025-0001 / SOB-2025-0001"  /></div><div className="fg"><label>Customer Name</label><input id="dl_cname" name="dl_cname" value={formData['dl_cname'] || ''} onChange={handleChange} placeholder="Buyer name" /></div><div className="fg"><label>Vehicle Details</label><input id="dl_veh" name="dl_veh" value={formData['dl_veh'] || ''} onChange={handleChange} placeholder="Make Model Reg No." /></div></div>
  <div className="grid3"><div className="fg"><label>Registration No. <span style={{"color":"var(--or1)","fontSize":"10px"}}>⚡ Auto</span></label><input id="dl_regn" name="dl_regn" value={formData['dl_regn'] || ''} onChange={handleChange} placeholder="GJ-01-AB-1234" style={{"fontWeight":"700","color":"var(--or2)"}} /></div><div className="fg"><label>Expected Delivery Date</label><input type="date" id="dl_exp" name="dl_exp" value={formData['dl_exp'] || ''} onChange={handleChange} /></div><div className="fg"><label>Actual Delivery Date</label><input type="date" id="dl_act" name="dl_act" value={formData['dl_act'] || ''} onChange={handleChange} /></div></div>
  <div className="grid2"><div className="fg"><label>Delivered By</label><input id="dl_by" name="dl_by" value={formData['dl_by'] || ''} onChange={handleChange} placeholder="Executive name" /></div><div className="fg"><label>Delivery Status</label><select id="dl_stat" name="dl_stat" value={formData['dl_stat'] || ''} onChange={handleChange}><option>Scheduled</option><option>Delivered</option><option>Delayed</option><option>Cancelled</option></select></div></div>
  <div className="grid1"><div className="fg"><label>Remarks</label><input id="dl_rem" name="dl_rem" value={formData['dl_rem'] || ''} onChange={handleChange} placeholder="Notes" /></div></div>
 </div>
 <div className="m-foot"><button className="btn btn-out"  onClick={onClose}>Cancel</button><button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save</button></div></div>
</div>
  );
};
