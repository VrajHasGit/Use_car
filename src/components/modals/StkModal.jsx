import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { autoFillFromInq, autoFillFromDoc } from '../../utils/relations';
import { MAKES, MODELS, YEARS, FUELS, TRANS, COLORS, OWNERS } from '../../utils/constants';

export const StkModal = ({ isOpen, onClose, onSave, onSuccess, editData, quickInqId, quickDocId }) => {
  const [formData, setFormData] = useState({
    sk_inqid: "", sk_docid: "", sk_regn: "", sk_chas: "", sk_eng: "", sk_make: "",
    sk_model: "", sk_var: "", sk_year: "", sk_ryear: "", sk_fuel: "Petrol",
    sk_trans: "Manual", sk_color: "White", sk_km: "", sk_own: "1st",
    sk_stat: "In Stock", sk_loc: "", sk_pdate: "", sk_insval: "",
    sk_rc: "Yes", sk_photos: "Yes", sk_pp: "", sk_refurb: "", sk_rto: "",
    sk_ins: "", sk_sp: "", sk_sp2: "", sk_sp3: "", sk_360: "No",
    sk_portal: "No", sk_mkt: "None"
  });

  const [modelOptions, setModelOptions] = useState([]);
  const [saving, setSaving] = useState(false);

  const applyAutoFillInq = async (inqId) => {
    const inqData = await autoFillFromInq(inqId);
    if (inqData) {
      setFormData(prev => ({
        ...prev,
        sk_make: inqData.make || prev.sk_make,
        sk_model: inqData.model || prev.sk_model,
        sk_var: inqData.variant || prev.sk_var,
        sk_year: inqData.year || prev.sk_year,
        sk_fuel: inqData.fuel || prev.sk_fuel
      }));
      setModelOptions(MODELS[inqData.make] || []);
    }
  };

  const applyAutoFillDoc = async (docId) => {
    const docData = await autoFillFromDoc(docId);
    if (docData) {
      setFormData(prev => ({
        ...prev,
        sk_regn: docData.dc_regn || docData.ob_regn || docData.regNo || prev.sk_regn,
        sk_make: docData.ob_make || docData.ob_mm?.split(' ')[0] || docData.make || prev.sk_make,
        sk_model: docData.ob_model || docData.ob_mm?.split(' ').slice(1).join(' ') || docData.model || prev.sk_model,
        sk_var: docData.ob_var || docData.variant || prev.sk_var,
        sk_year: docData.ob_year || docData.year || prev.sk_year,
        sk_fuel: docData.ob_fuel || docData.fuel || prev.sk_fuel,
        sk_chas: docData.ob_chas || docData.chas || prev.sk_chas,
        sk_eng: docData.ob_eng || docData.eng || prev.sk_eng,
        sk_color: docData.ob_color || docData.color || prev.sk_color,
        sk_km: docData.ob_km || docData.km || prev.sk_km,
        sk_pp: docData.ob_pp || docData.pp || prev.sk_pp,
        sk_rc: docData.dc_rc ? 'Yes' : prev.sk_rc
      }));
      setModelOptions(MODELS[docData.ob_make || docData.ob_mm?.split(' ')[0] || docData.make] || []);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        const inqIdToUse = editData.sk_inqid || editData.inqId || '';
        const docIdToUse = editData.sk_docid || editData.docId || '';
        setFormData({ ...editData, sk_inqid: inqIdToUse, sk_docid: docIdToUse });
        setModelOptions(MODELS[editData.sk_make] || []);
        if (inqIdToUse) applyAutoFillInq(inqIdToUse);
        if (docIdToUse) applyAutoFillDoc(docIdToUse);
      } else if (quickInqId) {
        setFormData(prev => ({ ...prev, sk_inqid: quickInqId }));
        applyAutoFillInq(quickInqId);
      } else if (quickDocId) {
        setFormData(prev => ({ ...prev, sk_docid: quickDocId }));
        applyAutoFillDoc(quickDocId);
      } else {
        setFormData({
          sk_inqid: "", sk_docid: "", sk_regn: "", sk_chas: "", sk_eng: "", sk_make: "",
          sk_model: "", sk_var: "", sk_year: "", sk_ryear: "", sk_fuel: "Petrol",
          sk_trans: "Manual", sk_color: "White", sk_km: "", sk_own: "1st",
          sk_stat: "In Stock", sk_loc: "", sk_pdate: new Date().toISOString().split('T')[0], sk_insval: "",
          sk_rc: "Yes", sk_photos: "Yes", sk_pp: "", sk_refurb: "", sk_rto: "",
          sk_ins: "", sk_sp: "", sk_sp2: "", sk_sp3: "", sk_360: "No",
          sk_portal: "No", sk_mkt: "None"
        });
        setModelOptions([]);
      }
    }
  }, [isOpen, editData, quickInqId, quickDocId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'sk_make') {
      setModelOptions(MODELS[value] || []);
      setFormData(prev => ({ ...prev, sk_model: '' }));
    }

    if (name === 'sk_docid' && value.length >= 5) {
      applyAutoFillDoc(value.toUpperCase());
    }

    if (name === 'sk_inqid' && value.length >= 5) {
      applyAutoFillInq(value);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSave) {
        // Let the parent handle the complete saving process (e.g. Stock.jsx)
        await onSave(formData);
      } else {
        // Internal saving (e.g. when triggered from Quick Modal)
        const payload_pp = Number(formData.sk_pp || 0);
        const payload_refurb = Number(formData.sk_refurb || 0);
        const payload_rto = Number(formData.sk_rto || 0);
        const payload_ins = Number(formData.sk_ins || 0);
        const payload_tcp = payload_pp + payload_refurb + payload_rto + payload_ins;
        const payload_sp = Number(formData.sk_sp || 0);
        const payload_profit = payload_sp - payload_tcp;
        
        let stkId = formData.stkId;
        if (!stkId) {
          const { getNextCounter } = await import('../../services/db');
          const { genId } = await import('../../utils/helpers');
          const cnt = await getNextCounter('stk');
          stkId = genId('STK', cnt);
        }

        const newDocData = { 
          ...formData, 
          stkId,
          createdAt: new Date().toISOString(),
          regNo: formData.sk_regn || '',
          make: formData.sk_make || '',
          model: formData.sk_model || '',
          variant: formData.sk_var || '',
          year: formData.sk_year || '',
          fuel: formData.sk_fuel || '',
          trans: formData.sk_trans || '',
          color: formData.sk_color || '',
          km: formData.sk_km || '',
          status: formData.sk_stat || 'In Stock',
          pDate: formData.sk_pdate || new Date().toISOString().split('T')[0],
          pp: payload_pp, 
          refurb: payload_refurb, 
          rto: payload_rto, 
          ins: payload_ins, 
          tcp: payload_tcp, 
          sp: payload_sp, 
          profit: payload_profit
        };

        if (editData && editData.id) {
          const { updateRecord } = await import('../../services/db');
          await updateRecord('stk', editData.id, newDocData);
        } else {
          const { addRecord } = await import('../../services/db');
          await addRecord('stk', newDocData);
        }

        if (onSuccess) { onSuccess(); }
        onClose();
      }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const pp = Number(formData.sk_pp || 0);
  const refurb = Number(formData.sk_refurb || 0);
  const rto = Number(formData.sk_rto || 0);
  const ins = Number(formData.sk_ins || 0);
  const sp = Number(formData.sk_sp || 0);
  
  const tcp = pp + refurb + rto + ins;
  const profit = sp - tcp;

  return (
    <div className="overlay on" id="m_stk">
      <div className="mbox">
        <div className="m-hdr">
          <div className="m-hdr-icon">🏢</div>
          <h3>Car Stock</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">
          <div style={{background:"rgba(255,107,0,.07)",border:"1px solid rgba(255,107,0,.25)",borderRadius:"var(--radius-sm)",padding:"10px 14px",marginBottom:"14px",display:"flex",alignItems:"center",gap:"10px"}}>
            <span style={{fontSize:"18px"}}>⚡</span>
            <div style={{display:"flex",gap:"10px",width:"100%"}}>
              <div className="fg" style={{margin:"0",flex:"1"}}>
                <label style={{color:"var(--or3)",fontSize:"10px",fontWeight:"700",letterSpacing:".8px",textTransform:"uppercase",marginBottom:"4px",display:"block"}}>DOC ID — Auto-Fill All Fields</label>
                <input name="sk_docid" value={formData.sk_docid} onChange={handleChange} placeholder="DOC-2025-0001" style={{background:"var(--bg)",border:"1px solid rgba(255,107,0,.4)",color:"var(--text)",borderRadius:"var(--radius-sm)",padding:"8px 12px",fontFamily:"inherit",fontSize:"12px",width:"100%"}} />
              </div>
              <div className="fg" style={{margin:"0",flex:"1"}}>
                <label style={{color:"var(--or3)",fontSize:"10px",fontWeight:"700",letterSpacing:".8px",textTransform:"uppercase",marginBottom:"4px",display:"block"}}>INQ ID — Auto-Fill All Fields</label>
                <input name="sk_inqid" value={formData.sk_inqid} onChange={handleChange} placeholder="INQ-2025-0001" style={{background:"var(--bg)",border:"1px solid rgba(255,107,0,.4)",color:"var(--text)",borderRadius:"var(--radius-sm)",padding:"8px 12px",fontFamily:"inherit",fontSize:"12px",width:"100%"}} />
              </div>
            </div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Registration No. * <span style={{color:"var(--or1)",fontSize:"10px"}}>⚡ Auto-Fill by RegNo</span></label><input name="sk_regn" value={formData.sk_regn} onChange={handleChange} placeholder="GJ-01-AB-1234" /></div>
            <div className="fg"><label>Chassis Number</label><input name="sk_chas" value={formData.sk_chas} onChange={handleChange} placeholder="17-char VIN" /></div>
            <div className="fg"><label>Engine Number</label><input name="sk_eng" value={formData.sk_eng} onChange={handleChange} placeholder="Engine No." /></div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Make *</label>
              <select name="sk_make" value={formData.sk_make} onChange={handleChange}>
                <option value="">Select Brand</option>
                {MAKES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Model</label>
              <select name="sk_model" value={formData.sk_model} onChange={handleChange}>
                <option value="">Select Model</option>
                {modelOptions.map(m => <option key={m}>{m}</option>)}
                {!MODELS[formData.sk_make] && formData.sk_make && <option value={formData.sk_model}>{formData.sk_model}</option>}
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="fg"><label>Variant</label><input name="sk_var" value={formData.sk_var} onChange={handleChange} placeholder="Variant" /></div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Mfg Year</label>
              <select name="sk_year" value={formData.sk_year} onChange={handleChange}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Registration Year</label>
              <select name="sk_ryear" value={formData.sk_ryear} onChange={handleChange}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Fuel Type</label>
              <select name="sk_fuel" value={formData.sk_fuel} onChange={handleChange}>
                {FUELS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Transmission</label>
              <select name="sk_trans" value={formData.sk_trans} onChange={handleChange}>
                {TRANS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Color</label>
              <select name="sk_color" value={formData.sk_color} onChange={handleChange}>
                {COLORS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="fg"><label>KM Driven</label><input type="number" name="sk_km" value={formData.sk_km} onChange={handleChange} placeholder="KM" /></div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Number of Owners</label>
              <select name="sk_own" value={formData.sk_own} onChange={handleChange}>
                {OWNERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="fg"><label>Stock Status</label><select name="sk_stat" value={formData.sk_stat} onChange={handleChange} ><option>In Stock</option><option>Under Refurb</option><option>Ready for Sale</option><option>Sold</option><option>On Hold</option><option>Cancelled</option></select></div>
            <div className="fg"><label>Stock Location</label><input name="sk_loc" value={formData.sk_loc} onChange={handleChange} placeholder="Parking location" /></div>
          </div>
          <div className="grid2">
            <div className="fg"><label>Purchase Date</label><input type="date" name="sk_pdate" value={formData.sk_pdate} onChange={handleChange} /></div>
            <div className="fg"><label>Insurance Validity</label><input type="date" name="sk_insval" value={formData.sk_insval} onChange={handleChange} /></div>
          </div>
          <div className="grid2">
            <div className="fg"><label>RC Available</label><select name="sk_rc" value={formData.sk_rc} onChange={handleChange}><option>Yes</option><option>No</option><option>Applied</option></select></div>
            <div className="fg"><label>Photos Uploaded</label><select name="sk_photos" value={formData.sk_photos} onChange={handleChange}><option>Yes</option><option>No</option></select></div>
          </div>
          <div className="sect-lbl"><i className="fa fa-calculator"></i> Cost & Pricing — AUTO CALCULATION</div>
          <div className="grid3">
            <div className="fg"><label>Purchase Price ₹ *</label><input type="number" name="sk_pp" value={formData.sk_pp} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Refurb Cost ₹</label><input type="number" name="sk_refurb" value={formData.sk_refurb} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>RTO Transfer Cost ₹</label><input type="number" name="sk_rto" value={formData.sk_rto} onChange={handleChange} placeholder="0" /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Insurance Cost ₹</label><input type="number" name="sk_ins" value={formData.sk_ins} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Total Cost Price ₹ (AUTO)</label><div className="calc-out">₹ {tcp.toLocaleString()}</div></div>
            <div className="fg"><label>Sale Price ₹</label><input type="number" name="sk_sp" value={formData.sk_sp} onChange={handleChange} placeholder="0" /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>2nd Price ₹ (Floor)</label><input type="number" name="sk_sp2" value={formData.sk_sp2} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>3rd Price ₹ (Minimum)</label><input type="number" name="sk_sp3" value={formData.sk_sp3} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Profit / Loss ₹ (AUTO)</label><div className="calc-out" style={{ color: profit < 0 ? 'var(--danger)' : 'var(--success)' }}>₹ {profit.toLocaleString()}</div></div>
          </div>
          <div className="calc-panel">
            <div className="calc-row"><span className="cl">Purchase Price</span><span>₹ {pp.toLocaleString()}</span></div>
            <div className="calc-row"><span className="cl">+ Refurbishment</span><span>₹ {refurb.toLocaleString()}</span></div>
            <div className="calc-row"><span className="cl">+ RTO Transfer</span><span>₹ {rto.toLocaleString()}</span></div>
            <div className="calc-row"><span className="cl">+ Insurance</span><span>₹ {ins.toLocaleString()}</span></div>
            <div className="calc-row"><span className="cl">= Total Cost</span><span>₹ {tcp.toLocaleString()}</span></div>
            <div className="calc-row"><span className="cl">Sale Price</span><span>₹ {sp.toLocaleString()}</span></div>
            <div className="calc-row"><span style={{color:"var(--or2)"}}>PROFIT / LOSS</span><span style={{color: profit < 0 ? 'var(--danger)' : 'var(--success)'}}>₹ {profit.toLocaleString()}</span></div>
          </div>
          <div className="grid3" style={{marginTop:"14px"}}>
            <div className="fg"><label>360° Video</label><select name="sk_360" value={formData.sk_360} onChange={handleChange}><option>No</option><option>Yes</option></select></div>
            <div className="fg"><label>Listed on Portal</label><select name="sk_portal" value={formData.sk_portal} onChange={handleChange}><option>No</option><option>OLX</option><option>CarDekho</option><option>Cars24</option><option>All</option></select></div>
            <div className="fg"><label>Marketing</label><select name="sk_mkt" value={formData.sk_mkt} onChange={handleChange}><option>None</option><option>Social Media</option><option>WhatsApp</option><option>YouTube</option><option>All</option></select></div>
          </div>
        </div>
        <div className="m-foot">
          <button className="btn btn-out" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-or" onClick={handleSave} disabled={saving}>
            {saving ? <><i className="car-spinner"></i> Saving…</> : <><i className="fa fa-save"></i> Save Stock</>}
          </button>
        </div>
      </div>
    </div>
  );
};
