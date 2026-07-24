from typing import Dict, Any, List

def calculate_financial_health_score(
    monthly_income: float,
    total_monthly_expense: float,
    total_savings: float,
    budget_limit: float,
    total_budget_spent: float,
    emergency_fund_balance: float = 0.0,
    has_investments: bool = True
) -> Dict[str, Any]:
    """
    Computes a 0–100 Financial Health Score based on 6 critical financial metrics.
    """
    if monthly_income <= 0:
        monthly_income = 1.0

    # 1. Savings Rate Score (0 - 25 pts)
    savings_rate = max(0.0, (monthly_income - total_monthly_expense) / monthly_income)
    if savings_rate >= 0.30:
        savings_score = 25.0
    elif savings_rate >= 0.20:
        savings_score = 20.0
    elif savings_rate >= 0.10:
        savings_score = 12.0
    else:
        savings_score = max(0.0, savings_rate * 100)

    # 2. Emergency Fund Ratio (0 - 20 pts)
    # Target: 6 months of expenses
    monthly_exp_target = total_monthly_expense if total_monthly_expense > 0 else 25000.0
    months_covered = emergency_fund_balance / monthly_exp_target if monthly_exp_target > 0 else 0
    if months_covered >= 6:
        emergency_score = 20.0
    elif months_covered >= 3:
        emergency_score = 15.0
    elif months_covered >= 1:
        emergency_score = 10.0
    else:
        emergency_score = max(2.0, months_covered * 5)

    # 3. Budget Discipline Score (0 - 20 pts)
    if budget_limit > 0:
        budget_ratio = total_budget_spent / budget_limit
        if budget_ratio <= 0.85:
            budget_score = 20.0
        elif budget_ratio <= 1.0:
            budget_score = 15.0
        elif budget_ratio <= 1.15:
            budget_score = 8.0
        else:
            budget_score = 2.0
    else:
        budget_score = 14.0 # Default neutral

    # 4. Debt & Expense to Income Ratio Score (0 - 15 pts)
    exp_ratio = total_monthly_expense / monthly_income
    if exp_ratio <= 0.50:
        debt_score = 15.0
    elif exp_ratio <= 0.70:
        debt_score = 10.0
    elif exp_ratio <= 0.90:
        debt_score = 5.0
    else:
        debt_score = 0.0

    # 5. Income Stability (0 - 10 pts)
    stability_score = 9.0

    # 6. Investment Habit (0 - 10 pts)
    investment_score = 10.0 if has_investments else 4.0

    total_score = round(savings_score + emergency_score + budget_score + debt_score + stability_score + investment_score, 1)
    total_score = min(100.0, max(0.0, total_score))

    # Rating Tier
    if total_score >= 85:
        tier = "Excellent"
        color = "#10B981" # Green
    elif total_score >= 70:
        tier = "Good"
        color = "#3B82F6" # Blue
    elif total_score >= 50:
        tier = "Average"
        color = "#F59E0B" # Amber
    else:
        tier = "Poor"
        color = "#EF4444" # Red

    # Dynamic Improvement Suggestions
    suggestions = []
    if savings_rate < 0.20:
        suggestions.append(f"Increase your savings rate from {round(savings_rate*100, 1)}% to at least 20% by cutting non-essential shopping & dining out.")
    if months_covered < 6:
        suggestions.append(f"Build an Emergency Fund of 6 months of expenses (₹{round(monthly_exp_target * 6):,}). Currently covering {round(months_covered, 1)} months.")
    if budget_limit > 0 and total_budget_spent > budget_limit:
        suggestions.append("You have exceeded your overall monthly budget limit. Review category thresholds in Budget Planner.")
    if exp_ratio > 0.70:
        suggestions.append("Your total monthly expenses exceed 70% of your income. Focus on reducing recurring fixed overheads.")
    if not has_investments:
        suggestions.append("Start a Systemic Investment Plan (SIP) in mutual funds or index ETFs to combat inflation.")
        
    if not suggestions:
        suggestions.append("Great job! Your financial metrics are strong. Consider optimizing tax-saving instruments.")

    return {
        "score": total_score,
        "tier": tier,
        "color": color,
        "metrics_breakdown": {
            "savings_rate_percent": round(savings_rate * 100, 1),
            "savings_score": savings_score,
            "emergency_fund_months": round(months_covered, 1),
            "emergency_score": emergency_score,
            "budget_discipline_score": budget_score,
            "debt_ratio_score": debt_score,
            "stability_score": stability_score,
            "investment_score": investment_score
        },
        "suggestions": suggestions
    }
