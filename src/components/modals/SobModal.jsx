import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { autoFillFromStock } from '../../utils/relations';

export const SobModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
  "sob_sclid": "",
  "sob_sinid": "",
  "sob_stkid": "",
  "sob_branch": "",
  "sob_ps_yes": "",
  "sob_ps_no": "",
  "sob_date": "",
  "sob_cname": "",
  "sob_cont": "",
  "sob_edd": "",
  "sob_addr": "",
  "sob_email": "",
  "sob_exec": "",
  "sob_src": "",
  "sob_partner": "",
  "sob_support": "",
  "sob_broker": "",
  "sob_brokcomm": "",
  "sob_regn": "",
  "sob_mm": "",
  "sob_year": "",
  "sob_color": "",
  "sob_fuel": "",
  "sob_own": "",
  "sob_km": "",
  "sob_instype": "",
  "sob_finance": "",
  "sob_ins_new": "",
  "sob_ins_cont": "",
  "sob_finbank": "",
  "sob_chas": "",
  "sob_saleprice": "",
  "sob_tcs": "",
  "sob_rto": "",
  "sob_inschrg": "",
  "sob_warranty": "",
  "sob_acc": "",
  "sob_other": "",
  "sob_pd1_date": "",
  "sob_pd1_onl": "",
  "sob_pd1_cash": "",
  "sob_pd2_date": "",
  "sob_pd2_onl": "",
  "sob_pd2_cash": "",
  "sob_pd3_date": "",
  "sob_pd3_onl": "",
  "sob_pd3_cash": "",
  "sob_pd4_date": "",
  "sob_pd4_onl": "",
  "sob_pd4_cash": "",
  "sob_pd5_date": "",
  "sob_pd5_onl": "",
  "sob_pd5_cash": "",
  "sob_pd6_date": "",
  "sob_pd6_onl": "",
  "sob_pd6_cash": "",
  "sob_pd7_date": "",
  "sob_pd7_onl": "",
  "sob_pd7_cash": "",
  "sob_rem": ""
});

  if (!isOpen) return null;

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'sob_regn' && value.length >= 8) {
      const stockData = await autoFillFromStock(value);
      if (stockData) {
        setFormData(prev => ({
          ...prev,
          sob_mm: stockData.make + ' ' + stockData.model,
          sob_year: stockData.year || '',
          sob_color: stockData.color || '',
          sob_fuel: stockData.fuel || '',
          sob_km: stockData.km || ''
        }));
      }
    }
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'sob'), { ...formData, createdAt: new Date().toISOString() });
      if (onSave) { await onSave(formData); } else { onClose(); }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_sob">
 <div className="mbox" style={{"maxWidth":"900px"}}>
  <div className="m-hdr">
   <div className="m-hdr-icon">ðŸ“‹</div>
   <h3>Sales Order Booking</h3>
   <div style={{"marginLeft":"auto","display":"flex","alignItems":"center","gap":"10px"}}>
    <button className="btn btn-bl btn-sm" ><i className="fa fa-print"></i> Print Form</button>
    <button className="m-close" onClick={onClose} >âœ•</button>
   </div>
  </div>
  <div className="m-body">

   
   <div style={{"background":"rgba(255,107,0,.07)","border":"1px solid rgba(255,107,0,.25)","borderRadius":"var(--radius-sm)","padding":"10px 14px","marginBottom":"14px","display":"flex","alignItems":"center","gap":"10px"}}>
    <span style={{"fontSize":"18px"}}>âš¡</span>
    <div style={{"flex":"1","display":"grid","gridTemplateColumns":"1fr 1fr 1fr","gap":"10px"}}>
     <div className="fg" style={{"margin":"0"}}>
      <label style={{"color":"var(--or3)","fontSize":"10px","fontWeight":"700","letterSpacing":".8px","textTransform":"uppercase","marginBottom":"4px","display":"block"}}>Sales Closer ID â€” Auto-Fill</label>
      <input id="sob_sclid" name="sob_sclid" value={formData['sob_sclid'] || ''} onChange={handleChange} placeholder="SCL-2025-0001" style={{"background":"var(--bg)","border":"1px solid rgba(255,107,0,.4)","color":"var(--text)","borderRadius":"var(--radius-sm)","padding":"8px 12px","fontFamily":"inherit","fontSize":"12px","width":"100%"}}  />
     </div>
     <div className="fg" style={{"margin":"0"}}>
      <label style={{"color":"var(--bl5)","fontSize":"10px","fontWeight":"700","letterSpacing":".8px","textTransform":"uppercase","marginBottom":"4px","display":"block"}}>Sales Inquiry ID â€” Auto-Fill</label>
      <input id="sob_sinid" name="sob_sinid" value={formData['sob_sinid'] || ''} onChange={handleChange} placeholder="SIN-2025-0001" style={{"background":"var(--bg)","border":"1px solid rgba(59,130,246,.4)","color":"var(--text)","borderRadius":"var(--radius-sm)","padding":"8px 12px","fontFamily":"inherit","fontSize":"12px","width":"100%"}}  />
     </div>
     <div className="fg" style={{"margin":"0"}}>
      <label style={{"color":"#059669","fontSize":"10px","fontWeight":"700","letterSpacing":".8px","textTransform":"uppercase","marginBottom":"4px","display":"block"}}>ðŸš— Stock ID â€” Car Auto-Fill</label>
      <input id="sob_stkid" name="sob_stkid" value={formData['sob_stkid'] || ''} onChange={handleChange} placeholder="STK-2025-0001" style={{"background":"var(--bg)","border":"1px solid rgba(5,150,105,.4)","color":"var(--text)","borderRadius":"var(--radius-sm)","padding":"8px 12px","fontFamily":"inherit","fontSize":"12px","width":"100%"}}  />
     </div>
    </div>
   </div>

   
   <div style={{"background":"var(--surface2)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 14px","marginBottom":"14px","display":"flex","alignItems":"center","gap":"20px","flexWrap":"wrap"}}>
    <div className="fg" style={{"margin":"0","flex":"1","minWidth":"160px"}}>
     <label>Branch</label>
     <select id="sob_branch" name="sob_branch" value={formData['sob_branch'] || ''} onChange={handleChange}><option>SG Highway</option><option>Vastral</option><option>Head Office</option></select>
    </div>
    <div style={{"display":"flex","alignItems":"center","gap":"12px"}}>
     <label style={{"fontSize":"10px","fontWeight":"700","letterSpacing":".8px","textTransform":"uppercase","color":"var(--text3)","whiteSpace":"nowrap"}}>Park &amp; Sale:</label>
     <label style={{"display":"flex","alignItems":"center","gap":"5px","fontSize":"12px","cursor":"pointer"}}><input type="radio" id="sob_ps_yes" name="sob_ps_yes" value={formData['sob_ps_yes'] || ''} onChange={handleChange} name="sob_ps" value="Yes" /> Yes</label>
     <label style={{"display":"flex","alignItems":"center","gap":"5px","fontSize":"12px","cursor":"pointer"}}><input type="radio" id="sob_ps_no" name="sob_ps_no" value={formData['sob_ps_no'] || ''} onChange={handleChange} name="sob_ps" value="No" checked /> No</label>
    </div>
    <div className="fg" style={{"margin":"0","minWidth":"140px"}}>
     <label>Booking Date *</label>
     <input type="date" id="sob_date" name="sob_date" value={formData['sob_date'] || ''} onChange={handleChange} />
    </div>
   </div>

   
   <div className="sect-lbl"><i className="fa fa-user"></i> Client Details</div>
   <div className="grid3">
    <div className="fg"><label>Client Name *</label><input id="sob_cname" name="sob_cname" value={formData['sob_cname'] || ''} onChange={handleChange} placeholder="Full name" /></div>
    <div className="fg"><label>Client Contact No. *</label><input id="sob_cont" name="sob_cont" value={formData['sob_cont'] || ''} onChange={handleChange} type="tel" placeholder="10 digit mobile" maxLength="10"  /></div>
    <div className="fg"><label>Expected Delivery Date</label><input type="date" id="sob_edd" name="sob_edd" value={formData['sob_edd'] || ''} onChange={handleChange} /></div>
   </div>
   <div className="grid2">
    <div className="fg"><label>Client Address</label><input id="sob_addr" name="sob_addr" value={formData['sob_addr'] || ''} onChange={handleChange} placeholder="Full address" /></div>
    <div className="fg"><label>Email ID</label><input id="sob_email" name="sob_email" value={formData['sob_email'] || ''} onChange={handleChange} type="email" placeholder="Email" /></div>
   </div>

   
   <div className="sect-lbl"><i className="fa fa-building"></i> Office Details</div>
   <div className="grid3">
    <div className="fg"><label>Sales Executive</label><select id="sob_exec" name="sob_exec" value={formData['sob_exec'] || ''} onChange={handleChange}><option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option><option>Pinal Desai</option><option>Admin</option></select></div>
    <div className="fg"><label>Source Channel</label><input id="sob_src" name="sob_src" value={formData['sob_src'] || ''} onChange={handleChange} placeholder="e.g. Umang Shah - Friend (Ritesh)" /></div>
    <div className="fg"><label>Partner Name</label><select id="sob_partner" name="sob_partner" value={formData['sob_partner'] || ''} onChange={handleChange}><option value="">-- Select Partner --</option><option>Rajan Desai</option><option>Ritesh Shah</option><option>Rohan Mehta</option><option>Ronak Mehta</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Other</option></select></div>
   </div>
   <div className="grid3">
    <div className="fg"><label>Support Partner</label><select id="sob_support" name="sob_support" value={formData['sob_support'] || ''} onChange={handleChange}><option value="">-- Select Support Partner --</option><option>Rajan Desai</option><option>Ritesh Shah</option><option>Rohan Mehta</option><option>Ronak Mehta</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Other</option></select></div>
    <div className="fg"><label>Broker Name</label><input id="sob_broker" name="sob_broker" value={formData['sob_broker'] || ''} onChange={handleChange} placeholder="Broker name" /></div>
    <div className="fg"><label>Broker Commission</label><input id="sob_brokcomm" name="sob_brokcomm" value={formData['sob_brokcomm'] || ''} onChange={handleChange} placeholder="e.g. â‚¹5000 / N.A." /></div>
   </div>

   
   <div className="sect-lbl"><i className="fa fa-car"></i> Car Details</div>
   <div className="grid3">
    <div className="fg"><label>Registration No. *</label><input id="sob_regn" name="sob_regn" value={formData['sob_regn'] || ''} onChange={handleChange} placeholder="GJ-01-AB-1234"  /></div>
    <div className="fg"><label>Make / Model</label><input id="sob_mm" name="sob_mm" value={formData['sob_mm'] || ''} onChange={handleChange} placeholder="Grand i10 Magna AT" /></div>
    <div className="fg"><label>Mfg Year</label><input id="sob_year" name="sob_year" value={formData['sob_year'] || ''} onChange={handleChange} placeholder="e.g. Jul-17" /></div>
   </div>
   <div className="grid3">
    <div className="fg"><label>Colour</label><select id="sob_color" name="sob_color" value={formData['sob_color'] || ''} onChange={handleChange}><option>White</option><option>Silver</option><option>Grey</option><option>Black</option><option>Red</option><option>Blue</option><option>Brown</option><option>Other</option></select></div>
    <div className="fg"><label>Fuel Type</label><select id="sob_fuel" name="sob_fuel" value={formData['sob_fuel'] || ''} onChange={handleChange}><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option><option>Petrol+CNG</option></select></div>
    <div className="fg"><label>Ownership Type</label><select id="sob_own" name="sob_own" value={formData['sob_own'] || ''} onChange={handleChange}><option>1st Owner</option><option>2nd Owner</option><option>3rd Owner</option><option>4th+ Owner</option></select></div>
   </div>
   <div className="grid3">
    <div className="fg"><label>Mileage (KM)</label><input type="number" id="sob_km" name="sob_km" value={formData['sob_km'] || ''} onChange={handleChange} placeholder="31000" /></div>
    <div className="fg"><label>Insurance Type</label><select id="sob_instype" name="sob_instype" value={formData['sob_instype'] || ''} onChange={handleChange}><option>New</option><option>Comprehensive</option><option>Third Party</option><option>Zero Dep</option></select></div>
    <div className="fg"><label>Finance (Yes/No)</label><select id="sob_finance" name="sob_finance" value={formData['sob_finance'] || ''} onChange={handleChange}><option>No</option><option>Yes</option></select></div>
   </div>
   <div className="grid3">
    <div className="fg"><label>Insurance Status</label>
     <div style={{"display":"flex","gap":"16px","padding":"8px 0"}}>
      <label style={{"display":"flex","alignItems":"center","gap":"6px","fontSize":"12px","cursor":"pointer","color":"var(--text2)"}}><input type="radio" name="sob_insstat" id="sob_ins_new" name="sob_ins_new" value={formData['sob_ins_new'] || ''} onChange={handleChange} value="New" checked /> New</label>
      <label style={{"display":"flex","alignItems":"center","gap":"6px","fontSize":"12px","cursor":"pointer","color":"var(--text2)"}}><input type="radio" name="sob_insstat" id="sob_ins_cont" name="sob_ins_cont" value={formData['sob_ins_cont'] || ''} onChange={handleChange} value="Continue" /> Continue</label>
     </div>
    </div>
    <div className="fg"><label>Finance Bank</label><input id="sob_finbank" name="sob_finbank" value={formData['sob_finbank'] || ''} onChange={handleChange} placeholder="Bank name (if financed)" /></div>
    <div className="fg"><label>Chassis No.</label><input id="sob_chas" name="sob_chas" value={formData['sob_chas'] || ''} onChange={handleChange} placeholder="17-char VIN" /></div>
   </div>

   
   <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"14px","marginBottom":"14px"}}>

    
    <div>
     <div className="sect-lbl"><i className="fa fa-indian-rupee-sign"></i> Client Deal Details</div>
     <div style={{"background":"var(--bg)","border":"1px solid var(--border)","borderRadius":"var(--radius)","overflow":"hidden"}}>
      <table style={{"width":"100%","borderCollapse":"collapse"}}>
       <thead><tr style={{"background":"var(--surface2)"}}><th style={{"padding":"8px 10px","fontSize":"10px","letterSpacing":"1px","textAlign":"left","color":"var(--text3)","textTransform":"uppercase"}}>Particulars</th><th style={{"padding":"8px 10px","fontSize":"10px","letterSpacing":"1px","textAlign":"right","color":"var(--text3)","textTransform":"uppercase"}}>Amount â‚¹</th></tr></thead>
       <tbody>
        <tr style={{"borderTop":"1px solid var(--border)"}}><td style={{"padding":"7px 10px","fontSize":"12px","color":"var(--text2)"}}>Sale Price</td><td style={{"padding":"7px 10px"}}><input type="number" id="sob_saleprice" name="sob_saleprice" value={formData['sob_saleprice'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--or2)","fontFamily":"'Space Grotesk',sans-serif","fontSize":"13px","fontWeight":"700","width":"100%","textAlign":"right","outline":"none"}} /></td></tr>
        <tr style={{"borderTop":"1px solid var(--border)"}}><td style={{"padding":"7px 10px","fontSize":"12px","color":"var(--text2)"}}>TCS</td><td style={{"padding":"7px 10px"}}><input type="number" id="sob_tcs" name="sob_tcs" value={formData['sob_tcs'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--text)","fontSize":"12px","width":"100%","textAlign":"right","outline":"none"}} /></td></tr>
        <tr style={{"borderTop":"1px solid var(--border)"}}><td style={{"padding":"7px 10px","fontSize":"12px","color":"var(--text2)"}}>RTO Charge</td><td style={{"padding":"7px 10px"}}><input type="number" id="sob_rto" name="sob_rto" value={formData['sob_rto'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--text)","fontSize":"12px","width":"100%","textAlign":"right","outline":"none"}} /></td></tr>
        <tr style={{"borderTop":"1px solid var(--border)"}}><td style={{"padding":"7px 10px","fontSize":"12px","color":"var(--text2)"}}>Insurance Charge</td><td style={{"padding":"7px 10px"}}><input type="number" id="sob_inschrg" name="sob_inschrg" value={formData['sob_inschrg'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--text)","fontSize":"12px","width":"100%","textAlign":"right","outline":"none"}} /></td></tr>
        <tr style={{"borderTop":"1px solid var(--border)"}}><td style={{"padding":"7px 10px","fontSize":"12px","color":"var(--text2)"}}>Extended Warranty</td><td style={{"padding":"7px 10px"}}><input type="number" id="sob_warranty" name="sob_warranty" value={formData['sob_warranty'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--text)","fontSize":"12px","width":"100%","textAlign":"right","outline":"none"}} /></td></tr>
        <tr style={{"borderTop":"1px solid var(--border)"}}><td style={{"padding":"7px 10px","fontSize":"12px","color":"var(--text2)"}}>Accessories</td><td style={{"padding":"7px 10px"}}><input type="number" id="sob_acc" name="sob_acc" value={formData['sob_acc'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--text)","fontSize":"12px","width":"100%","textAlign":"right","outline":"none"}} /></td></tr>
        <tr style={{"borderTop":"1px solid var(--border)"}}><td style={{"padding":"7px 10px","fontSize":"12px","color":"var(--text2)"}}>Other Charges</td><td style={{"padding":"7px 10px"}}><input type="number" id="sob_other" name="sob_other" value={formData['sob_other'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--text)","fontSize":"12px","width":"100%","textAlign":"right","outline":"none"}} /></td></tr>
        <tr style={{"borderTop":"2px solid var(--or1)","background":"var(--surface2)"}}><td style={{"padding":"9px 10px","fontSize":"13px","fontWeight":"700","color":"var(--text)","fontFamily":"'Space Grotesk',sans-serif"}}>TOTAL AMOUNT</td><td style={{"padding":"9px 10px","fontSize":"14px","fontWeight":"700","color":"var(--or2)","fontFamily":"'Space Grotesk',sans-serif","textAlign":"right"}} id="sob_total">â‚¹ 0</td></tr>
       </tbody>
      </table>
     </div>
    </div>

    
    <div>
     <div className="sect-lbl"><i className="fa fa-credit-card"></i> Payment Details</div>
     <div style={{"background":"var(--bg)","border":"1px solid var(--border)","borderRadius":"var(--radius)","overflow":"hidden"}}>
      <table style={{"width":"100%","borderCollapse":"collapse"}}>
       <thead><tr style={{"background":"var(--surface2)"}}><th style={{"padding":"7px 8px","fontSize":"9px","letterSpacing":".8px","textAlign":"left","color":"var(--text3)","textTransform":"uppercase"}}>Particulars</th><th style={{"padding":"7px 8px","fontSize":"9px","letterSpacing":".8px","textAlign":"center","color":"var(--text3)","textTransform":"uppercase"}}>Date</th><th style={{"padding":"7px 8px","fontSize":"9px","letterSpacing":".8px","textAlign":"right","color":"var(--bl5)","textTransform":"uppercase"}}>Online â‚¹</th><th style={{"padding":"7px 8px","fontSize":"9px","letterSpacing":".8px","textAlign":"right","color":"var(--or3)","textTransform":"uppercase"}}>Cash â‚¹</th></tr></thead>
       <tbody>
        <tr style={{"borderTop":"1px solid var(--border)","background":"rgba(255,107,0,.04)"}}><td style={{"padding":"6px 8px","fontSize":"11px","fontWeight":"600","color":"var(--or3)"}}>Booking Amt</td><td style={{"padding":"4px 6px"}}><input type="date" id="sob_pd1_date" name="sob_pd1_date" value={formData['sob_pd1_date'] || ''} onChange={handleChange} style={{"background":"transparent","border":"none","color":"var(--text2)","fontSize":"10px","width":"100%","outline":"none"}} /></td><td style={{"padding":"4px 6px"}}><input type="number" id="sob_pd1_onl" name="sob_pd1_onl" value={formData['sob_pd1_onl'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--bl5)","fontSize":"11px","width":"100%","textAlign":"right","outline":"none"}} /></td><td style={{"padding":"4px 6px"}}><input type="number" id="sob_pd1_cash" name="sob_pd1_cash" value={formData['sob_pd1_cash'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--or3)","fontSize":"11px","width":"100%","textAlign":"right","outline":"none"}} /></td></tr>
        <tr style={{"borderTop":"1px solid var(--border)"}}><td style={{"padding":"6px 8px","fontSize":"11px","color":"var(--text2)"}}>1st Payment</td><td style={{"padding":"4px 6px"}}><input type="date" id="sob_pd2_date" name="sob_pd2_date" value={formData['sob_pd2_date'] || ''} onChange={handleChange} style={{"background":"transparent","border":"none","color":"var(--text2)","fontSize":"10px","width":"100%","outline":"none"}} /></td><td style={{"padding":"4px 6px"}}><input type="number" id="sob_pd2_onl" name="sob_pd2_onl" value={formData['sob_pd2_onl'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--bl5)","fontSize":"11px","width":"100%","textAlign":"right","outline":"none"}} /></td><td style={{"padding":"4px 6px"}}><input type="number" id="sob_pd2_cash" name="sob_pd2_cash" value={formData['sob_pd2_cash'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--or3)","fontSize":"11px","width":"100%","textAlign":"right","outline":"none"}} /></td></tr>
        <tr style={{"borderTop":"1px solid var(--border)"}}><td style={{"padding":"6px 8px","fontSize":"11px","color":"var(--text2)"}}>2nd Payment</td><td style={{"padding":"4px 6px"}}><input type="date" id="sob_pd3_date" name="sob_pd3_date" value={formData['sob_pd3_date'] || ''} onChange={handleChange} style={{"background":"transparent","border":"none","color":"var(--text2)","fontSize":"10px","width":"100%","outline":"none"}} /></td><td style={{"padding":"4px 6px"}}><input type="number" id="sob_pd3_onl" name="sob_pd3_onl" value={formData['sob_pd3_onl'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--bl5)","fontSize":"11px","width":"100%","textAlign":"right","outline":"none"}} /></td><td style={{"padding":"4px 6px"}}><input type="number" id="sob_pd3_cash" name="sob_pd3_cash" value={formData['sob_pd3_cash'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--or3)","fontSize":"11px","width":"100%","textAlign":"right","outline":"none"}} /></td></tr>
        <tr style={{"borderTop":"1px solid var(--border)"}}><td style={{"padding":"6px 8px","fontSize":"11px","color":"var(--text2)"}}>3rd Payment</td><td style={{"padding":"4px 6px"}}><input type="date" id="sob_pd4_date" name="sob_pd4_date" value={formData['sob_pd4_date'] || ''} onChange={handleChange} style={{"background":"transparent","border":"none","color":"var(--text2)","fontSize":"10px","width":"100%","outline":"none"}} /></td><td style={{"padding":"4px 6px"}}><input type="number" id="sob_pd4_onl" name="sob_pd4_onl" value={formData['sob_pd4_onl'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--bl5)","fontSize":"11px","width":"100%","textAlign":"right","outline":"none"}} /></td><td style={{"padding":"4px 6px"}}><input type="number" id="sob_pd4_cash" name="sob_pd4_cash" value={formData['sob_pd4_cash'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--or3)","fontSize":"11px","width":"100%","textAlign":"right","outline":"none"}} /></td></tr>
        <tr style={{"borderTop":"1px solid var(--border)"}}><td style={{"padding":"6px 8px","fontSize":"11px","color":"var(--text2)"}}>4th Payment</td><td style={{"padding":"4px 6px"}}><input type="date" id="sob_pd5_date" name="sob_pd5_date" value={formData['sob_pd5_date'] || ''} onChange={handleChange} style={{"background":"transparent","border":"none","color":"var(--text2)","fontSize":"10px","width":"100%","outline":"none"}} /></td><td style={{"padding":"4px 6px"}}><input type="number" id="sob_pd5_onl" name="sob_pd5_onl" value={formData['sob_pd5_onl'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--bl5)","fontSize":"11px","width":"100%","textAlign":"right","outline":"none"}} /></td><td style={{"padding":"4px 6px"}}><input type="number" id="sob_pd5_cash" name="sob_pd5_cash" value={formData['sob_pd5_cash'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--or3)","fontSize":"11px","width":"100%","textAlign":"right","outline":"none"}} /></td></tr>
        <tr style={{"borderTop":"1px solid var(--border)"}}><td style={{"padding":"6px 8px","fontSize":"11px","color":"var(--text2)"}}>Loan Disbursement</td><td style={{"padding":"4px 6px"}}><input type="date" id="sob_pd6_date" name="sob_pd6_date" value={formData['sob_pd6_date'] || ''} onChange={handleChange} style={{"background":"transparent","border":"none","color":"var(--text2)","fontSize":"10px","width":"100%","outline":"none"}} /></td><td style={{"padding":"4px 6px"}}><input type="number" id="sob_pd6_onl" name="sob_pd6_onl" value={formData['sob_pd6_onl'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--bl5)","fontSize":"11px","width":"100%","textAlign":"right","outline":"none"}} /></td><td style={{"padding":"4px 6px"}}><input type="number" id="sob_pd6_cash" name="sob_pd6_cash" value={formData['sob_pd6_cash'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--or3)","fontSize":"11px","width":"100%","textAlign":"right","outline":"none"}} /></td></tr>
        <tr style={{"borderTop":"1px solid var(--border)"}}><td style={{"padding":"6px 8px","fontSize":"11px","color":"var(--text2)"}}>Old Car Value</td><td style={{"padding":"4px 6px"}}><input type="date" id="sob_pd7_date" name="sob_pd7_date" value={formData['sob_pd7_date'] || ''} onChange={handleChange} style={{"background":"transparent","border":"none","color":"var(--text2)","fontSize":"10px","width":"100%","outline":"none"}} /></td><td style={{"padding":"4px 6px"}}><input type="number" id="sob_pd7_onl" name="sob_pd7_onl" value={formData['sob_pd7_onl'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--bl5)","fontSize":"11px","width":"100%","textAlign":"right","outline":"none"}} /></td><td style={{"padding":"4px 6px"}}><input type="number" id="sob_pd7_cash" name="sob_pd7_cash" value={formData['sob_pd7_cash'] || ''} onChange={handleChange} placeholder="0"  style={{"background":"transparent","border":"none","color":"var(--or3)","fontSize":"11px","width":"100%","textAlign":"right","outline":"none"}} /></td></tr>
        <tr style={{"borderTop":"2px solid var(--or1)","background":"var(--surface2)"}}><td style={{"padding":"8px","fontSize":"12px","fontWeight":"700","color":"var(--text)","fontFamily":"'Space Grotesk',sans-serif"}}>TOTAL AMT</td><td></td><td style={{"padding":"8px","fontSize":"12px","fontWeight":"700","color":"var(--bl5)","fontFamily":"'Space Grotesk',sans-serif","textAlign":"right"}} id="sob_pay_onl_total">â‚¹ 0</td><td style={{"padding":"8px","fontSize":"12px","fontWeight":"700","color":"var(--or2)","fontFamily":"'Space Grotesk',sans-serif","textAlign":"right"}} id="sob_pay_cash_total">â‚¹ 0</td></tr>
       </tbody>
      </table>
     </div>
     
     <div style={{"background":"var(--surface2)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","marginTop":"8px","display":"flex","justifyContent":"space-between","alignItems":"center"}}>
      <span style={{"fontSize":"11px","fontWeight":"700","color":"var(--text3)"}}>BALANCE PENDING</span>
      <span id="sob_balance" style={{"fontSize":"16px","fontWeight":"700","fontFamily":"'Space Grotesk',sans-serif","color":"var(--warn)"}}>â‚¹ 0</span>
     </div>
    </div>
   </div>

   
   <div className="grid1"><div className="fg"><label>Remarks / Notes</label><textarea id="sob_rem" name="sob_rem" value={formData['sob_rem'] || ''} onChange={handleChange} placeholder="Any additional notesâ€¦"></textarea></div></div>

  </div>
  <div className="m-foot">
   <button className="btn btn-out"  onClick={onClose}>Cancel</button>
   <button className="btn btn-bl" ><i className="fa fa-print"></i> Print</button>
   <button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save Booking</button>
  </div>
 </div>
</div>
  );
};

