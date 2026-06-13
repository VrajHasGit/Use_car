import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge } from '../utils/helpers';
import { SfuModal } from '../components/modals/SfuModal';

const SalesFollowUp = () => {
  const { data, refresh } = useData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const records = data.sfu || [];
  const filtered = records.filter(r => !search || (r.buyerName||'').toLowerCase().includes(search.toLowerCase()) || (r.mobile||'').includes(search));
  const handleSave = async (fd) => {
    try {
      if (editRec) { await updateRecord('sfu', editRec.id, fd); showToast('Updated!'); }
      else { const cnt = await getNextCounter('sfu'); await addRecord('sfu', {...fd, sfuId: genId('SFU', cnt), date: fd.date||today()}); showToast('Follow-up added!'); }
      await refresh('sfu'); setIsModalOpen(false);
    } catch(e) { showToast('Failed: '+e.message, 'error'); }
  };
  const handleDelete = async (rec) => { if (!window.confirm('Delete?')) return; try { await deleteRecord('sfu', rec.id); await refresh('sfu'); showToast('Deleted.', 'info'); } catch(e) { showToast('Delete failed.', 'error'); } };
  const handleWA = (r) => { const m = encodeURIComponent(`Hello ${r.buyerName}, following up on your car inquiry at Carecay.`); window.open(`https://wa.me/91${r.mobile}?text=${m}`, '_blank'); };
  return (
    <div className="page on" id="pg_sal_follow">
      {toast && <div className="toast-wrap"><div className={`toast ${toast.type==='success'?'suc':'err'}`} style={{display:'flex'}}><span style={{flex:1}}>{toast.msg}</span><button onClick={()=>setToast(null)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div></div>}
      <div className="ph">
        <div className="ph-left"><h1><div className="ph-icon"><i className="fa fa-comments"></i></div>Sales Follow-Up</h1><p>Follow-up on sales inquiries and buyer contacts</p></div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)} />
          <button className="btn btn-or" onClick={()=>{setEditRec(null);setIsModalOpen(true);}}><i className="fa fa-plus"></i> Add Follow-Up</button>
        </div>
      </div>
      {isModalOpen && <SfuModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onSave={handleSave} editData={editRec} />}
      <div className="tc">
        <div className="tc-hdr"><div className="tc-title">Sales Follow-Ups <span style={{background:'var(--bl5)',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,marginLeft:8}}>{records.length}</span></div></div>
        <div className="tbl-wrap">
          <table id="tbl_sfu">
            <thead><tr><th>ID</th><th>Date</th><th>Buyer</th><th>Mobile</th><th>Status</th><th>Next F/U</th><th>Notes</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight:700,color:'var(--bl5)',fontFamily:"'Space Grotesk',sans-serif"}}>{r.sfuId||r.id?.slice(0,12)}</td>
                  <td>{fmtDate(r.date)}</td><td style={{fontWeight:600}}>{r.buyerName}</td>
                  <td><a href={`tel:${r.mobile}`} style={{color:'var(--info)',textDecoration:'none'}}>{r.mobile}</a></td>
                  <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                  <td>{r.nextFU?fmtDate(r.nextFU):'—'}</td><td>{r.notes||'—'}</td>
                  <td><div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <button className="btn-icon bi-edit" title="Edit" onClick={()=>{setEditRec(r);setIsModalOpen(true);}}><i className="fa fa-pen"></i></button>
                    {r.mobile&&<button title="WhatsApp" onClick={()=>handleWA(r)} style={{background:'#25D366',color:'#fff',width:28,height:28,borderRadius:5,border:'none',cursor:'pointer',fontSize:11}}><i className="fa-brands fa-whatsapp"></i></button>}
                    <button className="btn-icon bi-del" title="Delete" onClick={()=>handleDelete(r)}><i className="fa fa-trash"></i></button>
                  </div></td>
                </tr>
              )) : <tr><td colSpan="8" className="empty"><i className="fa fa-comments"></i><br />{search?'No results found':'No follow-up records yet.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default SalesFollowUp;
