# 💰 FinTrack — AI Personal Finance Dashboard

A full-stack personal finance tracker with AI-powered spending insights. Track income and expenses, set budgets, visualize spending patterns, and get personalized financial advice from Google Gemini — all based on your real transaction data.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat&logo=postgresql)
![Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?style=flat&logo=google)

---

## ✨ Features

- 🔐 **JWT Authentication** — secure multi-user accounts
- 💸 **Transaction tracking** — add, edit, delete income & expenses with categories
- 📊 **Interactive dashboard** — donut chart for spending by category, bar chart for monthly income vs expenses
- 🎯 **Budget tracking** — set monthly limits per category with live progress bars
- 🤖 **AI spending insights** — Google Gemini analyzes your real numbers and gives personalized financial advice
- 🔍 **Search & filters** — filter transactions by type, category, and keyword
- 📱 **Fully responsive** — clean dark UI built with Tailwind CSS

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS + Recharts |
| Backend | FastAPI |
| Database | PostgreSQL + SQLAlchemy |
| Migrations | Alembic |
| Auth | JWT (python-jose) + bcrypt |
| AI | Google Gemini 2.0 Flash |
| Icons | Lucide React |

---

## 📁 Project Structure

```
fintrack/
├── backend/
│   ├── main.py              # FastAPI app + all routes
│   ├── models.py            # SQLAlchemy models (User, Transaction, Budget)
│   ├── schemas.py            # Pydantic schemas
│   ├── database.py           # PostgreSQL connection
│   ├── auth.py                # JWT + password hashing
│   ├── alembic/               # Database migrations
│   ├── .env
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Transactions.jsx
    │   │   ├── Budgets.jsx
    │   │   ├── AIInsights.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── AddTransactionModal.jsx
    │   │   └── EditTransactionModal.jsx
    │   ├── services/
    │   │   └── api.js
    │   └── App.jsx
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 15+
- Google Gemini API key (free at `aistudio.google.com`)

### Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate     # Windows
source .venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

Create `.env`:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/fintrack_db
SECRET_KEY=your-generated-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

Create the database in pgAdmin, then run migrations:
```bash
alembic upgrade head
```

Start the API:
```bash
uvicorn main:app --reload
```

API runs at `http://localhost:8000` — docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`

---

## 📖 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, get JWT token |
| GET | `/auth/me` | Get current user |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/transactions` | List with filters |
| POST | `/transactions` | Add transaction |
| PUT | `/transactions/{id}` | Update transaction |
| DELETE | `/transactions/{id}` | Delete transaction |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/summary` | Income, expenses, balance |
| GET | `/dashboard/by-category` | Spending breakdown |
| GET | `/dashboard/monthly` | Monthly income vs expenses |

### Budgets
| Method | Endpoint | Description |
|---|---|---|
| GET | `/budgets` | List budgets |
| POST | `/budgets` | Set monthly budget |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/insights` | Generate AI spending analysis |

---

## 🗄️ Database Models

### User
```
id, name, email, password_hash, currency, created_at
```

### Transaction
```
id, user_id (FK), title, amount, type (income/expense),
category, date, notes, created_at
```

### Budget
```
id, user_id (FK), category, monthly_limit, month, year, created_at
```

---

## 🤖 AI Insights — How It Works

The `/ai/insights` endpoint:
1. Pulls all of the logged-in user's transactions
2. Calculates totals, savings rate, and top spending category
3. Sends these real numbers to Google Gemini
4. Returns a personalized 4-part analysis: financial health summary, spending pattern, actionable saving tip, and encouragement

---

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens with 30-minute expiry
- Each user can only access their own data
- CORS configured for frontend-backend communication
- API keys stored in `.env`, never in code
