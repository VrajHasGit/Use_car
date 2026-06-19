import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge } from '../utils/helpers';
import { ObModal } from '../components/modals/ObModal';
import { DocModal } from '../components/modals/DocModal';
import { PayModal } from '../components/modals/PayModal';
import { DelModal } from '../components/modals/DelModal';

const PurchaseBooking = () => {
  const { data, refresh } = useData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const records = data.ob || [];
  const filtered = records.filter(r => {
    if (r.stage && r.stage !== 'OrderBooking') return false;
    return !search || (r.sellerName || r.ob_cname || r.ob_bname || '').toLowerCase().includes(search.toLowerCase())
      || (r.regNo || r.ob_regn || r.ob_vnum || '').toLowerCase().includes(search.toLowerCase())
      || (r.obId || '').toLowerCase().includes(search.toLowerCase())
      || (r.ob_inqid || '').toLowerCase().includes(search.toLowerCase());
  });

  // Auto-fix missing IDs
  useEffect(() => {
    let fixed = false;
    const fixIds = async () => {
      for (const r of records) {
        if (!r.obId) {
          const cnt = await getNextCounter('ob');
          await updateRecord('ob', r.id, { obId: genId('OB', cnt) });
          fixed = true;
        }
      }
      if (fixed) refresh('ob');
    };
    if (records.length > 0) fixIds();
  }, [records]);

  const handleSave = async (formData) => {
    try {
      if (editRec) {
        await updateRecord('ob', editRec.id, formData);
        showToast('Updated!');
      } else {
        const cnt = await getNextCounter('ob');
        await addRecord('ob', { ...formData, obId: genId('OB', cnt), date: formData.ob_date || today() });
        showToast('Order booking added!');
      }
      await refresh('ob');
      setIsModalOpen(false);
    } catch (e) {
      showToast('Failed: ' + e.message, 'error');
    }
  };

  const handleDelete = async (rec) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await deleteRecord('ob', rec.id);
      await refresh('ob');
      showToast('Deleted.', 'info');
    } catch (e) {
      showToast('Delete failed.', 'error');
    }
  };

  const [quickModal, setQuickModal] = useState({ type: null, obId: null });
  const closeQuickModal = () => setQuickModal({ type: null, obId: null });

  const markShifted = async (targetStage, recId) => {
    const rec = data.ob.find(r => r.id === recId || r.obId === recId);
    if (rec) {
      try {
        await updateRecord('ob', rec.id, { stage: targetStage });
        await refresh('ob');
        if (targetStage === 'Documents') await refresh('doc');
        if (targetStage === 'Documents') await refresh('doc');
        if (targetStage === 'Payment') await refresh('pay');
        if (targetStage === 'Delivery') await refresh('del');
        showToast(`Shifted to ${targetStage}`);
        closeQuickModal();
      } catch (e) {
        showToast('Failed to shift', 'error');
      }
    }
  };

  const handlePrintRecord = (r) => {
    // Open the modal in edit mode and trigger print
    setEditRec(r);
    setIsModalOpen(true);
  };

  return (
    <div className="page on" id="pg_pur_booking">
      {toast && (
        <div className="toast-wrap">
          <div className={`toast ${toast.type === 'success' ? 'suc' : toast.type === 'error' ? 'err' : 'inf'}`} style={{ display: 'flex' }}>
            <i className={`fa ${toast.type === 'success' ? 'fa-check-circle' : toast.type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}`}></i>
            <span style={{ flex: 1 }}>{toast.msg}</span>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}

      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-file-pen"></i></div>
            Order Booking
          </h1>
          <p>Purchase order bookings — Client · Vehicle · Costs · Signatures</p>
        </div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search by name / reg / ID…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-or" onClick={() => { setEditRec(null); setIsModalOpen(true); }}>
            <i className="fa fa-plus"></i> Add Booking
          </button>
        </div>
      </div>

      {isModalOpen && (
        <ObModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          editData={editRec}
        />
      )}
      <DocModal
        isOpen={quickModal.type === 'doc'}
        onClose={closeQuickModal}
        onSuccess={() => markShifted('Documents', quickModal.obId)}
        quickObId={quickModal.obId}
      />
      <PayModal
        isOpen={quickModal.type === 'pay'}
        onClose={closeQuickModal}
        onSuccess={() => markShifted('Payment', quickModal.obId)}
        quickId={quickModal.obId}
        type="purchase"
      />
      <DelModal
        isOpen={quickModal.type === 'del'}
        onClose={closeQuickModal}
        onSuccess={() => markShifted('Delivery', quickModal.obId)}
        quickId={quickModal.obId}
      />

      {/* KPI Strip */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="kpi">
          <div className="kpi-icon"><i className="fa fa-file-pen" style={{ color: 'var(--or1)' }}></i></div>
          <div className="kpi-val">{records.length}</div>
          <div className="kpi-lbl">Total Bookings</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><i className="fa fa-indian-rupee-sign" style={{ color: 'var(--success)' }}></i></div>
          <div className="kpi-val" style={{ fontSize: 18 }}>
            {records.length ? fmt(records.reduce((s, r) => s + (Number(r.ob_pp) || Number(r.pp) || 0), 0)) : '—'}
          </div>
          <div className="kpi-lbl">Total Purchase Value</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><i className="fa fa-calculator" style={{ color: 'var(--bl5)' }}></i></div>
          <div className="kpi-val" style={{ fontSize: 18 }}>
            {records.length ? fmt(records.reduce((s, r) => s + (Number(r.tcp) || 0), 0)) : '—'}
          </div>
          <div className="kpi-lbl">Total Cost Price (TCP)</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><i className="fa fa-check-circle" style={{ color: 'var(--success)' }}></i></div>
          <div className="kpi-val">{records.filter(r => r.ob_doc_stat === 'Complete').length}</div>
          <div className="kpi-lbl">Docs Complete</div>
        </div>
      </div>

      <div className="tc">
        <div className="tc-hdr">
          <div className="tc-title">
            Order Bookings
            <span style={{ background: 'var(--or1)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>{filtered.length}</span>
          </div>
        </div>
        <div className="tbl-wrap">
          <table id="tbl_ob">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Inq ID</th>
                <th>Date</th>
                <th>Seller / Client</th>
                <th>Reg No.</th>
                <th>Vehicle</th>
                <th>Purchase Price</th>
                <th>TCP</th>
                <th>Doc Status</th>
                <th>Branch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--or1)', fontFamily: "'Space Grotesk',sans-serif" }}>
                    {r.obId || r.id?.slice(0, 12)}
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {r.ob_inqid || '—'}
                  </td>
                  <td>{fmtDate(r.date || r.ob_date)}</td>
                  <td style={{ fontWeight: 600 }}>{r.ob_cname || r.sellerName || r.ob_bname}</td>
                  <td style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700 }}>
                    {r.ob_regn || r.regNo || r.ob_vnum || '—'}
                  </td>
                  <td>{r.ob_mm || r.make || '—'} {r.model || ''}</td>
                  <td className="amt-or">{fmt(r.ob_pp || r.pp)}</td>
                  <td className="amt-or">{fmt(r.tcp || r.ob_tcp)}</td>
                  <td>
                    {r.ob_doc_stat ? (
                      <span className={`badge ${r.ob_doc_stat === 'Complete' ? 'b-won' : r.ob_doc_stat === 'Partial' ? 'b-prog' : 'b-pend'}`}>
                        {r.ob_doc_stat}
                      </span>
                    ) : '—'}
                  </td>
                  <td>{r.ob_branch || r.branch || '—'}</td>
                  <td>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, width: 'fit-content' }}>
                      <button className="btn-icon bi-edit" title="Send to Payment" onClick={() => setQuickModal({ type: 'pay', obId: r.obId || r.id })}>
                        <i className="fa fa-indian-rupee-sign"></i>
                      </button>
                      <button className="btn-icon bi-edit" title="Send to Delivery" onClick={() => setQuickModal({ type: 'del', obId: r.obId || r.id })}>
                        <i className="fa fa-truck"></i>
                      </button>
                      <button className="btn-icon bi-edit" title="Send to Documents" onClick={() => setQuickModal({ type: 'doc', obId: r.obId || r.id })}>
                        <i className="fa fa-file-lines"></i>
                      </button>
                      <button className="btn-icon bi-print" title="Print Booking" onClick={() => handlePrintRecord(r)}>
                        <i className="fa fa-print"></i>
                      </button>
                      <button className="btn-icon bi-edit" title="Edit" onClick={() => { setEditRec(r); setIsModalOpen(true); }}>
                        <i className="fa fa-pen"></i>
                      </button>
                      <button className="btn-icon bi-del" title="Delete" onClick={() => handleDelete(r)}>
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="11" className="empty">
                    <i className="fa fa-file-pen"></i><br />
                    {search ? 'No results found' : 'No order bookings yet. Click "Add Booking" to create one.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="tc-foot">
          <span className="pg-info">Showing {filtered.length} of {records.length} bookings</span>
        </div>
      </div>
    </div>
  );
};

export default PurchaseBooking;
