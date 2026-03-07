'use client';

import { useState, useEffect } from 'react';
import './qr-management.css';

export default function QRManagement() {
  const [tableCount, setTableCount] = useState(10);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

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

  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  return (
    <div className="qr-management animate-fade-in">
      <div className="qr-header no-print">
        <div>
          <h2>Table QR Codes</h2>
          <p>Generate and print QR menus for your restaurant tables</p>
        </div>
        <div className="qr-actions">
          <div className="table-input">
            <label>Number of Tables:</label>
            <input 
              type="number" 
              min="1" 
              max="100" 
              value={tableCount} 
              onChange={e => setTableCount(Number(e.target.value))}
            />
          </div>
          <button className="btn btn-primary" onClick={handlePrintAll}>
            🖨 Print All QR Codes
          </button>
        </div>
      </div>

      <div className="qr-grid">
        {tables.map(tableNum => {
          const menuUrl = `${baseUrl}/menu?table=${tableNum}`;
          const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
          return (
            <div key={tableNum} className="qr-card">
              <div className="qr-card-header">
                <h3>Table {tableNum}</h3>
              </div>
              <div className="qr-image-container">
                <img src={qrSrc} alt={`QR Code for Table ${tableNum}`} className="qr-image" />
              </div>
              <div className="qr-footer">
                <p>Scan to see menu & order</p>
                <div className="qr-url">{menuUrl}</div>
              </div>
              <div className="qr-card-actions no-print">
                <button className="btn-qr-action print" onClick={() => handlePrintSingle(tableNum)}>
                  🖨 Print
                </button>
                <button className="btn-qr-action download" onClick={() => handleDownload(tableNum)}>
                  ⬇ Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
