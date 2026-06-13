import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge } from '../utils/helpers';

const EmpPerf = () => {
  const { data, refresh } = useData();
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const showToast = (msg, type='success') => { setToast({msg, type}); setTimeout(() => setToast(null), 3500); };

  const records = data['users'] || [];
  const filtered = records.filter(r => !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page on" id="pg_empperf">
      {toast && <div className="toast-wrap"><div className={`toast ${toast.type==='success'?'suc':'err'}`} style={{display:'flex'}}><span style={{flex:1}}>{toast.msg}</span><button onClick={()=>setToast(null)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div></div>}
      <div className="ph">
        <div className="ph-left">
          <h1><div className="ph-icon"><i className="fa fa-chart-line"></i></div>Employee Performance</h1>
          <p>Track employee performance metrics</p>
        </div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>
      <div className="tc">
        <div className="tc-hdr">
          <div className="tc-title">Employee Performance
            <span style={{background:'var(--or1)',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,marginLeft:8}}>{records.length}</span>
          </div>
        </div>
        <div className="tbl-wrap">
          {filtered.length === 0 ? (
            <div className="empty" style={{padding:48}}>
              <i className="fa fa-chart-line" style={{fontSize:36,color:'var(--border2)',display:'block',marginBottom:12}}></i>
              <div style={{fontSize:14,fontWeight:600,color:'var(--text2)',marginBottom:8}}>No records yet</div>
              <div style={{fontSize:12,color:'var(--text3)'}}>Records will appear here as they are added.</div>
            </div>
          ) : (
            <table>
              <thead><tr><th>ID</th><th>Details</th></tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}><td style={{fontWeight:700,color:'var(--or1)',fontFamily:"'Space Grotesk',sans-serif"}}>{r.id?.slice(0,12)}</td><td>{JSON.stringify(r).slice(0,80)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmpPerf;
