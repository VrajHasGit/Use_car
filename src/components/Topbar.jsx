import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

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

const Topbar = ({ isSlim, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useData();
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  const title = PAGE_TITLES[location.pathname] || 'Carecay ERP';

  const handleSearch = (val) => {
    setSearchVal(val);
    if (!val.trim()) { setSearchResults([]); setShowSearch(false); return; }
    const q = val.toLowerCase();
    const results = [];

    // Search stock
    (data.stk || []).forEach(r => {
      if ((r.regNo || '').toLowerCase().includes(q) || (r.make || '').toLowerCase().includes(q) || (r.model || '').toLowerCase().includes(q)) {
        results.push({ type: '🚗 Stock', label: `${r.regNo} — ${r.make} ${r.model}`, id: r.id, link: '/stock' });
      }
    });

    // Search purchase inquiries
    (data.pur_inq || []).forEach(r => {
      if ((r.sellerName || '').toLowerCase().includes(q) || (r.mobile || '').includes(q)) {
        results.push({ type: '📥 Purchase Inq', label: `${r.sellerName} — ${r.make} ${r.model}`, id: r.id, link: '/purchase-inquiry' });
      }
    });

    // Search sales inquiries
    (data.sal_inq || []).forEach(r => {
      if ((r.buyerName || '').toLowerCase().includes(q) || (r.mobile || '').includes(q)) {
        results.push({ type: '🏷 Sales Inq', label: `${r.buyerName}`, id: r.id, link: '/sales-inquiry' });
      }
    });

    setSearchResults(results.slice(0, 10));
    setShowSearch(results.length > 0);
  };

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
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
          {title !== 'Dashboard' && <><i className="fa fa-chevron-right" style={{ fontSize: 9 }}></i><span style={{ color: 'var(--text)' }}>{title}</span></>}
        </div>
      </div>

      <div className="tb-right">
        {/* Global Search */}
        <div style={{ position: 'relative' }} ref={searchRef}>
          <input
            className="tb-search"
            id="gsInput"
            placeholder="🔍 Search car / reg no / customer…"
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
                  style={{
                    padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <span style={{ fontSize: 11, color: 'var(--text3)', minWidth: 90 }}>{r.type}</span>
                  <span style={{ fontSize: 12, color: 'var(--text)' }}>{r.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export current */}
        <button className="tb-btn" onClick={() => window.print()} title="Print">
          <i className="fa fa-print"></i>
        </button>

        {/* Notifications */}
        <button className="tb-btn" title="Notifications" style={{ position: 'relative' }}>
          <i className="fa fa-bell"></i>
        </button>
      </div>
    </div>
  );
};

export default Topbar;
