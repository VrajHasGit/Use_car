import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const PurInqModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
  "pi_src": "",
  "pi_nsrc": "",
  "pi_date": "",
  "pi_sname": "",
  "pi_mob": "",
  "pi_amob": "",
  "pi_email": "",
  "pi_city": "",
  "pi_state": "",
  "pi_addr": "",
  "pi_make": "",
  "pi_model": "",
  "pi_var": "",
  "pi_year": "",
  "pi_ryear": "",
  "pi_fuel": "",
  "pi_trans": "",
  "pi_color": "",
  "pi_km": "",
  "pi_own": "",
  "pi_regn": "",
  "pi_rto": "",
  "pi_ins": "",
  "pi_lbank": "",
  "pi_loan": "",
  "pi_asn": "",
  "pi_stat": "",
  "pi_nfd": "",
  "pi_upby": "",
  "pi_rem": ""
});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'pur_inq'), { ...formData, createdAt: new Date().toISOString() });
      alert('Record saved successfully!');
      onClose();
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_pur_inq">
 <div className="mbox"><div className="m-hdr"><div className="m-hdr-icon">🚗</div><h3>Purchase Inquiry</h3><button className="m-close" onClick={onClose} >✕</button></div>
 <div className="m-body">
  <div className="sect-lbl"><i className="fa fa-circle-info"></i> Inquiry Details</div>
  <div className="grid3"><div className="fg"><label>Inquiry Source *</label><select id="pi_src" name="pi_src" value={formData['pi_src'] || ''} onChange={handleChange}><option>Walk-in</option><option>Call</option><option>Online</option><option>Reference</option><option>Dealer/Partner</option><option>OLX</option><option>CarDekho</option></select></div><div className="fg"><label>Name Source</label><select id="pi_nsrc" name="pi_nsrc" value={formData['pi_nsrc'] || ''} onChange={handleChange}><option value="">-- Select Partner --</option><option>Rajan Desai</option><option>Ritesh Shah</option><option>Rohan Mehta</option><option>Ronak Mehta</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Other</option></select></div><div className="fg"><label>Inquiry Date *</label><input type="date" id="pi_date" name="pi_date" value={formData['pi_date'] || ''} onChange={handleChange} /></div></div>
  <div className="sect-lbl"><i className="fa fa-user"></i> Seller Details</div>
  <div className="grid3"><div className="fg"><label>Seller Name *</label><input id="pi_sname" name="pi_sname" value={formData['pi_sname'] || ''} onChange={handleChange} placeholder="Full name" /></div><div className="fg"><label>Seller Mobile *</label><input id="pi_mob" name="pi_mob" value={formData['pi_mob'] || ''} onChange={handleChange} placeholder="10 digit mobile" type="tel" maxLength="10"  pattern="[0-9]{10}" /></div><div className="fg"><label>Alt Mobile</label><input id="pi_amob" name="pi_amob" value={formData['pi_amob'] || ''} onChange={handleChange} placeholder="10 digit (optional)" type="tel" maxLength="10"  pattern="[0-9]{10}" /></div></div>
  <div className="grid3"><div className="fg"><label>Email</label><input id="pi_email" name="pi_email" value={formData['pi_email'] || ''} onChange={handleChange} type="email" placeholder="Email" /></div><div className="fg"><label>City *</label><select id="pi_city" name="pi_city" value={formData['pi_city'] || ''} onChange={handleChange} >
<option value="">Select City</option>
<option>Ahmedabad</option>
<option>Surat</option>
<option>Vadodara</option>
<option>Rajkot</option>
<option>Bhavnagar</option>
<option>Jamnagar</option>
<option>Junagadh</option>
<option>Gandhinagar</option>
<option>Anand</option>
<option>Nadiad</option>
<option>Mehsana</option>
<option>Surendranagar</option>
<option>Bharuch</option>
<option>Vapi</option>
<option>Navsari</option>
<option>Morbi</option>
<option>Gondal</option>
<option>Botad</option>
<option>Amreli</option>
<option>Porbandar</option>
<option>Dwarka</option>
<option>Veraval</option>
<option>Upleta</option>
<option>Jetpur</option>
<option>Gondal</option>
<option>Wankaner</option>
<option>Dhoraji</option>
<option>Jam Jodhpur</option>
<option>Keshod</option>
<option>Visavadar</option>
<option>Talaja</option>
<option>Mahuva</option>
<option>Palitana</option>
<option>Sihor</option>
<option>Anjar</option>
<option>Bhuj</option>
<option>Gandhidham</option>
<option>Mandvi</option>
<option>Mundra</option>
<option>Rapar</option>
<option>Patan</option>
<option>Unjha</option>
<option>Visnagar</option>
<option>Kadi</option>
<option>Kalol</option>
<option>Sanand</option>
<option>Bavla</option>
<option>Dholka</option>
<option>Dholera</option>
<option>Khambhat</option>
<option>Ankleshwar</option>
<option>Dahej</option>
<option>Jambusar</option>
<option>Olpad</option>
<option>Bardoli</option>
<option>Vyara</option>
<option>Mandvi (Surat)</option>
<option>Kamrej</option>
<option>Surat Rural</option>
<option>Other</option>
</select></div><div className="fg"><label>State</label><input id="pi_state" name="pi_state" value={formData['pi_state'] || ''} onChange={handleChange} placeholder="State" value="Gujarat" readOnly style={{"background":"rgba(16,185,129,.08)","borderColor":"var(--success)","color":"var(--success)","fontWeight":"600"}} /></div></div>
  <div className="grid1"><div className="fg"><label>Seller Address</label><input id="pi_addr" name="pi_addr" value={formData['pi_addr'] || ''} onChange={handleChange} placeholder="Full address" /></div></div>
  <div className="sect-lbl"><i className="fa fa-car"></i> Vehicle Details</div>
  <div className="grid3"><div className="fg"><label>Vehicle Make *</label><select id="pi_make" name="pi_make" value={formData['pi_make'] || ''} onChange={handleChange} ><option value="">Select Brand</option></select></div><div className="fg"><label>Vehicle Model *</label><select id="pi_model" name="pi_model" value={formData['pi_model'] || ''} onChange={handleChange}><option value="">Select Model</option></select></div><div className="fg"><label>Variant</label><input id="pi_var" name="pi_var" value={formData['pi_var'] || ''} onChange={handleChange} placeholder="VXI / ZXI / SX" /></div></div>
  <div className="grid3"><div className="fg"><label>Mfg Year</label><select id="pi_year" name="pi_year" value={formData['pi_year'] || ''} onChange={handleChange}><option value="">Year</option></select></div><div className="fg"><label>Registration Year</label><select id="pi_ryear" name="pi_ryear" value={formData['pi_ryear'] || ''} onChange={handleChange}><option value="">Year</option></select></div><div className="fg"><label>Fuel Type</label><select id="pi_fuel" name="pi_fuel" value={formData['pi_fuel'] || ''} onChange={handleChange}><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option><option>Hybrid</option><option>Petrol+CNG</option></select></div></div>
  <div className="grid3"><div className="fg"><label>Transmission</label><select id="pi_trans" name="pi_trans" value={formData['pi_trans'] || ''} onChange={handleChange}><option>Manual</option><option>Automatic</option><option>AMT</option><option>CVT</option><option>DCT</option></select></div><div className="fg"><label>Color</label><select id="pi_color" name="pi_color" value={formData['pi_color'] || ''} onChange={handleChange}><option>White</option><option>Silver</option><option>Grey</option><option>Black</option><option>Red</option><option>Blue</option><option>Brown</option><option>Orange</option><option>Yellow</option><option>Green</option><option>Other</option></select></div><div className="fg"><label>KM Driven</label><input id="pi_km" name="pi_km" value={formData['pi_km'] || ''} onChange={handleChange} type="number" placeholder="45000" /></div></div>
  <div className="grid3"><div className="fg"><label>Number of Owners</label><select id="pi_own" name="pi_own" value={formData['pi_own'] || ''} onChange={handleChange}><option>1st</option><option>2nd</option><option>3rd</option><option>4th+</option></select></div><div className="fg"><label>Registration Number</label><input id="pi_regn" name="pi_regn" value={formData['pi_regn'] || ''} onChange={handleChange} placeholder="GJ-01-AB-1234" /></div><div className="fg"><label>RTO State</label><input id="pi_rto" name="pi_rto" value={formData['pi_rto'] || ''} onChange={handleChange} placeholder="Gujarat" /></div></div>
  <div className="grid3"><div className="fg"><label>Insurance Valid Till</label><input type="date" id="pi_ins" name="pi_ins" value={formData['pi_ins'] || ''} onChange={handleChange} /></div><div className="fg"><label>Loan Bank (if any)</label><input id="pi_lbank" name="pi_lbank" value={formData['pi_lbank'] || ''} onChange={handleChange} placeholder="Bank name" /></div><div className="fg"><label>Loan Outstanding</label><select id="pi_loan" name="pi_loan" value={formData['pi_loan'] || ''} onChange={handleChange}><option>No</option><option>Yes</option></select></div></div>
  <div className="sect-lbl"><i className="fa fa-list-check"></i> Assignment & Status</div>
  <div className="grid3"><div className="fg"><label>Assigned To *</label><select id="pi_asn" name="pi_asn" value={formData['pi_asn'] || ''} onChange={handleChange}><option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option><option>Admin</option></select></div><div className="fg"><label>Inquiry Status *</label><select id="pi_stat" name="pi_stat" value={formData['pi_stat'] || ''} onChange={handleChange}><option>New</option><option>In-Progress</option><option>Closed-Won</option><option>Closed-Lost</option><option>Hold</option></select></div><div className="fg"><label>Next Follow-Up Date</label><input type="date" id="pi_nfd" name="pi_nfd" value={formData['pi_nfd'] || ''} onChange={handleChange} /></div></div>
  <div className="grid2"><div className="fg"><label>Updated By</label><input id="pi_upby" name="pi_upby" value={formData['pi_upby'] || ''} onChange={handleChange} placeholder="User name" /></div><div className="fg"><label>Remarks</label><input id="pi_rem" name="pi_rem" value={formData['pi_rem'] || ''} onChange={handleChange} placeholder="Notes" /></div></div>
 </div>
 <div className="m-foot"><button className="btn btn-out"  onClick={onClose}>Cancel</button><button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save Inquiry</button></div></div>
</div>
  );
};
