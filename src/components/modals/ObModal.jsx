import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { today } from '../../utils/helpers';

const YEAR_OPTS = Array.from({ length: 26 }, (_, i) => 2025 - i);

function fmt(n) {
  if (!n && n !== 0) return '—';
  return '₹' + Number(n).toLocaleString('en-IN');
}

export const ObModal = ({ isOpen, onClose, onSave, onSuccess, editData, quickPclId }) => {
  const { data } = useData();

  const emptyForm = {
    ob_clid: '', ob_inqid: '', ob_date: today(),
    ob_cname: '', ob_cont: '', ob_email: '', ob_addr: '', ob_branch: 'SG Highway',
    ob_mm: '', ob_color: 'White', ob_fuel: 'Petrol',
    ob_chas: '', ob_eng: '', ob_regn: '', ob_year: '', ob_ownt: '1st Owner', ob_km: '',
    ob_instype: 'Comprehensive', ob_insname: '', ob_insval: '',
    ob_rtoname: '', ob_hpa: '', ob_val: '',
    ob_pp: '', ob_rc: '', ob_rto: '', ob_cash: '', ob_online: '', ob_oth: '',
    ob_brkname: '', ob_brkno: '', ob_src: 'Walk-in',
    ob_noc: '', ob_rem: '',
    ob_pname: '', ob_spname: '', ob_recv: '',
    ob_doc_rc: false, ob_doc_ins: false, ob_doc_puc: false, ob_doc_pan: false,
    ob_doc_adh: false, ob_doc_f29: false, ob_doc_f30: false, ob_doc_f28: false,
    ob_doc_noc: false, ob_doc_key: false, ob_doc_svc: false, ob_doc_inv: false,
    ob_doc_miss: '', ob_doc_stat: 'Pending',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [autoFillMsg, setAutoFillMsg] = useState('');

  // Auto-fill from Purchase Inquiry data
  const autoFillFromInqId = useCallback((inqId) => {
    if (!inqId || !data?.pur_inq) return;
    const inq = (data.pur_inq || []).find(r =>
      (r.inquiryId || r.inqId || r.pi_inqid || '').toLowerCase() === inqId.toLowerCase() ||
      (r.id || '').toLowerCase() === inqId.toLowerCase()
    );
    if (inq) {
      setFormData(prev => ({
        ...prev,
        ob_inqid: inqId,
        ob_cname: inq.sellerName || inq.pi_sname || prev.ob_cname,
        ob_cont: inq.mobile || inq.pi_mob || prev.ob_cont,
        ob_email: inq.email || inq.pi_email || prev.ob_email,
        ob_addr: inq.address || inq.pi_addr || prev.ob_addr,
        ob_mm: [inq.make || inq.pi_make, inq.model || inq.pi_model, inq.variant || inq.pi_var].filter(Boolean).join(' ') || prev.ob_mm,
        ob_fuel: inq.fuel || inq.pi_fuel || prev.ob_fuel,
        ob_regn: inq.regNo || inq.pi_regn || prev.ob_regn,
        ob_year: inq.year || inq.pi_year || prev.ob_year,
        ob_km: inq.km || inq.pi_km || prev.ob_km,
        ob_color: inq.color || inq.pi_color || prev.ob_color,
        ob_insval: inq.insurance || inq.pi_ins || prev.ob_insval,
        ob_rtoname: inq.sellerName || inq.pi_sname || prev.ob_rtoname,
      }));
      setAutoFillMsg(`✅ Auto-filled from Inquiry: ${inq.sellerName || inqId}`);
      setTimeout(() => setAutoFillMsg(''), 3000);
    } else {
      setAutoFillMsg('');
    }
  }, [data]);

  // Auto-fill from Purchase Closer data
  const autoFillFromPclId = useCallback((pclId) => {
    if (!pclId || !data?.pcl) return;
    const pcl = (data.pcl || []).find(r =>
      (r.closerId || r.pclId || r.pc_inqid || '').toLowerCase() === pclId.toLowerCase() ||
      (r.id || '').toLowerCase() === pclId.toLowerCase()
    );
    if (pcl) {
      setFormData(prev => ({
        ...prev,
        ob_clid: pclId,
        ob_inqid: pcl.pc_inqid || pcl.inqId || prev.ob_inqid,
        ob_cname: pcl.pc_sname || pcl.sellerName || prev.ob_cname,
        ob_mm: pcl.pc_veh || pcl.make || prev.ob_mm,
        ob_pp: pcl.pc_price || pcl.amount || prev.ob_pp,
      }));
      // Also try to fill from linked inquiry
      const linkedInqId = pcl.pc_inqid || pcl.inqId || '';
      if (linkedInqId) {
        setTimeout(() => autoFillFromInqId(linkedInqId), 100);
      }
      setAutoFillMsg(`✅ Auto-filled from Closer: ${pcl.pc_sname || pclId}`);
      setTimeout(() => setAutoFillMsg(''), 3000);
    }
  }, [data, autoFillFromInqId]);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({ ...emptyForm, ...editData });
      } else if (quickPclId) {
        autoFillFromPclId(quickPclId);
      } else {
        setFormData({ ...emptyForm, ob_date: today() });
      }
      setAutoFillMsg('');
    }
  }, [isOpen, editData, quickPclId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleInqIdBlur = () => {
    if (formData.ob_inqid) autoFillFromInqId(formData.ob_inqid);
  };

  const handlePclIdBlur = () => {
    if (formData.ob_clid) autoFillFromPclId(formData.ob_clid);
  };

  const calcTotal = () => {
    const pp = Number(formData.ob_pp) || 0;
    const rc = Number(formData.ob_rc) || 0;
    const rto = Number(formData.ob_rto) || 0;
    const oth = (Number(formData.ob_cash) || 0) + (Number(formData.ob_online) || 0) + (Number(formData.ob_oth) || 0);
    return pp + rc + rto + oth;
  };

  const handlePrint = () => {
    const total = calcTotal();
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Order Booking</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: auto; margin: 5mm; }
          @media print { 
            body { zoom: 0.85; padding: 0 !important; } 
            .section { margin-bottom: 8px !important; }
            .sign-section { margin-top: 10px !important; }
          }
          body { font-family: 'Arial', sans-serif; font-size: 11px; color: #000; background: #fff; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1A56DB; padding-bottom: 14px; }
          .header h1 { font-size: 22px; color: #1A56DB; font-weight: 800; letter-spacing: 2px; }
          .header .subtitle { font-size: 12px; color: #555; margin-top: 4px; }
          .doc-title { font-size: 16px; font-weight: 700; text-align: center; background: #1A56DB; color: #fff; padding: 8px; border-radius: 4px; margin-bottom: 16px; letter-spacing: 1px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px; color: #444; }
          .section { margin-bottom: 16px; }
          .section-title { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #1A56DB; border-bottom: 1px solid #1A56DB; padding-bottom: 4px; margin-bottom: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
          .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .field { margin-bottom: 8px; }
          .field label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #888; letter-spacing: .5px; display: block; margin-bottom: 2px; }
          .field .value { font-size: 12px; font-weight: 600; color: #111; border-bottom: 1px dotted #ccc; padding-bottom: 3px; min-height: 18px; }
          .cost-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          .cost-table th { background: #F0F4F8; padding: 7px 10px; text-align: left; font-size: 10px; letter-spacing: .5px; text-transform: uppercase; border: 1px solid #ddd; }
          .cost-table td { padding: 7px 10px; border: 1px solid #ddd; font-size: 11px; }
          .cost-total { font-weight: 800; font-size: 13px; color: #1A56DB; background: #EFF6FF; }
          .doc-checklist { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
          .doc-item { padding: 3px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 10px; font-weight: 600; }
          .doc-item.checked { background: #ECFDF5; border-color: #10B981; color: #059669; }
          .doc-item.unchecked { background: #FEF2F2; border-color: #FECACA; color: #DC2626; }
          .sign-section { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; }
          .sign-box { text-align: center; }
          .sign-line { border-top: 1px solid #000; padding-top: 5px; margin-top: 50px; font-size: 10px; color: #555; }
          .footer { margin-top: 20px; font-size: 9px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 8px; }
          .booking-id-badge { display: inline-block; background: #1A56DB; color: #fff; padding: 3px 12px; border-radius: 4px; font-weight: 700; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CARECAY</h1>
          <div class="subtitle">Carecay Private Limited — Used Car Dealership</div>
        </div>
        <div class="doc-title">PURCHASE ORDER BOOKING FORM</div>
        <div class="info-row">
          <span>Booking Date: <strong>${formData.ob_date || '—'}</strong></span>
          <span>Branch: <strong>${formData.ob_branch || '—'}</strong></span>
          <span>Booking ID: <span class="booking-id-badge">${formData.obId || formData.ob_clid || '—'}</span></span>
        </div>
        ${formData.ob_inqid ? `<div class="info-row"><span>Inquiry ID: <strong>${formData.ob_inqid}</strong></span><span>Closer ID: <strong>${formData.ob_clid || '—'}</strong></span></div>` : ''}

        <div class="section" style="margin-top:12px">
          <div class="section-title">Client Details</div>
          <div class="grid">
            <div class="field"><label>Client Name</label><div class="value">${formData.ob_cname || ''}</div></div>
            <div class="field"><label>Contact No.</label><div class="value">${formData.ob_cont || ''}</div></div>
            <div class="field"><label>Email</label><div class="value">${formData.ob_email || ''}</div></div>
          </div>
          <div class="field"><label>Address</label><div class="value">${formData.ob_addr || ''}</div></div>
        </div>

        <div class="section">
          <div class="section-title">Vehicle Details</div>
          <div class="grid">
            <div class="field"><label>Make & Model</label><div class="value">${formData.ob_mm || ''}</div></div>
            <div class="field"><label>Color</label><div class="value">${formData.ob_color || ''}</div></div>
            <div class="field"><label>Fuel Type</label><div class="value">${formData.ob_fuel || ''}</div></div>
          </div>
          <div class="grid">
            <div class="field"><label>Chassis No.</label><div class="value">${formData.ob_chas || ''}</div></div>
            <div class="field"><label>Engine No.</label><div class="value">${formData.ob_eng || ''}</div></div>
            <div class="field"><label>Reg. No.</label><div class="value">${formData.ob_regn || ''}</div></div>
          </div>
          <div class="grid">
            <div class="field"><label>Year</label><div class="value">${formData.ob_year || ''}</div></div>
            <div class="field"><label>Ownership</label><div class="value">${formData.ob_ownt || ''}</div></div>
            <div class="field"><label>KM</label><div class="value">${formData.ob_km ? Number(formData.ob_km).toLocaleString('en-IN') : ''}</div></div>
          </div>
          <div class="grid">
            <div class="field"><label>Insurance Type</label><div class="value">${formData.ob_instype || ''}</div></div>
            <div class="field"><label>Name in Insurance</label><div class="value">${formData.ob_insname || ''}</div></div>
            <div class="field"><label>Insurance Valid Till</label><div class="value">${formData.ob_insval || ''}</div></div>
          </div>
          <div class="grid">
            <div class="field"><label>Name in RTO Book</label><div class="value">${formData.ob_rtoname || ''}</div></div>
            <div class="field"><label>HPA Bank</label><div class="value">${formData.ob_hpa || ''}</div></div>
            <div class="field"><label>Valuator</label><div class="value">${formData.ob_val || ''}</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Cost Calculation</div>
          <table class="cost-table">
            <thead><tr><th>Description</th><th>Amount (INR)</th></tr></thead>
            <tbody>
              <tr><td>Purchase Price</td><td>₹ ${Number(formData.ob_pp || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>Refurbishment Cost</td><td>₹ ${Number(formData.ob_rc || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>RTO Challan</td><td>₹ ${Number(formData.ob_rto || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>Cash Payment</td><td>₹ ${Number(formData.ob_cash || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>Online Payment</td><td>₹ ${Number(formData.ob_online || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td>Other Costs</td><td>₹ ${Number(formData.ob_oth || 0).toLocaleString('en-IN')}</td></tr>
              <tr class="cost-total"><td><strong>TOTAL COST</strong></td><td><strong>₹ ${total.toLocaleString('en-IN')}</strong></td></tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Additional Info</div>
          <div class="grid">
            <div class="field"><label>Broker Name</label><div class="value">${formData.ob_brkname || ''}</div></div>
            <div class="field"><label>Broker Mobile</label><div class="value">${formData.ob_brkno || ''}</div></div>
            <div class="field"><label>Source Channel</label><div class="value">${formData.ob_src || ''}</div></div>
          </div>
          <div class="grid2">
            <div class="field"><label>Partner Name</label><div class="value">${formData.ob_pname || ''}</div></div>
            <div class="field"><label>Support Partner</label><div class="value">${formData.ob_spname || ''}</div></div>
          </div>
          <div class="grid2">
            <div class="field"><label>NOC / Outstanding</label><div class="value">${formData.ob_noc || ''}</div></div>
            <div class="field"><label>Car Received Date</label><div class="value">${formData.ob_recv || ''}</div></div>
          </div>
          ${formData.ob_rem ? `<div class="field"><label>Remarks</label><div class="value">${formData.ob_rem}</div></div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">Document Checklist</div>
          <div class="doc-checklist">
            ${[
              ['ob_doc_rc', 'RC Book'], ['ob_doc_ins', 'Insurance'], ['ob_doc_puc', 'PUC'],
              ['ob_doc_pan', 'PAN Card'], ['ob_doc_adh', 'Aadhaar'], ['ob_doc_f29', 'Form 29'],
              ['ob_doc_f30', 'Form 30'], ['ob_doc_f28', 'Form 28'], ['ob_doc_noc', 'NOC Bank'],
              ['ob_doc_key', 'Spare Key'], ['ob_doc_svc', 'Service Book'], ['ob_doc_inv', 'Invoice'],
            ].map(([k, label]) => `<div class="doc-item ${formData[k] ? 'checked' : 'unchecked'}">${formData[k] ? '✓' : '✗'} ${label}</div>`).join('')}
          </div>
          ${formData.ob_doc_miss ? `<div class="field" style="margin-top:8px"><label>Missing Documents</label><div class="value" style="color:#DC2626">${formData.ob_doc_miss}</div></div>` : ''}
          <div class="field" style="margin-top:8px"><label>Document Status</label><div class="value">${formData.ob_doc_stat || ''}</div></div>
        </div>

        <div class="sign-section">
          <div class="sign-box"><div class="sign-line">Seller Signature</div></div>
          <div class="sign-box"><div class="sign-line">Authorized Signatory</div></div>
          <div class="sign-box"><div class="sign-line">Manager / Partner</div></div>
        </div>

        <div class="footer">
          This is a computer-generated document. Carecay Private Limited — Used Car Dealership. | Booking Date: ${formData.ob_date || '—'}
        </div>
      </body>
      </html>
    `;

    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(printContent);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };

  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave({ ...formData, tcp: calcTotal() });
      } else if (onSuccess) {
        onSuccess();
        onClose();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error saving record: ', error);
      alert('Failed to save record.');
    }
  };

  const total = calcTotal();

  return (
    <div className="overlay" id="m_ob" style={{ display: 'flex' }}>
      <div className="mbox" style={{ maxWidth: 900 }}>
        <div className="m-hdr">
          <div className="m-hdr-icon"><i className="fa fa-file-pen"></i></div>
          <h3>Purchase Order Booking</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">

          {autoFillMsg && (
            <div style={{ background: 'rgba(16,185,129,.1)', border: '1px solid #10B981', borderRadius: 'var(--radius-sm)', padding: '8px 14px', fontSize: 12, color: '#10B981', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              {autoFillMsg}
            </div>
          )}

          {/* ID Row */}
          <div className="grid3">
            <div className="fg">
              <label>Closer ID <span style={{ color: 'var(--or1)', fontSize: 10 }}>⚡ Auto-Fill</span></label>
              <input id="ob_clid" name="ob_clid" value={formData.ob_clid || ''} onChange={handleChange} onBlur={handlePclIdBlur} placeholder="PCL-2026-0001" />
            </div>
            <div className="fg">
              <label>Purchase Inquiry ID <span style={{ color: 'var(--bl5)', fontSize: 10 }}>⚡ Auto-Fill All</span></label>
              <input id="ob_inqid" name="ob_inqid" value={formData.ob_inqid || ''} onChange={handleChange} onBlur={handleInqIdBlur} placeholder="INQ-2026-0001" />
            </div>
            <div className="fg">
              <label>Booking Date</label>
              <input type="date" id="ob_date" name="ob_date" value={formData.ob_date || ''} onChange={handleChange} />
            </div>
            {editData && (
              <div className="fg">
                <label style={{ color: 'var(--or1)', fontWeight: 700 }}>Fix / Edit Booking ID</label>
                <input name="obId" value={formData.obId || ''} onChange={handleChange} placeholder="OB-2026-0001" style={{ border: '1px dashed var(--or1)', background: 'var(--bg)' }} />
              </div>
            )}
          </div>

          {/* Client Details */}
          <div className="sect-lbl"><i className="fa fa-user"></i> Client Details</div>
          <div className="grid3">
            <div className="fg">
              <label>Client Name *</label>
              <input id="ob_cname" name="ob_cname" value={formData.ob_cname || ''} onChange={handleChange} placeholder="Full name" />
            </div>
            <div className="fg">
              <label>Contact No. *</label>
              <input id="ob_cont" name="ob_cont" value={formData.ob_cont || ''} onChange={handleChange} type="tel" placeholder="Mobile" />
            </div>
            <div className="fg">
              <label>Email ID</label>
              <input id="ob_email" name="ob_email" value={formData.ob_email || ''} onChange={handleChange} type="email" placeholder="Email" />
            </div>
          </div>
          <div className="grid2">
            <div className="fg">
              <label>Client Address</label>
              <input id="ob_addr" name="ob_addr" value={formData.ob_addr || ''} onChange={handleChange} placeholder="Address" />
            </div>
            <div className="fg">
              <label>Branch</label>
              <select id="ob_branch" name="ob_branch" value={formData.ob_branch || ''} onChange={handleChange}>
                <option>SG Highway</option><option>Vastral</option><option>Head Office</option>
              </select>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="sect-lbl"><i className="fa fa-car"></i> Vehicle Details</div>
          <div className="grid3">
            <div className="fg">
              <label>Make & Model</label>
              <input id="ob_mm" name="ob_mm" value={formData.ob_mm || ''} onChange={handleChange} placeholder="Maruti Swift VXI" />
            </div>
            <div className="fg">
              <label>Color</label>
              <select id="ob_color" name="ob_color" value={formData.ob_color || ''} onChange={handleChange}>
                <option>White</option><option>Silver</option><option>Grey</option><option>Black</option><option>Red</option><option>Blue</option><option>Brown</option><option>Orange</option><option>Yellow</option><option>Green</option><option>Other</option>
              </select>
            </div>
            <div className="fg">
              <label>Fuel Type</label>
              <select id="ob_fuel" name="ob_fuel" value={formData.ob_fuel || ''} onChange={handleChange}>
                <option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option><option>Hybrid</option><option>Petrol+CNG</option>
              </select>
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Chassis No.</label>
              <input id="ob_chas" name="ob_chas" value={formData.ob_chas || ''} onChange={handleChange} placeholder="17-char VIN" />
            </div>
            <div className="fg">
              <label>Engine No.</label>
              <input id="ob_eng" name="ob_eng" value={formData.ob_eng || ''} onChange={handleChange} placeholder="Engine number" />
            </div>
            <div className="fg">
              <label>Registration No.</label>
              <input id="ob_regn" name="ob_regn" value={formData.ob_regn || ''} onChange={handleChange} placeholder="GJ-01-AB-1234" style={{ textTransform: 'uppercase' }} />
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Mfg Year</label>
              <select id="ob_year" name="ob_year" value={formData.ob_year || ''} onChange={handleChange}>
                <option value="">Year</option>
                {YEAR_OPTS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Ownership Type</label>
              <select id="ob_ownt" name="ob_ownt" value={formData.ob_ownt || ''} onChange={handleChange}>
                <option>1st Owner</option><option>2nd Owner</option><option>3rd Owner</option><option>4th+ Owner</option>
              </select>
            </div>
            <div className="fg">
              <label>Mileage (KM)</label>
              <input id="ob_km" name="ob_km" value={formData.ob_km || ''} onChange={handleChange} type="number" placeholder="KM" />
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Insurance Type</label>
              <select id="ob_instype" name="ob_instype" value={formData.ob_instype || ''} onChange={handleChange}>
                <option>Comprehensive</option><option>Third Party</option><option>Zero Dep</option>
              </select>
            </div>
            <div className="fg">
              <label>Name in Insurance</label>
              <input id="ob_insname" name="ob_insname" value={formData.ob_insname || ''} onChange={handleChange} placeholder="Owner name" />
            </div>
            <div className="fg">
              <label>Insurance Validity</label>
              <input type="date" id="ob_insval" name="ob_insval" value={formData.ob_insval || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Name in RTO Book</label>
              <input id="ob_rtoname" name="ob_rtoname" value={formData.ob_rtoname || ''} onChange={handleChange} placeholder="RC owner name" />
            </div>
            <div className="fg">
              <label>HPA Bank Name</label>
              <input id="ob_hpa" name="ob_hpa" value={formData.ob_hpa || ''} onChange={handleChange} placeholder="Financer" />
            </div>
            <div className="fg">
              <label>Valuator Name</label>
              <select id="ob_val" name="ob_val" value={formData.ob_val || ''} onChange={handleChange}>
                <option value="">-- Select Valuator --</option>
                <option>Rizwan Sandhi</option><option>Spinny</option><option>Car24</option><option>Other</option>
              </select>
            </div>
          </div>

          {/* Cost Calculation */}
          <div className="sect-lbl"><i className="fa fa-calculator"></i> Cost Calculation (Auto)</div>
          <div className="grid3">
            <div className="fg">
              <label>Purchase Price</label>
              <input type="number" id="ob_pp" name="ob_pp" value={formData.ob_pp || ''} onChange={handleChange} placeholder="0" />
            </div>
            <div className="fg">
              <label>Refurbishment Cost</label>
              <input type="number" id="ob_rc" name="ob_rc" value={formData.ob_rc || ''} onChange={handleChange} placeholder="0" />
            </div>
            <div className="fg">
              <label>RTO Challan Amount</label>
              <input type="number" id="ob_rto" name="ob_rto" value={formData.ob_rto || ''} onChange={handleChange} placeholder="0" />
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Cash</label>
              <input type="number" id="ob_cash" name="ob_cash" value={formData.ob_cash || ''} onChange={handleChange} placeholder="0" />
            </div>
            <div className="fg">
              <label>Online</label>
              <input type="number" id="ob_online" name="ob_online" value={formData.ob_online || ''} onChange={handleChange} placeholder="0" />
            </div>
            <div className="fg">
              <label>Other Costs</label>
              <input type="number" id="ob_oth" name="ob_oth" value={formData.ob_oth || ''} onChange={handleChange} placeholder="0" />
            </div>
          </div>
          <div className="calc-panel">
            <div className="calc-row"><span className="cl">Purchase Price</span><span>{fmt(formData.ob_pp)}</span></div>
            <div className="calc-row"><span className="cl">Refurbishment</span><span>{fmt(formData.ob_rc)}</span></div>
            <div className="calc-row"><span className="cl">RTO Challan</span><span>{fmt(formData.ob_rto)}</span></div>
            <div className="calc-row"><span className="cl">Cash + Online + Other</span><span>{fmt((Number(formData.ob_cash)||0)+(Number(formData.ob_online)||0)+(Number(formData.ob_oth)||0))}</span></div>
            <div className="calc-row"><span>TOTAL COST (TCP)</span><span style={{ color: 'var(--or1)', fontSize: 16 }}>{fmt(total)}</span></div>
          </div>

          {/* Broker & Source */}
          <div className="grid3" style={{ marginTop: 14 }}>
            <div className="fg">
              <label>Broker Name</label>
              <input id="ob_brkname" name="ob_brkname" value={formData.ob_brkname || ''} onChange={handleChange} placeholder="Broker" />
            </div>
            <div className="fg">
              <label>Broker Mobile</label>
              <input id="ob_brkno" name="ob_brkno" value={formData.ob_brkno || ''} onChange={handleChange} type="tel" placeholder="Mobile" />
            </div>
            <div className="fg">
              <label>Source Channel</label>
              <select id="ob_src" name="ob_src" value={formData.ob_src || ''} onChange={handleChange}>
                <option>OLX</option><option>CarDekho</option><option>Walk-in</option><option>Reference</option><option>Social Media</option><option>Call</option>
              </select>
            </div>
          </div>
          <div className="grid2">
            <div className="fg">
              <label>NOC / Outstanding Amount</label>
              <input id="ob_noc" name="ob_noc" value={formData.ob_noc || ''} onChange={handleChange} placeholder="NOC details" />
            </div>
            <div className="fg">
              <label>Remark</label>
              <input id="ob_rem" name="ob_rem" value={formData.ob_rem || ''} onChange={handleChange} placeholder="Notes" />
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Partner Name</label>
              <select id="ob_pname" name="ob_pname" value={formData.ob_pname || ''} onChange={handleChange}>
                <option value="">-- Select Partner --</option>
                <option>Rajan Desai</option><option>Ritesh Shah</option><option>Rohan Mehta</option><option>Ronak Mehta</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Other</option>
              </select>
            </div>
            <div className="fg">
              <label>Support Partner</label>
              <select id="ob_spname" name="ob_spname" value={formData.ob_spname || ''} onChange={handleChange}>
                <option value="">-- Select Support Partner --</option>
                <option>Rajan Desai</option><option>Ritesh Shah</option><option>Rohan Mehta</option><option>Ronak Mehta</option><option>Kalpesh Joshi</option><option>Marut Dandawala</option><option>Other</option>
              </select>
            </div>
            <div className="fg">
              <label>Car Received Date</label>
              <input type="date" id="ob_recv" name="ob_recv" value={formData.ob_recv || ''} onChange={handleChange} />
            </div>
          </div>

          {/* Document Checklist */}
          <div className="sect-lbl" style={{ marginTop: 10 }}>
            <i className="fa fa-file-contract"></i> Document Checklist
            <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 400, marginLeft: 6 }}>(Tick available documents)</span>
          </div>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10 }}>
            {[
              ['ob_doc_rc', 'RC Book'], ['ob_doc_ins', 'Insurance'], ['ob_doc_puc', 'PUC'],
              ['ob_doc_pan', 'PAN Card'], ['ob_doc_adh', 'Aadhaar'], ['ob_doc_f29', 'Form 29'],
              ['ob_doc_f30', 'Form 30'], ['ob_doc_f28', 'Form 28'], ['ob_doc_noc', 'NOC Bank'],
              ['ob_doc_key', 'Spare Key'], ['ob_doc_svc', 'Service Book'], ['ob_doc_inv', 'Invoice'],
            ].map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, cursor: 'pointer', color: 'var(--text2)' }}>
                <input type="checkbox" name={key} checked={!!formData[key]} onChange={handleChange} style={{ accentColor: 'var(--or1)', width: 15, height: 15 }} />
                {label}
              </label>
            ))}
          </div>
          <div className="grid2" style={{ marginTop: 10 }}>
            <div className="fg">
              <label>Missing Documents <span style={{ color: 'var(--danger)', fontSize: 10 }}>(list missing ones)</span></label>
              <input id="ob_doc_miss" name="ob_doc_miss" value={formData.ob_doc_miss || ''} onChange={handleChange} placeholder="e.g. NOC, Form 29..." />
            </div>
            <div className="fg">
              <label>Document Status</label>
              <select id="ob_doc_stat" name="ob_doc_stat" value={formData.ob_doc_stat || ''} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
          </div>
        </div>

        <div className="m-foot">
          <button className="btn btn-out" onClick={onClose}>Cancel</button>
          <button className="btn btn-bl" onClick={handlePrint} type="button">
            <i className="fa fa-print"></i> Print
          </button>
          <button className="btn btn-or" onClick={handleSave}>
            <i className="fa fa-save"></i> Save Booking
          </button>
        </div>
      </div>
    </div>
  );
};
