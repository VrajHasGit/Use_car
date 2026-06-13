import React, { useState, useEffect } from 'react';
import { SobModal } from '../components/modals/SobModal';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

const SalesBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch from Firestore
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'sob'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBookings(data);
      } catch (error) {
        console.error("Error fetching sales bookings: ", error);
      }
    };
    fetchData();
  }, []);

  const filteredBookings = bookings.filter(item => {
    const matchesSearch = (item.id || '').toLowerCase().includes(search.toLowerCase()) || 
                          (item.clientName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page on" id="pg_sal_booking">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-clipboard-list"></i></div>
            Sales Order Booking
          </h1>
          <p>Used Car Sale Booking Form — Client · Car · Deal · Payment · Documents</p>
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
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button className="btn btn-out btn-sm"><i className="fa fa-file-csv"></i> Export</button>
          <button className="btn btn-or" onClick={() => setIsModalOpen(true)}><i className="fa fa-plus"></i> New Booking</button>
        </div>
      </div>
      <SobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="tc">
        <div className="tbl-wrap">
          <table id="tbl_sob">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Date</th>
                <th>Branch</th>
                <th>Client Name</th>
                <th>Contact</th>
                <th>Reg No.</th>
                <th>Make/Model</th>
                <th>Year</th>
                <th>Color</th>
                <th>KM</th>
                <th>Sale Price</th>
                <th>Total Amt</th>
                <th>Booking Amt</th>
                <th>Balance</th>
                <th>Sales Exec</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map(item => (
                  <tr key={item.id}>
                    <td>{item.bookingId || item.id}</td>
                    <td>{item.date}</td>
                    <td>{item.branch}</td>
                    <td>{item.clientName}</td>
                    <td>{item.contact}</td>
                    <td>{item.regNo}</td>
                    <td>{item.makeModel}</td>
                    <td>{item.year}</td>
                    <td>{item.color}</td>
                    <td>{item.km}</td>
                    <td>{item.salePrice}</td>
                    <td>{item.totalAmt}</td>
                    <td>{item.bookingAmt}</td>
                    <td>{item.balance}</td>
                    <td>{item.salesExec}</td>
                    <td><span className={`badge b-${(item.status || '').toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                    <td>
                      <button className="btn-icon bi-edit" title="Edit"><i className="fa fa-pen"></i></button>
                      <button className="btn-icon bi-print" title="Print Booking"><i className="fa fa-print"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="17" className="empty">No sales bookings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesBooking;
