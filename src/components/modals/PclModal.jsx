import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { autoFillFromInq } from '../../utils/relations';

export const PclModal = ({ isOpen, onClose, onSave, editData, quickInqId }) => {
  const [formData, setFormData] = useState({
  "pc_inqid": "",
  "pc_sname": "",
  "pc_veh": "",
  "pc_date": "",
  "pc_type": "",
  "pc_stat": "",
  "pc_price": "",
  "pc_tok": "",
  "pc_pm1": "",
  "pc_p1": "",
  "pc_pm2": "",
  "pc_p2": "",
  "pc_pm3": "",
  "pc_p3": "",
  "pc_newcar": "",
  "pc_loan": "",
  "pc_lbank": "",
  "pc_tokd": "",
  "pc_dby": "",
  "pc_mgr": "",
  "pc_edd": "",
  "pc_cncl": "",
  "pc_rem": ""
});

  useEffect(() => {
    if (isOpen && quickInqId) {
      setFormData(prev => ({ ...prev, pc_inqid: quickInqId }));
      autoFillFromInq(quickInqId).then(inqData => {
        if (inqData) {
          setFormData(prev => ({
            ...prev,
            pc_sname: inqData.sellerName || '',
            pc_veh: inqData.make ? `${inqData.make} ${inqData.model || ''}` : ''
          }));
        }
      });
    }
  }, [isOpen, quickInqId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'pc_inqid' && value.length >= 5) {
      autoFillFromInq(value).then(inqData => {
        if (inqData) {
          setFormData(prev => ({
            ...prev,
            pc_sname: inqData.sellerName || '',
            pc_veh: inqData.make ? `${inqData.make} ${inqData.model || ''}` : ''
          }));
        }
      });
    }
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'pcl'), { ...formData, createdAt: new Date().toISOString() });
      if (onSave) { await onSave(formData); } else { onClose(); }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay on" id="m_pcl">
 <div className="mbox"><div className="m-hdr"><div className="m-hdr-icon">ðŸ¤</div><h3>Purchase Closer</h3><button className="m-close" onClick={onClose} >âœ•</button></div>
 <div className="m-body">
  <div className="grid3"><div className="fg"><label>Inquiry ID <span style={{"color":"var(--or1)","fontSize":"10px"}}>âš¡ Auto-Fill</span></label><input id="pc_inqid" name="pc_inqid" value={formData['pc_inqid'] || ''} onChange={handleChange} placeholder="INQ-2025-0001"  /></div><div className="fg"><label>Seller Name</label><input id="pc_sname" name="pc_sname" value={formData['pc_sname'] || ''} onChange={handleChange} placeholder="Name" /></div><div className="fg"><label>Vehicle Details</label><input id="pc_veh" name="pc_veh" value={formData['pc_veh'] || ''} onChange={handleChange} placeholder="Make Model Year" /></div></div>
  <div className="grid3"><div className="fg"><label>Closer Date *</label><input type="date" id="pc_date" name="pc_date" value={formData['pc_date'] || ''} onChange={handleChange} /></div><div className="fg"><label>Closer Type</label><select id="pc_type" name="pc_type" value={formData['pc_type'] || ''} onChange={handleChange}><option>Direct Purchase</option><option>Exchange</option><option>Auction</option></select></div><div className="fg"><label>Closer Status</label><select id="pc_stat" name="pc_stat" value={formData['pc_stat'] || ''} onChange={handleChange}><option>Confirmed</option><option>Cancelled</option><option>On Hold</option></select></div></div>
  <div className="sect-lbl"><i className="fa fa-indian-rupee-sign"></i> Price & Payment (Auto-Calc)</div>
  <div className="grid3"><div className="fg"><label>Final Agreed Price â‚¹</label><input type="number" id="pc_price" name="pc_price" value={formData['pc_price'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Token Amount â‚¹</label><input type="number" id="pc_tok" name="pc_tok" value={formData['pc_tok'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Balance Pending â‚¹ (Auto)</label><div className="calc-out" id="pc_bal">â‚¹ 0</div></div></div>
  <div className="grid3"><div className="fg"><label>Payment Mode 1</label><select id="pc_pm1" name="pc_pm1" value={formData['pc_pm1'] || ''} onChange={handleChange}><option>Cash</option><option>NEFT</option><option>RTGS</option><option>UPI</option><option>Cheque</option></select></div><div className="fg"><label>1st Payment â‚¹</label><input type="number" id="pc_p1" name="pc_p1" value={formData['pc_p1'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Payment Mode 2</label><select id="pc_pm2" name="pc_pm2" value={formData['pc_pm2'] || ''} onChange={handleChange}><option>-None-</option><option>Cash</option><option>NEFT</option><option>RTGS</option><option>UPI</option><option>Cheque</option></select></div></div>
  <div className="grid3"><div className="fg"><label>2nd Payment â‚¹</label><input type="number" id="pc_p2" name="pc_p2" value={formData['pc_p2'] || ''} onChange={handleChange} placeholder="0"  /></div><div className="fg"><label>Payment Mode 3</label><select id="pc_pm3" name="pc_pm3" value={formData['pc_pm3'] || ''} onChange={handleChange}><option>-None-</option><option>Cash</option><option>NEFT</option><option>RTGS</option><option>UPI</option><option>Cheque</option></select></div><div className="fg"><label>3rd Payment â‚¹</label><input type="number" id="pc_p3" name="pc_p3" value={formData['pc_p3'] || ''} onChange={handleChange} placeholder="0"  /></div></div>
  <div className="grid3"><div className="fg"><label>Remaining Balance (Auto) â‚¹</label><div className="calc-out" id="pc_rem2">â‚¹ 0</div></div><div className="fg"><label>New Car Exchange â‚¹</label><input type="number" id="pc_newcar" name="pc_newcar" value={formData['pc_newcar'] || ''} onChange={handleChange} placeholder="0" /></div><div className="fg"></div></div>
  <div className="grid3"><div className="fg"><label>Loan Outstanding</label><select id="pc_loan" name="pc_loan" value={formData['pc_loan'] || ''} onChange={handleChange}><option>No</option><option>Yes</option></select></div><div className="fg"><label>Loan Bank</label><input id="pc_lbank" name="pc_lbank" value={formData['pc_lbank'] || ''} onChange={handleChange} placeholder="Bank name" /></div><div className="fg"><label>Token Date</label><input type="date" id="pc_tokd" name="pc_tokd" value={formData['pc_tokd'] || ''} onChange={handleChange} /></div></div>
  <div className="grid3"><div className="fg"><label>Closer Done By</label><select id="pc_dby" name="pc_dby" value={formData['pc_dby'] || ''} onChange={handleChange}><option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option></select></div><div className="fg"><label>Closer Manager</label><input id="pc_mgr" name="pc_mgr" value={formData['pc_mgr'] || ''} onChange={handleChange} placeholder="Manager name" /></div><div className="fg"><label>Expected Delivery Date</label><input type="date" id="pc_edd" name="pc_edd" value={formData['pc_edd'] || ''} onChange={handleChange} /></div></div>
  <div className="grid2"><div className="fg"><label>Cancellation Reason</label><input id="pc_cncl" name="pc_cncl" value={formData['pc_cncl'] || ''} onChange={handleChange} placeholder="If cancelled..." /></div><div className="fg"><label>Remarks</label><input id="pc_rem" name="pc_rem" value={formData['pc_rem'] || ''} onChange={handleChange} placeholder="Notes" /></div></div>
 </div>
 <div className="m-foot"><button className="btn btn-out"  onClick={onClose}>Cancel</button><button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save</button></div></div>
</div>
  );
};

