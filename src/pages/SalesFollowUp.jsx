import React, { useState, useEffect } from 'react';
import { SfuModal } from '../components/modals/SfuModal';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

const SalesFollowUp = () => {
  const [followUps, setFollowUps] = useState([]);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch from Firestore
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'sfu'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFollowUps(data);
      } catch (error) {
        console.error("Error fetching sales follow ups: ", error);
      }
    };
    fetchData();
  }, []);

  const filteredFollowUps = followUps.filter(item => {
    return (item.id || '').toLowerCase().includes(search.toLowerCase()) || 
           (item.customer || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page on" id="pg_sal_follow">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-comments"></i></div>
            Sales Follow-Up
          </h1>
        </div>
        <div className="ph-actions">
          <input 
            className="srch" 
            placeholder="🔍 Search…" 
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
          />
          <button className="btn btn-or" onClick={() => setIsModalOpen(true)}><i className="fa fa-plus"></i> Add Follow-Up</button>
        </div>
      </div>
      <SfuModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="tc">
        <div className="tbl-wrap">
          <table id="tbl_sfu">
            <thead>
              <tr>
                <th>FU ID</th>
                <th>Inq ID</th>
                <th>Customer</th>
                <th>Make / Model</th>
                <th>Reg No.</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Sequence</th>
                <th>Status</th>
                <th>Next Date</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFollowUps.length > 0 ? (
                filteredFollowUps.map(item => (
                  <tr key={item.id}>
                    <td>{item.fuId || item.id}</td>
                    <td>{item.inqId}</td>
                    <td>{item.customer}</td>
                    <td>{item.makeModel}</td>
                    <td>{item.regNo}</td>
                    <td>{item.date}</td>
                    <td>{item.mode}</td>
                    <td>{item.sequence}</td>
                    <td><span className={`badge b-${(item.status || '').toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                    <td>{item.nextDate}</td>
                    <td>{item.remarks}</td>
                    <td>
                      <button className="btn-icon bi-edit" title="Edit"><i className="fa fa-pen"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="empty">No sales follow-ups found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesFollowUp;
