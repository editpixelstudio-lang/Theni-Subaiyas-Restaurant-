'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './login.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTestStatus({ type: 'loading', message: 'Testing database connection...' });
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      
      if (res.ok && data.success) {
        setTestStatus({ type: 'success', message: `Connected! Found ${data.count || 0} items in database.` });
      } else {
        let msg = data.details || 'Connection failed.';
        if (msg.includes('MONGODB_URI')) msg = 'Error: MONGODB_URI is not set in Vercel settings.';
        if (msg.includes('connection timed out') || msg.includes('Could not connect')) msg = 'Error: MongoDB Atlas is blocking Vercel. Please add 0.0.0.0/0 to Network Access.';
        setTestStatus({ type: 'error', message: msg });
      }
    } catch (err) {
      setTestStatus({ type: 'error', message: 'Network error or API not found.' });
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card">
        <div className="login-header">
          <h2>Admin Login</h2>
          <p>Theni Subaiyas Restaurant</p>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter username"
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter password"
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="test-connection-box">
          <button 
            type="button" 
            className={`test-btn ${testStatus.type}`} 
            onClick={testConnection}
            disabled={testStatus.type === 'loading'}
          >
            {testStatus.type === 'loading' ? '⏳ Testing...' : '🔍 Test Database Connection'}
          </button>
          {testStatus.message && (
            <p className={`test-message ${testStatus.type}`}>{testStatus.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
