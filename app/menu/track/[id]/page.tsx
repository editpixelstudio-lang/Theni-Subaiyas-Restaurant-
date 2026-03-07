'use client';

import { useEffect, useState } from 'react';
import './track.css';

interface Order {
  _id: string;
  orderId: string;
  tableNumber: number;
  totalAmount: number;
  status: 'Received' | 'Preparing' | 'Ready' | 'Served' | 'Delivered';
  paymentStatus: string;
}

export default function OrderTracking({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<{ 
    mobileNumber: string; 
    restaurantName: string;
    primaryColor: string;
    accentColor: string;
    bgVariant: string;
  } | null>(null);
  
  useEffect(() => {
    // Fetch Settings
    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data.success) {
        setSettings(data.settings);
        // Inject dynamic theme
        if (data.settings.primaryColor) {
          document.documentElement.style.setProperty('--primary', data.settings.primaryColor);
        }
        if (data.settings.accentColor) {
          document.documentElement.style.setProperty('--accent', data.settings.accentColor);
        }
      }
    });

    // Poll the status
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          const found = data.orders.find((o: Order) => o._id === params.id);
          if (found) setOrder(found);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [params.id]);

  if (!order) return <div className="tracking-loading">Fetching order status...</div>;

  const steps = [
    { id: 'Received', label: 'Order Received' },
    { id: 'Payment', label: order.paymentStatus === 'Paid' ? 'Payment Completed' : 'Payment Pending' },
    { id: 'Preparing', label: 'Preparing' },
    { id: 'Ready', label: 'Ready' },
    { id: 'Delivered', label: 'Delivered' }
  ];

  // Calculate current index in the 5/6 step sequence
  let currentIndex = 0;
  if (order.status === 'Received') currentIndex = order.paymentStatus === 'Paid' ? 2 : 1;
  else if (order.status === 'Preparing') currentIndex = 2;
  else if (order.status === 'Ready') currentIndex = 3;
  else if (order.status === 'Served' || order.status === 'Delivered') currentIndex = 4;

  return (
    <div className={`tracking-container animate-fade-in theme-${settings?.bgVariant || 'light'}`}>
      <div className="tracking-card">
        <div className="tracking-header">
          <div className="track-id-row">
            <h2>Order Status</h2>
            <span className={`pay-status-badge ${order.paymentStatus.toLowerCase()}`}>
              {order.paymentStatus === 'Paid' ? 'PAYMENT RECEIVED ✓' : 'PAYMENT PENDING ⏳'}
            </span>
          </div>
          <p>Order #{order.orderId} • Table {order.tableNumber}</p>
        </div>

        {order.paymentStatus === 'Paid' && (
          <div className="payment-success-alert animate-bounce-in">
            <div className="alert-icon">💰</div>
            <div className="alert-content">
              <h4>Payment Successful!</h4>
              <p>Thank you! Your payment has been verified by the restaurant.</p>
            </div>
          </div>
        )}

        <div className="timeline">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex || (index === currentIndex && (step.id === 'Payment' ? order.paymentStatus === 'Paid' : true));
            const isCurrent = index === currentIndex && (step.id === 'Payment' ? order.paymentStatus !== 'Paid' : true);
            
            return (
              <div key={step.id} className={`timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="timeline-connector"></div>
                <div className="timeline-icon">
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className="timeline-content">
                  <h4>{step.label}</h4>
                  <p>{getStepDescription(step.id, order.paymentStatus === 'Paid')}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="tracking-footer">
          <p>Please wait while we bring out your delicious food.</p>
          
          <button 
            className="btn-whatsapp"
            onClick={() => {
              const text = `Hello ${settings?.restaurantName || 'Theni Subaiyas'}!\nI just placed an order.\n\n*Order ID:* ${order.orderId}\n*Table:* ${order.tableNumber}\n*Total:* ₹${order.totalAmount}\n\nPlease confirm!`;
              const phone = settings?.mobileNumber || '9876543210';
              window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, '_blank');
            }}
          >
            <svg xmlns="http://www.3000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Follow-up on WhatsApp
          </button>

          <button 
            className="btn-back-menu" 
            onClick={() => window.location.href = `/menu?table=${order.tableNumber}`}
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

function getStepDescription(id: string, isPaid: boolean) {
  switch(id) {
    case 'Received': return 'Kitchen verified your order.';
    case 'Payment': return isPaid ? 'We have received your payment.' : 'Waiting for payment confirmation.';
    case 'Preparing': return 'Our chefs are cooking it.';
    case 'Ready': return 'Ready for pickup / Waiter is bringing it.';
    case 'Delivered': return 'Enjoy your meal!';
    default: return '';
  }
}
