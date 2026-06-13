import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const VtModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'vt'), { ...formData, createdAt: new Date().toISOString() });
      alert('Record saved successfully!');
      onClose();
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_vt">
 <div className="mbox" style={{"maxWidth":"600px"}}>
  <div className="m-hdr"><div className="m-hdr-icon">🕐</div><h3 id="vt_title">Vehicle History Timeline</h3><button className="m-close" onClick={onClose} >✕</button></div>
  <div id="vt_body" className="vt-wrap"></div>
 </div>
</div>
  );
};
