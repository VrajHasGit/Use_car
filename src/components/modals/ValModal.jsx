import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { autoFillFromInq } from '../../utils/relations';
import { MAKES, MODELS, YEARS, FUELS, OWNERS } from '../../utils/constants';

export const ValModal = ({ isOpen, onClose, onSave, editData, quickInqId }) => {
  const [formData, setFormData] = useState({
    v_inqid: "", v_date: "", v_vnum: "", v_cname: "", v_cont: "", v_km: "",
    v_make: "", v_model: "", v_var: "", v_year: "", v_fuel: "", v_own: "",
    v_rc: false, v_svc: false, v_acc: false, v_tyre: "Good", v_eng: "Good",
    v_ovr: "Good", v_stat: "Pending", v_nextfu: "", v_rem: ""
  });
  
  const [saving, setSaving] = useState(false);
  const [modelOptions, setModelOptions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({ ...editData });
        setModelOptions(MODELS[editData.v_make] || []);
      } else if (quickInqId) {
        setFormData(prev => ({ ...prev, v_inqid: quickInqId }));
        autoFillFromInq(quickInqId).then(inqData => {
          if (inqData) {
            setFormData(prev => ({
              ...prev,
              v_cname: inqData.sellerName || '',
              v_cont: inqData.mobile || '',
              v_make: inqData.make || '',
              v_model: inqData.model || '',
              v_year: inqData.year || '',
              v_fuel: inqData.fuel || ''
            }));
            setModelOptions(MODELS[inqData.make] || []);
          }
        });
      } else {
        setFormData({
          v_inqid: "", v_date: new Date().toISOString().split('T')[0], v_vnum: "", v_cname: "", v_cont: "", v_km: "",
          v_make: "", v_model: "", v_var: "", v_year: "", v_fuel: "Petrol", v_own: "1st",
          v_rc: false, v_svc: false, v_acc: false, v_tyre: "Good", v_eng: "Good",
          v_ovr: "Good", v_stat: "Pending", v_nextfu: "", v_rem: ""
        });
        setModelOptions([]);
      }
    }
  }, [isOpen, editData, quickInqId]);

  if (!isOpen) return null;

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));

    if (name === 'v_make') {
      setModelOptions(MODELS[value] || []);
      setFormData(prev => ({ ...prev, v_model: '' }));
    }

    if (name === 'v_inqid' && value.length >= 5) {
      const inqData = await autoFillFromInq(value);
      if (inqData) {
        setFormData(prev => ({
          ...prev,
          v_cname: inqData.sellerName || '',
          v_cont: inqData.mobile || '',
          v_make: inqData.make || '',
          v_model: inqData.model || '',
          v_year: inqData.year || '',
          v_fuel: inqData.fuel || ''
        }));
        setModelOptions(MODELS[inqData.make] || []);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSave && editData) {
        await onSave(formData);
      } else {
        await addDoc(collection(db, 'val'), { ...formData, createdAt: new Date().toISOString() });
        if (onSave) { await onSave(formData); } else { onClose(); }
      }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay on" id="m_val">
      <div className="mbox">
        <div className="m-hdr">
          <div className="m-hdr-icon">🔍</div>
          <h3>Vehicle Valuation</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">
          <div className="grid3">
            <div className="fg"><label>Inquiry ID <span style={{color:"var(--or1)",fontSize:"10px"}}>⚡ Auto-Fill</span></label><input name="v_inqid" value={formData.v_inqid} onChange={handleChange} placeholder="INQ-2025-0001" /></div>
            <div className="fg"><label>Valuation Date</label><input type="date" name="v_date" value={formData.v_date} onChange={handleChange} /></div>
            <div className="fg"><label>Vehicle Number</label><input name="v_vnum" value={formData.v_vnum} onChange={handleChange} placeholder="GJ-01-AB-1234" /></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Customer Name</label><input name="v_cname" value={formData.v_cname} onChange={handleChange} placeholder="Name" /></div>
            <div className="fg"><label>Contact No.</label><input name="v_cont" value={formData.v_cont} onChange={handleChange} type="tel" placeholder="Mobile" /></div>
            <div className="fg"><label>KM Driven</label><input name="v_km" value={formData.v_km} onChange={handleChange} type="number" placeholder="KM" /></div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Make</label>
              <select name="v_make" value={formData.v_make} onChange={handleChange}>
                <option value="">Select Brand</option>
                {MAKES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Model</label>
              <select name="v_model" value={formData.v_model} onChange={handleChange}>
                <option value="">Select Model</option>
                {modelOptions.map(m => <option key={m}>{m}</option>)}
                {!MODELS[formData.v_make] && formData.v_make && <option value={formData.v_model}>{formData.v_model}</option>}
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="fg"><label>Variant</label><input name="v_var" value={formData.v_var} onChange={handleChange} placeholder="Variant" /></div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Year</label>
              <select name="v_year" value={formData.v_year} onChange={handleChange}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Fuel Type</label>
              <select name="v_fuel" value={formData.v_fuel} onChange={handleChange}>
                <option value="">Select Fuel</option>
                {FUELS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Owner Serial</label>
              <select name="v_own" value={formData.v_own} onChange={handleChange}>
                {OWNERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          
          <div className="sect-lbl"><i className="fa fa-clipboard-check"></i> Inspection Checklist</div>
          <div className="chk-grid">
            <label className="chk-item"><input type="checkbox" name="v_rc" checked={formData.v_rc} onChange={handleChange} /><span>RC Available</span></label>
            <label className="chk-item"><input type="checkbox" name="v_svc" checked={formData.v_svc} onChange={handleChange} /><span>Service Record Available</span></label>
            <label className="chk-item"><input type="checkbox" name="v_acc" checked={formData.v_acc} onChange={handleChange} /><span>No Accident History</span></label>
          </div>
          
          <div className="grid3">
            <div className="fg"><label>Tyre Condition</label><select name="v_tyre" value={formData.v_tyre} onChange={handleChange}><option>Good</option><option>Average</option><option>Bad</option></select></div>
            <div className="fg"><label>Engine Condition</label><select name="v_eng" value={formData.v_eng} onChange={handleChange}><option>Good</option><option>Repair Required</option></select></div>
            <div className="fg"><label>Overall Condition</label><select name="v_ovr" value={formData.v_ovr} onChange={handleChange}><option>Excellent</option><option>Good</option><option>Average</option><option>Poor</option></select></div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Status</label><select name="v_stat" value={formData.v_stat} onChange={handleChange}><option>Pending</option><option>Done</option><option>Approved</option><option>Rejected</option><option>Hold</option></select></div>
            <div className="fg"><label>Next Follow-Up Date <span style={{color:"var(--or1)",fontSize:"10px"}}>📅 PFU ma auto-set</span></label><input type="date" name="v_nextfu" value={formData.v_nextfu} onChange={handleChange} /></div>
            <div className="fg"><label>Remarks</label><input name="v_rem" value={formData.v_rem} onChange={handleChange} placeholder="Notes" /></div>
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
