import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const ExpModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState(editData || {
    date: new Date().toISOString().split('T')[0],
    category: "Misc",
    branch: "SG Highway",
    description: "",
    amount: "",
    gstRate: "",
    paidBy: "Petty Cash",
    payMethod: "Cash",
    approvedBy: "Manager",
    receiptNo: "",
    reference: "",
    notes: ""
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveBtn = async () => {
    try {
      if (onSave) { 
        await onSave(formData); 
      } else { 
        onClose(); 
      }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_exp">
 <div className="mbox" style={{"maxWidth":"700px"}}>
  <div className="m-hdr"><div className="m-hdr-icon">ðŸ§¾</div><h3>Add Expense</h3><button className="m-close" onClick={onClose} >âœ•</button></div>
  <div className="m-body">
   <div className="grid3">
    <div className="fg"><label>Date *</label><input type="date" name="date" value={formData.date || ''} onChange={handleChange} /></div>
    <div className="fg"><label>Category *</label><select name="category" value={formData.category || ''} onChange={handleChange}>
     <option>Fuel</option><option>Parts</option><option>Marketing</option><option>Salary</option><option>Utilities</option><option>Maintenance</option>
     <option>Office</option><option>Insurance</option><option>Transport</option><option>Miscellaneous</option><option>Misc</option>
    </select></div>
    <div className="fg"><label>Branch *</label><select name="branch" value={formData.branch || ''} onChange={handleChange}><option>SG Highway</option><option>Vastral</option><option>Head Office</option></select></div>
   </div>
   <div className="grid3">
    <div className="fg"><label>Description *</label><input name="description" value={formData.description || ''} onChange={handleChange} placeholder="What was the expense for?" /></div>
    <div className="fg"><label>Amount ₹ *</label><input type="number" name="amount" value={formData.amount || ''} onChange={handleChange} placeholder="0" /></div>
    <div className="fg"><label>GST Rate %</label><input type="number" name="gstRate" value={formData.gstRate || ''} onChange={handleChange} placeholder="0" /></div>
   </div>
   <div className="grid3">
    <div className="fg"><label>Paid By</label><select name="paidBy" value={formData.paidBy || ''} onChange={handleChange}>
     <option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option><option>Petty Cash</option>
    </select></div>
    <div className="fg"><label>Payment Mode</label><select name="payMethod" value={formData.payMethod || ''} onChange={handleChange}><option>Cash</option><option>UPI</option><option>NEFT</option><option>Card</option></select></div>
    <div className="fg"><label>Approved By</label><select name="approvedBy" value={formData.approvedBy || ''} onChange={handleChange}><option>Manager</option><option>Admin</option><option>Self</option></select></div>
   </div>
   <div className="grid2">
    <div className="fg"><label>Receipt No.</label><input name="receiptNo" value={formData.receiptNo || ''} onChange={handleChange} placeholder="Bill / voucher number" /></div>
    <div className="fg"><label>Reference (Booking ID / Reg No.)</label><input name="reference" value={formData.reference || ''} onChange={handleChange} placeholder="OB-2025-0001 or GJ-01-AB-1234" /></div>
   </div>

   
   <div className="sect-lbl" style={{"marginTop":"4px"}}><i className="fa fa-car"></i> Linked Vehicles (Multiple Cars â€” Optional)</div>
   <div style={{"background":"var(--surface2)","border":"1px solid var(--border)","borderRadius":"var(--radius)","padding":"12px","marginBottom":"10px"}}>
    <div style={{"display":"flex","gap":"8px","marginBottom":"8px"}}>
     <input id="ex_car_inp" name="ex_car_inp" value={formData['ex_car_inp'] || ''} onChange={handleChange} placeholder="Reg No. ya Make/Model type karo" style={{"flex":"1","background":"#fff","border":"1px solid var(--border)","color":"var(--text)","borderRadius":"var(--radius-sm)","padding":"7px 11px","fontFamily":"inherit","fontSize":"12px"}} />
     <button  style={{"background":"var(--or1)","border":"none","color":"#fff","borderRadius":"var(--radius-sm)","padding":"7px 13px","fontSize":"12px","cursor":"pointer","whiteSpace":"nowrap"}}><i className="fa fa-plus"></i> Add</button>
    </div>
    <div id="ex_cars_list" style={{"display":"flex","flexDirection":"column","gap":"5px"}}>
     <div id="ex_no_cars" style={{"color":"var(--text3)","fontSize":"11px","textAlign":"center","padding":"8px"}}>No vehicles linked â€” optional</div>
    </div>
   </div>

   
   <div className="sect-lbl"><i className="fa fa-image"></i> Bill / Receipt Photos</div>
   <div id="ex_bill_zone"    style={{"border":"2px dashed var(--border)","borderRadius":"var(--radius)","padding":"16px","textAlign":"center","cursor":"pointer","transition":".2s","marginBottom":"10px"}} >
    <i className="fa fa-cloud-upload-alt" style={{"fontSize":"24px","color":"var(--text3)","display":"block","marginBottom":"6px"}}></i>
    <div style={{"fontSize":"12px","color":"var(--text3)"}}>Drag & Drop or <b style={{"color":"var(--or1)"}}>Click to Upload</b> Bill / Receipt Photos</div>
    <div style={{"fontSize":"10px","color":"var(--text3)","marginTop":"3px"}}>JPG, PNG, PDF â€” Multiple files allowed</div>
    <input type="file" id="ex_bill_inp" accept="image/*,.pdf" multiple style={{"display":"none"}}  />
   </div>
   <div id="ex_bill_previews" style={{"display":"flex","flexWrap":"wrap","gap":"8px","marginBottom":"4px"}}></div>
  </div>
  <div className="m-foot"><button className="btn btn-out"  onClick={onClose}>Cancel</button><button className="btn btn-or" onClick={handleSaveBtn} ><i className="fa fa-save"></i> Save Expense</button></div>
 </div>
</div>
  );
};

