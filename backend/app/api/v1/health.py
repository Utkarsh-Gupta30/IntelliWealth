from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.db.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal
from app.core.security import get_current_user_id
from app.ml.health_score import calculate_financial_health_score

router = APIRouter(prefix="/health-score", tags=["Financial Health Score"])

@router.get("")
def get_health_score(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()

    income = user.monthly_income if user else 75000.0
    total_expense = sum(t.amount for t in transactions if t.type == "expense")
    total_savings = max(0.0, income - total_expense)

    budget_limit = sum(b.limit_amount for b in budgets) if budgets else 45000.0
    total_budget_spent = total_expense

    # Find emergency fund goal balance if any
    emergency_fund = 0.0
    for g in goals:
        if "emergency" in g.title.lower() or "emergency" in g.category.lower():
            emergency_fund += g.current_amount

    health_res = calculate_financial_health_score(
        monthly_income=income,
        total_monthly_expense=total_expense,
        total_savings=total_savings,
        budget_limit=budget_limit,
        total_budget_spent=total_budget_spent,
        emergency_fund_balance=emergency_fund,
        has_investments=True
    )
    return health_res
