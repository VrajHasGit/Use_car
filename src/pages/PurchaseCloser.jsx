import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge } from '../utils/helpers';
import { PclModal } from '../components/modals/PclModal';

const PurchaseCloser = () => {
  const { data, refresh } = useData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type='success') => { setToast({msg, type}); setTimeout(() => setToast(null), 3500); };

  const records = data.pcl || [];
  const filtered = records.filter(r => !search || (r.sellerName||'').toLowerCase().includes(search.toLowerCase()) || (r.regNo||'').toLowerCase().includes(search.toLowerCase()));

  const handleSave = async (formData) => {
    try {
      if (editRec) { await updateRecord('pcl', editRec.id, formData); showToast('Updated!'); }
      else { const cnt = await getNextCounter('pcl'); await addRecord('pcl', {...formData, pclId: genId('PCL', cnt), date: formData.date||today()}); showToast('Purchase closer added!'); }
      await refresh('pcl'); setIsModalOpen(false);
    } catch(e) { showToast('Failed: '+e.message, 'error'); }
  };

  const handleDelete = async (rec) => {
    if (!window.confirm('Delete?')) return;
    try { await deleteRecord('pcl', rec.id); await refresh('pcl'); showToast('Deleted.', 'info'); } catch(e) { showToast('Delete failed.', 'error'); }
  };

  return (
    <div className="page on" id="pg_pur_closer">
      {toast && <div className="toast-wrap"><div className={`toast ${toast.type==='success'?'suc':'err'}`} style={{display:'flex'}}><span style={{flex:1}}>{toast.msg}</span><button onClick={()=>setToast(null)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div></div>}
      <div className="ph">
        <div className="ph-left"><h1><div className="ph-icon"><i className="fa fa-handshake"></i></div>Purchase Closer</h1><p>Finalize purchase deals and order confirmations</p></div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)} />
          <button className="btn btn-or" onClick={()=>{setEditRec(null);setIsModalOpen(true);}}><i className="fa fa-plus"></i> Add Record</button>
        </div>
      </div>
      {isModalOpen && <PclModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onSave={handleSave} editData={editRec} />}
      <div className="tc">
        <div className="tc-hdr"><div className="tc-title">Purchase Closer Records <span style={{background:'var(--or1)',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,marginLeft:8}}>{records.length}</span></div></div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>ID</th><th>Date</th><th>Seller</th><th>Vehicle</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight:700,color:'var(--or1)',fontFamily:"'Space Grotesk',sans-serif"}}>{r.pclId||r.id?.slice(0,12)}</td>
                  <td>{fmtDate(r.date)}</td>
                  <td style={{fontWeight:600}}>{r.sellerName}</td>
                  <td>{r.make} {r.model}</td>
                  <td className="amt-or">{fmt(r.amount)}</td>
                  <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                  <td><div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <button className="btn-icon bi-edit" title="Edit" onClick={()=>{setEditRec(r);setIsModalOpen(true);}}><i className="fa fa-pen"></i></button>
                    <button className="btn-icon bi-del" title="Delete" onClick={()=>handleDelete(r)}><i className="fa fa-trash"></i></button>
                  </div></td>
                </tr>
              )) : <tr><td colSpan="7" className="empty"><i className="fa fa-handshake"></i><br />{search?'No results found':'No purchase closer records yet.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseCloser;
