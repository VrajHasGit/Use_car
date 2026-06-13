import React, { useState, useEffect } from 'react';
import { DelModal } from '../components/modals/DelModal';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

const Delivery = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch from Firestore
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'del'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDeliveries(data);
      } catch (error) {
        console.error("Error fetching deliveries: ", error);
      }
    };
    fetchData();
  }, []);

  const filteredDeliveries = deliveries.filter(item => {
    return (item.id || '').toLowerCase().includes(search.toLowerCase()) || 
           (item.customer || '').toLowerCase().includes(search.toLowerCase()) ||
           (item.regNo || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page on" id="pg_delivery">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-truck-ramp-box"></i></div>
            Delivery
          </h1>
        </div>
        <div className="ph-actions">
          <input 
            className="srch" 
            placeholder="🔍 Search…" 
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
          />
          <button className="btn btn-or" onClick={() => setIsModalOpen(true)}><i className="fa fa-plus"></i> Add Delivery</button>
        </div>
      </div>
      <DelModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="tc">
        <div className="tbl-wrap">
          <table id="tbl_del">
            <thead>
              <tr>
                <th>Delivery ID</th>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Reg No.</th>
                <th>Expected Date</th>
                <th>Actual Date</th>
                <th>Delivered By</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map(item => (
                  <tr key={item.id}>
                    <td>{item.delId || item.id}</td>
                    <td>{item.bookingId}</td>
                    <td>{item.customer}</td>
                    <td>{item.vehicle}</td>
                    <td>{item.regNo}</td>
                    <td>{item.expectedDate}</td>
                    <td>{item.actualDate}</td>
                    <td>{item.deliveredBy}</td>
                    <td><span className={`badge b-${(item.status || '').toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                    <td>{item.remarks}</td>
                    <td>
                      <button className="btn-icon bi-edit" title="Edit"><i className="fa fa-pen"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="empty">No deliveries found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
