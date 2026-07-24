from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.database import get_db
from app.models.transaction import Transaction
from app.schemas.schemas import TransactionCreate, TransactionOut, TransactionUpdate, AutoCategorizeRequest, AutoCategorizeResponse
from app.core.security import get_current_user_id
from app.ml.categorizer import auto_categorize_transaction

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/auto-categorize", response_model=AutoCategorizeResponse)
def categorize_transaction_endpoint(req: AutoCategorizeRequest):
    cat, conf, method = auto_categorize_transaction(req.merchant, req.amount, req.notes or "")
    return {
        "merchant": req.merchant,
        "category": cat,
        "confidence": conf,
        "method_used": method
    }

@router.post("", response_model=TransactionOut)
def create_transaction(
    tx_in: TransactionCreate, 
    user_id: int = Depends(get_current_user_id), 
    db: Session = Depends(get_db)
):
    # Auto categorize if category is missing or Miscellaneous
    cat = tx_in.category
    if not cat or cat == "Miscellaneous":
        cat, _, _ = auto_categorize_transaction(tx_in.merchant, tx_in.amount, tx_in.notes or "")

    tx = Transaction(
        user_id=user_id,
        date=tx_in.date or datetime.utcnow(),
        merchant=tx_in.merchant,
        amount=tx_in.amount,
        type=tx_in.type,
        category=cat,
        payment_method=tx_in.payment_method or "UPI/Card",
        notes=tx_in.notes,
        source=tx_in.source or "Manual",
        bank_account_name=tx_in.bank_account_name
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

@router.get("", response_model=List[TransactionOut])
def get_transactions(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    search: Optional[str] = None,
    category: Optional[str] = None,
    type: Optional[str] = None,
    sort_by: Optional[str] = "date",
    order: Optional[str] = "desc",
    page: int = 1,
    limit: int = 50
):
    query = db.query(Transaction).filter(Transaction.user_id == user_id)

    if search:
        query = query.filter(Transaction.merchant.ilike(f"%{search}%") | Transaction.notes.ilike(f"%{search}%"))
    if category:
        query = query.filter(Transaction.category == category)
    if type:
        query = query.filter(Transaction.type == type)

    # Sorting
    if sort_by == "amount":
        query = query.order_by(Transaction.amount.desc() if order == "desc" else Transaction.amount.asc())
    elif sort_by == "merchant":
        query = query.order_by(Transaction.merchant.asc() if order == "asc" else Transaction.merchant.desc())
    else:
        query = query.order_by(Transaction.date.desc() if order == "desc" else Transaction.date.asc())

    # Pagination
    offset = (page - 1) * limit
    transactions = query.offset(offset).limit(limit).all()
    return transactions

@router.put("/{tx_id}", response_model=TransactionOut)
def update_transaction(
    tx_id: int, 
    tx_in: TransactionUpdate, 
    user_id: int = Depends(get_current_user_id), 
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if tx_in.merchant is not None:
        tx.merchant = tx_in.merchant
    if tx_in.amount is not None:
        tx.amount = tx_in.amount
    if tx_in.type is not None:
        tx.type = tx_in.type
    if tx_in.category is not None:
        tx.category = tx_in.category
    if tx_in.payment_method is not None:
        tx.payment_method = tx_in.payment_method
    if tx_in.notes is not None:
        tx.notes = tx_in.notes
    if tx_in.date is not None:
        tx.date = tx_in.date

    db.commit()
    db.refresh(tx)
    return tx

@router.delete("/{tx_id}")
def delete_transaction(
    tx_id: int, 
    user_id: int = Depends(get_current_user_id), 
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted successfully"}
