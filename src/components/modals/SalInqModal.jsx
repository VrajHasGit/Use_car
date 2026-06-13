import React, { useState, useEffect } from 'react';
import { today } from '../../utils/helpers';

const MAKES = ['Maruti Suzuki','Hyundai','Tata','Honda','Toyota','Mahindra','Kia','Renault','Nissan','Volkswagen','Skoda','MG','Jeep','Other'];
const YEARS = Array.from({ length: 2025 - 2000 + 1 }, (_, i) => String(2025 - i));
const CITIES = ['Ahmedabad','Surat','Vadodara','Rajkot','Gandhinagar','Bhavnagar','Jamnagar','Junagadh','Anand','Nadiad','Mehsana','Other'];

const INIT = {
  source: 'Walk-in', date: today(), branch: 'SG Highway',
  buyerName: '', mobile: '', altMobile: '', email: '', city: '', state: 'Gujarat', address: '',
  budget: '', makePref: '', model: '', fuel: 'Any', trans: 'Any', color: 'Any',
  km: '', yearFrom: '', yearTo: '', assigned: 'Ritesh Shah', status: 'New', nextFU: '', remarks: ''
};

export const SalInqModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState(INIT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) setFormData({ ...INIT, ...editData });
    else setFormData({ ...INIT, date: today() });
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const set = (field, val) => setFormData(p => ({ ...p, [field]: val }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const handleSave = async () => {
    if (!formData.buyerName.trim()) return alert('Buyer Name is required.');
    setSaving(true);
    try { await onSave(formData); } finally { setSaving(false); }
  };

  return (
    <div className="overlay on" id="m_sal_inq">
      <div className="mbox">
        <div className="m-hdr">
          <div className="m-hdr-icon">🏷️</div>
          <h3>{editData ? 'Edit Sales Inquiry' : 'New Sales Inquiry'}</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">
          <div className="grid3">
            <div className="fg"><label>Source *</label>
              <select name="source" value={formData.source} onChange={handleChange}>
                <option>Walk-in</option><option>Call</option><option>Online/OLX</option>
                <option>Reference</option><option>CarDekho</option><option>Cars24</option>
                <option>Social Media</option><option>WhatsApp</option>
              </select>
            </div>
            <div className="fg"><label>Date *</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} />
            </div>
            <div className="fg"><label>Branch</label>
              <select name="branch" value={formData.branch} onChange={handleChange}>
                <option>SG Highway</option><option>Vastral</option><option>Head Office</option>
              </select>
            </div>
          </div>

          <div className="sect-lbl"><i className="fa fa-user"></i> Buyer Details</div>
          <div className="grid3">
            <div className="fg"><label>Buyer Name *</label>
              <input name="buyerName" value={formData.buyerName} onChange={handleChange} placeholder="Full name" />
            </div>
            <div className="fg"><label>Mobile *</label>
              <input name="mobile" value={formData.mobile} onChange={handleChange} type="tel" maxLength="10" placeholder="10 digit" />
            </div>
            <div className="fg"><label>Alt Mobile</label>
              <input name="altMobile" value={formData.altMobile} onChange={handleChange} type="tel" maxLength="10" placeholder="Optional" />
            </div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Email</label>
              <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="email@example.com" />
            </div>
            <div className="fg"><label>City</label>
              <select name="city" value={formData.city} onChange={handleChange}>
                <option value="">Select City</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="fg"><label>State</label>
              <input name="state" value={formData.state} readOnly
                style={{ background: 'rgba(16,185,129,.08)', borderColor: 'var(--success)', color: 'var(--success)', fontWeight: 600 }} />
            </div>
          </div>
          <div className="grid1"><div className="fg"><label>Address</label>
            <input name="address" value={formData.address} onChange={handleChange} placeholder="Full address" />
          </div></div>

          <div className="sect-lbl"><i className="fa fa-car"></i> Vehicle Preference</div>
          <div className="grid3">
            <div className="fg"><label>Budget ₹</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="Max budget" />
            </div>
            <div className="fg"><label>Preferred Make</label>
              <select name="makePref" value={formData.makePref} onChange={handleChange}>
                <option value="">Any Brand</option>
                {MAKES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="fg"><label>Preferred Model</label>
              <input name="model" value={formData.model} onChange={handleChange} placeholder="Any model" />
            </div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Fuel Preference</label>
              <select name="fuel" value={formData.fuel} onChange={handleChange}>
                <option>Any</option><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option>
              </select>
            </div>
            <div className="fg"><label>Transmission</label>
              <select name="trans" value={formData.trans} onChange={handleChange}>
                <option>Any</option><option>Manual</option><option>Automatic</option><option>AMT</option>
              </select>
            </div>
            <div className="fg"><label>Color Preference</label>
              <select name="color" value={formData.color} onChange={handleChange}>
                <option>Any</option><option>White</option><option>Silver</option><option>Black</option><option>Red</option><option>Blue</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid3">
            <div className="fg"><label>Max KM</label>
              <input type="number" name="km" value={formData.km} onChange={handleChange} placeholder="Max KM" />
            </div>
            <div className="fg"><label>Year From</label>
              <select name="yearFrom" value={formData.yearFrom} onChange={handleChange}>
                <option value="">Any</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="fg"><label>Year To</label>
              <select name="yearTo" value={formData.yearTo} onChange={handleChange}>
                <option value="">Any</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="grid3">
            <div className="fg"><label>Assigned To</label>
              <select name="assigned" value={formData.assigned} onChange={handleChange}>
                <option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option>
                <option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option>
                <option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option>
              </select>
            </div>
            <div className="fg"><label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option>New</option><option>In-Progress</option><option>Closed-Won</option><option>Closed-Lost</option><option>Hold</option>
              </select>
            </div>
            <div className="fg"><label>Next Follow-Up Date</label>
              <input type="date" name="nextFU" value={formData.nextFU} onChange={handleChange} />
            </div>
          </div>
          <div className="grid1"><div className="fg"><label>Remarks</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Additional notes…" />
          </div></div>
        </div>
        <div className="m-foot">
          <button className="btn btn-out" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-or" onClick={handleSave} disabled={saving}>
            {saving ? <><i className="fa fa-spinner fa-spin"></i> Saving…</> : <><i className="fa fa-save"></i> Save Inquiry</>}
          </button>
        </div>
      </div>
    </div>
  );
};
