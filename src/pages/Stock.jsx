import React, { useState, useEffect } from 'react';
import { StkModal } from '../components/modals/StkModal';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

const Stock = () => {
  const [stock, setStock] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch from Firestore
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'stk'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStock(data);
      } catch (error) {
        console.error("Error fetching stock: ", error);
      }
    };
    fetchData();
  }, []);

  const filteredStock = stock.filter(item => {
    const matchesSearch = (item.regNo || '').toLowerCase().includes(search.toLowerCase()) || 
                          (item.make || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page on" id="pg_stock">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-warehouse"></i></div>
            Car Stock
          </h1>
          <p>Full cost breakdown — Purchase · Refurb · RTO · Insurance → Total Cost · Profit · Days in Stock</p>
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
            <option value="In Stock">In Stock</option>
            <option value="Under Refurb">Under Refurb</option>
            <option value="Ready for Sale">Ready for Sale</option>
            <option value="Sold">Sold</option>
            <option value="On Hold">On Hold</option>
          </select>
          <button className="btn btn-out btn-sm"><i className="fa fa-clock"></i> Aging Report</button>
          <button className="btn btn-out btn-sm"><i className="fa fa-file-csv"></i> Export</button>
          <button className="btn btn-or" onClick={() => setIsModalOpen(true)}><i className="fa fa-plus"></i> Add Stock</button>
        </div>
      </div>
      <StkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="tc">
        <div className="tbl-wrap">
          <table id="tbl_stk">
            <thead>
              <tr>
                <th>Reg No.</th>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>Fuel</th>
                <th>KM</th>
                <th>Purchase ₹</th>
                <th>Total Cost ₹</th>
                <th>Sale Price ₹</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.length > 0 ? (
                filteredStock.map(item => (
                  <tr key={item.id}>
                    <td>{item.regNo}</td>
                    <td>{item.make}</td>
                    <td>{item.model}</td>
                    <td>{item.year}</td>
                    <td>{item.fuel}</td>
                    <td>{item.km}</td>
                    <td>{item.purchaseCost}</td>
                    <td>{item.totalCost}</td>
                    <td>{item.salePrice}</td>
                    <td><span className={`badge b-${(item.status || '').toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                    <td>
                      <button className="btn-icon bi-edit" title="Edit"><i className="fa fa-pen"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="empty">No stock found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stock;
