import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge } from '../utils/helpers';
import { TestdriveModal } from '../components/modals/TestdriveModal';

const TestDrive = () => {
  const { data, refresh } = useData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const records = data['td'] || [];
  const filtered = records.filter(r => !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
  const handleSave = async (fd) => {
    try {
      if (editRec) { await updateRecord('td', editRec.id, fd); showToast('Updated!'); }
      else { const cnt = await getNextCounter('TD'); await addRecord('td', {...fd, tdId: genId('TD', cnt), date: fd.date||today()}); showToast('Test Drive record added!'); }
      await refresh('td'); setIsModalOpen(false);
    } catch(e) { showToast('Failed: '+e.message, 'error'); }
  };
  const handleDelete = async (rec) => { if (!window.confirm('Delete?')) return; try { await deleteRecord('td', rec.id); await refresh('td'); showToast('Deleted.', 'info'); } catch(e) { showToast('Delete failed.', 'error'); } };
  return (
    <div className="page on" id="pg_testdrive">
      {toast && <div className="toast-wrap"><div className={`toast ${toast.type==='success'?'suc':'err'}`} style={{display:'flex'}}><span style={{flex:1}}>{toast.msg}</span><button onClick={()=>setToast(null)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div></div>}
      <div className="ph">
        <div className="ph-left"><h1><div className="ph-icon"><i className="fa fa-road"></i></div>Test Drive</h1><p>Schedule and manage test drives</p></div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)} />
          <button className="btn btn-or" onClick={()=>{setEditRec(null);setIsModalOpen(true);}}><i className="fa fa-plus"></i> Add Record</button>
        </div>
      </div>
      {isModalOpen && <TestdriveModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onSave={handleSave} editData={editRec} />}
      <div className="tc">
        <div className="tc-hdr"><div className="tc-title">Test Drive <span style={{background:'var(--success)',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,marginLeft:8}}>{records.length}</span></div></div>
        <div className="tbl-wrap">
          {filtered.length === 0 ? (
            <div className="empty" style={{padding:48}}>
              <i className="fa fa-road" style={{fontSize:36,color:'var(--border2)',display:'block',marginBottom:12}}></i>
              <div style={{fontSize:14,fontWeight:600,color:'var(--text2)',marginBottom:8}}>No records yet</div>
              <div style={{fontSize:12,color:'var(--text3)'}}>Click "Add Record" to create your first Test Drive entry.</div>
            </div>
          ) : (
            <table>
              <thead><tr><th>ID</th><th>Date</th><th>Details</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{filtered.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight:700,color:'var(--success)',fontFamily:"'Space Grotesk',sans-serif"}}>{r.tdId||r.id?.slice(0,12)}</td>
                  <td>{fmtDate(r.date)}</td>
                  <td>{r.name||r.buyerName||r.sellerName||r.regNo||'—'}</td>
                  <td><span className={`badge ${statusBadge(r.status)}`}>{r.status||'—'}</span></td>
                  <td><div style={{display:'flex',gap:4}}>
                    <button className="btn-icon bi-edit" title="Edit" onClick={()=>{setEditRec(r);setIsModalOpen(true);}}><i className="fa fa-pen"></i></button>
                    <button className="btn-icon bi-del" title="Delete" onClick={()=>handleDelete(r)}><i className="fa fa-trash"></i></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
export default TestDrive;
