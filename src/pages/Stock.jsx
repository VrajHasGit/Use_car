import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, statusBadge, ageDays } from '../utils/helpers';
import { StkModal } from '../components/modals/StkModal';
import { WsModal } from '../components/modals/WsModal';
import { VtModal } from '../components/modals/VtModal';
import { QrModal } from '../components/modals/QrModal';
import { exportToExcel } from '../utils/exportData';

const PAGE_SIZE = 20;

/* ── Colour swatch map ───────────────────────────── */
const COLOUR_MAP = {
  white:'#F8F8F8', black:'#111', silver:'#C0C0C0', grey:'#808080', gray:'#808080',
  red:'#EF4444', blue:'#3B82F6', green:'#22C55E', yellow:'#F59E0B', orange:'#F97316',
  brown:'#92400E', maroon:'#800000', gold:'#C8A84B', beige:'#E8D5B7', cream:'#FFFDD0',
  navy:'#1E3A6B', purple:'#7C3AED', pink:'#EC4899', champagne:'#F7E7CE',
};
function colourHex(c) { if (!c) return '#888'; const k = c.toLowerCase().trim(); for (const [key, val] of Object.entries(COLOUR_MAP)) { if (k.includes(key)) return val; } return '#888'; }

/* ── Days-in-stock badge ─────────────────────────── */
function DaysInStock({ pDate }) {
  if (!pDate) return <span style={{ color: 'var(--text3)' }}>—</span>;
  const d = ageDays(pDate);
  const color = d < 30 ? 'var(--success)' : d < 60 ? 'var(--warn)' : 'var(--danger)';
  return <span style={{ background: `${color}18`, color, fontWeight: 700, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontFamily: "'Space Grotesk',sans-serif" }}>{d}d</span>;
}

/* ── Pagination helper ───────────────────────────── */
function Paginate({ total, page, setPage }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  const nums = [...Array(pages).keys()].map(i => i + 1);
  return (
    <div className="pagination">
      <button className="pg-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
      <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
      {nums.filter(n => n === 1 || n === pages || Math.abs(n - page) <= 2).map((n, i, arr) => (
        <React.Fragment key={n}>
          {i > 0 && arr[i - 1] !== n - 1 && <span style={{ color: 'var(--text3)', padding: '0 4px' }}>…</span>}
          <button className={`pg-btn ${page === n ? 'on' : ''}`} onClick={() => setPage(n)}>{n}</button>
        </React.Fragment>
      ))}
      <button className="pg-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
      <button className="pg-btn" disabled={page === pages} onClick={() => setPage(pages)}>»</button>
    </div>
  );
}

const Stock = () => {
  const { data, refresh } = useData();
  const { currentUser } = useAuth();
  const location = useLocation();
  const isAdmin = ['admin', 'manager'].includes((currentUser?.role || '').toLowerCase());

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [makeFilter, setMakeFilter] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [page, setPage] = useState(1);

  React.useEffect(() => {
    const migrate = async () => {
      const recordsToMigrate = data.stk?.filter(r => !r.stkId || !r.stkId.startsWith('STK-'));
      if (recordsToMigrate && recordsToMigrate.length > 0) {
        for (const rec of recordsToMigrate) {
          const cnt = await getNextCounter('stk');
          const newStkId = genId('STK', cnt);
          await updateRecord('stk', rec.id, { stkId: newStkId });
        }
        await refresh('stk');
      }
    };
    if (data.stk && data.stk.length > 0) migrate();
  }, [data.stk, refresh]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickModal, setQuickModal] = useState({ type: null, stkId: null });
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    const autoId = location.state?.autoOpenId;
    if (!autoId) return;
    const rec = (data.stk || []).find(r => r.id === autoId);
    if (rec) { setEditRec(rec); setIsModalOpen(true); window.history.replaceState({}, document.title, window.location.pathname); }
  }, [data.stk, location.state?.autoOpenId]);

  const rawStock = data.stk || [];
  // Exclude Sold and Workshop from the main table view (unless searching)
  const stock = rawStock.filter(r => r.status !== 'Sold' && r.status !== 'Workshop');

  // Unique makes for filter
  const makes = useMemo(() => [...new Set(stock.map(r => r.make).filter(Boolean))].sort(), [stock]);

  // Filtered records
  const filtered = useMemo(() => {
    const source = search ? rawStock : stock;
    return source.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        (r.stkId || '').toLowerCase().includes(q) ||
        (r.inqId || r.sk_inqid || '').toLowerCase().includes(q) ||
        (r.regNo || r.sk_regn || '').toLowerCase().includes(q) ||
        (r.make || '').toLowerCase().includes(q) ||
        (r.model || '').toLowerCase().includes(q) ||
        (r.color || '').toLowerCase().includes(q);
      const matchStatus = !statusFilter || r.status === statusFilter;
      const matchMake = !makeFilter || r.make === makeFilter;
      const matchFuel = !fuelFilter || r.fuel === fuelFilter;
      const matchYearFrom = !yearFrom || parseInt(r.year) >= parseInt(yearFrom);
      const matchYearTo = !yearTo || parseInt(r.year) <= parseInt(yearTo);
      return matchSearch && matchStatus && matchMake && matchFuel && matchYearFrom && matchYearTo;
    });
  }, [rawStock, stock, search, statusFilter, makeFilter, fuelFilter, yearFrom, yearTo]);

  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  // KPI cards
  const inStock = rawStock.filter(r => r.status === 'In Stock' || r.status === 'Ready for Sale').length;
  const sold = rawStock.filter(r => r.status === 'Sold').length;
  const refurb = rawStock.filter(r => r.status === 'Refurb' || r.status === 'Under Refurb' || r.status === 'Workshop').length;
  const totalValue = stock.filter(r => r.status === 'In Stock' || r.status === 'Ready for Sale').reduce((s, r) => s + (parseFloat(r.sp || r.sk_sp) || 0), 0);

  const chartData = useMemo(() => {
    const makesCount = {};
    stock.filter(r => r.status === 'In Stock' || r.status === 'Ready for Sale').forEach(r => {
      let m = (r.make || 'Other').trim();
      m = m.split(' ')[0].toUpperCase();
      makesCount[m] = (makesCount[m] || 0) + 1;
    });
    return Object.entries(makesCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 makes
  }, [stock]);

  const PIE_COLORS = ['#E85D04', '#F4A261', '#E9C46A', '#2A9D8F', '#264653'];

  const clearFilters = () => { setSearch(''); setStatusFilter(''); setMakeFilter(''); setFuelFilter(''); setYearFrom(''); setYearTo(''); setPage(1); };
  const hasFilter = search || statusFilter || makeFilter || fuelFilter || yearFrom || yearTo;

  const handleSave = async (formData) => {
    try {
      const actor = { id: currentUser?.id, name: currentUser?.name || 'Admin', role: currentUser?.role || 'Admin' };
      if (editRec) { await updateRecord('stk', editRec.id, formData, { title: 'Stock Updated', message: (formData.sk_regn || formData.regNo || '') + ' — ' + (formData.sk_make || formData.make || '') + ' ' + (formData.sk_model || formData.model || ''), link: '/stock', actor }); showToast('Stock updated!'); }
      else {
        const cnt = await getNextCounter('stk');
        const stkId = genId('STK', cnt);
        const pp = parseFloat(formData.sk_pp || formData.pp || 0);
        const refurb = parseFloat(formData.sk_refurb || formData.refurb || 0);
        const rto = parseFloat(formData.sk_rto || formData.rto || 0);
        const ins = parseFloat(formData.sk_ins || formData.ins || 0);
        const tcp = pp + refurb + rto + ins;
        const sp = parseFloat(formData.sk_sp || formData.sp || 0);
        const profit = sp - tcp;
        await addRecord('stk', { ...formData, stkId, regNo: formData.sk_regn || formData.regNo, make: formData.sk_make || formData.make, model: formData.sk_model || formData.model, variant: formData.sk_var || formData.variant, year: formData.sk_year || formData.year, fuel: formData.sk_fuel || formData.fuel, trans: formData.sk_trans || formData.trans, color: formData.sk_color || formData.color, km: formData.sk_km || formData.km, status: formData.sk_stat || formData.status || 'In Stock', pDate: formData.sk_pdate || formData.pDate || today(), pp, refurb, rto, ins, tcp, sp, profit }, { title: 'Car Added to Stock', message: (formData.sk_regn || formData.regNo || '') + ' — ' + (formData.sk_make || formData.make || '') + ' ' + (formData.sk_model || formData.model || ''), link: '/stock', actor, carInfo: { make: formData.sk_make || formData.make, model: formData.sk_model || formData.model, regNo: formData.sk_regn || formData.regNo } });
        showToast('Stock record added!');
      }
      await refresh('stk'); setIsModalOpen(false);
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
  };

  const handleDelete = async (rec) => {
    if (!window.confirm(`Delete stock for ${rec.regNo}?\n\nThis cannot be undone.`)) return;
    try { await deleteRecord('stk', rec.id); await refresh('stk'); showToast('Deleted.', 'info'); }
    catch (e) { showToast('Delete failed.', 'error'); }
  };

  const handleMarkSold = async (rec) => {
    if (!window.confirm(`Mark ${rec.regNo} (${rec.make} ${rec.model}) as Sold?`)) return;
    try {
      await updateRecord('stk', rec.id, { status: 'Sold', soldDate: today() });
      await refresh('stk');
      showToast(`${rec.regNo} marked as Sold! ✅`);
    } catch (e) { showToast('Failed to mark as sold.', 'error'); }
  };

  const handleSendToWorkshop = async (rec) => {
    if (!window.confirm(`Send ${rec.regNo} (${rec.make} ${rec.model}) to Workshop?`)) return;
    try {
      await updateRecord('stk', rec.id, { status: 'Workshop' });
      
      // Create auto-generated workshop job card
      const cnt = await getNextCounter('ws');
      const wsId = genId('JC', cnt);
      const wsData = {
        wsId,
        ws_stkid: rec.stkId || rec.id,
        ws_inqid: rec.inqId || rec.sk_inqid || '',
        ws_vnum: rec.regNo || '',
        ws_make: rec.make || '',
        ws_model: rec.model || '',
        ws_km: rec.km || '',
        ws_indate: today(),
        date: today(),
        ws_wtype: "General Service",
        ws_pstat: "Pending",
        ws_jstat: "Open",
        tasks: [],
        createdAt: new Date().toISOString()
      };
      await addRecord('ws', wsData);
      
      await refresh('stk');
      await refresh('ws');
      showToast(`${rec.regNo} sent to Workshop!`);
    } catch (e) { showToast('Failed to send to workshop.', 'error'); }
  };

  const handleExport = () => {
    if (filtered.length === 0) return showToast('No data to export.', 'info');
    const rows = filtered.map(r => ({
      'Stock ID': r.stkId || r.id,
      'Reg No': r.regNo, Make: r.make, Model: r.model, Year: r.year,
      Variant: r.variant, Colour: r.color, Fuel: r.fuel, Transmission: r.trans,
      'Odometer (km)': r.km, 'Asking Price (INR)': r.sp,
      ...(isAdmin ? { 'Cost Price (INR)': r.tcp, 'Margin (INR)': r.profit } : {}),
      Status: r.status, 'Purchase Date': r.pDate,
      'Days in Stock': r.pDate ? ageDays(r.pDate) : '',
    }));
    exportToExcel(rows, `car_stock_${today()}.xlsx`);
  };

  const closeQuickModal = () => setQuickModal({ type: null, stkId: null });
  const thisYear = new Date().getFullYear();

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

      {/* Page Header */}
      <div className="ph">
        <div className="ph-left">
          <h1><div className="ph-icon" style={{ background: 'linear-gradient(135deg,#E85D04,#F97316)' }}><i className="fa fa-warehouse"></i></div>Car Stock</h1>
          <p>Vehicle inventory · {stock.length} total records · {inStock} available</p>
        </div>
        <div className="ph-actions">
          <button className="btn btn-out btn-sm" onClick={handleExport}><i className="fa fa-file-csv"></i> Export CSV</button>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && <StkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editData={editRec} />}
      <WsModal isOpen={quickModal.type === 'ws'} onClose={closeQuickModal} stockDocId={quickModal.docId} stockIdForWs={quickModal.stkId} />
      <VtModal isOpen={quickModal.type === 'vt'} onClose={closeQuickModal} stkId={quickModal.stkId} />
      <QrModal isOpen={quickModal.type === 'qr'} onClose={closeQuickModal} stkId={quickModal.stkId} />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        {[
          { icon: 'fa-warehouse', val: inStock, lbl: 'In Stock', color: '#4A7CDE' },
          { icon: 'fa-circle-check', val: sold, lbl: 'Sold', color: '#22C55E' },
          { icon: 'fa-wrench', val: refurb, lbl: 'In Refurb', color: '#F59E0B' },
          { icon: 'fa-indian-rupee-sign', val: `₹${(totalValue / 100000).toFixed(1)}L`, lbl: 'Available Value', color: '#C8A84B' },
        ].map((k, i) => (
          <div key={i} className="kpi" style={{ borderLeft: `3px solid ${k.color}` }}>
            <div className="kpi-icon"><i className={`fa ${k.icon}`} style={{ color: k.color }}></i></div>
            <div className="kpi-val">{k.val}</div>
            <div className="kpi-lbl">{k.lbl}</div>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      {inStock > 0 && (
        <div className="tc" style={{ marginBottom: 16 }}>
          <div className="tc-hdr">
            <div className="tc-title">📊 Available Stock by Make (Top 5)</div>
          </div>
          <div style={{ height: 250, width: '100%', padding: '10px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14, padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', }}>
        <input className="srch" placeholder="🔍 Search reg / make / model…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ flex: '1 1 160px', minWidth: 160 }} />
        <select className="flt" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option>In Stock</option><option>Ready for Sale</option><option>Refurb</option><option>Under Refurb</option><option>On Hold</option><option>Cancelled</option>
        </select>
        <select className="flt" value={makeFilter} onChange={e => { setMakeFilter(e.target.value); setPage(1); }}>
          <option value="">All Makes</option>
          {makes.map(m => <option key={m}>{m}</option>)}
        </select>
        <select className="flt" value={fuelFilter} onChange={e => { setFuelFilter(e.target.value); setPage(1); }}>
          <option value="">All Fuel</option>
          <option>Petrol</option><option>Diesel</option><option>EV</option><option>Hybrid</option><option>CNG</option>
        </select>
        <input className="flt" type="number" placeholder="Year From" value={yearFrom} onChange={e => { setYearFrom(e.target.value); setPage(1); }} style={{ width: 100 }} min="1990" max={thisYear} />
        <input className="flt" type="number" placeholder="Year To" value={yearTo} onChange={e => { setYearTo(e.target.value); setPage(1); }} style={{ width: 100 }} min="1990" max={thisYear} />
        {hasFilter && (
          <button className="btn btn-out btn-sm" onClick={clearFilters} style={{ whiteSpace: 'nowrap' }}>
            <i className="fa fa-xmark"></i> Clear Filters
          </button>
        )}
        {/* View Toggle */}
        <div className="view-toggle" style={{ marginLeft: 'auto' }}>
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title="List View"><i className="fa fa-list"></i></button>
          <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title="Grid View"><i className="fa fa-grip"></i></button>
        </div>
      </div>

      {/* ── LIST VIEW ───────────────────────────────────── */}
      {viewMode === 'list' && (
        <div className="tc">
          <div className="tc-hdr">
            <div className="tc-title"><i className="fa fa-warehouse" style={{ color: 'var(--or1)' }}></i> Car Stock
              <span style={{ background: 'var(--or1)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>{filtered.length}</span>
            </div>
            <div className="tc-acts" style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text3)', alignItems: 'center' }}>
              <span>Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            </div>
          </div>
          <div className="tbl-wrap">
            <table id="tbl_stk">
              <thead>
                <tr>
                  <th>Stock ID</th><th>Inq ID</th><th>Reg No.</th><th>Make / Model</th><th>Year</th>
                  <th>Fuel</th><th>Colour</th><th>KM</th>
                  {isAdmin && <><th>TCP</th><th>Selling Price</th><th>Profit</th></>}
                  <th>Days</th><th>Status</th><th style={{ minWidth: 200 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? paginated.map(r => {
                  const linkedInqId = r.inqId || r.sk_inqid || '';
                  const linkedInq = linkedInqId ? (data.pur_inq || []).find(i => i.inqId === linkedInqId || i.id === linkedInqId) : null;
                  const rawMake = (r.make || r.sk_make || linkedInq?.make || '').trim();
                  const rMake = rawMake.split(' ')[0].toUpperCase();
                  const extraFromMake = rawMake.substring(rMake.length).trim();
                  const rawModel = (r.model || r.sk_model || linkedInq?.model || '').trim();
                  // Deduplicate words if make and model overlap
                  const rModelWords = (extraFromMake + ' ' + rawModel).split(' ').filter(Boolean);
                  const rModel = [...new Set(rModelWords)].join(' ');
                  
                  const rVariant = r.variant || r.sk_var || linkedInq?.variant || '';
                  const rYear = r.year || r.sk_year || linkedInq?.year || '';
                  const rFuel = r.fuel || r.sk_fuel || linkedInq?.fuel || '';
                  const rColor = r.color || r.sk_color || linkedInq?.color || '';
                  const rKm = r.km || r.sk_km || linkedInq?.km || '';
                  const rRegNo = r.regNo || r.sk_regn || linkedInq?.regNo || '';
                  return (
                  <tr key={r.id}>
                    <td style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'var(--bl5)', fontSize: 10 }}>{r.stkId || r.id?.slice(0, 12)}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text2)' }}>
                      {(() => {
                        const explicitInq = r.sk_inqid?.startsWith('INQ-') ? r.sk_inqid : (r.sk_inqid && !r.sk_inqid.startsWith('DOC-') ? r.sk_inqid : null);
                        if (explicitInq) return explicitInq;
                        if (linkedInqId && !linkedInqId.startsWith('DOC-')) return linkedInqId;
                        const matchReg = rRegNo;
                        if (matchReg && data.pur_inq) {
                          const rn = matchReg.replace(/\s/g, '').toUpperCase();
                          const inq = data.pur_inq.find(i => (i.regNo || i.inq_regn || '').replace(/\s/g, '').toUpperCase() === rn);
                          if (inq) return inq.inqId || inq.id;
                        }
                        return '—';
                      })()}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--or1)', fontFamily: "'Space Grotesk',sans-serif" }}>{rRegNo}</td>
                    <td><span style={{ fontWeight: 600 }}>{rMake}</span> {rModel}<br /><small style={{ color: 'var(--text3)' }}>{rVariant}</small></td>
                    <td>{rYear}</td>
                    <td>{rFuel ? <span className="badge b-prog">{rFuel}</span> : '—'}</td>
                    <td>
                      {rColor ? (
                        <div className="colour-dot">
                          <div className="colour-dot-swatch" style={{ background: colourHex(rColor) }}></div>
                          {rColor}
                        </div>
                      ) : '—'}
                    </td>
                    <td>{rKm ? `${Number(rKm).toLocaleString('en-IN')} km` : '—'}</td>
                    {isAdmin && <>
                      <td className="amt-or">{fmt(r.tcp || r.sk_tcp || (Number(r.sk_pp||r.pp||r.purchasePrice||0)+Number(r.sk_refurb||r.refurb||0)+Number(r.sk_rto||r.rto||0)+Number(r.sk_ins||r.ins||0)))}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 700 }}>{fmt(r.sp || r.sk_sp)}</td>
                      <td className={(r.profit || (Number(r.sk_sp||0)-(Number(r.sk_pp||0)+Number(r.sk_refurb||0)+Number(r.sk_rto||0)+Number(r.sk_ins||0)))) > 0 ? 'profit-pos' : (r.profit || (Number(r.sk_sp||0)-(Number(r.sk_pp||0)+Number(r.sk_refurb||0)+Number(r.sk_rto||0)+Number(r.sk_ins||0)))) < 0 ? 'profit-neg' : ''}>{fmt(r.profit || (Number(r.sk_sp||0)-(Number(r.sk_pp||0)+Number(r.sk_refurb||0)+Number(r.sk_rto||0)+Number(r.sk_ins||0))))}</td>
                    </>}
                    <td><DaysInStock pDate={r.pDate || r.sk_pdate} /></td>
                    <td><span className={`badge ${statusBadge(r.status || r.sk_stat || 'In Stock')}`}>{r.status || r.sk_stat || 'In Stock'}</span></td>
                    <td>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', gap: 6 }}>
                        <button className="btn-icon bi-edit" title="Edit" onClick={() => { setEditRec(r); setIsModalOpen(true); }}><i className="fa fa-pen"></i></button>
                        {r.status !== 'Sold' && <button className="btn-icon" title="Mark as Sold" onClick={() => handleMarkSold(r)} style={{ background: 'rgba(34,197,94,.1)', color: 'var(--success)', width: 28, height: 28, borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa fa-circle-check"></i></button>}
                        <button className="btn-icon bi-next" title="Send to Workshop" onClick={() => handleSendToWorkshop(r)}><i className="fa fa-wrench"></i></button>
                        <button className="btn-icon bi-view" title="Vehicle History" onClick={() => setQuickModal({ type: 'vt', stkId: r.stkId || r.id })}><i className="fa fa-timeline"></i></button>
                        <button className="btn-icon" style={{ background: 'rgba(37,99,235,.1)', color: 'var(--bl5)', width: 28, height: 28, borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="QR Code" onClick={() => setQuickModal({ type: 'qr', stkId: r.stkId || r.id })}><i className="fa fa-qrcode"></i></button>
                        <button className="btn-icon bi-del" title="Delete" onClick={() => handleDelete(r)}><i className="fa fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                )}) : (
                  <tr><td colSpan="13" className="empty">
                    <i className="fa fa-warehouse"></i><br />
                    {hasFilter ? 'No vehicles match your filters. Try clearing filters.' : 'No stock records yet. Click "Add Vehicle" to begin.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="tc-foot">
            <span className="pg-info">Showing {filtered.length} vehicles (page {page})</span>
            <Paginate total={filtered.length} page={page} setPage={setPage} />
          </div>
        </div>
      )}

      {/* ── GRID VIEW ───────────────────────────────────── */}
      {viewMode === 'grid' && (
        <>
          {filtered.length === 0 ? (
            <div className="tc"><div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>
              <i className="fa fa-warehouse" style={{ fontSize: 36, opacity: .3, display: 'block', marginBottom: 12 }}></i>
              {hasFilter ? 'No vehicles match your filters.' : 'No stock records yet.'}
            </div></div>
          ) : (
            <>
              <div className="stock-grid">
                {paginated.map(r => (
                  <div key={r.id} className="stk-card">
                    <div className="stk-card-img">
                      <i className="fa fa-car-side" style={{ color: 'var(--text3)' }}></i>
                      <div className="stk-status-overlay">
                        <span className={`badge ${statusBadge(r.status)}`}>{r.status}</span>
                      </div>
                    </div>
                    <div className="stk-card-body">
                      <div className="stk-card-title">{r.make} {r.model}</div>
                      <div className="stk-card-sub">{r.year} · {r.variant || 'Standard'}</div>
                      <div className="stk-card-price">{fmt(r.sp || r.sk_sp)}</div>
                      <div className="stk-card-pills">
                        {r.fuel && <span className="badge b-prog" style={{ fontSize: 9 }}>{r.fuel}</span>}
                        {r.color && (
                          <div className="colour-dot" style={{ padding: '1px 6px', fontSize: 9 }}>
                            <div className="colour-dot-swatch" style={{ background: colourHex(r.color) }}></div>
                            {r.color}
                          </div>
                        )}
                        <DaysInStock pDate={r.pDate} />
                      </div>
                    </div>
                    <div className="stk-card-actions">
                      <button className="btn-icon bi-edit" title="Edit" onClick={() => { setEditRec(r); setIsModalOpen(true); }}><i className="fa fa-pen"></i></button>
                      {r.status !== 'Sold' && <button className="btn-icon" title="Mark as Sold" onClick={() => handleMarkSold(r)} style={{ background: 'rgba(34,197,94,.15)', color: 'var(--success)', width: 28, height: 28, borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa fa-circle-check"></i></button>}
                      <button className="btn-icon bi-del" title="Delete" onClick={() => handleDelete(r)}><i className="fa fa-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="tc-foot">
                <span className="pg-info">Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
                <Paginate total={filtered.length} page={page} setPage={setPage} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Stock;
