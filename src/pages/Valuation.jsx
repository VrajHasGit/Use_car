import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge } from '../utils/helpers';
import { ValModal } from '../components/modals/ValModal';
import { PfuModal } from '../components/modals/PfuModal';

const Valuation = () => {
  const { data, refresh } = useData();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickModal, setQuickModal] = useState({ type: null, inqId: null });
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const records = data.val || [];
  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return !search || (r.sellerName || '').toLowerCase().includes(q) || (r.make || '').toLowerCase().includes(q) || (r.regNo || '').toLowerCase().includes(q);
  });

  const handleSave = async (formData) => {
    try {
      if (editRec) {
        await updateRecord('val', editRec.id, formData);
        showToast('Valuation updated!');
      } else {
        const cnt = await getNextCounter('val');
        await addRecord('val', { ...formData, valId: genId('VAL', cnt), date: formData.date || today() });
        showToast('Valuation added!');
      }
      await refresh('val');
      setIsModalOpen(false);
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
  };

  const handleDelete = async (rec) => {
    if (!window.confirm(`Delete valuation?`)) return;
    try { await deleteRecord('val', rec.id); await refresh('val'); showToast('Deleted.', 'info'); }
    catch (e) { showToast('Delete failed.', 'error'); }
  };

  const valToFU = (r) => {
    if (r.v_inqid) {
      setQuickModal({ type: 'pfu', inqId: r.v_inqid });
    } else {
      showToast('No linked inquiry found.', 'warn');
    }
  };

  const showAIPrice = (r) => {
    alert(`AI Price Suggestion for ${r.make || ''} ${r.model || ''}:\nEstimated Value: ₹${fmt(parseFloat(r.expectedPrice || 0) * 0.85)}`);
  };

  const closeQuickModal = () => setQuickModal({ type: null, inqId: null });

  return (
    <div className="page on" id="pg_valuation">
      {toast && <div className="toast-wrap"><div className={`toast ${toast.type === 'success' ? 'suc' : toast.type === 'error' ? 'err' : 'inf'}`} style={{ display: 'flex' }}><span style={{ flex: 1 }}>{toast.msg}</span><button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button></div></div>}
      <div className="ph">
        <div className="ph-left">
          <h1><div className="ph-icon"><i className="fa fa-magnifying-glass-dollar"></i></div>Valuation</h1>
          <p>Vehicle valuation & price assessment</p>
        </div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-or" onClick={() => { setEditRec(null); setIsModalOpen(true); }}><i className="fa fa-plus"></i> Add Valuation</button>
        </div>
      </div>
      
      {isModalOpen && <ValModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editData={editRec} />}
      <PfuModal isOpen={quickModal.type === 'pfu'} onClose={closeQuickModal} quickInqId={quickModal.inqId} />

      <div className="tc">
        <div className="tc-hdr"><div className="tc-title">Valuation Records <span style={{ background: 'var(--or1)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>{records.length}</span></div></div>
        <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Val ID</th><th>Date</th><th>Seller</th><th>Vehicle</th><th>Expected Price</th><th>Our Price</th><th>Remarks</th><th style={{ minWidth: 160 }}>Actions</th></tr></thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--or1)', fontFamily: "'Space Grotesk',sans-serif" }}>{r.valId || r.id?.slice(0, 12)}</td>
                  <td>{fmtDate(r.date)}</td>
                  <td style={{ fontWeight: 600 }}>{r.sellerName}</td>
                  <td>{r.make} {r.model} ({r.year})</td>
                  <td className="amt-or">{fmt(r.expectedPrice)}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 700 }}>{fmt(r.ourPrice)}</td>
                  <td>{r.remarks || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button className="btn-icon bi-edit" title="Edit" onClick={() => { setEditRec(r); setIsModalOpen(true); }}><i className="fa fa-pen"></i></button>
                      <button className="btn-icon bi-next" onClick={() => valToFU(r)} title="Follow-Up"><i className="fa fa-phone"></i></button>
                      <button className="btn-icon" style={{ background: 'rgba(124,58,237,.12)', color: '#7C3AED' }} onClick={() => showAIPrice(r)} title="AI Price Suggestion"><i className="fa fa-robot"></i></button>
                      <button className="btn-icon bi-del" title="Delete" onClick={() => handleDelete(r)}><i className="fa fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="empty"><i className="fa fa-magnifying-glass-dollar"></i><br />{search ? 'No results found' : 'No valuation records yet.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Valuation;
