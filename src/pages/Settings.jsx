import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSettings, saveSettings } from '../services/db';
import { seedFirestore } from '../utils/seedData';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const [settings, setSettings] = useState({ compName: 'Carecay Private Limited', compShort: 'CARECAY', tagline: 'Carecay Pvt. Ltd.', gst: '', address: '', phone: '', email: '', theme: 'black-darkblue', font: 'Inter' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    getSettings().then(s => { if (s && Object.keys(s).length) setSettings(prev => ({ ...prev, ...s })); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try { await saveSettings(settings); showToast('Settings saved!'); } catch (e) { showToast('Failed: ' + e.message, 'error'); } finally { setSaving(false); }
  };

  const handleSeed = async () => {
    if (!window.confirm('This will re-seed all users and settings to Firestore. Proceed?')) return;
    setSeeding(true);
    try { const ok = await seedFirestore(); if (ok) showToast('Firestore seeded successfully!'); else showToast('Seeding failed.', 'error'); } catch (e) { showToast('Error: ' + e.message, 'error'); } finally { setSeeding(false); }
  };

  if (loading) return <div className="page on"><div style={{ padding: 48, textAlign: 'center' }}><i className="fa fa-spinner fa-spin" style={{ fontSize: 24, color: 'var(--or1)' }}></i></div></div>;

  return (
    <div className="page on" id="pg_settings">
      {toast && <div className="toast-wrap"><div className={`toast ${toast.type === 'success' ? 'suc' : 'err'}`} style={{ display: 'flex' }}><span style={{ flex: 1 }}>{toast.msg}</span><button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button></div></div>}
      <div className="ph">
        <div className="ph-left"><h1><div className="ph-icon"><i className="fa fa-gear"></i></div>Settings</h1><p>ERP configuration, company details, and user preferences</p></div>
        <div className="ph-actions">
          <button className="btn btn-or" onClick={handleSave} disabled={saving}>
            {saving ? <><i className="fa fa-spinner fa-spin"></i> Saving…</> : <><i className="fa fa-save"></i> Save Settings</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Company Info */}
        <div className="tc">
          <div className="tc-hdr"><div className="tc-title"><i className="fa fa-building" style={{ color: 'var(--or1)' }}></i> Company Information</div></div>
          <div className="m-body" style={{ padding: 20 }}>
            <div className="grid1"><div className="fg"><label>Company Name</label><input value={settings.compName || ''} onChange={e => setSettings(p => ({ ...p, compName: e.target.value }))} placeholder="Carecay Private Limited" /></div></div>
            <div className="grid2">
              <div className="fg"><label>Short Name</label><input value={settings.compShort || ''} onChange={e => setSettings(p => ({ ...p, compShort: e.target.value }))} placeholder="CARECAY" /></div>
              <div className="fg"><label>Tagline</label><input value={settings.tagline || ''} onChange={e => setSettings(p => ({ ...p, tagline: e.target.value }))} placeholder="Tagline" /></div>
            </div>
            <div className="grid2">
              <div className="fg"><label>GST Number</label><input value={settings.gst || ''} onChange={e => setSettings(p => ({ ...p, gst: e.target.value }))} placeholder="24AAACC1234F1Z5" /></div>
              <div className="fg"><label>Phone</label><input value={settings.phone || ''} onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" /></div>
            </div>
            <div className="grid1"><div className="fg"><label>Email</label><input value={settings.email || ''} onChange={e => setSettings(p => ({ ...p, email: e.target.value }))} placeholder="info@carecay.in" /></div></div>
            <div className="grid1"><div className="fg"><label>Address</label><textarea rows="2" value={settings.address || ''} onChange={e => setSettings(p => ({ ...p, address: e.target.value }))} placeholder="Full address" style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', padding: 8, fontFamily: 'inherit', fontSize: 12, color: 'var(--text)' }} /></div></div>
          </div>
        </div>

        {/* User Profile */}
        <div className="tc">
          <div className="tc-hdr"><div className="tc-title"><i className="fa fa-user-circle" style={{ color: 'var(--bl5)' }}></i> Logged-In User</div></div>
          <div className="m-body" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 16, background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,var(--or1),var(--or2))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
                {(currentUser?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', fontFamily: "'Space Grotesk', sans-serif" }}>{currentUser?.name || 'Administrator'}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{currentUser?.role} · {currentUser?.branch}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Login ID: <b style={{ color: 'var(--or1)' }}>{currentUser?.lid}</b></div>
              </div>
            </div>
            <div className="grid2">
              <div className="fg"><label>Theme</label>
                <select value={settings.theme || 'black-darkblue'} onChange={e => setSettings(p => ({ ...p, theme: e.target.value }))}>
                  <option value="black-darkblue">Black + Dark Blue</option>
                  <option value="dark-green">Dark Green</option>
                  <option value="dark-purple">Dark Purple</option>
                </select>
              </div>
              <div className="fg"><label>Font</label>
                <select value={settings.font || 'Inter'} onChange={e => setSettings(p => ({ ...p, font: e.target.value }))}>
                  <option>Inter</option><option>Roboto</option><option>Space Grotesk</option><option>Outfit</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button className="btn btn-out" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => { logout(); window.location.href = '/login'; }}>
                <i className="fa fa-right-from-bracket"></i> Logout
              </button>
              <button className="btn btn-out" onClick={handleSeed} disabled={seeding} style={{ fontSize: 11 }}>
                {seeding ? <><i className="fa fa-spinner fa-spin"></i> Seeding…</> : <><i className="fa fa-database"></i> Re-Seed Firestore</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
