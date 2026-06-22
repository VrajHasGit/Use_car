import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { addRecord, updateRecord, getNextCounter } from '../../services/db';
import { genId, today } from '../../utils/helpers';
import { autoFillFromInq } from '../../utils/relations';
import { MAKES, MODELS, YEARS, FUELS, OWNERS } from '../../utils/constants';
import { uploadFile, deleteFile, isImage, isVideo } from '../../utils/uploadMedia';

export const ValModal = ({ isOpen, onClose, onSave, onSuccess, editData, quickInqId }) => {
  const { data } = useData();
  const [formData, setFormData] = useState({
    v_inqid: "", v_date: "", v_vnum: "", v_cname: "", v_cont: "", v_km: "",
    v_make: "", v_model: "", v_var: "", v_year: "", v_fuel: "", v_own: "",
    v_rc: false, v_svc: false, v_acc: false, v_tyre: "Good", v_eng: "Good",
    v_ovr: "Good", v_stat: "Pending", v_nextfu: "", v_rem: "",
    v_media: []
  });
  
  const [saving, setSaving] = useState(false);
  const [modelOptions, setModelOptions] = useState([]);
  const [autoFillMsg, setAutoFillMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ── In-memory lookup first, Firestore fallback ──
  const lookupInquiry = async (inqId) => {
    if (!inqId) return null;
    const local = (data?.pur_inq || []).find(r =>
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
        v_cname: inqData.sellerName || '',
        v_cont: inqData.mobile || '',
        v_make: inqData.make || '',
        v_model: inqData.model || '',
        v_var: inqData.variant || '',
        v_year: inqData.year || '',
        v_fuel: inqData.fuel || '',
        v_km: inqData.km || '',
        v_vnum: inqData.regNo || '',
        v_own: inqData.owners || prev.v_own,
        v_rem: inqData.remarks || prev.v_rem,
      }));
      setModelOptions(MODELS[inqData.make] || []);
      setAutoFillMsg(`✅ Auto-filled from: ${inqData.sellerName || inqId}`);
      setTimeout(() => setAutoFillMsg(''), 4000);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAutoFillMsg('');
      if (editData) {
        setFormData({ v_media: [], ...editData });
        setModelOptions(MODELS[editData.v_make] || []);
      } else if (quickInqId) {
        setFormData(prev => ({ ...prev, v_inqid: quickInqId, v_media: [] }));
        applyAutoFill(quickInqId);
      } else {
        setFormData({
          v_inqid: "", v_date: new Date().toISOString().split('T')[0], v_vnum: "", v_cname: "", v_cont: "", v_km: "",
          v_make: "", v_model: "", v_var: "", v_year: "", v_fuel: "Petrol", v_own: "1st",
          v_rc: false, v_svc: false, v_acc: false, v_tyre: "Good", v_eng: "Good",
          v_ovr: "Good", v_stat: "Pending", v_nextfu: "", v_rem: "",
          v_media: []
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

    if (name === 'v_inqid' && value.length >= 3) {
      applyAutoFill(value);
    }
  };

  // ── Media Upload ──
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setUploadProgress(0);
    const newMedia = [...(formData.v_media || [])];

    for (let i = 0; i < files.length; i++) {
      try {
        setUploadProgress(Math.round(((i) / files.length) * 100));
        const result = await uploadFile(files[i], 'valuation', (pct) => {
          setUploadProgress(Math.round(((i + pct / 100) / files.length) * 100));
        });
        newMedia.push({
          url: result.url,
          key: result.key,
          name: result.name,
          type: result.type,
          size: result.size,
        });
      } catch (err) {
        console.error('Upload failed:', err);
        alert(`Failed to upload ${files[i].name}: ${err.message}`);
      }
    }

    setFormData(prev => ({ ...prev, v_media: newMedia }));
    setUploading(false);
    setUploadProgress(100);
    e.target.value = '';
  };

  const handleDeleteMedia = async (index) => {
    const media = formData.v_media || [];
    const item = media[index];
    if (!item) return;
    if (!window.confirm(`Delete ${item.name}?`)) return;

    try {
      await deleteFile(item.key || item.url);
    } catch (e) {
      console.warn('Delete from storage failed (may already be gone):', e);
    }
    setFormData(prev => ({
      ...prev,
      v_media: prev.v_media.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editData && editData.id) {
        if (onSave) { await onSave(formData); } else { await updateRecord('val', editData.id, formData); }
      } else {
        const cnt = await getNextCounter('val');
        const valId = genId('VAL', cnt);
        if (onSave) { await onSave({...formData, valId}); } 
        else {
          await addRecord('val', { ...formData, valId, date: formData.date || today() });
          if (onSuccess) onSuccess();
        }
      }
      onClose();
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const mediaItems = formData.v_media || [];

  return (
    <div className="overlay on" id="m_val">
      <div className="mbox">
        <div className="m-hdr">
          <div className="m-hdr-icon">🔍</div>
          <h3>Vehicle Valuation</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">
          {/* Auto-fill success banner */}
          {autoFillMsg && (
            <div style={{ background: 'rgba(16,185,129,.1)', border: '1px solid #10B981', borderRadius: 'var(--radius-sm)', padding: '8px 14px', fontSize: 12, color: '#10B981', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              {autoFillMsg}
            </div>
          )}

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

          {/* ── Inspection Photos & Videos ── */}
          <div className="sect-lbl"><i className="fa fa-camera"></i> Inspection Photos & Videos</div>
          <div style={{
            border: '2px dashed var(--border2)',
            borderRadius: 'var(--radius)',
            padding: uploading ? '12px 16px' : '20px',
            textAlign: 'center',
            background: 'var(--surface2)',
            marginBottom: 14,
            cursor: 'pointer',
            position: 'relative',
            transition: 'border-color 0.2s',
          }}
            onClick={() => !uploading && document.getElementById('val_media_input').click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--or1)'; }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--border2)';
              const dt = e.dataTransfer;
              if (dt.files.length) {
                const input = document.getElementById('val_media_input');
                const newDt = new DataTransfer();
                Array.from(dt.files).forEach(f => newDt.items.add(f));
                input.files = newDt.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }}
          >
            <input
              id="val_media_input"
              type="file"
              multiple
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            {uploading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className="fa fa-spinner fa-spin" style={{ color: 'var(--or1)' }}></i>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text2)' }}>
                    Uploading... {uploadProgress}%
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--or1)', borderRadius: 3, transition: 'width 0.3s' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <i className="fa fa-cloud-arrow-up" style={{ fontSize: 28, color: 'var(--text3)', marginBottom: 6 }}></i>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
                  Click or drag photos & videos here
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
                  JPG, PNG, HEIC, MP4, MOV — Up to 50MB each
                </div>
              </>
            )}
          </div>

          {/* Media Thumbnails */}
          {mediaItems.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: 8,
              marginBottom: 14,
            }}>
              {mediaItems.map((item, i) => (
                <div key={i} style={{
                  position: 'relative',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  background: '#000',
                  aspectRatio: '1',
                }}>
                  {isImage(item.type || item.url || item.name) ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : isVideo(item.type || item.url || item.name) ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)' }}>
                      <i className="fa fa-video" style={{ fontSize: 24, color: 'var(--or1)' }}></i>
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)' }}>
                      <i className="fa fa-file" style={{ fontSize: 24, color: 'var(--text3)' }}></i>
                    </div>
                  )}
                  {/* File name */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    padding: '16px 6px 4px', fontSize: 9, color: '#fff',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {item.name}
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteMedia(i); }}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      background: 'rgba(220,38,38,.85)', color: '#fff',
                      border: 'none', borderRadius: '50%',
                      width: 22, height: 22, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10,
                    }}
                    title="Delete"
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid3">
            <div className="fg"><label>Status</label><select name="v_stat" value={formData.v_stat} onChange={handleChange}><option>Pending</option><option>Done</option><option>Approved</option><option>Rejected</option><option>Hold</option></select></div>
            <div className="fg"><label>Next Follow-Up Date <span style={{color:"var(--or1)",fontSize:"10px"}}>📅 PFU ma auto-set</span></label><input type="date" name="v_nextfu" value={formData.v_nextfu} onChange={handleChange} /></div>
            <div className="fg"><label>Remarks</label><input name="v_rem" value={formData.v_rem} onChange={handleChange} placeholder="Notes" /></div>
          </div>
        </div>
        <div className="m-foot">
          <button className="btn btn-out" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-or" onClick={handleSave} disabled={saving || uploading}>
            {saving ? <><i className="fa fa-spinner fa-spin"></i> Saving…</> : <><i className="fa fa-save"></i> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
};
