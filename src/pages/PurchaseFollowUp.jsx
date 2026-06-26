import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge } from '../utils/helpers';
import { PfuModal } from '../components/modals/PfuModal';
import { AIPriceModal } from '../components/modals/AIPriceModal';
import { MarketPricingModal } from '../components/modals/MarketPricingModal';
import MediaViewer from '../components/MediaViewer';
import { loadMediaFromFirestore } from '../utils/uploadMedia';

const PurchaseFollowUp = () => {
  const { data, refresh } = useData();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const [aiRec, setAiRec] = useState(null);
  const [marketRec, setMarketRec] = useState(null);
  const [viewer, setViewer] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const records = data.pfu || [];
  const filtered = records.filter(r => {
    if (r.stage && r.stage !== 'Follow-Up') return false;
    if (r.pf_stat === 'Closed-Won' || r.status === 'Closed-Won') return false;
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
      const actor = { id: currentUser?.id, name: currentUser?.name || 'Admin', role: currentUser?.role || 'Admin' };
      const sellerName = formData.pf_sname || formData.sellerName || '';
      if (editRec) { 
        await updateRecord('pfu', editRec.id, formData, {
          title: 'Follow-Up Updated', message: `${sellerName} — ${formData.pf_veh || ''}`,
          link: '/purchase-follow', actor,
        }); 
        showToast('Updated!'); 
      } else { 
        const cnt = await getNextCounter('pfu'); 
        recId = await addRecord('pfu', { ...formData, pfuId: genId('PFU', cnt), date: formData.date || today() }, {
          title: 'New Follow-Up', message: `${sellerName} — ${formData.pf_veh || ''}`,
          link: '/purchase-follow', actor,
        }); 
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

  const showAIPrice = (r) => {
    const valRec = data.val?.find(v => v.v_inqid === r.pf_inqid) || {};
    setAiRec({ ...r, ...valRec });
  };
  const handleSaveAI = async ({ aiSuggestion }) => {
    if (!aiRec?.id) return;
    await updateRecord('pfu', aiRec.id, { aiSuggestion });
    await refresh('pfu');
    showToast('AI suggestion saved to record! ✅');
  };

  const showMarketPrice = (r) => setMarketRec(r);

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
      showToast('Market records generated and saved.');
    } catch (e) {
      showToast('Error getting market data.', 'error');
    }
  };

  const openViewer = async (valRec) => {
    if (!valRec?.id) {
      showToast('No photos found.', 'info');
      return;
    }
    try {
      const subMedia = await loadMediaFromFirestore('val', valRec.id);
      const directMedia = Array.isArray(valRec.v_media) ? valRec.v_media : [];
      const allMedia = [...subMedia, ...directMedia.filter(m => m.url)];
      
      if (allMedia.length > 0) {
        setViewer({ media: allMedia, index: 0 });
      } else {
        showToast('No photos found.', 'info');
      }
    } catch (e) {
      showToast('Failed to load media', 'error');
    }
  };

  const handleVerifyDocs = async (rec) => {
    if (!window.confirm('Send this inquiry to verify documents?')) return;
    try {
      await updateRecord('pfu', rec.id, { pf_stat: 'Closed-Won' });
      const inqRec = data.pur_inq?.find(i => i.inqId === rec.pf_inqid);
      if (inqRec) await updateRecord('pur_inq', inqRec.id, { status: 'Closed-Won' });
      
      const exists = data.doc?.find(d => d.dc_obid === rec.pf_inqid || d.inqId === rec.pf_inqid);
      if (!exists && rec.pf_inqid) {
        await addRecord('doc', {
           inqId: rec.pf_inqid,
           dc_obid: rec.pf_inqid,
           dc_cname: rec.sellerName || rec.pf_sname || '',
           dc_regn: rec.regNo || '',
           dc_carinfo: (rec.make || (rec.pf_veh ? rec.pf_veh.split(' ')[0] : '')) + ' ' + (rec.model || (rec.pf_veh ? rec.pf_veh.split(' ').slice(1).join(' ') : '')),
           dc_date: new Date().toISOString().split('T')[0],
           dc_stat: 'Pending'
        });
      }
      showToast('Sent to Documents!');
      await refresh('pfu');
      await refresh('doc');
      await refresh('pur_inq');
    } catch (e) {
      showToast('Failed to send to documents.', 'error');
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
      {isModalOpen && <PfuModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editData={editRec} onSendToCloser={handleSendToCloser} />}
      <AIPriceModal isOpen={!!aiRec} onClose={() => setAiRec(null)} record={aiRec} onSavePrice={handleSaveAI} />
      <MarketPricingModal isOpen={!!marketRec} onClose={() => setMarketRec(null)} record={marketRec} />
      
      <div className="tc">
        <div className="tc-hdr"><div className="tc-title">Purchase Follow-Ups <span style={{ background: 'var(--or1)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>{filtered.length}</span></div></div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Inquiry</th><th>Date</th><th>Seller / Mobile</th><th>Vehicle Make & Model</th><th>Media</th><th>Status</th><th>Offer ₹</th><th>Difference ₹</th><th>Executive</th><th>Next F/U</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => {
                const lastFu = (r.followUps && r.followUps.length > 0) ? r.followUps[r.followUps.length - 1] : r;
                return (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text2)', fontSize: 12 }}>{r.pf_inqid || '—'}</td>
                  <td>{fmtDate(lastFu.date || lastFu.pf_date)}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.sellerName || r.pf_sname}</div>
                    <a href={`tel:${r.mobile || r.pf_smob}`} style={{ color: 'var(--info)', textDecoration: 'none', fontSize: 12 }}>{r.mobile || r.pf_smob}</a>
                  </td>
                  <td>{r.make || r.pf_veh} <span style={{ fontSize: 12, color: 'var(--text2)' }}>{r.model || r.pf_model}</span></td>
                  <td>
                    {(() => {
                      const valRec = data.val?.find(v => v.v_inqid === r.pf_inqid);
                      const mediaCount = valRec ? (valRec.v_media_count || (valRec.v_media || []).length) : 0;
                      if (mediaCount > 0) {
                        return (
                          <span className="media-badge media-badge-has" onClick={() => openViewer(valRec)} title={`View ${mediaCount} file${mediaCount > 1 ? 's' : ''}`}>
                            <i className="fa fa-images"></i> {mediaCount}
                          </span>
                        );
                      }
                      return <span className="media-badge media-badge-none"><i className="fa fa-image" style={{ opacity: 0.5 }}></i> 0</span>;
                    })()}
                  </td>
                  <td><span className={`badge ${statusBadge(lastFu.stat || lastFu.status || lastFu.pf_stat)}`}>{lastFu.stat || lastFu.status || lastFu.pf_stat}</span></td>
                  <td style={{ fontWeight: 600 }}>{lastFu.offer ? `₹${Number(lastFu.offer).toLocaleString()}` : '—'}</td>
                  <td style={{ fontWeight: 600, color: (Number(lastFu.offer || 0) - Number(lastFu.exp || 0)) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {lastFu.offer && lastFu.exp ? `₹${(Number(lastFu.offer) - Number(lastFu.exp)).toLocaleString()}` : '—'}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text2)' }}>{lastFu.exec || '—'}</td>
                  <td>{lastFu.nfd || lastFu.nextFU || lastFu.pf_nfd ? fmtDate(lastFu.nfd || lastFu.nextFU || lastFu.pf_nfd) : '—'}</td>
                  <td>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      <button className="btn-icon bi-edit" title="Edit" onClick={() => { setEditRec(r); setIsModalOpen(true); }}><i className="fa fa-pen"></i></button>
                      <button className="btn-icon bi-next" title="Verify Documents" onClick={() => handleVerifyDocs(r)} disabled={(lastFu.stat || lastFu.status || lastFu.pf_stat) !== 'Closed-Won'} style={{ background: 'rgba(16,185,129,.1)', color: '#10B981', opacity: (lastFu.stat || lastFu.status || lastFu.pf_stat) !== 'Closed-Won' ? 0.3 : 1, cursor: (lastFu.stat || lastFu.status || lastFu.pf_stat) !== 'Closed-Won' ? 'not-allowed' : 'pointer' }}><i className="fa fa-file-contract"></i></button>
                      <button className="btn-icon" style={{ background: 'rgba(124,58,237,.12)', color: '#7C3AED' }} onClick={() => showAIPrice(r)} title="AI Price Suggestion"><i className="fa fa-robot"></i></button>
                      <button className="btn-icon" style={{ background: 'rgba(59,130,246,.12)', color: '#3B82F6' }} onClick={() => showMarketPrice(r)} title="Market Pricing Data"><i className="fa fa-globe"></i></button>
                      {(r.mobile || r.pf_smob) && <button className="btn-icon" title="WhatsApp" onClick={() => handleWhatsApp(r)} style={{ background: '#25D366', color: '#fff' }}><i className="fa-brands fa-whatsapp"></i></button>}
                      <button className="btn-icon bi-del" title="Delete" onClick={() => handleDelete(r)}><i className="fa fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              )}) : (
                <tr><td colSpan="11" className="empty"><i className="fa fa-phone-volume"></i><br />{search ? 'No results found' : 'No follow-up records yet.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {viewer && (
        <MediaViewer
          media={viewer.media}
          index={viewer.index}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
};

export default PurchaseFollowUp;
