import React from 'react';

const Topbar = ({ isSlim, toggleSidebar }) => {
  return (
    <div id="tb" className={isSlim ? 'slim' : ''}>
      <button className="tb-menu" onClick={toggleSidebar}>
        <i className="fa fa-bars"></i>
      </button>
      <div className="tb-title" id="pageTitle">Dashboard</div>
      <div className="tb-bc" id="pageBc">
        <span>Carecay</span> <i className="fa fa-chevron-right"></i> <span style={{color: 'var(--text)'}}>Overview</span>
      </div>
      
      <div className="tb-right">
        <input type="text" className="tb-search" placeholder="Search vehicle (Reg, ID)..." />
        <button className="tb-btn" title="Daily Tasks Panel">
          <i className="fa fa-list-check"></i>
        </button>
        <button className="tb-btn" title="Add New Shortcut">
          <i className="fa fa-plus"></i>
        </button>
        <button className="tb-btn" title="Notifications" style={{position: 'relative'}}>
          <i className="fa fa-bell"></i>
          <span className="sb-badge" style={{position: 'absolute', top: '-4px', right: '-4px'}}>3</span>
        </button>
      </div>
    </div>
  );
};

export default Topbar;
