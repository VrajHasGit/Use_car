import React from 'react';

const Reports = () => {
  return (
    <div className="page on" id="pg_reports">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon" style={{ background: 'linear-gradient(135deg,#EC4899,#BE185D)' }}><i className="fa fa-chart-line"></i></div>
            Reports & Analytics
          </h1>
          <p>Exportable metrics and performance overviews</p>
        </div>
        <div className="ph-actions">
          <button className="btn btn-out btn-sm"><i className="fa fa-file-pdf"></i> PDF Report</button>
          <button className="btn btn-out btn-sm"><i className="fa fa-file-csv"></i> Excel</button>
        </div>
      </div>
      <div className="tc">
        <div className="tbl-wrap">
          <table id="tbl_reports">
            <thead>
              <tr>
                <th>Report Type</th>
                <th>Generated On</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Monthly Sales Report</td>
                <td>Today</td>
                <td><span className="badge b-won">Ready</span></td>
                <td><button className="btn-icon"><i className="fa fa-download"></i></button></td>
              </tr>
              <tr>
                <td>Inventory Aging Report</td>
                <td>Today</td>
                <td><span className="badge b-won">Ready</span></td>
                <td><button className="btn-icon"><i className="fa fa-download"></i></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
