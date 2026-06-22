import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { useData } from '../../contexts/DataContext';
import { addRecord, updateRecord, getNextCounter } from '../../services/db';
import { genId, today } from '../../utils/helpers';

import { autoFillFromInq } from '../../utils/relations';

export const PclModal = ({ isOpen, onClose, onSave, onSuccess, editData, quickInqId }) => {
  const { data: ctxData } = useData();
  const [formData, setFormData] = useState({
    pc_inqid: "", pc_sname: "", pc_veh: "", pc_date: "", pc_type: "Direct Purchase",
    pc_stat: "Confirmed", pc_price: "", pc_tok: "", pc_pm1: "Cash", pc_p1: "",
    pc_pm2: "-None-", pc_p2: "", pc_pm3: "-None-", pc_p3: "", pc_newcar: "",
    pc_loan: "No", pc_lbank: "", pc_tokd: "", pc_dby: "Ritesh Shah", pc_mgr: "",
    pc_edd: "", pc_cncl: "", pc_rem: ""
  });
  
  const [saving, setSaving] = useState(false);
  const [autoFillMsg, setAutoFillMsg] = useState('');

  // In-memory lookup first, Firestore fallback
  const lookupInquiry = async (inqId) => {
    if (!inqId) return null;
    const local = (ctxData?.pur_inq || []).find(r =>
      (r.inqId || '').toLowerCase() === inqId.toLowerCase() ||
      (r.id || '').toLowerCase() === inqId.toLowerCase()
    );
    if (local) return local;
    return await autoFillFromInq(inqId);
  };

  const applyAutoFill = async (inqId) => {
    const inqData = await lookupInquiry(inqId);
    if (inqData) {
      setFormData(prev => ({
        ...prev,
        pc_sname: inqData.sellerName || prev.pc_sname,
        pc_veh: inqData.make ? `${inqData.make} ${inqData.model || ''} ${inqData.year || ''}`.trim() : prev.pc_veh,
        pc_mob: inqData.mobile || prev.pc_mob,
        pc_make: inqData.make || prev.pc_make,
        pc_model: inqData.model || prev.pc_model,
        pc_year: inqData.year || prev.pc_year,
        pc_fuel: inqData.fuel || prev.pc_fuel,
        pc_km: inqData.km || prev.pc_km,
        pc_regn: inqData.regNo || prev.pc_regn,
      }));
      setAutoFillMsg(`✅ Auto-filled from: ${inqData.sellerName || inqId}`);
      setTimeout(() => setAutoFillMsg(''), 4000);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAutoFillMsg('');
      if (editData) {
        setFormData({ ...editData });
      } else if (quickInqId) {
        setFormData(prev => ({ ...prev, pc_inqid: quickInqId }));
        applyAutoFill(quickInqId);
      } else {
        setFormData({
          pc_inqid: "", pc_sname: "", pc_veh: "", pc_date: new Date().toISOString().split('T')[0], pc_type: "Direct Purchase",
          pc_stat: "Confirmed", pc_price: "", pc_tok: "", pc_pm1: "Cash", pc_p1: "",
          pc_pm2: "-None-", pc_p2: "", pc_pm3: "-None-", pc_p3: "", pc_newcar: "",
          pc_loan: "No", pc_lbank: "", pc_tokd: "", pc_dby: "Ritesh Shah", pc_mgr: "",
          pc_edd: "", pc_cncl: "", pc_rem: ""
        });
      }
    }
  }, [isOpen, editData, quickInqId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'pc_inqid' && value.length >= 3) {
      applyAutoFill(value);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editData && editData.id) {
        if (onSave) { await onSave(formData); } else { await updateRecord('pcl', editData.id, formData); }
      } else {
        const cnt = await getNextCounter('pcl');
        const pclId = genId('PCL', cnt);
        if (onSave) { await onSave({...formData, pclId}); } 
        else {
          await addRecord('pcl', { ...formData, pclId, date: formData.date || today() });
          if (onSuccess) onSuccess();
        }
      }
      onClose();
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const price = Number(formData.pc_price || 0);
  const token = Number(formData.pc_tok || 0);
  const p1 = Number(formData.pc_p1 || 0);
  const p2 = Number(formData.pc_p2 || 0);
  const p3 = Number(formData.pc_p3 || 0);

  const balPending = price - token;
  const remBal = price - token - p1 - p2 - p3;

  return (
    <div className="overlay on" id="m_pcl">
      <div className="mbox">
        <div className="m-hdr">
          <div className="m-hdr-icon">🤝</div>
          <h3>Purchase Closer</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">
          {autoFillMsg && (
            <div style={{ background: 'rgba(16,185,129,.1)', border: '1px solid #10B981', borderRadius: 'var(--radius-sm)', padding: '8px 14px', fontSize: 12, color: '#10B981', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              {autoFillMsg}
            </div>
          )}
          <div className="grid3">
            <div className="fg"><label>Inquiry ID <span style={{color:"var(--or1)",fontSize:"10px"}}>⚡ Auto-Fill</span></label><input name="pc_inqid" value={formData.pc_inqid} onChange={handleChange} placeholder="INQ-2025-0001" /></div>
            <div className="fg"><label>Seller Name</label><input name="pc_sname" value={formData.pc_sname} onChange={handleChange} placeholder="Name" /></div>
            <div className="fg"><label>Vehicle Details</label><input name="pc_veh" value={formData.pc_veh} onChange={handleChange} placeholder="Make Model Year" /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Closer Date *</label><input type="date" name="pc_date" value={formData.pc_date} onChange={handleChange} /></div>
            <div className="fg"><label>Closer Type</label><select name="pc_type" value={formData.pc_type} onChange={handleChange}><option>Direct Purchase</option><option>Exchange</option><option>Auction</option></select></div>
            <div className="fg"><label>Closer Status</label><select name="pc_stat" value={formData.pc_stat} onChange={handleChange}><option>Confirmed</option><option>Cancelled</option><option>On Hold</option></select></div>
          </div>
          <div className="sect-lbl"><i className="fa fa-indian-rupee-sign"></i> Price & Payment (Auto-Calc)</div>
          <div className="grid3">
            <div className="fg"><label>Final Agreed Price ₹</label><input type="number" name="pc_price" value={formData.pc_price} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Token Amount ₹</label><input type="number" name="pc_tok" value={formData.pc_tok} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Balance Pending ₹ (Auto)</label><div className="calc-out" style={{ color: balPending > 0 ? 'var(--warn)' : 'var(--success)' }}>₹ {balPending.toLocaleString()}</div></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Payment Mode 1</label><select name="pc_pm1" value={formData.pc_pm1} onChange={handleChange}><option>Cash</option><option>NEFT</option><option>RTGS</option><option>UPI</option><option>Cheque</option></select></div>
            <div className="fg"><label>1st Payment ₹</label><input type="number" name="pc_p1" value={formData.pc_p1} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Payment Mode 2</label><select name="pc_pm2" value={formData.pc_pm2} onChange={handleChange}><option>-None-</option><option>Cash</option><option>NEFT</option><option>RTGS</option><option>UPI</option><option>Cheque</option></select></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>2nd Payment ₹</label><input type="number" name="pc_p2" value={formData.pc_p2} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Payment Mode 3</label><select name="pc_pm3" value={formData.pc_pm3} onChange={handleChange}><option>-None-</option><option>Cash</option><option>NEFT</option><option>RTGS</option><option>UPI</option><option>Cheque</option></select></div>
            <div className="fg"><label>3rd Payment ₹</label><input type="number" name="pc_p3" value={formData.pc_p3} onChange={handleChange} placeholder="0" /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Remaining Balance (Auto) ₹</label><div className="calc-out" style={{ color: remBal > 0 ? 'var(--danger)' : 'var(--success)' }}>₹ {remBal.toLocaleString()}</div></div>
            <div className="fg"><label>New Car Exchange ₹</label><input type="number" name="pc_newcar" value={formData.pc_newcar} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Loan Outstanding</label><select name="pc_loan" value={formData.pc_loan} onChange={handleChange}><option>No</option><option>Yes</option></select></div>
            <div className="fg"><label>Loan Bank</label><input name="pc_lbank" value={formData.pc_lbank} onChange={handleChange} placeholder="Bank name" /></div>
            <div className="fg"><label>Token Date</label><input type="date" name="pc_tokd" value={formData.pc_tokd} onChange={handleChange} /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Closer Done By</label><select name="pc_dby" value={formData.pc_dby} onChange={handleChange}><option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option></select></div>
            <div className="fg"><label>Closer Manager</label><input name="pc_mgr" value={formData.pc_mgr} onChange={handleChange} placeholder="Manager name" /></div>
            <div className="fg"><label>Expected Delivery Date</label><input type="date" name="pc_edd" value={formData.pc_edd} onChange={handleChange} /></div>
          </div>
          <div className="grid2">
            <div className="fg"><label>Cancellation Reason</label><input name="pc_cncl" value={formData.pc_cncl} onChange={handleChange} placeholder="If cancelled..." /></div>
            <div className="fg"><label>Remarks</label><input name="pc_rem" value={formData.pc_rem} onChange={handleChange} placeholder="Notes" /></div>
          </div>
        </div>
        <div className="m-foot">
          <button className="btn btn-out" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-or" onClick={handleSave} disabled={saving}>
            {saving ? <><i className="fa fa-spinner fa-spin"></i> Saving…</> : <><i className="fa fa-save"></i> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
};
