import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useData } from '../../contexts/DataContext';
import { autoFillFromInq } from '../../utils/relations';
import { FUELS, OWNERS } from '../../utils/constants';

export const PfuModal = ({ isOpen, onClose, onSave, editData, quickInqId }) => {
  const { data: ctxData } = useData();
  const [formData, setFormData] = useState({
    pf_inqid: "", pf_sname: "", pf_smob: "", pf_veh: "", pf_var: "",
    pf_year: "", pf_fuel: "Petrol", pf_km: "", pf_own: "1st", pf_date: "",
    pf_time: "", pf_mode: "Call", pf_by: "", pf_seq: "1st Call", pf_exch: "No",
    pf_stat: "Interested", pf_nfd: "", pf_exec: "Ritesh Shah", pf_nego: "",
    pf_exp: "", pf_offer: "", pf_close: "", pf_rej: "", pf_rem: ""
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
        pf_sname: inqData.sellerName || '',
        pf_smob: inqData.mobile || '',
        pf_veh: inqData.make ? `${inqData.make} ${inqData.model || ''}` : '',
        pf_var: inqData.variant || prev.pf_var,
        pf_year: inqData.year || '',
        pf_fuel: inqData.fuel || 'Petrol',
        pf_km: inqData.km || prev.pf_km,
        pf_own: inqData.owners || prev.pf_own,
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
        setFormData(prev => ({ ...prev, pf_inqid: quickInqId }));
        applyAutoFill(quickInqId);
      } else {
        setFormData({
          pf_inqid: "", pf_sname: "", pf_smob: "", pf_veh: "", pf_var: "",
          pf_year: "", pf_fuel: "Petrol", pf_km: "", pf_own: "1st", pf_date: new Date().toISOString().split('T')[0],
          pf_time: "", pf_mode: "Call", pf_by: "", pf_seq: "1st Call", pf_exch: "No",
          pf_stat: "Interested", pf_nfd: "", pf_exec: "Ritesh Shah", pf_nego: "",
          pf_exp: "", pf_offer: "", pf_close: "", pf_rej: "", pf_rem: ""
        });
      }
    }
  }, [isOpen, editData, quickInqId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'pf_inqid' && value.length >= 3) {
      applyAutoFill(value);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSave && editData) {
        await onSave(formData);
      } else {
        await addDoc(collection(db, 'pfu'), { ...formData, createdAt: new Date().toISOString() });
        if (onSave) { await onSave(formData); } else { onClose(); }
      }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const diff = Number(formData.pf_nego || 0) - Number(formData.pf_offer || 0);

  return (
    <div className="overlay on" id="m_pfu">
      <div className="mbox">
        <div className="m-hdr">
          <div className="m-hdr-icon">📞</div>
          <h3>Purchase Follow-Up</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">
          {autoFillMsg && (
            <div style={{ background: 'rgba(16,185,129,.1)', border: '1px solid #10B981', borderRadius: 'var(--radius-sm)', padding: '8px 14px', fontSize: 12, color: '#10B981', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              {autoFillMsg}
            </div>
          )}
          <div className="grid3">
            <div className="fg"><label>Inquiry ID <span style={{color:"var(--or1)",fontSize:"10px"}}>⚡ Auto-Fill</span></label><input name="pf_inqid" value={formData.pf_inqid} onChange={handleChange} placeholder="INQ-2025-0001" /></div>
            <div className="fg"><label>Seller Name</label><input name="pf_sname" value={formData.pf_sname} onChange={handleChange} placeholder="Auto-filled" /></div>
            <div className="fg"><label>Seller Mobile</label><input name="pf_smob" value={formData.pf_smob} onChange={handleChange} type="tel" placeholder="Mobile" /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Vehicle Make/Model</label><input name="pf_veh" value={formData.pf_veh} onChange={handleChange} placeholder="Make Model Year" /></div>
            <div className="fg"><label>Variant</label><input name="pf_var" value={formData.pf_var} onChange={handleChange} placeholder="Variant" /></div>
            <div className="fg"><label>Year</label><input name="pf_year" value={formData.pf_year} onChange={handleChange} placeholder="Year" type="number" /></div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Fuel Type</label>
              <select name="pf_fuel" value={formData.pf_fuel} onChange={handleChange}>
                {FUELS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="fg"><label>KM Driven</label><input name="pf_km" value={formData.pf_km} onChange={handleChange} type="number" placeholder="KM" /></div>
            <div className="fg">
              <label>Owners</label>
              <select name="pf_own" value={formData.pf_own} onChange={handleChange}>
                {OWNERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Follow-Up Date *</label><input type="date" name="pf_date" value={formData.pf_date} onChange={handleChange} /></div>
            <div className="fg"><label>Follow-Up Time</label><input type="time" name="pf_time" value={formData.pf_time} onChange={handleChange} /></div>
            <div className="fg"><label>Follow-Up Mode</label><select name="pf_mode" value={formData.pf_mode} onChange={handleChange}><option>Call</option><option>WhatsApp</option><option>Visit</option><option>Email</option><option>SMS</option></select></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Follow-Up By</label><input name="pf_by" value={formData.pf_by} onChange={handleChange} placeholder="Executive name" /></div>
            <div className="fg"><label>Call Sequence</label><select name="pf_seq" value={formData.pf_seq} onChange={handleChange}><option>1st Call</option><option>2nd Call</option><option>3rd Call</option><option>Final Call</option></select></div>
            <div className="fg"><label>Exchange Vehicle</label><select name="pf_exch" value={formData.pf_exch} onChange={handleChange}><option>No</option><option>Yes</option></select></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Follow-Up Status</label><select name="pf_stat" value={formData.pf_stat} onChange={handleChange}><option>Interested</option><option>Not Interested</option><option>Callback</option><option>Price Nego</option><option>Closed-Won</option><option>Closed-Lost</option></select></div>
            <div className="fg"><label>Next Follow-Up Date</label><input type="date" name="pf_nfd" value={formData.pf_nfd} onChange={handleChange} /></div>
            <div className="fg"><label>Follow-Up Executive</label><select name="pf_exec" value={formData.pf_exec} onChange={handleChange}><option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option></select></div>
          </div>
          <div className="sect-lbl"><i className="fa fa-indian-rupee-sign"></i> Price Negotiation (Auto-Calc)</div>
          <div className="grid3">
            <div className="fg"><label>Negotiable Price ₹</label><input type="number" name="pf_nego" value={formData.pf_nego} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Customer Expectation ₹</label><input type="number" name="pf_exp" value={formData.pf_exp} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Offer Price ₹</label><input type="number" name="pf_offer" value={formData.pf_offer} onChange={handleChange} placeholder="0" /></div>
          </div>
          <div className="grid2">
            <div className="fg"><label>Deal Close Price ₹</label><input type="number" name="pf_close" value={formData.pf_close} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Difference (Nego - Offer) ₹</label><div className="calc-out" style={{ color: diff < 0 ? 'var(--danger)' : 'var(--success)' }}>₹ {diff.toLocaleString()}</div></div>
          </div>
          <div className="grid2">
            <div className="fg"><label>Rejection Reason</label><input name="pf_rej" value={formData.pf_rej} onChange={handleChange} placeholder="If rejected…" /></div>
            <div className="fg"><label>Remarks</label><input name="pf_rem" value={formData.pf_rem} onChange={handleChange} placeholder="Notes" /></div>
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
