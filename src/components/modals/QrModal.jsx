import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const QrModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'qr'), { ...formData, createdAt: new Date().toISOString() });
      alert('Record saved successfully!');
      onClose();
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_qr">
 <div className="mbox" style={{"maxWidth":"400px"}}>
  <div className="m-hdr"><div className="m-hdr-icon">📱</div><h3 id="qr_title">Vehicle QR Code</h3><button className="m-close" onClick={onClose} >✕</button></div>
  <div className="m-body" style={{"textAlign":"center","padding":"28px"}}>
   <canvas id="qr_canvas" width="200" height="200" className="qr-canvas" style={{"maxWidth":"100%"}}></canvas>
   <div id="qr_info" style={{"marginTop":"14px","fontSize":"12px","color":"var(--text2)"}}></div>
   <div style={{"marginTop":"16px","display":"flex","gap":"8px","justifyContent":"center"}}>
    <button className="btn btn-or" onClick={handleSave} ><i className="fa fa-download"></i> Download QR</button>
    <button className="btn btn-out" ><i className="fa fa-print"></i> Print</button>
   </div>
  </div>
 </div>
</div>
  );
};
