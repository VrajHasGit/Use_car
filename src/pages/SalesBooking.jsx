import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge } from '../utils/helpers';
import { SobModal } from '../components/modals/SobModal';

const SalesBooking = () => {
  const { data, refresh } = useData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const records = data.sob || [];
  const filtered = records.filter(r => !search || (r.buyerName||'').toLowerCase().includes(search.toLowerCase()) || (r.regNo||'').toLowerCase().includes(search.toLowerCase()));
  const handleSave = async (fd) => {
    try {
      if (editRec) { await updateRecord('sob', editRec.id, fd); showToast('Updated!'); }
      else { const cnt = await getNextCounter('sob'); await addRecord('sob', {...fd, sobId: genId('SOB', cnt), date: fd.date||today()}); showToast('Sales booking added!'); }
      await refresh('sob'); setIsModalOpen(false);
    } catch(e) { showToast('Failed: '+e.message, 'error'); }
  };
  const handleDelete = async (rec) => { if (!window.confirm('Delete?')) return; try { await deleteRecord('sob', rec.id); await refresh('sob'); showToast('Deleted.', 'info'); } catch(e) { showToast('Delete failed.', 'error'); } };
  return (
    <div className="page on" id="pg_sal_booking">
      {toast && <div className="toast-wrap"><div className={`toast ${toast.type==='success'?'suc':'err'}`} style={{display:'flex'}}><span style={{flex:1}}>{toast.msg}</span><button onClick={()=>setToast(null)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div></div>}
      <div className="ph">
        <div className="ph-left"><h1><div className="ph-icon"><i className="fa fa-clipboard-list"></i></div>Sales Order Booking</h1><p>Sales order booking and SOB management</p></div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)} />
          <button className="btn btn-or" onClick={()=>{setEditRec(null);setIsModalOpen(true);}}><i className="fa fa-plus"></i> Add Booking</button>
        </div>
      </div>
      {isModalOpen && <SobModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onSave={handleSave} editData={editRec} />}
      <div className="tc">
        <div className="tc-hdr"><div className="tc-title">Sales Order Bookings <span style={{background:'var(--bl5)',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,marginLeft:8}}>{filtered.length}</span></div></div>
        <div className="tbl-wrap">
          <table id="tbl_sob">
            <thead><tr><th>SOB ID</th><th>Inq ID</th><th>Date</th><th>Buyer</th><th>Reg No.</th><th>Vehicle</th><th>Sale Price</th><th>Advance</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight:700,color:'var(--bl5)',fontFamily:"'Space Grotesk',sans-serif"}}>{r.sobId||r.id?.slice(0,12)}</td>
                  <td style={{fontWeight:600,color:'var(--text2)'}}>{r.sob_inqid||'—'}</td>
                  <td>{fmtDate(r.date)}</td><td style={{fontWeight:600}}>{r.buyerName}</td>
                  <td style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>{r.regNo}</td>
                  <td>{r.make} {r.model}</td>
                  <td style={{color:'var(--success)',fontWeight:700}}>{fmt(r.sp)}</td>
                  <td className="amt-or">{fmt(r.advance)}</td>
                  <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                  <td><div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <button className="btn-icon bi-edit" title="Edit" onClick={()=>{setEditRec(r);setIsModalOpen(true);}}><i className="fa fa-pen"></i></button>
                    <button className="btn-icon bi-print" title="Print" onClick={()=>window.print()}><i className="fa fa-print"></i></button>
                    <button className="btn-icon bi-del" title="Delete" onClick={()=>handleDelete(r)}><i className="fa fa-trash"></i></button>
                  </div></td>
                </tr>
              )) : <tr><td colSpan="9" className="empty"><i className="fa fa-clipboard-list"></i><br />{search?'No results found':'No sales bookings yet.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default SalesBooking;
