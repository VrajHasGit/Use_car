import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge } from '../utils/helpers';
import { StkModal } from '../components/modals/StkModal';
import { WsModal } from '../components/modals/WsModal';
import { VtModal } from '../components/modals/VtModal';
import { QrModal } from '../components/modals/QrModal';

const Stock = () => {
  const { data, refresh } = useData();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickModal, setQuickModal] = useState({ type: null, stkId: null });
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const stock = data.stk || [];

  const filtered = stock.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      (r.regNo || '').toLowerCase().includes(q) ||
      (r.make || '').toLowerCase().includes(q) ||
      (r.model || '').toLowerCase().includes(q) ||
      (r.id || '').toLowerCase().includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = async (formData) => {
    try {
      if (editRec) {
        await updateRecord('stk', editRec.id, formData);
        showToast('Stock updated!');
      } else {
        const cnt = await getNextCounter('stk');
        const stkId = genId('STK', cnt);
        // Calculate TCP
        const pp = parseFloat(formData.sk_pp || formData.pp || 0);
        const refurb = parseFloat(formData.sk_refurb || formData.refurb || 0);
        const rto = parseFloat(formData.sk_rto || formData.rto || 0);
        const ins = parseFloat(formData.sk_ins || formData.ins || 0);
        const tcp = pp + refurb + rto + ins;
        const sp = parseFloat(formData.sk_sp || formData.sp || 0);
        const profit = sp - tcp;
        await addRecord('stk', {
          ...formData,
          stkId,
          regNo: formData.sk_regn || formData.regNo,
          make: formData.sk_make || formData.make,
          model: formData.sk_model || formData.model,
          variant: formData.sk_var || formData.variant,
          year: formData.sk_year || formData.year,
          fuel: formData.sk_fuel || formData.fuel,
          trans: formData.sk_trans || formData.trans,
          color: formData.sk_color || formData.color,
          km: formData.sk_km || formData.km,
          status: formData.sk_stat || formData.status || 'In Stock',
          pDate: formData.sk_pdate || formData.pDate || today(),
          pp, refurb, rto, ins, tcp, sp, profit,
        });
        showToast('Stock record added!');
      }
      await refresh('stk');
      setIsModalOpen(false);
    } catch (e) {
      showToast('Failed: ' + e.message, 'error');
    }
  };

  const handleDelete = async (rec) => {
    if (!window.confirm(`Delete stock for ${rec.regNo}?`)) return;
    try {
      await deleteRecord('stk', rec.id);
      await refresh('stk');
      showToast('Deleted.', 'info');
    } catch (e) {
      showToast('Delete failed.', 'error');
    }
  };

  const closeQuickModal = () => setQuickModal({ type: null, stkId: null });

  return (
    <div className="page on" id="pg_stock">
      {toast && (
        <div className="toast-wrap">
          <div className={`toast ${toast.type === 'success' ? 'suc' : toast.type === 'error' ? 'err' : 'inf'}`} style={{ display: 'flex' }}>
            <span style={{ flex: 1 }}>{toast.msg}</span>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}

      <div className="ph">
        <div className="ph-left">
          <h1><div className="ph-icon"><i className="fa fa-warehouse"></i></div>Car Stock</h1>
          <p>All vehicles in inventory · {filtered.length} records</p>
        </div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search reg / make / model…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="flt" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Sold">Sold</option>
            <option value="Refurb">Refurb</option>
            <option value="Under Refurb">Under Refurb</option>
            <option value="Hold">Hold</option>
          </select>
          <button className="btn btn-or" onClick={() => { setEditRec(null); setIsModalOpen(true); }}>
            <i className="fa fa-plus"></i> Add Stock
          </button>
        </div>
      </div>

      {isModalOpen && (
        <StkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editData={editRec} />
      )}

      {/* Quick Action Modals */}
      <WsModal isOpen={quickModal.type === 'ws'} onClose={closeQuickModal} quickInqId={quickModal.stkId} />
      <VtModal isOpen={quickModal.type === 'vt'} onClose={closeQuickModal} stkId={quickModal.stkId} />
      <QrModal isOpen={quickModal.type === 'qr'} onClose={closeQuickModal} stkId={quickModal.stkId} />

      <div className="tc">
        <div className="tc-hdr">
          <div className="tc-title"><i className="fa fa-warehouse" style={{ color: 'var(--or1)' }}></i> Car Stock
            <span style={{ background: 'var(--or1)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>{stock.length}</span>
          </div>
          <div className="tc-acts" style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text3)', alignItems: 'center' }}>
            <span>In Stock: <b style={{ color: 'var(--info)' }}>{stock.filter(r => r.status === 'In Stock').length}</b></span>
            <span>Sold: <b style={{ color: 'var(--success)' }}>{stock.filter(r => r.status === 'Sold').length}</b></span>
            <span>Refurb: <b style={{ color: 'var(--warn)' }}>{stock.filter(r => r.status === 'Refurb' || r.status === 'Under Refurb').length}</b></span>
          </div>
        </div>
        <div className="tbl-wrap">
          <table id="tbl_stk">
            <thead>
              <tr>
                <th>Stock ID</th><th>Reg No.</th><th>Make / Model</th><th>Year</th><th>Fuel</th>
                <th>KM</th><th>TCP</th><th>Selling Price</th><th>Profit</th><th>Status</th><th style={{ minWidth: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'var(--bl5)', fontSize: 10 }}>{r.stkId || r.id?.slice(0, 12)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--or1)', fontFamily: "'Space Grotesk',sans-serif" }}>{r.regNo}</td>
                  <td><span style={{ fontWeight: 600 }}>{r.make}</span> {r.model}<br /><small style={{ color: 'var(--text3)' }}>{r.variant}</small></td>
                  <td>{r.year}</td>
                  <td>{r.fuel}</td>
                  <td>{r.km ? `${Number(r.km).toLocaleString('en-IN')} km` : '—'}</td>
                  <td className="amt-or">{fmt(r.tcp)}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 700 }}>{fmt(r.sp || r.sk_sp)}</td>
                  <td className={r.profit > 0 ? 'profit-pos' : r.profit < 0 ? 'profit-neg' : ''}>{fmt(r.profit)}</td>
                  <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
                      <button className="btn-icon bi-edit" title="Edit" onClick={() => { setEditRec(r); setIsModalOpen(true); }}><i className="fa fa-pen"></i></button>
                      <button className="btn-icon bi-next" title="Workshop" onClick={() => setQuickModal({ type: 'ws', stkId: r.stkId || r.id })}><i className="fa fa-wrench"></i></button>
                      <button className="btn-icon bi-view" title="Vehicle History Timeline" onClick={() => setQuickModal({ type: 'vt', stkId: r.stkId || r.id })}><i className="fa fa-timeline"></i></button>
                      <button className="btn-icon" style={{ background: 'rgba(37,99,235,.1)', color: 'var(--bl5)' }} title="QR Code" onClick={() => setQuickModal({ type: 'qr', stkId: r.stkId || r.id })}><i className="fa fa-qrcode"></i></button>
                      <button className="btn-icon bi-del" title="Delete" onClick={() => handleDelete(r)}><i className="fa fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="11" className="empty">
                  <i className="fa fa-warehouse"></i><br />
                  {search || statusFilter ? 'No results match your search' : 'No stock records yet. Click "Add Stock" to add vehicles.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="tc-foot">
          <span className="pg-info">Showing {filtered.length} of {stock.length} vehicles</span>
        </div>
      </div>
    </div>
  );
};

export default Stock;
