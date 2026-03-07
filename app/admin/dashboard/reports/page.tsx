'use client';

import { useState, useEffect } from 'react';
import './reports.css';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderId: string;
  tableNumber: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

export default function Reports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const openBillPrint = (orderId: string) => {
    window.open(`/admin/bill/${orderId}`, '_blank', 'width=400,height=600');
  };

  if (loading) return <div className="loading-state">Loading reports...</div>;

  const today = new Date().setHours(0, 0, 0, 0);
  const todaysOrders = orders.filter(o => new Date(o.createdAt).valueOf() >= today);
  const totalSales = todaysOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalOrders = todaysOrders.length;

  return (
    <div className="reports-container animate-fade-in">
      <div className="reports-header">
        <h2>Daily Reports</h2>
        <p>Overview of today's performance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Today's Revenue</div>
          <div className="stat-value">₹{totalSales}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Orders Today</div>
          <div className="stat-value">{totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Average Order Value</div>
          <div className="stat-value">
            ₹{totalOrders ? Math.round(totalSales / totalOrders) : 0}
          </div>
        </div>
      </div>

      <div className="orders-table-wrapper">
        <h3>Recent Orders History</h3>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Time</th>
              <th>Table</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 50).map(order => (
              <tr key={order._id}>
                <td className="mono">{order.orderId}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>Table {order.tableNumber}</td>
                <td className="items-cell">
                  {order.items.map((i, idx) => (
                    <div key={idx}>{i.quantity}x {i.name}</div>
                  ))}
                </td>
                <td className="amount-col">₹{order.totalAmount}</td>
                <td>
                  <span className={`badge ${order.paymentStatus.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                  <div className="pay-method-small">{order.paymentMethod}</div>
                </td>
                <td>
                  <button onClick={() => openBillPrint(order._id)} className="btn-print">
                    Print Bill
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
