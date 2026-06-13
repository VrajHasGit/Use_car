import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge } from '../utils/helpers';
import { ObModal } from '../components/modals/ObModal';

const PurchaseBooking = () => {
  const { data, refresh } = useData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const records = data.ob || [];
  const filtered = records.filter(r => !search || (r.sellerName || '').toLowerCase().includes(search.toLowerCase()) || (r.regNo || '').toLowerCase().includes(search.toLowerCase()));

  const handleSave = async (formData) => {
    try {
      if (editRec) { await updateRecord('ob', editRec.id, formData); showToast('Updated!'); }
      else { const cnt = await getNextCounter('ob'); await addRecord('ob', { ...formData, obId: genId('OB', cnt), date: formData.date || today() }); showToast('Order booking added!'); }
      await refresh('ob'); setIsModalOpen(false);
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
  };

  const handleDelete = async (rec) => {
    if (!window.confirm('Delete this booking?')) return;
    try { await deleteRecord('ob', rec.id); await refresh('ob'); showToast('Deleted.', 'info'); } catch (e) { showToast('Delete failed.', 'error'); }
  };

  return (
    <div className="page on" id="pg_pur_booking">
      {toast && <div className="toast-wrap"><div className={`toast ${toast.type === 'success' ? 'suc' : 'err'}`} style={{ display: 'flex' }}><span style={{ flex: 1 }}>{toast.msg}</span><button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button></div></div>}
      <div className="ph">
        <div className="ph-left"><h1><div className="ph-icon"><i className="fa fa-file-pen"></i></div>Order Booking</h1><p>Purchase order bookings and confirmations</p></div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-or" onClick={() => { setEditRec(null); setIsModalOpen(true); }}><i className="fa fa-plus"></i> Add Booking</button>
        </div>
      </div>
      {isModalOpen && <ObModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editData={editRec} />}
      <div className="tc">
        <div className="tc-hdr"><div className="tc-title">Order Bookings <span style={{ background: 'var(--or1)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>{records.length}</span></div></div>
        <div className="tbl-wrap">
          <table id="tbl_ob">
            <thead><tr><th>Booking ID</th><th>Date</th><th>Seller</th><th>Reg No.</th><th>Vehicle</th><th>Purchase Price</th><th>TCP</th><th>Branch</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--or1)', fontFamily: "'Space Grotesk',sans-serif" }}>{r.obId || r.id?.slice(0, 12)}</td>
                  <td>{fmtDate(r.date)}</td>
                  <td style={{ fontWeight: 600 }}>{r.sellerName}</td>
                  <td style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700 }}>{r.regNo}</td>
                  <td>{r.make} {r.model}</td>
                  <td className="amt-or">{fmt(r.pp)}</td>
                  <td className="amt-or">{fmt(r.tcp)}</td>
                  <td>{r.branch || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button className="btn-icon bi-edit" title="Edit" onClick={() => { setEditRec(r); setIsModalOpen(true); }}><i className="fa fa-pen"></i></button>
                      <button className="btn-icon bi-print" title="Print" onClick={() => window.print()}><i className="fa fa-print"></i></button>
                      <button className="btn-icon bi-del" title="Delete" onClick={() => handleDelete(r)}><i className="fa fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="9" className="empty"><i className="fa fa-file-pen"></i><br />{search ? 'No results found' : 'No order bookings yet.'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="tc-foot"><span className="pg-info">Showing {filtered.length} of {records.length} bookings</span></div>
      </div>
    </div>
  );
};

export default PurchaseBooking;
