import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate } from '../utils/helpers';
import { UserModal } from '../components/modals/UserModal';

const roleClass = (role) => {
  const map = {
    Admin: 'role-admin', Partner: 'role-partner', Manager: 'role-manager',
    Closer: 'role-closer', Executive: 'role-executive', Sales: 'role-sales',
    Valuator: 'role-valuator', Workshop: 'role-workshop',
  };
  return map[role] || 'role-sales';
};

const MODULES = [
  'Purchase Inquiry', 'Valuation', 'Follow-Up', 'Purchase Closer', 'Order Booking',
  'Stock', 'Workshop', 'Sales Inquiry', 'Sales Closer', 'Sales OB',
  'Payment', 'Delivery', 'Documents', 'Reports', 'Settings',
];

const PERMS = {
  Admin:    MODULES,
  Partner:  MODULES,
  Manager:  MODULES.filter(m => m !== 'Settings'),
  Closer:   ['Purchase Inquiry', 'Purchase Closer', 'Stock', 'Workshop', 'Payment', 'Documents'],
  Executive:['Purchase Inquiry', 'Valuation', 'Follow-Up', 'Stock', 'Payment', 'Documents'],
  Sales:    ['Sales Inquiry', 'Follow-Up', 'Sales Closer', 'Sales OB', 'Delivery', 'Documents'],
  Valuator: ['Purchase Inquiry', 'Valuation', 'Stock'],
  Workshop: ['Workshop', 'Stock'],
};

const UserMgmt = () => {
  const { data, refresh } = useData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [editRec, setEditRec] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const records = data.users || [];
  const filtered = useMemo(() => records.filter(r =>
    !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
  ), [records, search]);

  const counts = useMemo(() => ({
    admin: records.filter(u => u.role === 'Admin' || u.role === 'Partner').length,
    mgr: records.filter(u => u.role === 'Manager').length,
    sales: records.filter(u => u.role === 'Closer' || u.role === 'Executive' || u.role === 'Sales').length,
    val: records.filter(u => u.role === 'Valuator').length,
    ws: records.filter(u => u.role === 'Workshop').length,
  }), [records]);

  const handleSave = async (fd) => {
    try {
      if (editRec) { await updateRecord('users', editRec.id, fd); showToast('User updated!'); }
      else {
        const cnt = await getNextCounter('USR');
        await addRecord('users', { ...fd, userId: genId('USR', cnt), date: fd.date || today() });
        showToast('User added: ' + fd.name);
      }
      await refresh('users'); setIsModalOpen(false);
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
  };

  const handleDelete = async (rec) => {
    if (!window.confirm(`Delete user "${rec.name}"?`)) return;
    try { await deleteRecord('users', rec.id); await refresh('users'); showToast('User deleted.', 'info'); }
    catch (e) { showToast('Delete failed.', 'error'); }
  };

  const canAccess = (role, mod) => PERMS[role] && PERMS[role].includes(mod);

  return (
    <div className="page on" id="pg_usermgmt">
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
          <h1>
            <div className="ph-icon" style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)' }}>
              <i className="fa fa-shield-halved"></i>
            </div>
            User Management
          </h1>
          <p>Role-based access control — Admin · Manager · Sales · Valuator · Workshop</p>
        </div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search users…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-or" onClick={() => { setEditRec(null); setModalMode('create'); setIsModalOpen(true); }}>
            <i className="fa fa-plus"></i> Add User
          </button>
        </div>
      </div>

      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          editData={editRec}
          initialMode={modalMode}
        />
      )}

      {/* Role Count KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { lbl: 'Admins', val: counts.admin, color: '#7C3AED', icon: 'fa-star' },
          { lbl: 'Managers', val: counts.mgr, color: '#2563EB', icon: 'fa-briefcase' },
          { lbl: 'Sales', val: counts.sales, color: '#059669', icon: 'fa-user-tie' },
          { lbl: 'Valuators', val: counts.val, color: '#E85D04', icon: 'fa-magnifying-glass' },
          { lbl: 'Workshop', val: counts.ws, color: '#15803D', icon: 'fa-wrench' },
        ].map((k, i) => (
          <div key={i} className="kpi" style={{ borderLeft: `3px solid ${k.color}` }}>
            <div className="kpi-icon"><i className={`fa ${k.icon}`} style={{ color: k.color }}></i></div>
            <div className="kpi-val">{k.val}</div>
            <div className="kpi-lbl">{k.lbl}</div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="tc" style={{ marginBottom: 16 }}>
        <div className="tc-hdr">
          <div className="tc-title">
            Users
            <span style={{ background: 'var(--bl5)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>
              {records.length}
            </span>
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>User ID</th><th>Name</th><th>Role</th><th>Login ID</th><th>Branch</th><th>Mobile</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <b style={{ color: 'var(--bl5)', fontFamily: "'Space Grotesk',sans-serif", fontSize: 11 }}>
                      {r.userId || r.id?.slice(0, 12)}
                    </b>
                  </td>
                  <td><b>{r.name}</b></td>
                  <td><span className={`role-pill ${roleClass(r.role)}`}>{r.role}</span></td>
                  <td>
                    <code style={{ fontSize: 11, background: 'var(--bg)', padding: '2px 6px', borderRadius: 4, color: 'var(--text2)' }}>
                      {r.lid || '—'}
                    </code>
                  </td>
                  <td>{r.branch || '—'}</td>
                  <td>{r.mobile || '—'}</td>
                  <td>
                    <span className={`badge ${r.status === 'Active' ? 'b-won' : 'b-lost'}`}>
                      {r.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <button className="btn-icon bi-view" title="View Details" onClick={() => { setEditRec(r); setModalMode('view'); setIsModalOpen(true); }}>
                        <i className="fa fa-eye"></i>
                      </button>
                      <button className="btn-icon bi-del" title="Delete" onClick={() => handleDelete(r)}>
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="empty">
                    <i className="fa fa-user-shield"></i><br />No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Matrix */}
      <div className="tc">
        <div className="tc-hdr">
          <div className="tc-title">
            <i className="fa fa-key" style={{ color: 'var(--or1)', marginRight: 6 }}></i>
            Role Permissions Matrix
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Module</th>
                {['Admin', 'Partner', 'Manager', 'Sales', 'Valuator', 'Workshop'].map(role => (
                  <th key={role}><span className={`role-pill ${roleClass(role)}`}>{role}</span></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map(mod => (
                <tr key={mod}>
                  <td style={{ fontWeight: 600, fontSize: 11 }}>{mod}</td>
                  {['Admin', 'Partner', 'Manager', 'Sales', 'Valuator', 'Workshop'].map(role => (
                    <td key={role} style={{ textAlign: 'center' }}>
                      {canAccess(role, mod)
                        ? <i className="fa fa-check" style={{ color: 'var(--success)' }}></i>
                        : <i className="fa fa-times" style={{ color: 'var(--border2)' }}></i>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserMgmt;
