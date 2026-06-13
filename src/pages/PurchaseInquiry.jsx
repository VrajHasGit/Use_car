import React, { useState, useEffect } from 'react';
import { PurInqModal } from '../components/modals/PurInqModal';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { exportToExcel } from '../utils/exportData';

const PurchaseInquiry = () => {
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch from Firestore
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'pur_inq'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInquiries(data);
      } catch (error) {
        console.error("Error fetching purchase inquiries: ", error);
      }
    };
    fetchData();
  }, []);

  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = (inq.id || '').toLowerCase().includes(search.toLowerCase()) || 
                          (inq.sellerName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? inq.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page on" id="pg_pur_inq">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-car"></i></div>
            Purchase Inquiry
          </h1>
          <p>All Excel Fields — Inquiry ID · Source · Seller · Vehicle · Status · Follow-up</p>
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
            <option value="New">New</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Closed-Won">Closed-Won</option>
            <option value="Closed-Lost">Closed-Lost</option>
            <option value="Hold">Hold</option>
          </select>
          <button className="btn btn-out btn-sm" onClick={() => exportToExcel(inquiries, 'Purchase_Inquiries.xlsx')}><i className="fa fa-file-csv"></i> Export</button>
          <button className="btn btn-or" onClick={() => setIsModalOpen(true)}><i className="fa fa-plus"></i> Add Inquiry</button>
        </div>
      </div>
      <PurInqModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="tc">
        <div className="tc-hdr">
          <div className="tc-title">Purchase Inquiries</div>
        </div>
        <div className="tbl-wrap">
          <table id="tbl_pur">
            <thead>
              <tr>
                <th>Inquiry ID</th>
                <th>Date</th>
                <th>Source</th>
                <th>Seller Name</th>
                <th>Mobile</th>
                <th>Make</th>
                <th>Model</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map(inq => (
                  <tr key={inq.id}>
                    <td>{inq.inqId || inq.id}</td>
                    <td>{inq.date}</td>
                    <td>{inq.source}</td>
                    <td>{inq.sellerName}</td>
                    <td>{inq.mobile}</td>
                    <td>{inq.make}</td>
                    <td>{inq.model}</td>
                    <td><span className={`badge b-${(inq.status || '').toLowerCase().replace(' ', '-')}`}>{inq.status}</span></td>
                    <td>
                      <button className="btn-icon bi-edit" title="Edit"><i className="fa fa-pen"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="empty">No inquiries found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseInquiry;
