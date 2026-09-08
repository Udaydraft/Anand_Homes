# AntiGravity — Unified Web + Mobile Monorepo

A production-ready monorepo integrating a **React Web Application**, an **Expo React Native Mobile Application**, a **Python FastAPI Backend**, and a shared **MongoDB Database**.

Both Web and Mobile applications consume the **exact same FastAPI backend** and interact with the **exact same MongoDB database**.

---

## 1. System Architecture

```
                       ┌─────────────────────────┐
                       │    MongoDB Database     │
                       │ (Local / MongoDB Atlas) │
                       └────────────▲────────────┘
                                    │
                                    │ (Motor Async Driver)
                                    │
                       ┌────────────┴────────────┐
                       │     FastAPI Backend     │
                       │    (Port 8000 /api)     │
                       └────────────▲────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │ (REST API + JWT Bearer Auth)│
           ┌─────────┴──────────┐        ┌─────────┴──────────┐
           │   Web Application  │        │ Mobile Application │
           │   (React + Vite)   │        │(React Native+Expo) │
           │ Tailwind CSS + Qry │        │ TanStack + SecStore│
           └─────────┬──────────┘        └─────────┬──────────┘
                     │                             │
                     └──────────────┬──────────────┘
                                    │
                        ┌───────────┴───────────┐
                        │    packages/shared    │
                        │ (Types, Roles, Enums) │
                        └───────────────────────┘
```

> **Crucial Rule**: Web and Mobile clients **never** connect directly to MongoDB. Only the FastAPI backend communicates with the database layer.

---

## 2. Technology Stack

### Backend
- **Framework**: Python FastAPI (Async / ASGI)
- **Database Driver**: Motor (Async MongoDB driver) + PyMongo
- **Validation**: Pydantic v2 & Pydantic Settings
- **Authentication**: JWT (JSON Web Tokens via `PyJWT`), password hashing via `bcrypt`
- **Documentation**: Automatic OpenAPI / Swagger UI (`/docs`) and ReDoc (`/redoc`)
- **Testing**: `pytest`, `pytest-asyncio`, `httpx`, `mongomock-motor`

### Web Application
- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router v6
- **Server State**: TanStack Query v5
- **HTTP Client**: Centralized Axios instance with token injection & 401 refresh interceptor
- **Styling**: Tailwind CSS (modern dark-mode slate & indigo design system)
- **Icons**: Lucide React

### Mobile Application
- **Framework**: React Native + Expo (SDK 51) + TypeScript
- **Navigation**: React Navigation (Native Stack)
- **Server State**: TanStack Query v5
- **HTTP Client**: Centralized Axios instance matching Web API client
- **Secure Storage**: `expo-secure-store` (hardware-backed keychain / keystore)

### Shared Packages
- **`packages/shared`**: Shared TypeScript definitions (`User`, `Role`, `ApiResponse`), endpoint constants, and form validators.

---

## 3. Monorepo Folder Structure

```
AntiGravity/
├── backend/                        # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py                 # FastAPI initialization, lifespan, CORS & middlewares
│   │   ├── api/                    # Route handlers (HTTP requests/responses only)
│   │   │   ├── auth.py             # /api/auth endpoints (register, login, refresh, me)
│   │   │   └── users.py            # /api/users endpoints (profile management)
│   │   ├── core/                   # Core settings and crypto
│   │   │   ├── config.py           # Pydantic Settings & environment loader
│   │   │   └── security.py         # bcrypt hashing & JWT token issuance/verification
│   │   ├── database/               # Database connection lifecycle
│   │   │   └── mongodb.py          # Motor async connection pool & index manager
│   │   ├── dependencies/           # FastAPI dependency injection
│   │   │   └── auth.py             # Bearer JWT extraction & role enforcement
│   │   ├── models/                 # Database entity representations
│   │   │   └── user.py             # UserModel MongoDB document
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   │   └── user.py             # UserBase, Register, Login, ApiResponse envelopes
│   │   └── services/               # Business logic layer
│   │       ├── auth_service.py     # Registration, credential check, token generation
│   │       └── user_service.py     # User queries and updates
│   ├── tests/                      # Automated test suite
│   │   ├── conftest.py             # Async client & in-memory MongoDB fixtures
│   │   ├── test_auth.py            # Registration, login, JWT refresh tests
│   │   └── test_health.py          # Health check & metadata tests
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Backend environment template
│   └── .env                        # Local development environment
│
├── web/                            # React + Vite Web Application
│   ├── src/
│   │   ├── components/             # Reusable UI components (Button, Input, Card, Modal, etc.)
│   │   ├── hooks/                  # Custom hooks (useAuth)
│   │   ├── layouts/                # AuthLayout, DashboardLayout
│   │   ├── pages/                  # LoginPage, RegisterPage, DashboardPage, ProfilePage
│   │   ├── services/               # Centralized Axios client & services
│   │   ├── types/                  # Web type extensions
│   │   ├── utils/                  # Tailwind merge utilities (cn)
│   │   ├── App.tsx                 # App router & providers
│   │   ├── index.css               # Tailwind & theme styles
│   │   └── main.tsx                # React DOM entry
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── .env.example
│   └── .env
│
├── mobile/                         # React Native + Expo Application
│   ├── src/
│   │   ├── components/             # Reusable native components (Button, Input, Card, etc.)
│   │   ├── hooks/                  # useAuth hook
│   │   ├── navigation/             # Native Stack navigation
│   │   ├── screens/                # LoginScreen, RegisterScreen, DashboardScreen, ProfileScreen
│   │   ├── services/               # Centralized Axios client matching Web
│   │   └── utils/                  # Secure token storage wrapper (expo-secure-store)
│   ├── App.tsx                     # Mobile root entry point
│   ├── app.json                    # Expo configuration
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── packages/
│   └── shared/                     # Shared TypeScript Library
│       ├── constants/              # ROLES, API_ENDPOINTS
│       ├── types/                  # User, Auth, ApiResponse interfaces
│       ├── validation/             # Email, password, and input validators
│       ├── index.ts                # Package barrel
│       └── package.json
│
├── .gitignore                      # Enforces zero committed secrets or caches
├── package.json                    # Root workspaces configuration
└── README.md                       # Documentation
```

---

## 4. Prerequisites

- **Python**: 3.11+ (Tested and verified on Python 3.14)
- **Node.js**: 18+ (Tested on Node v24)
- **npm**: 9+
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI

---

## 5. Environment Configuration

### Backend (`backend/.env`)
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=antigravity_db
JWT_SECRET=dev-secret-change-in-production-c2a4b8d7f1e94589
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:8081
```

### Web (`web/.env`)
```env
VITE_API_URL=http://localhost:8000/api
```

### Mobile (`mobile/.env`)
```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```
*(Note for Mobile: When testing on a physical mobile device, replace `localhost` with your machine's LAN IP address e.g. `http://192.168.1.50:8000/api`. On Android emulators, use `http://10.0.2.2:8000/api`).*

---

## 6. Running the Monorepo

### A. Start Backend
```powershell
# From project root or backend directory:
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Swagger API Docs: `http://127.0.0.1:8000/docs`
- ReDoc Docs: `http://127.0.0.1:8000/redoc`
- Health Check: `http://127.0.0.1:8000/health`

### B. Run Backend Tests
```powershell
python -m pytest backend/tests -v
```

### C. Start Web Application
```powershell
npm run dev:web
# Or: cd web && npm run dev
```
Open browser at: `http://localhost:5173`

### D. Start Mobile Application
```powershell
npm run dev:mobile
# Or: cd mobile && npx expo start
```
Scan the QR code with the Expo Go app on iOS or Android, or press `w` to run in web preview.

---

## 7. Authentication Flow

1. **Registration** (`POST /api/auth/register`):
   - Client sends `name`, `email`, `password`.
   - Backend hashes password with `bcrypt`.
   - User document inserted into MongoDB with unique index on `email`.
   - Returns JWT `access_token` and `refresh_token`.
2. **Login** (`POST /api/auth/login`):
   - Validates credentials against `bcrypt` hash.
   - Issues fresh access & refresh tokens.
3. **Protected Requests** (`GET /api/auth/me`, `GET /api/users/profile`):
   - Client attaches `Authorization: Bearer <access_token>`.
   - Backend verifies signature and expiration, injecting authenticated `UserModel`.
4. **Automatic Token Refresh** (`POST /api/auth/refresh`):
   - When access token expires (401), client Axios interceptor automatically posts refresh token to `/api/auth/refresh`.
   - New tokens are saved securely (`localStorage` on Web, `expo-secure-store` on Mobile) and failed request is retried transparently.
5. **Logout** (`POST /api/auth/logout`):
   - Clears tokens and resets local auth state.

---

## 8. Development Commands Reference

| Action | Command |
| :--- | :--- |
| **Install Node Dependencies** | `cmd /c npm install` |
| **Install Python Requirements** | `python -m pip install -r backend/requirements.txt` |
| **Run Backend Dev Server** | `cd backend && python -m uvicorn app.main:app --reload --port 8000` |
| **Run Backend Tests** | `python -m pytest backend/tests -v` |
| **Run Web Dev Server** | `npm run dev:web` (Port 5173) |
| **Build Web Application** | `npm run build:web` |
| **Run Mobile App** | `npm run dev:mobile` |
| **Typecheck Mobile** | `cd mobile && npm run typecheck` |
