# 🛍️ RetailIQ — AI-Powered Retail Analytics Platform

**RetailIQ** is a full-stack business intelligence and analytics web application built on top of a large-scale retail dataset. It transforms over 1 million raw retail transaction records into rich, interactive dashboards covering revenue trends, customer behaviour, product performance, and promotional effectiveness — all powered by a live PostgreSQL database and an AI analyst.

---

## 📊 About the Dataset

The platform is built on the **Kaggle Retail Dataset**, a simulated large-scale retail environment with **1 million rows** and **100+ columns**.

### Dataset Scope

| Domain | Description |
|---|---|
| **Customer Information** | Demographics, loyalty, churn label, membership history |
| **Transaction Data** | Invoice details, dates, product, quantity, pricing, discounts |
| **Product Details** | Category, brand, unit price, ratings, return rates, stock levels |
| **Promotion Info** | Promotion type, channel (email, SMS, social), effectiveness |
| **Behavioural Metrics** | Purchase frequency, app usage, website visits, support calls |

### Key Dataset Columns

**Customer Columns:**
`customer_id`, `age`, `gender`, `income_bracket`, `loyalty_program`, `membership_years`, `churned` (Yes/No), `marital_status`, `number_of_children`, `education_level`, `occupation`, `customer_city`, `customer_state`

**Transaction Columns:**
`transaction_id`, `transaction_date`, `product_id`, `product_category`, `quantity`, `unit_price`, `discount_applied`, `payment_method`, `store_location`, `transaction_hour`, `day_of_week`, `week_of_year`, `month_of_year`

**Behaviour Columns:**
`avg_purchase_value`, `purchase_frequency`, `avg_discount_used`, `preferred_store`, `online_purchases`, `in_store_purchases`, `avg_items_per_transaction`, `avg_transaction_value`, `total_returned_items`, `total_returned_value`, `days_since_last_purchase`, `website_visits`, `app_usage`, `social_media_engagement`, `customer_support_calls`, `email_subscriptions`

**Sales & Product Columns:**
`total_sales`, `total_discount`, `profit_margin`, `clv` (Customer Lifetime Value), `product_name`, `brand`, `product_rating`, `return_rate`, `stock_quantity`

---

## 🏗️ Project Architecture

```
DA/
├── backend/             # Python FastAPI backend
│   ├── main.py          # API endpoints and AI Chat logic (clean, no raw SQL)
│   ├── queries.py       # All SQL query strings as named constants
│   ├── database.py      # PostgreSQL SQLAlchemy connection
│   ├── requirements.txt # Python dependencies
│   └── .env             # Environment variables (DB URL, API Key)
├── frontend/            # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── pages/       # Dashboard, Analytics, Customers, Products, AIAnalyst
│   │   ├── api.ts       # Axios API client
│   │   ├── App.tsx      # Layout, Sidebar, Routing
│   │   └── index.css    # Global styles (glassmorphism design)
│   └── vercel.json      # Vercel SPA routing config
├── render.yaml          # Render backend deployment blueprint
├── README.md            # Project documentation
└── .gitignore
```

---

## 🔑 Key Performance Indicators (KPIs)

The **Executive Dashboard** provides an at-a-glance view of 8 core business KPIs pulled live from the database:

| KPI | Description | Source Column |
|---|---|---|
| **Total Revenue** | Sum of all sales across all transactions | `total_sales` |
| **Avg Order Value** | Mean value per individual purchase | `avg_purchase_value` |
| **Total Customers** | Count of unique customer IDs | `customer_id` |
| **Churn Rate** | Percentage of customers who have churned | `churned = 'Yes'` |
| **Avg Product Rating** | Mean star rating across all products | `product_rating` |
| **Total Returns** | Total monetary value of all returned items | `total_returned_value` |
| **Avg Recency** | Average days since a customer's last purchase | `days_since_last_purchase` |
| **Avg CLV** | Average Customer Lifetime Value | `clv` |

---

## 📈 Analytics Modules

### 1. 📊 Executive Dashboard (`/`)
The main landing page. Shows 8 KPI cards and 4 core charts.

| Chart | What It Shows |
|---|---|
| **Monthly Revenue Trend** | Area chart of monthly total sales (₹) vs. discounts given over the year |
| **Category Mix** | Donut/Pie chart of revenue contribution per product category |
| **Transactions by Day of Week** | Bar chart showing which day drives the most transactions |
| **Churn Rate by Purchase Frequency** | Bar chart correlating how often customers buy vs. their churn likelihood |

---

### 2. ⚡ Advanced Analytics (`/analytics`)
Deep-dive analytics covering promotions, geography, and customer behaviour.

#### Promotion Performance
| Chart | What It Shows |
|---|---|
| **Revenue by Promotion Type** | Horizontal bar chart comparing revenue and discounts for each promo type (e.g., BOGO, Seasonal Sale, Flash Sale) |
| **Revenue by Promotion Channel** | Donut chart showing which channel (Email, SMS, Social Media, etc.) drives the most revenue |

#### Geographic & Channel Analytics
| Chart | What It Shows |
|---|---|
| **Revenue by Store Location** | Grouped bar chart comparing revenue and number of customers at each store location |
| **Online vs. In-Store** | Donut chart showing the split between digital and physical purchase channels |

#### Behavioural Analytics
| Chart | What It Shows |
|---|---|
| **Hourly Transaction Heatmap** | Bar chart colour-coded by time-of-day to reveal peak purchase hours (e.g., 10 AM, 6 PM) |
| **App Usage vs. Avg Spend** | Dual-axis bar chart showing the correlation between app engagement level and average customer spend |
| **Support Calls vs. Churn Rate** | Bar chart showing how increasing numbers of support calls correlate with rising churn — a key health signal |

---

### 3. 👥 Customer Intelligence (`/customers`)
A 360° view of the customer base.

#### Customer KPI Badges
| KPI | Description |
|---|---|
| **Total Customers** | Total count of unique customers |
| **Avg CLV** | Average Customer Lifetime Value in ₹ |
| **Loyalty Rate** | % of customers enrolled in the loyalty programme |
| **Churn Rate** | % of customers who have churned |
| **Avg Membership Years** | How long customers have been members on average |
| **Avg Purchase Value** | Average amount spent per transaction |
| **Avg Transactions / Customer** | Estimated number of purchases per customer |

#### Customer Charts
| Chart | What It Shows |
|---|---|
| **Income Segment Mix** | Donut chart of customer distribution across Low, Medium, and High income brackets |
| **Purchase Frequency Mix** | Donut chart showing the split between Occasional, Regular, and Frequent buyers |
| **Gender Breakdown** | Bar chart of customer counts by gender (Male, Female, Other) |
| **Avg Spend by Age Group** | Bar chart revealing which age cohort spends the most (e.g., 25–34, 45–54) |
| **Churn by Income Bracket** | Stacked bar chart comparing churned vs. retained customers at each income level |
| **Top 10 Customers by Revenue** | A table listing the highest-value customers by total revenue contribution |

---

### 4. 📦 Product Intelligence (`/products`)
Analysis of the product catalogue, brand performance, and return rates.

#### Product KPI Badges
| KPI | Description |
|---|---|
| **Total SKUs** | Number of unique products sold |
| **Avg Rating** | Mean customer star rating across all products |
| **Avg Return Rate** | Average fraction of items being returned |
| **Avg Stock** | Average stock quantity across all products |

#### Product Charts
| Chart | What It Shows |
|---|---|
| **Revenue by Brand** | Horizontal bar chart ranking top brands by total sales |
| **Product Rating Distribution** | Bar chart showing how many products received each star rating (1–5) |
| **Return Rate by Category** | Dual-axis chart: return rate (%) on the left and total returned value (₹) on the right, per category |
| **Top 10 Products by Revenue** | Table of highest-grossing products with their category, revenue, units sold, and rating |

---

### 5. 🤖 AI Business Analyst (`/ai`)
A conversational AI interface that lets you ask natural language questions about your data.

- **Powered by:** Groq Llama-3.3-70b (via Groq API)
- **Connected to:** Live PostgreSQL database
- **How it works:**
  1. You type a question (e.g., *"What is the churn rate for high-income customers?"*)
  2. The backend uses an LLM to generate a safe SQL query for the `retail_transactions` table
  3. The query is executed against the live database
  4. The result is sent back to the LLM which formulates a concise 2–4 line answer
  5. The answer and the SQL query used are displayed in the chat

---

## ⚙️ Local Setup Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database (local or cloud, e.g. Neon/Supabase)
- A Groq API Key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Backend Setup
```bash
cd backend

# Create a virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create your environment file
copy .env.example .env
```

Edit `.env` with your credentials:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
GROQ_API_KEY=gsk_your_groq_api_key
```

```bash
# Run the backend server
uvicorn main:app --reload
# Server starts at http://127.0.0.1:8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run the frontend dev server
npm run dev
# App opens at http://localhost:5173
```

---

## 🚀 Deployment

### Backend → Render
1. Push your code to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) → **New > Blueprint**.
3. Connect your GitHub repo. Render auto-detects `render.yaml`.
4. Set environment variables in the Render dashboard:
   - `DATABASE_URL` → Your PostgreSQL connection string
   - `GROQ_API_KEY` → Your Groq API key

### Frontend → Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) → **Add New > Project**.
2. Import the GitHub repository.
3. Set the **Root Directory** to `frontend`.
4. Add Environment Variable:
   - `VITE_API_URL` → `https://your-render-app.onrender.com/api`
5. Click **Deploy**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Custom Glassmorphism CSS |
| **Charts** | Recharts |
| **State/Data Fetching** | TanStack React Query |
| **Routing** | React Router v6 |
| **Backend** | Python, FastAPI, Uvicorn |
| **Database ORM** | SQLAlchemy |
| **Database** | PostgreSQL |
| **AI / LLM** | Groq API (Llama-3.3-70b) |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |
