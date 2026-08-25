# TechStore — Plataforma de Comercio Electrónico MVP

Plataforma web MVP para comercio electrónico de artículos tecnológicos en Tarija, Bolivia, desarrollada bajo arquitectura MVC en capas, principios SOLID y cumplimiento normativo (Ley N° 164 y Ley N° 453).

---

## 🚀 Arquitectura y Tecnologías

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons.
- **Backend:** Node.js + Express + TypeScript + SQLite / PostgreSQL (Relacional 3FN con 8 tablas).
- **Conectividad Cloud:** Cliente tipado e integración lista para Supabase PostgreSQL con RLS (`docs/database/supabase_schema.sql`).
- **Principios de Diseño:** Arquitectura SOLID (inyección de dependencias, validadores desacoplados, contratos de interfaces) y heurísticas de usabilidad Nielsen.

---

## 📂 Estructura del Proyecto (`TechStore/`)

```text
TechStore/
├── client/                     # Frontend SPA (React + Tailwind CSS + Vite)
│   ├── src/
│   │   ├── components/         # Navbar, Breadcrumbs, Modales, Tarjetas
│   │   ├── context/            # AuthContext, CartContext
│   │   ├── lib/                # supabase.ts (Cliente Supabase)
│   │   ├── services/           # api.ts (Conexión HTTP REST)
│   │   ├── types/              # Interfaces TypeScript y modelos de Supabase
│   │   └── views/              # CatalogoView (HU-01), CarritoView (HU-02), PedidoView (HU-03), AdministradorView (HU-04)
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
└── server/                     # Backend API REST (Node.js + Express + TypeScript)
    ├── src/
    │   ├── controllers/        # Controladores HTTP (MVC)
    │   ├── database/           # db.ts (Esquema relacional y seeds)
    │   ├── interfaces/         # Contratos desacoplados de repositorios (SOLID/ISP)
    │   ├── models/             # Tipos y modelos de dominio
    │   ├── repositories/       # Capa de persistencia (Producto, Carrito, Pedido, Categoria, Usuario)
    │   ├── routes/             # api.ts (Rutas de la API)
    │   ├── services/           # Lógica de negocio (ProductoService, CarritoService, PedidoService)
    │   └── validators/         # Validadores especializados (SRP)
    ├── test_hu01.js            # Pruebas automatizadas HU-01
    ├── test_hu02.js            # Pruebas automatizadas HU-02
    ├── test_hu03.js            # Pruebas automatizadas HU-03
    ├── test_hu04.js            # Pruebas automatizadas HU-04
    ├── test_e2e.js             # Suite de integración E2E completa
    └── package.json
```

---

## 🛠️ Instrucciones de Instalación y Ejecución

### 1. Iniciar el Backend (Puerto 3001)
```bash
cd TechStore/server
npm install
npm run build
npm start
```

### 2. Iniciar el Frontend (Puerto 5173)
```bash
cd TechStore/client
npm install
npm run dev
```

Abre tu navegador en: **`http://localhost:5173/`**

---

## 🧪 Pruebas Automatizadas

Dentro de `TechStore/server`:
```bash
node test_hu01.js   # Valida HU-01: Catálogo, búsquedas y filtros
node test_hu02.js   # Valida HU-02: Carrito, subtotales y disponibilidad de stock
node test_hu03.js   # Valida HU-03: Checkout, datos obligatorios y número autogenerado
node test_hu04.js   # Valida HU-04: Gestión admin, duplicados y Soft-Delete
node test_e2e.js    # Suite completa E2E
```
