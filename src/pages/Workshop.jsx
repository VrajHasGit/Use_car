import React, { useState, useEffect } from 'react';
import { WsModal } from '../components/modals/WsModal';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

const Workshop = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch from Firestore
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'ws'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(data);
      } catch (error) {
        console.error("Error fetching workshop jobs: ", error);
      }
    };
    fetchData();
  }, []);

  const filteredJobs = jobs.filter(item => {
    const matchesSearch = (item.id || '').toLowerCase().includes(search.toLowerCase()) || 
                          (item.customer || '').toLowerCase().includes(search.toLowerCase()) ||
                          (item.vehicleNo || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page on" id="pg_workshop">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-screwdriver-wrench"></i></div>
            Workshop / Refurbishment
          </h1>
          <p>Job cards — Parts Cost · Labour Cost → Total Cost · Quality Check</p>
        </div>
        <div className="ph-actions">
          <input 
            className="srch" 
            placeholder="🔍 Search…" 
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
          />
          <select 
            className="flt" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Process">In Process</option>
            <option value="Complete">Complete</option>
          </select>
          <button className="btn btn-out btn-sm"><i className="fa fa-file-csv"></i> Export</button>
          <button className="btn btn-or" onClick={() => setIsModalOpen(true)}><i className="fa fa-plus"></i> New Job Card</button>
        </div>
      </div>
      <WsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="tc">
        <div className="tbl-wrap">
          <table id="tbl_ws">
            <thead>
              <tr>
                <th>Job Card No</th>
                <th>In Date</th>
                <th>Vehicle No.</th>
                <th>Make</th>
                <th>Model</th>
                <th>Customer</th>
                <th>Work Type</th>
                <th>Est. Cost ₹</th>
                <th>Parts ₹</th>
                <th>Labour ₹</th>
                <th>Total ₹</th>
                <th>Delivery</th>
                <th>Pay Status</th>
                <th>Job Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? (
                filteredJobs.map(item => (
                  <tr key={item.id}>
                    <td>{item.jobNo || item.id}</td>
                    <td>{item.inDate}</td>
                    <td>{item.vehicleNo}</td>
                    <td>{item.make}</td>
                    <td>{item.model}</td>
                    <td>{item.customer}</td>
                    <td>{item.workType}</td>
                    <td>{item.estCost}</td>
                    <td>{item.partsCost}</td>
                    <td>{item.labourCost}</td>
                    <td>{item.totalCost}</td>
                    <td>{item.delivery}</td>
                    <td><span className={`badge b-${(item.payStatus || '').toLowerCase().replace(' ', '-')}`}>{item.payStatus}</span></td>
                    <td><span className={`badge b-${(item.status || '').toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                    <td>
                      <button className="btn-icon bi-edit" title="Edit"><i className="fa fa-pen"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="15" className="empty">No job cards found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Workshop;
