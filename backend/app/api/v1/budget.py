from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.schemas.schemas import BudgetCreate, BudgetOut
from app.core.security import get_current_user_id

router = APIRouter(prefix="/budgets", tags=["Budget Planner"])

@router.get("", response_model=List[BudgetOut])
def get_user_budgets(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id, Transaction.type == "expense").all()

    result = []
    for b in budgets:
        # Calculate spent amount for category
        if b.category == "Overall":
            spent = sum(t.amount for t in transactions)
        else:
            spent = sum(t.amount for t in transactions if t.category == b.category)

        remaining = b.limit_amount - spent
        pct = (spent / b.limit_amount * 100) if b.limit_amount > 0 else 0.0

        if pct >= 100:
            status = "Overspent"
        elif pct >= 80:
            status = "Warning"
        else:
            status = "On Track"

        result.append({
            "id": b.id,
            "category": b.category,
            "limit_amount": b.limit_amount,
            "period": b.period,
            "spent_amount": round(spent, 2),
            "remaining_amount": round(remaining, 2),
            "percentage_used": round(pct, 1),
            "status": status
        })
    return result

@router.post("", response_model=BudgetOut)
def create_or_update_budget(b_in: BudgetCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    existing = db.query(Budget).filter(Budget.user_id == user_id, Budget.category == b_in.category).first()
    if existing:
        existing.limit_amount = b_in.limit_amount
        existing.period = b_in.period
        db.commit()
        db.refresh(existing)
        b_target = existing
    else:
        b_target = Budget(
            user_id=user_id,
            category=b_in.category,
            limit_amount=b_in.limit_amount,
            period=b_in.period
        )
        db.add(b_target)
        db.commit()
        db.refresh(b_target)

    transactions = db.query(Transaction).filter(Transaction.user_id == user_id, Transaction.type == "expense").all()
    spent = sum(t.amount for t in transactions if (b_target.category == "Overall" or t.category == b_target.category))
    remaining = b_target.limit_amount - spent
    pct = (spent / b_target.limit_amount * 100) if b_target.limit_amount > 0 else 0.0

    return {
        "id": b_target.id,
        "category": b_target.category,
        "limit_amount": b_target.limit_amount,
        "period": b_target.period,
        "spent_amount": round(spent, 2),
        "remaining_amount": round(remaining, 2),
        "percentage_used": round(pct, 1),
        "status": "Overspent" if pct >= 100 else ("Warning" if pct >= 80 else "On Track")
    }

@router.delete("/{budget_id}")
def delete_budget(budget_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(b)
    db.commit()
    return {"message": "Budget deleted successfully"}
