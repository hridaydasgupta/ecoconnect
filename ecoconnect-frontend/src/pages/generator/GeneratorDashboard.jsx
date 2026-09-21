import Sidebar from '../../components/Sidebar';
import { Outlet } from 'react-router-dom';

const navItems = [
  { path: '/generator', icon: '📊', label: 'Overview' },
  { path: '/generator/listings', icon: '📋', label: 'My Listings' },
  { path: '/generator/new-listing', icon: '➕', label: 'Create Listing' },
  { path: '/generator/wallet', icon: '💰', label: 'Wallet' },
  { path: '/generator/location', icon: '📍', label: 'My Location' },
];

const GeneratorDashboard = () => (
  <div className="app-layout">
    <Sidebar navItems={navItems} />
    <main className="main-content">
      <Outlet />
    </main>
  </div>
);

export default GeneratorDashboard;
