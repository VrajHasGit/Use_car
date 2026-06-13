import React, { useState, useEffect } from 'react';
import { GpModal } from '../components/modals/GpModal';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

const GatePass = () => {
  const [passes, setPasses] = useState([]);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch from Firestore
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'gp'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPasses(data);
      } catch (error) {
        console.error("Error fetching gate passes: ", error);
      }
    };
    fetchData();
  }, []);

  const filteredPasses = passes.filter(item => {
    return (item.id || '').toLowerCase().includes(search.toLowerCase()) || 
           (item.regNo || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page on" id="pg_gate_pass">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon" style={{background: 'linear-gradient(135deg,#6366F1,#8B5CF6)'}}><i className="fa fa-door-open"></i></div>
            Gate Pass
          </h1>
          <p>Security clearance for vehicle entry/exit</p>
        </div>
        <div className="ph-actions">
          <input 
            className="srch" 
            placeholder="🔍 Search…" 
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
          />
          <button className="btn btn-out btn-sm"><i className="fa fa-file-csv"></i> Export</button>
          <button className="btn btn-or" onClick={() => setIsModalOpen(true)}><i className="fa fa-plus"></i> New Gate Pass</button>
        </div>
      </div>
      <GpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="tc">
        <div className="tbl-wrap">
          <table id="tbl_gp">
            <thead>
              <tr>
                <th>GP ID</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Reg No.</th>
                <th>Driver Name</th>
                <th>Purpose</th>
                <th>Authorized By</th>
                <th>Security Guard</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPasses.length > 0 ? (
                filteredPasses.map(item => (
                  <tr key={item.id}>
                    <td>{item.gpId || item.id}</td>
                    <td>{item.dateTime}</td>
                    <td>{item.type}</td>
                    <td>{item.regNo}</td>
                    <td>{item.driverName}</td>
                    <td>{item.purpose}</td>
                    <td>{item.authorizedBy}</td>
                    <td>{item.securityGuard}</td>
                    <td><span className={`badge b-${(item.status || '').toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                    <td>
                      <button className="btn-icon bi-edit" title="Edit"><i className="fa fa-pen"></i></button>
                      <button className="btn-icon bi-print" title="Print GP"><i className="fa fa-print"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="empty">No gate passes found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GatePass;
