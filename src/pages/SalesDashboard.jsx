import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { fmt, fmtDate, statusBadge } from '../utils/helpers';

const SalesDashboard = () => {
  const { data } = useData();
  const navigate = useNavigate();
  const sal = data.sal_inq || [];
  const scl = data.scl || [];
  const del = data.del || [];
  const td = data.td || [];

  const stats = useMemo(() => ({
    total: sal.length,
    newInq: sal.filter(r => r.status === 'New').length,
    inProgress: sal.filter(r => r.status === 'In-Progress').length,
    won: sal.filter(r => r.status === 'Closed-Won').length,
    lost: sal.filter(r => r.status === 'Closed-Lost').length,
    totalRevenue: scl.reduce((a, r) => a + (r.final || 0), 0),
    totalProfit: scl.reduce((a, r) => a + (r.profit || 0), 0),
    deliveries: del.length,
    testDrives: td.length,
  }), [data]);

  const recent = useMemo(() => sal.slice(-5).reverse(), [sal]);

  return (
    <div className="page on" id="pg_sal_dashboard">
      <div className="ph">
        <div className="ph-left"><h1><div className="ph-icon" style={{ background: 'linear-gradient(135deg,#1A56DB,#2563EB)' }}><i className="fa fa-tags"></i></div>Sales Dashboard</h1><p>Sales pipeline performance and overview</p></div>
        <div className="ph-actions">
          <button className="btn btn-or" onClick={() => navigate('/sales-inquiry')}><i className="fa fa-plus"></i> New Inquiry</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { icon: 'fa-tags', val: stats.total, lbl: 'Total Inquiries', color: '#1A56DB', link: '/sales-inquiry' },
          { icon: 'fa-hourglass-half', val: stats.inProgress, lbl: 'In-Progress', color: '#D97706', link: '/sales-inquiry' },
          { icon: 'fa-trophy', val: stats.won, lbl: 'Closed Won', color: '#059669', link: '/sales-closer' },
          { icon: 'fa-sack-dollar', val: fmt(stats.totalRevenue), lbl: 'Total Revenue', color: '#7C3AED', link: '/reports' },
          { icon: 'fa-star', val: stats.newInq, lbl: 'New Inquiries', color: '#0891B2', link: '/sales-inquiry' },
          { icon: 'fa-times-circle', val: stats.lost, lbl: 'Closed Lost', color: '#DC2626', link: '/sales-inquiry' },
          { icon: 'fa-truck', val: stats.deliveries, lbl: 'Deliveries', color: '#065F46', link: '/delivery' },
          { icon: 'fa-road', val: stats.testDrives, lbl: 'Test Drives', color: '#9D174D', link: '/test-drive' },
        ].map((k, i) => (
          <div key={i} className="kpi" style={{ background: `linear-gradient(135deg, ${k.color}, ${k.color}bb)`, border: 'none', cursor: 'pointer' }} onClick={() => navigate(k.link)}>
            <div className="kpi-icon" style={{ color: 'rgba(255,255,255,.8)' }}><i className={`fa ${k.icon}`}></i></div>
            <div className="kpi-val" style={{ color: '#fff' }}>{k.val}</div>
            <div className="kpi-lbl" style={{ color: 'rgba(255,255,255,.75)' }}>{k.lbl}</div>
          </div>
        ))}
      </div>

      <div className="tc">
        <div className="tc-hdr"><div className="tc-title">Recent Sales Inquiries</div><div className="tc-acts"><button className="btn btn-out btn-sm" onClick={() => navigate('/sales-inquiry')}>View All</button></div></div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>INQ ID</th><th>Date</th><th>Buyer</th><th>Budget</th><th>Status</th><th>Assigned</th></tr></thead>
            <tbody>
              {recent.length > 0 ? recent.map(r => (
                <tr key={r.id} onClick={() => navigate('/sales-inquiry')} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 700, color: 'var(--bl5)', fontFamily: "'Space Grotesk',sans-serif" }}>{r.salId || r.id?.slice(0, 12)}</td>
                  <td>{fmtDate(r.date)}</td><td style={{ fontWeight: 600 }}>{r.buyerName}</td>
                  <td className="amt-or">{fmt(r.budget)}</td>
                  <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                  <td>{r.assigned || '—'}</td>
                </tr>
              )) : <tr><td colSpan="6" className="empty">No sales inquiries yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default SalesDashboard;
