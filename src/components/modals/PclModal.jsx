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
    pc_stat: "Confirmed", pc_price: "", pc_tok: "", payments: [],
    pc_newcar: "",
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
    let finalDate = "";
    let finalDealPrice = "";
    
    if (ctxData?.pfu) {
      const pfuRec = ctxData.pfu.find(r => (r.pf_inqid || '').toLowerCase() === (inqId || '').toLowerCase());
      if (pfuRec && pfuRec.followUps) {
        const cwFu = [...pfuRec.followUps].reverse().find(fu => fu.stat === 'Closed-Won');
        if (cwFu) {
          if (cwFu.date) finalDate = cwFu.date;
          if (cwFu.dealPrice) finalDealPrice = cwFu.dealPrice;
        }
      }
    }

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
        pc_date: prev.pc_date || finalDate || today(),
        pc_price: prev.pc_price || finalDealPrice,
      }));
      setAutoFillMsg(`✅ Auto-filled from: ${inqData.sellerName || inqId}`);
      setTimeout(() => setAutoFillMsg(''), 4000);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAutoFillMsg('');
      if (editData) {
        const inqIdToUse = editData.pc_inqid || editData.inqId || '';
        setFormData({ ...editData, pc_inqid: inqIdToUse });
        if (inqIdToUse) applyAutoFill(inqIdToUse);
      } else if (quickInqId) {
        setFormData(prev => ({ ...prev, pc_inqid: quickInqId }));
        applyAutoFill(quickInqId);
      } else {
        setFormData({
          pc_inqid: "", pc_sname: "", pc_veh: "", pc_date: new Date().toISOString().split('T')[0], pc_type: "Direct Purchase",
          pc_stat: "Confirmed", pc_price: "", pc_tok: "", payments: [],
          pc_newcar: "",
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

  const addPayment = () => {
    setFormData(prev => ({
      ...prev,
      payments: [...(prev.payments || []), { mode: 'CASH', amount: '' }]
    }));
  };

  const handlePaymentChange = (index, field, value) => {
    const updated = [...(formData.payments || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, payments: updated }));
  };

  const removePayment = (index) => {
    const updated = (formData.payments || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, payments: updated }));
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
          if (onSuccess) await onSuccess();
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
  const totalPaid = (formData.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);

  const balPending = price - token;
  const remBal = price - token - totalPaid;

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
            <div className="fg"><label>Inquiry ID <span style={{color:"var(--or1)",fontSize:"10px"}}>⚡ Auto-Fill</span></label><input name="pc_inqid" value={formData.pc_inqid} onChange={handleChange} placeholder="INQ-2025-0001" disabled={!!editData || !!quickInqId} /></div>
            <div className="fg"><label>Seller Name</label><input name="pc_sname" value={formData.pc_sname} onChange={handleChange} placeholder="Name" disabled={!!editData || !!quickInqId} /></div>
            <div className="fg"><label>Vehicle Details</label><input name="pc_veh" value={formData.pc_veh} onChange={handleChange} placeholder="Make Model Year" disabled={!!editData || !!quickInqId} /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Closer Date *</label><input type="date" name="pc_date" value={formData.pc_date} onChange={handleChange} disabled /></div>
          </div>
          <div className="sect-lbl"><i className="fa fa-indian-rupee-sign"></i> Price & Payment (Auto-Calc)</div>
          <div className="grid3">
            <div className="fg"><label>Final Agreed Price ₹</label><input type="number" name="pc_price" value={formData.pc_price} onChange={handleChange} placeholder="0" style={{ background: 'rgba(16,185,129,.08)', borderColor: 'var(--success)', color: 'var(--success)', fontWeight: 700 }} /></div>
            <div className="fg"><label>Token Amount ₹</label><input type="number" name="pc_tok" value={formData.pc_tok} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Balance Pending ₹ (Auto)</label><div className="calc-out" style={{ color: balPending > 0 ? 'var(--warn)' : 'var(--success)' }}>₹ {balPending.toLocaleString()}</div></div>
          </div>
          {(formData.payments || []).map((pmt, idx) => (
            <div key={idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: idx < (formData.payments.length - 1) ? '1px dashed var(--border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ background: 'var(--or1)', color: '#fff', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Payment {idx + 1}</span>
                <button type="button" onClick={() => removePayment(idx)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }} title="Remove">✕</button>
              </div>
              <div className="grid3">
                <div className="fg">
                  <label>Mode</label>
                  <select value={pmt.mode} onChange={e => handlePaymentChange(idx, 'mode', e.target.value)}>
                    <option>CASH</option>
                    <option>CHEQUE</option>
                    <option>ONLINE</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Amount ₹</label>
                  <input type="number" value={pmt.amount} onChange={e => handlePaymentChange(idx, 'amount', e.target.value)} placeholder="0" />
                </div>
                <div className="fg" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="button" className="btn btn-out" style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }} disabled title="Voucher PDF — coming soon">
                    <i className="fa fa-download"></i> Download Voucher
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addPayment} className="btn btn-out" style={{ width: '100%', padding: 10, borderStyle: 'dashed', marginBottom: 14 }}>
            <i className="fa fa-plus"></i> Add Payment
          </button>
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
            {saving ? <><i className="car-spinner"></i> Saving…</> : <><i className="fa fa-save"></i> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
};
