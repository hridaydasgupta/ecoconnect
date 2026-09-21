# 🌿 EcoConnect Frontend

React 18 + Vite frontend for the EcoConnect Agricultural Waste Management Platform.

## 🚀 Setup

```powershell
npm install
npm run dev
```

Runs at `http://localhost:3000` — proxies `/api` calls to backend at `http://localhost:8080`

## 📁 Pages

| Path | Role | Page |
|------|------|------|
| `/login` | All | Auth (Signup / Login) |
| `/generator` | Generator | Overview — stats + recent listings |
| `/generator/listings` | Generator | My Listings |
| `/generator/new-listing` | Generator | Create Listing |
| `/generator/wallet` | Generator | Wallet & Transactions |
| `/generator/location` | Generator | Share GPS Location |
| `/plant` | Plant | Overview — stats + recent orders |
| `/plant/feed` | Plant | Matched Listings (🤖 AI Price on Accept) |
| `/plant/orders` | Plant | My Orders |
| `/plant/batches` | Plant | Pickup Batches (🤖 AI Route) |
| `/plant/preferences` | Plant | Plant Preferences |
| `/plant/wallet` | Plant | Wallet & Transactions |
| `/agent` | Agent | Overview — stats + wallet |
| `/agent/trips` | Agent | My Trips (🤖 AI Optimized Route) |
| `/agent/location` | Agent | Share GPS Location |

## 🤖 AI Features in UI

- **MatchedListings** → Accept modal shows AI price range, recommended price (auto-filled), and collapsible rule reasoning trace
- **AgentTrips** → Each batch shows `🤖 AI Route: X km — Nearest Neighbor TSP Heuristic`
- **PickupBatches** → Each batch shows `🤖 AI Route: X km — Optimized` badge

## 🎨 Design

- Dark glassmorphism theme (no Tailwind — pure CSS in `src/index.css`)
- Mobile responsive with hamburger sidebar
- Toast notification system (`src/components/Toast.jsx`)

## 📦 Key Dependencies

```json
{
  "react": "^18",
  "react-router-dom": "^6",
  "axios": "^1"
}
```
