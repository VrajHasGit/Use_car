import React, { useState, useEffect } from 'react';
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
    if (r.stage && r.stage !== 'Follow-Up') return false;
    const q = search.toLowerCase();
    return !search || (r.sellerName || r.pf_sname || '').toLowerCase().includes(q) || (r.regNo || r.pf_veh || '').toLowerCase().includes(q) || (r.mobile || r.pf_smob || '').includes(q);
  });

  // Auto-fix missing IDs
  useEffect(() => {
    let fixed = false;
    const fixIds = async () => {
      for (const r of records) {
        if (!r.pfuId) {
          const cnt = await getNextCounter('pfu');
          await updateRecord('pfu', r.id, { pfuId: genId('PFU', cnt) });
          fixed = true;
        }
      }
      if (fixed) refresh('pfu');
    };
    if (records.length > 0) fixIds();
  }, [records]);

  const handleSave = async (formData) => {
    try {
      let recId = editRec ? editRec.id : null;
      if (editRec) { 
        await updateRecord('pfu', editRec.id, formData); 
        showToast('Updated!'); 
      } else { 
        const cnt = await getNextCounter('pfu'); 
        recId = await addRecord('pfu', { ...formData, pfuId: genId('PFU', cnt), date: formData.date || today() }); 
        showToast('Follow-up added!'); 
      }

      const isWon = formData.pf_stat === 'Closed-Won';
      const isLost = formData.pf_stat === 'Closed-Lost';

      if (isWon) {
        const exists = data.pcl?.find(p => p.inqId === formData.pf_inqid);
        if (!exists && formData.pf_inqid) {
          const cnt = await getNextCounter('pcl');
          await addRecord('pcl', {
             pclId: genId('PCL', cnt),
             inqId: formData.pf_inqid,
             sellerName: formData.pf_sname || '',
             mobile: formData.pf_smob || '',
             make: formData.pf_veh ? formData.pf_veh.split(' ')[0] : '',
             model: formData.pf_veh ? formData.pf_veh.split(' ').slice(1).join(' ') : '',
             year: formData.pf_year || '',
             fuel: formData.pf_fuel || '',
             km: formData.pf_km || '',
             owners: formData.pf_own || '',
             agreedPrice: formData.pf_close || formData.pf_nego || '',
             status: 'New'
          });
        }
        const inqRec = data.pur_inq?.find(i => i.inqId === formData.pf_inqid);
        if (inqRec) await updateRecord('pur_inq', inqRec.id, { status: 'Closed-Won' });
      } else if (isLost) {
        const inqRec = data.pur_inq?.find(i => i.inqId === formData.pf_inqid);
        if (inqRec) await deleteRecord('pur_inq', inqRec.id);
        if (recId) await deleteRecord('pfu', recId);
      }

      await refresh('pfu');
      if (isWon) await refresh('pcl');
      if (isLost || isWon) await refresh('pur_inq');
      setIsModalOpen(false);
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
  };

  const handleDelete = async (rec) => {
    if (!window.confirm('Delete?')) return;
    try { await deleteRecord('pfu', rec.id); await refresh('pfu'); showToast('Deleted.', 'info'); }
    catch (e) { showToast('Delete failed.', 'error'); }
  };

  const handleWhatsApp = (rec) => {
    const msg = encodeURIComponent(`Hello ${rec.sellerName || rec.pf_sname}, following up on your ${rec.make || rec.pf_veh}. — Carecay`);
    window.open(`https://wa.me/91${rec.mobile || rec.pf_smob}?text=${msg}`, '_blank');
  };

  const handleSendToCloser = async (rec) => {
    if (!window.confirm('Send this inquiry to closer?')) return;
    try {
      await updateRecord('pfu', rec.id, { pf_stat: 'Closed-Won' });
      const inqRec = data.pur_inq?.find(i => i.inqId === rec.pf_inqid);
      if (inqRec) await updateRecord('pur_inq', inqRec.id, { status: 'Closed-Won' });
      
      const exists = data.pcl?.find(p => p.inqId === rec.pf_inqid);
      if (!exists && rec.pf_inqid) {
        const cnt = await getNextCounter('pcl');
        await addRecord('pcl', {
           pclId: genId('PCL', cnt),
           inqId: rec.pf_inqid,
           sellerName: rec.sellerName || rec.pf_sname || '',
           mobile: rec.mobile || rec.pf_smob || '',
           make: rec.make || (rec.pf_veh ? rec.pf_veh.split(' ')[0] : ''),
           model: rec.model || (rec.pf_veh ? rec.pf_veh.split(' ').slice(1).join(' ') : ''),
           year: rec.year || rec.pf_year || '',
           fuel: rec.fuel || rec.pf_fuel || '',
           km: rec.km || rec.pf_km || '',
           owners: rec.owners || rec.pf_own || '',
           agreedPrice: rec.pf_close || rec.pf_nego || '',
           status: 'New'
        });
      }
      showToast('Sent to Closer!');
      await refresh('pfu');
      await refresh('pcl');
      await refresh('pur_inq');
    } catch (e) {
      showToast('Failed to send to closer.', 'error');
    }
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
        <div className="tc-hdr"><div className="tc-title">Purchase Follow-Ups <span style={{ background: 'var(--or1)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>{filtered.length}</span></div></div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>ID</th><th>Inq ID</th><th>Date</th><th>Seller</th><th>Mobile</th><th>Vehicle</th><th>Status</th><th>Next F/U</th><th>Notes</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--or1)', fontFamily: "'Space Grotesk',sans-serif" }}>{r.pfuId || r.id?.slice(0, 12)}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text2)' }}>{r.pf_inqid || '—'}</td>
                  <td>{fmtDate(r.date || r.pf_date)}</td>
                  <td style={{ fontWeight: 600 }}>{r.sellerName || r.pf_sname}</td>
                  <td><a href={`tel:${r.mobile || r.pf_smob}`} style={{ color: 'var(--info)', textDecoration: 'none' }}>{r.mobile || r.pf_smob}</a></td>
                  <td>{r.make || r.pf_veh} {r.model}</td>
                  <td><span className={`badge ${statusBadge(r.status || r.pf_stat)}`}>{r.status || r.pf_stat}</span></td>
                  <td>{r.nextFU || r.pf_nfd ? fmtDate(r.nextFU || r.pf_nfd) : '—'}</td>
                  <td>{r.notes || r.pf_rem || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 6 }}>
                      <button className="btn-icon bi-edit" title="Edit" onClick={() => { setEditRec(r); setIsModalOpen(true); }}><i className="fa fa-pen"></i></button>
                      <button className="btn-icon bi-view" title="Send to Closer" onClick={() => handleSendToCloser(r)}><i className="fa fa-handshake"></i></button>
                      {(r.mobile || r.pf_smob) && <button className="btn-icon" title="WhatsApp" onClick={() => handleWhatsApp(r)} style={{ background: '#25D366', color: '#fff' }}><i className="fa-brands fa-whatsapp"></i></button>}
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
