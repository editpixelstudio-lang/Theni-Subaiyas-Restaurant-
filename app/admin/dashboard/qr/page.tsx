'use client';

import { useState, useEffect } from 'react';
import './qr-management.css';

interface Table {
  _id: string;
  number: number;
  status: 'active' | 'inactive';
}

export default function QRManagement() {
  const [tables, setTables] = useState<Table[]>([]);
  const [baseUrl, setBaseUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      if (data.success) {
        setTables(data.tables);
      }
    } catch (err) {
      console.error('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const method = editingTable ? 'PUT' : 'POST';
    const body = editingTable 
      ? { id: editingTable._id, number: Number(newTableNumber) }
      : { number: Number(newTableNumber) };

    try {
      const res = await fetch('/api/tables', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingTable(null);
        setNewTableNumber('');
        fetchTables();
      } else {
        setError(data.error || 'Failed to save table');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      const res = await fetch(`/api/tables?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchTables();
    } catch (err) {
      console.error('Failed to delete table');
    }
  };

  const openAddModal = () => {
    setEditingTable(null);
    setNewTableNumber('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (table: Table) => {
    setEditingTable(table);
    setNewTableNumber(table.number.toString());
    setError('');
    setIsModalOpen(true);
  };

  const handlePrintAll = () => window.print();

  const handlePrintSingle = (tableNum: number) => {
    const menuUrl = `${baseUrl}/menu?table=${tableNum}`;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(menuUrl)}`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Table ${tableNum} QR</title>
      <style>body{font-family:Arial;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;background:#fff}
      h2{font-size:24px;margin-bottom:8px}p{color:#666;font-size:13px;margin:4px 0}img{width:300px;height:300px;border:2px solid #eee;border-radius:12px;margin:16px 0}
      </style></head><body>
      <h2>Theni Subaiyas Restaurant</h2>
      <img src="${qrSrc}" />
      <h3>Table ${tableNum}</h3>
      <p>Scan QR to view menu & order</p>
      <p style="font-size:11px;color:#999">${menuUrl}</p>
      <script>window.onload=()=>window.print()</script>
      </body></html>`);
    win.document.close();
  };

  const handleDownload = (tableNum: number) => {
    const menuUrl = `${baseUrl}/menu?table=${tableNum}`;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(menuUrl)}&format=png`;
    const link = document.createElement('a');
    link.href = qrSrc;
    link.download = `table-${tableNum}-qr.png`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="qr-management animate-fade-in">
      <div className="qr-header no-print">
        <div>
          <h2>Table Management</h2>
          <p>Create and manage menu QR codes for your tables</p>
        </div>
        <div className="qr-actions">
          <button className="btn btn-secondary" onClick={openAddModal}>
            ➕ Add New Table
          </button>
          <button className="btn btn-primary" onClick={handlePrintAll} disabled={tables.length === 0}>
            🖨 Print All QR Codes
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading tables...</div>
      ) : (
        <div className="qr-grid">
          {tables.map(table => {
            const menuUrl = `${baseUrl}/menu?table=${table.number}`;
            const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
            return (
              <div key={table._id} className="qr-card">
                <div className="qr-card-header">
                  <h3>Table {table.number}</h3>
                  <div className="table-badges">
                    <span className="badge-active">Active</span>
                  </div>
                </div>
                <div className="qr-image-container">
                  <img src={qrSrc} alt={`QR Code for Table ${table.number}`} className="qr-image" />
                </div>
                <div className="qr-footer">
                  <p>Scan to see menu & order</p>
                  <div className="qr-url">{menuUrl}</div>
                </div>
                <div className="qr-card-actions no-print">
                  <button className="btn-qr-action edit" onClick={() => openEditModal(table)}>
                    ✏️ Edit
                  </button>
                  <button className="btn-qr-action delete" onClick={() => handleDeleteTable(table._id)}>
                    🗑 Delete
                  </button>
                  <button className="btn-qr-action print" onClick={() => handlePrintSingle(table.number)}>
                    🖨 Print
                  </button>
                  <button className="btn-qr-action download" onClick={() => handleDownload(table.number)}>
                    ⬇ Download
                  </button>
                </div>
              </div>
            );
          })}
          {tables.length === 0 && (
            <div className="empty-state">
              <p>No tables added yet.</p>
              <button className="btn btn-primary" onClick={openAddModal}>Add your first table</button>
            </div>
          )}
        </div>
      )}

      {/* Table Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editingTable ? 'Edit Table' : 'Add New Table'}</h3>
            <form onSubmit={handleSaveTable}>
              <div className="form-group">
                <label>Table Number</label>
                <input 
                  type="number" 
                  value={newTableNumber} 
                  onChange={e => setNewTableNumber(e.target.value)} 
                  required 
                  autoFocus
                  min="1"
                />
              </div>
              {error && <p className="modal-error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Table</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
