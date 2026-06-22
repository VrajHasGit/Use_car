import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { autoFillFromSalInq, autoFillFromStockId } from '../../utils/relations';
import { today } from '../../utils/helpers';

export const SfuModal = ({ isOpen, onClose, onSave, editData, quickInqId }) => {
  const blank = {
    sf_inqid: '', sf_stkid: '', sf_cname: '', sf_mob: '', sf_make: '', sf_model: '',
    sf_regn: '', sf_year: '', sf_budget: '',
    sf_date: today(), sf_mode: 'Call', sf_seq: '1st Call',
    sf_stat: 'Interested', sf_nfd: '', sf_exec: 'Ritesh Shah', sf_rem: ''
  };

  const [formData, setFormData] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [filling, setFilling] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      setFormData({ ...blank, ...editData });
    } else if (quickInqId) {
      setFormData({ ...blank, sf_inqid: quickInqId });
      doFillFromSalInq(quickInqId);
    } else {
      setFormData(blank);
    }
  }, [isOpen, editData, quickInqId]);

  if (!isOpen) return null;

  const doFillFromSalInq = async (id) => {
    if (!id || id.length < 5) return;
    setFilling('inq');
    const d = await autoFillFromSalInq(id);
    if (d) {
      setFormData(prev => ({
        ...prev,
        sf_cname: d.buyerName || d.customerName || prev.sf_cname,
        sf_mob: d.mobile || d.buyerMob || prev.sf_mob,
        sf_make: d.makePref || d.make || d.interestedMake || prev.sf_make,
        sf_model: d.model || d.interestedModel || prev.sf_model,
        sf_year: d.year || d.yearFrom || prev.sf_year,
        sf_budget: d.budget || prev.sf_budget,
        sf_stkid: d.linkedStock || prev.sf_stkid,
      }));
      // If inquiry has a linked stock, also auto-fill vehicle from stock
      if (d.linkedStock) {
        doFillFromStock(d.linkedStock);
      }
    }
    setFilling('');
  };

  const doFillFromStock = async (id) => {
    if (!id || id.length < 5) return;
    setFilling('stk');
    const d = await autoFillFromStockId(id);
    if (d) {
      setFormData(prev => ({
        ...prev,
        sf_make: d.make || d.sk_make || prev.sf_make,
        sf_model: d.model || d.sk_model || prev.sf_model,
        sf_year: d.year || d.sk_year || prev.sf_year,
        sf_regn: d.regNo || d.sk_regn || prev.sf_regn,
        sf_budget: d.sprice || d.sp || d.sk_sp || prev.sf_budget,
      }));
    }
    setFilling('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'sf_inqid') doFillFromSalInq(value);
    if (name === 'sf_stkid') doFillFromStock(value);
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

  const Tag = ({ text, type }) => (
    <span style={{ color: type === 'stk' ? '#059669' : 'var(--or1)', fontSize: 10, fontWeight: 700, marginLeft: 4 }}>
      {filling === type ? '⏳' : '⚡'} {text}
    </span>
  );

  return (
    <div className="overlay on" id="m_sfu">
      <div className="mbox">
        <div className="m-hdr">
          <div className="m-hdr-icon">💬</div>
          <h3>Sales Follow-Up</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">
          {/* Auto-Fill Banner */}
          <div style={{ background: 'rgba(255,107,0,.07)', border: '1px solid rgba(255,107,0,.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="fg" style={{ margin: 0 }}>
                <label style={{ color: 'var(--or3)', fontSize: 10, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Sales Inquiry ID <Tag text="Auto-Fill Buyer" type="inq" />
                </label>
                <input name="sf_inqid" value={formData.sf_inqid} onChange={handleChange} placeholder="SIN-2025-0001"
                  style={{ background: 'var(--bg)', border: '1px solid rgba(255,107,0,.4)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontFamily: 'inherit', fontSize: 12, width: '100%' }} />
              </div>
              <div className="fg" style={{ margin: 0 }}>
                <label style={{ color: '#059669', fontSize: 10, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Stock ID <Tag text="Auto-Fill Vehicle" type="stk" />
                </label>
                <input name="sf_stkid" value={formData.sf_stkid} onChange={handleChange} placeholder="STK-2025-0001"
                  style={{ background: 'var(--bg)', border: '1px solid rgba(5,150,105,.4)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontFamily: 'inherit', fontSize: 12, width: '100%' }} />
              </div>
            </div>
          </div>

          <div className="grid3">
            <div className="fg"><label>Customer Name</label><input name="sf_cname" value={formData.sf_cname} onChange={handleChange} placeholder="Name" /></div>
            <div className="fg"><label>Mobile</label><input name="sf_mob" value={formData.sf_mob} onChange={handleChange} type="tel" placeholder="Mobile" /></div>
            <div className="fg"><label>Follow-Up Date *</label><input type="date" name="sf_date" value={formData.sf_date} onChange={handleChange} /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Make {formData.sf_stkid && <span style={{ color: '#059669', fontSize: 10 }}>⚡ from Stock</span>}</label><input name="sf_make" value={formData.sf_make} onChange={handleChange} placeholder="e.g. Maruti" /></div>
            <div className="fg"><label>Model {formData.sf_stkid && <span style={{ color: '#059669', fontSize: 10 }}>⚡ from Stock</span>}</label><input name="sf_model" value={formData.sf_model} onChange={handleChange} placeholder="e.g. Swift VXI" /></div>
            <div className="fg"><label>Year {formData.sf_stkid && <span style={{ color: '#059669', fontSize: 10 }}>⚡ from Stock</span>}</label><input name="sf_year" value={formData.sf_year} onChange={handleChange} placeholder="2022" /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Budget ₹</label><input type="number" name="sf_budget" value={formData.sf_budget} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Reg No. {formData.sf_stkid && <span style={{ color: '#059669', fontSize: 10 }}>⚡ from Stock</span>}</label><input name="sf_regn" value={formData.sf_regn} onChange={handleChange} placeholder="GJ-01-AB-1234" /></div>
            <div className="fg"><label>Mode</label>
              <select name="sf_mode" value={formData.sf_mode} onChange={handleChange}>
                <option>Call</option><option>WhatsApp</option><option>Visit</option><option>Email</option>
              </select>
            </div>
          </div>
          <div className="grid3">
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
            <div className="fg"><label>Next Follow-Up Date</label><input type="date" name="sf_nfd" value={formData.sf_nfd} onChange={handleChange} /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Executive</label>
              <select name="sf_exec" value={formData.sf_exec} onChange={handleChange}>
                <option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option>
                <option>Maruut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option>
                <option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option>
              </select>
            </div>
            <div className="fg"></div>
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
