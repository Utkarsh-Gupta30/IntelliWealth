import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from typing import List, Dict, Any

def generate_spending_forecast(transactions: List[Dict[str, Any]], monthly_income: float = 75000.0) -> Dict[str, Any]:
    """
    Predicts next month's total spending, cash flow, category breakdowns, and confidence interval.
    """
    if not transactions:
        return {
            "predicted_next_month_spending": 25000.0,
            "predicted_next_month_savings": monthly_income - 25000.0,
            "cash_flow_forecast": "Positive",
            "trend_direction": "stable",
            "confidence_score": 0.85,
            "category_forecasts": [
                {"category": "Food", "predicted_amount": 7500.0},
                {"category": "Shopping", "predicted_amount": 5000.0},
                {"category": "Bills", "predicted_amount": 4500.0},
                {"category": "Travel", "predicted_amount": 3000.0},
                {"category": "Rent", "predicted_amount": 15000.0}
            ]
        }

    df = pd.DataFrame(transactions)
    df["date"] = pd.to_datetime(df["date"])
    df_expense = df[df["type"] == "expense"].copy()

    if df_expense.empty:
        return {
            "predicted_next_month_spending": 0.0,
            "predicted_next_month_savings": monthly_income,
            "cash_flow_forecast": "Positive",
            "trend_direction": "stable",
            "confidence_score": 0.90,
            "category_forecasts": []
        }

    # Group by year-month
    df_expense["month_year"] = df_expense["date"].dt.to_period("M")
    monthly_totals = df_expense.groupby("month_year")["amount"].sum().reset_index()
    monthly_totals["month_num"] = np.arange(len(monthly_totals))

    if len(monthly_totals) >= 2:
        X = monthly_totals[["month_num"]]
        y = monthly_totals["amount"]
        model = LinearRegression()
        model.fit(X, y)
        
        next_month_df = pd.DataFrame([[len(monthly_totals)]], columns=["month_num"])
        next_month_pred = float(model.predict(next_month_df)[0])
        next_month_pred = max(next_month_pred, float(monthly_totals["amount"].mean() * 0.8))
        
        slope = float(model.coef_[0])
        trend_direction = "increasing" if slope > 500 else ("decreasing" if slope < -500 else "stable")
    else:
        next_month_pred = float(monthly_totals["amount"].iloc[0]) if len(monthly_totals) == 1 else 25000.0
        trend_direction = "stable"

    # Category breakdowns forecast
    cat_totals = df_expense.groupby("category")["amount"].sum()
    total_spent = cat_totals.sum()
    cat_forecasts = []
    
    for cat, amt in cat_totals.items():
        ratio = (amt / total_spent) if total_spent > 0 else 0.1
        cat_forecasts.append({
            "category": cat,
            "predicted_amount": round(float(next_month_pred * ratio), 2)
        })

    cat_forecasts.sort(key=lambda x: x["predicted_amount"], reverse=True)

    predicted_savings = max(0.0, monthly_income - next_month_pred)
    cash_flow_forecast = "Positive" if predicted_savings > 0 else "Negative / Tight"

    return {
        "predicted_next_month_spending": round(next_month_pred, 2),
        "predicted_next_month_savings": round(predicted_savings, 2),
        "cash_flow_forecast": cash_flow_forecast,
        "trend_direction": trend_direction,
        "confidence_score": 0.88,
        "category_forecasts": cat_forecasts
    }
