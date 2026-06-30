import React, { useState, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { processFiles } from '../../utils/uploadMedia';

export const COMMON_CATEGORIES = [
  'Rent', 'Salary', 'Utilities', 'Marketing', 'Office Supplies', 'Business Insurance',
  'Bank Charges', 'Software / Subscriptions', 'Travel & Conveyance', 'Legal & Professional',
  'Fuel', 'Miscellaneous'
];

export const CAR_CATEGORIES = [
  'Workshop / Repair', 'Spare Parts', 'Detailing / Cleaning', 'RTO / Registration',
  'Vehicle Insurance', 'Transport / Logistics', 'Accessories', 'Penalty / Fine',
  'Parking / Storage', 'Other Car Expense'
];

const BRANCHES = ['SG Highway', 'Vastral', 'Head Office'];
const PAYEES = ['Ritesh Shah', 'Rajan Desai', 'Kalpesh Joshi', 'Marut Dandawala', 'Isha Dashraniya', 'Pinal Desai', 'Mittal Mehta', 'Amisha Dave', 'Dipti', 'Petty Cash'];

const emptyForm = () => ({
  expType: 'Common',
  date: new Date().toISOString().split('T')[0],
  category: '',
  branch: 'SG Highway',
  stkId: '', regNo: '', carMake: '', carModel: '', carYear: '',
  description: '',
  amount: '',
  gstRate: '',
  paidBy: 'Petty Cash',
  payMethod: 'Cash',
  receiptNo: '',
  reference: '',
  notes: '',
  billPhotos: [],
});

export const ExpModal = ({ isOpen, onClose, onSave, editData }) => {
  const { data } = useData();
  const [formData, setFormData] = useState(editData ? { ...emptyForm(), ...editData, billPhotos: editData.billPhotos || [] } : emptyForm());
  const [carQuery, setCarQuery] = useState('');
  const [showCarDropdown, setShowCarDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchType = (type) => {
    if (type === formData.expType) return;
    setFormData(prev => ({
      ...prev,
      expType: type,
      category: '',
      ...(type === 'Common' ? { stkId: '', regNo: '', carMake: '', carModel: '', carYear: '' } : {}),
    }));
    setCarQuery('');
  };

  const stkList = data?.stk || [];
  const filteredCars = (() => {
    if (!carQuery.trim()) return [];
    const q = carQuery.toLowerCase();
    return stkList.filter(s => {
      const regNo = (s.regNo || s.sk_regn || '').toLowerCase();
      const make = (s.make || s.sk_make || '').toLowerCase();
      const model = (s.model || s.sk_model || '').toLowerCase();
      const stkId = (s.stkId || s.id || '').toLowerCase();
      return regNo.includes(q) || make.includes(q) || model.includes(q) || stkId.includes(q);
    }).slice(0, 8);
  })();

  const selectCar = (s) => {
    setFormData(prev => ({
      ...prev,
      stkId: s.stkId || s.id,
      regNo: s.regNo || s.sk_regn || '',
      carMake: s.make || s.sk_make || '',
      carModel: s.model || s.sk_model || '',
      carYear: s.year || s.sk_year || '',
    }));
    setCarQuery('');
    setShowCarDropdown(false);
  };

  const clearCar = () => setFormData(prev => ({ ...prev, stkId: '', regNo: '', carMake: '', carModel: '', carYear: '' }));

  const processIncomingFiles = async (fileList) => {
    if (!fileList?.length) return;
    setUploading(true);
    try {
      const processed = await processFiles(fileList);
      setFormData(prev => ({ ...prev, billPhotos: [...(prev.billPhotos || []), ...processed] }));
    } catch (err) {
      console.error('Bill upload failed:', err);
      alert('Failed to process file(s).');
    }
    setUploading(false);
  };

  const handleBillInput = (e) => { processIncomingFiles(e.target.files); e.target.value = ''; };
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processIncomingFiles(e.dataTransfer.files); };
  const removeBillPhoto = (idx) => setFormData(prev => ({ ...prev, billPhotos: prev.billPhotos.filter((_, i) => i !== idx) }));

  const amt = Number(formData.amount) || 0;
  const gstRate = Number(formData.gstRate) || 0;
  const gstAmount = +(amt * gstRate / 100).toFixed(2);
  const netAmount = +(amt + gstAmount).toFixed(2);

  const isCar = formData.expType === 'Car';
  const categories = isCar ? CAR_CATEGORIES : COMMON_CATEGORIES;

  const handleSaveBtn = async () => {
    if (!formData.amount || !formData.description) return alert('Description and Amount are required.');
    if (!formData.category) return alert('Please select a category.');
    if (isCar && !formData.stkId) return alert('Please select the vehicle this expense belongs to.');
    setSaving(true);
    try {
      if (onSave) await onSave({ ...formData, gstAmount, netAmount });
    } catch (error) {
      console.error('Error saving record: ', error);
      alert('Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const TYPE_CARDS = [
    { key: 'Common', icon: 'fa-building', title: 'Common Expense', sub: 'Business overhead — rent, salary, marketing…' },
    { key: 'Car', icon: 'fa-car', title: 'Car-Specific Expense', sub: 'Tied to one vehicle — repair, RTO, accessories…' },
  ];

  return (
    <div className="overlay on" id="m_exp">
      <div className="mbox" style={{ maxWidth: 760 }}>
        <div className="m-hdr"><div className="m-hdr-icon">🧾</div><h3>{editData ? 'Edit Expense' : 'Add Expense'}</h3><button className="m-close" onClick={onClose}>✕</button></div>
        <div className="m-body">

          {/* ── Expense Type Selector ───────────────────────── */}
          <div className="sect-lbl"><i className="fa fa-layer-group"></i> Expense Type</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {TYPE_CARDS.map(card => {
              const active = formData.expType === card.key;
              return (
                <div key={card.key} onClick={() => switchType(card.key)}
                  style={{
                    cursor: 'pointer', borderRadius: 'var(--radius)', padding: '14px 16px',
                    border: active ? '2px solid var(--or1)' : '1px solid var(--border2)',
                    background: active ? 'rgba(232,93,4,.08)' : 'var(--surface2)',
                    display: 'flex', alignItems: 'center', gap: 12, transition: '.15s',
                  }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    background: active ? 'linear-gradient(135deg,var(--or1),var(--or2))' : 'var(--surface)',
                    color: active ? '#fff' : 'var(--text3)',
                  }}><i className={`fa ${card.icon}`}></i></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--or1)' : 'var(--text)' }}>{card.title}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text3)', marginTop: 2 }}>{card.sub}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: active ? '5px solid var(--or1)' : '2px solid var(--border2)', background: 'var(--surface)' }} />
                </div>
              );
            })}
          </div>

          <div className="grid3">
            <div className="fg"><label>Date *</label><input type="date" name="date" value={formData.date || ''} onChange={handleChange} /></div>
            <div className="fg"><label>Description *</label><input name="description" value={formData.description || ''} onChange={handleChange} placeholder="What was the expense for?" /></div>
            <div className="fg"><label>Amount ₹ *</label><input type="number" name="amount" value={formData.amount || ''} onChange={handleChange} placeholder="0" /></div>
          </div>

          {/* ── Type-specific block ─────────────────────────── */}
          {!isCar ? (
            <div className="grid2">
              <div className="fg"><label>Branch *</label>
                <select name="branch" value={formData.branch || ''} onChange={handleChange}>
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="fg"><label>Category *</label>
                <select name="category" value={formData.category || ''} onChange={handleChange}>
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <>
              <div className="sect-lbl"><i className="fa fa-car"></i> Linked Vehicle</div>
              {formData.stkId ? (
                <div style={{
                  background: 'rgba(232,93,4,.07)', border: '1px solid rgba(232,93,4,.3)', borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <i className="fa fa-car-side" style={{ color: 'var(--or1)', fontSize: 16 }}></i>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{formData.carMake} {formData.carModel} {formData.carYear ? `(${formData.carYear})` : ''}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text3)' }}>{formData.regNo} · {formData.stkId}</div>
                  </div>
                  <button onClick={clearCar} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 13 }} title="Change vehicle"><i className="fa fa-xmark"></i></button>
                </div>
              ) : (
                <div style={{ position: 'relative', marginBottom: 14 }}>
                  <input
                    value={carQuery}
                    onChange={e => { setCarQuery(e.target.value); setShowCarDropdown(true); }}
                    onFocus={() => setShowCarDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCarDropdown(false), 150)}
                    placeholder="Search by Reg No / Stock ID / Make / Model…"
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', padding: '8px 11px', fontFamily: 'inherit', fontSize: 12 }}
                  />
                  {showCarDropdown && carQuery.trim() && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, marginTop: 4,
                      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                      boxShadow: '0 8px 20px rgba(0,0,0,.15)', maxHeight: 220, overflowY: 'auto',
                    }}>
                      {filteredCars.length > 0 ? filteredCars.map(s => (
                        <div key={s.id} onMouseDown={() => selectCar(s)}
                          style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border2)', fontSize: 12 }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ fontWeight: 700, color: 'var(--text)' }}>{s.make || s.sk_make} {s.model || s.sk_model}</div>
                          <div style={{ fontSize: 10.5, color: 'var(--text3)' }}>{s.regNo || s.sk_regn} · {s.stkId || s.id}</div>
                        </div>
                      )) : (
                        <div style={{ padding: '10px 12px', fontSize: 11.5, color: 'var(--text3)', textAlign: 'center' }}>No matching vehicle found.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="grid2">
                <div className="fg"><label>Category *</label>
                  <select name="category" value={formData.category || ''} onChange={handleChange}>
                    <option value="">Select category…</option>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="fg"><label>Branch</label>
                  <select name="branch" value={formData.branch || ''} onChange={handleChange}>
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="sect-lbl"><i className="fa fa-calculator"></i> Tax & Total — AUTO</div>
          <div className="grid3">
            <div className="fg"><label>GST Rate %</label><input type="number" name="gstRate" value={formData.gstRate || ''} onChange={handleChange} placeholder="0" /></div>
            <div className="fg"><label>GST Amount ₹ (AUTO)</label><div className="calc-out">₹ {gstAmount.toLocaleString('en-IN')}</div></div>
            <div className="fg"><label>Net Total ₹ (AUTO)</label><div className="calc-out" style={{ fontWeight: 800, color: 'var(--or1)' }}>₹ {netAmount.toLocaleString('en-IN')}</div></div>
          </div>

          <div className="grid3">
            <div className="fg"><label>Paid By</label>
              <select name="paidBy" value={formData.paidBy || ''} onChange={handleChange}>
                {PAYEES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="fg"><label>Payment Mode</label>
              <select name="payMethod" value={formData.payMethod || ''} onChange={handleChange}>
                <option>Cash</option><option>UPI</option><option>NEFT</option><option>Card</option>
              </select>
            </div>
            <div className="fg"><label>Receipt No.</label><input name="receiptNo" value={formData.receiptNo || ''} onChange={handleChange} placeholder="Bill / voucher number" /></div>
          </div>

          {!isCar && (
            <div className="grid1">
              <div className="fg"><label>Reference / Invoice No.</label><input name="reference" value={formData.reference || ''} onChange={handleChange} placeholder="Vendor invoice / reference number" /></div>
            </div>
          )}

          <div className="grid1">
            <div className="fg"><label>Notes</label><textarea rows={2} name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Additional notes…" /></div>
          </div>

          <div className="sect-lbl"><i className="fa fa-image"></i> Bill / Receipt Photos</div>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? 'var(--or1)' : 'var(--border)'}`, borderRadius: 'var(--radius)',
              padding: 16, textAlign: 'center', cursor: 'pointer', transition: '.2s', marginBottom: 10,
              background: dragOver ? 'rgba(232,93,4,.06)' : 'transparent',
            }}>
            {uploading ? (
              <><i className="car-spinner" style={{ fontSize: 20 }}></i><div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Processing…</div></>
            ) : (
              <>
                <i className="fa fa-cloud-upload-alt" style={{ fontSize: 24, color: 'var(--text3)', display: 'block', marginBottom: 6 }}></i>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Drag & Drop or <b style={{ color: 'var(--or1)' }}>Click to Upload</b> Bill / Receipt Photos</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>JPG, PNG — Multiple files allowed</div>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleBillInput} />
          </div>
          {formData.billPhotos?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
              {formData.billPhotos.map((p, i) => (
                <div key={i} style={{ position: 'relative', width: 70, height: 70, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border2)' }}>
                  <img src={p.url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeBillPhoto(i)} style={{
                    position: 'absolute', top: 2, right: 2, background: 'rgba(220,38,38,.9)', color: '#fff', border: 'none',
                    borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><i className="fa fa-xmark"></i></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="m-foot">
          <button className="btn btn-out" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-or" onClick={handleSaveBtn} disabled={saving || uploading}>
            {saving ? <><i className="car-spinner"></i> Saving…</> : <><i className="fa fa-save"></i> Save Expense</>}
          </button>
        </div>
      </div>
    </div>
  );
};
