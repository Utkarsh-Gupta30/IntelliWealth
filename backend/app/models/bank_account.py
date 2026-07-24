from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bank_name = Column(String, nullable=False) # e.g. HDFC Bank, ICICI Bank, SBI, Chase
    account_number_mask = Column(String, nullable=False) # e.g. **** 4892
    account_type = Column(String, default="Savings") # Savings, Checking, Credit Card
    balance = Column(Float, default=0.0)
    status = Column(String, default="Connected") # Connected, Syncing, Disconnected
    auto_sync = Column(Boolean, default=True)
    last_synced_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bank_accounts")
    sync_logs = relationship("SyncLog", back_populates="bank_account", cascade="all, delete-orphan")
