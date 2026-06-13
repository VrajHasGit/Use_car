import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { fmt, fmtDate, statusBadge } from '../utils/helpers';

const PurchaseDashboard = () => {
  const { data } = useData();
  const navigate = useNavigate();
  const pur = data.pur_inq || [];
  const stk = data.stk || [];
  const ws = data.ws || [];
  const pcl = data.pcl || [];

  const stats = useMemo(() => ({
    total: pur.length,
    newInq: pur.filter(r => r.status === 'New').length,
    inProgress: pur.filter(r => r.status === 'In-Progress').length,
    won: pur.filter(r => r.status === 'Closed-Won').length,
    lost: pur.filter(r => r.status === 'Closed-Lost').length,
    stock: stk.filter(r => r.status === 'In Stock').length,
    wsOpen: ws.filter(r => r.jStat === 'Open' || r.jStat === 'In Process').length,
  }), [data]);

  const recent = useMemo(() => pur.slice(-5).reverse(), [pur]);

  return (
    <div className="page on" id="pg_pur_dashboard">
      <div className="ph">
        <div className="ph-left"><h1><div className="ph-icon" style={{ background: 'linear-gradient(135deg,#E85D04,#F97316)' }}><i className="fa fa-car-side"></i></div>Purchase Dashboard</h1><p>Purchase pipeline performance and overview</p></div>
        <div className="ph-actions">
          <button className="btn btn-or" onClick={() => navigate('/purchase-inquiry')}><i className="fa fa-plus"></i> New Inquiry</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { icon: 'fa-car-side', val: stats.total, lbl: 'Total Inquiries', color: '#E85D04', link: '/purchase-inquiry' },
          { icon: 'fa-hourglass-half', val: stats.inProgress, lbl: 'In-Progress', color: '#D97706', link: '/purchase-inquiry' },
          { icon: 'fa-check-circle', val: stats.won, lbl: 'Closed Won', color: '#059669', link: '/purchase-closer' },
          { icon: 'fa-warehouse', val: stats.stock, lbl: 'In Stock', color: '#1A56DB', link: '/stock' },
          { icon: 'fa-star', val: stats.newInq, lbl: 'New Inquiries', color: '#7C3AED', link: '/purchase-inquiry' },
          { icon: 'fa-times-circle', val: stats.lost, lbl: 'Closed Lost', color: '#DC2626', link: '/purchase-inquiry' },
          { icon: 'fa-screwdriver-wrench', val: stats.wsOpen, lbl: 'Workshop Open', color: '#0891B2', link: '/workshop' },
          { icon: 'fa-handshake', val: pcl.length, lbl: 'Purchase Deals', color: '#065F46', link: '/purchase-closer' },
        ].map((k, i) => (
          <div key={i} className="kpi" style={{ background: `linear-gradient(135deg, ${k.color}, ${k.color}bb)`, border: 'none', cursor: 'pointer' }} onClick={() => navigate(k.link)}>
            <div className="kpi-icon" style={{ color: 'rgba(255,255,255,.8)' }}><i className={`fa ${k.icon}`}></i></div>
            <div className="kpi-val" style={{ color: '#fff' }}>{k.val}</div>
            <div className="kpi-lbl" style={{ color: 'rgba(255,255,255,.75)' }}>{k.lbl}</div>
          </div>
        ))}
      </div>

      <div className="tc">
        <div className="tc-hdr"><div className="tc-title">Recent Purchase Inquiries</div><div className="tc-acts"><button className="btn btn-out btn-sm" onClick={() => navigate('/purchase-inquiry')}>View All</button></div></div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>INQ ID</th><th>Date</th><th>Seller</th><th>Vehicle</th><th>Status</th><th>Assigned</th></tr></thead>
            <tbody>
              {recent.length > 0 ? recent.map(r => (
                <tr key={r.id} onClick={() => navigate('/purchase-inquiry')} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 700, color: 'var(--or1)', fontFamily: "'Space Grotesk',sans-serif" }}>{r.inqId || r.id?.slice(0, 12)}</td>
                  <td>{fmtDate(r.date)}</td><td style={{ fontWeight: 600 }}>{r.sellerName}</td>
                  <td>{r.make} {r.model}</td>
                  <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                  <td>{r.assigned || '—'}</td>
                </tr>
              )) : <tr><td colSpan="6" className="empty">No purchase inquiries yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default PurchaseDashboard;
