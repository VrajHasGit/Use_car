import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { today, printDocument } from '../../utils/helpers';

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
    ob_exname: '', ob_val: '',
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
    const pfu = (data.pfu || []).find(r =>
      (r.pf_inqid || r.inqId || r.inquiryId || '').toLowerCase() === inqId.toLowerCase()
    );
    const pfuPrice = pfu ? (pfu.pf_close || pfu.pf_nego || pfu.pf_offer || '') : '';
    const valRec = (data.val || []).find(r => 
      (r.v_inqid || '').toLowerCase() === inqId.toLowerCase() ||
      (inq && r.v_vnum && r.v_vnum.toLowerCase() === inq.regNo?.toLowerCase())
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
        ob_exname: inq.assigned || prev.ob_exname,
        ob_pname: inq.nameSource || prev.ob_pname,
        ob_val: valRec ? valRec.v_valname : prev.ob_val,
        ob_pp: pfuPrice || prev.ob_pp,
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
        if (editData.ob_inqid || editData.inqId) {
          setTimeout(() => autoFillFromInqId(editData.ob_inqid || editData.inqId), 100);
        }
      } else if (quickPclId) {
        autoFillFromPclId(quickPclId);
      } else {
        setFormData({ ...emptyForm, ob_date: today() });
      }
      setAutoFillMsg('');
    }
  }, [isOpen, editData, quickPclId, autoFillFromInqId]);

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
    const rto = Number(formData.ob_rto) || 0;
    return pp + rto;
  };

  const handlePrintOrderBooking = () => {
    const total = calcTotal();
    
    const customStyles = `
      .pf-wrap { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #111; font-size: 11px; line-height: 1.4; }
      .pf-header { text-align: center; border-bottom: 2px solid #1a2542; padding-bottom: 10px; margin-bottom: 15px; }
      .pf-title { font-size: 22px; font-weight: 800; color: #1a2542; letter-spacing: 1px; margin: 0; }
      .pf-subtitle { font-size: 12px; font-weight: 600; color: #555; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px; }
      .pf-meta { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 11px; border-bottom: 1px solid #eaeaea; padding-bottom: 8px; }
      .pf-meta-item { display: flex; flex-direction: column; }
      .pf-meta-lbl { font-weight: 600; color: #666; text-transform: uppercase; font-size: 9px; }
      .pf-meta-val { font-weight: bold; font-size: 13px; }
      .pf-section { margin-bottom: 15px; }
      .pf-section-title { font-size: 12px; font-weight: bold; color: #1a2542; text-transform: uppercase; border-bottom: 1px solid #1a2542; padding-bottom: 4px; margin-bottom: 10px; }
      .pf-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 15px; }
      .pf-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 15px; }
      .pf-field { display: flex; flex-direction: column; }
      .pf-lbl { font-size: 9px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
      .pf-val { font-size: 12px; font-weight: 500; border-bottom: 1px dashed #ccc; padding-bottom: 2px; min-height: 17px; }
      .pf-totals { background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 10px; }
      .pf-totals-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; }
      .pf-totals-row.grand { font-size: 14px; font-weight: bold; color: #1a2542; border-top: 2px solid #e2e8f0; padding-top: 6px; margin-top: 6px; }
      .pf-signs { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 15px; border-top: 1px solid #eaeaea; }
      .pf-sign-box { text-align: center; width: 40%; }
      .pf-sign-line { border-bottom: 1px solid #000; height: 30px; margin-bottom: 6px; }
      .pf-sign-lbl { font-weight: bold; font-size: 10px; text-transform: uppercase; }
      @media print {
        @page { size: A4; margin: 12mm; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .pf-totals { background: #f8fafc !important; }
      }
    `;

    const htmlContent = `
      <div class="pf-wrap">
        <div class="pf-header">
          <h1 class="pf-title">CARECAY PRIVATE LIMITED</h1>
          <div class="pf-subtitle">USED CAR PURCHASE BOOKING FORM</div>
        </div>

        <div class="pf-meta">
          <div class="pf-meta-item">
            <span class="pf-meta-lbl">Document No.</span>
            <span class="pf-meta-val">${formData.obId || 'DRAFT'}</span>
          </div>
          <div class="pf-meta-item">
            <span class="pf-meta-lbl">Date</span>
            <span class="pf-meta-val">${formData.ob_date || ''}</span>
          </div>
          <div class="pf-meta-item">
            <span class="pf-meta-lbl">Branch</span>
            <span class="pf-meta-val">${formData.ob_branch || 'SG Highway'}</span>
          </div>
        </div>

        <div class="pf-section">
          <div class="pf-section-title">Client Details</div>
          <div class="pf-grid-3">
            <div class="pf-field" style="grid-column: span 2;">
              <span class="pf-lbl">Client Name</span>
              <span class="pf-val">${formData.ob_cname || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Contact No.</span>
              <span class="pf-val">${formData.ob_cont || ''}</span>
            </div>
            <div class="pf-field" style="grid-column: span 3;">
              <span class="pf-lbl">Client Address</span>
              <span class="pf-val">${formData.ob_addr || ''}</span>
            </div>
          </div>
        </div>

        <div class="pf-section">
          <div class="pf-section-title">Car Details</div>
          <div class="pf-grid">
            <div class="pf-field">
              <span class="pf-lbl">Model & Maker's Name</span>
              <span class="pf-val">${formData.ob_mm || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Registration No.</span>
              <span class="pf-val">${formData.ob_regn || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Color</span>
              <span class="pf-val">${formData.ob_color || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Manufacturing Year</span>
              <span class="pf-val">${formData.ob_year || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Fuel Type</span>
              <span class="pf-val">${formData.ob_fuel || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Ownership Type</span>
              <span class="pf-val">${formData.ob_ownt || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Chassis No.</span>
              <span class="pf-val">${formData.ob_chas || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Engine No.</span>
              <span class="pf-val">${formData.ob_eng || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Mileage (KM)</span>
              <span class="pf-val">${formData.ob_km || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Partner Name</span>
              <span class="pf-val">${formData.ob_pname || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Insurance Company</span>
              <span class="pf-val">${formData.ob_insname || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Insurance Type & Validity</span>
              <span class="pf-val">${formData.ob_instype || ''} ${formData.ob_insval ? '— Valid till ' + formData.ob_insval : ''}</span>
            </div>
          </div>
        </div>

        <div class="pf-section">
          <div class="pf-section-title">Inspection and Evaluation</div>
          <div class="pf-grid">
            <div class="pf-field">
              <span class="pf-lbl">Valuator Name</span>
              <span class="pf-val">${formData.ob_val || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Car Received Date</span>
              <span class="pf-val">${formData.ob_recv || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Executive Name</span>
              <span class="pf-val">${formData.ob_exname || ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">NOC Required</span>
              <span class="pf-val">NO</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Broker Name & No.</span>
              <span class="pf-val">${formData.ob_brkname || 'NA'} ${formData.ob_brkno ? '— ' + formData.ob_brkno : ''}</span>
            </div>
            <div class="pf-field">
              <span class="pf-lbl">Support Partner</span>
              <span class="pf-val">${formData.ob_spname || 'NA'}</span>
            </div>
          </div>
        </div>

        <div class="pf-section">
          <div class="pf-section-title">Deal Summary</div>
          <div class="pf-totals">
            <div class="pf-totals-row">
              <span>Purchase Price</span>
              <span>₹${Number(formData.ob_pp || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="pf-totals-row">
              <span>RTO Challan Amount (Additional)</span>
              <span>₹${Number(formData.ob_rto || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="pf-totals-row grand">
              <span>GRAND TOTAL</span>
              <span>₹${Number(total || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div class="pf-section">
          <div class="pf-section-title">Remarks</div>
          <div class="pf-val" style="min-height: 40px; border-bottom: none;">${formData.ob_rem || ''}</div>
        </div>

        <div class="pf-signs">
          <div class="pf-sign-box">
            <div class="pf-sign-line"></div>
            <div class="pf-sign-lbl">Purchase Partner Signature</div>
          </div>
          <div class="pf-sign-box">
            <div class="pf-sign-line"></div>
            <div class="pf-sign-lbl">Purchase HOD Signature</div>
          </div>
        </div>
      </div>
    `;

    const title = formData.obId || formData.ob_clid || formData.ob_inqid || 'OB-Draft';
    printDocument(title, htmlContent, customStyles);
  };

  const handlePrintDeliveryNote = () => {
    const customStyles = `
      .dn-wrap { font-family: 'Arial', sans-serif; max-width: 800px; margin: 0 auto; color: #000; font-size: 11px; }
      .dn-head { text-align: center; margin-bottom: 8px; position: relative; display: flex; align-items: center; justify-content: center; min-height: 55px; }
      .dn-logo { position: absolute; left: 0; top: 0; height: 55px; object-fit: contain; }
      .dn-head-title { background: #333; color: #fff; padding: 4px 20px; border-radius: 30px; display: inline-block; font-size: 14px; font-weight: bold; }
      .dn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
      .dn-box { border: 2px solid #333; border-radius: 4px; position: relative; padding-top: 10px; }
      .dn-box-title { background: #333; color: #fff; text-align: center; font-weight: bold; padding: 2px 10px; border-radius: 20px; position: absolute; top: -12px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 11px; }
      .dn-field { display: flex; border-top: 2px solid #333; }
      .dn-lbl { padding: 3px 6px; font-weight: bold; white-space: nowrap; font-size: 10px; }
      .dn-val { padding: 3px 6px; flex-grow: 1; font-weight: bold; font-size: 10px; }
      .dn-box-content { padding: 8px 8px 4px 8px; min-height: 40px; text-align:center; font-weight:bold; font-size: 12px; line-height: 1.3; }
      .dn-text { line-height: 1.4; text-align: justify; margin-bottom: 10px; font-size: 12px; }
      .dn-text u { border-bottom: 1px dotted #000; text-decoration: none; font-weight: bold; padding: 0 10px; display:inline-block; min-width: 50px; text-align:center; }
      .dn-terms { margin-top: 5px; }
      .dn-terms ul { padding-left: 20px; margin-top: 3px; line-height: 1.3; font-size: 11px; }
      .dn-terms li { margin-bottom: 3px; text-align: justify; }
      .dn-signs { display: flex; justify-content: space-between; margin-top: 30px; }
      .dn-sign-block { width: 45%; font-size: 11px; }
      .dn-sign-line { border-bottom: 1px dotted #000; display: inline-block; width: 60%; margin-left: 10px; }
      @media print {
        @page { size: A4; margin: 8mm; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0 !important; }
        .dn-head-title, .dn-box-title { background: #333 !important; color: #fff !important; }
      }
    `;

    const htmlContent = `
      <div class="dn-wrap">
        <div class="dn-head">
          <img src="/logo.png" class="dn-logo" alt="Carecay Logo" />
          <div class="dn-head-title">વેચાણ ખત અને ડીલીવરી નોટ</div>
        </div>
        
        <div class="dn-grid">
          <div style="border: 2px solid #333; display: flex;">
            <div class="dn-lbl">ગાડી નંબર:</div>
            <div class="dn-val">${formData.ob_regn || ''}</div>
          </div>
          <div style="border: 2px solid #333; display: flex;">
            <div class="dn-lbl">તારીખ :</div>
            <div class="dn-val">${formData.ob_date || ''}</div>
            <div class="dn-lbl" style="border-left: 2px solid #333">વાર:</div>
            <div class="dn-val"></div>
          </div>
        </div>

        <div class="dn-grid">
          <div class="dn-box">
            <div class="dn-box-title">વાહન વેચાણ આપનાર</div>
            <div class="dn-box-content" style="text-align:left; font-size:14px">
              ${formData.ob_cname || ''}<br/>
              ${formData.ob_addr || ''}
            </div>
            <div class="dn-field">
              <div class="dn-lbl">મો. નંબર :</div>
              <div class="dn-val" style="border-left: 2px solid #333">${formData.ob_cont || ''}</div>
            </div>
          </div>

          <div class="dn-box">
            <div class="dn-box-title">વાહન ખરીદ લેનાર</div>
            <div class="dn-box-content">
              CARECAY PVT. LTD<br/>
              Mumatpura Road, Off. S. G. Highway,<br/>
              Nr. Cafe De Italiano,<br/>
              Ahmedabad-(380058)
            </div>
            <div class="dn-field">
              <div class="dn-lbl">મો. નંબર :</div>
              <div class="dn-val" style="border-left: 2px solid #333">94 84 88 22 22</div>
            </div>
          </div>
        </div>

        <div class="dn-text">
          અમોએ અમારી માલિકી અને હક્ક ભોગવટાનું વાહન જેનો આર.ટી.ઓ. રજીસ્ટ્રેશન નંબર <u>${formData.ob_regn || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</u> છે 
          અને તેનું મોડલ <u>${formData.ob_mm || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</u> ગાડીનો પ્રકાર <u>${formData.ob_fuel || '&nbsp;&nbsp;&nbsp;&nbsp;'}</u> એન્જિન નં <u>${formData.ob_eng || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</u> 
          તથા ચેસીસ નં <u>${formData.ob_chas || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</u> છે. 
          તે વાહન આજરોજ રૂા. <u>${formData.ob_pp || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</u> દલાલી રૂા. <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> 
          ટેક્સ રૂા. <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> તથા ટ્રાન્સફરનો/ડયુના રૂા <u>${formData.ob_rto || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</u> મળી ટોટલ રૂા <u>${calcTotal() || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</u> 
          અંકે રૂા <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> માં ઉપર જણાવેલ પાર્ટીને વેચાણ 
          આપેલ છે. તેના બાના પેટે રૂા. <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> અંકે રૂા. <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>
          રોકડા/ચેક મળેલ છે બાકી નીકળતા રૂા <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> મોડામાં મોડા 
          તા <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> સુધીમાં ચૂકતે હિસાબે કરવાના રહેશે. 
          ગાડીના ખરીદ-વેચાણ પેટે નીચે લખેલ શરતો અ મને બંને પાર્ટીએ વાંચેલ છે. અને બંધન કર્તા રહેશે તે જાણીને અમે સહી કરેલ છે.
        </div>

        <div class="dn-head" style="margin-top: 30px;">
          <div class="dn-head-title" style="padding:4px 20px; font-size:16px;">શરતો - નિયમો</div>
        </div>
        <div class="dn-terms">
          <ul>
            <li>સદર સોદો અમો બંને પાર્ટીએ રાજીખુશીથી સમજી વિચારી અક્કલ, હોશિયારીથી, બીનકેફીપણામાંથી કોઈનના ધાક ધમકી કે દબાણ વગર કર્યો છે.</li>
            <li>સદર વાહનનો આજરોજ પહેલાનું કોઈ પણ પ્રકારનું આર.ટી.ઓ. ટેક્સ મેમો કે કોઇપણ પ્રકારનો બેન્ક કે પેઢીનું દેવું નીકળશે કે કોઈપણ પ્રકારનો પોલીસ કેસ કે સંબંધિત તમામ જવાબદારી તા. ........................................ સુધી તથા તમામ જવાબદારી વાહન વેચનારની રહેશે અને ત્યારબાદ તા........................................ થી તમામ જવાબદારી ખરીદનાની રહેશે.</li>
            <li>સદર વાહન અમોએ અમારી રીતે જોઈ, તપાસી અમારા ફોરમેન, ડ્રાઈવર, દલાલ વિગેરેને બરાબર ચારે તરફથી બતાવી રોડ ટેસ્ટ લઈ ચકાસણી કરી ખરીદ કરેલ છે. તેથી પાછળથી કોઈ પણ પ્રકારની ફરિયાદ સાંભળવામાં આવશે નહીં.</li>
            <li>સરદાર વાહનનો સોદો કોઈપણ સંજોગોમાં કેન્સલ થશે નહીં અને જો સોદો કેન્સલ થશે તો બાનાની આપેલી રકમ પરત મળશે નહીં તેવું બરાબર જાણીએ છીએ.</li>
            <li>સદર વાહનો કબજો આજ રોજ એટલે કે તા........................................ અને સમય........................................થી લેનાર પાર્ટીએ લીધેલ છે. જેથી અત્યાર પછી આ વાહન ચોરી, આગ, અકસ્માત કે ગુનાહિત કાર્યમાં ફરશે તો તેની જવાબદારી ખરીદ લેનાર પાર્ટીની રહેશે . ખોટો ખરીદ લેખ કરવો કે વેચાણ લેખ કરવો તે ગુનો છે. તમારી અમારી ધ્યાનમાં છે અને તે સમજી વિચારી અને નીચે સહી કરેલ છે. ગાડીનો ઇન્સ્યોરન્સ ટ્રાન્સફરની અથવા નવો લેવાની તમામ જવાબદારી ખરીદનાર પાર્ટીની રહેશે. તથા ગાડીના ટ્રાન્સફર માટેનો થતો ટેક્સ ખરીદનાર પાર્ટીએ અલગથી આપવાનો રહેશે.</li>
            <li>ગાડીના કિલોમીટરની કોઈ પણ જવાબદારી આપવામાં આવતી નથી કાયદાકીય ક્ષેત્ર અમદાવાદ/........................................ રહેશે.</li>
          </ul>
        </div>

        <div class="dn-signs">
          <div class="dn-sign-block">
            <div style="margin-bottom: 30px;">વાહન વેચનારની સહી <span class="dn-sign-line"></span></div>
            <div>સાક્ષીની સહી <span class="dn-sign-line"></span></div>
          </div>
          <div class="dn-sign-block">
            <div style="margin-bottom: 30px;">વાહન લેનારની સહી <span class="dn-sign-line"></span></div>
            <div>સાક્ષીની સહી <span class="dn-sign-line"></span></div>
          </div>
        </div>

      </div>
    `;

    const title = 'DN-' + (formData.obId || formData.ob_clid || formData.ob_inqid || 'Draft');
    printDocument(title, htmlContent, customStyles, null, true);
  };

  const handlePrintDeliveryNoteEnglish = () => {
    const customStyles = `
      .dn-wrap { font-family: 'Arial', sans-serif; max-width: 800px; margin: 0 auto; color: #000; font-size: 11px; }
      .dn-head { text-align: center; margin-bottom: 8px; position: relative; display: flex; align-items: center; justify-content: center; min-height: 55px; }
      .dn-logo { position: absolute; left: 0; top: 0; height: 55px; object-fit: contain; }
      .dn-head-title { background: #333; color: #fff; padding: 4px 20px; border-radius: 30px; display: inline-block; font-size: 14px; font-weight: bold; }
      .dn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
      .dn-box { border: 2px solid #333; border-radius: 4px; position: relative; padding-top: 10px; }
      .dn-box-title { background: #333; color: #fff; text-align: center; font-weight: bold; padding: 2px 10px; border-radius: 20px; position: absolute; top: -12px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 11px; }
      .dn-field { display: flex; border-top: 2px solid #333; }
      .dn-lbl { padding: 3px 6px; font-weight: bold; white-space: nowrap; font-size: 10px; }
      .dn-val { padding: 3px 6px; flex-grow: 1; font-weight: bold; font-size: 10px; }
      .dn-box-content { padding: 8px 8px 4px 8px; min-height: 40px; text-align:center; font-weight:bold; font-size: 12px; line-height: 1.3; }
      .dn-text { line-height: 1.4; text-align: justify; margin-bottom: 10px; font-size: 12px; }
      .dn-text u { border-bottom: 1px dotted #000; text-decoration: none; font-weight: bold; padding: 0 10px; display:inline-block; min-width: 50px; text-align:center; }
      .dn-terms { margin-top: 5px; }
      .dn-terms ul { padding-left: 20px; margin-top: 3px; line-height: 1.3; font-size: 11px; }
      .dn-terms li { margin-bottom: 3px; text-align: justify; }
      .dn-signs { display: flex; justify-content: space-between; margin-top: 30px; }
      .dn-sign-block { width: 45%; font-size: 11px; }
      .dn-sign-line { border-bottom: 1px dotted #000; display: inline-block; width: 60%; margin-left: 10px; }
      @media print {
        @page { size: A4; margin: 8mm; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0 !important; }
        .dn-head-title, .dn-box-title { background: #333 !important; color: #fff !important; }
      }
    `;

    const htmlContent = `
      <div class="dn-wrap">
        <div class="dn-head">
          <img src="/logo.png" class="dn-logo" alt="Carecay Logo" />
          <div class="dn-head-title">SALE DEED AND DELIVERY NOTE</div>
        </div>
        
        <div class="dn-grid">
          <div style="border: 2px solid #333; display: flex;">
            <div class="dn-lbl">Vehicle No:</div>
            <div class="dn-val">${formData.ob_regn || ''}</div>
          </div>
          <div style="border: 2px solid #333; display: flex;">
            <div class="dn-lbl">Date :</div>
            <div class="dn-val">${formData.ob_date || ''}</div>
            <div class="dn-lbl" style="border-left: 2px solid #333">Day:</div>
            <div class="dn-val"></div>
          </div>
        </div>

        <div class="dn-grid">
          <div class="dn-box">
            <div class="dn-box-title">Vehicle Seller</div>
            <div class="dn-box-content" style="text-align:left; font-size:14px">
              ${formData.ob_cname || ''}<br/>
              ${formData.ob_addr || ''}
            </div>
            <div class="dn-field">
              <div class="dn-lbl">Mobile No :</div>
              <div class="dn-val" style="border-left: 2px solid #333">${formData.ob_cont || ''}</div>
            </div>
          </div>

          <div class="dn-box">
            <div class="dn-box-title">Vehicle Buyer</div>
            <div class="dn-box-content">
              CARECAY PVT. LTD<br/>
              Mumatpura Road, Off. S. G. Highway,<br/>
              Nr. Cafe De Italiano,<br/>
              Ahmedabad-(380058)
            </div>
            <div class="dn-field">
              <div class="dn-lbl">Mobile No :</div>
              <div class="dn-val" style="border-left: 2px solid #333">94 84 88 22 22</div>
            </div>
          </div>
        </div>

        <div class="dn-text">
          We have sold our fully owned vehicle with RTO Registration No <u>${formData.ob_regn || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</u> 
          and Model <u>${formData.ob_mm || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</u>, Fuel Type <u>${formData.ob_fuel || '&nbsp;&nbsp;&nbsp;&nbsp;'}</u>, Engine No <u>${formData.ob_eng || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</u> 
          and Chassis No <u>${formData.ob_chas || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</u>. 
          The vehicle is sold today for Rs. <u>${formData.ob_pp || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</u>, Brokerage Rs. <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>, 
          Tax Rs. <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> and Transfer dues Rs. <u>${formData.ob_rto || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</u> making a total of Rs. <u>${calcTotal() || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</u> 
          (in words Rs. <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>) to the above mentioned party. 
          As token amount Rs. <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> (in words Rs. <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>) 
          has been received in Cash/Cheque. The pending balance of Rs. <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> will be paid and cleared 
          by Date <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> at the latest. 
          Both parties have read and agreed to the terms and conditions written below for the purchase/sale of the car and have signed with full understanding.
        </div>

        <div class="dn-head" style="margin-top: 30px;">
          <div class="dn-head-title" style="padding:4px 20px; font-size:16px;">Terms and Conditions</div>
        </div>
        <div class="dn-terms">
          <ul>
            <li>This deal has been made by both parties willfully, with full understanding, in sound mind, without intoxication, and without any fear, threat, or pressure from anyone.</li>
            <li>Any R.T.O. tax memo, bank or financial institution loan/dues, or police case related to this vehicle prior to today will remain the total responsibility of the Seller until Date ........................................ and after Date ........................................ the entire responsibility will lie with the Buyer.</li>
            <li>We have personally checked, inspected the said vehicle from all sides through our foreman, driver, broker, etc., taken a road test, verified it, and then purchased it. Therefore, no future complaints will be entertained.</li>
            <li>We clearly understand that the deal for this vehicle will not be canceled under any circumstances, and if canceled, the token amount paid will not be refunded.</li>
            <li>The possession of the said vehicle has been taken over by the purchasing party today on Date ........................................ at Time ........................................ Therefore, if this vehicle is involved in any theft, fire, accident, or criminal activity hereafter, the purchasing party will be responsible. Creating a false purchase or sale deed is a crime. This is in our and your knowledge, and we have signed below with full understanding. The entire responsibility of transferring or getting new insurance for the car will lie with the purchasing party. The purchasing party must separately pay the tax applicable for the car transfer.</li>
            <li>No guarantee is provided regarding the kilometers of the car. The legal jurisdiction will be Ahmedabad/.........................................</li>
          </ul>
        </div>

        <div class="dn-signs">
          <div class="dn-sign-block">
            <div style="margin-bottom: 30px;">Vehicle Seller's Signature <span class="dn-sign-line"></span></div>
            <div>Witness Signature <span class="dn-sign-line"></span></div>
          </div>
          <div class="dn-sign-block">
            <div style="margin-bottom: 30px;">Vehicle Buyer's Signature <span class="dn-sign-line"></span></div>
            <div>Witness Signature <span class="dn-sign-line"></span></div>
          </div>
        </div>

      </div>
    `;

    const title = 'DN-ENG-' + (formData.obId || formData.ob_clid || formData.ob_inqid || 'Draft');
    printDocument(title, htmlContent, customStyles, null, true);
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
              <input id="ob_clid" name="ob_clid" value={formData.ob_clid || ''} onChange={handleChange} onBlur={handlePclIdBlur} placeholder="PCL-2026-0001" disabled={!!editData || !!quickPclId} />
            </div>
            <div className="fg">
              <label>Purchase Inquiry ID <span style={{ color: 'var(--bl5)', fontSize: 10 }}>⚡ Auto-Fill All</span></label>
              <input id="ob_inqid" name="ob_inqid" value={formData.ob_inqid || ''} onChange={handleChange} onBlur={handleInqIdBlur} placeholder="INQ-2026-0001" disabled={!!editData || !!quickPclId || !!formData.ob_clid} />
            </div>
            <div className="fg">
              <label>Booking Date</label>
              <input type="date" id="ob_date" name="ob_date" value={formData.ob_date || ''} onChange={handleChange} disabled={!!editData} />
            </div>
            {editData && (
              <div className="fg">
                <label style={{ color: 'var(--or1)', fontWeight: 700 }}>Fix / Edit Booking ID</label>
                <input name="obId" value={formData.obId || ''} onChange={handleChange} placeholder="OB-2026-0001" style={{ border: '1px dashed var(--or1)', background: 'var(--bg)' }} disabled />
              </div>
            )}
          </div>

          {/* Client Details */}
          <div className="sect-lbl"><i className="fa fa-user"></i> Client Details</div>
          <div className="grid3">
            <div className="fg">
              <label>Client Name *</label>
              <input id="ob_cname" name="ob_cname" value={formData.ob_cname || ''} onChange={handleChange} placeholder="Full name" disabled={!!formData.ob_inqid || !!formData.ob_clid || !!editData} />
            </div>
            <div className="fg">
              <label>Contact No. *</label>
              <input id="ob_cont" name="ob_cont" value={formData.ob_cont || ''} onChange={handleChange} type="tel" placeholder="Mobile" disabled={!!formData.ob_inqid || !!formData.ob_clid || !!editData} />
            </div>
            <div className="fg">
              <label>Email ID</label>
              <input id="ob_email" name="ob_email" value={formData.ob_email || ''} onChange={handleChange} type="email" placeholder="Email" disabled={!!formData.ob_inqid || !!formData.ob_clid || !!editData} />
            </div>
          </div>
          <div className="grid2">
            <div className="fg">
              <label>Client Address</label>
              <input id="ob_addr" name="ob_addr" value={formData.ob_addr || ''} onChange={handleChange} placeholder="Address" disabled={!!formData.ob_inqid || !!formData.ob_clid || !!editData} />
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
              <input id="ob_mm" name="ob_mm" value={formData.ob_mm || ''} onChange={handleChange} placeholder="Maruti Swift VXI" disabled={!!formData.ob_inqid || !!formData.ob_clid || !!editData} />
            </div>
            <div className="fg">
              <label>Color</label>
              <select id="ob_color" name="ob_color" value={formData.ob_color || ''} onChange={handleChange} disabled={!!formData.ob_inqid || !!formData.ob_clid || !!editData}>
                <option>White</option><option>Silver</option><option>Grey</option><option>Black</option><option>Red</option><option>Blue</option><option>Brown</option><option>Orange</option><option>Yellow</option><option>Green</option><option>Other</option>
              </select>
            </div>
            <div className="fg">
              <label>Fuel Type</label>
              <select id="ob_fuel" name="ob_fuel" value={formData.ob_fuel || ''} onChange={handleChange} disabled={!!formData.ob_inqid || !!formData.ob_clid || !!editData}>
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
              <input id="ob_regn" name="ob_regn" value={formData.ob_regn || ''} onChange={handleChange} placeholder="GJ-01-AB-1234" style={{ textTransform: 'uppercase' }} disabled={!!formData.ob_inqid || !!formData.ob_clid || !!editData} />
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Mfg Year</label>
              <select id="ob_year" name="ob_year" value={formData.ob_year || ''} onChange={handleChange} disabled={!!formData.ob_inqid || !!formData.ob_clid || !!editData}>
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
              <input id="ob_km" name="ob_km" value={formData.ob_km || ''} onChange={handleChange} type="number" placeholder="KM" disabled={!!formData.ob_inqid || !!formData.ob_clid || !!editData} />
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
              <label>Insurance Company Name</label>
              <input id="ob_insname" name="ob_insname" value={formData.ob_insname || ''} onChange={handleChange} placeholder="Insurance Company" />
            </div>
            <div className="fg">
              <label>Insurance Validity</label>
              <input type="date" id="ob_insval" name="ob_insval" value={formData.ob_insval || ''} onChange={handleChange} />
            </div>
          </div>

          {/* Personnel Details */}
          <div className="sect-lbl"><i className="fa fa-user-tie"></i> Personnel Details</div>
          <div className="grid3">
            <div className="fg">
              <label>Executive Name</label>
              <input id="ob_exname" name="ob_exname" value={formData.ob_exname || ''} onChange={handleChange} placeholder="Executive Name" />
            </div>
            <div className="fg">
              <label>Valuator Name</label>
              <input id="ob_val" name="ob_val" value={formData.ob_val || ''} onChange={handleChange} placeholder="Valuator Name" />
            </div>
            <div className="fg">
              <label>Partner Name</label>
              <input id="ob_pname" name="ob_pname" value={formData.ob_pname || ''} onChange={handleChange} placeholder="Partner Name" />
            </div>
          </div>

          {/* Cost Calculation */}
          <div className="sect-lbl"><i className="fa fa-calculator"></i> Cost Calculation (Auto)</div>
          <div className="grid2">
            <div className="fg">
              <label>Purchase Price</label>
              <input type="number" id="ob_pp" name="ob_pp" value={formData.ob_pp || ''} onChange={handleChange} placeholder="0" disabled={!!formData.ob_clid || !!editData} />
            </div>
            <div className="fg">
              <label>RTO Challan Amount</label>
              <input type="number" id="ob_rto" name="ob_rto" value={formData.ob_rto || ''} onChange={handleChange} placeholder="0" />
            </div>
          </div>
          <div className="calc-panel">
            <div className="calc-row"><span className="cl">Purchase Price</span><span>{fmt(formData.ob_pp)}</span></div>
            <div className="calc-row"><span className="cl">RTO Challan</span><span>{fmt(formData.ob_rto)}</span></div>
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
              <label>Remark</label>
              <input id="ob_rem" name="ob_rem" value={formData.ob_rem || ''} onChange={handleChange} placeholder="Notes" />
            </div>
          </div>
          <div className="grid3">

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
              <label>Document Status</label>
              <select id="ob_doc_stat" name="ob_doc_stat" value={formData.ob_doc_stat || ''} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
            <div></div>
          </div>
        </div>

        <div className="m-foot">
          <button className="btn btn-out" onClick={onClose}>Cancel</button>
          <button className="btn btn-bl" onClick={handlePrintOrderBooking} type="button">
            <i className="fa fa-print"></i> Preview Order Booking
          </button>
          <button className="btn btn-or" onClick={handlePrintDeliveryNote} type="button">
            <i className="fa fa-file-invoice"></i> DN (GUJ)
          </button>
          <button className="btn btn-or" onClick={handlePrintDeliveryNoteEnglish} type="button">
            <i className="fa fa-file-invoice"></i> DN (ENG)
          </button>
          <button className="btn btn-bl" style={{ background: 'var(--success)' }} onClick={handleSave}>
            <i className="fa fa-save"></i> Save Booking
          </button>
        </div>
      </div>
    </div>
  );
};
