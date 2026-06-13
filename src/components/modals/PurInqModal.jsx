import React, { useState, useEffect } from 'react';
import { today } from '../../utils/helpers';

const MAKES = [
  'Maruti Suzuki', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Mahindra', 'Kia',
  'Renault', 'Nissan', 'Ford', 'Volkswagen', 'Skoda', 'MG', 'Jeep', 'Datsun',
  'Chevrolet', 'Fiat', 'Mitsubishi', 'BMW', 'Mercedes-Benz', 'Audi', 'Volvo',
  'Jaguar', 'Land Rover', 'Other'
];

const MODELS = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'Alto', 'Alto K10', 'Wagon R', 'Ertiga', 'Brezza', 'Dzire', 'Celerio', 'Ignis', 'S-Cross', 'Ciaz', 'XL6', 'Grand Vitara', 'Fronx', 'Jimny'],
  'Hyundai': ['i20', 'i10', 'Creta', 'Venue', 'Verna', 'Aura', 'Santro', 'Tucson', 'Alcazar', 'Exter'],
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Punch', 'Tiago', 'Tigor', 'Altroz', 'Hexa'],
  'Honda': ['City', 'Amaze', 'WR-V', 'Jazz', 'HR-V', 'Elevate'],
  'Toyota': ['Innova', 'Fortuner', 'Glanza', 'Urban Cruiser', 'Camry', 'Vellfire', 'Hyryder'],
  'Mahindra': ['XUV700', 'XUV300', 'Thar', 'Scorpio', 'Bolero', 'Bolero Neo', 'BE6E', 'Marazzo'],
  'Kia': ['Seltos', 'Sonet', 'Carnival', 'Carens'],
};

const YEARS = Array.from({ length: 2025 - 2000 + 1 }, (_, i) => String(2025 - i));
const CITIES = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Nadiad', 'Mehsana', 'Other'];

const INIT = {
  source: 'Walk-in', nameSource: '', date: today(),
  sellerName: '', mobile: '', altMobile: '', email: '', city: '', state: 'Gujarat', address: '',
  make: '', model: '', variant: '', year: '', regYear: '', fuel: 'Petrol', trans: 'Manual',
  color: 'White', km: '', owners: '1st', regNo: '', rto: '', insurance: '', loanBank: '', loan: 'No',
  assigned: 'Ritesh Shah', status: 'New', nextFU: '', updatedBy: '', remarks: ''
};

export const PurInqModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState(INIT);
  const [saving, setSaving] = useState(false);
  const [models, setModels] = useState([]);

  useEffect(() => {
    if (editData) {
      setFormData({ ...INIT, ...editData });
      setModels(MODELS[editData.make] || []);
    } else {
      setFormData({ ...INIT, date: today() });
      setModels([]);
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const set = (field, val) => setFormData(p => ({ ...p, [field]: val }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const handleMakeChange = (e) => {
    const make = e.target.value;
    set('make', make);
    setModels(MODELS[make] || []);
    set('model', '');
  };

  const handleSave = async () => {
    if (!formData.sellerName.trim()) return alert('Seller Name is required.');
    if (!formData.make) return alert('Vehicle Make is required.');
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay on" id="m_pur_inq">
      <div className="mbox">
        <div className="m-hdr">
          <div className="m-hdr-icon">🚗</div>
          <h3>{editData ? 'Edit Purchase Inquiry' : 'New Purchase Inquiry'}</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">
          {/* Inquiry Details */}
          <div className="sect-lbl"><i className="fa fa-circle-info"></i> Inquiry Details</div>
          <div className="grid3">
            <div className="fg">
              <label>Inquiry Source *</label>
              <select name="source" value={formData.source} onChange={handleChange}>
                <option>Walk-in</option><option>Call</option><option>Online</option>
                <option>Reference</option><option>Dealer/Partner</option><option>OLX</option>
                <option>CarDekho</option><option>Cars24</option><option>WhatsApp</option>
              </select>
            </div>
            <div className="fg">
              <label>Name Source (Partner)</label>
              <select name="nameSource" value={formData.nameSource} onChange={handleChange}>
                <option value="">-- Select --</option>
                <option>Rajan Desai</option><option>Ritesh Shah</option><option>Kalpesh Joshi</option>
                <option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option><option>Other</option>
              </select>
            </div>
            <div className="fg">
              <label>Inquiry Date *</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} />
            </div>
          </div>

          {/* Seller Details */}
          <div className="sect-lbl"><i className="fa fa-user"></i> Seller Details</div>
          <div className="grid3">
            <div className="fg">
              <label>Seller Name *</label>
              <input name="sellerName" value={formData.sellerName} onChange={handleChange} placeholder="Full name" />
            </div>
            <div className="fg">
              <label>Mobile *</label>
              <input name="mobile" value={formData.mobile} onChange={handleChange} placeholder="10 digit" type="tel" maxLength="10" />
            </div>
            <div className="fg">
              <label>Alt Mobile</label>
              <input name="altMobile" value={formData.altMobile} onChange={handleChange} placeholder="Optional" type="tel" maxLength="10" />
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Email</label>
              <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="email@example.com" />
            </div>
            <div className="fg">
              <label>City</label>
              <select name="city" value={formData.city} onChange={handleChange}>
                <option value="">Select City</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>State</label>
              <input name="state" value={formData.state} readOnly
                style={{ background: 'rgba(16,185,129,.08)', borderColor: 'var(--success)', color: 'var(--success)', fontWeight: 600 }} />
            </div>
          </div>
          <div className="grid1">
            <div className="fg">
              <label>Address</label>
              <input name="address" value={formData.address} onChange={handleChange} placeholder="Full address" />
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="sect-lbl"><i className="fa fa-car"></i> Vehicle Details</div>
          <div className="grid3">
            <div className="fg">
              <label>Vehicle Make *</label>
              <select name="make" value={formData.make} onChange={handleMakeChange}>
                <option value="">Select Brand</option>
                {MAKES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Vehicle Model *</label>
              <select name="model" value={formData.model} onChange={handleChange}>
                <option value="">Select Model</option>
                {models.map(m => <option key={m}>{m}</option>)}
                {!MODELS[formData.make] && formData.make && <option value={formData.model}>{formData.model}</option>}
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="fg">
              <label>Variant</label>
              <input name="variant" value={formData.variant} onChange={handleChange} placeholder="VXI / ZXI / SX" />
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Mfg Year</label>
              <select name="year" value={formData.year} onChange={handleChange}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Reg Year</label>
              <select name="regYear" value={formData.regYear} onChange={handleChange}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Fuel Type</label>
              <select name="fuel" value={formData.fuel} onChange={handleChange}>
                <option>Petrol</option><option>Diesel</option><option>CNG</option>
                <option>Electric</option><option>Hybrid</option><option>Petrol+CNG</option>
              </select>
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Transmission</label>
              <select name="trans" value={formData.trans} onChange={handleChange}>
                <option>Manual</option><option>Automatic</option><option>AMT</option><option>CVT</option><option>DCT</option>
              </select>
            </div>
            <div className="fg">
              <label>Color</label>
              <select name="color" value={formData.color} onChange={handleChange}>
                <option>White</option><option>Silver</option><option>Grey</option><option>Black</option>
                <option>Red</option><option>Blue</option><option>Brown</option><option>Orange</option>
                <option>Yellow</option><option>Green</option><option>Other</option>
              </select>
            </div>
            <div className="fg">
              <label>KM Driven</label>
              <input name="km" value={formData.km} onChange={handleChange} type="number" placeholder="45000" />
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Owners</label>
              <select name="owners" value={formData.owners} onChange={handleChange}>
                <option>1st</option><option>2nd</option><option>3rd</option><option>4th+</option>
              </select>
            </div>
            <div className="fg">
              <label>Reg Number</label>
              <input name="regNo" value={formData.regNo} onChange={handleChange} placeholder="GJ-01-AB-1234" />
            </div>
            <div className="fg">
              <label>RTO State</label>
              <input name="rto" value={formData.rto} onChange={handleChange} placeholder="Gujarat" />
            </div>
          </div>
          <div className="grid3">
            <div className="fg">
              <label>Insurance Valid Till</label>
              <input type="date" name="insurance" value={formData.insurance} onChange={handleChange} />
            </div>
            <div className="fg">
              <label>Loan Bank</label>
              <input name="loanBank" value={formData.loanBank} onChange={handleChange} placeholder="Bank name" />
            </div>
            <div className="fg">
              <label>Loan Outstanding</label>
              <select name="loan" value={formData.loan} onChange={handleChange}>
                <option>No</option><option>Yes</option>
              </select>
            </div>
          </div>

          {/* Assignment */}
          <div className="sect-lbl"><i className="fa fa-list-check"></i> Assignment & Status</div>
          <div className="grid3">
            <div className="fg">
              <label>Assigned To *</label>
              <select name="assigned" value={formData.assigned} onChange={handleChange}>
                <option>Ritesh Shah</option><option>Rajan Desai</option><option>Kalpesh Joshi</option>
                <option>Marut Dandawala</option><option>Isha Dashraniya</option><option>Pinal Desai</option>
                <option>Mittal Mehta</option><option>Amisha Dave</option><option>Dipti</option><option>Admin</option>
              </select>
            </div>
            <div className="fg">
              <label>Status *</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option>New</option><option>In-Progress</option><option>Closed-Won</option>
                <option>Closed-Lost</option><option>Hold</option>
              </select>
            </div>
            <div className="fg">
              <label>Next Follow-Up Date</label>
              <input type="date" name="nextFU" value={formData.nextFU} onChange={handleChange} />
            </div>
          </div>
          <div className="grid2">
            <div className="fg">
              <label>Updated By</label>
              <input name="updatedBy" value={formData.updatedBy} onChange={handleChange} placeholder="User name" />
            </div>
            <div className="fg">
              <label>Remarks</label>
              <input name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Notes" />
            </div>
          </div>
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
