'use client';

import { useState, useEffect } from 'react';
import './settings.css';

interface Settings {
  restaurantName: string;
  mobileNumber: string;
  address: string;
  logoUrl: string;
  upiId: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    restaurantName: '',
    mobileNumber: '',
    address: '',
    logoUrl: '',
    upiId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update settings' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Loading settings...</div>;

  return (
    <div className="settings-container animate-fade-in">
      <div className="settings-header">
        <h2>Restaurant Settings</h2>
        <p>Manage your restaurant profile and global details</p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form card">
        {message && (
          <div className={`status-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="form-grid">
          <div className="form-section">
            <h3>General Information</h3>
            <div className="form-group">
              <label>Restaurant Name</label>
              <input 
                type="text" 
                value={settings.restaurantName} 
                onChange={e => setSettings({...settings, restaurantName: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Mobile Number (for WhatsApp/Contact)</label>
              <input 
                type="tel" 
                value={settings.mobileNumber} 
                onChange={e => setSettings({...settings, mobileNumber: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Restaurant Address</label>
              <textarea 
                value={settings.address} 
                onChange={e => setSettings({...settings, address: e.target.value})}
                rows={3}
                required 
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Branding & Payment</h3>
            <div className="form-group">
              <label>Logo URL</label>
              <input 
                type="text" 
                value={settings.logoUrl} 
                onChange={e => setSettings({...settings, logoUrl: e.target.value})}
                placeholder="https://example.com/logo.png"
              />
              {settings.logoUrl && (
                <div className="logo-preview">
                  <img src={settings.logoUrl} alt="Logo Preview" />
                </div>
              )}
            </div>
            <div className="form-group">
              <label>UPI ID (for payments)</label>
              <input 
                type="text" 
                value={settings.upiId} 
                onChange={e => setSettings({...settings, upiId: e.target.value})}
                placeholder="restaurant@upi"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
