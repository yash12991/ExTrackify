# Expense Tracker Frontend

A modern React-based frontend for managing personal expenses and payments.

## 🚀 Setup and Installation

1. Clone the repository
2. Install dependencies:

```bash
cd Frontend
npm install
```

3. Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

4. Start the development server:

```bash
npm run dev
```

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── services/
│   └── App.jsx
├── package.json
└── README.md
```

## ✨ Features

- User authentication (login/register)
- Dashboard with expense overview
- Add, edit, and delete expenses
- Filter and sort expenses
- Expense analytics and charts
- Responsive design

## 🎨 UI Components

- Material-UI components
- Responsive layout
- Custom themed components
- Chart.js for analytics

## 💻 Technologies Used

- React
- Vite
- Material-UI
- Chart.js
- Axios for API calls
- React Router
- Context API for state management

## 🔗 API Integration

The frontend connects to the backend API using Axios. All API calls include authentication headers automatically when the user is logged in.
