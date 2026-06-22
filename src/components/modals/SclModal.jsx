import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { autoFillFromSalInq, autoFillFromStockId, autoFillFromStock } from '../../utils/relations';
import { today } from '../../utils/helpers';

export const SclModal = ({ isOpen, onClose, onSave, onSuccess, editData, quickInqId }) => {
  const blank = {
    sc_inqid: '', sc_stkid: '', sc_bname: '', sc_mob: '',
    sc_make: '', sc_model: '', sc_regn: '', sc_year: '',
    sc_date: today(), sc_stat: 'Confirmed', sc_mrp: '', sc_disc: '',
    sc_tok: '', sc_pm: 'Cash', sc_ins: '', sc_rto: '', sc_oth: '',
    sc_rem: '', sc_dby: 'Ritesh Shah', sc_tcp: ''
  };

  const [formData, setFormData] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [filling, setFilling] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      setFormData({ ...blank, ...editData });
    } else if (quickInqId) {
      setFormData({ ...blank, sc_inqid: quickInqId });
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
        sc_bname: d.buyerName || d.customerName || prev.sc_bname,
        sc_mob: d.mobile || d.buyerMob || prev.sc_mob,
        sc_make: d.makePref || d.make || prev.sc_make,
        sc_model: d.model || prev.sc_model,
        sc_year: d.year || d.yearFrom || prev.sc_year,
        sc_mrp: d.salePrice || d.finalPrice || d.budget || prev.sc_mrp,
        sc_stkid: d.linkedStock || prev.sc_stkid,
      }));
      // Chain-load stock data if linked
      if (d.linkedStock) doFillFromStkId(d.linkedStock);
    }
    setFilling('');
  };

  const doFillFromStkId = async (id) => {
    if (!id || id.length < 5) return;
    setFilling('stk');
    const d = await autoFillFromStockId(id);
    if (d) {
      setFormData(prev => ({
        ...prev,
        sc_make: d.make || d.sk_make || prev.sc_make,
        sc_model: d.model || d.sk_model || prev.sc_model,
        sc_year: d.year || d.sk_year || prev.sc_year,
        sc_regn: d.regNo || d.sk_regn || prev.sc_regn,
        sc_mrp: d.sprice || d.sp || d.sk_sp || prev.sc_mrp,
        sc_tcp: d.tcp || (Number(d.sk_pp || d.pp || 0) + Number(d.sk_refurb || d.refurb || 0) + Number(d.sk_rto || d.rto || 0) + Number(d.sk_ins || d.ins || 0)) || prev.sc_tcp,
      }));
    }
    setFilling('');
  };

  const doFillFromRegNo = async (regNo) => {
    if (!regNo || regNo.length < 5) return;
    setFilling('reg');
    const d = await autoFillFromStock(regNo);
    if (d) {
      setFormData(prev => ({
        ...prev,
        sc_make: d.make || prev.sc_make,
        sc_model: d.model || prev.sc_model,
        sc_year: d.year || prev.sc_year,
        sc_stkid: d.stkId || prev.sc_stkid,
        sc_mrp: d.sprice || d.sp || d.tcp || prev.sc_mrp,
        sc_tcp: d.tcp || (Number(d.sk_pp || d.pp || 0) + Number(d.sk_refurb || d.refurb || 0) + Number(d.sk_rto || d.rto || 0) + Number(d.sk_ins || d.ins || 0)) || prev.sc_tcp,
      }));
    }
    setFilling('');
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'sc_inqid') doFillFromSalInq(value);
    if (name === 'sc_stkid') doFillFromStkId(value);
    if (name === 'sc_regn') doFillFromRegNo(value);
  };

  const mrp = Number(formData.sc_mrp || 0);
  const disc = Number(formData.sc_disc || 0);
  const final = mrp - disc;
  const ins = Number(formData.sc_ins || 0);
  const rto = Number(formData.sc_rto || 0);
  const oth = Number(formData.sc_oth || 0);
  const total = final + ins + rto + oth;
  const tcp = Number(formData.sc_tcp || 0);
  const profit = tcp > 0 ? final - tcp : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...formData, final, total, profit };
      if (editData && editData.id) {
        await updateDoc(doc(db, 'scl', editData.id), { ...payload, updatedAt: new Date().toISOString() });
      } else {
        await addDoc(collection(db, 'scl'), { ...payload, createdAt: new Date().toISOString() });
      }
      if (onSave) await onSave(payload);
      else if (onSuccess) { onSuccess(); onClose(); }
      else onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const Tag = ({ text }) => (
    <span style={{ color: 'var(--or1)', fontSize: 10, fontWeight: 700, marginLeft: 4 }}>
      {filling ? '⏳' : '⚡'} {text}
    </span>
  );

  return (
    <div className="overlay on" id="m_scl">
      <div className="mbox">
        <div className="m-hdr">
          <div className="m-hdr-icon">🏆</div>
          <h3>Sales Closer</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">
          <div className="grid3">
            <div className="fg">
              <label>Sales Inquiry ID <Tag text="Auto-Fill Buyer" /></label>
              <input name="sc_inqid" value={formData.sc_inqid} onChange={handleChange} placeholder="SIN-2025-0001" />
            </div>
            <div className="fg">
              <label>Stock ID <span style={{ color: '#059669', fontSize: 10, fontWeight: 700, marginLeft: 4 }}>{filling === 'stk' ? '⏳' : '⚡'} Auto-Fill Vehicle</span></label>
              <input name="sc_stkid" value={formData.sc_stkid} onChange={handleChange} placeholder="STK-2025-0001" />
            </div>
            <div className="fg">
              <label>Reg No. <span style={{ color: '#059669', fontSize: 10, fontWeight: 700, marginLeft: 4 }}>{filling === 'reg' ? '⏳' : '⚡'} Auto-Fill from Stock</span></label>
              <input name="sc_regn" value={formData.sc_regn} onChange={handleChange} placeholder="GJ-01-AB-1234" />
            </div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Buyer Name</label><input name="sc_bname" value={formData.sc_bname} onChange={handleChange} placeholder="Name" /></div>
            <div className="fg"><label>Mobile</label><input name="sc_mob" value={formData.sc_mob} onChange={handleChange} type="tel" placeholder="Mobile" /></div>
            <div className="fg"><label>Close Date</label><input type="date" name="sc_date" value={formData.sc_date} onChange={handleChange} /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Make</label><input name="sc_make" value={formData.sc_make} onChange={handleChange} placeholder="Maruti" /></div>
            <div className="fg"><label>Model</label><input name="sc_model" value={formData.sc_model} onChange={handleChange} placeholder="Swift VXI" /></div>
            <div className="fg"><label>Year</label><input name="sc_year" value={formData.sc_year} onChange={handleChange} placeholder="2022" /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Status</label>
              <select name="sc_stat" value={formData.sc_stat} onChange={handleChange}>
                <option>Confirmed</option><option>Cancelled</option><option>On Hold</option>
              </select>
            </div>
            <div className="fg"><label>Closer By</label>
              <select name="sc_dby" value={formData.sc_dby} onChange={handleChange}>
                <option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option>
                <option>Maruut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option>
                <option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option>
              </select>
            </div>
            <div className="fg"><label>Token Mode</label>
              <select name="sc_pm" value={formData.sc_pm} onChange={handleChange}>
                <option>Cash</option><option>NEFT</option><option>RTGS</option><option>UPI</option><option>Cheque</option><option>Finance</option>
              </select>
            </div>
          </div>
          <div className="sect-lbl"><i className="fa fa-calculator"></i> Price & Charges (Auto-Calc)</div>
          <div className="grid3">
            <div className="fg"><label>MRP / Listed Price ₹</label><input type="number" name="sc_mrp" value={formData.sc_mrp} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Discount ₹</label><input type="number" name="sc_disc" value={formData.sc_disc} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Final Sale Price ₹ (Auto)</label><div className="calc-out" style={{ color: 'var(--success)' }}>₹ {final.toLocaleString('en-IN')}</div></div>
          </div>
          <div className="sect-lbl"><i className="fa fa-money-bill-wave"></i> Token / Charges</div>
          <div className="grid3">
            <div className="fg"><label>Token Amount ₹</label><input type="number" name="sc_tok" value={formData.sc_tok} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Insurance Charge ₹</label><input type="number" name="sc_ins" value={formData.sc_ins} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>RTO Charge ₹</label><input type="number" name="sc_rto" value={formData.sc_rto} onChange={handleChange} placeholder="0" /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Other Charges ₹</label><input type="number" name="sc_oth" value={formData.sc_oth} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Total Amount ₹ (Auto)</label><div className="calc-out" style={{ color: 'var(--or1)' }}>₹ {total.toLocaleString('en-IN')}</div></div>
            <div className="fg"></div>
          </div>

          {/* Profit Preview */}
          {tcp > 0 && (
            <div style={{ background: profit >= 0 ? 'rgba(34,197,94,.08)' : 'rgba(239,68,68,.08)', border: `1px solid ${profit >= 0 ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`, borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--text3)', marginBottom: 4 }}>💰 Estimated Profit</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>Sale Price ₹{final.toLocaleString('en-IN')} − TCP ₹{tcp.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", color: profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {profit >= 0 ? '+' : ''}₹{profit.toLocaleString('en-IN')}
              </div>
            </div>
          )}

          <div className="grid1" style={{ marginTop: 10 }}><div className="fg"><label>Remarks</label><input name="sc_rem" value={formData.sc_rem} onChange={handleChange} placeholder="Notes" /></div></div>
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
