from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import engine, get_db
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from groq import Groq
import queries as Q

app = FastAPI(title="RetailIQ AI", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── helpers ────────────────────────────────────────────────────────────────
def _f(v):
    """Safely cast any value to float, return 0.0 on None/error."""
    try:
        return float(v) if v is not None else 0.0
    except Exception:
        return 0.0

def _row(row):
    """Convert a SQLAlchemy row to a dict with all values as float/int/str."""
    return {k: _f(v) for k, v in dict(row._mapping).items()}

# ─── HEALTH ─────────────────────────────────────────────────────────────────
@app.get("/")
def health():
    return {"status": "ok", "message": "RetailIQ AI Backend v2.0 running"}

# ─── KPIs ───────────────────────────────────────────────────────────────────
@app.get("/api/kpis")
def get_kpis(db: Session = Depends(get_db)):
    try:
        r = db.execute(text(Q.KPI_SUMMARY)).fetchone()
        return _row(r)
    except Exception:
        import traceback; traceback.print_exc()
        return {}

# ─── REVENUE TREND ──────────────────────────────────────────────────────────
@app.get("/api/revenue-trend")
def get_revenue_trend(db: Session = Depends(get_db)):
    try:
        rows = db.execute(text(Q.REVENUE_TREND)).fetchall()
        months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        return [
            {
                "date":         months[(r.month_of_year or 1) - 1],
                "revenue":      float(r.revenue or 0),
                "discounts":    float(r.discounts or 0),
                "transactions": int(r.transactions or 0),
            }
            for r in rows
        ]
    except Exception:
        import traceback; traceback.print_exc()
        return []

# ─── CATEGORY PERFORMANCE ───────────────────────────────────────────────────
@app.get("/api/category-performance")
def get_category_performance(db: Session = Depends(get_db)):
    try:
        rows = db.execute(text(Q.CATEGORY_PERFORMANCE)).fetchall()
        return [
            {
                "name":         str(r.name or ''),
                "value":        float(r.value or 0),
                "avg_rating":   float(r.avg_rating or 0),
                "returns":      float(r.returns or 0),
                "transactions": int(r.transactions or 0),
            }
            for r in rows
        ]
    except Exception:
        import traceback; traceback.print_exc()
        return []

# ─── CHURN ANALYSIS ─────────────────────────────────────────────────────────
@app.get("/api/churn-analysis")
def get_churn_analysis(db: Session = Depends(get_db)):
    try:
        by_income  = db.execute(text(Q.CHURN_BY_INCOME)).fetchall()
        by_loyalty = db.execute(text(Q.CHURN_BY_LOYALTY)).fetchall()
        by_freq    = db.execute(text(Q.CHURN_BY_FREQUENCY)).fetchall()
        return {
            "by_income":    [{"bracket": str(r.bracket), "churned": str(r.churned), "count": int(r.count)}  for r in by_income],
            "by_loyalty":   [{"program": str(r.loyalty_program), "churned": int(r.churned_count), "total": int(r.total)} for r in by_loyalty],
            "by_frequency": [{"frequency": str(r.purchase_frequency), "churn_rate": float(r.churn_rate or 0), "total": int(r.total)} for r in by_freq],
        }
    except Exception:
        import traceback; traceback.print_exc()
        return {}

# ─── CUSTOMER METRICS ───────────────────────────────────────────────────────
@app.get("/api/customers/metrics")
def get_customer_metrics(db: Session = Depends(get_db)):
    try:
        summary      = _row(db.execute(text(Q.CUSTOMER_SUMMARY)).fetchone())
        seg_rows     = db.execute(text(Q.CUSTOMER_SEGMENTS)).fetchall()
        freq_rows    = db.execute(text(Q.CUSTOMER_BY_FREQUENCY)).fetchall()
        age_rows     = db.execute(text(Q.CUSTOMER_BY_AGE)).fetchall()
        gender_rows  = db.execute(text(Q.CUSTOMER_BY_GENDER)).fetchall()
        top_rows     = db.execute(text(Q.TOP_CUSTOMERS)).fetchall()

        return {
            "summary":       summary,
            "segments":      [{"name": str(r.name), "value": int(r.value)} for r in seg_rows],
            "by_frequency":  [{"name": str(r.name), "value": int(r.value)} for r in freq_rows],
            "by_age":        [{"age_group": str(r.age_group), "count": int(r.count), "avg_spend": float(r.avg_spend or 0)} for r in age_rows],
            "by_gender":     [{"gender": str(r.gender), "count": int(r.count), "avg_spend": float(r.avg_spend or 0)} for r in gender_rows],
            "top_customers": [{"id": int(r.customer_id), "occupation": str(r.occupation or ''), "city": str(r.city or ''), "revenue": float(r.revenue or 0), "years": int(r.years or 0)} for r in top_rows],
        }
    except Exception:
        import traceback; traceback.print_exc()
        return {"error": "query failed", "summary": {}, "segments": [], "by_frequency": [], "by_age": [], "by_gender": [], "top_customers": []}

# ─── PRODUCT METRICS ────────────────────────────────────────────────────────
@app.get("/api/products/metrics")
def get_product_metrics(db: Session = Depends(get_db)):
    try:
        summary       = db.execute(text(Q.PRODUCT_SUMMARY)).fetchone()
        top_products  = db.execute(text(Q.TOP_PRODUCTS_BY_REVENUE)).fetchall()
        by_brand      = db.execute(text(Q.PRODUCTS_BY_BRAND)).fetchall()
        rating_dist   = db.execute(text(Q.PRODUCT_RATING_DISTRIBUTION)).fetchall()
        return_anal   = db.execute(text(Q.PRODUCT_RETURN_ANALYSIS)).fetchall()

        return {
            "summary":             _row(summary),
            "top_by_revenue":      [{"name": r.product_name, "category": r.product_category, "brand": r.product_brand, "revenue": float(r.revenue or 0), "rating": float(r.rating or 0), "returns": float(r.returns or 0)} for r in top_products],
            "by_brand":            [{"name": str(r.name), "revenue": float(r.revenue or 0), "transactions": int(r.transactions)} for r in by_brand],
            "rating_distribution": [{"rating": int(r.rating_bucket), "count": int(r.count)} for r in rating_dist],
            "return_analysis":     [{"category": str(r.product_category), "return_rate": float(r.return_rate or 0), "total_returned": float(r.total_returned or 0)} for r in return_anal],
        }
    except Exception:
        import traceback; traceback.print_exc()
        return {}

# ─── PROMOTIONS ─────────────────────────────────────────────────────────────
@app.get("/api/promotions")
def get_promotions(db: Session = Depends(get_db)):
    try:
        by_type          = db.execute(text(Q.PROMOTIONS_BY_TYPE)).fetchall()
        by_effectiveness = db.execute(text(Q.PROMOTIONS_BY_EFFECTIVENESS)).fetchall()
        by_channel       = db.execute(text(Q.PROMOTIONS_BY_CHANNEL)).fetchall()
        holiday_impact   = db.execute(text(Q.PROMOTIONS_HOLIDAY_IMPACT)).fetchall()

        return {
            "by_type":          [{"type": str(r.promotion_type), "uses": int(r.uses), "revenue": float(r.revenue or 0), "discount_given": float(r.discount_given or 0)} for r in by_type],
            "by_effectiveness": [{"effectiveness": str(r.promotion_effectiveness), "count": int(r.count), "revenue": float(r.revenue or 0)} for r in by_effectiveness],
            "by_channel":       [{"channel": str(r.promotion_channel), "uses": int(r.uses), "revenue": float(r.revenue or 0)} for r in by_channel],
            "holiday_impact":   [{"holiday": str(r.holiday_season), "season": str(r.season), "revenue": float(r.revenue or 0), "transactions": int(r.transactions), "avg_purchase": float(r.avg_purchase or 0)} for r in holiday_impact],
        }
    except Exception:
        import traceback; traceback.print_exc()
        return {}

# ─── GEOGRAPHIC ─────────────────────────────────────────────────────────────
@app.get("/api/geographic")
def get_geographic(db: Session = Depends(get_db)):
    try:
        by_state      = db.execute(text(Q.GEO_BY_STATE)).fetchall()
        by_store      = db.execute(text(Q.GEO_BY_STORE)).fetchall()
        channel_split = db.execute(text(Q.GEO_CHANNEL_SPLIT)).fetchone()

        return {
            "by_state":      [{"state": str(r.state), "customers": int(r.customers), "revenue": float(r.revenue or 0)} for r in by_state],
            "by_store":      [{"location": str(r.location), "revenue": float(r.revenue or 0), "customers": int(r.customers)} for r in by_store],
            "channel_split": {"online": int(channel_split.online or 0), "in_store": int(channel_split.in_store or 0)},
        }
    except Exception:
        import traceback; traceback.print_exc()
        return {}

# ─── BEHAVIORAL ─────────────────────────────────────────────────────────────
@app.get("/api/behavior")
def get_behavior(db: Session = Depends(get_db)):
    try:
        by_day         = db.execute(text(Q.BEHAVIOR_BY_DAY)).fetchall()
        by_hour        = db.execute(text(Q.BEHAVIOR_BY_HOUR)).fetchall()
        app_engagement = db.execute(text(Q.BEHAVIOR_APP_ENGAGEMENT)).fetchall()
        support_impact = db.execute(text(Q.BEHAVIOR_SUPPORT_IMPACT)).fetchall()

        return {
            "by_day":         [{"day": str(r.day_of_week), "revenue": float(r.revenue or 0), "transactions": int(r.transactions)} for r in by_day],
            "by_hour":        [{"hour": int(r.hour), "transactions": int(r.transactions), "revenue": float(r.revenue or 0)} for r in by_hour],
            "app_engagement": [{"usage": str(r.app_usage), "customers": int(r.customers), "avg_spend": float(r.avg_spend or 0), "avg_visits": float(r.avg_visits or 0)} for r in app_engagement],
            "support_impact": [{"calls": str(r.call_bucket), "churn_rate": float(r.churn_rate or 0), "customers": int(r.customers)} for r in support_impact],
        }
    except Exception:
        import traceback; traceback.print_exc()
        return {}

# ─── AI CHAT ────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat_with_ai(request: ChatRequest, db: Session = Depends(get_db)):
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    schema = """
    Table: retail_transactions
    Customer cols: customer_id, age, gender, income_bracket, loyalty_program,
                   membership_years, churned (Yes/No), marital_status, number_of_children,
                   education_level, occupation, customer_city, customer_state
    Transaction cols: transaction_id, transaction_date, product_id, product_category,
                      quantity, unit_price, discount_applied, payment_method, store_location,
                      transaction_hour, day_of_week, week_of_year, month_of_year
    Behavior cols: avg_purchase_value, purchase_frequency, avg_discount_used,
                   preferred_store, online_purchases, in_store_purchases,
                   avg_items_per_transaction, avg_transaction_value,
                   total_returned_items, total_returned_value, days_since_last_purchase,
                   website_visits, app_usage, social_media_engagement,
                   customer_support_calls, email_subscriptions
    Sales cols: total_sales (use for revenue), total_transactions, total_items_purchased,
                total_discounts_received, avg_spent_per_category,
                max_single_purchase_value, min_single_purchase_value
    Product cols: product_name, product_brand, product_rating, product_review_count,
                  product_stock, product_return_rate
    Promotion cols: promotion_type, promotion_effectiveness, promotion_channel,
                    promotion_target_audience
    Temporal cols: holiday_season (Yes/No), season, weekend (Yes/No)
    """

    sql_prompt = f"""Given this PostgreSQL schema:\n{schema}\n
Write ONE PostgreSQL query to answer: {request.message}
Rules: ONLY raw SQL. No markdown. Start with SELECT. Table = retail_transactions.
Use total_sales for revenue. Use churned='Yes' for churn. LIMIT results to 20 rows."""

    sql_completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": sql_prompt}]
    )
    sql_query = sql_completion.choices[0].message.content.strip().replace("```sql", "").replace("```", "").strip()

    try:
        result = db.execute(text(sql_query)).fetchmany(50)
        data = [{k: str(v) for k, v in dict(row._mapping).items()} for row in result]
    except Exception as e:
        data = f"Query error: {str(e)}"

    analysis_prompt = f"""User asked: '{request.message}'
SQL run: {sql_query}
Result: {data}

You are a Data Analyst. Answer the user's question directly based on the Result data.
Provide a concise, 2 to 4 line answer. Focus ONLY on answering the question using the provided data.
DO NOT provide any extra information, business insights, or recommendations.
DO NOT use headings like "Key Findings".
Use markdown for formatting numbers (e.g. bolding). DO NOT mention SQL or databases."""

    analysis = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[{"role": "user", "content": analysis_prompt}]
    )

    return {
        "reply": analysis.choices[0].message.content,
        "sql":   sql_query,
        "data":  data,
    }
