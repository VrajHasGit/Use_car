import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { autoFillFromInq } from '../../utils/relations';

export const ValModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
  "v_inqid": "",
  "v_date": "",
  "v_vnum": "",
  "v_cname": "",
  "v_cont": "",
  "v_km": "",
  "v_make": "",
  "v_model": "",
  "v_var": "",
  "v_year": "",
  "v_fuel": "",
  "v_own": "",
  "v_rc": "",
  "v_svc": "",
  "v_acc": "",
  "v_tyre": "",
  "v_eng": "",
  "v_ovr": "",
  "v_stat": "",
  "v_nextfu": "",
  "v_rem": ""
});

  if (!isOpen) return null;

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'v_inqid' && value.length >= 5) {
      const inqData = await autoFillFromInq(value);
      if (inqData) {
        setFormData(prev => ({
          ...prev,
          v_cname: inqData.sellerName || '',
          v_cont: inqData.mobile || '',
          v_make: inqData.make || '',
          v_model: inqData.model || '',
          v_year: inqData.year || '',
          v_fuel: inqData.fuel || ''
        }));
      }
    }
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'val'), { ...formData, createdAt: new Date().toISOString() });
      if (onSave) { await onSave(formData); } else { onClose(); }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_val">
 <div className="mbox"><div className="m-hdr"><div className="m-hdr-icon">ðŸ”</div><h3>Vehicle Valuation</h3><button className="m-close" onClick={onClose} >âœ•</button></div>
 <div className="m-body">
  <div className="grid3"><div className="fg"><label>Inquiry ID <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto-Fill</span></label><input id="v_inqid" name="v_inqid" value={formData['v_inqid'] || ''} onChange={handleChange} placeholder="INQ-2025-0001"  /></div><div className="fg"><label>Valuation Date</label><input type="date" id="v_date" name="v_date" value={formData['v_date'] || ''} onChange={handleChange} /></div><div className="fg"><label>Vehicle Number</label><input id="v_vnum" name="v_vnum" value={formData['v_vnum'] || ''} onChange={handleChange} placeholder="GJ-01-AB-1234" /></div></div>
  <div className="grid3"><div className="fg"><label>Customer Name</label><input id="v_cname" name="v_cname" value={formData['v_cname'] || ''} onChange={handleChange} placeholder="Name" /></div><div className="fg"><label>Contact No.</label><input id="v_cont" name="v_cont" value={formData['v_cont'] || ''} onChange={handleChange} type="tel" placeholder="Mobile" /></div><div className="fg"><label>KM Driven</label><input id="v_km" name="v_km" value={formData['v_km'] || ''} onChange={handleChange} type="number" placeholder="KM" /></div></div>
  <div className="grid3"><div className="fg"><label>Make</label><select id="v_make" name="v_make" value={formData['v_make'] || ''} onChange={handleChange}><option value="">Select Brand</option></select></div><div className="fg"><label>Model</label><input id="v_model" name="v_model" value={formData['v_model'] || ''} onChange={handleChange} placeholder="Model" /></div><div className="fg"><label>Variant</label><input id="v_var" name="v_var" value={formData['v_var'] || ''} onChange={handleChange} placeholder="Variant" /></div></div>
  <div className="grid3"><div className="fg"><label>Year</label><select id="v_year" name="v_year" value={formData['v_year'] || ''} onChange={handleChange}><option value="">Year</option></select></div><div className="fg"><label>Fuel Type</label><select id="v_fuel" name="v_fuel" value={formData['v_fuel'] || ''} onChange={handleChange}><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option></select></div><div className="fg"><label>Owner Serial</label><select id="v_own" name="v_own" value={formData['v_own'] || ''} onChange={handleChange}><option>1st</option><option>2nd</option><option>3rd</option><option>4th+</option></select></div></div>
  <div className="sect-lbl"><i className="fa fa-clipboard-check"></i> Inspection Checklist</div>
  <div className="chk-grid">
   <label className="chk-item"><input type="checkbox" id="v_rc" name="v_rc" value={formData['v_rc'] || ''} onChange={handleChange} /><span>RC Available</span></label>
   <label className="chk-item"><input type="checkbox" id="v_svc" name="v_svc" value={formData['v_svc'] || ''} onChange={handleChange} /><span>Service Record Available</span></label>
   <label className="chk-item"><input type="checkbox" id="v_acc" name="v_acc" value={formData['v_acc'] || ''} onChange={handleChange} /><span>No Accident History</span></label>
  </div>
  <div className="grid3"><div className="fg"><label>Tyre Condition</label><select id="v_tyre" name="v_tyre" value={formData['v_tyre'] || ''} onChange={handleChange}><option>Good</option><option>Average</option><option>Bad</option></select></div><div className="fg"><label>Engine Condition</label><select id="v_eng" name="v_eng" value={formData['v_eng'] || ''} onChange={handleChange}><option>Good</option><option>Repair Required</option></select></div><div className="fg"><label>Overall Condition</label><select id="v_ovr" name="v_ovr" value={formData['v_ovr'] || ''} onChange={handleChange}><option>Excellent</option><option>Good</option><option>Average</option><option>Poor</option></select></div></div>
  <div className="grid3"><div className="fg"><label>Status</label><select id="v_stat" name="v_stat" value={formData['v_stat'] || ''} onChange={handleChange}><option>Pending</option><option>Done</option><option>Approved</option><option>Rejected</option><option>Hold</option></select></div><div className="fg"><label>Next Follow-Up Date <span style={{"color":"var(--or1)","fontSize":"10px"}}>ðŸ“… PFU ma auto-set</span></label><input type="date" id="v_nextfu" name="v_nextfu" value={formData['v_nextfu'] || ''} onChange={handleChange} /></div><div className="fg"><label>Remarks</label><input id="v_rem" name="v_rem" value={formData['v_rem'] || ''} onChange={handleChange} placeholder="Notes" /></div></div>

  <div className="sect-lbl"><i className="fa fa-camera"></i> Photos & Video Upload</div>
  <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius)","padding":"16px","marginBottom":"14px"}}>
   <div className="grid2" style={{"marginBottom":"12px"}}>
    <div className="fg">
     <label>ðŸ“¸ Vehicle Photos (Multiple)</label>
     <div className="upload-box" id="photoBox" >
      <i className="fa fa-images" style={{"fontSize":"28px","color":"var(--or1)","marginBottom":"6px","display":"block"}}></i>
      <span style={{"fontSize":"12px","color":"var(--text2)"}}>Click to upload photos</span>
      <span style={{"fontSize":"10px","color":"var(--text3)","marginTop":"3px","display":"block"}}>JPG, PNG â€” Multiple allowed</span>
      <input type="file" id="v_photos" accept="image/*" multiple style={{"display":"none"}}  />
     </div>
    </div>
    <div className="fg">
     <label>ðŸŽ¥ Vehicle Video (360Â° / Walk-around)</label>
     <div className="upload-box" id="videoBox" >
      <i className="fa fa-video" style={{"fontSize":"28px","color":"var(--bl5)","marginBottom":"6px","display":"block"}}></i>
      <span style={{"fontSize":"12px","color":"var(--text2)"}}>Click to upload video</span>
      <span style={{"fontSize":"10px","color":"var(--text3)","marginTop":"3px","display":"block"}}>MP4, MOV â€” Max 100MB</span>
      <input type="file" id="v_video" accept="video/*" style={{"display":"none"}}  />
     </div>
    </div>
   </div>
   <div id="photoPreview" style={{"display":"none","marginTop":"10px"}}>
    <div style={{"fontSize":"10px","fontWeight":"700","letterSpacing":".8px","textTransform":"uppercase","color":"var(--text3)","marginBottom":"8px"}}>ðŸ“¸ UPLOADED PHOTOS</div>
    <div id="photoGrid" style={{"display":"flex","flexWrap":"wrap","gap":"8px"}}></div>
   </div>
   <div id="videoPreview" style={{"display":"none","marginTop":"10px"}}>
    <div style={{"fontSize":"10px","fontWeight":"700","letterSpacing":".8px","textTransform":"uppercase","color":"var(--text3)","marginBottom":"8px"}}>ðŸŽ¥ UPLOADED VIDEO</div>
    <video id="videoPlayer" controls style={{"width":"100%","maxHeight":"200px","borderRadius":"var(--radius-sm)","background":"#000","border":"1px solid var(--border2)"}}></video>
    <div id="videoInfo" style={{"fontSize":"11px","color":"var(--text3)","marginTop":"5px"}}></div>
   </div>
  </div>
  </div>
 </div>
 <div className="m-foot"><button className="btn btn-out"  onClick={onClose}>Cancel</button><button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save</button></div></div>
  );
};

