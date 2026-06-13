import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const UserModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
  "usr_name": "",
  "usr_lid": "",
  "usr_pw": "",
  "usr_role": "",
  "usr_branch": "",
  "usr_mob": "",
  "usr_email": "",
  "usr_stat": ""
});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'user'), { ...formData, createdAt: new Date().toISOString() });
      alert('Record saved successfully!');
      onClose();
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="overlay" id="m_user">
 <div className="mbox" style={{"maxWidth":"600px"}}><div className="m-hdr"><div className="m-hdr-icon">👤</div><h3>Add / Edit User</h3><button className="m-close" onClick={onClose} >✕</button></div>
 <div className="m-body">
  <div className="grid3"><div className="fg"><label>Full Name *</label><input id="usr_name" name="usr_name" value={formData['usr_name'] || ''} onChange={handleChange} placeholder="Employee name" /></div><div className="fg"><label>Login ID *</label><input id="usr_lid" name="usr_lid" value={formData['usr_lid'] || ''} onChange={handleChange} placeholder="rajan.desai" /></div><div className="fg"><label>Password *</label><input type="password" id="usr_pw" name="usr_pw" value={formData['usr_pw'] || ''} onChange={handleChange} placeholder="Set password" /></div></div>
  <div className="grid3"><div className="fg"><label>Role *</label><select id="usr_role" name="usr_role" value={formData['usr_role'] || ''} onChange={handleChange}><option>Admin</option><option>Partner</option><option>Manager</option><option>Closer</option><option>Executive</option><option>Sales</option><option>Valuator</option><option>Workshop</option></select></div><div className="fg"><label>Branch</label><select id="usr_branch" name="usr_branch" value={formData['usr_branch'] || ''} onChange={handleChange}><option>SG Highway</option><option>Vastral</option><option>Head Office</option></select></div><div className="fg"><label>Mobile</label><input type="tel" id="usr_mob" name="usr_mob" value={formData['usr_mob'] || ''} onChange={handleChange} placeholder="10-digit" maxLength="10" /></div></div>
  <div className="grid2"><div className="fg"><label>Email</label><input type="email" id="usr_email" name="usr_email" value={formData['usr_email'] || ''} onChange={handleChange} placeholder="email@example.com" /></div><div className="fg"><label>Status</label><select id="usr_stat" name="usr_stat" value={formData['usr_stat'] || ''} onChange={handleChange}><option>Active</option><option>Inactive</option></select></div></div>
 </div>
 <div className="m-foot"><button className="btn btn-out"  onClick={onClose}>Cancel</button><button className="btn btn-or" onClick={handleSave} ><i className="fa fa-save"></i> Save User</button></div></div>
</div>
  );
};
