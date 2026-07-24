from typing import List, Dict, Any
import pandas as pd

def generate_ai_financial_insights(transactions: List[Dict[str, Any]], monthly_income: float = 75000.0) -> Dict[str, Any]:
    """
    Generates intelligent financial insights & savings recommendations.
    """
    insights = []
    recommendations = []
    potential_monthly_savings = 0.0

    if not transactions:
        return {
            "insights": [
                "Welcome to IntelliWealth! Add your first transaction or connect a bank account to see automated AI insights.",
                "Set monthly budget limits to get active overspending alerts."
            ],
            "recommendations": [
                "Build a 6-month Emergency Fund.",
                "Automate monthly savings right after payday."
            ],
            "potential_monthly_savings": 5000.0,
            "recurring_subscriptions": []
        }

    df = pd.DataFrame(transactions)
    df["date"] = pd.to_datetime(df["date"])
    df_expense = df[df["type"] == "expense"].copy()

    if df_expense.empty:
        return {
            "insights": ["No expense transactions recorded for the current period."],
            "recommendations": ["Keep tracking income and start allocating investments."],
            "potential_monthly_savings": monthly_income * 0.3,
            "recurring_subscriptions": []
        }

    total_expense = df_expense["amount"].sum()
    cat_expenses = df_expense.groupby("category")["amount"].sum()

    # 1. Category insights
    if "Shopping" in cat_expenses:
        shop_amt = cat_expenses["Shopping"]
        shop_pct = (shop_amt / total_expense) * 100
        if shop_pct >= 25:
            insights.append(f"You spent {round(shop_pct, 1)}% of your total budget on Shopping (₹{shop_amt:,.2f}).")
            recommendations.append("Reduce impulse shopping by applying a 48-hour cooling-off rule before non-essential purchases.")
            potential_monthly_savings += shop_amt * 0.35

    if "Food" in cat_expenses:
        food_amt = cat_expenses["Food"]
        food_pct = (food_amt / total_expense) * 100
        if food_pct >= 20:
            insights.append(f"Dining & food delivery accounts for {round(food_pct, 1)}% of expenses (₹{food_amt:,.2f}).")
            recommendations.append("Limit food delivery orders to weekends to save up to ₹4,000 monthly.")
            potential_monthly_savings += food_amt * 0.25

    if "Entertainment" in cat_expenses:
        ent_amt = cat_expenses["Entertainment"]
        if ent_amt >= 3000:
            insights.append(f"Entertainment spending is rising (₹{ent_amt:,.2f}).")
            recommendations.append("Audit active streaming subscriptions and cancel unused plans.")
            potential_monthly_savings += ent_amt * 0.40

    # 2. Weekend Spending Surge Analysis
    df_expense["day_name"] = df_expense["date"].dt.day_name()
    weekend_mask = df_expense["day_name"].isin(["Saturday", "Sunday"])
    weekend_spent = df_expense[weekend_mask]["amount"].sum()
    weekend_pct = (weekend_spent / total_expense) * 100 if total_expense > 0 else 0

    if weekend_pct >= 35:
        insights.append(f"Weekend spending is high ({round(weekend_pct, 1)}% of total monthly expense occurred on Saturdays & Sundays).")

    # 3. Recurring Subscriptions Detection
    merchant_counts = df_expense.groupby("merchant")["amount"].agg(["count", "mean", "sum"])
    subscription_merchants = merchant_counts[merchant_counts["count"] >= 2]
    recurring_subs = []
    
    for merch, row in subscription_merchants.iterrows():
        recurring_subs.append({
            "merchant": str(merch),
            "frequency": int(row["count"]),
            "average_amount": float(row["mean"]),
            "total_spent": float(row["sum"])
        })

    if len(recurring_subs) > 0:
        insights.append(f"Detected {len(recurring_subs)} recurring payment patterns (e.g. {recurring_subs[0]['merchant']}).")

    if not insights:
        insights.append("Your spending is well-balanced across categories with no anomalous spikes.")
    if not recommendations:
        recommendations.append("Maintain your current disciplined spending habit and reinvest surplus funds.")

    potential_monthly_savings = max(3000.0, round(potential_monthly_savings, 2))

    return {
        "insights": insights,
        "recommendations": recommendations,
        "potential_monthly_savings": potential_monthly_savings,
        "recurring_subscriptions": recurring_subs
    }
