import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { autoFillFromStock, autoFillFromStockId } from '../../utils/relations';
import { today, printDocument } from '../../utils/helpers';

export const SobModal = ({ isOpen, onClose, onSave, editData }) => {
  const blank = {
    sob_sclid: '', sob_sinid: '', sob_stkid: '', sob_branch: 'SG Highway',
    sob_ps: 'No', sob_date: today(),
    sob_cname: '', sob_cont: '', sob_edd: '', sob_addr: '', sob_email: '',
    sob_exec: 'Ritesh Shah', sob_src: '', sob_partner: '', sob_support: '',
    sob_broker: '', sob_brokcomm: '',
    sob_regn: '', sob_mm: '', sob_year: '', sob_color: 'White', sob_fuel: 'Petrol',
    sob_own: '1st Owner', sob_km: '', sob_instype: 'New', sob_finance: 'No',
    sob_insstat: 'New', sob_finbank: '', sob_chas: '',
    sob_saleprice: '', sob_tcs: '', sob_rto: '', sob_inschrg: '',
    sob_warranty: '', sob_acc: '', sob_other: '',
    sob_pd1_date: '', sob_pd1_onl: '', sob_pd1_cash: '',
    sob_pd2_date: '', sob_pd2_onl: '', sob_pd2_cash: '',
    sob_pd3_date: '', sob_pd3_onl: '', sob_pd3_cash: '',
    sob_pd4_date: '', sob_pd4_onl: '', sob_pd4_cash: '',
    sob_pd5_date: '', sob_pd5_onl: '', sob_pd5_cash: '',
    sob_pd6_date: '', sob_pd6_onl: '', sob_pd6_cash: '',
    sob_pd7_date: '', sob_pd7_onl: '', sob_pd7_cash: '',
    sob_rem: ''
  };

  const [formData, setFormData] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [filling, setFilling] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editData) setFormData({ ...blank, ...editData });
    else setFormData({ ...blank, sob_date: today() });
  }, [isOpen, editData]);

  if (!isOpen) return null;

  // Auto-fill from Stock ID
  const doFillFromStkId = async (id) => {
    if (!id || id.length < 5) return;
    setFilling('stk');
    const d = await autoFillFromStockId(id);
    if (d) {
      setFormData(prev => ({
        ...prev,
        sob_mm: (d.make || d.sk_make || '') + ' ' + (d.model || d.sk_model || ''),
        sob_year: d.year || d.sk_year || prev.sob_year,
        sob_color: d.color || d.sk_color || prev.sob_color,
        sob_fuel: d.fuel || d.sk_fuel || prev.sob_fuel,
        sob_km: d.km || d.sk_km || prev.sob_km,
        sob_regn: d.regNo || d.sk_regn || prev.sob_regn,
        sob_saleprice: d.sprice || d.sp || d.sk_sp || prev.sob_saleprice,
      }));
    }
    setFilling('');
  };

  // Auto-fill from Reg No
  const doFillFromRegNo = async (regNo) => {
    if (!regNo || regNo.length < 8) return;
    setFilling('reg');
    const d = await autoFillFromStock(regNo);
    if (d) {
      setFormData(prev => ({
        ...prev,
        sob_mm: (d.make || '') + ' ' + (d.model || ''),
        sob_year: d.year || prev.sob_year,
        sob_color: d.color || prev.sob_color,
        sob_fuel: d.fuel || prev.sob_fuel,
        sob_km: d.km || prev.sob_km,
        sob_stkid: d.stkId || prev.sob_stkid,
        sob_saleprice: d.sprice || d.sp || prev.sob_saleprice,
      }));
    }
    setFilling('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'sob_stkid') doFillFromStkId(value);
    if (name === 'sob_regn') doFillFromRegNo(value);
  };

  // Auto-calculate deal total
  const dealTotal = useMemo(() => {
    const fields = ['sob_saleprice', 'sob_tcs', 'sob_rto', 'sob_inschrg', 'sob_warranty', 'sob_acc', 'sob_other'];
    return fields.reduce((s, f) => s + (parseFloat(formData[f]) || 0), 0);
  }, [formData]);

  // Auto-calculate payment totals
  const payOnlTotal = useMemo(() => {
    let t = 0;
    for (let i = 1; i <= 7; i++) t += parseFloat(formData[`sob_pd${i}_onl`]) || 0;
    return t;
  }, [formData]);

  const payCashTotal = useMemo(() => {
    let t = 0;
    for (let i = 1; i <= 7; i++) t += parseFloat(formData[`sob_pd${i}_cash`]) || 0;
    return t;
  }, [formData]);

  const totalPaid = payOnlTotal + payCashTotal;
  const balance = dealTotal - totalPaid;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...formData, dealTotal, payOnlTotal, payCashTotal, totalPaid, balance };
      if (editData && editData.id) {
        await updateDoc(doc(db, 'sob', editData.id), { ...payload, updatedAt: new Date().toISOString() });
      } else {
        await addDoc(collection(db, 'sob'), { ...payload, createdAt: new Date().toISOString() });
      }
      if (onSave) await onSave(payload);
      else onClose();
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const fmtAmt = (n) => '₹ ' + Number(n || 0).toLocaleString('en-IN');

  const handlePrint = () => {
    const customStyles = `
      .section { margin-bottom: 16px; }
      .section-title { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #1A56DB; border-bottom: 1px solid #1A56DB; padding-bottom: 4px; margin-bottom: 10px; }
      .doc-title { font-size: 16px; font-weight: 700; text-align: center; background: #1A56DB; color: #fff; padding: 8px; border-radius: 4px; margin-bottom: 16px; letter-spacing: 1px; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px; color: #444; }
      .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
      .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .field { margin-bottom: 8px; }
      .field label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #888; letter-spacing: .5px; display: block; margin-bottom: 2px; }
      .field .value { font-size: 12px; font-weight: 600; color: #111; border-bottom: 1px dotted #ccc; padding-bottom: 3px; min-height: 18px; }
      .cost-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      .cost-table th { background: #F0F4F8; padding: 7px 10px; text-align: left; font-size: 10px; letter-spacing: .5px; text-transform: uppercase; border: 1px solid #ddd; }
      .cost-table td { padding: 7px 10px; border: 1px solid #ddd; font-size: 11px; }
      .cost-total { font-weight: 800; font-size: 13px; color: #1A56DB; background: #EFF6FF; }
      .sign-section { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; }
      .sign-box { text-align: center; }
      .sign-line { border-top: 1px solid #000; padding-top: 5px; margin-top: 50px; font-size: 10px; color: #555; }
      .booking-id-badge { display: inline-block; background: #1A56DB; color: #fff; padding: 3px 12px; border-radius: 4px; font-weight: 700; font-size: 12px; }
    `;

    const htmlContent = `
        <div class="doc-title">SALES ORDER BOOKING FORM</div>
        <div class="info-row">
          <span>Booking Date: <strong>${formData.sob_date || '—'}</strong></span>
          <span>Branch: <strong>${formData.sob_branch || '—'}</strong></span>
          <span>Booking ID: <span class="booking-id-badge">${formData.sobId || formData.sob_sclid || '—'}</span></span>
        </div>
        ${formData.sob_stkid ? `<div class="info-row"><span>Stock ID: <strong>${formData.sob_stkid}</strong></span><span>Sales Closer ID: <strong>${formData.sob_sclid || '—'}</strong></span></div>` : ''}

        <div class="section" style="margin-top:12px">
          <div class="section-title">Client Details</div>
          <div class="grid">
            <div class="field"><label>Client Name</label><div class="value">${formData.sob_cname || ''}</div></div>
            <div class="field"><label>Contact No.</label><div class="value">${formData.sob_cont || ''}</div></div>
            <div class="field"><label>Email</label><div class="value">${formData.sob_email || ''}</div></div>
          </div>
          <div class="field"><label>Address</label><div class="value">${formData.sob_addr || ''}</div></div>
        </div>

        <div class="section">
          <div class="section-title">Vehicle Details</div>
          <div class="grid">
            <div class="field"><label>Make & Model</label><div class="value">${formData.sob_mm || ''}</div></div>
            <div class="field"><label>Color</label><div class="value">${formData.sob_color || ''}</div></div>
            <div class="field"><label>Fuel Type</label><div class="value">${formData.sob_fuel || ''}</div></div>
          </div>
          <div class="grid">
            <div class="field"><label>Chassis No.</label><div class="value">${formData.sob_chas || ''}</div></div>
            <div class="field"><label>Reg. No.</label><div class="value">${formData.sob_regn || ''}</div></div>
            <div class="field"><label>Year</label><div class="value">${formData.sob_year || ''}</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Deal Calculation</div>
          <table class="cost-table">
            <thead><tr><th>Description</th><th>Amount (INR)</th></tr></thead>
            <tbody>
              <tr><td>Sale Price</td><td>${fmtAmt(formData.sob_saleprice)}</td></tr>
              <tr><td>TCS</td><td>${fmtAmt(formData.sob_tcs)}</td></tr>
              <tr><td>RTO Charge</td><td>${fmtAmt(formData.sob_rto)}</td></tr>
              <tr><td>Insurance Charge</td><td>${fmtAmt(formData.sob_inschrg)}</td></tr>
              <tr><td>Extended Warranty</td><td>${fmtAmt(formData.sob_warranty)}</td></tr>
              <tr><td>Accessories</td><td>${fmtAmt(formData.sob_acc)}</td></tr>
              <tr><td>Other Charges</td><td>${fmtAmt(formData.sob_other)}</td></tr>
              <tr class="cost-total"><td><strong>TOTAL AMOUNT</strong></td><td><strong>${fmtAmt(dealTotal)}</strong></td></tr>
              <tr><td>Total Paid (Online + Cash)</td><td>${fmtAmt(totalPaid)}</td></tr>
              <tr class="cost-total" style="background:#FEF2F2;color:#DC2626"><td><strong>BALANCE PENDING</strong></td><td><strong>${fmtAmt(balance)}</strong></td></tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Additional Info</div>
          <div class="grid">
            <div class="field"><label>Sales Executive</label><div class="value">${formData.sob_exec || ''}</div></div>
            <div class="field"><label>Broker Name</label><div class="value">${formData.sob_broker || ''}</div></div>
            <div class="field"><label>Source Channel</label><div class="value">${formData.sob_src || ''}</div></div>
          </div>
          ${formData.sob_rem ? `<div class="field"><label>Remarks</label><div class="value">${formData.sob_rem}</div></div>` : ''}
        </div>

        <div class="sign-section">
          <div class="sign-box"><div class="sign-line">Client Signature</div></div>
          <div class="sign-box"><div class="sign-line">Authorized Signatory</div></div>
          <div class="sign-box"><div class="sign-line">Manager / Partner</div></div>
        </div>
    `;

    const title = formData.sobId || formData.sob_sclid || 'SOB-Draft';
    printDocument(title, htmlContent, customStyles);
  };

  const payRows = [
    { label: 'Booking Amt', idx: 1, highlight: true },
    { label: '1st Payment', idx: 2 },
    { label: '2nd Payment', idx: 3 },
    { label: '3rd Payment', idx: 4 },
    { label: '4th Payment', idx: 5 },
    { label: 'Loan Disbursement', idx: 6 },
    { label: 'Old Car Value', idx: 7 },
  ];

  return (
    <div className="overlay on" id="m_sob">
      <div className="mbox" style={{ maxWidth: 900 }}>
        <div className="m-hdr">
          <div className="m-hdr-icon">📋</div>
          <h3>Sales Order Booking</h3>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-bl btn-sm" onClick={handlePrint}><i className="fa fa-print"></i> Print Form</button>
            <button className="m-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="m-body">

          {/* ⚡ Auto-Fill IDs Banner */}
          <div style={{ background: 'rgba(255,107,0,.07)', border: '1px solid rgba(255,107,0,.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div className="fg" style={{ margin: 0 }}>
                <label style={{ color: 'var(--or3)', fontSize: 10, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Sales Closer ID</label>
                <input name="sob_sclid" value={formData.sob_sclid} onChange={handleChange} placeholder="SCL-2025-0001"
                  style={{ background: 'var(--bg)', border: '1px solid rgba(255,107,0,.4)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontFamily: 'inherit', fontSize: 12, width: '100%' }} />
              </div>
              <div className="fg" style={{ margin: 0 }}>
                <label style={{ color: 'var(--bl5)', fontSize: 10, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Sales Inquiry ID</label>
                <input name="sob_sinid" value={formData.sob_sinid} onChange={handleChange} placeholder="SIN-2025-0001"
                  style={{ background: 'var(--bg)', border: '1px solid rgba(59,130,246,.4)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontFamily: 'inherit', fontSize: 12, width: '100%' }} />
              </div>
              <div className="fg" style={{ margin: 0 }}>
                <label style={{ color: '#059669', fontSize: 10, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  🚗 Stock ID {filling === 'stk' ? '⏳' : '⚡ Auto-Fill'}
                </label>
                <input name="sob_stkid" value={formData.sob_stkid} onChange={handleChange} placeholder="STK-2025-0001"
                  style={{ background: 'var(--bg)', border: '1px solid rgba(5,150,105,.4)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontFamily: 'inherit', fontSize: 12, width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Branch + Park & Sale + Date */}
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div className="fg" style={{ margin: 0, flex: 1, minWidth: 160 }}>
              <label>Branch</label>
              <select name="sob_branch" value={formData.sob_branch} onChange={handleChange}><option>SG Highway</option><option>Vastral</option><option>Head Office</option></select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text3)', whiteSpace: 'nowrap' }}>Park & Sale:</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, cursor: 'pointer' }}>
                <input type="radio" name="sob_ps" value="Yes" checked={formData.sob_ps === 'Yes'} onChange={handleChange} /> Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, cursor: 'pointer' }}>
                <input type="radio" name="sob_ps" value="No" checked={formData.sob_ps !== 'Yes'} onChange={handleChange} /> No
              </label>
            </div>
            <div className="fg" style={{ margin: 0, minWidth: 140 }}>
              <label>Booking Date *</label>
              <input type="date" name="sob_date" value={formData.sob_date} onChange={handleChange} />
            </div>
          </div>

          {/* Client Details */}
          <div className="sect-lbl"><i className="fa fa-user"></i> Client Details</div>
          <div className="grid3">
            <div className="fg"><label>Client Name *</label><input name="sob_cname" value={formData.sob_cname} onChange={handleChange} placeholder="Full name" /></div>
            <div className="fg"><label>Client Contact No. *</label><input name="sob_cont" value={formData.sob_cont} onChange={handleChange} type="tel" placeholder="10 digit mobile" maxLength="10" /></div>
            <div className="fg"><label>Expected Delivery Date</label><input type="date" name="sob_edd" value={formData.sob_edd} onChange={handleChange} /></div>
          </div>
          <div className="grid2">
            <div className="fg"><label>Client Address</label><input name="sob_addr" value={formData.sob_addr} onChange={handleChange} placeholder="Full address" /></div>
            <div className="fg"><label>Email ID</label><input name="sob_email" value={formData.sob_email} onChange={handleChange} type="email" placeholder="Email" /></div>
          </div>

          {/* Office Details */}
          <div className="sect-lbl"><i className="fa fa-building"></i> Office Details</div>
          <div className="grid3">
            <div className="fg"><label>Sales Executive</label>
              <select name="sob_exec" value={formData.sob_exec} onChange={handleChange}>
                <option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option><option>Admin</option>
              </select>
            </div>
            <div className="fg"><label>Source Channel</label><input name="sob_src" value={formData.sob_src} onChange={handleChange} placeholder="e.g. Referral" /></div>
            <div className="fg"><label>Partner Name</label>
              <select name="sob_partner" value={formData.sob_partner} onChange={handleChange}>
                <option value="">-- Select Partner --</option><option>Rajan Desai</option><option>Ritesh Shah</option><option>Rohan Mehta</option><option>Ronak Mehta</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Support Partner</label>
              <select name="sob_support" value={formData.sob_support} onChange={handleChange}>
                <option value="">-- Select --</option><option>Rajan Desai</option><option>Ritesh Shah</option><option>Rohan Mehta</option><option>Ronak Mehta</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Other</option>
              </select>
            </div>
            <div className="fg"><label>Broker Name</label><input name="sob_broker" value={formData.sob_broker} onChange={handleChange} placeholder="Broker name" /></div>
            <div className="fg"><label>Broker Commission</label><input name="sob_brokcomm" value={formData.sob_brokcomm} onChange={handleChange} placeholder="e.g. ₹5000 / N.A." /></div>
          </div>

          {/* Car Details */}
          <div className="sect-lbl"><i className="fa fa-car"></i> Car Details {formData.sob_stkid && <span style={{ color: '#059669', fontSize: 10, marginLeft: 8 }}>⚡ Auto-filled from Stock</span>}</div>
          <div className="grid3">
            <div className="fg"><label>Registration No. *</label><input name="sob_regn" value={formData.sob_regn} onChange={handleChange} placeholder="GJ-01-AB-1234" /></div>
            <div className="fg"><label>Make / Model</label><input name="sob_mm" value={formData.sob_mm} onChange={handleChange} placeholder="Grand i10 Magna AT" /></div>
            <div className="fg"><label>Mfg Year</label><input name="sob_year" value={formData.sob_year} onChange={handleChange} placeholder="e.g. 2017" /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Colour</label>
              <select name="sob_color" value={formData.sob_color} onChange={handleChange}><option>White</option><option>Silver</option><option>Grey</option><option>Black</option><option>Red</option><option>Blue</option><option>Brown</option><option>Other</option></select>
            </div>
            <div className="fg"><label>Fuel Type</label>
              <select name="sob_fuel" value={formData.sob_fuel} onChange={handleChange}><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option><option>Petrol+CNG</option></select>
            </div>
            <div className="fg"><label>Ownership Type</label>
              <select name="sob_own" value={formData.sob_own} onChange={handleChange}><option>1st Owner</option><option>2nd Owner</option><option>3rd Owner</option><option>4th+ Owner</option></select>
            </div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Mileage (KM)</label><input type="number" name="sob_km" value={formData.sob_km} onChange={handleChange} placeholder="31000" /></div>
            <div className="fg"><label>Insurance Type</label>
              <select name="sob_instype" value={formData.sob_instype} onChange={handleChange}><option>New</option><option>Comprehensive</option><option>Third Party</option><option>Zero Dep</option></select>
            </div>
            <div className="fg"><label>Finance (Yes/No)</label>
              <select name="sob_finance" value={formData.sob_finance} onChange={handleChange}><option>No</option><option>Yes</option></select>
            </div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Insurance Status</label>
              <div style={{ display: 'flex', gap: 16, padding: '8px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', color: 'var(--text2)' }}><input type="radio" name="sob_insstat" value="New" checked={formData.sob_insstat === 'New'} onChange={handleChange} /> New</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', color: 'var(--text2)' }}><input type="radio" name="sob_insstat" value="Continue" checked={formData.sob_insstat === 'Continue'} onChange={handleChange} /> Continue</label>
              </div>
            </div>
            <div className="fg"><label>Finance Bank</label><input name="sob_finbank" value={formData.sob_finbank} onChange={handleChange} placeholder="Bank name (if financed)" /></div>
            <div className="fg"><label>Chassis No.</label><input name="sob_chas" value={formData.sob_chas} onChange={handleChange} placeholder="17-char VIN" /></div>
          </div>

          {/* Deal + Payment Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {/* Client Deal Details */}
            <div>
              <div className="sect-lbl"><i className="fa fa-indian-rupee-sign"></i> Client Deal Details</div>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: 'var(--surface2)' }}><th style={{ padding: '8px 10px', fontSize: 10, letterSpacing: '1px', textAlign: 'left', color: 'var(--text3)', textTransform: 'uppercase' }}>Particulars</th><th style={{ padding: '8px 10px', fontSize: 10, letterSpacing: '1px', textAlign: 'right', color: 'var(--text3)', textTransform: 'uppercase' }}>Amount ₹</th></tr></thead>
                  <tbody>
                    {[
                      { label: 'Sale Price', field: 'sob_saleprice', color: 'var(--or2)', bold: true },
                      { label: 'TCS', field: 'sob_tcs' },
                      { label: 'RTO Charge', field: 'sob_rto' },
                      { label: 'Insurance Charge', field: 'sob_inschrg' },
                      { label: 'Extended Warranty', field: 'sob_warranty' },
                      { label: 'Accessories', field: 'sob_acc' },
                      { label: 'Other Charges', field: 'sob_other' },
                    ].map(r => (
                      <tr key={r.field} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '7px 10px', fontSize: 12, color: 'var(--text2)' }}>{r.label}</td>
                        <td style={{ padding: '7px 10px' }}>
                          <input type="number" name={r.field} value={formData[r.field]} onChange={handleChange} placeholder="0"
                            style={{ background: 'transparent', border: 'none', color: r.color || 'var(--text)', fontFamily: r.bold ? "'Space Grotesk',sans-serif" : 'inherit', fontSize: r.bold ? 13 : 12, fontWeight: r.bold ? 700 : 400, width: '100%', textAlign: 'right', outline: 'none' }} />
                        </td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid var(--or1)', background: 'var(--surface2)' }}>
                      <td style={{ padding: '9px 10px', fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>TOTAL AMOUNT</td>
                      <td style={{ padding: '9px 10px', fontSize: 14, fontWeight: 700, color: 'var(--or2)', fontFamily: "'Space Grotesk',sans-serif", textAlign: 'right' }}>{fmtAmt(dealTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <div className="sect-lbl"><i className="fa fa-credit-card"></i> Payment Details</div>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: 'var(--surface2)' }}>
                    <th style={{ padding: '7px 8px', fontSize: 9, letterSpacing: '.8px', textAlign: 'left', color: 'var(--text3)', textTransform: 'uppercase' }}>Particulars</th>
                    <th style={{ padding: '7px 8px', fontSize: 9, letterSpacing: '.8px', textAlign: 'center', color: 'var(--text3)', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '7px 8px', fontSize: 9, letterSpacing: '.8px', textAlign: 'right', color: 'var(--bl5)', textTransform: 'uppercase' }}>Online ₹</th>
                    <th style={{ padding: '7px 8px', fontSize: 9, letterSpacing: '.8px', textAlign: 'right', color: 'var(--or3)', textTransform: 'uppercase' }}>Cash ₹</th>
                  </tr></thead>
                  <tbody>
                    {payRows.map(r => (
                      <tr key={r.idx} style={{ borderTop: '1px solid var(--border)', background: r.highlight ? 'rgba(255,107,0,.04)' : undefined }}>
                        <td style={{ padding: '6px 8px', fontSize: 11, fontWeight: r.highlight ? 600 : 400, color: r.highlight ? 'var(--or3)' : 'var(--text2)' }}>{r.label}</td>
                        <td style={{ padding: '4px 6px' }}><input type="date" name={`sob_pd${r.idx}_date`} value={formData[`sob_pd${r.idx}_date`]} onChange={handleChange} style={{ background: 'transparent', border: 'none', color: 'var(--text2)', fontSize: 10, width: '100%', outline: 'none' }} /></td>
                        <td style={{ padding: '4px 6px' }}><input type="number" name={`sob_pd${r.idx}_onl`} value={formData[`sob_pd${r.idx}_onl`]} onChange={handleChange} placeholder="0" style={{ background: 'transparent', border: 'none', color: 'var(--bl5)', fontSize: 11, width: '100%', textAlign: 'right', outline: 'none' }} /></td>
                        <td style={{ padding: '4px 6px' }}><input type="number" name={`sob_pd${r.idx}_cash`} value={formData[`sob_pd${r.idx}_cash`]} onChange={handleChange} placeholder="0" style={{ background: 'transparent', border: 'none', color: 'var(--or3)', fontSize: 11, width: '100%', textAlign: 'right', outline: 'none' }} /></td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid var(--or1)', background: 'var(--surface2)' }}>
                      <td style={{ padding: '8px', fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>TOTAL AMT</td>
                      <td></td>
                      <td style={{ padding: '8px', fontSize: 12, fontWeight: 700, color: 'var(--bl5)', fontFamily: "'Space Grotesk',sans-serif", textAlign: 'right' }}>{fmtAmt(payOnlTotal)}</td>
                      <td style={{ padding: '8px', fontSize: 12, fontWeight: 700, color: 'var(--or2)', fontFamily: "'Space Grotesk',sans-serif", textAlign: 'right' }}>{fmtAmt(payCashTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Balance Pending */}
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>BALANCE PENDING</span>
                <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", color: balance > 0 ? 'var(--warn)' : 'var(--success)' }}>{fmtAmt(balance)}</span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="grid1"><div className="fg"><label>Remarks / Notes</label><textarea name="sob_rem" value={formData.sob_rem} onChange={handleChange} placeholder="Any additional notes…"></textarea></div></div>
        </div>
        <div className="m-foot">
          <button className="btn btn-out" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-bl" onClick={handlePrint}><i className="fa fa-print"></i> Print</button>
          <button className="btn btn-or" onClick={handleSave} disabled={saving}>
            {saving ? <><i className="car-spinner"></i> Saving…</> : <><i className="fa fa-save"></i> Save Booking</>}
          </button>
        </div>
      </div>
    </div>
  );
};
