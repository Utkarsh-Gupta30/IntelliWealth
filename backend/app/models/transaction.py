from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow, index=True)
    merchant = Column(String, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False) # 'income' or 'expense'
    category = Column(String, nullable=False, index=True) # Food, Shopping, Travel, etc.
    payment_method = Column(String, default="UPI/Card") # UPI, Credit Card, Debit Card, Net Banking, Cash
    notes = Column(String, nullable=True)
    source = Column(String, default="Manual") # Bank Sync, CSV Import, Manual
    bank_account_name = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")
