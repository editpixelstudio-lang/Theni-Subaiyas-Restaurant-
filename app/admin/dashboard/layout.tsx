'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './dashboard-layout.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const menuItems = [
    { name: 'Live Orders', path: '/admin/dashboard' },
    {name: 'Menu Management', path: '/admin/dashboard/menu'},
    { name: 'QR Codes', path: '/admin/dashboard/qr' },
    { name: 'Reports', path: '/admin/dashboard/reports' },
    { name: 'Settings', path: '/admin/dashboard/settings' },
  ];

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`nav-link ${pathname === item.path ? 'active' : ''}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>{menuItems.find(m => m.path === pathname)?.name || 'Dashboard'}</h1>
          <div className="header-actions">
            <span className="admin-badge">Admin</span>
          </div>
        </header>
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}
