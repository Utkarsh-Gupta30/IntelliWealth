import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import random

from app.db.database import get_db
from app.models.bank_account import BankAccount
from app.models.transaction import Transaction
from app.models.sync_log import SyncLog
from app.schemas.schemas import BankConnectRequest, BankAccountOut, TransactionOut
from app.core.security import get_current_user_id
from app.ml.categorizer import auto_categorize_transaction

router = APIRouter(prefix="/bank", tags=["Bank Integration & CSV"])

@router.get("/accounts", response_model=List[BankAccountOut])
def get_bank_accounts(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    accounts = db.query(BankAccount).filter(BankAccount.user_id == user_id).all()
    return accounts

@router.post("/connect", response_model=BankAccountOut)
def connect_bank_account(req: BankConnectRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    # Mask account number
    mask_num = f"**** {random.randint(1000, 9999)}"
    acc = BankAccount(
        user_id=user_id,
        bank_name=req.bank_name,
        account_number_mask=mask_num,
        account_type=req.account_type,
        balance=float(random.randint(50000, 250000)),
        status="Connected",
        auto_sync=True,
        last_synced_at=datetime.utcnow()
    )
    db.add(acc)
    db.commit()
    db.refresh(acc)

    # Seed 3 sample auto-synced bank transactions
    sample_merchants = [
        ("Starbucks Coffee", 450.0, "expense", "Food"),
        ("Uber Trip", 380.0, "expense", "Travel"),
        ("Monthly Dividend / Interest", 1200.0, "income", "Investment")
    ]
    for m, amt, t_type, cat in sample_merchants:
        tx = Transaction(
            user_id=user_id,
            date=datetime.utcnow() - timedelta(days=random.randint(1, 5)),
            merchant=m,
            amount=amt,
            type=t_type,
            category=cat,
            payment_method="Bank Direct Sync",
            notes=f"Auto-synced from {req.bank_name}",
            source="Bank Sync",
            bank_account_name=req.bank_name
        )
        db.add(tx)
        
    db.commit()
    return acc

@router.post("/sync/{account_id}")
def sync_bank_account(account_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    acc = db.query(BankAccount).filter(BankAccount.id == account_id, BankAccount.user_id == user_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Bank account not found")

    acc.last_synced_at = datetime.utcnow()
    acc.status = "Connected"
    
    synced_count = random.randint(1, 4)
    sync_log = SyncLog(
        bank_account_id=acc.id,
        status="SUCCESS",
        items_synced=synced_count,
        sync_time=datetime.utcnow()
    )
    db.add(sync_log)
    db.commit()
    return {"message": f"Successfully synced {synced_count} new transactions from {acc.bank_name}", "last_synced_at": acc.last_synced_at}

@router.delete("/disconnect/{account_id}")
def disconnect_bank_account(account_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    acc = db.query(BankAccount).filter(BankAccount.id == account_id, BankAccount.user_id == user_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Bank account not found")
        
    db.delete(acc)
    db.commit()
    return {"message": "Bank account disconnected successfully"}

@router.post("/upload-csv")
async def upload_csv_transactions(
    file: UploadFile = File(...),
    bank_name: Optional[str] = Form("CSV Import"),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a valid .csv format")

    content = await file.read()
    decoded = content.decode("utf-8-sig", errors="ignore")
    io_string = io.StringIO(decoded)
    reader = csv.DictReader(io_string)

    imported_count = 0
    for row in reader:
        # Standardize field keys (case insensitive check)
        keys_lower = {k.lower().strip(): v for k, v in row.items() if k}
        
        merchant = keys_lower.get("merchant") or keys_lower.get("description") or keys_lower.get("payee") or keys_lower.get("details") or "CSV Transaction"
        amount_str = keys_lower.get("amount") or keys_lower.get("value") or "0"
        tx_type = keys_lower.get("type") or keys_lower.get("transaction_type") or "expense"
        category = keys_lower.get("category")
        notes = keys_lower.get("notes") or keys_lower.get("memo") or ""

        try:
            amount = float(re_sub_currency(amount_str))
        except Exception:
            continue

        if tx_type.lower() not in ["income", "expense"]:
            tx_type = "expense" if amount > 0 else "income"
            amount = abs(amount)

        if not category or category == "Miscellaneous":
            category, _, _ = auto_categorize_transaction(merchant, amount, notes)

        tx = Transaction(
            user_id=user_id,
            date=datetime.utcnow(),
            merchant=merchant,
            amount=amount,
            type=tx_type.lower(),
            category=category,
            payment_method="CSV Import",
            notes=notes,
            source="CSV Import",
            bank_account_name=bank_name
        )
        db.add(tx)
        imported_count += 1

    db.commit()
    return {"message": f"Successfully imported {imported_count} transactions from CSV!", "imported_count": imported_count}

def re_sub_currency(val_str: str) -> str:
    return str(val_str).replace("₹", "").replace("$", "").replace(",", "").strip()
