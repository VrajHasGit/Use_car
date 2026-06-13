import React, { useState, useEffect } from 'react';
import { SclModal } from '../components/modals/SclModal';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

const SalesCloser = () => {
  const [closers, setClosers] = useState([]);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch from Firestore
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'scl'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClosers(data);
      } catch (error) {
        console.error("Error fetching sales closers: ", error);
      }
    };
    fetchData();
  }, []);

  const filteredClosers = closers.filter(item => {
    return (item.id || '').toLowerCase().includes(search.toLowerCase()) || 
           (item.buyer || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page on" id="pg_sal_closer">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-trophy"></i></div>
            Sales Closer
          </h1>
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
      <SclModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="tc">
        <div className="tbl-wrap">
          <table id="tbl_scl">
            <thead>
              <tr>
                <th>Closer ID</th>
                <th>Inq ID</th>
                <th>Buyer</th>
                <th>Mobile</th>
                <th>Make / Model</th>
                <th>Reg No.</th>
                <th>Date</th>
                <th>Sale Price</th>
                <th>Discount</th>
                <th>Final Price</th>
                <th>Mode</th>
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
                    <td>{item.buyer}</td>
                    <td>{item.mobile}</td>
                    <td>{item.makeModel}</td>
                    <td>{item.regNo}</td>
                    <td>{item.date}</td>
                    <td>{item.salePrice}</td>
                    <td>{item.discount}</td>
                    <td>{item.finalPrice}</td>
                    <td>{item.mode}</td>
                    <td><span className={`badge b-${(item.status || '').toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                    <td>
                      <button className="btn-icon bi-edit" title="Edit"><i className="fa fa-pen"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="empty">No sales closers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesCloser;
