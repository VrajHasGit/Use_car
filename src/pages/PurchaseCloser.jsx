import React, { useState, useEffect } from 'react';
import { PclModal } from '../components/modals/PclModal';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

const PurchaseCloser = () => {
  const [closers, setClosers] = useState([]);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch from Firestore
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'pcl'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClosers(data);
      } catch (error) {
        console.error("Error fetching purchase closers: ", error);
      }
    };
    fetchData();
  }, []);

  const filteredClosers = closers.filter(item => {
    return (item.id || '').toLowerCase().includes(search.toLowerCase()) || 
           (item.seller || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page on" id="pg_pur_closer">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-handshake"></i></div>
            Purchase Closer
          </h1>
          <p>Final agreed price · Token · Balance · Payment modes · Delivery date</p>
        </div>
        <div className="ph-actions">
          <input 
            className="srch" 
            placeholder="🔍 Search…" 
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
          />
          <button className="btn btn-or" onClick={() => setIsModalOpen(true)}><i className="fa fa-plus"></i> Add Closer</button>
        </div>
      </div>
      <PclModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="tc">
        <div className="tbl-wrap">
          <table id="tbl_pcl">
            <thead>
              <tr>
                <th>Closer ID</th>
                <th>Inq ID</th>
                <th>Seller</th>
                <th>Vehicle</th>
                <th>Date</th>
                <th>Agreed Price</th>
                <th>Token Amt</th>
                <th>Balance</th>
                <th>Pay Mode</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClosers.length > 0 ? (
                filteredClosers.map(item => (
                  <tr key={item.id}>
                    <td>{item.closerId || item.id}</td>
                    <td>{item.inqId}</td>
                    <td>{item.seller}</td>
                    <td>{item.vehicle}</td>
                    <td>{item.date}</td>
                    <td>{item.agreedPrice}</td>
                    <td>{item.tokenAmt}</td>
                    <td>{item.balance}</td>
                    <td>{item.payMode}</td>
                    <td>{item.type}</td>
                    <td><span className={`badge b-${(item.status || '').toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                    <td>
                      <button className="btn-icon bi-edit" title="Edit"><i className="fa fa-pen"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="empty">No closer records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseCloser;
