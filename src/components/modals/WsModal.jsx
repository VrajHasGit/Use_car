import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { autoFillFromInq, autoFillFromStock, autoFillFromStockId } from '../../utils/relations';
import { MAKES, MODELS } from '../../utils/constants';

const DISABLED_STYLE = { background: 'var(--surface2)', cursor: 'not-allowed', opacity: 0.8 };

export const WsModal = ({ isOpen, onClose, onSave, onSuccess, editData, quickInqId, quickDocId, stockDocId, stockIdForWs }) => {
  const [formData, setFormData] = useState({
    ws_stkid: "", ws_inqid: "", ws_vnum: "", ws_indate: "", ws_km: "", ws_make: "",
    ws_model: "", ws_cname: "", ws_cont: "", ws_wtype: "General Service",
    ws_tech: "", ws_prob: "", ws_parts: "", ws_est: "", ws_pc: "",
    ws_lc: "", ws_pstat: "Pending", ws_jstat: "Open", ws_del: "",
    ws_exp: "", ws_qc: "", ws_act: "", ws_rem: ""
  });

  const [modelOptions, setModelOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [prefilled, setPrefilled] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({ ...editData });
        setModelOptions(MODELS[editData.ws_make] || []);
        setPrefilled(new Set());
      } else if (quickInqId) {
        setFormData(prev => ({ ...prev, ws_inqid: quickInqId }));
        autoFillFromInq(quickInqId).then(inqData => {
          if (inqData) {
            setFormData(prev => ({
              ...prev,
              ws_make: inqData.make || '',
              ws_model: inqData.model || '',
              ws_cname: inqData.sellerName || '',
              ws_cont: inqData.mobile || '',
              ws_vnum: inqData.regNo || '',
              ws_km: inqData.km || '',
            }));
            setModelOptions(MODELS[inqData.make] || []);
            setPrefilled(new Set(['ws_make', 'ws_model', 'ws_cname', 'ws_cont', 'ws_vnum']));
          }
        });
      } else if (quickDocId) {
        setFormData(prev => ({ ...prev, ws_inqid: quickDocId }));
        setPrefilled(new Set());
      } else if (stockIdForWs) {
        setFormData(prev => ({ ...prev, ws_stkid: stockIdForWs }));
        autoFillFromStockId(stockIdForWs).then(stkData => {
          if (stkData) {
            setFormData(prev => ({
              ...prev,
              ws_make: stkData.make || '',
              ws_model: stkData.model || '',
              ws_km: stkData.km || '',
              ws_vnum: stkData.regNo || ''
            }));
            setModelOptions(MODELS[stkData.make] || []);
            setPrefilled(new Set(['ws_make', 'ws_model', 'ws_vnum']));
          }
        });
      } else {
        setFormData({
          ws_stkid: "", ws_inqid: "", ws_vnum: "", ws_indate: new Date().toISOString().split('T')[0], ws_km: "", ws_make: "",
          ws_model: "", ws_cname: "", ws_cont: "", ws_wtype: "General Service",
          ws_tech: "", ws_prob: "", ws_parts: "", ws_est: "", ws_pc: "",
          ws_lc: "", ws_pstat: "Pending", ws_jstat: "Open", ws_del: "",
          ws_exp: "", ws_qc: "", ws_act: "", ws_rem: ""
        });
        setModelOptions([]);
        setPrefilled(new Set());
      }
    }
  }, [isOpen, editData, quickInqId, quickDocId, stockIdForWs]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'ws_make') {
      setModelOptions(MODELS[value] || []);
      setFormData(prev => ({ ...prev, ws_model: '' }));
    }

    if (name === 'ws_stkid' && value.length >= 5) {
      autoFillFromStockId(value.toUpperCase()).then(stkData => {
        if (stkData) {
          setFormData(prev => ({
            ...prev,
            ws_make: stkData.make || prev.ws_make,
            ws_model: stkData.model || prev.ws_model,
            ws_km: stkData.km || prev.ws_km,
            ws_vnum: stkData.regNo || prev.ws_vnum,
          }));
          setModelOptions(MODELS[stkData.make] || []);
          setPrefilled(prev => new Set([...prev, 'ws_make', 'ws_model', 'ws_vnum']));
        }
      });
    }

    if (name === 'ws_inqid' && value.length >= 5) {
      autoFillFromInq(value.toUpperCase()).then(inqData => {
        if (inqData) {
          setFormData(prev => ({
            ...prev,
            ws_make: inqData.make || prev.ws_make,
            ws_model: inqData.model || prev.ws_model,
            ws_cname: inqData.sellerName || prev.ws_cname,
            ws_cont: inqData.mobile || prev.ws_cont,
            ws_vnum: inqData.regNo || prev.ws_vnum,
            ws_km: inqData.km || prev.ws_km,
          }));
          setModelOptions(MODELS[inqData.make] || []);
          setPrefilled(prev => new Set([...prev, 'ws_make', 'ws_model', 'ws_cname', 'ws_cont', 'ws_vnum']));
        }
      });
    }

    if (name === 'ws_vnum' && value.length >= 6) {
      autoFillFromStock(value.toUpperCase()).then(stkData => {
        if (stkData) {
          setFormData(prev => ({
            ...prev,
            ws_make: stkData.make || prev.ws_make,
            ws_model: stkData.model || prev.ws_model,
            ws_km: stkData.km || prev.ws_km,
          }));
          setModelOptions(MODELS[stkData.make] || []);
          setPrefilled(prev => new Set([...prev, 'ws_make', 'ws_model']));
        }
      });
    }
  };

  const handleSave = async (moveToWorkshop = false) => {
    setSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
      } else {
        const { getNextCounter } = await import('../../services/db');
        const { genId } = await import('../../utils/helpers');
        let wsId = formData.wsId;
        if (!wsId) {
          const cnt = await getNextCounter('ws');
          wsId = genId('JC', cnt);
        }
        await addDoc(collection(db, 'ws'), {
          ...formData,
          wsId,
          date: formData.ws_indate || new Date().toISOString().split('T')[0],
          tasks: formData.tasks || [],
          createdAt: new Date().toISOString()
        });
        if (moveToWorkshop === true && stockDocId) {
          await updateDoc(doc(db, 'stk', stockDocId), { status: 'Under Refurb', updatedAt: new Date().toISOString() });
        }
        if (onSuccess) { onSuccess(); } else { onClose(); }
      }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const pc = Number(formData.ws_pc || 0);
  const lc = Number(formData.ws_lc || 0);
  const totalCost = pc + lc;

  const pf = (field) => prefilled.has(field);

  return (
    <div className="overlay on" id="m_ws">
      <div className="mbox">
        <div className="m-hdr">
          <div className="m-hdr-icon">🔧</div>
          <h3>Workshop / Refurbishment Job Card</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">
          <div style={{background:"rgba(255,107,0,.07)",border:"1px solid rgba(255,107,0,.25)",borderRadius:"var(--radius-sm)",padding:"10px 14px",marginBottom:"14px",display:"flex",alignItems:"center",gap:"10px"}}>
            <span style={{fontSize:"18px"}}>⚡</span>
            <div style={{display:"flex",gap:"10px",width:"100%"}}>
              <div className="fg" style={{margin:"0",flex:"1"}}>
                <label style={{color:"var(--or3)",fontSize:"10px",fontWeight:"700",letterSpacing:".8px",textTransform:"uppercase",marginBottom:"4px",display:"block"}}>Stock ID — Auto-Fill</label>
                <input name="ws_stkid" value={formData.ws_stkid} onChange={handleChange} placeholder="STK-2025-0001" style={{background:"var(--bg)",border:"1px solid rgba(255,107,0,.4)",color:"var(--text)",borderRadius:"var(--radius-sm)",padding:"8px 12px",fontFamily:"inherit",fontSize:"12px",width:"100%"}} />
              </div>
              <div className="fg" style={{margin:"0",flex:"1"}}>
                <label style={{color:"var(--or3)",fontSize:"10px",fontWeight:"700",letterSpacing:".8px",textTransform:"uppercase",marginBottom:"4px",display:"block"}}>Purchase INQ ID — Auto-Fill</label>
                <input name="ws_inqid" value={formData.ws_inqid} onChange={handleChange} placeholder="INQ-2025-0001" style={{background:"var(--bg)",border:"1px solid rgba(255,107,0,.4)",color:"var(--text)",borderRadius:"var(--radius-sm)",padding:"8px 12px",fontFamily:"inherit",fontSize:"12px",width:"100%"}} />
              </div>
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Vehicle Number * <span style={{color:"var(--or1)",fontSize:"10px"}}>⚡ Auto-Fill by RegNo</span></label>
              <input name="ws_vnum" value={formData.ws_vnum} onChange={handleChange} placeholder="GJ-01-AB-1234"
                disabled={pf('ws_vnum')} style={pf('ws_vnum') ? DISABLED_STYLE : {}} />
            </div>
            <div className="fg"><label>In Date *</label><input type="date" name="ws_indate" value={formData.ws_indate} onChange={handleChange} /></div>
            <div className="fg"><label>KM Reading</label><input type="number" name="ws_km" value={formData.ws_km} onChange={handleChange} placeholder="Current KM" /></div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Make {pf('ws_make') && <span style={{color:"var(--success)",fontSize:"9px",fontWeight:700}}>⚡ AUTO-FILLED</span>}</label>
              <select name="ws_make" value={formData.ws_make} onChange={handleChange}
                disabled={pf('ws_make')} style={pf('ws_make') ? DISABLED_STYLE : {}}>
                <option value="">Select Brand</option>
                {MAKES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Model {pf('ws_model') && <span style={{color:"var(--success)",fontSize:"9px",fontWeight:700}}>⚡ AUTO-FILLED</span>}</label>
              <select name="ws_model" value={formData.ws_model} onChange={handleChange}
                disabled={pf('ws_model')} style={pf('ws_model') ? DISABLED_STYLE : {}}>
                <option value="">Select Model</option>
                {modelOptions.map(m => <option key={m}>{m}</option>)}
                {!MODELS[formData.ws_make] && formData.ws_make && <option value={formData.ws_model}>{formData.ws_model}</option>}
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="fg">
              <label>Customer Name {pf('ws_cname') && <span style={{color:"var(--success)",fontSize:"9px",fontWeight:700}}>⚡ AUTO-FILLED</span>}</label>
              <input name="ws_cname" value={formData.ws_cname} onChange={handleChange} placeholder="Owner name"
                disabled={pf('ws_cname')} style={pf('ws_cname') ? DISABLED_STYLE : {}} />
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Contact No. {pf('ws_cont') && <span style={{color:"var(--success)",fontSize:"9px",fontWeight:700}}>⚡ AUTO-FILLED</span>}</label>
              <input name="ws_cont" value={formData.ws_cont} onChange={handleChange} type="tel" placeholder="Mobile"
                disabled={pf('ws_cont')} style={pf('ws_cont') ? DISABLED_STYLE : {}} />
            </div>
            <div className="fg"><label>Work Type *</label><select name="ws_wtype" value={formData.ws_wtype} onChange={handleChange}><option>General Service</option><option>Engine Work</option><option>Denting</option><option>Painting</option><option>AC Repair</option><option>Tyre Work</option><option>Electrical</option><option>Washing</option><option>Accessories</option><option>Body Work</option><option>Full Refurb</option><option>Other</option></select></div>
            <div className="fg"><label>Technician Name</label><input name="ws_tech" value={formData.ws_tech} onChange={handleChange} placeholder="Mechanic name" /></div>
          </div>
          <div className="grid1"><div className="fg"><label>Problem Details</label><textarea name="ws_prob" value={formData.ws_prob} onChange={handleChange} placeholder="Customer complaint / problem description…"></textarea></div></div>
          <div className="grid1"><div className="fg"><label>Parts Required</label><textarea name="ws_parts" value={formData.ws_parts} onChange={handleChange} placeholder="List all parts needed…"></textarea></div></div>
          <div className="sect-lbl"><i className="fa fa-calculator"></i> Cost Calculation — AUTO</div>
          <div className="grid3">
            <div className="fg"><label>Estimated Cost ₹</label><input type="number" name="ws_est" value={formData.ws_est} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Parts Cost ₹ *</label><input type="number" name="ws_pc" value={formData.ws_pc} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>Labour Cost ₹ *</label><input type="number" name="ws_lc" value={formData.ws_lc} onChange={handleChange} placeholder="0" /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Total Cost ₹ (AUTO)</label><div className="calc-out">₹ {totalCost.toLocaleString()}</div></div>
            <div className="fg"><label>Payment Status</label><select name="ws_pstat" value={formData.ws_pstat} onChange={handleChange}><option>Pending</option><option>Paid</option></select></div>
            <div className="fg"><label>Job Status</label><select name="ws_jstat" value={formData.ws_jstat} onChange={handleChange}><option>Open</option><option>In Process</option><option>Complete</option></select></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Delivery Date</label><input type="date" name="ws_del" value={formData.ws_del} onChange={handleChange} /></div>
            <div className="fg"><label>Expected Completion</label><input type="date" name="ws_exp" value={formData.ws_exp} onChange={handleChange} /></div>
            <div className="fg"><label>Quality Checked By</label><input name="ws_qc" value={formData.ws_qc} onChange={handleChange} placeholder="QC name" /></div>
          </div>
          <div className="grid2">
            <div className="fg"><label>Actual Completion Date</label><input type="date" name="ws_act" value={formData.ws_act} onChange={handleChange} /></div>
            <div className="fg"><label>Remarks</label><input name="ws_rem" value={formData.ws_rem} onChange={handleChange} placeholder="Extra notes" /></div>
          </div>
        </div>
        <div className="m-foot">
          <button className="btn btn-out" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-or" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? <><i className="car-spinner"></i> Saving…</> : <><i className="fa fa-save"></i> Save Job Card</>}
          </button>
          {stockDocId && (
            <button className="btn btn-or" onClick={() => handleSave(true)} disabled={saving} style={{ background: 'var(--bl5)', borderColor: 'var(--bl5)' }}>
              {saving ? <><i className="car-spinner"></i> Saving…</> : <><i className="fa fa-share"></i> Save & Move to Workshop</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
