# NexRetail — Connected Smart Retail Platform

An end-to-end connected physical-digital retail operating platform built for **Customers**, **Retail Shopkeepers / Store Managers**, and **Supermarket Administrators**.

---

## ☁️ Deployment

The repository includes a `Dockerfile` and `render.yaml` to deploy the React client and Spring Boot API as one Render web service. On Render, create a **Blueprint** from this repository and select the supplied `render.yaml`; it deploys in the Singapore region on the free plan.

For this demo deployment, the service uses H2 and automatically seeds its sample data. The free plan has an ephemeral filesystem, so database changes and uploaded images reset after a restart, redeploy, or idle spin-down. Use a managed database and object storage before treating it as a production deployment.

---

## 🌟 The Core Problem & Solution

Traditional retail software is fragmented:
- **Customers** don't know live stock availability, waste time searching aisles, get stuck in billing lines, and cannot optimize their shopping route.
- **Store Managers** lack visibility into what out-of-stock items customers are actively looking for, face delayed stockout alerts, and manage inventory with complex software.
- **Supermarket Admins** struggle to map department layouts (*Sections &rarr; Aisles &rarr; Shelves*), track equipment issues, and roll out verified promotional campaigns.

### The Connected Retail Bridge:
1. **Live Shelf & Aisle Wayfinding**: Customers see exact physical store coordinates (e.g. `Aisle 3 • Shelf C1 (Top Tray) • Dairy & Chilled Foods`) and live inventory availability before & during their shopping trip.
2. **Smart Shopping List & Route Optimizer**: Customers enter their grocery list; the app verifies live store stock and sequences items into an **In-Store Walking Route** grouped by department and aisle.
3. **Genuine Demand Telemetry**: When customers search for or add out-of-stock products to their shopping lists, the system records real-time **Unfulfilled Demand Signals** for the store manager with estimated lost revenue and reorder advice.
4. **Express In-Store Pickup Pre-Orders**: Customers reserve items from live shelf inventory, receive an instant **Pickup Code Token** (e.g. `PKP-721`), and pick up packed bags at the express counter without waiting in billing lines.
5. **Supermarket Layout & Promotions Engine**: Supermarket admins configure the physical store grid and launch promotional offers.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Responsive Mobile Bottom Bar & Desktop Management Dashboards.
- **Backend**: Spring Boot 3.3.4 (Java 21), Spring Data JPA, RESTful API Controllers, Validation.
- **Database**:
  - In-Memory **H2 Database** for zero-setup execution out of the box with embedded web console at `http://localhost:8080/h2-console`.
  - **MySQL Profile** (`--spring.profiles.active=mysql`) for production database deployment.

---

## 🚀 How to Run the Project

### 1. Start the React Frontend (Port 3000)

```powershell
cd smart-retail-platform/frontend
npm run dev
```

Open your browser at `http://localhost:3000`

### 2. Start the Spring Boot Backend (Port 8080)

```powershell
cd smart-retail-platform/backend
$env:JAVA_HOME="C:\Program Files\Microsoft\jdk-21.0.7.6-hotspot"
.\mvnw.cmd spring-boot:run
```

API Root: `http://localhost:8080/api`  
H2 Database Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:retaildb`, User: `sa`, Password: `""`)

---

## 👥 Three Dedicated User Roles

The top navbar includes an **Instant Role Switcher** designed for hackathon demonstrations:

1. **👤 Customer**:
   - Live Product Search with Availability Badges (🟢 *In Stock*, 🟡 *Low Stock*, 🔴 *Currently unavailable*).
   - Smart Shopping List with Live Stock Match & In-Store Walking Route Optimizer.
   - Supermarket Aisle & Shelf Explorer.
   - In-Store Promotional Offers.
   - Cart with Express In-Store Pickup Pre-Order Tokens.

2. **🏪 Store Manager / Retailer**:
   - Operational Dashboard (Today's sales, stockout alerts, low stock warnings, pending pickups).
   - Fast 1-Click Inventory Stock Updater (`+10`, `+25`, `-5`, manual threshold).
   - Customer Demand Radar (Unfulfilled searches for out-of-stock items, active lists, missed revenue).
   - In-Store Express Pickup Fulfillment Queue (Staff shelf picking checklist).
   - FMCG Supplier Reorder Tickets.

3. **🏢 Supermarket Administrator**:
   - Supermarket Department Sections & Aisles Layout Designer.
   - Promotional Campaigns & Deals Manager.
   - Facility & Operational Maintenance Issue Tracker.
