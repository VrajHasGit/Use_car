import React, { useState, useEffect } from 'react';
import { PayModal } from '../components/modals/PayModal';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch from Firestore
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'pay'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPayments(data);
      } catch (error) {
        console.error("Error fetching payments: ", error);
      }
    };
    fetchData();
  }, []);

  const filteredPayments = payments.filter(item => {
    const matchesSearch = (item.id || '').toLowerCase().includes(search.toLowerCase()) || 
                          (item.regNo || '').toLowerCase().includes(search.toLowerCase()) ||
                          (item.buyerSeller || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? item.type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="page on" id="pg_payment">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-credit-card"></i></div>
            Payment
          </h1>
          <p>Token · Part Payment · Full Payment · Balance Pending auto-calc</p>
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Token">Token</option>
            <option value="Part Payment">Part Payment</option>
            <option value="Full Payment">Full Payment</option>
            <option value="Refund">Refund</option>
          </select>
          <button className="btn btn-out btn-sm"><i className="fa fa-file-csv"></i> Export</button>
          <button className="btn btn-or" onClick={() => setIsModalOpen(true)}><i className="fa fa-plus"></i> Add Payment</button>
        </div>
      </div>
      <PayModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="tc">
        <div className="tbl-wrap">
          <table id="tbl_pay">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Booking ID</th>
                <th>Seller/Buyer</th>
                <th>Reg No.</th>
                <th>Date</th>
                <th>Type</th>
                <th>Amount ₹</th>
                <th>Mode</th>
                <th>Cheque/UTR</th>
                <th>Bank</th>
                <th>Total Amt ₹</th>
                <th>Prev Paid ₹</th>
                <th>Balance ₹</th>
                <th>Hold Pay</th>
                <th>Authorized By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map(item => (
                  <tr key={item.id}>
                    <td>{item.paymentId || item.id}</td>
                    <td>{item.bookingId}</td>
                    <td>{item.buyerSeller}</td>
                    <td>{item.regNo}</td>
                    <td>{item.date}</td>
                    <td>{item.type}</td>
                    <td>{item.amount}</td>
                    <td>{item.mode}</td>
                    <td>{item.chequeUtr}</td>
                    <td>{item.bank}</td>
                    <td>{item.totalAmt}</td>
                    <td>{item.prevPaid}</td>
                    <td>{item.balance}</td>
                    <td>{item.holdPay ? 'Yes' : 'No'}</td>
                    <td>{item.authorizedBy}</td>
                    <td>
                      <button className="btn-icon bi-edit" title="Edit"><i className="fa fa-pen"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="16" className="empty">No payments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payment;
