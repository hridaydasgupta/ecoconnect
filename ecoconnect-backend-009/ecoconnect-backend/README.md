# EcoConnect Backend (Spring Boot)

## What's in here
- `pom.xml` — dependencies: Spring Web, Spring Data JPA, PostgreSQL driver, Lombok, Validation
- `src/main/resources/application.properties` — update your local Postgres username/password here
- `src/main/java/com/ecoconnect/model/` — JPA entities, one per table:
  - `User`, `GeneratorPreferences`, `PlantPreferences`
  - `WasteListing`, `OrderEntity` (maps to the `orders` table), `PickupBatch`, `PickupStop`
  - `WalletTransaction`
- `src/main/java/com/ecoconnect/model/enums/` — Role, ListingStatus, ExpiryAction, ListingPattern,
  OrderStatus, BatchStatus, StopStatus, TransactionType

## How to run
1. Create a Postgres database named `ecoconnect`.
2. Update `application.properties` with your Postgres username/password.
3. `spring.jpa.hibernate.ddl-auto=update` is set — Hibernate will auto-create tables from
   these entities on first run, matching the finalized SQL schema we designed.
4. Run: `mvn spring-boot:run`

## Auth API (ready to test)

Two endpoints, both public (no token needed):

**POST /api/auth/signup**
```json
{
  "name": "Ramesh Patil",
  "phone": "9876543210",
  "email": "ramesh@example.com",
  "password": "test1234",
  "role": "GENERATOR"
}
```
`role` must be one of: `GENERATOR`, `RECYCLING_PLANT`, `LOGISTICS_AGENT`, `ADMIN`

**POST /api/auth/login**
```json
{
  "phone": "9876543210",
  "password": "test1234"
}
```

Both return:
```json
{ "token": "...", "userId": "...", "name": "...", "role": "GENERATOR" }
```

Use the `token` as `Authorization: Bearer <token>` header for any future endpoint
that requires login (everything except `/api/auth/**` is protected by default).

## Listing API (requires login — send the JWT from signup/login)

Add header on every request below: `Authorization: Bearer <token>`

**POST /api/listings** — create a listing (only works if logged-in user's role is GENERATOR)
```json
{
  "wasteType": "SUGARCANE",
  "quantity": 120,
  "unit": "KG",
  "pickupDeadlineTime": "20:00:00",
  "onExpiryAction": "CARRY_FORWARD"
}
```

**GET /api/listings** — browse all active (LISTED) listings — any logged-in user (e.g. a Plant)

**GET /api/listings/mine** — see only your own listings (only works for GENERATOR role)

## Plant Preferences API (only RECYCLING_PLANT role)

**POST /api/plant-preferences** — set/update what this plant accepts (upsert — safe to call again to update)
```json
{
  "acceptedWasteTypes": ["SUGARCANE", "COCONUT"],
  "preferredRadiusKm": 25,
  "minQuantityKg": 50,
  "maxCapacityKg": 300,
  "notifyInstantly": true
}
```

**GET /api/plant-preferences/mine** — view your own preferences

## Matching API (only RECYCLING_PLANT role)

**GET /api/listings/matched** — the smart feed: only listings whose `wasteType` is in
this plant's `acceptedWasteTypes`, within `preferredRadiusKm` of the plant's location,
sorted by urgency first then distance. Requires:
1. The plant has called `POST /api/plant-preferences` at least once.
2. Both the plant's `User` row and the generator's `User` row have `latitude`/`longitude`
   set (currently there's no endpoint to set these yet — update them directly in the
   database for testing, e.g. via the IntelliJ Database tool).

If location is missing on either side, that listing is still included (just without a
computed distance) rather than being silently excluded.

## Location API (any logged-in user)

**PUT /api/users/me/location** — needed for real distance matching to work
```json
{ "latitude": 19.0760, "longitude": 72.8777 }
```

## Order API (only RECYCLING_PLANT role)

**POST /api/listings/{id}/accept** — turn a LISTED listing into a confirmed Order
```json
{ "agreedPrice": 500 }
```
Marks the listing `MATCHED` so it drops out of `/api/listings/matched`.

**GET /api/orders/mine** — see all your confirmed orders

## Pickup Batch API (only RECYCLING_PLANT role) — the multi-stop trip feature

**POST /api/pickup-batches** — group multiple confirmed Orders into one physical trip
```json
{
  "orderIds": ["<order-id-1>", "<order-id-2>"],
  "scheduledDate": "2026-09-10"
}
```
Checks the total weight against this plant's `maxCapacityKg` (from Plant Preferences) —
rejects with a clear error if it's exceeded, telling you to split into multiple batches.
Creates one `PickupStop` per order, in the order you listed them.

**GET /api/pickup-batches/mine** — see all your batches with their stops

## Full flow to test end-to-end
1. Generator signs up, sets location, creates a listing.
2. Plant signs up, sets location, sets preferences (accepted types + radius + capacity).
3. Plant calls `/api/listings/matched` — sees the compatible nearby listing.
4. Plant calls `/api/listings/{id}/accept` — an Order is created.
5. Plant calls `/api/pickup-batches` with that order's ID — a batch + stop is created.

## Logistics Agent flow (completes the whole loop — this is where payment happens)

**GET /api/agents/available** (RECYCLING_PLANT) — list all LOGISTICS_AGENT users, so the plant can pick one

**PUT /api/pickup-batches/{id}/assign-agent** (RECYCLING_PLANT)
```json
{ "agentId": "<agent-user-id>" }
```

**GET /api/pickup-batches/assigned** (LOGISTICS_AGENT) — agent sees batches assigned to them (PLANNED/IN_PROGRESS)

**PUT /api/pickup-stops/{id}/status** (LOGISTICS_AGENT) — the agent actually executing the pickup
```json
{ "status": "COMPLETED", "actualWeight": 118 }
```
`status` can be `ARRIVED`, `COMPLETED`, or `FAILED`. `actualWeight` is required for `COMPLETED`.

When a stop is marked `COMPLETED`, the system automatically:
- Marks the Order and the original WasteListing as `COMPLETED`
- Credits the generator's wallet (`WalletTransaction` type `CREDIT`)
- Debits the plant's wallet (`WalletTransaction` type `DEBIT`)
- Once every stop in a batch is `COMPLETED`/`FAILED`, the batch itself becomes `COMPLETED`

## Full end-to-end flow (the whole platform, start to finish)
1. Generator signs up, sets location, creates a listing.
2. Plant signs up, sets location, sets preferences.
3. Plant sees it via `/api/listings/matched`, accepts it (`/api/listings/{id}/accept`) → Order created.
4. Plant creates a batch with that order (`/api/pickup-batches`).
5. Agent signs up (role LOGISTICS_AGENT). Plant lists agents (`/api/agents/available`), assigns one to the batch.
6. Agent sees the batch (`/api/pickup-batches/assigned`), marks the stop `COMPLETED` with actual weight.
7. Generator's wallet now shows a `CREDIT` transaction — check the `wallet_transactions` table.

## Wallet API (any role)

**GET /api/wallet/mine** — your balance + full transaction history
```json
{
  "balance": 500,
  "transactions": [
    { "id": "...", "amount": 500, "type": "CREDIT", "relatedOrderId": "...", "createdAt": "..." }
  ]
}
```

## Listing Expiry Scheduler (runs automatically — no API call needed)

Every hour, `ListingExpiryScheduler` checks all `LISTED` listings whose `expiresAt` has passed:
- **`DISCARD`** choice → immediately marked `DISCARDED`
- **`CARRY_FORWARD`**, first time expiring → auto-extended by 1 day (grace period),
  `carryForwardCount` becomes 1
- **`CARRY_FORWARD`**, already used the grace extension → auto-`DISCARDED`
  (generator never reconfirmed)

For testing without waiting an hour, temporarily change the cron in
`ListingExpiryScheduler.java` to `@Scheduled(fixedRate = 60000)` (runs every minute),
create a listing with a `pickupDeadlineTime` a minute or two in the past, and watch its
status change in the database.

## Next steps
- Route optimization: call a Maps API with each stop's lat/long to get the actual best
  order and real distance, instead of the plant's manually chosen order.
- An endpoint for a generator to manually reconfirm/edit a carried-forward listing
  (resets `carryForwardCount` to 0 and `lastConfirmedAt`), so they aren't purely at the
  mercy of the auto-discard grace period.
