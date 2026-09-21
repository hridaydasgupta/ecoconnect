import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth
import AuthPage from './pages/AuthPage';
import NotFound from './pages/NotFound';

// Generator pages (lazy loaded)
const GeneratorDashboard = lazy(() => import('./pages/generator/GeneratorDashboard'));
const GeneratorOverview  = lazy(() => import('./pages/generator/GeneratorOverview'));
const MyListings         = lazy(() => import('./pages/generator/MyListings'));
const CreateListing      = lazy(() => import('./pages/generator/CreateListing'));
const GeneratorWallet    = lazy(() => import('./pages/generator/WalletPage'));
const GeneratorLocation  = lazy(() => import('./pages/generator/LocationPage'));

// Plant pages
const PlantDashboard     = lazy(() => import('./pages/plant/PlantDashboard'));
const PlantOverview      = lazy(() => import('./pages/plant/PlantOverview'));
const MatchedListings    = lazy(() => import('./pages/plant/MatchedListings'));
const MyOrders           = lazy(() => import('./pages/plant/MyOrders'));
const PickupBatches      = lazy(() => import('./pages/plant/PickupBatches'));
const PlantPreferences   = lazy(() => import('./pages/plant/PlantPreferences'));
const PlantWallet        = lazy(() => import('./pages/plant/PlantWallet'));
const PlantLocation      = lazy(() => import('./pages/plant/PlantLocation'));

// Agent pages
const AgentDashboard     = lazy(() => import('./pages/agent/AgentDashboard'));
const AgentOverview      = lazy(() => import('./pages/agent/AgentOverview'));
const AgentTrips         = lazy(() => import('./pages/agent/AgentTrips'));
const AgentWallet        = lazy(() => import('./pages/agent/AgentWallet'));
const AgentLocation      = lazy(() => import('./pages/agent/AgentLocation'));

const Loading = () => (
  <div className="loading-container" style={{ minHeight: '100vh' }}>
    <div className="loading-spinner" />
    <span>Loading EcoConnect...</span>
  </div>
);

// Role-based protection
function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    // Redirect to their correct dashboard, not login
    if (user.role === 'GENERATOR')       return <Navigate to="/generator" replace />;
    if (user.role === 'RECYCLING_PLANT') return <Navigate to="/plant" replace />;
    if (user.role === 'LOGISTICS_AGENT') return <Navigate to="/agent" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  // Auto-redirect from root
  const defaultRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'GENERATOR')       return <Navigate to="/generator" replace />;
    if (user.role === 'RECYCLING_PLANT') return <Navigate to="/plant" replace />;
    if (user.role === 'LOGISTICS_AGENT') return <Navigate to="/agent" replace />;
    return <Navigate to="/login" replace />;
  };

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={defaultRedirect()} />
        <Route path="/login" element={user ? defaultRedirect() : <AuthPage />} />

        {/* Generator Routes */}
        <Route path="/generator" element={<ProtectedRoute role="GENERATOR"><GeneratorDashboard /></ProtectedRoute>}>
          <Route index element={<GeneratorOverview />} />
          <Route path="listings" element={<MyListings />} />
          <Route path="new-listing" element={<CreateListing />} />
          <Route path="wallet" element={<GeneratorWallet />} />
          <Route path="location" element={<GeneratorLocation />} />
        </Route>

        {/* Plant Routes */}
        <Route path="/plant" element={<ProtectedRoute role="RECYCLING_PLANT"><PlantDashboard /></ProtectedRoute>}>
          <Route index element={<PlantOverview />} />
          <Route path="feed" element={<MatchedListings />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="batches" element={<PickupBatches />} />
          <Route path="preferences" element={<PlantPreferences />} />
          <Route path="wallet" element={<PlantWallet />} />
          <Route path="location" element={<PlantLocation />} />
        </Route>

        {/* Agent Routes */}
        <Route path="/agent" element={<ProtectedRoute role="LOGISTICS_AGENT"><AgentDashboard /></ProtectedRoute>}>
          <Route index element={<AgentOverview />} />
          <Route path="trips" element={<AgentTrips />} />
          <Route path="wallet" element={<AgentWallet />} />
          <Route path="location" element={<AgentLocation />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
