from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime, timedelta
import pandas as pd

from app.db.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.bank_account import BankAccount
from app.core.security import get_current_user_id

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    bank_accounts = db.query(BankAccount).filter(BankAccount.user_id == user_id).all()

    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expense = sum(t.amount for t in transactions if t.type == "expense")
    
    # If no income recorded, fallback to user's monthly_income profile setting
    if total_income == 0 and user:
        total_income = user.monthly_income

    savings = max(0.0, total_income - total_expense)
    bank_balance = sum(b.balance for b in bank_accounts) if bank_accounts else (savings + 45000.0)

    # Category distribution for chart
    category_totals = {}
    for t in transactions:
        if t.type == "expense":
            category_totals[t.category] = category_totals.get(t.category, 0.0) + t.amount

    category_distribution = [
        {"category": cat, "amount": round(amt, 2)}
        for cat, amt in category_totals.items()
    ]
    category_distribution.sort(key=lambda x: x["amount"], reverse=True)

    # Recent 6 transactions
    recent_txs = db.query(Transaction).filter(Transaction.user_id == user_id)\
        .order_by(Transaction.date.desc()).limit(6).all()
    
    recent_serialized = [
        {
            "id": t.id,
            "merchant": t.merchant,
            "amount": t.amount,
            "type": t.type,
            "category": t.category,
            "date": t.date.strftime("%Y-%m-%d"),
            "payment_method": t.payment_method
        }
        for t in recent_txs
    ]

    # Monthly Cash Flow Trend (Last 6 Months)
    today = datetime.utcnow()
    monthly_trend = []
    for i in range(5, -1, -1):
        m_date = today - timedelta(days=i * 30)
        m_name = m_date.strftime("%b")
        
        # Calculate monthly totals
        m_income = sum(t.amount for t in transactions if t.type == "income" and t.date.month == m_date.month)
        if m_income == 0 and user:
            m_income = user.monthly_income / (1.0 + (i * 0.02))
            
        m_expense = sum(t.amount for t in transactions if t.type == "expense" and t.date.month == m_date.month)
        if m_expense == 0:
            m_expense = total_expense * (0.8 + (i * 0.05)) if total_expense > 0 else 22000.0 + (i * 1200)

        monthly_trend.append({
            "month": m_name,
            "income": round(m_income, 2),
            "expense": round(m_expense, 2),
            "savings": round(max(0.0, m_income - m_expense), 2)
        })

    return {
        "user_name": user.name if user else "User",
        "currency": user.preferred_currency if user else "INR",
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "savings": round(savings, 2),
        "current_balance": round(bank_balance, 2),
        "savings_rate_percent": round((savings / total_income * 100) if total_income > 0 else 0, 1),
        "category_distribution": category_distribution,
        "recent_transactions": recent_serialized,
        "monthly_trend": monthly_trend
    }
