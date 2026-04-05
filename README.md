# ShopHub — Full-Stack E-Commerce Application

ShopHub is a full-stack e-commerce web application inspired by modern online marketplaces such as Amazon. It is designed to simulate a real-world shopping experience, covering both user-facing functionality and administrative control. The application demonstrates practical implementation of full-stack development concepts using React, Node.js, Express, and PostgreSQL.

The platform allows users to browse products across multiple categories, search and filter items, and manage a personalized shopping cart. Users can securely register and log in using JWT-based authentication, ensuring protected access to their data and actions. The cart system is persistent and stored in the database, allowing users to seamlessly manage items and quantities before proceeding to checkout.

The checkout process includes a shipping address form and a simulated payment flow, with optional support for Stripe integration. Once an order is placed, users can track its progress through different stages including pending, processing, shipped, delivered, and cancelled. This reflects a complete order lifecycle similar to real-world e-commerce platforms.

In addition to user features, ShopHub includes an admin dashboard that provides control over the system. Admin users can manage products by adding, editing, or deleting them, and can update order statuses. The dashboard also provides a high-level overview of key metrics such as total users, orders, and revenue.

This project was built to gain hands-on experience with designing scalable web applications, implementing authentication and authorization, managing relational databases, and structuring RESTful APIs.

---

## Features

### User Functionality
- User registration and login with JWT authentication  
- Browse products by category  
- Search and filter products  
- Add, remove, and update items in cart  
- Checkout with shipping details  
- View and track order history  

### Admin Functionality
- Dashboard with system statistics  
- Add, edit, and delete products  
- Manage and update order statuses  

---

## Tech Stack

Frontend:
- React.js  

Backend:
- Node.js  
- Express.js  

Database:
- PostgreSQL  

Authentication:
- JSON Web Tokens (JWT)  

Payments:
- Stripe (optional integration)  

---

## Project Structure

## API Overview

Authentication:
- POST /api/auth/register
- POST /api/auth/login

Products:
- GET /api/products
- GET /api/products/:id

Orders:
- POST /api/orders
- GET /api/orders

## Key Highlights

- Full-stack architecture with React frontend and Express backend  
- Role-based authentication (User & Admin)  
- Persistent cart stored in database  
- Complete order lifecycle management  
- Scalable RESTful API design  

## Architecture Overview

- Frontend communicates with backend via REST APIs  
- Backend handles business logic and authentication  
- PostgreSQL manages relational data storage  

## Known Limitations

- Payment flow is simulated unless Stripe key is provided  
- No email notifications implemented yet  

## How to Test

1. Register as a new user  
2. Browse products and add to cart  
3. Place an order  
4. Login as admin to manage products and orders  

<img width="1893" height="863" alt="Screenshot (293)" src="https://github.com/user-attachments/assets/191fdfe7-f10e-4135-9925-ad2b7b81f11f" />
<img width="1892" height="872" alt="Screenshot (292)" src="https://github.com/user-attachments/assets/91c904c5-b02a-4a61-9ef4-60f48dd5a0e0" />

