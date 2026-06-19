import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { autoFillFromSalInq } from '../../utils/relations';
import { today } from '../../utils/helpers';

export const SfuModal = ({ isOpen, onClose, onSave, editData, quickInqId }) => {
  const blank = {
    sf_inqid: '', sf_cname: '', sf_mob: '', sf_make: '', sf_model: '',
    sf_regn: '', sf_year: '', sf_budget: '',
    sf_date: today(), sf_mode: 'Call', sf_seq: '1st Call',
    sf_stat: 'Interested', sf_nfd: '', sf_exec: 'Ritesh Shah', sf_rem: ''
  };

  const [formData, setFormData] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [filling, setFilling] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      setFormData({ ...blank, ...editData });
    } else if (quickInqId) {
      setFormData({ ...blank, sf_inqid: quickInqId });
      doFill(quickInqId);
    } else {
      setFormData(blank);
    }
  }, [isOpen, editData, quickInqId]);

  if (!isOpen) return null;

  const doFill = async (id) => {
    if (!id || id.length < 5) return;
    setFilling(true);
    const d = await autoFillFromSalInq(id);
    if (d) {
      setFormData(prev => ({
        ...prev,
        sf_cname: d.buyerName || d.customerName || prev.sf_cname,
        sf_mob: d.mobile || d.buyerMob || prev.sf_mob,
        sf_make: d.make || d.interestedMake || prev.sf_make,
        sf_model: d.model || d.interestedModel || prev.sf_model,
        sf_year: d.year || prev.sf_year,
        sf_budget: d.budget || prev.sf_budget,
      }));
    }
    setFilling(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'sf_inqid') doFill(value);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editData && editData.id) {
        await updateDoc(doc(db, 'sfu', editData.id), { ...formData, updatedAt: new Date().toISOString() });
      } else {
        await addDoc(collection(db, 'sfu'), { ...formData, createdAt: new Date().toISOString() });
      }
      if (onSave) await onSave(formData);
      else onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay on" id="m_sfu">
      <div className="mbox">
        <div className="m-hdr">
          <div className="m-hdr-icon">💬</div>
          <h3>Sales Follow-Up</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">
          <div className="grid3">
            <div className="fg">
              <label>
                Sales Inquiry ID
                <span style={{ color: 'var(--or1)', fontSize: 10, marginLeft: 4 }}>
                  {filling ? '⏳ Loading…' : '⚡ Auto-Fill'}
                </span>
              </label>
              <input name="sf_inqid" value={formData.sf_inqid} onChange={handleChange} placeholder="SIN-2025-0001" />
            </div>
            <div className="fg"><label>Customer Name</label><input name="sf_cname" value={formData.sf_cname} onChange={handleChange} placeholder="Name" /></div>
            <div className="fg"><label>Mobile</label><input name="sf_mob" value={formData.sf_mob} onChange={handleChange} type="tel" placeholder="Mobile" /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Make <span style={{ color: 'var(--or1)', fontSize: 10 }}>⚡ Auto</span></label><input name="sf_make" value={formData.sf_make} onChange={handleChange} placeholder="e.g. Maruti" /></div>
            <div className="fg"><label>Model <span style={{ color: 'var(--or1)', fontSize: 10 }}>⚡ Auto</span></label><input name="sf_model" value={formData.sf_model} onChange={handleChange} placeholder="e.g. Swift VXI" /></div>
            <div className="fg"><label>Year <span style={{ color: 'var(--or1)', fontSize: 10 }}>⚡ Auto</span></label><input name="sf_year" value={formData.sf_year} onChange={handleChange} placeholder="2022" /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Budget ₹ <span style={{ color: 'var(--or1)', fontSize: 10 }}>⚡ Auto</span></label><input type="number" name="sf_budget" value={formData.sf_budget} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Reg No. <span style={{ color: 'var(--or1)', fontSize: 10 }}>⚡ Auto</span></label><input name="sf_regn" value={formData.sf_regn} onChange={handleChange} placeholder="GJ-01-AB-1234" /></div>
            <div className="fg"><label>Follow-Up Date *</label><input type="date" name="sf_date" value={formData.sf_date} onChange={handleChange} /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Mode</label>
              <select name="sf_mode" value={formData.sf_mode} onChange={handleChange}>
                <option>Call</option><option>WhatsApp</option><option>Visit</option><option>Email</option>
              </select>
            </div>
            <div className="fg"><label>Sequence</label>
              <select name="sf_seq" value={formData.sf_seq} onChange={handleChange}>
                <option>1st Call</option><option>2nd Call</option><option>3rd Call</option><option>Final Call</option>
              </select>
            </div>
            <div className="fg"><label>Status</label>
              <select name="sf_stat" value={formData.sf_stat} onChange={handleChange}>
                <option>Interested</option><option>Not Interested</option><option>Callback</option>
                <option>Site Visit</option><option>Closed-Won</option><option>Closed-Lost</option>
              </select>
            </div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Next Follow-Up Date</label><input type="date" name="sf_nfd" value={formData.sf_nfd} onChange={handleChange} /></div>
            <div className="fg"><label>Executive</label>
              <select name="sf_exec" value={formData.sf_exec} onChange={handleChange}>
                <option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option>
                <option>Maruut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option>
                <option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option>
              </select>
            </div>
            <div className="fg"></div>
          </div>
          <div className="grid1"><div className="fg"><label>Remarks</label><textarea name="sf_rem" value={formData.sf_rem} onChange={handleChange} placeholder="Notes…"></textarea></div></div>
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
