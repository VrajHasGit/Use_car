import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { addRecord, updateRecord, deleteRecord, getNextCounter } from '../services/db';
import { today, genId, fmtDate, statusBadge, fmt } from '../utils/helpers';
import { SalInqModal } from '../components/modals/SalInqModal';

const SalesInquiry = () => {
  const { data, refresh } = useData();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const inquiries = data.sal_inq || [];

  const filtered = inquiries.filter(inq => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      (inq.buyerName || '').toLowerCase().includes(q) ||
      (inq.mobile || '').includes(q) ||
      (inq.salId || '').toLowerCase().includes(q);
    const matchStatus = !statusFilter || inq.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = async (formData) => {
    try {
      if (editRecord) {
        await updateRecord('sal_inq', editRecord.id, formData);
        showToast('Sales inquiry updated!');
      } else {
        const cnt = await getNextCounter('sal');
        const salId = genId('SIN', cnt);
        await addRecord('sal_inq', { ...formData, salId, date: formData.date || today(), status: formData.status || 'New' });
        showToast('Sales inquiry added!');
      }
      await refresh('sal_inq');
      setIsModalOpen(false);
    } catch (e) {
      showToast('Failed to save: ' + e.message, 'error');
    }
  };

  const handleDelete = async (rec) => {
    if (!window.confirm(`Delete inquiry for ${rec.buyerName}?`)) return;
    try {
      await deleteRecord('sal_inq', rec.id);
      await refresh('sal_inq');
      showToast('Inquiry deleted.', 'info');
    } catch (e) {
      showToast('Delete failed.', 'error');
    }
  };

  const handleWhatsApp = (rec) => {
    const msg = encodeURIComponent(`Hello ${rec.buyerName}, we have some great cars matching your requirements at Carecay. Please visit or call us!`);
    window.open(`https://wa.me/91${rec.mobile}?text=${msg}`, '_blank');
  };

  return (
    <div className="page on" id="pg_sal_inq">
      {toast && (
        <div className="toast-wrap">
          <div className={`toast ${toast.type === 'success' ? 'suc' : toast.type === 'error' ? 'err' : 'inf'}`} style={{ display: 'flex' }}>
            <i className="fa fa-check-circle"></i>
            <span style={{ flex: 1 }}>{toast.msg}</span>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}

      <div className="ph">
        <div className="ph-left">
          <h1><div className="ph-icon"><i className="fa fa-tag"></i></div>Sales Inquiry</h1>
          <p>Buyer details · Budget · Preferred vehicle · Follow-up tracking</p>
        </div>
        <div className="ph-actions">
          <input className="srch" placeholder="🔍 Search buyer / mobile…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="flt" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Closed-Won">Closed-Won</option>
            <option value="Closed-Lost">Closed-Lost</option>
            <option value="Hold">Hold</option>
          </select>
          <button className="btn btn-or" onClick={() => { setEditRecord(null); setIsModalOpen(true); }}>
            <i className="fa fa-plus"></i> Add Inquiry
          </button>
        </div>
      </div>

      <SalInqModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editData={editRecord} />

      <div className="tc">
        <div className="tc-hdr">
          <div className="tc-title">
            <i className="fa fa-tags" style={{ color: 'var(--bl5)' }}></i> Sales Inquiries
            <span style={{ background: 'var(--bl5)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>{inquiries.length}</span>
          </div>
        </div>
        <div className="tbl-wrap">
          <table id="tbl_sal">
            <thead>
              <tr>
                <th>Inq ID</th><th>Date</th><th>Source</th><th>Buyer Name</th><th>Mobile</th>
                <th>Budget</th><th>Make Pref.</th><th>Status</th><th>Next F/U</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(inq => (
                <tr key={inq.id}>
                  <td style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'var(--bl5)' }}>{inq.salId || inq.id?.slice(0, 12)}</td>
                  <td>{fmtDate(inq.date)}</td>
                  <td>{inq.source}</td>
                  <td style={{ fontWeight: 600 }}>{inq.buyerName}</td>
                  <td><a href={`tel:${inq.mobile}`} style={{ color: 'var(--info)', textDecoration: 'none' }}>{inq.mobile}</a></td>
                  <td className="amt-or">{fmt(inq.budget)}</td>
                  <td>{inq.makePref || '—'}</td>
                  <td><span className={`badge ${statusBadge(inq.status)}`}>{inq.status || 'New'}</span></td>
                  <td>{inq.nextFU ? fmtDate(inq.nextFU) : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon bi-edit" title="Edit" onClick={() => { setEditRecord(inq); setIsModalOpen(true); }}><i className="fa fa-pen"></i></button>
                      {inq.mobile && (
                        <button title="WhatsApp" onClick={() => handleWhatsApp(inq)}
                          style={{ background: '#25D366', color: '#fff', width: 28, height: 28, borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 11 }}>
                          <i className="fa-brands fa-whatsapp"></i>
                        </button>
                      )}
                      <button className="btn-icon bi-del" title="Delete" onClick={() => handleDelete(inq)}><i className="fa fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="10" className="empty">
                  <i className="fa fa-search"></i><br />
                  {search || statusFilter ? 'No results match your search' : 'No sales inquiries yet. Click "Add Inquiry" to create one.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="tc-foot">
          <span className="pg-info">Showing {filtered.length} of {inquiries.length} inquiries</span>
        </div>
      </div>
    </div>
  );
};

export default SalesInquiry;
