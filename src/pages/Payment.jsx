import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge } from '../utils/helpers';
import { PayModal } from '../components/modals/PayModal';

const Payment = () => {
  const { data, refresh } = useData();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const records = data.pay || [];
  const filtered = records.filter(r => {
    const matchSearch = !search || (r.name||'').toLowerCase().includes(search.toLowerCase()) || (r.regNo||'').toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || r.type === typeFilter;
    return matchSearch && matchType;
  });
  const totalIn = records.filter(r=>r.type==='Purchase').reduce((a,r)=>a+(r.amount||0),0);
  const totalOut = records.filter(r=>r.type==='Sale').reduce((a,r)=>a+(r.amount||0),0);
  const handleSave = async (fd) => {
    try {
      if (editRec) { await updateRecord('pay', editRec.id, fd); showToast('Updated!'); }
      else { const cnt = await getNextCounter('pay'); await addRecord('pay', {...fd, payId: genId('PAY', cnt), date: fd.date||today()}); showToast('Payment added!'); }
      await refresh('pay'); setIsModalOpen(false);
    } catch(e) { showToast('Failed: '+e.message, 'error'); }
  };
  const handleDelete = async (rec) => { if (!window.confirm('Delete?')) return; try { await deleteRecord('pay', rec.id); await refresh('pay'); showToast('Deleted.', 'info'); } catch(e) { showToast('Delete failed.', 'error'); } };
  return (
    <div className="page on" id="pg_payment">
      {toast && <div className="toast-wrap"><div className={`toast ${toast.type==='success'?'suc':'err'}`} style={{display:'flex'}}><span style={{flex:1}}>{toast.msg}</span><button onClick={()=>setToast(null)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div></div>}
      <div className="ph">
        <div className="ph-left"><h1><div className="ph-icon"><i className="fa fa-credit-card"></i></div>Payment</h1><p>Purchase and sale payment tracking</p></div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search name / reg…" value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="flt" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
            <option value="">All Types</option><option value="Purchase">Purchase</option><option value="Sale">Sale</option>
          </select>
          <button className="btn btn-or" onClick={()=>{setEditRec(null);setIsModalOpen(true);}}><i className="fa fa-plus"></i> Add Payment</button>
        </div>
      </div>
      {isModalOpen && <PayModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onSave={handleSave} editData={editRec} />}

      {/* Summary cards */}
      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(3,1fr)',marginBottom:16}}>
        <div className="kpi" style={{background:'linear-gradient(135deg,#059669,#10B981)',border:'none'}}>
          <div className="kpi-icon" style={{color:'rgba(255,255,255,.8)'}}><i className="fa fa-sack-dollar"></i></div>
          <div className="kpi-val" style={{color:'#fff'}}>{fmt(totalOut)}</div>
          <div className="kpi-lbl" style={{color:'rgba(255,255,255,.75)'}}>Sale Receipts</div>
        </div>
        <div className="kpi" style={{background:'linear-gradient(135deg,#D97706,#F59E0B)',border:'none'}}>
          <div className="kpi-icon" style={{color:'rgba(255,255,255,.8)'}}><i className="fa fa-money-bill-wave"></i></div>
          <div className="kpi-val" style={{color:'#fff'}}>{fmt(totalIn)}</div>
          <div className="kpi-lbl" style={{color:'rgba(255,255,255,.75)'}}>Purchase Payments</div>
        </div>
        <div className="kpi" style={{background:'linear-gradient(135deg,#1A56DB,#2563EB)',border:'none'}}>
          <div className="kpi-icon" style={{color:'rgba(255,255,255,.8)'}}><i className="fa fa-credit-card"></i></div>
          <div className="kpi-val" style={{color:'#fff'}}>{records.length}</div>
          <div className="kpi-lbl" style={{color:'rgba(255,255,255,.75)'}}>Total Transactions</div>
        </div>
      </div>

      <div className="tc">
        <div className="tc-hdr"><div className="tc-title">Payments <span style={{background:'var(--or1)',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,marginLeft:8}}>{records.length}</span></div></div>
        <div className="tbl-wrap">
          <table id="tbl_pay">
            <thead><tr><th>Pay ID</th><th>Date</th><th>Name</th><th>Reg No.</th><th>Type</th><th>Mode</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight:700,color:'var(--or1)',fontFamily:"'Space Grotesk',sans-serif"}}>{r.payId||r.id?.slice(0,12)}</td>
                  <td>{fmtDate(r.date)}</td><td style={{fontWeight:600}}>{r.name}</td>
                  <td style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>{r.regNo||'—'}</td>
                  <td>{r.type}</td><td>{r.mode||'—'}</td>
                  <td style={{fontWeight:700,color:r.type==='Sale'?'var(--success)':'var(--warn)'}}>{fmt(r.amount)}</td>
                  <td><span className={`badge ${statusBadge(r.status)}`}>{r.status||'—'}</span></td>
                  <td><div style={{display:'flex',gap:4}}>
                    <button className="btn-icon bi-edit" title="Edit" onClick={()=>{setEditRec(r);setIsModalOpen(true);}}><i className="fa fa-pen"></i></button>
                    <button className="btn-icon bi-del" title="Delete" onClick={()=>handleDelete(r)}><i className="fa fa-trash"></i></button>
                  </div></td>
                </tr>
              )) : <tr><td colSpan="9" className="empty"><i className="fa fa-credit-card"></i><br />{search||typeFilter?'No results found':'No payment records yet.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Payment;
