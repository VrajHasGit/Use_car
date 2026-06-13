import React from 'react';

const Settings = () => {
  return (
    <div className="page on" id="pg_settings">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-sliders"></i></div>
            Settings
          </h1>
          <p>System configuration, appearance, and data management</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="set-card">
          <h4><i className="fa fa-palette"></i> Theme Color</h4>
          <p style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '14px', marginTop: '-6px' }}>Select a color scheme.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            <div className="theme-swatch active"><span>Black + Dark Blue</span></div>
            <div className="theme-swatch"><span>Navy Blue + White</span></div>
          </div>
        </div>
        <div className="set-card">
          <h4><i className="fa fa-font"></i> Font Style</h4>
          <p style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '14px', marginTop: '-6px' }}>Select a typeface.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="font-opt active"><div><div className="font-opt-name">Inter</div></div></div>
          </div>
        </div>
      </div>
      <div className="set-grid">
        <div className="set-card">
          <h4><i className="fa fa-building"></i> Company Profile</h4>
          <div className="fg" style={{ marginBottom: '10px' }}><label>Company Name</label><input defaultValue="CARECAY" /></div>
          <div className="fg" style={{ marginBottom: '10px' }}><label>Tagline</label><input defaultValue="Carecay Private Limited" /></div>
          <button className="btn btn-or" style={{ marginTop: '6px' }}><i className="fa fa-save"></i> Save</button>
        </div>
        <div className="set-card">
          <h4><i className="fa fa-users-gear"></i> User Management</h4>
          <table>
            <thead><tr><th>User</th><th>Role</th><th>Branch</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>Admin</td><td><span className="badge b-won">Admin</span></td><td>All</td><td><span className="badge b-new">Active</span></td></tr>
            </tbody>
          </table>
        </div>
        <div className="set-card">
          <h4><i className="fa fa-database"></i> Data Management</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="btn btn-out"><i className="fa fa-file-export"></i> Export All Data (JSON)</button>
            <button className="btn btn-out" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}><i className="fa fa-rotate-left"></i> Reset Demo Data</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
