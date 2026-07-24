from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime, timedelta
import pandas as pd

from app.db.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.core.security import get_current_user_id
from app.ml.insights import generate_ai_financial_insights

router = APIRouter(prefix="/analytics", tags=["Expense Analytics"])

@router.get("/details")
def get_analytics_details(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()

    tx_dicts = [
        {
            "id": t.id,
            "date": t.date,
            "merchant": t.merchant,
            "amount": t.amount,
            "type": t.type,
            "category": t.category
        }
        for t in transactions
    ]

    income = user.monthly_income if user else 75000.0
    ai_insights = generate_ai_financial_insights(tx_dicts, income)

    if not transactions:
        return {
            "category_analysis": [],
            "top_merchants": [],
            "weekly_spending": [],
            "weekend_spending_percent": 0.0,
            "recurring_expenses": [],
            "insights": ai_insights["insights"],
            "recommendations": ai_insights["recommendations"],
            "potential_monthly_savings": ai_insights["potential_monthly_savings"]
        }

    df = pd.DataFrame(tx_dicts)
    df["date"] = pd.to_datetime(df["date"])
    df_exp = df[df["type"] == "expense"].copy()

    if df_exp.empty:
        return {
            "category_analysis": [],
            "top_merchants": [],
            "weekly_spending": [],
            "weekend_spending_percent": 0.0,
            "recurring_expenses": [],
            "insights": ai_insights["insights"],
            "recommendations": ai_insights["recommendations"],
            "potential_monthly_savings": ai_insights["potential_monthly_savings"]
        }

    # 1. Top Merchants
    top_merch_series = df_exp.groupby("merchant")["amount"].sum().sort_values(ascending=False).head(5)
    top_merchants = [
        {"merchant": merch, "total_spent": round(float(amt), 2)}
        for merch, amt in top_merch_series.items()
    ]

    # 2. Category Analysis with percentage
    total_exp = df_exp["amount"].sum()
    cat_series = df_exp.groupby("category")["amount"].sum().sort_values(ascending=False)
    category_analysis = [
        {
            "category": cat,
            "total_spent": round(float(amt), 2),
            "percentage": round((float(amt) / total_exp * 100), 1)
        }
        for cat, amt in cat_series.items()
    ]

    # 3. Weekly Spending Breakdown
    df_exp["week_day"] = df_exp["date"].dt.day_name()
    days_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    weekly_spent = df_exp.groupby("week_day")["amount"].sum().reindex(days_order, fill_value=0.0)
    
    weekly_spending = [
        {"day": day, "amount": round(float(amt), 2)}
        for day, amt in weekly_spent.items()
    ]

    # Weekend %
    weekend_sum = float(weekly_spent["Saturday"] + weekly_spent["Sunday"])
    weekend_pct = round((weekend_sum / total_exp * 100), 1) if total_exp > 0 else 0.0

    return {
        "category_analysis": category_analysis,
        "top_merchants": top_merchants,
        "weekly_spending": weekly_spending,
        "weekend_spending_percent": weekend_pct,
        "recurring_expenses": ai_insights["recurring_subscriptions"],
        "insights": ai_insights["insights"],
        "recommendations": ai_insights["recommendations"],
        "potential_monthly_savings": ai_insights["potential_monthly_savings"]
    }
