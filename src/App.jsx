import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PurchaseInquiry from './pages/PurchaseInquiry';
import SalesInquiry from './pages/SalesInquiry';
import Valuation from './pages/Valuation';
import Stock from './pages/Stock';
import PurchaseCloser from './pages/PurchaseCloser';
import PurchaseFollowUp from './pages/PurchaseFollowUp';
import PurchaseBooking from './pages/PurchaseBooking';
import SalesFollowUp from './pages/SalesFollowUp';
import SalesCloser from './pages/SalesCloser';
import SalesBooking from './pages/SalesBooking';
import Workshop from './pages/Workshop';
import Payment from './pages/Payment';
import Delivery from './pages/Delivery';
import DeliveryNote from './pages/DeliveryNote';
import GatePass from './pages/GatePass';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

// Import our custom global styles extracted from the original HTML
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          {/* We will add more routes here for Purchase, Sales, etc. */}
          <Route path="purchase-dashboard" element={<Dashboard />} />
          <Route path="sales-dashboard" element={<Dashboard />} />
          <Route path="purchase-inquiry" element={<PurchaseInquiry />} />
          <Route path="sales-inquiry" element={<SalesInquiry />} />
          <Route path="valuation" element={<Valuation />} />
          <Route path="stock" element={<Stock />} />
          <Route path="purchase-closer" element={<PurchaseCloser />} />
          <Route path="purchase-follow" element={<PurchaseFollowUp />} />
          <Route path="purchase-booking" element={<PurchaseBooking />} />
          <Route path="sales-follow" element={<SalesFollowUp />} />
          <Route path="sales-closer" element={<SalesCloser />} />
          <Route path="sales-booking" element={<SalesBooking />} />
          <Route path="workshop" element={<Workshop />} />
          <Route path="payment" element={<Payment />} />
          <Route path="delivery" element={<Delivery />} />
          <Route path="delivery-note" element={<DeliveryNote />} />
          <Route path="gate-pass" element={<GatePass />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
