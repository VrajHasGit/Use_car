import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { autoFillFromInq } from '../../utils/relations';

export const PfuModal = ({ isOpen, onClose, onSave, editData, quickInqId }) => {
  const [formData, setFormData] = useState({
  "pf_inqid": "",
  "pf_sname": "",
  "pf_smob": "",
  "pf_veh": "",
  "pf_var": "",
  "pf_year": "",
  "pf_fuel": "",
  "pf_km": "",
  "pf_own": "",
  "pf_date": "",
  "pf_time": "",
  "pf_mode": "",
  "pf_by": "",
  "pf_seq": "",
  "pf_exch": "",
  "pf_stat": "",
  "pf_nfd": "",
  "pf_exec": "",
  "pf_nego": "",
  "pf_exp": "",
  "pf_offer": "",
  "pf_close": "",
  "pf_rej": "",
  "pf_rem": ""
});

  useEffect(() => {
    if (isOpen && quickInqId) {
      setFormData(prev => ({ ...prev, pf_inqid: quickInqId }));
      autoFillFromInq(quickInqId).then(inqData => {
        if (inqData) {
          setFormData(prev => ({
            ...prev,
            pf_sname: inqData.sellerName || '',
            pf_smob: inqData.mobile || '',
            pf_veh: inqData.make ? `${inqData.make} ${inqData.model || ''}` : '',
            pf_year: inqData.year || '',
            pf_fuel: inqData.fuel || ''
          }));
        }
      });
    }
  }, [isOpen, quickInqId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'pf_inqid' && value.length >= 5) {
      autoFillFromInq(value).then(inqData => {
        if (inqData) {
          setFormData(prev => ({
            ...prev,
            pf_sname: inqData.sellerName || '',
            pf_smob: inqData.mobile || '',
            pf_veh: inqData.make ? `${inqData.make} ${inqData.model || ''}` : '',
            pf_year: inqData.year || '',
            pf_fuel: inqData.fuel || ''
          }));
        }
      });
    }
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'pfu'), { ...formData, createdAt: new Date().toISOString() });
      if (onSave) { await onSave(formData); } else { onClose(); }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay on" id="m_pfu">
 <div className="mbox"><div className="m-hdr"><div className="m-hdr-icon">ðŸ“ž</div><h3>Purchase Follow-Up</h3><button className="m-close" onClick={onClose} >âœ•</button></div>
 <div className="m-body">
  <div className="grid3"><div className="fg"><label>Inquiry ID <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto-Fill</span></label><input id="pf_inqid" name="pf_inqid" value={formData['pf_inqid'] || ''} onChange={handleChange} placeholder="INQ-2025-0001"  /></div><div className="fg"><label>Seller Name</label><input id="pf_sname" name="pf_sname" value={formData['pf_sname'] || ''} onChange={handleChange} placeholder="Auto-filled" /></div><div className="fg"><label>Seller Mobile</label><input id="pf_smob" name="pf_smob" value={formData['pf_smob'] || ''} onChange={handleChange} type="tel" placeholder="Mobile" /></div></div>
  <div className="grid3"><div className="fg"><label>Vehicle Make/Model</label><input id="pf_veh" name="pf_veh" value={formData['pf_veh'] || ''} onChange={handleChange} placeholder="Make Model Year" /></div><div className="fg"><label>Variant</label><input id="pf_var" name="pf_var" value={formData['pf_var'] || ''} onChange={handleChange} placeholder="Variant" /></div><div className="fg"><label>Year</label><input id="pf_year" name="pf_year" value={formData['pf_year'] || ''} onChange={handleChange} placeholder="Year" type="number" /></div></div>
  <div className="grid3"><div className="fg"><label>Fuel Type</label><select id="pf_fuel" name="pf_fuel" value={formData['pf_fuel'] || ''} onChange={handleChange}><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option></select></div><div className="fg"><label>KM Driven</label><input id="pf_km" name="pf_km" value={formData['pf_km'] || ''} onChange={handleChange} type="number" placeholder="KM" /></div><div className="fg"><label>Owners</label><select id="pf_own" name="pf_own" value={formData['pf_own'] || ''} onChange={handleChange}><option>1st</option><option>2nd</option><option>3rd</option></select></div></div>
  <div className="grid3"><div className="fg"><label>Follow-Up Date *</label><input type="date" id="pf_date" name="pf_date" value={formData['pf_date'] || ''} onChange={handleChange} /></div><div className="fg"><label>Follow-Up Time</label><input type="time" id="pf_time" name="pf_time" value={formData['pf_time'] || ''} onChange={handleChange} /></div><div className="fg"><label>Follow-Up Mode</label><select id="pf_mode" name="pf_mode" value={formData['pf_mode'] || ''} onChange={handleChange}><option>Call</option><option>WhatsApp</option><option>Visit</option><option>Email</option><option>SMS</option></select></div></div>
  <div className="grid3"><div className="fg"><label>Follow-Up By</label><input id="pf_by" name="pf_by" value={formData['pf_by'] || ''} onChange={handleChange} placeholder="Executive name" /></div><div className="fg"><label>Call Sequence</label><select id="pf_seq" name="pf_seq" value={formData['pf_seq'] || ''} onChange={handleChange}><option>1st Call</option><option>2nd Call</option><option>3rd Call</option><option>Final Call</option></select></div><div className="fg"><label>Exchange Vehicle</label><select id="pf_exch" name="pf_exch" value={formData['pf_exch'] || ''} onChange={handleChange}><option>No</option><option>Yes</option></select></div></div>
  <div className="grid3"><div className="fg"><label>Follow-Up Status</label><select id="pf_stat" name="pf_stat" value={formData['pf_stat'] || ''} onChange={handleChange}><option>Interested</option><option>Not Interested</option><option>Callback</option><option>Price Nego</option><option>Closed-Won</option><option>Closed-Lost</option></select></div><div className="fg"><label>Next Follow-Up Date</label><input type="date" id="pf_nfd" name="pf_nfd" value={formData['pf_nfd'] || ''} onChange={handleChange} /></div><div className="fg"><label>Follow-Up Executive</label><select id="pf_exec" name="pf_exec" value={formData['pf_exec'] || ''} onChange={handleChange}><option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option></select></div></div>
  <div className="sect-lbl"><i className="fa fa-indian-rupee-sign"></i> Price Negotiation (Auto-Calc)</div>
  <div className="grid3"><div className="fg"><label>Negotiable Price â‚¹</label><input type="number" id="pf_nego" name="pf_nego" value={formData['pf_nego'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Customer Expectation â‚¹</label><input type="number" id="pf_exp" name="pf_exp" value={formData['pf_exp'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Offer Price â‚¹</label><input type="number" id="pf_offer" name="pf_offer" value={formData['pf_offer'] || ''} onChange={handleChange} placeholder="0"  /></div></div>
  <div className="grid2"><div className="fg"><label>Deal Close Price â‚¹</label><input type="number" id="pf_close" name="pf_close" value={formData['pf_close'] || ''} onChange={handleChange} placeholder="0" /></div><div className="fg"><label>Difference (Nego - Offer) â‚¹</label><div className="calc-out" id="pf_diff">â‚¹ 0</div></div></div>
  <div className="grid2"><div className="fg"><label>Rejection Reason</label><input id="pf_rej" name="pf_rej" value={formData['pf_rej'] || ''} onChange={handleChange} placeholder="If rejectedâ€¦" /></div><div className="fg"><label>Remarks</label><input id="pf_rem" name="pf_rem" value={formData['pf_rem'] || ''} onChange={handleChange} placeholder="Notes" /></div></div>
 </div>
 <div className="m-foot"><button className="btn btn-out"  onClick={onClose}>Cancel</button><button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save</button></div></div>
</div>
  );
};

