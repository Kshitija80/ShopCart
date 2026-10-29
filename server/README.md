# ShopEase – Inventory & Sales Management Tool

A lightweight, web-based Inventory and Sales Management System designed to simplify daily business operations for small retailers.

## 1. Project Overview

**ShopEase** is a web application that helps small business owners manage their products, inventory, billing, sales, suppliers, and business reports in one place.

It aims to replace manual notebooks and spreadsheets with a simple digital system that reduces repetitive work and makes business information easier to manage.

**Target Users:** Small retail businesses, including kirana stores, pharmacies, stationery shops, and other local shops.

## 2. Problem Statement

Small businesses often use notebooks, registers, or spreadsheets to manage inventory and sales. These methods can lead to:

- Incorrect stock records and manual calculation errors.
- Time-consuming billing and record maintenance.
- Difficulty identifying low-stock products.
- Delays in restocking products.
- Difficulty tracking sales and analyzing business performance.
- Supplier information being maintained separately.

ShopEase addresses these challenges by bringing essential shop-management activities into a single application.

## 3. Project Objectives

- Digitize product and inventory management.
- Provide a simple Point of Sale (POS) billing interface.
- Calculate GST and bill totals automatically.
- Reduce product stock automatically after a successful sale.
- Manage suppliers and purchase orders.
- Display sales history, revenue, and profit/loss information.
- Provide low-stock alerts and product performance insights.
- Implement secure authentication and role-based access for Owners and Staff.

## 4. Key Features

### 4.1 Authentication and User Management
- Owner registration and login.
- Password hashing using bcrypt.
- JWT-based authentication for protected API requests.
- Role-based access control for Owners and Staff.
- Owner-authorized creation of Staff accounts.

### 4.2 Inventory Management
- Add, edit, and delete products.
- Store product name, category, cost price, selling price, and quantity.
- Search products by name.
- Filter products by category and low-stock status.
- Set low-stock thresholds.
- Store optional product expiry dates.
- View current stock quantities.

### 4.3 Billing and Point of Sale (POS)
- Search and select products.
- Add products to a shopping cart.
- Increase or decrease quantities.
- Calculate subtotal, GST, and final bill amount.
- Generate invoice numbers.
- Save sales and sale items in the database.
- Automatically deduct sold quantities from inventory after a successful sale.
- Display a receipt that can be printed or saved as a PDF through the browser's print dialog.

**Note:** The current implementation uses a configurable-in-code, flat 18% GST calculation for demonstration. Actual GST rates can vary by product and applicable rules.

### 4.4 Sales Management
- View sales history.
- Display invoice numbers, dates, GST amounts, and total amounts.
- Filter sales by date range.
- Store information about the user who created a sale.

### 4.5 Supplier and Purchase Order Management
- Add, edit, and delete supplier records.
- Store supplier names, contact details, and email addresses.
- Create purchase orders linked to suppliers and products.
- Track purchase order statuses, such as Pending, Ordered, Received, and Cancelled.
- Increase product stock when an eligible purchase order is marked as Received.

### 4.6 Dashboard and Reports
- View today's sales count and revenue.
- View monthly sales and revenue.
- Display low-stock products.
- Identify top-selling products by quantity.
- View sales history and revenue summaries.
- Generate profit/loss summaries.
- Visualize sales trends, top products, and financial summaries using charts.

### 4.7 Role-Based Access

**Owner**
- Manage products and inventory.
- Create bills and view sales history.
- Manage suppliers and purchase orders.
- View dashboard and reports.
- Create Staff accounts.

**Staff**
- View and search inventory.
- Create customer bills.
- Access is restricted from Owner-only management and reporting operations.

The backend enforces permissions on protected APIs.

## 5. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js | Builds the user interface |
| Routing | React Router | Navigates between application pages |
| Styling | Tailwind CSS | Provides responsive styling |
| API Communication | Axios | Connects the frontend to backend APIs |
| Data Visualization | Chart.js, react-chartjs-2 | Displays charts and reports |
| Backend Runtime | Node.js | Runs server-side JavaScript |
| Backend Framework | Express.js | Builds REST APIs |
| Database | MySQL | Stores application data |
| ORM | Sequelize | Connects JavaScript models to MySQL |
| Authentication | JSON Web Token (JWT) | Authenticates protected requests |
| Password Security | bcryptjs | Hashes passwords |
| Development Tools | Vite, npm | Frontend development and package management |
| Version Control | Git and GitHub | Tracks and hosts project source code |

## 6. System Architecture

ShopEase follows a layered architecture.

```text
             Owner / Staff
                  |
                  v
          React Web Application
                  |
             Axios Requests
                  |
                  v
          Express REST API
                  |
          JWT Authentication
                  |
                  v
          Sequelize ORM
                  |
                  v
             MySQL Database
                  |
       +----------+----------+
       |          |          |
    Inventory   Sales     Suppliers
       |          |          |
       +----------+----------+
                  |
                  v
          Reports & Analytics
```

### How It Works

1. The user logs in through the React interface.
2. The backend verifies the user's credentials and returns a JWT.
3. Axios sends API requests, including the JWT for protected operations.
4. Express validates the request and applies the required permissions.
5. Sequelize performs database operations using the relevant models.
6. MySQL stores or retrieves the requested information.
7. The backend returns a response, which React displays to the user.

## 7. Database Design

ShopEase uses MySQL with Sequelize ORM.

The database contains the following main tables:

| Table | Purpose |
|---|---|
| `users` | Stores user details, hashed passwords, and roles |
| `products` | Stores product information, prices, quantity, and expiry dates |
| `sales` | Stores invoices, totals, GST amounts, and sale creators |
| `sale_items` | Stores the products and quantities included in each sale |
| `suppliers` | Stores supplier contact information |
| `purchase_orders` | Tracks product orders placed with suppliers |

### Main Relationships

- A user can create multiple sales.
- A sale can contain multiple sale items.
- Each sale item refers to a product.
- A supplier can have multiple purchase orders.
- Each purchase order refers to a supplier and a product.

Database schema changes are managed using Sequelize migrations, and sample records can be inserted using seeders.

## 8. Main Application Pages

- **Login:** Authenticates registered users.
- **Signup:** Allows registration of an Owner account.
- **Dashboard:** Displays sales summaries, revenue, top products, and low-stock alerts.
- **Inventory:** Manages products, prices, quantities, and stock filters.
- **Billing / POS:** Creates bills, calculates totals, updates stock, and prints receipts.
- **Sales:** Displays completed sales and invoice history.
- **Suppliers:** Manages suppliers and purchase orders.
- **Reports:** Displays sales trends, top products, and profit/loss summaries.

## 9. API Endpoints

The backend provides REST API endpoints for the main application modules.

### Authentication
- `POST /api/auth/register` – Register an Owner account.
- `POST /api/auth/login` – Authenticate a user.
- `POST /api/auth/staff` – Create a Staff account as an Owner.

### Products
- `GET /api/products` – Retrieve products.
- `GET /api/products/:id` – Retrieve a product by ID.
- `POST /api/products` – Add a product.
- `PUT /api/products/:id` – Update a product.
- `DELETE /api/products/:id` – Delete a product.

### Sales and Billing
- `GET /api/sales` – Retrieve sales history.
- `POST /api/sales` – Create a sale and update inventory.

### Suppliers
- `GET /api/suppliers` – Retrieve suppliers.
- `POST /api/suppliers` – Add a supplier.
- `PUT /api/suppliers/:id` – Update a supplier.
- `DELETE /api/suppliers/:id` – Delete a supplier.

### Purchase Orders
- `GET /api/purchase-orders` – Retrieve purchase orders.
- `POST /api/purchase-orders` – Create a purchase order.
- `PUT /api/purchase-orders/:id` – Update a purchase order.

### Reports
- `GET /api/reports/dashboard` – Retrieve dashboard data.
- `GET /api/reports/profit-loss` – Retrieve profit/loss information.

Most endpoints require a valid JWT. Owner-only operations also require the appropriate role.

## 10. Installation and Setup

### Prerequisites

Install the following software:

- Node.js and npm
- MySQL Server
- MySQL Workbench (recommended)
- Visual Studio Code (recommended)
- Git (optional)

### Step 1: Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ShopCart
```

Replace the repository URL with your actual GitHub repository URL.

Alternatively, download the project and open its root folder in VS Code.

### Step 2: Create the Database

Open MySQL Workbench and execute:

```sql
CREATE DATABASE shopease_db;
```

### Step 3: Configure the Backend

Open the server directory:

```bash
cd server
```

Install backend dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=shopease_db
DB_USER=shopease_user
DB_PASSWORD=your_mysql_password

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d

CLIENT_URL=http://localhost:5173
```

Replace the database username and password with your actual MySQL credentials.

Ensure that `config/config.js`, `config/database.js`, and `.sequelizerc` are present.

### Step 4: Create Database Tables

From the `server` directory, run:

```bash
npx sequelize-cli db:migrate
```

This executes the Sequelize migrations and creates the application tables.

### Step 5: Insert Sample Data

Run:

```bash
npx sequelize-cli db:seed:all
```

The demo seed creates sample users, products, suppliers, sales, sale items, and purchase orders.

**Demo login accounts**

Owner:

```text
Email: owner@shopease.com
Password: Owner@123
```

Staff:

```text
Email: staff@shopease.com
Password: Staff@123
```

These accounts are intended for local demonstration. Change or remove demo credentials before deploying a public application.

### Step 6: Start the Backend

From the `server` directory:

```bash
npm start
```

The backend should run at:

```text
http://localhost:5000
```

The health-check endpoint is:

```text
http://localhost:5000/
```

### Step 7: Configure and Start the Frontend

Open a second terminal and go to the frontend directory:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the URL displayed by Vite, normally:

```text
http://localhost:5173
```

Keep both the backend and frontend terminals running while using the application.

## 11. Project Structure

```text
ShopCart/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── migrations/
│   ├── models/
│   ├── routes/
│   ├── seeders/
│   ├── .env
│   ├── .sequelizerc
│   ├── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## 12. Key Benefits

- Reduces manual record-keeping.
- Makes inventory information easier to access.
- Simplifies billing and stock updates.
- Helps identify products that need restocking.
- Centralizes sales and supplier records.
- Provides an overview of sales and business performance.
- Supports controlled access for different user roles.

## 13. Future Enhancements

Potential future improvements include:

- Barcode and QR-code scanning.
- WhatsApp-based receipt sharing.
- More flexible product-level GST configuration.
- Exportable inventory and sales reports.
- Advanced expiry and dead-stock alerts.
- Improved profit reporting using historical purchase costs.
- Restocking suggestions based on sales history.
- Multi-branch inventory support.
- Deployment to a cloud hosting platform.

## 14. Limitations

- The current implementation is primarily designed for a single shop.
- GST uses a demonstration rate; tax rates should be configured for the applicable products and rules before real commercial use.
- Profit/loss figures are basic estimates and do not include all business expenses.
- Payment gateway integration and offline synchronization are not included.
- Production deployment requires additional security review, configuration, and testing.

## 15. Learning Outcomes

This project demonstrates practical experience with:

- Full-stack web application development.
- React components, hooks, and routing.
- REST API development using Express.js.
- MySQL database design and relationships.
- Sequelize models, migrations, and seeders.
- JWT authentication and role-based access control.
- Inventory and sales transaction management.
- Frontend-backend integration.
- Data visualization using Chart.js.

## 16. Sustainable Development Goal (SDG)

ShopEase aligns with **UN Sustainable Development Goal 8: Decent Work and Economic Growth**.

By helping small businesses organize day-to-day operations, the project aims to support operational efficiency and informed business decisions.

## 17. Conclusion

ShopEase provides a centralized digital system for managing inventory, billing, sales, suppliers, and reports. By combining a simple interface with backend APIs and a structured database, it demonstrates how web technologies can help simplify routine retail operations.

The project provides a foundation that can be extended with additional automation, analytics, and deployment features.

---

**Project Name:** ShopEase – Inventory & Sales Management Tool  
**Category:** Full-Stack Web Application  
**Frontend:** React.js, Tailwind CSS, React Router, Axios, Chart.js  
**Backend:** Node.js, Express.js  
**Database:** MySQL  
**ORM:** Sequelize  
**Authentication:** JWT and bcryptjs

**Developed as an academic project.**
