from fastapi import APIRouter, Depends, Response
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
import io

from app.db.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.core.security import get_current_user_id
from app.services.report_generator import generate_csv_report, generate_pdf_report
from app.ml.health_score import calculate_financial_health_score

router = APIRouter(prefix="/reports", tags=["Reports Module"])

@router.get("/csv")
def download_csv_report(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    tx_dicts = [
        {
            "id": t.id,
            "date": t.date,
            "merchant": t.merchant,
            "amount": t.amount,
            "type": t.type,
            "category": t.category,
            "payment_method": t.payment_method,
            "notes": t.notes,
            "source": t.source
        }
        for t in transactions
    ]
    csv_str = generate_csv_report(tx_dicts)
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=intelliwealth_financial_report.csv"}
    )

@router.get("/pdf")
def download_pdf_report(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()

    tx_dicts = [
        {
            "id": t.id,
            "date": t.date,
            "merchant": t.merchant,
            "amount": t.amount,
            "type": t.type,
            "category": t.category
        }
        for t in transactions
    ]

    income = user.monthly_income if user else 75000.0
    total_expense = sum(t.amount for t in transactions if t.type == "expense")
    health = calculate_financial_health_score(income, total_expense, max(0.0, income - total_expense), 45000.0, total_expense)

    pdf_bytes = generate_pdf_report(
        user_name=user.name if user else "IntelliWealth User",
        income=income,
        total_expense=total_expense,
        health_score=health,
        transactions=tx_dicts
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=intelliwealth_financial_report.pdf"}
    )
