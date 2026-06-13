import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge } from '../utils/helpers';
import { WsModal } from '../components/modals/WsModal';

const Workshop = () => {
  const { data, refresh } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const records = data.ws || [];
  const filtered = records.filter(r => {
    const matchSearch = !search || (r.regNo||'').toLowerCase().includes(search.toLowerCase()) || (r.make||'').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.jStat === statusFilter;
    return matchSearch && matchStatus;
  });
  const handleSave = async (fd) => {
    try {
      if (editRec) { await updateRecord('ws', editRec.id, fd); showToast('Updated!'); }
      else { const cnt = await getNextCounter('ws'); await addRecord('ws', {...fd, wsId: genId('WS', cnt), date: fd.date||today()}); showToast('Workshop job added!'); }
      await refresh('ws'); setIsModalOpen(false);
    } catch(e) { showToast('Failed: '+e.message, 'error'); }
  };
  const handleDelete = async (rec) => { if (!window.confirm('Delete?')) return; try { await deleteRecord('ws', rec.id); await refresh('ws'); showToast('Deleted.', 'info'); } catch(e) { showToast('Delete failed.', 'error'); } };
  return (
    <div className="page on" id="pg_workshop">
      {toast && <div className="toast-wrap"><div className={`toast ${toast.type==='success'?'suc':'err'}`} style={{display:'flex'}}><span style={{flex:1}}>{toast.msg}</span><button onClick={()=>setToast(null)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div></div>}
      <div className="ph">
        <div className="ph-left"><h1><div className="ph-icon"><i className="fa fa-screwdriver-wrench"></i></div>Workshop / Refurb</h1><p>Vehicle workshop jobs and refurbishment tracking</p></div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search reg / make…" value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="flt" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Open">Open</option><option value="In Process">In Process</option><option value="Complete">Complete</option>
          </select>
          <button className="btn btn-or" onClick={()=>{setEditRec(null);setIsModalOpen(true);}}><i className="fa fa-plus"></i> Add Job</button>
        </div>
      </div>
      {isModalOpen && <WsModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onSave={handleSave} editData={editRec} />}
      <div className="tc">
        <div className="tc-hdr">
          <div className="tc-title">Workshop Jobs <span style={{background:'var(--warn)',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,marginLeft:8}}>{records.filter(r=>r.jStat==='Open'||r.jStat==='In Process').length} Active</span></div>
          <div className="tc-acts" style={{fontSize:11,color:'var(--text3)',display:'flex',gap:12}}>
            <span>Open: <b style={{color:'var(--danger)'}}>{records.filter(r=>r.jStat==='Open').length}</b></span>
            <span>In Process: <b style={{color:'var(--warn)'}}>{records.filter(r=>r.jStat==='In Process').length}</b></span>
            <span>Done: <b style={{color:'var(--success)'}}>{records.filter(r=>r.jStat==='Complete').length}</b></span>
          </div>
        </div>
        <div className="tbl-wrap">
          <table id="tbl_ws">
            <thead><tr><th>Job ID</th><th>Date</th><th>Reg No.</th><th>Vehicle</th><th>Job Type</th><th>Total Cost</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight:700,color:'var(--warn)',fontFamily:"'Space Grotesk',sans-serif"}}>{r.wsId||r.id?.slice(0,12)}</td>
                  <td>{fmtDate(r.date)}</td>
                  <td style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,color:'var(--or1)'}}>{r.regNo}</td>
                  <td>{r.make} {r.model}</td>
                  <td>{r.jobType||'—'}</td>
                  <td className="amt-or">{fmt(r.total)}</td>
                  <td><span className={`badge ${r.jStat==='Open'?'b-open':r.jStat==='In Process'?'b-prog':'b-complete'}`}>{r.jStat}</span></td>
                  <td>{r.notes||'—'}</td>
                  <td><div style={{display:'flex',gap:4}}>
                    <button className="btn-icon bi-edit" title="Edit" onClick={()=>{setEditRec(r);setIsModalOpen(true);}}><i className="fa fa-pen"></i></button>
                    <button className="btn-icon bi-del" title="Delete" onClick={()=>handleDelete(r)}><i className="fa fa-trash"></i></button>
                  </div></td>
                </tr>
              )) : <tr><td colSpan="9" className="empty"><i className="fa fa-screwdriver-wrench"></i><br />{search||statusFilter?'No results found':'No workshop jobs yet.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Workshop;
