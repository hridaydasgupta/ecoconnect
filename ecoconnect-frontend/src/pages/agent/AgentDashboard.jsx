import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

const navItems = [
  { path: '/agent',          icon: '📊', label: 'Overview'        },
  { path: '/agent/trips',    icon: '🚚', label: 'My Trips'        },
  { path: '/agent/wallet',   icon: '💰', label: 'Wallet'          },
  { path: '/agent/location', icon: '📍', label: 'Update Location' },
];

export default function AgentDashboard() {
  return (
    <div className="app-layout">
      <Sidebar navItems={navItems} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
