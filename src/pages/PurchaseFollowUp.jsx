import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge } from '../utils/helpers';
import { PfuModal } from '../components/modals/PfuModal';

const PurchaseFollowUp = () => {
  const { data, refresh } = useData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const records = data.pfu || [];
  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return !search || (r.sellerName || '').toLowerCase().includes(q) || (r.regNo || '').toLowerCase().includes(q);
  });

  const handleSave = async (formData) => {
    try {
      if (editRec) { await updateRecord('pfu', editRec.id, formData); showToast('Updated!'); }
      else { const cnt = await getNextCounter('pfu'); await addRecord('pfu', { ...formData, pfuId: genId('PFU', cnt), date: formData.date || today() }); showToast('Follow-up added!'); }
      await refresh('pfu'); setIsModalOpen(false);
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
  };

  const handleDelete = async (rec) => {
    if (!window.confirm('Delete?')) return;
    try { await deleteRecord('pfu', rec.id); await refresh('pfu'); showToast('Deleted.', 'info'); }
    catch (e) { showToast('Delete failed.', 'error'); }
  };

  const handleWhatsApp = (rec) => {
    const msg = encodeURIComponent(`Hello ${rec.sellerName}, following up on your ${rec.make} ${rec.model}. — Carecay`);
    window.open(`https://wa.me/91${rec.mobile}?text=${msg}`, '_blank');
  };

  return (
    <div className="page on" id="pg_pur_follow">
      {toast && <div className="toast-wrap"><div className={`toast ${toast.type === 'success' ? 'suc' : 'err'}`} style={{ display: 'flex' }}><span style={{ flex: 1 }}>{toast.msg}</span><button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button></div></div>}
      <div className="ph">
        <div className="ph-left"><h1><div className="ph-icon"><i className="fa fa-phone-volume"></i></div>Purchase Follow-Up</h1><p>Follow-up on purchase inquiries and seller contacts</p></div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-or" onClick={() => { setEditRec(null); setIsModalOpen(true); }}><i className="fa fa-plus"></i> Add Follow-Up</button>
        </div>
      </div>
      {isModalOpen && <PfuModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editData={editRec} />}
      <div className="tc">
        <div className="tc-hdr"><div className="tc-title">Purchase Follow-Ups <span style={{ background: 'var(--or1)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>{records.length}</span></div></div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>ID</th><th>Date</th><th>Seller</th><th>Mobile</th><th>Vehicle</th><th>Status</th><th>Next F/U</th><th>Notes</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--or1)', fontFamily: "'Space Grotesk',sans-serif" }}>{r.pfuId || r.id?.slice(0, 12)}</td>
                  <td>{fmtDate(r.date)}</td>
                  <td style={{ fontWeight: 600 }}>{r.sellerName}</td>
                  <td><a href={`tel:${r.mobile}`} style={{ color: 'var(--info)', textDecoration: 'none' }}>{r.mobile}</a></td>
                  <td>{r.make} {r.model}</td>
                  <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                  <td>{r.nextFU ? fmtDate(r.nextFU) : '—'}</td>
                  <td>{r.notes || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button className="btn-icon bi-edit" title="Edit" onClick={() => { setEditRec(r); setIsModalOpen(true); }}><i className="fa fa-pen"></i></button>
                      {r.mobile && <button title="WhatsApp" onClick={() => handleWhatsApp(r)} style={{ background: '#25D366', color: '#fff', width: 28, height: 28, borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 11 }}><i className="fa-brands fa-whatsapp"></i></button>}
                      <button className="btn-icon bi-del" title="Delete" onClick={() => handleDelete(r)}><i className="fa fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="9" className="empty"><i className="fa fa-phone-volume"></i><br />{search ? 'No results found' : 'No follow-up records yet.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseFollowUp;
