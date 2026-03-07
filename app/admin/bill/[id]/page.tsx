'use client';

import { useEffect, useState } from 'react';
import './bill.css';

interface Order {
  _id: string;
  orderId: string;
  tableNumber: number;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
}

export default function BillPrint({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // We fetch all orders and find this one, or ideally have a GET /api/orders/[id] API.
    // Since we only made GET /api/orders, let's fetch all and filter for now to save time.
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        const found = data.orders.find((o: Order) => o._id === params.id);
        setOrder(found);
        setTimeout(() => window.print(), 500); // Auto trigger print dialog
      });
  }, [params.id]);

  if (!order) return <div style={{ padding: 20 }}>Refetching bill...</div>;

  return (
    <div className="thermal-bill">
      <div className="bill-header">
        <h1>Theni Subaiyas</h1>
        <p>Authentic South Indian Cuisine</p>
        <p>123 Main Street, City Center</p>
        <p>Phone: +91 98765 43210</p>
        <div className="divider">================================</div>
      </div>

      <div className="bill-meta">
        <div><span>Date:</span> {new Date(order.createdAt).toLocaleDateString()}</div>
        <div><span>Time:</span> {new Date(order.createdAt).toLocaleTimeString()}</div>
        <div><span>Order No:</span> {order.orderId}</div>
        <div><span>Table No:</span> {order.tableNumber}</div>
      </div>
      
      <div className="divider">--------------------------------</div>

      <table className="bill-items">
        <thead>
          <tr>
            <th className="item-name">Item</th>
            <th className="item-qty">Qty</th>
            <th className="item-price">Amt</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td className="item-name">{item.name}</td>
              <td className="item-qty">{item.quantity}</td>
              <td className="item-price">{item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divider">--------------------------------</div>

      <div className="bill-totals">
        <div className="total-row main-total">
          <span>Net Total:</span>
          <span>₹{order.totalAmount}</span>
        </div>
        <div className="payment-mode">
          Paid via: {order.paymentMethod}
        </div>
      </div>

      <div className="divider">================================</div>

      <div className="bill-footer">
        <p>Thank you for dining with us!</p>
        <p>Please visit again.</p>
        <div className="qr-wrapper">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ThankYou`} 
            alt="Thank You QR" 
          />
        </div>
      </div>
    </div>
  );
}
