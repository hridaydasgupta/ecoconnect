# EcoConnect — Complete Project Workflow

## Overview
EcoConnect is a **waste management marketplace** connecting 3 roles:
- 🌾 **Generator** — Farms/businesses with agricultural/industrial waste to sell
- 🏭 **Recycling Plant** — Buyers who process waste into reusable materials  
- 🚛 **Logistics Agent** — Pickup drivers who transport waste from generator to plant

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Router v6, Custom CSS (EcoVault theme) |
| Backend | Spring Boot 3.x, Spring Security + JWT, Spring Data JPA |
| Database | PostgreSQL |
| AI | Rule-based Expert System (Price) + Nearest Neighbor TSP (Route) |
| Auth | JWT Bearer tokens, Role-based access control |

**Ports:** Backend → `8080` | Frontend → `3000` (proxies /api to backend)

---

## Complete End-to-End Workflow

### PHASE 1 — Registration & Setup
```
All Users:
  POST /api/auth/signup  → { name, phone, email?, password, role }
  POST /api/auth/login   → { phone, password } → { token, userId, name, role }

Generator:
  PUT /api/users/me/location → { latitude, longitude }

Recycling Plant:
  PUT /api/users/me/location → { latitude, longitude }
  POST /api/plant-preferences → {
    acceptedWasteTypes: ["SUGARCANE","COCONUT",...],
    preferredRadiusKm: 25,
    minQuantityKg: 0,
    maxCapacityKg: 500,
    notifyInstantly: true
  }

Logistics Agent:
  PUT /api/users/me/location → { latitude, longitude }
```

### PHASE 2 — Generator Creates Waste Listing
```
POST /api/listings → {
  wasteType: "SUGARCANE",
  quantity: 100,
  unit: "KG",
  pickupDeadlineTime: "14:00",
  onExpiryAction: "CARRY_FORWARD"
}

urgencyScore: DISCARD=100, CARRY_FORWARD=20
Carry-forward: carryForwardCount increments, reconfirm resets timer
PUT /api/listings/{id}/reconfirm
```

### PHASE 3 — Plant Browses Matched Listings
```
GET /api/listings/matched
Matching: wasteType filter → radius filter → sort by urgency then distance

🤖 AI Price Recommendation (Expert System):
GET /api/ai/price-recommendation?wasteType=&quantityKg=&distanceKm=&urgencyScore=
Rules: R1(base) R2(bulk>500 -10%) R3(small<20 +15%) R4(far>50km +20%) R5(urgent +25%)
```

### PHASE 4 — Plant Accepts → Creates Order
```
POST /api/listings/{id}/accept → { agreedPrice: 250 }
Effect: listing→MATCHED, order created (status: CONFIRMED)
GET /api/orders/mine → { id, wasteType, generatorName, quantity, unit, agreedPrice, status }
```

### PHASE 5 — Plant Creates Pickup Batch
```
POST /api/pickup-batches → { orderIds: [...], scheduledDate: "2026-09-15" }
Validations: all orders CONFIRMED, not in another batch, weight ≤ maxCapacity
Effect: orders→IN_TRANSIT, stops created with generator GPS

🤖 AI Route Optimization (Nearest Neighbor TSP):
- Starts from plant location
- Picks nearest unvisited stop iteratively (Haversine distance)
- Re-sequences stops, saves totalDistanceKm
- O(n²) — works for 2-20 stops
```

### PHASE 6 — Assign Agent
```
GET /api/agents/available
PUT /api/pickup-batches/{id}/assign-agent → { agentId: "uuid" }
```

### PHASE 7 — Agent Performs Pickup
```
GET /api/pickup-batches/assigned  → active (PLANNED + IN_PROGRESS)
GET /api/pickup-batches/history   → all statuses (for history tab)

Per stop:
1. PUT /api/pickup-stops/{id}/status → { status: "ARRIVED" }
   batch auto→ IN_PROGRESS on first action

2. PUT /api/pickup-stops/{id}/status → { status: "COMPLETED", actualWeight: 95.5 }
   order→COMPLETED, listing→COMPLETED
   WalletTransaction CREDIT→generator, DEBIT→plant

3. All stops done → batch→COMPLETED (auto)
```

### PHASE 8 — Wallet Settlement
```
Generator: balance positive (credits from completed pickups)
Plant: balance negative shown as "Total Paid Out" (debited on pickup)
Agent: balance positive (credits from deliveries)
GET /api/wallet/mine → { balance, transactions[] }
```

---

## API Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /api/auth/signup | Public | Register |
| POST | /api/auth/login | Public | Login → JWT |
| PUT | /api/users/me/location | Any | Update GPS |
| POST | /api/listings | Generator | Create listing |
| GET | /api/listings/mine | Generator | My listings |
| PUT | /api/listings/{id}/reconfirm | Generator | Reset carry-forward |
| GET | /api/listings/matched | Plant | Filtered+sorted feed |
| POST | /api/listings/{id}/accept | Plant | Accept → order |
| GET | /api/orders/mine | Plant | My orders |
| POST | /api/plant-preferences | Plant | Set preferences |
| GET | /api/plant-preferences/mine | Plant | Get preferences |
| POST | /api/pickup-batches | Plant | Create batch + AI route |
| GET | /api/pickup-batches/mine | Plant | My batches |
| PUT | /api/pickup-batches/{id}/assign-agent | Plant | Assign agent |
| GET | /api/pickup-batches/assigned | Agent | Active trips |
| GET | /api/pickup-batches/history | Agent | Full trip history |
| PUT | /api/pickup-stops/{id}/status | Agent | ARRIVED / COMPLETED |
| GET | /api/agents/available | Plant | Available agents |
| GET | /api/wallet/mine | Any | Wallet + transactions |
| GET | /api/ai/price-recommendation | Plant | AI price suggestion |
| GET | /api/ai/health | Plant | AI health check |

---

## AI Systems (Academic Reference)

### 1. Price Recommendation — Knowledge-Based Expert System
```
Type: Rule-based production system (MYCIN architecture)
File: PriceRecommendationService.java

Knowledge Base (base price per kg):
  SUGARCANE: ₹2.0-3.0 | COCONUT: ₹1.5-2.5 | FLOWER: ₹5.0-8.0
  FRUIT_PULP: ₹1.0-2.0 | DAIRY: ₹3.0-4.5 | PAPER: ₹4.0-6.0
  PLASTIC: ₹6.0-10.0 | METAL: ₹8.0-12.0

Production Rules:
  R1: base = knowledgeBase[wasteType] × quantity  (always fires)
  R2: IF quantity > 500 THEN apply 10% bulk discount
  R3: IF quantity < 20  THEN apply 15% small-load surcharge
  R4: IF distanceKm > 50 THEN apply 20% transport surcharge
  R5: IF urgencyScore ≥ 100 THEN apply 25% urgency premium
```

### 2. Route Optimization — Nearest Neighbor TSP Heuristic
```
Type: Greedy heuristic for Travelling Salesman Problem
File: RouteOptimizationService.java

Algorithm:
  1. Start: plant location (lat, lon)
  2. Repeat until all stops visited:
     a. Calculate Haversine distance to all unvisited stops
     b. Pick the nearest one
     c. Mark visited, add to route
  3. Return optimized sequence + total distance

Distance formula (Haversine):
  d = 2R × arcsin(√(sin²(Δφ/2) + cos(φ₁)cos(φ₂)sin²(Δλ/2)))
  where R = 6371 km

Complexity: O(n²) | Note: requires generator GPS set
```

---

## Enums
```
Role: GENERATOR | RECYCLING_PLANT | LOGISTICS_AGENT
ListingStatus: LISTED | MATCHED | COMPLETED | DISCARDED
OrderStatus: CONFIRMED | IN_TRANSIT | COMPLETED | DISPUTED | CANCELLED
BatchStatus: PLANNED | IN_PROGRESS | COMPLETED | CANCELLED
StopStatus: PENDING | ARRIVED | COMPLETED | FAILED
TransactionType: CREDIT | DEBIT
ExpiryAction: CARRY_FORWARD | DISCARD
```

---

## Test Accounts
| Phone | Password | Role |
|-------|----------|------|
| 9999999999 | test1234 | Generator |
| 9111111111 | pass1234 | Generator |
| 7001234567 | test1234 | Recycling Plant |
| 9222222222 | pass1234 | Recycling Plant |
| 9333333333 | pass1234 | Logistics Agent |

---

## Start Commands

Terminal 1 (Backend):
  cd "C:\Users\Hriday Dasgupta\OneDrive\Desktop\TE_IT_2026_27\ecoconnect-backend-009\ecoconnect-backend"
  $env:PATH += ";C:\Users\Hriday Dasgupta\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin"
  mvn spring-boot:run

Terminal 2 (Frontend):
  cd "C:\Users\Hriday Dasgupta\OneDrive\Desktop\TE_IT_2026_27\ecoconnect-frontend"
  npm run dev

Browser: http://localhost:3000

---

## Project Status: COMPLETE ✅

All 3 role workflows fully functional:
- Generator → Create listing → Reconfirm → Earn money  
- Plant → Browse → AI price → Accept → Batch → AI route → Assign → Track → Pay
- Agent → Assigned trips → Mark arrived → Complete → History → Wallet
