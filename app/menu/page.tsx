'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import './customer.css';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

function CustomerMenu() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableNumber = searchParams.get('table') || 'Takeaway';
  
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeBgVariant, setActiveBgVariant] = useState<string>('light');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI'>('Cash');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<{ id: string; orderId: string; upiUrl: string; totalAmount: number } | null>(null);
  const [settings, setSettings] = useState<{ 
    restaurantName: string; 
    logoUrl: string; 
    upiId: string; 
    mobileNumber: string;
    primaryColor: string;
    accentColor: string;
    bgVariant: string;
    headerColor: string;
  } | null>(null);

  useEffect(() => {
    // Fetch Settings
    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data.success && data.settings) {
        setSettings(data.settings);
        setActiveBgVariant(data.settings.bgVariant || 'light');
        // Inject dynamic theme
        if (data.settings.primaryColor) {
          document.documentElement.style.setProperty('--primary', data.settings.primaryColor);
        }
        if (data.settings.accentColor) {
          document.documentElement.style.setProperty('--accent', data.settings.accentColor);
        }
        if (data.settings.headerColor) {
          document.documentElement.style.setProperty('--header-bg', data.settings.headerColor);
        }
      }
    }).catch(err => console.error("Error fetching settings:", err));

    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        const availableItems = data.items.filter((i: MenuItem) => i.isAvailable);
        setItems(availableItems);
        const uniqueCategories = Array.from(new Set(availableItems.map((i: MenuItem) => i.category))) as string[];
        setCategories(['All', ...uniqueCategories]);
        if (uniqueCategories.length > 0 && !uniqueCategories.includes(activeCategory)) {
           // Keep 'All' as default
        }
      })
      .finally(() => setLoading(false));

    const savedOrder = localStorage.getItem('activeOrderId');
    if (savedOrder) {
      setActiveOrderId(savedOrder);
    }
  }, []);

  const displayedItems = useMemo(() => {
    if (activeCategory === 'All') return items;
    return items.filter(i => i.category === activeCategory);
  }, [items, activeCategory]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i._id === id) {
        const newQ = i.quantity + delta;
        return newQ > 0 ? { ...i, quantity: newQ } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);

    const orderData = {
      tableNumber: tableNumber === 'Takeaway' ? 0 : Number(tableNumber),
      items: cart.map(i => ({ menuItem: i._id, name: i.name, quantity: i.quantity, price: i.price })),
      totalAmount: cartTotal,
      customerPhone,
      paymentMethod,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const data = await res.json();
        const currentTotal = cartTotal;
        localStorage.setItem('activeOrderId', data.order._id);
        setActiveOrderId(data.order._id);
        setCart([]);
        setIsCartOpen(false);
        setCustomerPhone(''); // Clear phone after successful order

        if (paymentMethod === 'UPI') {
          const restaurantUpi = settings?.upiId || process.env.NEXT_PUBLIC_UPI_ID || 'kadamalairamesh-1@oksbi';
          // Use currentTotal instead of cartTotal which is now 0
          const upiUrl = `upi://pay?pa=${restaurantUpi}&pn=${encodeURIComponent(settings?.restaurantName || 'TheniSubaiyas')}&am=${currentTotal}&cu=INR&tn=${encodeURIComponent('Order ' + data.order.orderId)}`;
          setPendingOrderId({ id: data.order._id, orderId: data.order.orderId, upiUrl, totalAmount: currentTotal });
          setShowUpiModal(true);
        } else {
          router.push(`/menu/track/${data.order._id}`);
        }
      } else {
        alert('Failed to place order. Please ask staff.');
      }
    } catch (error) {
      alert('Error placing order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mobile-loading">
        <div className="spinner"></div>
        <p>Loading the menu...</p>
      </div>
    );
  }

  return (
    <div className={`customer-app theme-${activeBgVariant}`}>
      <div className="theme-switcher">
        <div className={`theme-opt light ${activeBgVariant === 'light' ? 'active' : ''}`} onClick={() => setActiveBgVariant('light')}>☀️</div>
        <div className={`theme-opt dark ${activeBgVariant === 'dark' ? 'active' : ''}`} onClick={() => setActiveBgVariant('dark')}>🌙</div>
        <div className={`theme-opt glass ${activeBgVariant === 'glass' ? 'active' : ''}`} onClick={() => setActiveBgVariant('glass')}>💎</div>
      </div>
      <header className="mobile-header">
        {settings?.logoUrl && <img src={settings.logoUrl} alt="Logo" className="restaurant-logo-header" />}
        <div className="header-info">
          <h1>{settings?.restaurantName || 'Theni Subaiyas'}</h1>
          <p className="table-info">Table: <span>{tableNumber}</span></p>
        </div>
        {activeOrderId && (
          <button 
            className="btn-track-active" 
            onClick={() => router.push(`/menu/track/${activeOrderId}`)}
          >
            📋 Track Order
          </button>
        )}
      </header>

      <div className="categories-scrollable">
        {categories.map(cat => (
          <button 
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="menu-items-grid">
        {displayedItems.map(item => (
          <div key={item._id} className="food-card animate-slide-up">
            <div className="food-image">
              <img src={item.imageUrl || '/placeholder.png'} alt={item.name} />
            </div>
            <div className="food-info">
              <h3>{item.name}</h3>
              <p className="food-desc">{item.description}</p>
              <div className="food-meta">
                <span className="food-price">₹{Number(item.price).toFixed(0)}</span>
                <button className="add-btn" onClick={() => addToCart(item)}>+</button>
              </div>
            </div>
          </div>
        ))}
        {displayedItems.length === 0 && (
          <div className="empty-menu">No items found in this category.</div>
        )}
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && !isCartOpen && (
        <div className="floating-cart" onClick={() => setIsCartOpen(true)}>
          <div className="cart-badge">{cart.reduce((a, b) => a + b.quantity, 0)} items</div>
          <div className="cart-total">View Cart • ₹{Number(cartTotal).toFixed(0)}</div>
        </div>
      )}

      {/* Cart Drawer */}
      <div className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}>
        <div className="cart-drawer" onClick={e => e.stopPropagation()}>
          <div className="cart-header">
            <h2>Your Order</h2>
            <button className="close-cart" onClick={() => setIsCartOpen(false)}>×</button>
          </div>
          
          <div className="cart-items">
            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty.</p>
            ) : (
              cart.map(item => (
                <div key={item._id} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <span>₹{Number(item.price).toFixed(0)}</span>
                  </div>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item._id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)}>+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="bill-summary">
                <div className="bill-row"><span>Item Total</span><span>₹{Number(cartTotal).toFixed(0)}</span></div>
                <div className="bill-row"><span>Taxes & Charges</span><span>Included</span></div>
                <div className="bill-row grand-total"><span>To Pay</span><span>₹{Number(cartTotal).toFixed(0)}</span></div>
              </div>

              <div className="payment-options">
                <p>Payment Method</p>
                <div className="pay-methods">
                  <label className={`radio-label ${paymentMethod === 'Cash' ? 'selected' : ''}`}>
                    <input type="radio" name="payType" value="Cash" checked={paymentMethod === 'Cash'} onChange={() => setPaymentMethod('Cash')} />
                    <span>💵 Pay at Counter / Cash</span>
                  </label>
                  <label className={`radio-label ${paymentMethod === 'UPI' ? 'selected' : ''}`}>
                    <input type="radio" name="payType" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                    <span>📱 UPI (PhonePe / GPay / Paytm)</span>
                  </label>
                </div>

                <div className="phone-input-wrap">
                  <label>Your Mobile Number (for bill on WhatsApp)</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    maxLength={10}
                    className="phone-input"
                  />
                </div>
              </div>

              <button 
                className="checkout-btn" 
                onClick={placeOrder}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Processing...' : `Place Order • ₹${Number(cartTotal).toFixed(0)}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* UPI Payment Modal */}
      {showUpiModal && pendingOrderId && (
        <div className="upi-modal-overlay">
          <div className="upi-modal">
            <div className="upi-modal-header">
              <h2>📱 Pay via UPI</h2>
              <p>Order #{pendingOrderId.orderId}</p>
            </div>

            <div className="upi-qr-wrap">
              <img
                src={`https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodeURIComponent(pendingOrderId.upiUrl)}&choe=UTF-8`}
                alt="UPI QR Code"
                className="upi-qr-img"
              />
              <p className="upi-scan-hint">Scan with PhonePe / GPay / Paytm / Any UPI App</p>
            </div>

            <div className="upi-amount-display">
              ₹{Number(pendingOrderId.totalAmount).toFixed(0)}
            </div>

            <a
              href={pendingOrderId.upiUrl}
              className="btn-pay-now"
              onClick={() => setTimeout(() => setShowUpiModal(false), 500)}
            >
              📲 Open UPI App Directly
            </a>

            <button
              className="btn-paid"
              onClick={() => {
                setShowUpiModal(false);
                router.push(`/menu/track/${pendingOrderId.id}`);
              }}
            >
              ✅ I Have Paid – Track My Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="mobile-loading">
        <div className="spinner"></div>
        <p>Loading the menu...</p>
      </div>
    }>
      <CustomerMenu />
    </Suspense>
  );
}
