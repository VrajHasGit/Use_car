import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PurchaseDashboard from './pages/PurchaseDashboard';
import SalesDashboard from './pages/SalesDashboard';
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
import Finance from './pages/Finance';
import GstInvoice from './pages/GstInvoice';
import Expenses from './pages/Expenses';
import Customers from './pages/Customers';
import Targets from './pages/Targets';
import EmpPerf from './pages/EmpPerf';
import UserMgmt from './pages/UserMgmt';
import TestDrive from './pages/TestDrive';
import Documents from './pages/Documents';

import './index.css';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppInner() {
  const { currentUser } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={
        currentUser ? <Navigate to="/" replace /> : <Login />
      } />

      <Route path="/" element={
        <ProtectedRoute>
          <DataProvider>
            <Layout />
          </DataProvider>
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="purchase-dashboard" element={<PurchaseDashboard />} />
        <Route path="sales-dashboard" element={<SalesDashboard />} />
        {/* Purchase Pipeline */}
        <Route path="purchase-inquiry" element={<PurchaseInquiry />} />
        <Route path="valuation" element={<Valuation />} />
        <Route path="purchase-follow" element={<PurchaseFollowUp />} />
        <Route path="purchase-closer" element={<PurchaseCloser />} />
        <Route path="purchase-booking" element={<PurchaseBooking />} />
        <Route path="payment" element={<Payment />} />
        <Route path="documents" element={<Documents />} />
        {/* Sales Pipeline */}
        <Route path="sales-inquiry" element={<SalesInquiry />} />
        <Route path="sales-follow" element={<SalesFollowUp />} />
        <Route path="test-drive" element={<TestDrive />} />
        <Route path="sales-closer" element={<SalesCloser />} />
        <Route path="sales-booking" element={<SalesBooking />} />
        <Route path="finance" element={<Finance />} />
        <Route path="gst-invoice" element={<GstInvoice />} />
        <Route path="delivery" element={<Delivery />} />
        <Route path="delivery-note" element={<DeliveryNote />} />
        <Route path="gate-pass" element={<GatePass />} />
        {/* Inventory & Workshop */}
        <Route path="stock" element={<Stock />} />
        <Route path="workshop" element={<Workshop />} />
        <Route path="expenses" element={<Expenses />} />
        {/* Sales Tools */}
        <Route path="customers" element={<Customers />} />
        <Route path="targets" element={<Targets />} />
        <Route path="emp-perf" element={<EmpPerf />} />
        {/* Admin */}
        <Route path="user-mgmt" element={<UserMgmt />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  );
}
