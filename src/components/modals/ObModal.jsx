import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const ObModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
  "ob_clid": "",
  "ob_inqid": "",
  "ob_date": "",
  "ob_cname": "",
  "ob_cont": "",
  "ob_email": "",
  "ob_addr": "",
  "ob_branch": "",
  "ob_mm": "",
  "ob_color": "",
  "ob_fuel": "",
  "ob_chas": "",
  "ob_eng": "",
  "ob_regn": "",
  "ob_year": "",
  "ob_ownt": "",
  "ob_km": "",
  "ob_instype": "",
  "ob_insname": "",
  "ob_insval": "",
  "ob_rtoname": "",
  "ob_hpa": "",
  "ob_val": "",
  "ob_pp": "",
  "ob_rc": "",
  "ob_rto": "",
  "ob_cash": "",
  "ob_online": "",
  "ob_oth": "",
  "ob_brkname": "",
  "ob_brkno": "",
  "ob_src": "",
  "ob_noc": "",
  "ob_rem": "",
  "ob_pname": "",
  "ob_spname": "",
  "ob_recv": "",
  "ob_doc_rc": "",
  "ob_doc_ins": "",
  "ob_doc_puc": "",
  "ob_doc_pan": "",
  "ob_doc_adh": "",
  "ob_doc_f29": "",
  "ob_doc_f30": "",
  "ob_doc_f28": "",
  "ob_doc_noc": "",
  "ob_doc_key": "",
  "ob_doc_svc": "",
  "ob_doc_inv": "",
  "ob_doc_miss": "",
  "ob_doc_stat": ""
});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'ob'), { ...formData, createdAt: new Date().toISOString() });
      alert('Record saved successfully!');
      onClose();
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_ob">
 <div className="mbox"><div className="m-hdr"><div className="m-hdr-icon">📝</div><h3>Purchase Order Booking</h3><button className="m-close" onClick={onClose} >✕</button></div>
 <div className="m-body">
  <div className="grid3"><div className="fg"><label>Closer ID <span style={{"color":"var(--or1)","fontSize":"10px"}}>⚡ Auto-Fill</span></label><input id="ob_clid" name="ob_clid" value={formData['ob_clid'] || ''} onChange={handleChange} placeholder="PCL-2025-0001"  /></div><div className="fg"><label>Inquiry ID <span style={{"color":"var(--bl5)","fontSize":"10px"}}>⚡ Auto-Fill</span></label><input id="ob_inqid" name="ob_inqid" value={formData['ob_inqid'] || ''} onChange={handleChange} placeholder="INQ-2025-0001"  /></div><div className="fg"><label>Booking Date</label><input type="date" id="ob_date" name="ob_date" value={formData['ob_date'] || ''} onChange={handleChange} /></div></div>
  <div className="sect-lbl"><i className="fa fa-user"></i> Client Details</div>
  <div className="grid3"><div className="fg"><label>Client Name *</label><input id="ob_cname" name="ob_cname" value={formData['ob_cname'] || ''} onChange={handleChange} placeholder="Full name" /></div><div className="fg"><label>Contact No. *</label><input id="ob_cont" name="ob_cont" value={formData['ob_cont'] || ''} onChange={handleChange} type="tel" placeholder="Mobile" /></div><div className="fg"><label>Email ID</label><input id="ob_email" name="ob_email" value={formData['ob_email'] || ''} onChange={handleChange} type="email" placeholder="Email" /></div></div>
  <div className="grid2"><div className="fg"><label>Client Address</label><input id="ob_addr" name="ob_addr" value={formData['ob_addr'] || ''} onChange={handleChange} placeholder="Address" /></div><div className="fg"><label>Branch</label><select id="ob_branch" name="ob_branch" value={formData['ob_branch'] || ''} onChange={handleChange}><option>SG Highway</option><option>Vastral</option><option>Head Office</option></select></div></div>
  <div className="sect-lbl"><i className="fa fa-car"></i> Vehicle Details</div>
  <div className="grid3"><div className="fg"><label>Make & Model</label><input id="ob_mm" name="ob_mm" value={formData['ob_mm'] || ''} onChange={handleChange} placeholder="Maruti Swift VXI" /></div><div className="fg"><label>Color</label><select id="ob_color" name="ob_color" value={formData['ob_color'] || ''} onChange={handleChange}><option>White</option><option>Silver</option><option>Grey</option><option>Black</option><option>Red</option><option>Blue</option><option>Other</option></select></div><div className="fg"><label>Fuel Type</label><select id="ob_fuel" name="ob_fuel" value={formData['ob_fuel'] || ''} onChange={handleChange}><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option></select></div></div>
  <div className="grid3"><div className="fg"><label>Chassis No.</label><input id="ob_chas" name="ob_chas" value={formData['ob_chas'] || ''} onChange={handleChange} placeholder="17-char VIN" /></div><div className="fg"><label>Engine No.</label><input id="ob_eng" name="ob_eng" value={formData['ob_eng'] || ''} onChange={handleChange} placeholder="Engine number" /></div><div className="fg"><label>Registration No.</label><input id="ob_regn" name="ob_regn" value={formData['ob_regn'] || ''} onChange={handleChange} placeholder="GJ-01-AB-1234" /></div></div>
  <div className="grid3"><div className="fg"><label>Mfg Year</label><select id="ob_year" name="ob_year" value={formData['ob_year'] || ''} onChange={handleChange}><option value="">Year</option></select></div><div className="fg"><label>Ownership Type</label><select id="ob_ownt" name="ob_ownt" value={formData['ob_ownt'] || ''} onChange={handleChange}><option>1st Owner</option><option>2nd Owner</option><option>3rd Owner</option></select></div><div className="fg"><label>Mileage (KM)</label><input id="ob_km" name="ob_km" value={formData['ob_km'] || ''} onChange={handleChange} type="number" placeholder="KM" /></div></div>
  <div className="grid3"><div className="fg"><label>Insurance Type</label><select id="ob_instype" name="ob_instype" value={formData['ob_instype'] || ''} onChange={handleChange}><option>Comprehensive</option><option>Third Party</option><option>Zero Dep</option></select></div><div className="fg"><label>Name in Insurance</label><input id="ob_insname" name="ob_insname" value={formData['ob_insname'] || ''} onChange={handleChange} placeholder="Owner name" /></div><div className="fg"><label>Insurance Validity</label><input type="date" id="ob_insval" name="ob_insval" value={formData['ob_insval'] || ''} onChange={handleChange} /></div></div>
  <div className="grid3"><div className="fg"><label>Name in RTO Book</label><input id="ob_rtoname" name="ob_rtoname" value={formData['ob_rtoname'] || ''} onChange={handleChange} placeholder="RC owner name" /></div><div className="fg"><label>HPA Bank Name</label><input id="ob_hpa" name="ob_hpa" value={formData['ob_hpa'] || ''} onChange={handleChange} placeholder="Financer" /></div><div className="fg"><label>Valuator Name</label><select id="ob_val" name="ob_val" value={formData['ob_val'] || ''} onChange={handleChange}><option value="">-- Select Valuator --</option><option>Rizwan Sandhi</option><option>Spinny</option><option>Car24</option><option>Other</option></select></div></div>
  <div className="sect-lbl"><i className="fa fa-calculator"></i> Cost Calculation (Auto)</div>
  <div className="grid3"><div className="fg"><label>Purchase Price ₹</label><input type="number" id="ob_pp" name="ob_pp" value={formData['ob_pp'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Refurbishment Cost ₹</label><input type="number" id="ob_rc" name="ob_rc" value={formData['ob_rc'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>RTO Challan Amount ₹</label><input type="number" id="ob_rto" name="ob_rto" value={formData['ob_rto'] || ''} onChange={handleChange} placeholder="0"  /></div></div>
  <div className="grid3"><div className="fg"><label>Cash ₹</label><input type="number" id="ob_cash" name="ob_cash" value={formData['ob_cash'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Online ₹</label><input type="number" id="ob_online" name="ob_online" value={formData['ob_online'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Other Costs ₹</label><input type="number" id="ob_oth" name="ob_oth" value={formData['ob_oth'] || ''} onChange={handleChange} placeholder="0"  /></div></div>
  <div className="calc-panel">
   <div className="calc-row"><span className="cl">Purchase Price</span><span id="ob_s1">₹ 0</span></div>
   <div className="calc-row"><span className="cl">Refurbishment</span><span id="ob_s2">₹ 0</span></div>
   <div className="calc-row"><span className="cl">RTO Challan</span><span id="ob_s3">₹ 0</span></div>
   <div className="calc-row"><span className="cl">Other Costs</span><span id="ob_s4">₹ 0</span></div>
   <div className="calc-row"><span>TOTAL COST</span><span id="ob_total" style={{"color":"var(--or2)"}}>₹ 0</span></div>
  </div>
  <div className="grid3" style={{"marginTop":"14px"}}><div className="fg"><label>Broker Name</label><input id="ob_brkname" name="ob_brkname" value={formData['ob_brkname'] || ''} onChange={handleChange} placeholder="Broker" /></div><div className="fg"><label>Broker No.</label><input id="ob_brkno" name="ob_brkno" value={formData['ob_brkno'] || ''} onChange={handleChange} type="tel" placeholder="Mobile" /></div><div className="fg"><label>Source Channel</label><select id="ob_src" name="ob_src" value={formData['ob_src'] || ''} onChange={handleChange}><option>OLX</option><option>CarDekho</option><option>Walk-in</option><option>Reference</option><option>Social Media</option></select></div></div>
  <div className="grid2"><div className="fg"><label>NOC / Outstanding Amount</label><input id="ob_noc" name="ob_noc" value={formData['ob_noc'] || ''} onChange={handleChange} placeholder="NOC details" /></div><div className="fg"><label>Remark</label><input id="ob_rem" name="ob_rem" value={formData['ob_rem'] || ''} onChange={handleChange} placeholder="Notes" /></div></div>
  <div className="grid3"><div className="fg"><label>Partner Name</label><select id="ob_pname" name="ob_pname" value={formData['ob_pname'] || ''} onChange={handleChange}><option value="">-- Select Partner --</option><option>Rajan Desai</option><option>Ritesh Shah</option><option>Rohan Mehta</option><option>Ronak Mehta</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Other</option></select></div><div className="fg"><label>Support Partner</label><select id="ob_spname" name="ob_spname" value={formData['ob_spname'] || ''} onChange={handleChange}><option value="">-- Select Support Partner --</option><option>Rajan Desai</option><option>Ritesh Shah</option><option>Rohan Mehta</option><option>Ronak Mehta</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Other</option></select></div><div className="fg"><label>Car Received Date</label><input type="date" id="ob_recv" name="ob_recv" value={formData['ob_recv'] || ''} onChange={handleChange} /></div></div>

  
  <div className="sect-lbl" style={{"marginTop":"10px"}}><i className="fa fa-file-contract"></i> Document Checklist <span style={{"fontSize":"10px","color":"var(--text3)","fontWeight":"400","marginLeft":"6px"}}>(Tick jo document available hoy)</span></div>
  <div style={{"background":"var(--surface2)","border":"1px solid var(--border)","borderRadius":"var(--radius)","padding":"14px","display":"grid","gridTemplateColumns":"repeat(auto-fill,minmax(140px,1fr))","gap":"10px"}}>
    <label style={{"display":"flex","alignItems":"center","gap":"7px","fontSize":"12px","cursor":"pointer","color":"var(--text2)"}}><input type="checkbox" id="ob_doc_rc" name="ob_doc_rc" value={formData['ob_doc_rc'] || ''} onChange={handleChange} style={{"accentColor":"var(--or1)","width":"15px","height":"15px"}} /> RC Book</label>
    <label style={{"display":"flex","alignItems":"center","gap":"7px","fontSize":"12px","cursor":"pointer","color":"var(--text2)"}}><input type="checkbox" id="ob_doc_ins" name="ob_doc_ins" value={formData['ob_doc_ins'] || ''} onChange={handleChange} style={{"accentColor":"var(--or1)","width":"15px","height":"15px"}} /> Insurance</label>
    <label style={{"display":"flex","alignItems":"center","gap":"7px","fontSize":"12px","cursor":"pointer","color":"var(--text2)"}}><input type="checkbox" id="ob_doc_puc" name="ob_doc_puc" value={formData['ob_doc_puc'] || ''} onChange={handleChange} style={{"accentColor":"var(--or1)","width":"15px","height":"15px"}} /> PUC</label>
    <label style={{"display":"flex","alignItems":"center","gap":"7px","fontSize":"12px","cursor":"pointer","color":"var(--text2)"}}><input type="checkbox" id="ob_doc_pan" name="ob_doc_pan" value={formData['ob_doc_pan'] || ''} onChange={handleChange} style={{"accentColor":"var(--or1)","width":"15px","height":"15px"}} /> PAN Card</label>
    <label style={{"display":"flex","alignItems":"center","gap":"7px","fontSize":"12px","cursor":"pointer","color":"var(--text2)"}}><input type="checkbox" id="ob_doc_adh" name="ob_doc_adh" value={formData['ob_doc_adh'] || ''} onChange={handleChange} style={{"accentColor":"var(--or1)","width":"15px","height":"15px"}} /> Aadhaar</label>
    <label style={{"display":"flex","alignItems":"center","gap":"7px","fontSize":"12px","cursor":"pointer","color":"var(--text2)"}}><input type="checkbox" id="ob_doc_f29" name="ob_doc_f29" value={formData['ob_doc_f29'] || ''} onChange={handleChange} style={{"accentColor":"var(--or1)","width":"15px","height":"15px"}} /> Form 29</label>
    <label style={{"display":"flex","alignItems":"center","gap":"7px","fontSize":"12px","cursor":"pointer","color":"var(--text2)"}}><input type="checkbox" id="ob_doc_f30" name="ob_doc_f30" value={formData['ob_doc_f30'] || ''} onChange={handleChange} style={{"accentColor":"var(--or1)","width":"15px","height":"15px"}} /> Form 30</label>
    <label style={{"display":"flex","alignItems":"center","gap":"7px","fontSize":"12px","cursor":"pointer","color":"var(--text2)"}}><input type="checkbox" id="ob_doc_f28" name="ob_doc_f28" value={formData['ob_doc_f28'] || ''} onChange={handleChange} style={{"accentColor":"var(--or1)","width":"15px","height":"15px"}} /> Form 28</label>
    <label style={{"display":"flex","alignItems":"center","gap":"7px","fontSize":"12px","cursor":"pointer","color":"var(--text2)"}}><input type="checkbox" id="ob_doc_noc" name="ob_doc_noc" value={formData['ob_doc_noc'] || ''} onChange={handleChange} style={{"accentColor":"var(--or1)","width":"15px","height":"15px"}} /> NOC Bank</label>
    <label style={{"display":"flex","alignItems":"center","gap":"7px","fontSize":"12px","cursor":"pointer","color":"var(--text2)"}}><input type="checkbox" id="ob_doc_key" name="ob_doc_key" value={formData['ob_doc_key'] || ''} onChange={handleChange} style={{"accentColor":"var(--or1)","width":"15px","height":"15px"}} /> Spare Key</label>
    <label style={{"display":"flex","alignItems":"center","gap":"7px","fontSize":"12px","cursor":"pointer","color":"var(--text2)"}}><input type="checkbox" id="ob_doc_svc" name="ob_doc_svc" value={formData['ob_doc_svc'] || ''} onChange={handleChange} style={{"accentColor":"var(--or1)","width":"15px","height":"15px"}} /> Service Book</label>
    <label style={{"display":"flex","alignItems":"center","gap":"7px","fontSize":"12px","cursor":"pointer","color":"var(--text2)"}}><input type="checkbox" id="ob_doc_inv" name="ob_doc_inv" value={formData['ob_doc_inv'] || ''} onChange={handleChange} style={{"accentColor":"var(--or1)","width":"15px","height":"15px"}} /> Invoice</label>
  </div>
  <div className="grid2" style={{"marginTop":"10px"}}>
    <div className="fg"><label>Missing Documents <span style={{"color":"var(--danger)","fontSize":"10px"}}>(jo missing hoy tena naam)</span></label><input id="ob_doc_miss" name="ob_doc_miss" value={formData['ob_doc_miss'] || ''} onChange={handleChange} placeholder="e.g. NOC, Form 29..." /></div>
    <div className="fg"><label>Document Status</label><select id="ob_doc_stat" name="ob_doc_stat" value={formData['ob_doc_stat'] || ''} onChange={handleChange}><option value="Pending">Pending</option><option value="Partial">Partial</option><option value="Complete">Complete</option></select></div>
  </div>
 </div>
 <div className="m-foot"><button className="btn btn-out"  onClick={onClose}>Cancel</button><button className="btn btn-bl" ><i className="fa fa-print"></i> Print</button><button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save Booking</button></div></div>
</div>
  );
};
