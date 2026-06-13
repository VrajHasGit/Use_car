import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CREDENTIALS_HINT = [
  { label: 'Admin', id: 'admin', pw: 'admin123' },
  { label: 'Purchase', id: 'purchase', pw: 'pur123' },
  { label: 'Sales', id: 'sales', pw: 'sal123' },
];

const BRANCHES = ['SG Highway', 'Vastral', 'Head Office'];

const Login = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [loginId, setLoginId] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [branch, setBranch] = useState('SG Highway');
  const [showBranch, setShowBranch] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const selectTab = (tab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'admin') {
      setLoginId('admin'); setPassword('admin123');
    } else if (tab === 'purchase') {
      setLoginId('purchase'); setPassword('pur123');
    } else {
      setLoginId('sales'); setPassword('sal123');
    }
    setShowBranch(tab !== 'admin');
  };

  const handleLogin = async () => {
    if (!loginId.trim() || !password.trim()) {
      setError('Please enter Login ID and Password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await login(loginId.trim(), password.trim(), showBranch ? branch : undefined);
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result.error || 'Login failed.');
      }
    } catch (e) {
      setError('Connection error. Please check your internet.');
    } finally {
      setLoading(false);
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
              onClick={() => selectTab('admin')}
            >
              <i className="fa fa-shield-halved"></i> Admin
            </button>
            <button
              className={`lx-tab ${activeTab === 'purchase' ? 'on' : ''}`}
              onClick={() => selectTab('purchase')}
            >
              <i className="fa fa-car"></i> Purchase
            </button>
            <button
              className={`lx-tab ${activeTab === 'sales' ? 'on' : ''}`}
              onClick={() => selectTab('sales')}
            >
              <i className="fa fa-chart-line"></i> Sales
            </button>
          </div>

          <label>Login ID</label>
          <input
            id="lId"
            placeholder="Enter Login ID"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />

          <label>Password</label>
          <input
            id="lPw"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />

          {showBranch && (
            <div id="lBranch">
              <label>Branch</label>
              <select id="lBranchSel" value={branch} onChange={(e) => setBranch(e.target.value)}>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(248,113,113,0.1)', border: '1px solid #F87171',
              borderRadius: 'var(--radius-sm)', padding: '8px 12px',
              color: 'var(--danger)', fontSize: 12, marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <i className="fa fa-circle-exclamation"></i> {error}
            </div>
          )}

          <button
            className="btn-login"
            onClick={handleLogin}
            disabled={loading}
            style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
          >
            {loading ? (
              <><i className="fa fa-spinner fa-spin"></i> &nbsp;SIGNING IN…</>
            ) : (
              <><i className="fa fa-right-to-bracket"></i> &nbsp;SIGN IN</>
            )}
          </button>

          <div className="lx-hint">
            Admin: <b>admin / admin123</b> &nbsp;|&nbsp;
            Purchase: <b>purchase / pur123</b> &nbsp;|&nbsp;
            Sales: <b>sales / sal123</b>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
