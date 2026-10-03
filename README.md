# KSHETRA OS — Unified Land Governance DPI
**Smart India Hackathon 2026 Prototype**  
**Problem Statement SIH26014**: Land Stack, MoRD / DoLR  
*Integrated GIS-based Digital Public Infrastructure for Cadastral Management, Encumbrance Verification, and Land Governance*

---

## 🏛️ System Architecture

```
/shared             Shared domain types, deterministic ULPIN derivation, and role definitions
  ├── types.ts      Normalized Land Stack domain interfaces (Parcel, Encumbrance, Zoning, etc.)
  ├── ulpin.ts      14-char deterministic Bhu-Aadhaar ULPIN generator and validators
  └── roles.ts      Three official personas (Citizen, Land Officer / Tahsildar, Policy Admin)

/server             Express + TypeScript ESM Server with real database persistence
  ├── config.ts     Environment configuration, port, JWT secrets, and DB paths
  ├── index.ts      Express server setup with routes, JWT authentication, and error handling
  ├── middleware/   Auth (JWT 2h), RBAC, Zod validation, rate limiting, and errors
  ├── repo/         IRepository interface, SQLite (better-sqlite3) & JSON stores, seed generator
  ├── routes/       Auth, parcels, layers, requests, ledger, health, and docs
  └── services/     Geo spatial engine (Turf), risk rule engine, SHA-256 ledger, serializers

/src                React 19 Client with Typed API Client
  ├── services/     apiClient.ts (clean typed fetch client; NO direct mock imports)
  ├── context/      AuthContext, LanguageContext (A- / A / A+ root rem scaling)
  └── components/   Leaflet GIS, Cadastral Search, Officer Console, Ledger, and Modals
```

---

## 💾 Data Persistence & Seed Notes

### Where Data Lives
- **Database Engine**: Persistent SQLite database stored at `data/kshetra.db` via `better-sqlite3`, with automatic WAL journal mode.
- **Swappable Architecture**: Fully swappable with `data/kshetra_db.json` behind the same `IRepository` interface (`DB_TYPE=sqlite` or `DB_TYPE=json`).
- **Deterministic Seeding**: On first boot or database reset, the system deterministically seeds exactly 26 parcels across 5 major metros (Bengaluru 6, Hyderabad 5, Pune 5, Lucknow 5, Ahmedabad 5) with valid GeoJSON polygon boundaries (0.3 to 5 hectares), SRO conveyances, CERSAI charges, municipal tax records, and statutory waterbodies.
- **Hosted Filesystem Behavior**: In containerized or ephemerally hosted cloud environments (e.g. Cloud Run), disk storage may reset on container redeployment. The application handles this gracefully by detecting missing tables or counts and automatically restoring the exact deterministic seed database.

---

## 🔐 Authentication & Role Gating (Layer 2)

- **Simulated Authentication**: Three personas with 2-hour server-signed JWTs (`POST /api/auth/login`, `POST /api/auth/otp/verify` with demo OTP `123456`, and `POST /api/auth/sso`).
- **Server-Side Field Stripping**: The single `serializeParcel(parcel, role)` serializer physically removes sensitive fields (`mortgageDetails`, `courtCaseNumber`, `stayOrderDetails`, `coOwners`, Aadhaar fragments) from the HTTP JSON payload for citizen sessions before transmission over the wire. Officers and Administrators receive complete records.

---

## 📜 Cryptographic Audit Ledger (Layer 0)

- Every parcel lookup, role switch, workflow transition, and partition survey is chained into an append-only SHA-256 block ledger.
- Verification recalculates every hash in the sequence from genesis to head and detects memory or disk tampering down to the exact block index.

---

## 🚀 Running the System

```bash
# Install dependencies
npm install

# Run full-stack dev server (Express backend + Vite client)
npm run dev

# Run Stage 1 Unit Tests (ULPIN, Seed, Role Masking, Risk Rules, Ledger, SQLite)
npx tsx test/stage1.test.ts

# Production build
npm run build
```
