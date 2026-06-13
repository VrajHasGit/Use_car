import React, { useState, useEffect } from 'react';
import { ObModal } from '../components/modals/ObModal';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

const PurchaseBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch from Firestore
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'ob'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBookings(data);
      } catch (error) {
        console.error("Error fetching order bookings: ", error);
      }
    };
    fetchData();
  }, []);

  const filteredBookings = bookings.filter(item => {
    return (item.id || '').toLowerCase().includes(search.toLowerCase()) || 
           (item.client || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page on" id="pg_pur_booking">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-file-signature"></i></div>
            Purchase Order Booking
          </h1>
          <p>All booking fields from Excel — Client · Vehicle · Costs · Signatures</p>
        </div>
        <div className="ph-actions">
          <input 
            className="srch" 
            placeholder="🔍 Search…" 
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
          />
          <button className="btn btn-or" onClick={() => setIsModalOpen(true)}><i className="fa fa-plus"></i> Add Booking</button>
        </div>
      </div>
      <ObModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="tc">
        <div className="tbl-wrap">
          <table id="tbl_ob">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Date</th>
                <th>Client</th>
                <th>Contact</th>
                <th>Reg No.</th>
                <th>Make/Model</th>
                <th>Year</th>
                <th>Purchase Price</th>
                <th>Total Cost</th>
                <th>Branch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map(item => (
                  <tr key={item.id}>
                    <td>{item.obId || item.id}</td>
                    <td>{item.date}</td>
                    <td>{item.client}</td>
                    <td>{item.contact}</td>
                    <td>{item.regNo}</td>
                    <td>{item.makeModel}</td>
                    <td>{item.year}</td>
                    <td>{item.purchasePrice}</td>
                    <td>{item.totalCost}</td>
                    <td>{item.branch}</td>
                    <td>
                      <button className="btn-icon bi-edit" title="Edit"><i className="fa fa-pen"></i></button>
                      <button className="btn-icon bi-print" title="Print Booking"><i className="fa fa-print"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="empty">No bookings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseBooking;
