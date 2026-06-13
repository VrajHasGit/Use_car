import React, { useState, useEffect } from 'react';
import { ValModal } from '../components/modals/ValModal';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

const Valuation = () => {
  const [valuations, setValuations] = useState([]);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch from Firestore
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'val'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setValuations(data);
      } catch (error) {
        console.error("Error fetching valuations: ", error);
      }
    };
    fetchData();
  }, []);

  const filteredValuations = valuations.filter(val => {
    return (val.id || '').toLowerCase().includes(search.toLowerCase()) || 
           (val.customer || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page on" id="pg_valuation">
      <div className="ph">
        <div className="ph-left">
          <h1>
            <div className="ph-icon"><i className="fa fa-magnifying-glass-chart"></i></div>
            Valuation
          </h1>
          <p>Vehicle inspection — RC · Insurance · Accident History · Condition</p>
        </div>
        <div className="ph-actions">
          <input 
            className="srch" 
            placeholder="🔍 Search…" 
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
          />
          <button className="btn btn-out btn-sm"><i className="fa fa-file-csv"></i> Export</button>
          <button className="btn btn-or" onClick={() => setIsModalOpen(true)}><i className="fa fa-plus"></i> Add Valuation</button>
        </div>
      </div>
      <ValModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="tc">
        <div className="tbl-wrap">
          <table id="tbl_val">
            <thead>
              <tr>
                <th>Val ID</th>
                <th>Inq ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Reg No.</th>
                <th>Make/Model</th>
                <th>Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredValuations.length > 0 ? (
                filteredValuations.map(val => (
                  <tr key={val.id}>
                    <td>{val.valId || val.id}</td>
                    <td>{val.inqId}</td>
                    <td>{val.date}</td>
                    <td>{val.customer}</td>
                    <td>{val.regNo}</td>
                    <td>{val.makeModel}</td>
                    <td>{val.year}</td>
                    <td><span className={`badge b-${(val.status || '').toLowerCase().replace(' ', '-')}`}>{val.status}</span></td>
                    <td>
                      <button className="btn-icon bi-edit" title="Edit"><i className="fa fa-pen"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="empty">No valuations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Valuation;
