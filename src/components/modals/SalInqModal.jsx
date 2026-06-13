import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const SalInqModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
  "si_car_input": "",
  "si_src": "",
  "si_date": "",
  "si_branch": "",
  "si_bname": "",
  "si_mob": "",
  "si_amob": "",
  "si_email": "",
  "si_city": "",
  "si_state": "",
  "si_addr": "",
  "si_budget": "",
  "si_make": "",
  "si_model": "",
  "si_fuel": "",
  "si_trans": "",
  "si_color": "",
  "si_km": "",
  "si_yfrom": "",
  "si_yto": "",
  "si_asn": "",
  "si_stat": "",
  "si_nfd": "",
  "si_rem": ""
});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'sal_inq'), { ...formData, createdAt: new Date().toISOString() });
      alert('Record saved successfully!');
      onClose();
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_sal_inq">
 <div className="mbox"><div className="m-hdr"><div className="m-hdr-icon">🏷️</div><h3>Sales Inquiry</h3><button className="m-close" onClick={onClose} >✕</button></div>
 <div className="m-body">

  
  <div style={{"background":"linear-gradient(90deg,rgba(37,99,235,.06),rgba(232,93,4,.04))","border":"1px solid rgba(37,99,235,.2)","borderRadius":"var(--radius)","padding":"14px","marginBottom":"14px"}}>
   <div style={{"fontSize":"10px","fontWeight":"700","letterSpacing":".8px","textTransform":"uppercase","color":"var(--bl5)","marginBottom":"10px","display":"flex","alignItems":"center","gap":"6px"}}>
    <i className="fa fa-car" style={{"color":"var(--or1)"}}></i> INTERESTED CARS — Stock se add karo (Multiple)
   </div>
   <div style={{"display":"flex","gap":"8px","marginBottom":"10px"}}>
    <input id="si_car_input" name="si_car_input" value={formData['si_car_input'] || ''} onChange={handleChange} placeholder="Reg No. type karo — GJ-01-AB-1234" style={{"flex":"1","background":"#fff","border":"1px solid var(--border)","color":"var(--text)","borderRadius":"var(--radius-sm)","padding":"8px 12px","fontFamily":"inherit","fontSize":"12px"}}  onkeydown="if(event.key==='Enter'){siAddCar();event.preventDefault()}" />
    <button  style={{"background":"linear-gradient(90deg,var(--or1),var(--or2))","border":"none","color":"#fff","borderRadius":"var(--radius-sm)","padding":"8px 14px","fontSize":"12px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap"}}><i className="fa fa-plus"></i> Add Car</button>
   </div>
   
   <div id="si_car_dropdown" style={{"display":"none","background":"#fff","border":"1px solid var(--border)","borderRadius":"var(--radius-sm)","marginBottom":"8px","maxHeight":"180px","overflowY":"auto","boxShadow":"0 4px 16px rgba(30,58,95,.12)"}}></div>
   
   <div id="si_cars_list" style={{"display":"flex","flexDirection":"column","gap":"6px"}}>
    <div id="si_no_cars" style={{"color":"var(--text3)","fontSize":"11px","textAlign":"center","padding":"10px","background":"var(--surface2)","borderRadius":"var(--radius-sm)"}}>Abhi koi car select nahi ki — Reg No. type karo aur Add karo</div>
   </div>
  </div>
  <div className="grid3"><div className="fg"><label>Source *</label><select id="si_src" name="si_src" value={formData['si_src'] || ''} onChange={handleChange}><option>Walk-in</option><option>Call</option><option>Online/OLX</option><option>Reference</option><option>CarDekho</option><option>Cars24</option><option>Social Media</option></select></div><div className="fg"><label>Inquiry Date *</label><input type="date" id="si_date" name="si_date" value={formData['si_date'] || ''} onChange={handleChange} /></div><div className="fg"><label>Branch</label><select id="si_branch" name="si_branch" value={formData['si_branch'] || ''} onChange={handleChange}><option>SG Highway</option><option>Vastral</option><option>Head Office</option></select></div></div>
  <div className="sect-lbl"><i className="fa fa-user"></i> Buyer Details</div>
  <div className="grid3"><div className="fg"><label>Buyer Name *</label><input id="si_bname" name="si_bname" value={formData['si_bname'] || ''} onChange={handleChange} placeholder="Full name" /></div><div className="fg"><label>Mobile *</label><input id="si_mob" name="si_mob" value={formData['si_mob'] || ''} onChange={handleChange} type="tel" placeholder="10 digit mobile" maxLength="10"  pattern="[0-9]{10}" /></div><div className="fg"><label>Alt Mobile</label><input id="si_amob" name="si_amob" value={formData['si_amob'] || ''} onChange={handleChange} type="tel" placeholder="10 digit (optional)" maxLength="10"  pattern="[0-9]{10}" /></div></div>
  <div className="grid3"><div className="fg"><label>Email</label><input id="si_email" name="si_email" value={formData['si_email'] || ''} onChange={handleChange} type="email" placeholder="Email" /></div><div className="fg"><label>City</label><select id="si_city" name="si_city" value={formData['si_city'] || ''} onChange={handleChange} >
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
</select></div><div className="fg"><label>State</label><input id="si_state" name="si_state" value={formData['si_state'] || ''} onChange={handleChange} placeholder="State" value="Gujarat" readOnly style={{"background":"rgba(16,185,129,.08)","borderColor":"var(--success)","color":"var(--success)","fontWeight":"600"}} /></div></div>
  <div className="grid1"><div className="fg"><label>Address</label><input id="si_addr" name="si_addr" value={formData['si_addr'] || ''} onChange={handleChange} placeholder="Full address" /></div></div>
  <div className="sect-lbl"><i className="fa fa-car"></i> Vehicle Preference</div>
  <div className="grid3"><div className="fg"><label>Budget ₹</label><input type="number" id="si_budget" name="si_budget" value={formData['si_budget'] || ''} onChange={handleChange} placeholder="Max budget" /></div><div className="fg"><label>Preferred Make</label><select id="si_make" name="si_make" value={formData['si_make'] || ''} onChange={handleChange}><option value="">Any Brand</option></select></div><div className="fg"><label>Preferred Model</label><input id="si_model" name="si_model" value={formData['si_model'] || ''} onChange={handleChange} placeholder="Any model" /></div></div>
  <div className="grid3"><div className="fg"><label>Fuel Preference</label><select id="si_fuel" name="si_fuel" value={formData['si_fuel'] || ''} onChange={handleChange}><option>Any</option><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option></select></div><div className="fg"><label>Transmission</label><select id="si_trans" name="si_trans" value={formData['si_trans'] || ''} onChange={handleChange}><option>Any</option><option>Manual</option><option>Automatic</option><option>AMT</option></select></div><div className="fg"><label>Color Preference</label><select id="si_color" name="si_color" value={formData['si_color'] || ''} onChange={handleChange}><option>Any</option><option>White</option><option>Silver</option><option>Black</option><option>Red</option><option>Blue</option><option>Other</option></select></div></div>
  <div className="grid3"><div className="fg"><label>Max KM</label><input type="number" id="si_km" name="si_km" value={formData['si_km'] || ''} onChange={handleChange} placeholder="Max KM driven" /></div><div className="fg"><label>Year From</label><select id="si_yfrom" name="si_yfrom" value={formData['si_yfrom'] || ''} onChange={handleChange}><option value="">Any</option></select></div><div className="fg"><label>Year To</label><select id="si_yto" name="si_yto" value={formData['si_yto'] || ''} onChange={handleChange}><option value="">Any</option></select></div></div>
  <div className="grid3"><div className="fg"><label>Assigned To</label><select id="si_asn" name="si_asn" value={formData['si_asn'] || ''} onChange={handleChange}><option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option></select></div><div className="fg"><label>Inquiry Status</label><select id="si_stat" name="si_stat" value={formData['si_stat'] || ''} onChange={handleChange}><option>New</option><option>In-Progress</option><option>Closed-Won</option><option>Closed-Lost</option><option>Hold</option></select></div><div className="fg"><label>Next Follow-Up Date</label><input type="date" id="si_nfd" name="si_nfd" value={formData['si_nfd'] || ''} onChange={handleChange} /></div></div>
  <div className="grid1"><div className="fg"><label>Remarks</label><textarea id="si_rem" name="si_rem" value={formData['si_rem'] || ''} onChange={handleChange} placeholder="Additional notes…"></textarea></div></div>
 </div>
 <div className="m-foot"><button className="btn btn-out"  onClick={onClose}>Cancel</button><button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save Inquiry</button></div></div>
</div>
  );
};
