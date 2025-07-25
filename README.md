<<<<<<< HEAD
# Expense Tracker

A full-stack personal finance management application for tracking expenses, managing budgets, setting savings goals, and monitoring SIP (Systematic Investment Plan) investments.

## 🚀 Features

- **User Authentication**: Secure registration, login, and JWT-based session management.
- **Expense Tracking**: Add, edit, delete, and categorize expenses with advanced filtering and analytics.
- **Budget Management**: Set monthly and category-wise budgets, monitor spending, and receive alerts.
- **SIP Management**: Create, track, and analyze SIP investments with projections and reminders.
- **Goal Setting**: Define savings goals, estimate completion dates, and monitor progress.
- **Analytics Dashboard**: Visualize spending patterns, investment growth, and financial health with interactive charts.
- **Automated Reminders**: Email notifications for SIP payments, overdue actions, and monthly summaries.
- **Responsive UI**: Modern, mobile-friendly React frontend with custom theming and animations.
- **Admin Dashboard**: (Optional) Overview of users, investments, and payments for administrators.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Chart.js, Framer Motion, Styled Components, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Nodemailer, node-cron
- **APIs**: RESTful endpoints for all resources (expenses, budgets, SIPs, goals, payments)
- **Other**: React Query, Axios, React Router, Hot Toast notifications

## 📦 Structure

```
Expense tracker/
├── Backend/   # Node.js/Express/MongoDB API
├── Frontend/  # React/Vite/Tailwind UI
└── README.md
```

## 📝 How to Run

1. Clone the repository.
2. Set up environment variables for both frontend and backend (see respective README files).
3. Install dependencies and start both servers:
   - Backend: `cd Backend && npm install && npm run dev`
   - Frontend: `cd Frontend && npm install && npm run dev`
4. Access the app at [http://localhost:5173](http://localhost:5173).

## 📈 Demo

- Add, edit, and analyze expenses.
- Set and monitor budgets and savings goals.
- Manage SIP investments with projections and reminders.
- Visualize your financial health with interactive dashboards.

---

## 📄 Resume Summary (for your CV)

**Expense Tracker (Full-Stack Personal Finance Platform)**  
_React, Node.js, Express, MongoDB, Chart.js, Tailwind CSS_

- Designed and developed a comprehensive personal finance management system enabling users to track expenses, set budgets, manage SIP investments, and achieve savings goals.
- Implemented secure authentication, RESTful APIs, and automated email reminders for SIP payments and overdue actions.
- Built a modern, responsive dashboard with advanced analytics and interactive data visualizations using React, Chart.js, and Framer Motion.
- Integrated recurring expense automation, goal estimation, and real-time notifications to enhance user engagement and financial awareness.
- Ensured robust backend architecture with Node.js, Express, MongoDB, and JWT-based security.

---
=======
# Expense Tracker Backend

A comprehensive RESTful API backend for managing personal expenses, payments, SIPs, and budgets.

## 🚀 Setup and Installation

1. Clone the repository
2. Install dependencies:

```bash
cd Backend
npm install
```

3. Create a `.env` file with the following variables:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
```

4. Start the server:

```bash
npm run dev
```

## 📁 Project Structure

```
Backend/
├── src/
│   ├── controllers/
│   │   ├── users.controllers.js
│   │   ├── expense.controllers.js
│   │   ├── Payment.controller.js
│   │   ├── SIP.controller.js
│   │   ├── budget.controller.js
│   │   └── adminController.js
│   ├── models/
│   │   ├── Users.models.js
│   │   ├── Expense.models.js
│   │   ├── Payment.models.js
│   │   ├── SIP.models.js
│   │   └── Budget.models.js
│   ├── routes/
│   │   ├── user.routes.js
│   │   ├── expense.routes.js
│   │   ├── payment.routes.js
│   │   ├── sip.routes.js
│   │   ├── budget.routes.js
│   │   └── admin.routes.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── cronJobs/
│   │   └── cronJobs.js
│   ├── db/
│   │   └── index.js
│   ├── app.js
│   └── server.js
├── package.json
└── README.md
```

## 🔗 API Endpoints

### Authentication Routes

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `POST /api/users/logout` - Logout user
- `POST /api/users/refresh-token` - Refresh access token
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/delete` - Delete user account
- `POST /api/users/change-password` - Change password
- `GET /api/users/get-currentUser` - Get current user details

### Expense Routes

- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/summary` - Get expense summary
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/chart/category-summary` - Get category-wise summary
- `GET /api/expenses/chart/weekly-summary` - Get last 7 days summary
- `GET /api/expenses/chart/monthly-summary` - Get last 6 months summary

### Payment Routes

- `POST /api/payments` - Create payment
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### SIP Routes

- `POST /api/sips` - Create new SIP
- `GET /api/sips` - Get all SIPs
- `GET /api/sips/active` - Get active SIPs
- `GET /api/sips/chart` - Get SIP chart data
- `GET /api/sips/:id` - Get SIP by ID
- `PUT /api/sips/:id` - Update SIP
- `DELETE /api/sips/:id` - Delete SIP
- `GET /api/sips/:id/projection` - Get SIP projection

### Budget Routes

- `POST /api/budgets` - Set/update budget
- `GET /api/budgets` - Get budget
- `GET /api/budgets/status` - Get budget status
- `POST /api/budgets/overall` - Set/update overall budget
- `GET /api/budgets/overall` - Get overall budget

### Admin Routes

- `GET /api/admin/dashboard` - Get admin dashboard data

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

- Access Token: Short-lived token for API access
- Refresh Token: Long-lived token for generating new access tokens

Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## 💻 Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Environment Variables**: dotenv
- **Task Scheduling**: node-cron

## 🔧 Features

- User authentication with JWT
- Expense tracking with categories
- Payment management
- SIP investments tracking
- Budget management
- Admin dashboard
- Automated recurring expenses
- Data visualization endpoints
- Password hashing and security
- Input validation and sanitization

## 🚀 API Response Format

Success Response:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

Error Response:

```json
{
  "success": false,
  "error": "Error message"
}
```

## 📝 Error Handling

The API implements centralized error handling with appropriate HTTP status codes:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## 🧪 Testing the API

### Prerequisites

- Postman or Insomnia REST client
- Running backend server
- MongoDB connection

### Setup

1. Import the API collection from `tests/api-collection.json`
2. Create an environment in your REST client with these variables:
   - `baseUrl`: http://localhost:8000
   - `accessToken`: (will be set after login)
   - `sipId`: (will be set after creating a SIP)

### Test Flow

1. Register a new user
2. Login to get access token
3. Set the access token in your environment
4. Test other endpoints using the authenticated requests

### Available Test Cases

- Authentication flow
- Expense CRUD operations
- SIP management
- Budget settings
- Payment processing

## 🔗 API Documentation

### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
```

### Expense Endpoints

```http
POST   /api/expenses
GET    /api/expenses
GET    /api/expenses/:id
PUT    /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/expenses/summary
```

### SIP Endpoints

```http
POST   /api/sips
GET    /api/sips
GET    /api/sips/:id
PUT    /api/sips/:id
DELETE /api/sips/:id
```

### Budget Endpoints

```http
POST   /api/budgets
GET    /api/budgets
POST   /api/budgets/overall
GET    /api/budgets/status
```

### Payment Endpoints

```http
POST   /api/payments
GET    /api/payments
GET    /api/payments/:id
PUT    /api/payments/:id
DELETE /api/payments/:id
```
>>>>>>> 5a8059637b9f7ddb5e58e0f440aa824211d54199
