'use client';

import { useState, useEffect } from 'react';
import './settings.css';

interface Settings {
  restaurantName: string;
  mobileNumber: string;
  address: string;
  logoUrl: string;
  upiId: string;
  primaryColor: string;
  accentColor: string;
  gradientStart: string;
  gradientEnd: string;
  bgVariant: 'light' | 'dark' | 'glass';
  headerColor: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    restaurantName: '',
    mobileNumber: '',
    address: '',
    logoUrl: '',
    upiId: '',
    primaryColor: '#E53935',
    accentColor: '#FF7043',
    gradientStart: '#E53935',
    gradientEnd: '#B71C1C',
    bgVariant: 'light',
    headerColor: '#1A1A2E'
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
      if (data.success && data.settings) {
        console.log("Admin settings loaded:", data.settings);
        setSettings(prev => ({
          ...prev,
          ...data.settings
        }));
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
        setMessage({ type: 'error', text: data.details || data.error || 'Failed to update settings' });
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
        <h2>Restaurant Settings <span className="version-badge">v2.3</span></h2>
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

        <div className="theme-customization form-section card">
          <h3>Website Theme Customization</h3>
          <div className="theme-grid">
            <div className="form-group">
              <label>Primary Theme Color</label>
              <div className="color-picker-wrap">
                <input 
                  type="color" 
                  value={settings.primaryColor} 
                  onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                />
                <input 
                  type="text" 
                  value={settings.primaryColor} 
                  onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Accent Color</label>
              <div className="color-picker-wrap">
                <input 
                  type="color" 
                  value={settings.accentColor} 
                  onChange={e => setSettings({...settings, accentColor: e.target.value})}
                />
                <input 
                  type="text" 
                  value={settings.accentColor} 
                  onChange={e => setSettings({...settings, accentColor: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Header / Top Bar Color</label>
              <div className="color-picker-wrap">
                <input 
                  type="color" 
                  value={settings.headerColor} 
                  onChange={e => setSettings({...settings, headerColor: e.target.value})}
                />
                <input 
                  type="text" 
                  value={settings.headerColor} 
                  onChange={e => setSettings({...settings, headerColor: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Gradient Start (Top)</label>
              <div className="color-picker-wrap">
                <input 
                  type="color" 
                  value={settings.gradientStart} 
                  onChange={e => setSettings({...settings, gradientStart: e.target.value})}
                />
                <input 
                  type="text" 
                  value={settings.gradientStart} 
                  onChange={e => setSettings({...settings, gradientStart: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Gradient End (Bottom)</label>
              <div className="color-picker-wrap">
                <input 
                  type="color" 
                  value={settings.gradientEnd} 
                  onChange={e => setSettings({...settings, gradientEnd: e.target.value})}
                />
                <input 
                  type="text" 
                  value={settings.gradientEnd} 
                  onChange={e => setSettings({...settings, gradientEnd: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">

              <label>Background Style</label>
              <select 
                value={settings.bgVariant} 
                onChange={e => setSettings({...settings, bgVariant: e.target.value as any})}
              >
                <option value="light">Simple Light</option>
                <option value="dark">Professional Dark</option>
                <option value="glass">Modern Glassmorphism</option>
              </select>
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
