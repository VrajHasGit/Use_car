import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isSlim, toggleCompanyModal }) => {
  return (
    <div id="sb" className={isSlim ? 'slim' : ''}>
      <div className="sb-hdr">
        <div className="sb-logo" onClick={toggleCompanyModal} title="Click to edit company" id="sbLogoWrap">
          <i className="fa fa-car" id="sbLogoIcon"></i>
        </div>
        <div className="sb-brand">
          <div className="sb-name" id="sbName">CARE<em>CAY</em></div>
          <div className="sb-tag" id="sbTag">Carecay Pvt. Ltd.</div>
        </div>
      </div>
      
      <nav className="sb-nav" id="sbNav">
        <div className="sb-sec" data-role="all">OVERVIEW</div>
        
        <NavLink to="/" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`}>
          <i className="fa fa-gauge-high sb-ico"></i>
          <span className="sb-lbl">Dashboard</span>
        </NavLink>
        
        <div className="sb-sec" data-role="all" style={{color: 'rgba(80,220,160,.7)'}}>📊 ROLE DASHBOARDS</div>
        
        <NavLink to="/purchase-dashboard" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`}>
          <i className="fa fa-car-side sb-ico" style={{color: '#34D399'}}></i>
          <span className="sb-lbl">Purchase Dashboard</span>
        </NavLink>

        <NavLink to="/sales-dashboard" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`}>
          <i className="fa fa-tags sb-ico" style={{color: '#67E8F9'}}></i>
          <span className="sb-lbl">Sales Dashboard</span>
        </NavLink>

        {/* Purchase Pipeline */}
        <div className="sb-sec" data-role="purchase admin" style={{color: 'rgba(255,160,80,.7)'}}>⬇ PURCHASE PIPELINE</div>
        <NavLink to="/purchase-inquiry" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`}>
          <i className="fa fa-car-side sb-ico"></i><span className="sb-lbl">Purchase Inquiry</span>
        </NavLink>
        <NavLink to="/valuation" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`} style={{paddingLeft: '22px'}}>
          <i className="fa fa-magnifying-glass-dollar sb-ico"></i><span className="sb-lbl">Valuation</span>
        </NavLink>
        <NavLink to="/purchase-follow" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`} style={{paddingLeft: '22px'}}>
          <i className="fa fa-phone-volume sb-ico"></i><span className="sb-lbl">Purchase Follow-Up</span>
        </NavLink>
        <NavLink to="/purchase-closer" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`} style={{paddingLeft: '22px'}}>
          <i className="fa fa-handshake sb-ico"></i><span className="sb-lbl">Purchase Closer</span>
        </NavLink>
        <NavLink to="/purchase-booking" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`} style={{paddingLeft: '22px'}}>
          <i className="fa fa-file-pen sb-ico"></i><span className="sb-lbl">Order Booking</span>
        </NavLink>

        {/* Sales Pipeline */}
        <div className="sb-sec" data-role="sales admin" style={{color: 'rgba(80,160,255,.7)'}}>⬇ SALES PIPELINE</div>
        <NavLink to="/sales-inquiry" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`}>
          <i className="fa fa-tags sb-ico"></i><span className="sb-lbl">Sales Inquiry</span>
        </NavLink>
        <NavLink to="/sales-follow" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`} style={{paddingLeft: '22px'}}>
          <i className="fa fa-comments sb-ico"></i><span className="sb-lbl">Sales Follow-Up</span>
        </NavLink>
        <NavLink to="/sales-closer" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`} style={{paddingLeft: '22px'}}>
          <i className="fa fa-trophy sb-ico"></i><span className="sb-lbl">Sales Closer</span>
        </NavLink>
        <NavLink to="/sales-booking" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`} style={{paddingLeft: '22px'}}>
          <i className="fa fa-clipboard-list sb-ico"></i><span className="sb-lbl">Order Booking</span>
        </NavLink>

        {/* Additional links can be added here progressively */}
        
        <div className="sb-sec" data-role="all" style={{color: 'rgba(255,255,255,.7)'}}>⬇ INVENTORY & WORKSHOP</div>
        <NavLink to="/stock" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`}>
          <i className="fa fa-warehouse sb-ico"></i><span className="sb-lbl">Car Stock</span>
        </NavLink>
        <NavLink to="/workshop" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`}>
          <i className="fa fa-screwdriver-wrench sb-ico"></i><span className="sb-lbl">Workshop</span>
        </NavLink>

        <div className="sb-sec" data-role="all" style={{color: 'rgba(167,139,250,.7)'}}>⬇ OPERATIONS</div>
        <NavLink to="/payment" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`}>
          <i className="fa fa-credit-card sb-ico"></i><span className="sb-lbl">Payment</span>
        </NavLink>
        <NavLink to="/delivery" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`}>
          <i className="fa fa-truck-ramp-box sb-ico"></i><span className="sb-lbl">Delivery</span>
        </NavLink>
        <NavLink to="/delivery-note" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`} style={{paddingLeft: '22px'}}>
          <i className="fa fa-file-lines sb-ico"></i><span className="sb-lbl">Delivery Note</span>
        </NavLink>
        <NavLink to="/gate-pass" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`} style={{paddingLeft: '22px'}}>
          <i className="fa fa-door-open sb-ico"></i><span className="sb-lbl">Gate Pass</span>
        </NavLink>

        <div className="sb-sec" data-role="all" style={{color: 'rgba(255,200,80,.7)'}}>⬇ ADMIN & SETTINGS</div>
        <NavLink to="/reports" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`}>
          <i className="fa fa-chart-pie sb-ico"></i><span className="sb-lbl">Reports</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `sb-item ${isActive ? 'act' : ''}`}>
          <i className="fa fa-sliders sb-ico"></i><span className="sb-lbl">Settings</span>
        </NavLink>
      </nav>
      
      <div className="sb-foot">
        <div className="sb-user">
          <div className="sb-avatar">AD</div>
          <div style={{overflow: 'hidden'}}>
            <div className="sb-uname">Admin User</div>
            <div className="sb-urole">admin</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
