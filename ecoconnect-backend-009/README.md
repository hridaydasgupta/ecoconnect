# 🌿 EcoConnect — Agricultural Waste Management Platform

> **TE IT 2026-27 Project** | Full-Stack Web Application with AI-powered Route Optimization & Price Recommendation

---

## 📌 Project Overview

**EcoConnect** is a digital platform that connects **agricultural waste generators** (farmers, juice shops, dairies) with **recycling plants** and **logistics agents** to enable efficient, transparent, and eco-friendly waste collection and recycling.

The platform solves the problem of unorganized waste disposal in India by:
- Matching waste generators with nearby recycling plants using smart geolocation-based filtering
- Automating pickup route planning using AI (Nearest Neighbor TSP Algorithm)
- Suggesting fair market prices using a Knowledge-based Expert System
- Tracking the entire lifecycle: Listing → Order → Pickup → Wallet Credit

---

## 👥 User Roles

| Role | Description |
|------|-------------|
| 🌾 **Generator** | Farmer / shop owner who creates waste listings |
| 🏭 **Recycling Plant** | Industrial buyer who accepts orders and manages pickups |
| 🚛 **Logistics Agent** | Driver who executes pickup routes |

---

## 🤖 AI Features

### 1. Route Optimization — Heuristic Search AI
- **Algorithm:** Nearest Neighbor Greedy Heuristic (TSP Variant)
- **Category:** Search-based / Optimization AI
- **Complexity:** O(n²) — real-time capable
- **Distance Formula:** Haversine (geodesic great-circle distance)
- **How it works:** When a plant creates a pickup batch, the AI automatically sorts pickup stops into the shortest visiting order using GPS coordinates of each generator
- **Academic Reference:** Travelling Salesman Problem (NP-Hard) solved via greedy heuristic

```
Before AI:  Andheri → Thane → Bandra → Dadar  (55 km)
After AI:   Andheri → Bandra → Dadar → Thane  (32 km) ✅
```

### 2. Price Recommendation — Knowledge-based Expert System
- **Architecture:** Knowledge Base + Inference Engine + User Interface
- **Category:** Rule-based AI / Expert System
- **Academic Reference:** MYCIN Expert System architecture (Shortliffe, 1976)
- **Production Rules (IF-THEN):**

| Rule | Condition | Action |
|------|-----------|--------|
| R1 | Waste type lookup | Apply base price from knowledge base (₹/kg) |
| R2 | Quantity > 500 kg | Apply 10% bulk discount |
| R3 | Quantity < 20 kg | Apply 15% small-load premium |
| R4 | Distance > 50 km | Deduct transport cost (₹2.5/km) |
| R5 | Urgency score ≥ 100 | Apply 8% urgency markdown |

- **Output:** Suggested price range (₹low – ₹high) + recommended midpoint + rule reasoning trace

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | JDK 24 | Core language |
| Spring Boot | 3.x | REST API framework |
| Spring Security | 6.x | JWT authentication |
| Spring Data JPA | 3.x | ORM / Database layer |
| PostgreSQL | 16 | Relational database |
| Lombok | Latest | Boilerplate reduction |
| Maven | 3.9.16 | Build tool |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI library |
| Vite | 5.x | Build tool / Dev server |
| React Router | 6 | Client-side routing |
| Axios | 1.x | HTTP client |
| Vanilla CSS | — | Dark glassmorphism UI |

---

## 🗂️ Project Structure

```
ecoconnect/
├── ecoconnect-backend/                  # Spring Boot API
│   └── src/main/java/com/ecoconnect/
│       ├── controller/                  # REST Controllers
│       │   ├── AiController.java        # 🤖 AI endpoints
│       │   ├── AuthController.java
│       │   ├── WasteListingController.java
│       │   ├── OrderController.java
│       │   ├── PickupBatchController.java
│       │   ├── PickupStopController.java
│       │   └── WalletController.java
│       ├── service/                     # Business Logic
│       │   ├── RouteOptimizationService.java   # 🤖 AI: TSP Heuristic
│       │   ├── PriceRecommendationService.java # 🤖 AI: Expert System
│       │   ├── AuthService.java
│       │   ├── PickupBatchService.java
│       │   ├── WasteListingService.java
│       │   └── WalletService.java
│       ├── model/                       # JPA Entities
│       ├── dto/                         # Data Transfer Objects
│       ├── repository/                  # Spring Data JPA Repos
│       └── security/                    # JWT Auth Filter + Config
│
└── ecoconnect-frontend/                 # React App
    └── src/
        ├── pages/
        │   ├── generator/               # Generator dashboard pages
        │   ├── plant/                   # Recycling plant pages
        │   │   └── MatchedListings.jsx  # 🤖 AI Price panel
        │   └── agent/
        │       └── AgentTrips.jsx       # 🤖 AI Route display
        ├── components/
        │   ├── Sidebar.jsx              # Mobile-responsive with hamburger
        │   └── Toast.jsx                # Toast notification system
        └── api/
            └── endpoints.js             # All API calls incl. AI
```

---

## 🚀 How to Run

### Prerequisites
- Java JDK 24
- Maven 3.9+
- Node.js 18+
- PostgreSQL 16 (running on localhost:5432)

### Step 1 — Start Backend

```powershell
cd "ecoconnect-backend-009\ecoconnect-backend"
$env:PATH += ";C:\Users\Hriday Dasgupta\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin"
mvn spring-boot:run
```
Backend runs at: `http://localhost:8080`

### Step 2 — Start Frontend

```powershell
cd "ecoconnect-frontend"
npm run dev
```
Frontend runs at: `http://localhost:3000`

---

## 🔑 Test Accounts

| Name | Phone | Password | Role |
|------|-------|----------|------|
| Test User | `9999999999` | `test1234` | 🌾 Generator |
| Ananya Sharma | `7001234567` | `test1234` | 🏭 Recycling Plant |
| Ravi Kumar | `9111111111` | `pass1234` | 🌾 Generator |
| Eco Plant Ltd | `9222222222` | `pass1234` | 🏭 Recycling Plant |
| Ramesh Driver | `9333333333` | `pass1234` | 🚛 Logistics Agent |

---

## 📡 API Endpoints

### Auth
```
POST /api/auth/signup         → { name, phone, email, password, role }
POST /api/auth/login          → { phone, password } → { token, role, name }
```

### Generator
```
POST /api/listings            → Create waste listing
GET  /api/listings/mine       → My listings
PUT  /api/listings/{id}/reconfirm → Reconfirm carry-forward listing
PUT  /api/users/me/location   → { latitude, longitude }
GET  /api/wallet/mine         → Wallet + transactions
```

### Recycling Plant
```
POST /api/plant-preferences   → Set/update preferences (upsert)
GET  /api/listings/matched    → Smart-matched listings (radius + waste type)
POST /api/listings/{id}/accept → { agreedPrice } → Accept listing
GET  /api/orders/mine         → My orders
POST /api/pickup-batches      → Create batch (AI route-optimizes stops)
PUT  /api/pickup-batches/{id}/assign-agent → { agentId }
GET  /api/wallet/mine         → Wallet + transactions
```

### Logistics Agent
```
GET  /api/pickup-batches/assigned    → My assigned batches (AI-sorted stops)
PUT  /api/pickup-stops/{id}/status   → { status, actualWeight }
GET  /api/wallet/mine                → Wallet + transactions
```

### 🤖 AI Endpoints
```
GET  /api/ai/price-recommendation
     ?wasteType=SUGARCANE&quantityKg=100&distanceKm=12&urgencyScore=50
     → { totalPriceLow, totalPriceHigh, recommendedPrice, reasoning[] }

GET  /api/ai/health → AI system status
```

---

## 🔄 Complete Flow

```
1. GENERATOR
   └── Signup/Login
   └── Share GPS Location
   └── Create Waste Listing (wasteType, quantity, deadline, onExpiryAction)

2. RECYCLING PLANT
   └── Set Preferences (accepted waste types, radius, capacity)
   └── View Matched Listings (sorted by urgency + distance)
   └── Click Accept → 🤖 AI Price Suggestion appears (Knowledge-based System)
   └── Confirm Agreed Price → Order Created (status: CONFIRMED)

3. RECYCLING PLANT
   └── Create Pickup Batch (select CONFIRMED orders)
   └── 🤖 AI Route Optimizer runs (Nearest Neighbor TSP)
   └── Stops auto-sorted by shortest path, totalDistanceKm saved
   └── Order status → IN_TRANSIT
   └── Assign Logistics Agent to batch

4. LOGISTICS AGENT
   └── View Assigned Batches
   └── See 🤖 AI Optimized Route (X km, Nearest Neighbor)
   └── Mark each stop ARRIVED → then COMPLETED (enter actual weight)
   └── On completion: Generator CREDITED, Plant DEBITED ✅

5. WALLET
   └── Generator sees ₹ CREDIT in wallet
   └── Plant sees ₹ DEBIT in wallet
   └── Order status → COMPLETED, Listing → COMPLETED
```

---

## 🎨 UI Design

- **Theme:** Dark glassmorphism (dark background + frosted glass cards)
- **Colors:** Green (`#00D68F`) + Blue (`#3B82F6`) accent on dark `#0D1117` background
- **Mobile:** Fully responsive with hamburger sidebar navigation
- **Components:** Toast notifications, Loading spinners, Modal dialogs, Badge system

---

## 🏆 Key Achievements

| Feature | Detail |
|---------|--------|
| ✅ End-to-end flow | Listing → Matching → Order → Batch → Pickup → Wallet |
| 🤖 AI Route Optimizer | Nearest Neighbor TSP, Haversine distance, O(n²) |
| 🤖 AI Price Recommender | Rule-based Expert System, 5 production rules |
| 📱 Mobile Responsive | Hamburger menu, responsive grids, horizontal scroll tables |
| 🔐 JWT Security | Role-based access control, token-based auth |
| ⚡ DB Optimized | All queries use indexed DB-level filtering (no in-memory scans) |
| 🧪 25/25 Tests Passing | Full API end-to-end flow verified |

---

## 👨‍💻 Team

**TE IT 2026-27**

---

*Built with ❤️ for a greener India 🌿*
