import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [loginId, setLoginId] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Basic mock authentication for now, can integrate Firebase Auth later
    if (loginId && password) {
      navigate('/');
    }
  };

  return (
    <div id="loginWrap">
      <div className="lx">
        <div className="lx-top">
          <div className="lx-logo" id="lxLogoWrap">
            <i className="fa fa-car" id="lxLogoIcon"></i>
          </div>
          <div className="lx-brand">CARE<em>CAY</em></div>
          <div className="lx-sub">Carecay Private Limited — Used Car ERP</div>
        </div>
        <div className="lx-body">
          <div className="lx-tabs">
            <button 
              className={`lx-tab ${activeTab === 'admin' ? 'on' : ''}`} 
              onClick={() => setActiveTab('admin')}
            >
              <i className="fa fa-shield-halved"></i> Admin
            </button>
            <button 
              className={`lx-tab ${activeTab === 'purchase' ? 'on' : ''}`} 
              onClick={() => setActiveTab('purchase')}
            >
              <i className="fa fa-car"></i> Purchase
            </button>
            <button 
              className={`lx-tab ${activeTab === 'sales' ? 'on' : ''}`} 
              onClick={() => setActiveTab('sales')}
            >
              <i className="fa fa-chart-line"></i> Sales
            </button>
          </div>
          
          <label>Login ID</label>
          <input 
            placeholder="Enter Login ID" 
            value={loginId} 
            onChange={(e) => setLoginId(e.target.value)} 
          />
          
          <label>Password</label>
          <input 
            type="password" 
            placeholder="Enter Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          
          <button className="btn-login" onClick={handleLogin}>
            <i className="fa fa-right-to-bracket"></i> &nbsp;SIGN IN
          </button>
          
          <div className="lx-hint">
            Admin: <b>admin / admin123</b> &nbsp;|&nbsp; Purchase: <b>purchase / pur123</b> &nbsp;|&nbsp; Sales: <b>sales / sal123</b>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
