import React from 'react';

const Dashboard = () => {
  return (
    <div className="page on" id="pg_dashboard">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-gauge-high"></i></div>
            Admin Overview
          </h1>
          <p>Real-time snapshot of dealership operations and performance.</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-icon" style={{color: 'var(--info)'}}><i className="fa fa-car-side"></i></div>
          <div className="kpi-val">42</div>
          <div className="kpi-lbl">Vehicles in Stock</div>
          <div className="kpi-trend up"><i className="fa fa-arrow-trend-up"></i> +3 this week</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon" style={{color: 'var(--success)'}}><i className="fa fa-sack-dollar"></i></div>
          <div className="kpi-val">₹1.2Cr</div>
          <div className="kpi-lbl">Total Sales (MTD)</div>
          <div className="kpi-trend up"><i className="fa fa-arrow-trend-up"></i> +12% vs last mo</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon" style={{color: 'var(--warn)'}}><i className="fa fa-hourglass-half"></i></div>
          <div className="kpi-val">8</div>
          <div className="kpi-lbl">Pending Deliveries</div>
          <div className="kpi-trend dn"><i className="fa fa-arrow-trend-down"></i> -2 since yest</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon" style={{color: 'var(--danger)'}}><i className="fa fa-file-circle-exclamation"></i></div>
          <div className="kpi-val">5</div>
          <div className="kpi-lbl">Missing Documents</div>
          <div className="kpi-trend dn"><i className="fa fa-circle-exclamation"></i> Action required</div>
        </div>
      </div>
      
      {/* Additional dashboard elements can go here */}
    </div>
  );
};

export default Dashboard;
