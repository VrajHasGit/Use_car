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

const Topbar = ({ isSlim, toggleSidebar, toggleDTM }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useData();
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [dismissedNotifs, setDismissedNotifs] = useState(() => JSON.parse(localStorage.getItem('dismissedNotifs') || '{}'));
  const prevDataRef = useRef({});
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

    const checkDismiss = (id) => dismissedNotifs[id] === todayStr;

    // Overdue purchase follow-ups
    const pfuOverdue = (data.pfu || []).filter(r => r.nextFU && r.nextFU < todayStr && r.status !== 'Closed-Won' && r.status !== 'Closed-Lost');
    if (pfuOverdue.length > 0 && !checkDismiss('pfu_overdue')) {
      notifs.push({ id: 'pfu_overdue', icon: 'fa-phone-volume', color: 'var(--warn)', title: 'Overdue Follow-ups', msg: `${pfuOverdue.length} purchase follow-ups are overdue!`, link: '/purchase-follow', time: 'Urgent' });
    }

    // Overdue sales follow-ups
    const sfuOverdue = (data.sfu || []).filter(r => r.nextFU && r.nextFU < todayStr);
    if (sfuOverdue.length > 0 && !checkDismiss('sfu_overdue')) {
      notifs.push({ id: 'sfu_overdue', icon: 'fa-comments', color: 'var(--danger)', title: 'Sales Reminders', msg: `${sfuOverdue.length} sales follow-ups are overdue!`, link: '/sales-follow', time: 'Urgent' });
    }

    // Open workshop jobs
    const wsOpen = (data.ws || []).filter(r => r.jStat === 'Open' || r.jStat === 'In Process');
    if (wsOpen.length > 0 && !checkDismiss('ws_open')) {
      notifs.push({ id: 'ws_open', icon: 'fa-wrench', color: 'var(--bl5)', title: 'Active Workshop', msg: `${wsOpen.length} active workshop job${wsOpen.length > 1 ? 's' : ''}`, link: '/workshop', time: 'Ongoing' });
    }

    // Pending deliveries
    const pendDel = (data.del || []).filter(r => r.status !== 'Delivered' && r.status !== 'Completed');
    if (pendDel.length > 0 && !checkDismiss('del_pend')) {
      notifs.push({ id: 'del_pend', icon: 'fa-truck', color: 'var(--success)', title: 'Pending Deliveries', msg: `${pendDel.length} vehicle${pendDel.length > 1 ? 's' : ''} waiting for delivery`, link: '/delivery', time: 'Action Needed' });
    }

    // New purchase inquiries (last 24h)
    const newPur = (data.pur_inq || []).filter(r => r.status === 'New');
    if (newPur.length > 0 && !checkDismiss('pur_new')) {
      notifs.push({ id: 'pur_new', icon: 'fa-car-side', color: 'var(--or1)', title: 'New Inquiries', msg: `${newPur.length} new purchase inquir${newPur.length > 1 ? 'ies' : 'y'}`, link: '/purchase-inquiry', time: 'New' });
    }

    return notifs;
  }, [data, dismissedNotifs]);

  const handleDismiss = (e, id) => {
    e.stopPropagation();
    const todayStr = new Date().toISOString().slice(0, 10);
    const updated = { ...dismissedNotifs, [id]: todayStr };
    setDismissedNotifs(updated);
    localStorage.setItem('dismissedNotifs', JSON.stringify(updated));
  };

  // Real-time diffing to trigger toasts
  useEffect(() => {
    const prev = prevDataRef.current;
    if (Object.keys(prev).length === 0) {
      prevDataRef.current = data;
      return;
    }

    const newToasts = [];

    // Check for new purchase inquiries
    const newPur = (data.pur_inq || []).filter(r => r.status === 'New' && !prev.pur_inq?.some(p => p.id === r.id));
    newPur.forEach(r => {
      newToasts.push({ id: Date.now() + Math.random(), icon: 'fa-car-side', color: 'var(--or1)', title: 'New Inquiry', msg: `Purchase inquiry from ${r.sellerName}`, link: '/purchase-inquiry' });
    });

    // Check for new workshop jobs
    const newWs = (data.ws || []).filter(r => !prev.ws?.some(p => p.id === r.id));
    newWs.forEach(r => {
      newToasts.push({ id: Date.now() + Math.random(), icon: 'fa-wrench', color: 'var(--bl5)', title: 'New Job Card', msg: `Workshop job ${r.wsId} created.`, link: '/workshop' });
    });

    if (newToasts.length > 0) {
      setToasts(t => [...t, ...newToasts]);
      setTimeout(() => {
        setToasts(t => t.filter(x => !newToasts.map(n => n.id).includes(x.id)));
      }, 5000);
    }

    prevDataRef.current = data;
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
    <div id="tb" className={`${isSlim ? 'slim' : ''}${mobileSearchOpen ? ' mob-search-open' : ''}`}>
      <button className="tb-menu" onClick={toggleSidebar}>
        <i className="fa fa-bars"></i>
      </button>

      <div className="tb-center">
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
        {/* Mobile Search Toggle */}
        <button
          className="tb-btn mob-search-btn"
          onClick={() => { setMobileSearchOpen(v => !v); }}
          title="Search"
          id="mobSearchBtn"
        >
          <i className={`fa ${mobileSearchOpen ? 'fa-times' : 'fa-search'}`}></i>
        </button>

        {/* Global Search */}
        <div className="tb-search-wrap" ref={searchRef}>
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

        {/* Daily Task Manager Toggle */}
        <button className="tb-btn" onClick={toggleDTM} title="Daily Task Manager" style={{ position: 'relative' }}>
          <i className="fa fa-clipboard-list"></i>
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
            <i className={`fa fa-bell ${notifications.length > 0 ? 'notif-bell-active' : ''}`}></i>
            {notifications.length > 0 && (
              <span id="notifBadge" style={{
                position: 'absolute', top: -4, right: -4,
                background: 'var(--danger)', color: '#fff',
                fontSize: 8, fontWeight: 700, minWidth: 16, height: 16,
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--surface)',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.4)'
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
              animation: 'slideDown 0.2s ease-out'
            }}>
              {/* Panel Header */}
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--surface2)',
              }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                  <i className="fa fa-bell" style={{ color: 'var(--or1)', marginRight: 10 }}></i>
                  Notification Center
                </div>
                <button
                  onClick={() => setShowNotif(false)}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text3)', width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                ><i className="fa fa-times" style={{ fontSize: 12 }}></i></button>
              </div>

              {/* Notification Items */}
              <div id="notifList" style={{ maxHeight: 420, overflowY: 'auto' }}>
                {notifications.length > 0 ? notifications.map((n) => (
                  <div
                    key={n.id}
                    className="notif-item-innovative"
                    style={{
                      padding: '16px 20px', borderBottom: '1px solid var(--border)',
                      display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => { navigate(n.link); setShowNotif(false); }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: `rgba(${n.color === 'var(--warn)' ? '217,119,6' : n.color === 'var(--danger)' ? '220,38,38' : n.color === 'var(--success)' ? '5,150,105' : n.color === 'var(--or1)' ? '255,107,0' : '8,145,178'}, 0.15)`, 
                      border: `1px solid rgba(255,255,255,0.1)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <i className={`fa ${n.icon}`} style={{ color: n.color, fontSize: 16 }}></i>
                    </div>
                    
                    <div style={{ flex: 1, paddingRight: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{n.title}</span>
                        <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.4, margin: 0 }}>{n.msg}</p>
                    </div>

                    <button 
                      onClick={(e) => handleDismiss(e, n.id)}
                      style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}
                      title="Dismiss"
                    >
                      <i className="fa fa-times" style={{ fontSize: 12 }}></i>
                    </button>
                  </div>
                )) : (
                  <div id="notifEmpty" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text3)' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <i className="fa fa-check-double" style={{ fontSize: 24, color: 'var(--success)' }}></i>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>All Caught Up!</div>
                    <div style={{ fontSize: 12 }}>You have no new notifications.</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Toasts */}
      <div className="real-toast-container">
        {toasts.map(t => (
          <div key={t.id} className="real-toast" style={{ cursor: t.link ? 'pointer' : 'default' }} onClick={() => { if (t.link) navigate(t.link); }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `rgba(255,255,255,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`fa ${t.icon}`} style={{ color: t.color, fontSize: 14 }}></i>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 2 }}>{t.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{t.msg}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Topbar;
