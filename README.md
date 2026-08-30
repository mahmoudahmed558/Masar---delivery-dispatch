# 🚀 Masar — Speed Delivery Dispatch System

<p align="center">
  <img src="frontend/public/assets/masar-logo.png" alt="Masar Logo" width="120" />
</p>

<p align="center">
  <strong>نظام متكامل لإدارة عمليات التوصيل والدسباتش</strong><br/>
  Full-stack delivery management system built with Laravel & React
</p>

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Laravel 11 (PHP) — RESTful API |
| **Frontend** | React.js + Vite |
| **Database** | MySQL |
| **Maps** | Leaflet.js |
| **Auth** | Laravel Sanctum (Token-based) |

## 🏗️ Architecture

```
eltaisier/
├── backend/          # Laravel API (port 8000)
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── routes/api.php
│   └── database/migrations/
│
└── frontend/         # React SPA (port 5173)
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── layouts/
    │   ├── context/
    │   ├── hooks/
    │   ├── services/
    │   ├── config/
    │   └── styles/
    └── public/assets/
```

## 👥 User Roles

| Role | Access |
|------|--------|
| **Admin** | Full system control, user management |
| **Manager** | Orders, pilots, dashboard |
| **Pilot** | Mobile app — accept & deliver orders |
| **Customer** | Create orders, track shipments |

## 🚀 Quick Start

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📱 Features
- ✅ Order lifecycle management (create → assign → pickup → deliver)
- ✅ Real-time pilot GPS tracking on map
- ✅ In-app camera for Proof of Delivery (POD)
- ✅ Public tracking page (no login required)
- ✅ Dashboard with live statistics
- ✅ Role-based access control
- ✅ Premium customer portal (Arabic UI)
- ✅ SEO optimized

## 📄 License
Private — All rights reserved © Masar Speed Delivery
