import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { addRecord, updateRecord, getNextCounter } from '../../services/db';
import { genId, today } from '../../utils/helpers';

export const DocModal = ({ isOpen, onClose, onSave, onSuccess, editData, quickId }) => {
  const { data } = useData();
  const [formData, setFormData] = useState({
  "dc_obid": "",
  "dc_regn": "",
  "dc_date": "",
  "dc_cname": "",
  "dc_carinfo": "",
  "dc_rc": "",
  "dcu_rc": "",
  "dc_ins": "",
  "dcu_ins": "",
  "dc_puc": "",
  "dcu_puc": "",
  "dc_pan": "",
  "dcu_pan": "",
  "dc_adh": "",
  "dcu_adh": "",
  "dc_f29": "",
  "dcu_f29": "",
  "dc_f30": "",
  "dcu_f30": "",
  "dc_f28": "",
  "dcu_f28": "",
  "dc_f35": "",
  "dcu_f35": "",
  "dc_noc": "",
  "dcu_noc": "",
  "dc_gst": "",
  "dcu_gst": "",
  "dc_svc": "",
  "dcu_svc": "",
  "dc_inv": "",
  "dcu_inv": "",
  "dc_key": "",
  "dcu_key": "",
  "dc_book": "",
  "dcu_book": "",
  "dc_badh": "",
  "dcu_badh": "",
  "dc_bpan": "",
  "dcu_bpan": "",
  "dc_lbill": "",
  "dcu_lbill": "",
  "dc_rent": "",
  "dcu_rent": "",
  "dc_tto": "",
  "dcu_tto": "",
  "dc_bphoto": "",
  "dcu_bphoto": "",
  "dc_stat": "",
  "dc_pucval": "",
  "dc_miss": "",
  "dc_verby": "",
  "dc_verdate": "",
  "dc_rem": ""
});

  useEffect(() => {
    if (editData) {
      setFormData(prev => ({ ...prev, ...editData }));
    }
  }, [editData]);

  useEffect(() => {
    if (isOpen && quickId && !formData.dc_obid && !formData.dc_regn) {
      let obId = null;
      let regNo = null;
      const ob = data.ob?.find(r => r.id === quickId || r.obId === quickId);
      if (ob) { obId = ob.obId || ob.id; regNo = ob.regNo; }
      if (!obId) {
        const pay = data.pay?.find(r => r.id === quickId || r.payId === quickId);
        if (pay) { obId = pay.obId; regNo = pay.regNo; }
      }
      if (!obId) {
        const del = data.del?.find(r => r.id === quickId || r.delId === quickId);
        if (del) { obId = del.obId; regNo = del.regNo; }
      }
      if (obId) setFormData(prev => ({ ...prev, dc_obid: obId }));
      else if (regNo) setFormData(prev => ({ ...prev, dc_regn: regNo }));
    }
  }, [isOpen, quickId, data.ob, data.pay, data.del]);

  useEffect(() => {
    if (formData.dc_obid && formData.dc_obid.length >= 8) {
      const ob = data.ob?.find(r => r.obId === formData.dc_obid || r.id === formData.dc_obid);
      if (ob) {
        setFormData(prev => ({
          ...prev,
          dc_cname: ob.ob_cname || ob.client || prev.dc_cname,
          dc_carinfo: `${ob.ob_mm || ob.mm || ''}${(ob.ob_year || ob.year) ? ' · ' + (ob.ob_year || ob.year) : ''}${(ob.ob_regn || ob.regNo) ? ' · ' + (ob.ob_regn || ob.regNo) : ''}`,
          dc_regn: ob.ob_regn || ob.regNo || prev.dc_regn
        }));
      }
    }
  }, [formData.dc_obid, data.ob]);

  useEffect(() => {
    if (formData.dc_regn && formData.dc_regn.length >= 6) {
      const rn = formData.dc_regn.replace(/\s/g, '').toUpperCase();
      const ob = data.ob?.find(r => (r.ob_regn || r.regNo) && (r.ob_regn || r.regNo).replace(/\s/g, '').toUpperCase() === rn);
      if (ob) {
        setFormData(prev => ({
          ...prev,
          dc_obid: ob.obId || ob.id || prev.dc_obid,
          dc_cname: ob.ob_cname || ob.client || prev.dc_cname,
          dc_carinfo: `${ob.ob_mm || ob.mm || ''}${(ob.ob_year || ob.year) ? ' · ' + (ob.ob_year || ob.year) : ''}${(ob.ob_regn || ob.regNo) ? ' · ' + (ob.ob_regn || ob.regNo) : ''}`
        }));
      } else {
        const stk = data.stk?.find(r => (r.sk_regn || r.regNo) && (r.sk_regn || r.regNo).replace(/\s/g, '').toUpperCase() === rn);
        if (stk) {
          const linkedOB = data.ob?.find(r => (r.ob_regn || r.regNo) && (r.ob_regn || r.regNo).replace(/\s/g, '').toUpperCase() === rn);
          setFormData(prev => ({
            ...prev,
            dc_cname: linkedOB ? (linkedOB.ob_cname || linkedOB.client) : (stk.cust || stk.src || ''),
            dc_carinfo: `${stk.sk_make || stk.make || ''} ${stk.sk_model || stk.model || ''}${(stk.sk_year || stk.year) ? ' · ' + (stk.sk_year || stk.year) : ''}${(stk.sk_regn || stk.regNo) ? ' · ' + (stk.sk_regn || stk.regNo) : ''}`
          }));
        }
      }
    }
  }, [formData.dc_regn, data.ob, data.stk]);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleSave = async () => {
    try {
      if (editData && editData.id) {
        await updateRecord('doc', editData.id, formData);
      } else {
        const cnt = await getNextCounter('doc');
        const docId = genId('DOC', cnt);
        await addRecord('doc', { ...formData, docId, date: formData.dc_date || today() });
      }
      if (onSave) { await onSave(formData); } else if (onSuccess) { onSuccess(); } else { onClose(); }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="overlay" id="m_doc">
 <div className="mbox" style={{"maxWidth":"900px"}}>
  <div className="m-hdr">
   <div className="m-hdr-icon">📄</div>
   <h3>Document Record & File Upload</h3>
   <button className="m-close" onClick={onClose} >✖</button>
  </div>
  <div className="m-body">

   
   <div className="grid3">
    <div className="fg"><label>Order Booking ID <span style={{"color":"var(--or1)","fontSize":"10px"}}>⚡ Auto-Fill</span></label><input id="dc_obid" name="dc_obid" value={formData['dc_obid'] || ''} onChange={handleChange} placeholder="OB-2025-0001"  /></div>
    <div className="fg"><label>Vehicle Reg Number <span style={{"color":"var(--or1)","fontSize":"10px"}}>⚡ Auto-Fill by RegNo</span></label><input id="dc_regn" name="dc_regn" value={formData['dc_regn'] || ''} onChange={handleChange} placeholder="GJ-01-AB-1234"  /></div>
    <div className="fg"><label>Document Date</label><input type="date" id="dc_date" name="dc_date" value={formData['dc_date'] || ''} onChange={handleChange} /></div>
   </div>
   <div className="grid2">
    <div className="fg"><label>Customer Name <span style={{"color":"var(--or1)","fontSize":"10px"}}>⚡ Auto</span></label><input id="dc_cname" name="dc_cname" value={formData['dc_cname'] || ''} onChange={handleChange} placeholder="Auto-fills from OB / Stock" readOnly style={{"background":"var(--surface2)","color":"var(--text2)"}} /></div>
    <div className="fg"><label>Car Details <span style={{"color":"var(--or1)","fontSize":"10px"}}>⚡ Auto</span></label><input id="dc_carinfo" name="dc_carinfo" value={formData['dc_carinfo'] || ''} onChange={handleChange} placeholder="Make · Model · Year" readOnly style={{"background":"var(--surface2)","color":"var(--text2)"}} /></div>
   </div>

   
   <div className="sect-lbl"><i className="fa fa-clipboard-check"></i> Documents — Check &amp; Upload File</div>
   <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"10px","marginBottom":"14px"}}>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_rc" name="dc_rc" checked={!!formData['dc_rc']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>RC Copy</div>
      <div id="dc_rc_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_rc_btn">📎 Upload</button>
     <input type="file" id="dcu_rc" name="dcu_rc" value={formData['dcu_rc'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_ins" name="dc_ins" checked={!!formData['dc_ins']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Insurance Copy</div>
      <div id="dc_ins_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_ins_btn">📎 Upload</button>
     <input type="file" id="dcu_ins" name="dcu_ins" value={formData['dcu_ins'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_puc" name="dc_puc" checked={!!formData['dc_puc']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>PUC Certificate</div>
      <div id="dc_puc_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_puc_btn">📎 Upload</button>
     <input type="file" id="dcu_puc" name="dcu_puc" value={formData['dcu_puc'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_pan" name="dc_pan" checked={!!formData['dc_pan']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Seller PAN Card</div>
      <div id="dc_pan_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_pan_btn">📎 Upload</button>
     <input type="file" id="dcu_pan" name="dcu_pan" value={formData['dcu_pan'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_adh" name="dc_adh" checked={!!formData['dc_adh']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Seller Aadhaar</div>
      <div id="dc_adh_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_adh_btn">📎 Upload</button>
     <input type="file" id="dcu_adh" name="dcu_adh" value={formData['dcu_adh'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_f29" name="dc_f29" checked={!!formData['dc_f29']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Form 29 <span style={{"fontSize":"10px","color":"var(--text3)"}}>(Sale)</span></div>
      <div id="dc_f29_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_f29_btn">📎 Upload</button>
     <input type="file" id="dcu_f29" name="dcu_f29" value={formData['dcu_f29'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_f30" name="dc_f30" checked={!!formData['dc_f30']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Form 30 <span style={{"fontSize":"10px","color":"var(--text3)"}}>(Transfer)</span></div>
      <div id="dc_f30_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_f30_btn">📎 Upload</button>
     <input type="file" id="dcu_f30" name="dcu_f30" value={formData['dcu_f30'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_f28" name="dc_f28" checked={!!formData['dc_f28']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Form 28 <span style={{"fontSize":"10px","color":"var(--text3)"}}>(NOC App)</span></div>
      <div id="dc_f28_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_f28_btn">📎 Upload</button>
     <input type="file" id="dcu_f28" name="dcu_f28" value={formData['dcu_f28'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_f35" name="dc_f35" checked={!!formData['dc_f35']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Form 35 <span style={{"fontSize":"10px","color":"var(--text3)"}}>(Hypothecation)</span></div>
      <div id="dc_f35_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_f35_btn">📎 Upload</button>
     <input type="file" id="dcu_f35" name="dcu_f35" value={formData['dcu_f35'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_noc" name="dc_noc" checked={!!formData['dc_noc']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>NOC from Bank</div>
      <div id="dc_noc_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_noc_btn">📎 Upload</button>
     <input type="file" id="dcu_noc" name="dcu_noc" value={formData['dcu_noc'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_gst" name="dc_gst" checked={!!formData['dc_gst']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>GST Copy</div>
      <div id="dc_gst_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_gst_btn">📎 Upload</button>
     <input type="file" id="dcu_gst" name="dcu_gst" value={formData['dcu_gst'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_svc" name="dc_svc" checked={!!formData['dc_svc']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Service History</div>
      <div id="dc_svc_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_svc_btn">📎 Upload</button>
     <input type="file" id="dcu_svc" name="dcu_svc" value={formData['dcu_svc'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_inv" name="dc_inv" checked={!!formData['dc_inv']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Original Invoice</div>
      <div id="dc_inv_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_inv_btn">📎 Upload</button>
     <input type="file" id="dcu_inv" name="dcu_inv" value={formData['dcu_inv'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_key" name="dc_key" checked={!!formData['dc_key']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Spare Key Photo</div>
      <div id="dc_key_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_key_btn">📎 Upload</button>
     <input type="file" id="dcu_key" name="dcu_key" value={formData['dcu_key'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bg)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_book" name="dc_book" checked={!!formData['dc_book']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--or1)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Manual / Booklet</div>
      <div id="dc_book_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_book_btn">📎 Upload</button>
     <input type="file" id="dcu_book" name="dcu_book" value={formData['dcu_book'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

   </div>

   
   <div className="sect-lbl" style={{"marginTop":"4px"}}><i className="fa fa-rupee-sign"></i> Sale Documents <span style={{"color":"var(--bl5)","fontSize":"9px","marginLeft":"6px"}}>(BUYER KYC + RTO Transfer)</span></div>
   <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"10px","marginBottom":"14px"}}>

    
    <div style={{"background":"var(--bl7)","border":"1px solid rgba(37,99,235,.2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_badh" name="dc_badh" checked={!!formData['dc_badh']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--bl5)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Buyer Aadhaar</div>
      <div id="dc_badh_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(37,99,235,.15)","border":"1px solid rgba(37,99,235,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_badh_btn">📎 Upload</button>
     <input type="file" id="dcu_badh" name="dcu_badh" value={formData['dcu_badh'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bl7)","border":"1px solid rgba(37,99,235,.2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_bpan" name="dc_bpan" checked={!!formData['dc_bpan']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--bl5)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Buyer PAN Card</div>
      <div id="dc_bpan_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(37,99,235,.15)","border":"1px solid rgba(37,99,235,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_bpan_btn">📎 Upload</button>
     <input type="file" id="dcu_bpan" name="dcu_bpan" value={formData['dcu_bpan'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bl7)","border":"1px solid rgba(37,99,235,.2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_lbill" name="dc_lbill" checked={!!formData['dc_lbill']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--bl5)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Light Bill <span style={{"fontSize":"10px","color":"var(--text3)"}}>(Address Proof)</span></div>
      <div id="dc_lbill_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(37,99,235,.15)","border":"1px solid rgba(37,99,235,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_lbill_btn">📎 Upload</button>
     <input type="file" id="dcu_lbill" name="dcu_lbill" value={formData['dcu_lbill'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bl7)","border":"1px solid rgba(37,99,235,.2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_rent" name="dc_rent" checked={!!formData['dc_rent']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--bl5)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Rent Agreement <span style={{"fontSize":"10px","color":"var(--text3)"}}>(If rented)</span></div>
      <div id="dc_rent_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(37,99,235,.15)","border":"1px solid rgba(37,99,235,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_rent_btn">📎 Upload</button>
     <input type="file" id="dcu_rent" name="dcu_rent" value={formData['dcu_rent'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bl7)","border":"1px solid rgba(37,99,235,.2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_tto" name="dc_tto" checked={!!formData['dc_tto']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--bl5)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>TTO <span style={{"fontSize":"10px","color":"var(--text3)"}}>(Transfer of Title / Ownership)</span></div>
      <div id="dc_tto_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(37,99,235,.15)","border":"1px solid rgba(37,99,235,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_tto_btn">📎 Upload</button>
     <input type="file" id="dcu_tto" name="dcu_tto" value={formData['dcu_tto'] || ''} onChange={handleChange} accept="image/*,application/pdf" style={{"display":"none"}}  />
    </div>

    
    <div style={{"background":"var(--bl7)","border":"1px solid rgba(37,99,235,.2)","borderRadius":"var(--radius-sm)","padding":"10px 12px","display":"flex","alignItems":"center","gap":"10px"}}>
     <input type="checkbox" id="dc_bphoto" name="dc_bphoto" checked={!!formData['dc_bphoto']} onChange={handleChange} style={{"width":"16px","height":"16px","accentColor":"var(--bl5)","flexShrink":"0"}}  />
     <div style={{"flex":"1","minWidth":"0"}}>
      <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text)"}}>Buyer Photo</div>
      <div id="dc_bphoto_fname" style={{"fontSize":"10px","color":"var(--text3)","marginTop":"2px","overflow":"hidden","textOverflow":"ellipsis","whiteSpace":"nowrap"}}>No file uploaded</div>
     </div>
     <button  style={{"background":"rgba(37,99,235,.15)","border":"1px solid rgba(37,99,235,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0"}} id="dc_bphoto_btn">📎 Upload</button>
     <input type="file" id="dcu_bphoto" name="dcu_bphoto" value={formData['dcu_bphoto'] || ''} onChange={handleChange} accept="image/*" style={{"display":"none"}}  />
    </div>

   </div>

   
   <div id="dc_upload_summary" style={{"background":"var(--surface2)","border":"1px solid var(--border2)","borderRadius":"var(--radius-sm)","padding":"10px 14px","marginBottom":"14px","display":"flex","alignItems":"center","justifyContent":"space-between","flexWrap":"wrap","gap":"8px"}}>
    <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
     <i className="fa fa-circle-info" style={{"color":"var(--bl5)"}}></i>
     <span style={{"fontSize":"12px","color":"var(--text2)"}}>Files uploaded: <b id="dc_file_count" style={{"color":"var(--success)"}}>0</b> / 15</span>
    </div>
    <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
     <span style={{"fontSize":"12px","color":"var(--text2)"}}>Docs checked: <b id="dc_chk_count" style={{"color":"var(--or2)"}}>0</b> / 15</span>
    </div>
   </div>

   
   <div className="grid2">
    <div className="fg"><label>Document Status</label><select id="dc_stat" name="dc_stat" value={formData['dc_stat'] || ''} onChange={handleChange}><option>Complete</option><option>Incomplete</option><option>Pending</option></select></div>
    <div className="fg"><label>PUC Valid Till</label><input type="date" id="dc_pucval" name="dc_pucval" value={formData['dc_pucval'] || ''} onChange={handleChange} /></div>
   </div>
   <div className="grid3">
    <div className="fg"><label>Missing Documents</label><input id="dc_miss" name="dc_miss" value={formData['dc_miss'] || ''} onChange={handleChange} placeholder="List missing docs" /></div>
    <div className="fg"><label>Verified By</label><input id="dc_verby" name="dc_verby" value={formData['dc_verby'] || ''} onChange={handleChange} placeholder="Verifier name" /></div>
    <div className="fg"><label>Verification Date</label><input type="date" id="dc_verdate" name="dc_verdate" value={formData['dc_verdate'] || ''} onChange={handleChange} /></div>
   </div>
   <div className="grid1"><div className="fg"><label>Remarks</label><input id="dc_rem" name="dc_rem" value={formData['dc_rem'] || ''} onChange={handleChange} placeholder="Notes" /></div></div>

  </div>
  <div className="m-foot">
   <button className="btn btn-out"  onClick={onClose}>Cancel</button>
   <button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save Documents</button>
  </div>
 </div>
</div>
  );
};

