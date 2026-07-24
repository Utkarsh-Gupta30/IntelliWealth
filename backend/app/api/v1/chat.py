from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime

from app.db.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.chat_history import ChatHistory
from app.schemas.schemas import ChatMessageRequest, ChatMessageResponse
from app.core.security import get_current_user_id
from app.ai.chatbot import process_ai_chat
from app.ml.health_score import calculate_financial_health_score

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])

@router.get("/history")
def get_chat_history(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    chats = db.query(ChatHistory).filter(ChatHistory.user_id == user_id).order_by(ChatHistory.timestamp.asc()).limit(50).all()
    return [
        {
            "id": c.id,
            "sender": c.sender,
            "message": c.message,
            "timestamp": c.timestamp
        }
        for c in chats
    ]

@router.post("/message", response_model=ChatMessageResponse)
def send_chat_message(req: ChatMessageRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()

    tx_dicts = [{"date": t.date, "merchant": t.merchant, "amount": t.amount, "type": t.type, "category": t.category} for t in transactions]
    
    income = user.monthly_income if user else 75000.0
    total_expense = sum(t.amount for t in transactions if t.type == "expense")
    health = calculate_financial_health_score(income, total_expense, max(0.0, income - total_expense), 45000.0, total_expense)

    user_prof = {
        "monthly_income": income,
        "risk_preference": user.risk_preference if user else "Moderate",
        "financial_goals": user.financial_goals if user else "General Wealth",
        "preferred_currency": user.preferred_currency if user else "INR"
    }

    # Record User Message
    user_chat = ChatHistory(user_id=user_id, sender="user", message=req.message, timestamp=datetime.utcnow())
    db.add(user_chat)

    # Generate AI Response
    ai_res = process_ai_chat(req.message, user_prof, tx_dicts, health)

    # Record Bot Message
    bot_chat = ChatHistory(user_id=user_id, sender="bot", message=ai_res["reply"], timestamp=datetime.utcnow())
    db.add(bot_chat)
    db.commit()

    return ChatMessageResponse(
        reply=ai_res["reply"],
        sender="bot",
        timestamp=bot_chat.timestamp,
        suggested_prompts=ai_res.get("suggested_prompts")
    )
