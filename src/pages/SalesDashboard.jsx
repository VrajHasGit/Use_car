import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { fmt, fmtDate, statusBadge } from '../utils/helpers';

const SalesDashboard = () => {
  const { data } = useData();
  const navigate = useNavigate();
  const sal = data.sal_inq || [];
  const scl = data.scl || [];
  const sob = data.sob || [];
  const del = data.del || [];
  const stk = data.stk || [];
  const td = data.td || [];

  const stats = useMemo(() => ({
    total: sal.length,
    newInq: sal.filter(r => r.status === 'New').length,
    inProgress: sal.filter(r => r.status === 'In-Progress').length,
    won: sal.filter(r => r.status === 'Closed-Won').length,
    lost: sal.filter(r => r.status === 'Closed-Lost').length,
    totalRevenue: scl.reduce((a, r) => a + (parseFloat(r.final) || 0), 0),
    totalProfit: scl.reduce((a, r) => a + (parseFloat(r.profit) || 0), 0),
    deliveries: del.length,
    pendingDel: del.filter(r => r.status !== 'Delivered' && r.status !== 'Completed').length,
    testDrives: td.length,
    totalBookings: sob.length,
    avgSale: scl.length > 0 ? scl.reduce((a, r) => a + (parseFloat(r.final) || 0), 0) / scl.length : 0,
  }), [data]);

  const recentInq = useMemo(() => sal.slice(-5).reverse(), [sal]);
  const recentScl = useMemo(() => scl.slice(-5).reverse(), [scl]);
  const recentSob = useMemo(() => sob.slice(-5).reverse(), [sob]);
  const pendingDel = useMemo(() => del.filter(r => r.status !== 'Delivered' && r.status !== 'Completed').slice(0, 5), [del]);
  const availStock = useMemo(() => stk.filter(r => r.status === 'In Stock').slice(0, 8), [stk]);

  return (
    <div className="page on" id="pg_sal_dashboard">
      {/* Page Header */}
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon" style={{ background: 'linear-gradient(135deg,#0891B2,#06B6D4)' }}>
              <i className="fa fa-chart-line"></i>
            </div>
            Sales Dashboard
          </h1>
          <p>Sales pipeline live overview — Inquiries · Follow-ups · Closers · Deliveries</p>
        </div>
        <div className="ph-actions">
          <button className="btn btn-out btn-sm" onClick={() => window.location.reload()}>
            <i className="fa fa-rotate"></i> Refresh
          </button>
          <button className="btn btn-or" onClick={() => navigate('/sales-inquiry')}>
            <i className="fa fa-plus"></i> New Inquiry
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {[
          { icon: 'fa-tags', val: stats.total, lbl: 'Total Inquiries', color: '#1A56DB', link: '/sales-inquiry' },
          { icon: 'fa-hourglass-half', val: stats.inProgress, lbl: 'In-Progress', color: '#D97706', link: '/sales-inquiry' },
          { icon: 'fa-trophy', val: stats.won, lbl: 'Closed Won', color: '#059669', link: '/sales-closer' },
          { icon: 'fa-clipboard-list', val: stats.totalBookings, lbl: 'Order Bookings', color: '#7C3AED', link: '/sales-booking' },
          { icon: 'fa-star', val: stats.newInq, lbl: 'New Inquiries', color: '#0891B2', link: '/sales-inquiry' },
          { icon: 'fa-road', val: stats.testDrives, lbl: 'Test Drives', color: '#9D174D', link: '/test-drive' },
          { icon: 'fa-truck', val: stats.pendingDel, lbl: 'Pending Deliveries', color: '#065F46', link: '/delivery' },
          { icon: 'fa-times-circle', val: stats.lost, lbl: 'Closed Lost', color: '#DC2626', link: '/sales-inquiry' },
        ].map((k, i) => (
          <div key={i} className="kpi" style={{ background: `linear-gradient(135deg, ${k.color}, ${k.color}bb)`, border: 'none', cursor: 'pointer' }} onClick={() => navigate(k.link)}>
            <div className="kpi-icon" style={{ color: 'rgba(255,255,255,.8)' }}><i className={`fa ${k.icon}`}></i></div>
            <div className="kpi-val" style={{ color: '#fff' }}>{k.val}</div>
            <div className="kpi-lbl" style={{ color: 'rgba(255,255,255,.75)' }}>{k.lbl}</div>
          </div>
        ))}
      </div>

      {/* Revenue Row */}
      <div className="pl-grid" style={{ gap: 14, marginBottom: 20 }}>
        {[
          { lbl: 'TOTAL REVENUE', val: fmt(stats.totalRevenue), color: 'var(--success)' },
          { lbl: 'TOTAL PROFIT', val: fmt(stats.totalProfit), color: 'var(--or1)' },
          { lbl: 'AVG SALE PRICE', val: fmt(stats.avgSale), color: 'var(--bl5)' },
          { lbl: 'TOTAL DELIVERIES', val: stats.deliveries, color: 'var(--info)' },
        ].map((p, i) => (
          <div key={i} className="pl-card">
            <div className="pl-val" style={{ color: p.color }}>{p.val}</div>
            <div className="pl-lbl">{p.lbl}</div>
          </div>
        ))}
      </div>

      {/* Recent Inquiries + Sales Closers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="tc">
          <div className="tc-hdr">
            <div className="tc-title"><i className="fa fa-tag" style={{ color: 'var(--or1)', marginRight: 6 }}></i>Recent Sales Inquiries</div>
            <div className="tc-acts">
              <button className="btn btn-or btn-sm" onClick={() => navigate('/sales-inquiry')}>View All</button>
            </div>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>ID</th><th>Buyer</th><th>Budget</th><th>Status</th><th>Next FU</th></tr></thead>
              <tbody>
                {recentInq.length > 0 ? recentInq.map(r => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/sales-inquiry')}>
                    <td style={{ fontWeight: 700, color: 'var(--bl5)', fontFamily: "'Space Grotesk',sans-serif", fontSize: 11 }}>{r.salId || r.id?.slice(0, 10)}</td>
                    <td style={{ fontWeight: 600 }}>{r.buyerName}</td>
                    <td className="amt-or">{fmt(r.budget)}</td>
                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                    <td style={{ color: 'var(--text3)' }}>{r.nextFU ? fmtDate(r.nextFU) : '—'}</td>
                  </tr>
                )) : <tr><td colSpan="5" className="empty">No inquiries yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tc">
          <div className="tc-hdr">
            <div className="tc-title"><i className="fa fa-trophy" style={{ color: 'var(--or1)', marginRight: 6 }}></i>Sales Closers</div>
            <div className="tc-acts">
              <button className="btn btn-or btn-sm" onClick={() => navigate('/sales-closer')}>View All</button>
            </div>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>ID</th><th>Buyer</th><th>Vehicle</th><th>Final Price</th><th>Status</th></tr></thead>
              <tbody>
                {recentScl.length > 0 ? recentScl.map(r => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/sales-closer')}>
                    <td style={{ fontWeight: 700, color: 'var(--success)', fontFamily: "'Space Grotesk',sans-serif", fontSize: 11 }}>{r.sclId || r.id?.slice(0, 10)}</td>
                    <td style={{ fontWeight: 600 }}>{r.buyerName}</td>
                    <td>{r.make} {r.model}</td>
                    <td className="amt-or">{fmt(r.final)}</td>
                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status || '—'}</span></td>
                  </tr>
                )) : <tr><td colSpan="5" className="empty">No sales deals yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sales Bookings + Pending Deliveries */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="tc">
          <div className="tc-hdr">
            <div className="tc-title"><i className="fa fa-clipboard-list" style={{ color: 'var(--or1)', marginRight: 6 }}></i>Sales Order Bookings</div>
            <div className="tc-acts">
              <button className="btn btn-or btn-sm" onClick={() => navigate('/sales-booking')}>View All</button>
            </div>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>SOB#</th><th>Customer</th><th>Vehicle</th><th>Sale Price</th><th>Status</th></tr></thead>
              <tbody>
                {recentSob.length > 0 ? recentSob.map(r => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/sales-booking')}>
                    <td style={{ fontWeight: 700, color: 'var(--bl5)', fontFamily: "'Space Grotesk',sans-serif", fontSize: 11 }}>{r.sobId || r.id?.slice(0, 10)}</td>
                    <td style={{ fontWeight: 600 }}>{r.buyerName || r.customerName}</td>
                    <td>{r.make} {r.model}</td>
                    <td className="amt-or">{fmt(r.salePrice || r.finalPrice)}</td>
                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status || '—'}</span></td>
                  </tr>
                )) : <tr><td colSpan="5" className="empty">No bookings yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tc">
          <div className="tc-hdr">
            <div className="tc-title"><i className="fa fa-truck" style={{ color: 'var(--or1)', marginRight: 6 }}></i>Pending Deliveries</div>
            <div className="tc-acts">
              <button className="btn btn-or btn-sm" onClick={() => navigate('/delivery')}>View All</button>
            </div>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>ID</th><th>Customer</th><th>Vehicle</th><th>Expected</th><th>Status</th></tr></thead>
              <tbody>
                {pendingDel.length > 0 ? pendingDel.map(r => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/delivery')}>
                    <td style={{ fontWeight: 700, color: 'var(--or1)', fontFamily: "'Space Grotesk',sans-serif", fontSize: 11 }}>{r.delId || r.id?.slice(0, 10)}</td>
                    <td style={{ fontWeight: 600 }}>{r.buyerName || r.customerName}</td>
                    <td>{r.make} {r.model}</td>
                    <td style={{ color: 'var(--text3)' }}>{r.expectedDate ? fmtDate(r.expectedDate) : '—'}</td>
                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status || 'Pending'}</span></td>
                  </tr>
                )) : <tr><td colSpan="5" className="empty">No pending deliveries</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Available Stock for Sale */}
      <div className="tc" style={{ marginBottom: 20 }}>
        <div className="tc-hdr">
          <div className="tc-title"><i className="fa fa-car" style={{ color: 'var(--or1)', marginRight: 6 }}></i>Available Stock for Sale</div>
          <div className="tc-acts">
            <button className="btn btn-or btn-sm" onClick={() => navigate('/stock')}>View Full Stock</button>
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr><th>Reg No.</th><th>Vehicle</th><th>Year</th><th>KM</th><th>Fuel</th><th>Sale Price</th><th>Status</th></tr>
            </thead>
            <tbody>
              {availStock.length > 0 ? availStock.map(r => (
                <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/stock')}>
                  <td style={{ fontWeight: 700, color: 'var(--bl5)', fontFamily: "'Space Grotesk',sans-serif" }}>{r.regNo || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{r.make} {r.model}</td>
                  <td>{r.year || '—'}</td>
                  <td>{r.km ? `${parseInt(r.km).toLocaleString('en-IN')} km` : '—'}</td>
                  <td>{r.fuel || '—'}</td>
                  <td className="amt-or">{r.sprice ? fmt(r.sprice) : '—'}</td>
                  <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                </tr>
              )) : <tr><td colSpan="7" className="empty"><i className="fa fa-car"></i><br />No stock available</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
