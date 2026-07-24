from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    bank_account_id = Column(Integer, ForeignKey("bank_accounts.id"), nullable=False)
    status = Column(String, nullable=False) # SUCCESS, FAILED
    items_synced = Column(Integer, default=0)
    sync_time = Column(DateTime, default=datetime.utcnow)

    bank_account = relationship("BankAccount", back_populates="sync_logs")
