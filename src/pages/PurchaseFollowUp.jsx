import React, { useState, useEffect } from 'react';
import { PfuModal } from '../components/modals/PfuModal';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

const PurchaseFollowUp = () => {
  const [followUps, setFollowUps] = useState([]);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch from Firestore
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'pfu'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFollowUps(data);
      } catch (error) {
        console.error("Error fetching purchase follow ups: ", error);
      }
    };
    fetchData();
  }, []);

  const filteredFollowUps = followUps.filter(item => {
    return (item.id || '').toLowerCase().includes(search.toLowerCase()) || 
           (item.seller || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page on" id="pg_pur_follow">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-phone-flip"></i></div>
            Purchase Follow-Up
          </h1>
          <p>Call sequence · Mode · Negotiable Price · Offer Price · Rejection Reason</p>
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
      <PfuModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="tc">
        <div className="tbl-wrap">
          <table id="tbl_pfu">
            <thead>
              <tr>
                <th>FU ID</th>
                <th>Inq ID</th>
                <th>Seller</th>
                <th>Mobile</th>
                <th>Vehicle</th>
                <th>FU Date</th>
                <th>Mode</th>
                <th>Sequence</th>
                <th>Status</th>
                <th>Offer Price</th>
                <th>Next FU</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFollowUps.length > 0 ? (
                filteredFollowUps.map(item => (
                  <tr key={item.id}>
                    <td>{item.fuId || item.id}</td>
                    <td>{item.inqId}</td>
                    <td>{item.seller}</td>
                    <td>{item.mobile}</td>
                    <td>{item.vehicle}</td>
                    <td>{item.fuDate}</td>
                    <td>{item.mode}</td>
                    <td>{item.sequence}</td>
                    <td><span className={`badge b-${(item.status || '').toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                    <td>{item.offerPrice}</td>
                    <td>{item.nextFuDate}</td>
                    <td>
                      <button className="btn-icon bi-edit" title="Edit"><i className="fa fa-pen"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="empty">No follow-ups found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseFollowUp;
