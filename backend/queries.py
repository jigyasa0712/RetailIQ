"""
queries.py
All raw SQL query strings used by the RetailIQ backend.
Endpoint functions in main.py import from here to keep business logic separate.
"""

# ─── KPIs ───────────────────────────────────────────────────────────────────
KPI_SUMMARY = """
    SELECT
        SUM(total_sales)::float                                                          AS total_revenue,
        AVG(avg_purchase_value)::float                                                   AS avg_order_value,
        COUNT(DISTINCT customer_id)::float                                               AS total_customers,
        COUNT(transaction_id)::float                                                     AS total_transactions,
        SUM(CASE WHEN churned='Yes' THEN 1 ELSE 0 END)::float
            / NULLIF(COUNT(*), 0) * 100                                                  AS churn_rate,
        AVG(product_rating)::float                                                       AS avg_product_rating,
        SUM(total_returned_value)::float                                                 AS total_returns,
        AVG(days_since_last_purchase::float)                                             AS avg_recency,
        SUM(total_discounts_received)::float                                             AS total_discounts_given,
        AVG(avg_transaction_value)::float                                                AS avg_clv
    FROM retail_transactions
"""

# ─── REVENUE TREND ──────────────────────────────────────────────────────────
REVENUE_TREND = """
    SELECT
        month_of_year,
        SUM(total_sales)::float             AS revenue,
        SUM(total_discounts_received)::float AS discounts,
        COUNT(transaction_id)::int           AS transactions
    FROM retail_transactions
    GROUP BY month_of_year
    ORDER BY month_of_year
"""

# ─── CATEGORY PERFORMANCE ───────────────────────────────────────────────────
CATEGORY_PERFORMANCE = """
    SELECT
        product_category                    AS name,
        SUM(total_sales)::float             AS value,
        AVG(product_rating)::float          AS avg_rating,
        SUM(total_returned_value)::float    AS returns,
        COUNT(transaction_id)::int          AS transactions
    FROM retail_transactions
    GROUP BY product_category
    ORDER BY value DESC
"""

# ─── CHURN ANALYSIS ─────────────────────────────────────────────────────────
CHURN_BY_INCOME = """
    SELECT income_bracket AS bracket, churned, COUNT(*)::int AS count
    FROM retail_transactions
    GROUP BY income_bracket, churned
    ORDER BY income_bracket
"""

CHURN_BY_LOYALTY = """
    SELECT
        loyalty_program,
        SUM(CASE WHEN churned='Yes' THEN 1 ELSE 0 END)::int AS churned_count,
        COUNT(*)::int AS total
    FROM retail_transactions
    GROUP BY loyalty_program
"""

CHURN_BY_FREQUENCY = """
    SELECT
        purchase_frequency,
        ROUND(
            SUM(CASE WHEN churned='Yes' THEN 1 ELSE 0 END)::numeric
            / NULLIF(COUNT(*), 0) * 100, 2
        )::float AS churn_rate,
        COUNT(*)::int AS total
    FROM retail_transactions
    GROUP BY purchase_frequency
    ORDER BY churn_rate DESC
"""

# ─── CUSTOMER METRICS ───────────────────────────────────────────────────────
CUSTOMER_SUMMARY = """
    SELECT
        COUNT(DISTINCT customer_id)::float                                          AS total_customers,
        AVG(avg_transaction_value)::float                                           AS avg_clv,
        AVG(avg_purchase_value)::float                                              AS avg_purchase_value,
        AVG(membership_years::float)                                                AS avg_membership,
        SUM(CASE WHEN churned='Yes' THEN 1 ELSE 0 END)::float
            / NULLIF(COUNT(*), 0) * 100                                             AS churn_rate,
        SUM(CASE WHEN loyalty_program='Yes' THEN 1 ELSE 0 END)::float
            / NULLIF(COUNT(*), 0) * 100                                             AS loyalty_rate
    FROM retail_transactions
"""

CUSTOMER_SEGMENTS = """
    SELECT income_bracket AS name, COUNT(DISTINCT customer_id)::int AS value
    FROM retail_transactions
    GROUP BY income_bracket
    ORDER BY value DESC
"""

CUSTOMER_BY_FREQUENCY = """
    SELECT purchase_frequency AS name, COUNT(DISTINCT customer_id)::int AS value
    FROM retail_transactions
    GROUP BY purchase_frequency
    ORDER BY value DESC
"""

CUSTOMER_BY_AGE = """
    SELECT
        CASE
            WHEN age < 25 THEN '18-24'
            WHEN age < 35 THEN '25-34'
            WHEN age < 45 THEN '35-44'
            WHEN age < 55 THEN '45-54'
            ELSE '55+'
        END AS age_group,
        COUNT(DISTINCT customer_id)::int         AS count,
        ROUND(AVG(total_sales)::numeric, 2)::float AS avg_spend
    FROM retail_transactions
    GROUP BY age_group
    ORDER BY age_group
"""

CUSTOMER_BY_GENDER = """
    SELECT
        gender,
        COUNT(DISTINCT customer_id)::int           AS count,
        ROUND(AVG(total_sales)::numeric, 2)::float AS avg_spend
    FROM retail_transactions
    GROUP BY gender
    ORDER BY count DESC
"""

TOP_CUSTOMERS = """
    SELECT
        customer_id,
        MAX(occupation)                             AS occupation,
        MAX(customer_city)                          AS city,
        ROUND(SUM(total_sales)::numeric, 2)::float AS revenue,
        MAX(membership_years)::int                  AS years
    FROM retail_transactions
    GROUP BY customer_id
    ORDER BY revenue DESC
    LIMIT 10
"""

# ─── PRODUCT METRICS ────────────────────────────────────────────────────────
PRODUCT_SUMMARY = """
    SELECT
        COUNT(DISTINCT product_id)::float     AS total_products,
        AVG(product_rating)::float            AS avg_rating,
        AVG(product_return_rate)::float       AS avg_return_rate,
        AVG(product_stock::float)             AS avg_stock
    FROM retail_transactions
"""

TOP_PRODUCTS_BY_REVENUE = """
    SELECT
        product_name, product_category, product_brand,
        ROUND(SUM(total_sales)::numeric, 2)::float        AS revenue,
        ROUND(AVG(product_rating)::numeric, 2)::float     AS rating,
        ROUND(SUM(total_returned_value)::numeric, 2)::float AS returns
    FROM retail_transactions
    GROUP BY product_name, product_category, product_brand
    ORDER BY revenue DESC
    LIMIT 10
"""

PRODUCTS_BY_BRAND = """
    SELECT
        product_brand AS name,
        ROUND(SUM(total_sales)::numeric, 2)::float AS revenue,
        COUNT(*)::int AS transactions
    FROM retail_transactions
    GROUP BY product_brand
    ORDER BY revenue DESC
    LIMIT 8
"""

PRODUCT_RATING_DISTRIBUTION = """
    SELECT
        ROUND(product_rating::numeric, 0)::int AS rating_bucket,
        COUNT(*)::int AS count
    FROM retail_transactions
    WHERE product_rating IS NOT NULL
    GROUP BY rating_bucket
    ORDER BY rating_bucket
"""

PRODUCT_RETURN_ANALYSIS = """
    SELECT
        product_category,
        ROUND(AVG(product_return_rate)::numeric, 4)::float  AS return_rate,
        ROUND(SUM(total_returned_value)::numeric, 2)::float AS total_returned
    FROM retail_transactions
    GROUP BY product_category
    ORDER BY return_rate DESC
"""

# ─── PROMOTIONS ─────────────────────────────────────────────────────────────
PROMOTIONS_BY_TYPE = """
    SELECT
        promotion_type,
        COUNT(*)::int                                         AS uses,
        ROUND(SUM(total_sales)::numeric, 2)::float           AS revenue,
        ROUND(SUM(total_discounts_received)::numeric, 2)::float AS discount_given
    FROM retail_transactions
    GROUP BY promotion_type
    ORDER BY revenue DESC
"""

PROMOTIONS_BY_EFFECTIVENESS = """
    SELECT
        promotion_effectiveness,
        COUNT(*)::int                               AS count,
        ROUND(SUM(total_sales)::numeric, 2)::float AS revenue
    FROM retail_transactions
    GROUP BY promotion_effectiveness
"""

PROMOTIONS_BY_CHANNEL = """
    SELECT
        promotion_channel,
        COUNT(*)::int                               AS uses,
        ROUND(SUM(total_sales)::numeric, 2)::float AS revenue
    FROM retail_transactions
    GROUP BY promotion_channel
    ORDER BY revenue DESC
"""

PROMOTIONS_HOLIDAY_IMPACT = """
    SELECT
        holiday_season, season,
        ROUND(SUM(total_sales)::numeric, 2)::float        AS revenue,
        COUNT(*)::int                                      AS transactions,
        ROUND(AVG(avg_purchase_value)::numeric, 2)::float AS avg_purchase
    FROM retail_transactions
    GROUP BY holiday_season, season
    ORDER BY season
"""

# ─── GEOGRAPHIC ─────────────────────────────────────────────────────────────
GEO_BY_STATE = """
    SELECT
        customer_state AS state,
        COUNT(DISTINCT customer_id)::int            AS customers,
        ROUND(SUM(total_sales)::numeric, 2)::float AS revenue
    FROM retail_transactions
    GROUP BY customer_state
    ORDER BY revenue DESC
    LIMIT 15
"""

GEO_BY_STORE = """
    SELECT
        store_location AS location,
        ROUND(SUM(total_sales)::numeric, 2)::float AS revenue,
        COUNT(DISTINCT customer_id)::int            AS customers
    FROM retail_transactions
    GROUP BY store_location
    ORDER BY revenue DESC
"""

GEO_CHANNEL_SPLIT = """
    SELECT
        SUM(online_purchases)::int    AS online,
        SUM(in_store_purchases)::int  AS in_store
    FROM retail_transactions
"""

# ─── BEHAVIORAL ─────────────────────────────────────────────────────────────
BEHAVIOR_BY_DAY = """
    SELECT
        day_of_week,
        ROUND(SUM(total_sales)::numeric, 2)::float AS revenue,
        COUNT(*)::int AS transactions
    FROM retail_transactions
    GROUP BY day_of_week
    ORDER BY CASE day_of_week
        WHEN 'Monday'    THEN 1 WHEN 'Tuesday'  THEN 2 WHEN 'Wednesday' THEN 3
        WHEN 'Thursday'  THEN 4 WHEN 'Friday'   THEN 5 WHEN 'Saturday'  THEN 6 ELSE 7
    END
"""

BEHAVIOR_BY_HOUR = """
    SELECT
        transaction_hour::int AS hour,
        COUNT(*)::int AS transactions,
        ROUND(SUM(total_sales)::numeric, 2)::float AS revenue
    FROM retail_transactions
    GROUP BY transaction_hour
    ORDER BY transaction_hour
"""

BEHAVIOR_APP_ENGAGEMENT = """
    SELECT
        app_usage,
        COUNT(DISTINCT customer_id)::int                    AS customers,
        ROUND(AVG(total_sales)::numeric, 2)::float         AS avg_spend,
        ROUND(AVG(website_visits::float)::numeric, 1)::float AS avg_visits
    FROM retail_transactions
    GROUP BY app_usage
"""

BEHAVIOR_SUPPORT_IMPACT = """
    SELECT
        CASE
            WHEN customer_support_calls = 0   THEN '0 calls'
            WHEN customer_support_calls <= 2  THEN '1-2 calls'
            WHEN customer_support_calls <= 5  THEN '3-5 calls'
            ELSE '6+ calls'
        END AS call_bucket,
        ROUND(
            SUM(CASE WHEN churned='Yes' THEN 1 ELSE 0 END)::numeric
            / NULLIF(COUNT(*), 0) * 100, 2
        )::float AS churn_rate,
        COUNT(*)::int AS customers
    FROM retail_transactions
    GROUP BY call_bucket
    ORDER BY call_bucket
"""
