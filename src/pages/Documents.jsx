import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge } from '../utils/helpers';
import { DocModal } from '../components/modals/DocModal';
import { WsModal } from '../components/modals/WsModal';
import { StkModal } from '../components/modals/StkModal';

const Documents = () => {
  const { data, refresh } = useData();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const records = data['doc'] || [];
  const filtered = records.filter(r => {
    if (r.stage && (r.stage === 'Workshop' || r.stage === 'Stock')) return false;
    return !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase());
  });
  const handleSave = async (fd) => {
    try {
      const actor = { id: currentUser?.id, name: currentUser?.name || 'Admin', role: currentUser?.role || 'Admin' };
      let savedId;
      if (editRec) { 
        await updateRecord('doc', editRec.id, fd, { title: 'Documents Updated', message: (fd.dc_regn || fd.regNo || '') + ' — ' + (fd.dc_cname || ''), link: '/documents', actor }); 
        showToast('Updated!'); 
        savedId = editRec.id || editRec.docId;
      } else { 
        const cnt = await getNextCounter('DOC'); 
        savedId = genId('DOC', cnt);
        await addRecord('doc', {...fd, docId: savedId, date: fd.date||today()}, { title: 'Documents Added', message: (fd.dc_regn || fd.regNo || '') + ' — ' + (fd.dc_cname || ''), link: '/documents', actor }); 
        showToast('Documents record added!'); 
      }
      await refresh('doc'); 
      setIsModalOpen(false);

      if (fd.dc_stat === 'Complete' && (!editRec || editRec.dc_stat !== 'Complete')) {
        setTimeout(() => setQuickModal({ type: 'stk', docId: savedId }), 100);
      }
    } catch(e) { showToast('Failed: '+e.message, 'error'); }
  };
  const handleDelete = async (rec) => { if (!window.confirm('Delete?')) return; try { await deleteRecord('doc', rec.id); await refresh('doc'); showToast('Deleted.', 'info'); } catch(e) { showToast('Delete failed.', 'error'); } };
  
  const [quickModal, setQuickModal] = useState({ type: null, docId: null });
  const closeQuickModal = () => setQuickModal({ type: null, docId: null });

  const markShifted = async (targetStage, recId) => {
    const rec = data.doc.find(r => r.id === recId || r.docId === recId);
    if (rec) {
      try {
        await updateRecord('doc', rec.id, { stage: targetStage });
        await refresh('doc');
        showToast(`Shifted to ${targetStage}`);
        closeQuickModal();
      } catch (e) {
        showToast('Failed to shift', 'error');
      }
    }
  };
  return (
    <div className="page on" id="pg_documents">
      {toast && <div className="toast-wrap"><div className={`toast ${toast.type==='success'?'suc':'err'}`} style={{display:'flex'}}><span style={{flex:1}}>{toast.msg}</span><button onClick={()=>setToast(null)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}>✕</button></div></div>}
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon" style={{background: '#3B82F6', color: '#fff'}}><i className="fa fa-folder"></i></div>
            DOCUMENTS
          </h1>
          <p style={{textTransform: 'uppercase'}}>RC · INSURANCE · PUC · PAN · AADHAAR · FORM 29/30/28/35 · NOC · GST</p>
        </div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)} />
          <button className="btn" style={{background: '#3B82F6', color: '#fff'}} onClick={()=>{setEditRec(null);setIsModalOpen(true);}}>
            <i className="fa fa-plus"></i> Add Document
          </button>
        </div>
      </div>
      {isModalOpen && <DocModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onSave={handleSave} editData={editRec} />}
      <WsModal isOpen={quickModal.type === 'ws'} onClose={closeQuickModal} onSuccess={() => markShifted('Workshop', quickModal.docId)} quickDocId={quickModal.docId} />
      <StkModal isOpen={quickModal.type === 'stk'} onClose={closeQuickModal} onSuccess={() => markShifted('Stock', quickModal.docId)} quickDocId={quickModal.docId} />
      <div className="tc">
        <div className="tc-hdr"><div className="tc-title">Documents <span style={{background:'var(--info)',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,marginLeft:8}}>{filtered.length}</span></div></div>
        <div className="tbl-wrap">
          {filtered.length === 0 ? (
            <div className="empty" style={{padding:48}}>
              <i className="fa fa-file-contract" style={{fontSize:36,color:'var(--border2)',display:'block',marginBottom:12}}></i>
              <div style={{fontSize:14,fontWeight:600,color:'var(--text2)',marginBottom:8}}>No records yet</div>
              <div style={{fontSize:12,color:'var(--text3)'}}>Click "Add Record" to create your first Documents entry.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>DOC ID</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>BOOKING ID</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>REG NO.</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>DATE</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>RC</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>INSURANCE</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>PUC</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>PAN</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>AADHAAR</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>FRM 29</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>FRM 30</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>NOC BANK</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>SPARE KEY</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>STATUS</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>VERIFIED BY</th>
                  <th style={{textTransform:'uppercase',fontSize:10,color:'var(--text3)'}}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>{filtered.map(r => {
                const hasMissing = !r.dc_rc || !r.dc_ins || !r.dc_noc || !r.dc_f29 || !r.dc_f30;
                return (
                <tr key={r.id} style={hasMissing ? { backgroundColor: '#FEF2F2' } : {}}>
                  <td style={{fontWeight:500,color:'var(--text)',fontFamily:"'Inter',sans-serif"}}>{r.docId||r.id?.slice(0,12)}</td>
                  <td>{r.dc_obid||'—'}</td>
                  <td style={{fontWeight:600}}>{r.dc_regn||'—'}</td>
                  <td>{r.dc_date||fmtDate(r.date)}</td>
                  <td style={{color: r.dc_rc ? '#10B981' : '#EF4444', fontWeight: 600}}>{r.dc_rc ? '✅' : '❌'}</td>
                  <td style={{color: r.dc_ins ? '#10B981' : '#EF4444', fontWeight: 600}}>{r.dc_ins ? '✅' : '❌'}</td>
                  <td style={{color: r.dc_puc ? '#10B981' : '#EF4444', fontWeight: 600}}>{r.dc_puc ? '✅' : '❌'}</td>
                  <td style={{color: r.dc_pan ? '#10B981' : '#EF4444', fontWeight: 600}}>{r.dc_pan ? '✅' : '❌'}</td>
                  <td style={{color: r.dc_adh ? '#10B981' : '#EF4444', fontWeight: 600}}>{r.dc_adh ? '✅' : '❌'}</td>
                  <td style={{color: r.dc_f29 ? '#10B981' : '#EF4444', fontWeight: 600}}>{r.dc_f29 ? '✅' : '❌'}</td>
                  <td style={{color: r.dc_f30 ? '#10B981' : '#EF4444', fontWeight: 600}}>{r.dc_f30 ? '✅' : '❌'}</td>
                  <td style={{color: r.dc_noc ? '#10B981' : '#EF4444', fontWeight: 600}}>{r.dc_noc ? '✅' : '❌ NOC'}</td>
                  <td style={{color: r.dc_key ? '#10B981' : '#EF4444', fontWeight: 600}}>{r.dc_key ? '✅' : '❌'}</td>
                  <td>
                    <div style={{color: r.dc_stat?.toUpperCase() === 'COMPLETE' ? '#10B981' : '#D97706', fontSize: 10, fontWeight: 700, textTransform: 'uppercase'}}>{r.dc_stat||'INCOMPLETE'}</div>
                    {hasMissing && <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#DC2626', marginTop: 4 }}>⚠️ DOCS MISSING</div>}
                  </td>
                  <td>{r.dc_verby||'-'}</td>
                  <td><div style={{display: 'flex', flexDirection: 'row', gap: 4, width: 'max-content'}}>
                    <button className="btn-icon bi-edit" title="Edit" onClick={()=>{setEditRec(r);setIsModalOpen(true);}} style={{background:'rgba(59,130,246,.1)',color:'#3B82F6',padding:6}}><i className="fa fa-pen" style={{fontSize:10}}></i></button>
                    <button className="btn-icon bi-next" title="Send to Stock" onClick={()=>setQuickModal({ type: 'stk', docId: r.docId || r.id })} style={{background:'rgba(245,158,11,.1)',color:'#F59E0B',padding:6}}><i className="fa fa-car" style={{fontSize:10}}></i></button>
                    <button className="btn-icon bi-del" title="Delete" onClick={()=>handleDelete(r)} style={{background:'rgba(239,68,68,.1)',color:'#EF4444',padding:6}}><i className="fa fa-trash" style={{fontSize:10}}></i></button>
                  </div></td>
                </tr>
              );
              })}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
export default Documents;
