import Sidebar from "../../components/Sidebar";
import { Outlet } from "react-router-dom";

const navItems = [
  { path: "/plant",             icon: "📊", label: "Overview" },
  { path: "/plant/feed",        icon: "🔍", label: "Matched Listings" },
  { path: "/plant/orders",      icon: "📋", label: "My Orders" },
  { path: "/plant/batches",     icon: "🚚", label: "Pickup Batches" },
  { path: "/plant/preferences", icon: "⚙️", label: "Preferences" },
  { path: "/plant/wallet",      icon: "💰", label: "Wallet" },
  { path: "/plant/location",    icon: "📍", label: "My Location" },
];

export default function PlantDashboard() {
  return (
    <div className="app-layout">
      <Sidebar navItems={navItems} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
