from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import math

from app.db.database import get_db
from app.models.goal import Goal
from app.schemas.schemas import GoalCreate, GoalOut
from app.core.security import get_current_user_id

router = APIRouter(prefix="/goals", tags=["Goal Planner"])

@router.get("", response_model=List[GoalOut])
def get_user_goals(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    result = []
    now = datetime.utcnow()

    for g in goals:
        progress = (g.current_amount / g.target_amount * 100) if g.target_amount > 0 else 0.0
        remaining = max(0.0, g.target_amount - g.current_amount)

        # Months remaining to deadline
        months_rem = max(1, math.ceil((g.deadline - now).days / 30))
        suggested_monthly = remaining / months_rem if months_rem > 0 else remaining

        expected_date = g.deadline.strftime("%b %Y")

        result.append({
            "id": g.id,
            "title": g.title,
            "category": g.category,
            "target_amount": g.target_amount,
            "current_amount": g.current_amount,
            "deadline": g.deadline,
            "progress_percentage": round(min(100.0, progress), 1),
            "remaining_amount": round(remaining, 2),
            "suggested_monthly_savings": round(suggested_monthly, 2),
            "expected_completion_date": expected_date
        })
    return result

@router.post("", response_model=GoalOut)
def create_goal(g_in: GoalCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    goal = Goal(
        user_id=user_id,
        title=g_in.title,
        category=g_in.category,
        target_amount=g_in.target_amount,
        current_amount=g_in.current_amount,
        deadline=g_in.deadline
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)

    now = datetime.utcnow()
    progress = (goal.current_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0.0
    remaining = max(0.0, goal.target_amount - goal.current_amount)
    months_rem = max(1, math.ceil((goal.deadline - now).days / 30))
    suggested_monthly = remaining / months_rem

    return {
        "id": goal.id,
        "title": goal.title,
        "category": goal.category,
        "target_amount": goal.target_amount,
        "current_amount": goal.current_amount,
        "deadline": goal.deadline,
        "progress_percentage": round(min(100.0, progress), 1),
        "remaining_amount": round(remaining, 2),
        "suggested_monthly_savings": round(suggested_monthly, 2),
        "expected_completion_date": goal.deadline.strftime("%b %Y")
    }

@router.put("/{goal_id}/add-funds")
def add_funds_to_goal(goal_id: int, amount: float, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    g = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    g.current_amount += amount
    db.commit()
    db.refresh(g)
    return {"message": f"Successfully added ₹{amount} to goal {g.title}", "current_amount": g.current_amount}

@router.delete("/{goal_id}")
def delete_goal(goal_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    g = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(g)
    db.commit()
    return {"message": "Goal deleted successfully"}
