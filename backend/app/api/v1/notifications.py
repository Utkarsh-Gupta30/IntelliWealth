from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime

from app.db.database import get_db
from app.models.notification import Notification
from app.core.security import get_current_user_id

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def get_notifications(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    notes = db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.timestamp.desc()).all()
    if not notes:
        # Default system welcome notification
        default_n = Notification(
            user_id=user_id,
            title="Welcome to IntelliWealth AI",
            message="Your AI Personal Finance Assistant is active and analyzing your spending flow.",
            type="info",
            is_read="false",
            timestamp=datetime.utcnow()
        )
        db.add(default_n)
        db.commit()
        notes = [default_n]

    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read == "true",
            "timestamp": n.timestamp
        }
        for n in notes
    ]

@router.put("/mark-read/{note_id}")
def mark_notification_read(note_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == note_id, Notification.user_id == user_id).first()
    if n:
        n.is_read = "true"
        db.commit()
    return {"status": "success"}

@router.put("/mark-all-read")
def mark_all_notifications_read(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == user_id).update({"is_read": "true"})
    db.commit()
    return {"status": "success"}
