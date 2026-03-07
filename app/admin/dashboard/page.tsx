'use client';

import { useEffect, useState, useRef } from 'react';
import './live-orders.css';

interface OrderItem {
  _id: string;
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
  customerPhone?: string;
  status: 'Received' | 'Preparing' | 'Ready' | 'Served';
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

export default function LiveOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [settings, setSettings] = useState<{ restaurantName: string } | null>(null);
  
  // Keep track of order IDs we've already "seen" to avoid repeated ringing
  const knownOrderIds = useRef<Set<string>>(new Set());

  const playAlert = () => {
    if (!soundEnabled) return;
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, context.currentTime); // High pitch
      oscillator.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.start();
      oscillator.stop(context.currentTime + 0.5);
    } catch(e) {
      console.log('Audio playback failed', e);
    }
  };

  const fetchOrders = async (isInitial = false) => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        const fetchedOrders: Order[] = data.orders;
        
        if (!isInitial) {
          // Check for new incoming orders
          const newOrders = fetchedOrders.filter(
            o => !knownOrderIds.current.has(o._id) && o.status === 'Received'
          );
          if (newOrders.length > 0) {
            playAlert();
          }
        }
        
        // Update known IDs
        fetchedOrders.forEach(o => knownOrderIds.current.add(o._id));
        setOrders(fetchedOrders);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) setSettings(data.settings);
    } catch (err) {
      console.error('Failed to fetch settings');
    }
  };

  useEffect(() => {
    fetchOrders(true);
    fetchSettings();
    const interval = setInterval(() => fetchOrders(false), 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Optimistic update
        setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus as any } : o));
      }
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Received': return '#FF5A5F'; // Primary red
      case 'Preparing': return '#FFB300'; // Warning yellow
      case 'Ready': return '#4CAF50'; // Success green
      case 'Served': return '#9E9E9E'; // Grey
      default: return '#000';
    }
  };

  if (loading) return <div className="loading-state">Loading live orders...</div>;

  const activeOrders = orders.filter(o => o.status !== 'Served');
  const pastOrders = orders.filter(o => o.status === 'Served');

  return (
    <div className="live-orders-container animate-fade-in">
      <div className="live-orders-header">
        <div>
          <h2>Live Orders Insight</h2>
          <p>Real-time synchronization active.</p>
        </div>
        {!soundEnabled ? (
          <button className="sound-btn" onClick={() => setSoundEnabled(true)}>
            Enable Sound Alerts 🔔
          </button>
        ) : (
          <div className="sound-badge">Sound Alerts Active ✅</div>
        )}
      </div>

      <div className="orders-grid">
        {activeOrders.length === 0 ? (
          <div className="empty-state">No active orders right now. Waiting for customers...</div>
        ) : (
          activeOrders.map(order => (
            <div key={order._id} className={`order-card status-${order.status.toLowerCase()}`}>
              <div className="order-card-header">
                <div className="table-badge">Table {order.tableNumber}</div>
                <div className="order-time">
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="order-meta">
                <span className="order-id">#{order.orderId}</span>
                <span className="order-amount">₹{order.totalAmount}</span>
              </div>
              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <span>{item.quantity}x {item.name}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-actions">
                <div className="status-indicator">
                  <span className="dot" style={{ backgroundColor: getStatusColor(order.status) }}></span>
                  {order.status}
                </div>
                
                <div className="action-buttons">
                  {order.status === 'Received' && (
                    <button onClick={() => updateOrderStatus(order._id, 'Preparing')} className="btn-action prepare">
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'Preparing' && (
                    <button onClick={() => updateOrderStatus(order._id, 'Ready')} className="btn-action ready">
                      Mark Ready
                    </button>
                  )}
                  {order.status === 'Ready' && (
                    <button onClick={() => updateOrderStatus(order._id, 'Served')} className="btn-action serve">
                      Serve
                    </button>
                  )}
                  {order.customerPhone ? (
                    <button
                      className="btn-action whatsapp-bill"
                      onClick={() => {
                        const itemLines = order.items.map(i => `  - ${i.name} x${i.quantity} = ₹${i.price * i.quantity}`).join('\n');
                        const restaurantName = settings?.restaurantName || 'Theni Subaiyas';
                        const msg = `🧾 *Bill from ${restaurantName}*\n\n*Order:* #${order.orderId}\n*Table:* ${order.tableNumber}\n\n*Items:*\n${itemLines}\n\n*Total: ₹${order.totalAmount}*\n\nThank you for dining with us! 🙏`;
                        window.open(`https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                    >
                      📲 Send Bill on WhatsApp
                    </button>
                  ) : (
                    <span className="no-phone-label">No phone saved</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pastOrders.length > 0 && (
        <div className="past-orders-section">
          <h3>Recently Served</h3>
          <div className="past-orders-list">
            {pastOrders.slice(0, 5).map(order => (
              <div key={order._id} className="past-order-row">
                <span>Table {order.tableNumber}</span>
                <span>#{order.orderId}</span>
                <span>₹{order.totalAmount}</span>
                <span style={{color: '#9E9E9E'}}>Served</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
