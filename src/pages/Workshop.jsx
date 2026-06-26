import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, fmt, ageDays } from '../utils/helpers';
import { WsModal } from '../components/modals/WsModal';
import { exportToExcel } from '../utils/exportData';

const PAGE_SIZE = 20;

/* ── Job Task Checklist (expand panel) ───────────── */
function JobExpandPanel({ rec, onUpdateTasks, onReadyToList }) {
  const [newTask, setNewTask] = useState('');
  const tasks = rec.tasks || [];

  const toggleTask = async (idx) => {
    const updated = tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t);
    await onUpdateTasks(rec.id, updated);
  };
  const addTask = async () => {
    if (!newTask.trim()) return;
    const updated = [...tasks, { label: newTask.trim(), done: false, addedAt: today() }];
    await onUpdateTasks(rec.id, updated);
    setNewTask('');
  };

  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="job-expand open">
      {/* Progress bar */}
      {total > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>
            <span>Job Progress</span><span style={{ fontWeight: 700, color: pct === 100 ? 'var(--success)' : 'var(--text2)' }}>{done}/{total} tasks done ({pct}%)</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
            <div style={{ height: 4, background: pct === 100 ? 'var(--success)' : 'var(--or1)', borderRadius: 2, width: `${pct}%`, transition: 'width .3s' }}></div>
          </div>
        </div>
      )}
      {/* Task list */}
      {tasks.length === 0 ? (
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10, textAlign: 'center' }}>
          <i className="fa fa-list-check" style={{ fontSize: 16, opacity: .3, display: 'block', marginBottom: 4 }}></i>
          No tasks added yet
        </div>
      ) : (
        <div style={{ marginBottom: 10 }}>
          {tasks.map((t, i) => (
            <div key={i} className={`job-task-item ${t.done ? 'done' : ''}`}>
              <div className={`job-task-cb ${t.done ? 'done' : ''}`} onClick={() => toggleTask(i)}>
                {t.done && <i className="fa fa-check" style={{ fontSize: 8 }}></i>}
              </div>
              <span style={{ flex: 1, fontSize: 12, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--text3)' : 'var(--text)' }}>{t.label}</span>
              {t.addedAt && <span style={{ fontSize: 9, color: 'var(--text3)' }}>{t.addedAt}</span>}
            </div>
          ))}
        </div>
      )}
      {/* Inline add */}
      <div className="inline-add-row">
        <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add task (e.g. Polish bumper)…"
          onKeyDown={e => e.key === 'Enter' && addTask()} />
        <button className="btn btn-or btn-sm" onClick={addTask} disabled={!newTask.trim()}><i className="fa fa-plus"></i></button>
      </div>
      {/* Ready to List */}
      {!rec.readyToList && (
        <button className="btn" style={{ marginTop: 12, background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', width: '100%', border: '1px solid #047857', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
          onClick={() => onReadyToList(rec)}>
          <i className="fa fa-wand-magic-sparkles" style={{ color: '#FFD700', marginRight: '6px' }}></i> ✨ Finalize & Release to Showroom
        </button>
      )}
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

const Workshop = () => {
  const { data, refresh } = useData();
  const { currentUser } = useAuth();
  const isManager = ['admin', 'manager', 'partner'].includes((currentUser?.role || '').toLowerCase());

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const records = data.ws || [];
  const stock = data.stk || [];

  const filtered = useMemo(() => records.filter(r => {
    const matchSearch = !search || (r.ws_vnum || r.regNo || '').toLowerCase().includes(search.toLowerCase()) || (r.ws_make || r.make || '').toLowerCase().includes(search.toLowerCase()) || (r.wsId || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || (r.ws_jstat || r.jStat) === statusFilter;
    return matchSearch && matchStatus;
  }), [records, search, statusFilter]);

  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const activeCount = records.filter(r => ['Open', 'In Process'].includes(r.ws_jstat || r.jStat)).length;
  const doneCount = records.filter(r => (r.ws_jstat || r.jStat) === 'Complete').length;
  const totalCost = records.filter(r => (r.ws_jstat || r.jStat) !== 'Complete').reduce((s, r) => s + (parseFloat(r.total || (Number(r.ws_pc || 0) + Number(r.ws_lc || 0))) || 0), 0);
  const avgAge = (() => {
    const active = records.filter(r => (r.ws_jstat || r.jStat) !== 'Complete' && (r.date || r.ws_indate));
    if (!active.length) return 0;
    return Math.round(active.reduce((s, r) => s + ageDays(r.date || r.ws_indate), 0) / active.length);
  })();

  const chartData = useMemo(() => {
    const counts = {};
    records.filter(r => (r.ws_jstat || r.jStat) !== 'Complete').forEach(r => {
      const type = r.ws_wtype || r.jobType || 'Other';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [records]);

  const PIE_COLORS = ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#6366F1'];

  const handleSave = async (fd) => {
    try {
      const actor = { id: currentUser?.id, name: currentUser?.name || 'Admin', role: currentUser?.role || 'Admin' };
      if (editRec) { await updateRecord('ws', editRec.id, fd, { title: 'Workshop Job Updated', message: (fd.ws_vnum || fd.regNo || '') + ' — ' + (fd.ws_make || fd.make || '') + ' ' + (fd.ws_model || fd.model || ''), link: '/workshop', actor }); showToast('Updated!'); }
      else { 
        let wsId = fd.wsId;
        if (!wsId) {
          const cnt = await getNextCounter('ws'); 
          wsId = genId('JC', cnt);
        }
        await addRecord('ws', { ...fd, wsId, date: fd.ws_indate || fd.date || today(), tasks: fd.tasks || [] }, { title: 'Workshop Job Created', message: (fd.ws_vnum || fd.regNo || '') + ' — ' + (fd.ws_wtype || fd.jobType || ''), link: '/workshop', actor }); 
        showToast('Workshop job added!'); 
      }
      await refresh('ws'); setIsModalOpen(false);
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
  };

  const handleDelete = async (rec) => {
    if (!window.confirm(`Delete job ${rec.wsId} for ${rec.regNo}?`)) return;
    try { await deleteRecord('ws', rec.id); await refresh('ws'); showToast('Deleted.', 'info'); }
    catch (e) { showToast('Delete failed.', 'error'); }
  };

  const handleUpdateTasks = async (id, tasks) => {
    try { await updateRecord('ws', id, { tasks }); await refresh('ws'); }
    catch (e) { showToast('Failed to update tasks.', 'error'); }
  };

  const handleReadyToList = async (rec) => {
    // Cross-update matching stock record
    const stkRec = stock.find(s => s.regNo === (rec.ws_vnum || rec.regNo) || s.stkId === (rec.ws_stkid || rec.linkedStk));
    if (stkRec) {
      try {
        await updateRecord('stk', stkRec.id, { status: 'Ready for Sale', refurbDone: today() });
        await refresh('stk');
        showToast(`${rec.ws_vnum || rec.regNo} is now listed as "Ready for Sale" in the Stock register! ✨`);
      } catch (e) { showToast('Failed to update stock.', 'error'); return; }
    } else {
      showToast(`No matching stock record found for ${rec.ws_vnum || rec.regNo}.`, 'info');
    }
    
    // Discard the workshop record
    try {
      await deleteRecord('ws', rec.id);
      await refresh('ws');
      showToast('Workshop job finalized and discarded!', 'success');
    } catch (e) { showToast('Failed to discard workshop record.', 'error'); }
  };

  const handleExport = () => {
    if (filtered.length === 0) return showToast('No data to export.', 'info');
    const rows = filtered.map(r => ({
      'Job ID': r.wsId, 'Date': r.date || r.ws_indate, 'Reg No': r.ws_vnum || r.regNo, Make: r.ws_make || r.make, Model: r.ws_model || r.model,
      'Job Type': r.ws_wtype || r.jobType, 'Total Cost (INR)': r.total || (Number(r.ws_pc || 0) + Number(r.ws_lc || 0)), 'Technician': r.ws_tech || r.tech || '',
      'Tasks Count': (r.tasks || []).length, 'Tasks Done': (r.tasks || []).filter(t => t.done).length,
      Status: r.ws_jstat || r.jStat, Notes: r.ws_rem || r.notes || '',
    }));
    exportToExcel(rows, `workshop_jobs_${today()}.xlsx`);
  };

  return (
    <div className="page on" id="pg_workshop">
      {toast && <div className="toast-wrap"><div className={`toast ${toast.type === 'success' ? 'suc' : toast.type === 'error' ? 'err' : 'inf'}`} style={{ display: 'flex' }}><span style={{ flex: 1 }}>{toast.msg}</span><button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button></div></div>}

      <div className="ph">
        <div className="ph-left">
          <h1><div className="ph-icon" style={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)' }}><i className="fa fa-screwdriver-wrench"></i></div>Workshop / Refurb</h1>
          <p>Vehicle workshop jobs · Task checklists · Ready-to-list cross-update</p>
        </div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search reg / make…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <select className="flt" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="Open">Open</option><option value="In Process">In Process</option><option value="Complete">Complete</option>
          </select>
          <button className="btn btn-out btn-sm" onClick={handleExport}><i className="fa fa-file-csv"></i> Export</button>
          <button className="btn btn-or" onClick={() => { setEditRec(null); setIsModalOpen(true); }}><i className="fa fa-plus"></i> Add Job</button>
        </div>
      </div>

      {isModalOpen && <WsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editData={editRec} />}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        {[
          { icon: 'fa-tools', val: activeCount, lbl: 'Active Jobs', color: '#F59E0B' },
          { icon: 'fa-circle-check', val: doneCount, lbl: 'Completed', color: '#22C55E' },
          { icon: 'fa-clock', val: `${avgAge}d`, lbl: 'Avg Job Age', color: '#4A7CDE' },
          { icon: 'fa-indian-rupee-sign', val: fmt(totalCost), lbl: 'Active Job Cost', color: '#C8A84B' },
        ].map((k, i) => (
          <div key={i} className="kpi" style={{ borderLeft: `3px solid ${k.color}` }}>
            <div className="kpi-icon"><i className={`fa ${k.icon}`} style={{ color: k.color }}></i></div>
            <div className="kpi-val" style={{ fontSize: k.icon === 'fa-indian-rupee-sign' ? 13 : undefined }}>{k.val}</div>
            <div className="kpi-lbl">{k.lbl}</div>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      {chartData.length > 0 && (
        <div className="tc" style={{ marginBottom: 16 }}>
          <div className="tc-hdr">
            <div className="tc-title">📊 Active Jobs by Type</div>
          </div>
          <div style={{ height: 250, width: '100%', padding: '10px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="tc">
        <div className="tc-hdr">
          <div className="tc-title">
            <i className="fa fa-screwdriver-wrench" style={{ color: 'var(--warn)' }}></i> Workshop Jobs
            <span style={{ background: 'var(--warn)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>{activeCount} Active</span>
          </div>
          <div className="tc-acts" style={{ fontSize: 11, color: 'var(--text3)' }}>
            {`${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </div>
        </div>
        <div className="tbl-wrap">
          <table id="tbl_ws">
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th>Job ID</th><th>Inq ID</th><th>Date</th><th>Reg No.</th><th>Vehicle</th>
                <th>Job Type</th><th>Cost</th><th>Tasks</th><th>Status</th><th>Notes</th>
                <th style={{ minWidth: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map(r => {
                const tasks = r.tasks || [];
                const done = tasks.filter(t => t.done).length;
                const isExpanded = expandedId === r.id;
                return (
                  <React.Fragment key={r.id}>
                    <tr>
                      <td>
                        <button onClick={() => setExpandedId(isExpanded ? null : r.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 11, transition: '.2s', transform: isExpanded ? 'rotate(90deg)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 4 }}>
                          <i className="fa fa-chevron-right"></i>
                        </button>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--warn)', fontFamily: "'Space Grotesk',sans-serif" }}>{r.wsId || `JC-${String(Array.from(r.id || '').reduce((a,c) => a + c.charCodeAt(0), 0)).padStart(4, '0')}`}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text2)' }}>{r.ws_inqid || '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.date || r.ws_indate)}</td>
                      <td style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'var(--or1)' }}>{r.ws_vnum || r.regNo}</td>
                      <td>{r.ws_make || r.make} {r.ws_model || r.model}</td>
                      <td>{r.ws_wtype || r.jobType || '—'}</td>
                      <td className="amt-or">{fmt(r.total || (Number(r.ws_pc || 0) + Number(r.ws_lc || 0)))}</td>
                      <td>
                        {tasks.length > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 48, height: 4, background: 'var(--border)', borderRadius: 2 }}>
                              <div style={{ height: 4, background: done === tasks.length ? 'var(--success)' : 'var(--or1)', borderRadius: 2, width: `${Math.round(done / tasks.length * 100)}%` }}></div>
                            </div>
                            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{done}/{tasks.length}</span>
                          </div>
                        ) : <span style={{ color: 'var(--text3)', fontSize: 10 }}>—</span>}
                      </td>
                      <td><span className={`badge ${(r.ws_jstat || r.jStat) === 'Open' ? 'b-open' : (r.ws_jstat || r.jStat) === 'In Process' ? 'b-prog' : 'b-complete'}`}>{r.ws_jstat || r.jStat}</span></td>
                      <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.ws_prob || r.ws_rem || r.notes}>{r.ws_prob || r.ws_rem || r.notes || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          <button className="btn-icon bi-edit" title="Edit" onClick={() => { setEditRec(r); setIsModalOpen(true); }}><i className="fa fa-pen"></i></button>
                          <button className="btn-icon" title="Tasks / Expand" onClick={() => setExpandedId(isExpanded ? null : r.id)}
                            style={{ background: isExpanded ? 'rgba(200,168,75,.15)' : 'rgba(74,124,222,.1)', color: isExpanded ? 'var(--or1)' : 'var(--bl5)', width: 28, height: 28, borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className={`fa fa-${isExpanded ? 'chevron-up' : 'list-check'}`}></i>
                          </button>
                          {isManager && !r.readyToList && (
                            <button title="Finalize & Release to Showroom" onClick={() => handleReadyToList(r)}
                              style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', width: 28, height: 28, borderRadius: 5, border: '1px solid rgba(16, 185, 129, 0.3)', cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, boxShadow: '0 2px 6px rgba(16,185,129,0.1)' }}>
                              <i className="fa fa-wand-magic-sparkles"></i>
                            </button>
                          )}
                          {r.readyToList && <span title="Listed in Stock" style={{ color: 'var(--success)', fontSize: 11, display: 'flex', alignItems: 'center' }}><i className="fa fa-circle-check"></i></span>}
                          <button className="btn-icon bi-del" title="Delete" onClick={() => handleDelete(r)}><i className="fa fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ background: 'var(--surface2)' }}>
                        <td colSpan="11" style={{ padding: 0 }}>
                          <JobExpandPanel rec={r} onUpdateTasks={handleUpdateTasks} onReadyToList={handleReadyToList} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }) : (
                <tr><td colSpan="11" className="empty">
                  <i className="fa fa-screwdriver-wrench"></i><br />
                  {search || statusFilter ? 'No results found.' : 'No workshop jobs yet. Click "Add Job" to begin.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="tc-foot">
          <span className="pg-info">Showing {filtered.length} jobs</span>
          <Paginate total={filtered.length} page={page} setPage={setPage} />
        </div>
      </div>
    </div>
  );
};

export default Workshop;
