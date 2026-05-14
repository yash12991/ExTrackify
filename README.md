# ExTrackify - Personal Finance Manager

A full-stack personal finance management application for tracking expenses, managing budgets, setting savings goals, and monitoring SIP (Systematic Investment Plan) investments.

## Features

- **User Authentication**: Secure registration, login, and JWT-based session management with OTP email verification.
- **Expense Tracking**: Add, edit, delete, and categorize expenses with advanced filtering, sorting, and pagination.
- **Budget Management**: Set monthly and category-wise budgets, monitor spending against limits.
- **SIP Management**: Create, track, and analyze SIP investments with projections, analytics, and payment reminders.
- **Goal Setting**: Define savings goals, estimate completion dates based on saving rate, and monitor progress.
- **Bill Management**: Track recurring bills with payment reminders, category grouping, and monthly totals.
- **Analytics Dashboard**: Interactive charts for expense breakdown, weekly/monthly trends, and SIP growth.
- **Automated Reminders**: Email notifications for SIP payments, overdue actions, and monthly summaries.
- **Responsive UI**: Modern, mobile-friendly React frontend with animations.

## Tech Stack

- **Frontend**: React 19, Vite 6, Chart.js, Recharts, Framer Motion, TanStack React Query, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Nodemailer, node-cron
- **Deployment**: Vercel (Frontend), Render (Backend), Docker

## Structure

```
ExTrackify/
├── Backend/   # Node.js/Express/MongoDB API
├── Frontend/  # React/Vite/Tailwind UI
└── README.md
```

## How to Run

1. Clone the repository.
2. Set up environment variables for Backend (see `Backend/.env.example`).
3. Install dependencies and start both servers:
   - Backend: `cd Backend && npm install && npm run dev`
   - Frontend: `cd Frontend && npm install && npm run dev`
4. Access the app at [http://localhost:5173](http://localhost:5173).

## API Endpoints

All endpoints prefixed with `/api/v1`. See individual route files for details:
- Auth: register, login, logout, refresh-token, forgot/reset password, OTP
- Expenses: CRUD + summary, chart data (category, weekly, monthly)
- SIPs: CRUD + analytics, projections, chart data, upcoming payments
- Budgets: per-category and overall budget CRUD + status
- Goals: CRUD + estimate completion, analytics
- Bills: CRUD + mark paid, summary, category grouping, monthly totals
- Admin: dashboard stats
