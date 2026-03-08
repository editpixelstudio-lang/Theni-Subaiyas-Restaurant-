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
  const [cartBouncing, setCartBouncing] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI'>('Cash');
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      setCartBouncing(true);
      setTimeout(() => setCartBouncing(false), 400);
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
        setPaymentAmount(currentTotal);
        localStorage.setItem('activeOrderId', data.order._id);
        setActiveOrderId(data.order._id);
        setCart([]);
        setIsCartOpen(false);
        setCustomerPhone(''); // Clear phone after successful order

        if (paymentMethod === 'UPI') {
          setShowUPIModal(true);
          setPendingOrderId(data.order._id);
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
      <header className="mobile-header">
        <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        {settings?.logoUrl && <img src={settings.logoUrl} alt="Logo" className="restaurant-logo-header" />}
        <div className="header-info">
          <h1>{settings?.restaurantName || 'Theni Subaiyas'} <span className="version-badge">v2.1</span></h1>
          <p className="table-info">Table: <span>{tableNumber}</span></p>
        </div>
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
        {displayedItems.map((item, index) => (
          <div 
            key={item._id} 
            className="food-card"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
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
        <div 
          className={`floating-cart ${cartBouncing ? 'item-added' : ''}`} 
          onClick={() => setIsCartOpen(true)}
        >
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
                    <span>📱 Pay Online (Scan QR / GPay)</span>
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

                <div className="secure-payment-info">
                  <div className="secure-badge">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Order Safely with Theni Subaiyas</span>
                  </div>
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

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => router.push('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Home</span>
        </button>
        <button className="nav-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          <span>Menu</span>
        </button>
        {activeOrderId ? (
          <button className="nav-item" onClick={() => router.push(`/menu/track/${activeOrderId}`)}>
            <div className="nav-pulse-badge"></div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            <span>My Order</span>
          </button>
        ) : (
          <button className="nav-item opacity-40">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>No Order</span>
          </button>
        )}
      </nav>

      {/* Custom UPI Scan & Pay Modal - Overhauled Priority */}
      {showUPIModal && (
        <div className="upi-modal-overlay high-priority">
          <div className="upi-modal main-focus">
            <div className="upi-modal-header">
              <h2>Secure Payment</h2>
              <p>Scan to complete your order</p>
            </div>
            
            <div className="upi-qr-wrap">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${settings?.upiId || 'kadamalairamesh-1@oksbi'}&pn=${settings?.restaurantName || 'Theni Subaiyas'}&am=${paymentAmount.toFixed(2)}&cu=INR`)}`} 
                alt="UPI QR Code" 
                className="upi-qr-img"
              />
              <p className="upi-scan-hint">Use any UPI app (GPay, PhonePe, Paytm)</p>
            </div>

            <div className="upi-amount-display">₹{paymentAmount.toFixed(0)}</div>

            {/* Mobile Intent Deep Links */}
            <div className="mobile-pay-options">
              <a 
                href={`upi://pay?pa=${settings?.upiId || 'kadamalairamesh-1@oksbi'}&pn=${settings?.restaurantName || 'Theni Subaiyas'}&am=${paymentAmount.toFixed(2)}&cu=INR`}
                className="btn-pay-now big-btn"
              >
                🚀 PAY WITH MOBILE APP
              </a>
            </div>

            <div className="upi-modal-footer">
              <button 
                className="btn-paid primary-confirm" 
                onClick={() => router.push(`/menu/track/${pendingOrderId}`)}
              >
                ✅ I HAVE PAID SUCCESSFUL
              </button>
              <button className="btn-cancel-pay secondary-cancel" onClick={() => setShowUPIModal(false)}>Go Back</button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Sidebar Drawer */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}>
        <div className="sidebar-drawer" onClick={e => e.stopPropagation()}>
          <div className="sidebar-header">
            {settings?.logoUrl && <img src={settings.logoUrl} alt="Logo" className="sidebar-logo" />}
            <h3>{settings?.restaurantName || 'Theni Subaiyas'}</h3>
            <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>×</button>
          </div>

          <div className="sidebar-content">
            <div className="sidebar-section">
              <p className="section-label">Appearance</p>
              <div className="theme-switcher-inline">
                <div className={`theme-opt light ${activeBgVariant === 'light' ? 'active' : ''}`} onClick={() => setActiveBgVariant('light')}>☀️ Light</div>
                <div className={`theme-opt dark ${activeBgVariant === 'dark' ? 'active' : ''}`} onClick={() => setActiveBgVariant('dark')}>🌙 Dark</div>
                <div className={`theme-opt glass ${activeBgVariant === 'glass' ? 'active' : ''}`} onClick={() => setActiveBgVariant('glass')}>💎 Glass</div>
              </div>
            </div>

            <div className="sidebar-links">
              <button className="sidebar-link" onClick={() => { router.push('/'); setIsSidebarOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                Home
              </button>
              <button className="sidebar-link active" onClick={() => setIsSidebarOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Menu
              </button>
              {activeOrderId && (
                <button className="sidebar-link" onClick={() => { router.push(`/menu/track/${activeOrderId}`); setIsSidebarOpen(false); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                  My Orders
                </button>
              )}
            </div>

            <div className="sidebar-footer">
              <p className="footer-label">Contact Us</p>
              <p>📍 {settings?.address || 'Theni, Tamil Nadu'}</p>
              <p>📞 {settings?.mobileNumber || '9876543210'}</p>
            </div>
          </div>
        </div>
      </div>
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
