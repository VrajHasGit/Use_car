import React, { useState, useEffect } from 'react';
import { DnModal } from '../components/modals/DnModal';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

const DeliveryNote = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch from Firestore
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'dn'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotes(data);
      } catch (error) {
        console.error("Error fetching delivery notes: ", error);
      }
    };
    fetchData();
  }, []);

  const filteredNotes = notes.filter(item => {
    return (item.id || '').toLowerCase().includes(search.toLowerCase()) || 
           (item.customer || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page on" id="pg_delivery_note">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon" style={{background: 'linear-gradient(135deg,#0891B2,#06B6D4)'}}><i className="fa fa-file-lines"></i></div>
            Delivery Note
          </h1>
          <p>Vehicle handover note — Customer · Vehicle · Accessories · Signature</p>
        </div>
        <div className="ph-actions">
          <input 
            className="srch" 
            placeholder="🔍 Search…" 
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
          />
          <button className="btn btn-out btn-sm"><i className="fa fa-file-csv"></i> Export</button>
          <button className="btn btn-or" onClick={() => setIsModalOpen(true)}><i className="fa fa-plus"></i> New Delivery Note</button>
        </div>
      </div>
      <DnModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="tc">
        <div className="tbl-wrap">
          <table id="tbl_dn">
            <thead>
              <tr>
                <th>DN ID</th>
                <th>Booking ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Reg No.</th>
                <th>Handover By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.length > 0 ? (
                filteredNotes.map(item => (
                  <tr key={item.id}>
                    <td>{item.dnId || item.id}</td>
                    <td>{item.bookingId}</td>
                    <td>{item.date}</td>
                    <td>{item.customer}</td>
                    <td>{item.vehicle}</td>
                    <td>{item.regNo}</td>
                    <td>{item.handoverBy}</td>
                    <td><span className={`badge b-${(item.status || '').toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                    <td>
                      <button className="btn-icon bi-edit" title="Edit"><i className="fa fa-pen"></i></button>
                      <button className="btn-icon bi-print" title="Print DN"><i className="fa fa-print"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="empty">No delivery notes found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeliveryNote;
