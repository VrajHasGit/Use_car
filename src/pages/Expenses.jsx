import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt } from '../utils/helpers';
import { ExpModal } from '../components/modals/ExpModal';
import { exportToExcel } from '../utils/exportData';

const PAGE_SIZE = 20;
const CATEGORIES = ['Fuel', 'Parts', 'Marketing', 'Salary', 'Utilities', 'Maintenance', 'Office', 'Insurance', 'Transport', 'Miscellaneous'];

/* ── Reject Reason Modal ─────────────────────────── */
function RejectModal({ rec, onClose, onReject }) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal" style={{ maxWidth: 380 }}>
        <div className="m-hdr"><div className="m-title" style={{ color: 'var(--danger)' }}><i className="fa fa-xmark"></i> Reject Expense</div><button className="m-close" onClick={onClose}>✕</button></div>
        <div className="m-body" style={{ padding: 20 }}>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>
            Rejecting: <b style={{ color: 'var(--text)' }}>{rec.description || rec.expId}</b> — {fmt(rec.amount)}
          </p>
          <div className="fg">
            <label>Rejection Reason *</label>
            <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Enter reason for rejection…" autoFocus
              style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 'var(--radius-sm)', padding: 10, fontFamily: 'inherit', fontSize: 12, resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
            <button className="btn btn-out" onClick={onClose}>Cancel</button>
            <button className="btn" style={{ background: 'var(--danger)', color: '#fff' }}
              disabled={!reason.trim() || saving}
              onClick={async () => { setSaving(true); await onReject(rec.id, reason); setSaving(false); onClose(); }}>
              {saving ? <><i className="fa fa-spinner fa-spin"></i> Rejecting…</> : <><i className="fa fa-xmark"></i> Reject</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Paginate ────────────────────────────────────── */
function Paginate({ total, page, setPage }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
      {[...Array(pages).keys()].map(i => i + 1).filter(n => n === 1 || n === pages || Math.abs(n - page) <= 2).map((n, i, arr) => (
        <React.Fragment key={n}>
          {i > 0 && arr[i - 1] !== n - 1 && <span style={{ color: 'var(--text3)', padding: '0 4px' }}>…</span>}
          <button className={`pg-btn ${page === n ? 'on' : ''}`} onClick={() => setPage(n)}>{n}</button>
        </React.Fragment>
      ))}
      <button className="pg-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
    </div>
  );
}

const statusBadgeExp = (s) => {
  if (!s) return 'b-new';
  if (s === 'Approved') return 'b-approved';
  if (s === 'Rejected') return 'b-rejected';
  if (s === 'Reimbursed') return 'b-reimbursed';
  return 'b-pending';
};

const Expenses = () => {
  const { data, refresh } = useData();
  const { currentUser } = useAuth();
  const isManager = ['admin', 'manager'].includes((currentUser?.role || '').toLowerCase());

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [rejectRec, setRejectRec] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const records = data['exp_rec'] || [];

  const now = new Date();
  const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const thisYearStr = `${now.getFullYear()}`;

  const thisMonthTotal = records.filter(r => (r.date || '').startsWith(thisMonthStr)).reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const lastMonthTotal = records.filter(r => (r.date || '').startsWith(lastMonthStr)).reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const ytdTotal = records.filter(r => (r.date || '').startsWith(thisYearStr)).reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const monthVsLast = lastMonthTotal > 0 ? (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1) : null;
  const catTotals = CATEGORIES.map(c => ({ cat: c, total: records.filter(r => r.category === c).reduce((s, r) => s + (parseFloat(r.amount) || 0), 0) })).sort((a, b) => b.total - a.total);
  const topCat = catTotals[0]?.cat || '—';

  const chartData = useMemo(() => {
    return catTotals.filter(c => c.total > 0).map(c => ({ name: c.cat, value: c.total }));
  }, [catTotals]);

  const PIE_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1'];

  const filtered = useMemo(() => records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !search || (r.description || '').toLowerCase().includes(q) || (r.expId || '').toLowerCase().includes(q) || (r.paidBy || '').toLowerCase().includes(q);
    const matchCat = !categoryFilter || r.category === categoryFilter;
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  }), [records, search, categoryFilter, statusFilter]);

  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const handleSave = async (fd) => {
    try {
      if (editRec) { await updateRecord('exp_rec', editRec.id, fd); showToast('Updated!'); }
      else { const cnt = await getNextCounter('EXP'); await addRecord('exp_rec', { ...fd, expId: genId('EXP', cnt), date: fd.date || today(), status: 'Pending' }); showToast('Expense added!'); }
      await refresh('exp_rec'); setIsModalOpen(false);
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
  };

  const handleDelete = async (rec) => {
    if (!window.confirm(`Delete expense "${rec.description}"?\n\nThis cannot be undone.`)) return;
    try { await deleteRecord('exp_rec', rec.id); await refresh('exp_rec'); showToast('Deleted.', 'info'); }
    catch (e) { showToast('Delete failed.', 'error'); }
  };

  const handleApprove = async (rec) => {
    if (!isManager) return showToast('Only managers can approve expenses.', 'error');
    try {
      await updateRecord('exp_rec', rec.id, { status: 'Approved', approvedBy: currentUser?.name || 'Manager', approvedAt: new Date().toISOString() });
      await refresh('exp_rec'); showToast(`✅ Expense approved by ${currentUser?.name}`);
    } catch (e) { showToast('Failed to approve.', 'error'); }
  };

  const handleReject = async (id, reason) => {
    try {
      await updateRecord('exp_rec', id, { status: 'Rejected', rejectedBy: currentUser?.name || 'Manager', rejectedAt: new Date().toISOString(), rejectionReason: reason });
      await refresh('exp_rec'); showToast('Expense rejected.', 'info');
    } catch (e) { showToast('Failed to reject.', 'error'); }
  };

  const handleReimburse = async (rec) => {
    if (rec.status !== 'Approved') return showToast('Expense must be Approved before marking as Reimbursed.', 'error');
    if (!window.confirm(`Mark expense "${rec.description}" as Reimbursed?`)) return;
    try {
      await updateRecord('exp_rec', rec.id, { status: 'Reimbursed', reimbursedAt: new Date().toISOString(), reimbursedBy: currentUser?.name });
      await refresh('exp_rec'); showToast('Marked as Reimbursed! 💰');
    } catch (e) { showToast('Failed.', 'error'); }
  };

  const handleExport = () => {
    if (filtered.length === 0) return showToast('No data to export.', 'info');
    const rows = filtered.map(r => ({
      'Expense ID': r.expId, Date: r.date, Description: r.description, Category: r.category,
      'Amount (INR)': r.amount, 'GST Rate (%)': r.gstRate || 0, 'GST Amount (INR)': r.gstAmount || 0,
      'Net Amount (INR)': r.netAmount || r.amount, 'Payment Method': r.payMethod, 'Paid By': r.paidBy,
      'Approved By': r.approvedBy || '', 'Approval Date': r.approvedAt?.slice(0, 10) || '',
      Status: r.status, Notes: r.notes || '',
    }));
    exportToExcel(rows, `expenses_${today()}.xlsx`);
  };

  return (
    <div className="page on" id="pg_expenses">
      {toast && <div className="toast-wrap"><div className={`toast ${toast.type === 'success' ? 'suc' : toast.type === 'error' ? 'err' : 'inf'}`} style={{ display: 'flex' }}><span style={{ flex: 1 }}>{toast.msg}</span><button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button></div></div>}
      {rejectRec && <RejectModal rec={rejectRec} onClose={() => setRejectRec(null)} onReject={handleReject} />}

      <div className="ph">
        <div className="ph-left">
          <h1><div className="ph-icon" style={{ background: 'linear-gradient(135deg,#DC2626,#EF4444)' }}><i className="fa fa-receipt"></i></div>Expenses</h1>
          <p>Track and manage dealership expenses · Approve / Reject / Reimburse workflow</p>
        </div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search expense…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <select className="flt" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="flt" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option>Pending</option><option>Approved</option><option>Rejected</option><option>Reimbursed</option>
          </select>
          <button className="btn btn-out btn-sm" onClick={handleExport}><i className="fa fa-file-csv"></i> Export</button>
          <button className="btn btn-or" onClick={() => { setEditRec(null); setIsModalOpen(true); }}><i className="fa fa-plus"></i> Add Expense</button>
        </div>
      </div>

      {isModalOpen && <ExpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editData={editRec} />}

      {/* KPI Summary Cards (spec §8) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <div className="kpi" style={{ borderLeft: '3px solid var(--danger)' }}>
          <div className="kpi-icon"><i className="fa fa-receipt" style={{ color: 'var(--danger)' }}></i></div>
          <div className="kpi-val">{fmt(thisMonthTotal)}</div>
          <div className="kpi-lbl">This Month</div>
        </div>
        <div className="kpi" style={{ borderLeft: `3px solid ${monthVsLast === null ? 'var(--text3)' : monthVsLast > 0 ? 'var(--danger)' : 'var(--success)'}` }}>
          <div className="kpi-icon">
            <i className={`fa ${monthVsLast === null ? 'fa-minus' : monthVsLast > 0 ? 'fa-trending-up' : 'fa-trending-down'}`} style={{ color: monthVsLast === null ? 'var(--text3)' : monthVsLast > 0 ? 'var(--danger)' : 'var(--success)' }}></i>
          </div>
          <div className="kpi-val" style={{ color: monthVsLast === null ? 'var(--text3)' : monthVsLast > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {monthVsLast === null ? '—' : `${monthVsLast > 0 ? '+' : ''}${monthVsLast}%`}
          </div>
          <div className="kpi-lbl">vs Last Month</div>
        </div>
        <div className="kpi" style={{ borderLeft: '3px solid var(--warn)' }}>
          <div className="kpi-icon"><i className="fa fa-wallet" style={{ color: 'var(--warn)' }}></i></div>
          <div className="kpi-val">{fmt(ytdTotal)}</div>
          <div className="kpi-lbl">YTD Total</div>
        </div>
        <div className="kpi" style={{ borderLeft: '3px solid var(--or1)' }}>
          <div className="kpi-icon"><i className="fa fa-tag" style={{ color: 'var(--or1)' }}></i></div>
          <div className="kpi-val" style={{ fontSize: 14 }}>{topCat}</div>
          <div className="kpi-lbl">Top Category · {fmt(catTotals[0]?.total)}</div>
        </div>
      </div>

      {/* Analytics Chart */}
      {chartData.length > 0 && (
        <div className="tc" style={{ marginBottom: 16 }}>
          <div className="tc-hdr">
            <div className="tc-title">📊 Expenses by Category</div>
          </div>
          <div style={{ height: 250, width: '100%', padding: '10px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => fmt(value)} contentStyle={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="tc">
        <div className="tc-hdr">
          <div className="tc-title"><i className="fa fa-receipt" style={{ color: 'var(--danger)' }}></i> Expenses
            <span style={{ background: 'var(--danger)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>{filtered.length}</span>
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Expense ID</th><th>Date</th><th>Description</th><th>Category</th>
                <th>Amount</th><th>GST</th><th>Paid By</th><th>Pay Method</th>
                <th>Status</th><th>Approved By</th><th style={{ minWidth: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'var(--danger)', fontSize: 10 }}>{r.expId || r.id?.slice(0, 12)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.date)}</td>
                  <td style={{ maxWidth: 180 }}><span title={r.description} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description || '—'}</span></td>
                  <td>{r.category ? <span className="badge b-info" style={{ fontSize: 9 }}>{r.category}</span> : '—'}</td>
                  <td style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'var(--danger)' }}>{fmt(r.amount)}</td>
                  <td style={{ fontSize: 11, color: 'var(--text3)' }}>{r.gstRate ? `${r.gstRate}%` : '—'}</td>
                  <td style={{ fontSize: 11 }}>{r.paidBy || '—'}</td>
                  <td>{r.payMethod ? <span className="badge b-neutral" style={{ fontSize: 9 }}>{r.payMethod}</span> : '—'}</td>
                  <td><span className={`badge ${statusBadgeExp(r.status)}`}>{r.status || 'Pending'}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {r.approvedBy || (r.rejectedBy ? <span style={{ color: 'var(--danger)' }}>{r.rejectedBy}</span> : '—')}
                    {r.rejectionReason && <div style={{ fontSize: 9, color: 'var(--danger)', marginTop: 1 }} title={r.rejectionReason}>Reason on file</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button className="btn-icon bi-edit" title="Edit" onClick={() => { setEditRec(r); setIsModalOpen(true); }}><i className="fa fa-pen"></i></button>
                      {isManager && r.status === 'Pending' && <>
                        <button title="Approve" onClick={() => handleApprove(r)}
                          style={{ background: 'rgba(34,197,94,.1)', color: 'var(--success)', width: 28, height: 28, borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa fa-check"></i>
                        </button>
                        <button title="Reject" onClick={() => setRejectRec(r)}
                          style={{ background: 'rgba(239,68,68,.1)', color: 'var(--danger)', width: 28, height: 28, borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa fa-xmark"></i>
                        </button>
                      </>}
                      {isManager && r.status === 'Approved' && (
                        <button title="Mark Reimbursed" onClick={() => handleReimburse(r)}
                          style={{ background: 'rgba(59,130,246,.1)', color: 'var(--info)', width: 28, height: 28, borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa fa-coins"></i>
                        </button>
                      )}
                      <button className="btn-icon bi-del" title="Delete" onClick={() => handleDelete(r)}><i className="fa fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="11" className="empty">
                  <i className="fa fa-receipt"></i><br />
                  {search || categoryFilter || statusFilter ? 'No expenses match your filters.' : 'No expense records yet. Click "Add Expense" to begin.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="tc-foot">
          <span className="pg-info">Showing {filtered.length} of {records.length} expenses</span>
          <Paginate total={filtered.length} page={page} setPage={setPage} />
        </div>
      </div>
    </div>
  );
};

export default Expenses;
