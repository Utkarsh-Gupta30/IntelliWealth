from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.db.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.core.security import get_current_user_id
from app.ml.forecaster import generate_spending_forecast

router = APIRouter(prefix="/forecast", tags=["Spending Forecast"])

@router.get("")
def get_user_forecast(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()

    tx_dicts = [
        {
            "date": t.date,
            "merchant": t.merchant,
            "amount": t.amount,
            "type": t.type,
            "category": t.category
        }
        for t in transactions
    ]

    income = user.monthly_income if user else 75000.0
    forecast_res = generate_spending_forecast(tx_dicts, income)
    return forecast_res
