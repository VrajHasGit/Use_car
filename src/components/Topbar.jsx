import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { exportToExcel } from '../utils/exportData';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/purchase-dashboard': 'Purchase Dashboard',
  '/sales-dashboard': 'Sales Dashboard',
  '/purchase-inquiry': 'Purchase Inquiry',
  '/valuation': 'Valuation',
  '/purchase-follow': 'Purchase Follow-Up',
  '/purchase-closer': 'Purchase Closer',
  '/purchase-booking': 'Order Booking',
  '/payment': 'Payment',
  '/documents': 'Documents',
  '/sales-inquiry': 'Sales Inquiry',
  '/sales-follow': 'Sales Follow-Up',
  '/test-drive': 'Test Drive',
  '/stock': 'Car Stock',
  '/sales-closer': 'Sales Closer',
  '/sales-booking': 'Sales Order Booking',
  '/finance': 'Finance / Loan',
  '/gst-invoice': 'GST Invoice',
  '/delivery': 'Delivery',
  '/delivery-note': 'Delivery Note',
  '/gate-pass': 'Gate Pass',
  '/workshop': 'Workshop / Refurb',
  '/expenses': 'Expenses',
  '/customers': 'Customers',
  '/targets': 'Targets & Achievements',
  '/emp-perf': 'Employee Performance',
  '/user-mgmt': 'User Management',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

// Map route to data collection for export
const ROUTE_COLLECTION = {
  '/purchase-inquiry': 'pur_inq',
  '/valuation': 'val',
  '/purchase-follow': 'pfu',
  '/purchase-closer': 'pcl',
  '/purchase-booking': 'ob',
  '/payment': 'pay',
  '/documents': 'doc',
  '/sales-inquiry': 'sal_inq',
  '/sales-follow': 'sfu',
  '/test-drive': 'td',
  '/sales-closer': 'scl',
  '/sales-booking': 'sob',
  '/finance': 'fin',
  '/delivery': 'del',
  '/delivery-note': 'dn',
  '/gate-pass': 'gp',
  '/stock': 'stk',
  '/workshop': 'ws',
  '/expenses': 'exp_rec',
  '/customers': 'cust',
  '/targets': 'targets',
  '/user-mgmt': 'users',
};

const Topbar = ({ isSlim, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useData();
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  const title = PAGE_TITLES[location.pathname] || 'Carecay ERP';

  const handleSearch = (val) => {
    setSearchVal(val);
    if (!val.trim()) { setSearchResults([]); setShowSearch(false); return; }
    const q = val.toLowerCase();
    const results = [];

    (data.stk || []).forEach(r => {
      if ((r.regNo || '').toLowerCase().includes(q) || (r.make || '').toLowerCase().includes(q) || (r.model || '').toLowerCase().includes(q)) {
        results.push({ type: '🚗 Stock', label: `${r.regNo} — ${r.make} ${r.model}`, id: r.id, link: '/stock' });
      }
    });
    (data.pur_inq || []).forEach(r => {
      if ((r.sellerName || '').toLowerCase().includes(q) || (r.mobile || '').includes(q)) {
        results.push({ type: '📥 Purchase Inq', label: `${r.sellerName} — ${r.make} ${r.model}`, id: r.id, link: '/purchase-inquiry' });
      }
    });
    (data.sal_inq || []).forEach(r => {
      if ((r.buyerName || '').toLowerCase().includes(q) || (r.mobile || '').includes(q)) {
        results.push({ type: '🏷 Sales Inq', label: `${r.buyerName}`, id: r.id, link: '/sales-inquiry' });
      }
    });
    (data.cust || []).forEach(r => {
      if ((r.name || '').toLowerCase().includes(q) || (r.mobile || '').includes(q)) {
        results.push({ type: '👤 Customer', label: `${r.name} — ${r.mobile || ''}`, id: r.id, link: '/customers' });
      }
    });

    setSearchResults(results.slice(0, 10));
    setShowSearch(results.length > 0);
  };

  const handleExport = () => {
    const col = ROUTE_COLLECTION[location.pathname];
    if (!col || !data[col]) {
      alert('No exportable data on this page.');
      return;
    }
    const rows = data[col] || [];
    if (rows.length === 0) {
      alert('No data to export.');
      return;
    }
    exportToExcel(rows, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Compute notification items from live data
  const notifications = useMemo(() => {
    const notifs = [];
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    // Overdue purchase follow-ups
    const pfuOverdue = (data.pfu || []).filter(r => r.nextFU && r.nextFU < todayStr && r.status !== 'Closed-Won' && r.status !== 'Closed-Lost');
    if (pfuOverdue.length > 0) {
      notifs.push({ icon: 'fa-phone-volume', color: 'var(--warn)', msg: `${pfuOverdue.length} overdue purchase follow-up${pfuOverdue.length > 1 ? 's' : ''}`, link: '/purchase-follow' });
    }

    // Overdue sales follow-ups
    const sfuOverdue = (data.sfu || []).filter(r => r.nextFU && r.nextFU < todayStr);
    if (sfuOverdue.length > 0) {
      notifs.push({ icon: 'fa-comments', color: 'var(--danger)', msg: `${sfuOverdue.length} overdue sales follow-up${sfuOverdue.length > 1 ? 's' : ''}`, link: '/sales-follow' });
    }

    // Open workshop jobs
    const wsOpen = (data.ws || []).filter(r => r.jStat === 'Open' || r.jStat === 'In Process');
    if (wsOpen.length > 0) {
      notifs.push({ icon: 'fa-wrench', color: 'var(--bl5)', msg: `${wsOpen.length} active workshop job${wsOpen.length > 1 ? 's' : ''}`, link: '/workshop' });
    }

    // Pending deliveries
    const pendDel = (data.del || []).filter(r => r.status !== 'Delivered' && r.status !== 'Completed');
    if (pendDel.length > 0) {
      notifs.push({ icon: 'fa-truck', color: 'var(--success)', msg: `${pendDel.length} pending deliver${pendDel.length > 1 ? 'ies' : 'y'}`, link: '/delivery' });
    }

    // New purchase inquiries (last 24h)
    const newPur = (data.pur_inq || []).filter(r => r.status === 'New');
    if (newPur.length > 0) {
      notifs.push({ icon: 'fa-car-side', color: 'var(--or1)', msg: `${newPur.length} new purchase inquir${newPur.length > 1 ? 'ies' : 'y'}`, link: '/purchase-inquiry' });
    }

    return notifs;
  }, [data]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div id="tb" className={isSlim ? 'slim' : ''}>
      <button className="tb-menu" onClick={toggleSidebar}>
        <i className="fa fa-bars"></i>
      </button>

      <div>
        <div className="tb-title" id="tbTitle">{title}</div>
        <div className="tb-bc" id="tbBc">
          <i className="fa fa-home"></i><span>Home</span>
          {title !== 'Dashboard' && <>
            <i className="fa fa-chevron-right" style={{ fontSize: 9 }}></i>
            <span style={{ color: 'var(--text)' }}>{title}</span>
          </>}
        </div>
      </div>

      <div className="tb-right">
        {/* Global Search */}
        <div style={{ position: 'relative' }} ref={searchRef}>
          <input
            className="tb-search"
            id="gsInput"
            placeholder="🔍 Search car / reg / customer…"
            value={searchVal}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchVal && setShowSearch(searchResults.length > 0)}
          />
          {showSearch && (
            <div id="gsResults" style={{
              display: 'block', position: 'absolute', top: 36, right: 0,
              width: 380, maxHeight: 420, overflowY: 'auto',
              background: 'var(--surface)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-lg)', boxShadow: '0 12px 40px rgba(0,0,0,.5)',
              zIndex: 999,
            }}>
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  onClick={() => { navigate(r.link); setShowSearch(false); setSearchVal(''); }}
                  style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <span style={{ fontSize: 11, color: 'var(--text3)', minWidth: 100 }}>{r.type}</span>
                  <span style={{ fontSize: 12, color: 'var(--text)' }}>{r.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export current page data */}
        <button
          className="tb-btn"
          onClick={handleExport}
          title="Export to Excel"
          id="exportBtn"
        >
          <i className="fa fa-file-export"></i>
        </button>

        {/* Print */}
        <button className="tb-btn" onClick={() => window.print()} title="Print" id="printBtn">
          <i className="fa fa-print"></i>
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="tb-btn"
            id="notifBtn"
            onClick={() => setShowNotif(v => !v)}
            title="Notifications"
            style={{ position: 'relative' }}
          >
            <i className="fa fa-bell"></i>
            {notifications.length > 0 && (
              <span id="notifBadge" style={{
                position: 'absolute', top: -4, right: -4,
                background: 'var(--danger)', color: '#fff',
                fontSize: 8, fontWeight: 700, minWidth: 16, height: 16,
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--surface)',
              }}>
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {showNotif && (
            <div id="notifPanel" style={{
              position: 'absolute', top: 44, right: 0, width: 360,
              background: 'var(--surface)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-lg)', boxShadow: '0 12px 40px rgba(0,0,0,.5)',
              zIndex: 999, overflow: 'hidden',
            }}>
              {/* Panel Header */}
              <div style={{
                padding: '14px 16px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--surface2)',
              }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14 }}>
                  <i className="fa fa-bell" style={{ color: 'var(--or1)', marginRight: 8 }}></i>
                  Notifications
                </div>
                <button
                  onClick={() => setShowNotif(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text3)', fontSize: 14, cursor: 'pointer', lineHeight: 1 }}
                >✕</button>
              </div>

              {/* Notification Items */}
              <div id="notifList" style={{ maxHeight: 420, overflowY: 'auto' }}>
                {notifications.length > 0 ? notifications.map((n, i) => (
                  <div
                    key={i}
                    className="notif-item"
                    style={{
                      padding: '12px 16px', borderBottom: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                    }}
                    onClick={() => { navigate(n.link); setShowNotif(false); }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'var(--surface2)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <i className={`fa ${n.icon}`} style={{ color: n.color, fontSize: 13 }}></i>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text)', flex: 1 }}>{n.msg}</span>
                    <i className="fa fa-chevron-right" style={{ fontSize: 9, color: 'var(--text3)' }}></i>
                  </div>
                )) : (
                  <div id="notifEmpty" style={{ padding: 32, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
                    <i className="fa fa-bell-slash" style={{ fontSize: 24, display: 'block', marginBottom: 8, opacity: .4 }}></i>
                    No notifications — all clear! ✅
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
