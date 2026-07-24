from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

# --- Auth & User Profile Schemas ---
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    monthly_income: Optional[float] = 75000.0
    occupation: Optional[str] = "Software Engineer"
    risk_preference: Optional[str] = "Moderate"
    financial_goals: Optional[str] = "Emergency Fund, Wealth Growth"
    preferred_currency: Optional[str] = "INR"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    monthly_income: Optional[float] = None
    occupation: Optional[str] = None
    risk_preference: Optional[str] = None
    financial_goals: Optional[str] = None
    preferred_currency: Optional[str] = None

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    monthly_income: float
    occupation: str
    risk_preference: str
    financial_goals: str
    preferred_currency: str
    created_at: datetime

# --- Transaction Schemas ---
class TransactionCreate(BaseModel):
    merchant: str
    amount: float
    type: str # 'income' or 'expense'
    category: Optional[str] = None # If null, AI auto-categorizer is run!
    payment_method: Optional[str] = "UPI/Card"
    notes: Optional[str] = None
    date: Optional[datetime] = None
    source: Optional[str] = "Manual"
    bank_account_name: Optional[str] = None

class TransactionUpdate(BaseModel):
    merchant: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[datetime] = None

class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    date: datetime
    merchant: str
    amount: float
    type: str
    category: str
    payment_method: str
    notes: Optional[str]
    source: str
    bank_account_name: Optional[str]
    created_at: datetime

class AutoCategorizeRequest(BaseModel):
    merchant: str
    amount: float
    notes: Optional[str] = ""

class AutoCategorizeResponse(BaseModel):
    merchant: str
    category: str
    confidence: float
    method_used: str # Rule, ML, LLM

# --- Bank Schemas ---
class BankConnectRequest(BaseModel):
    bank_name: str
    account_type: str = "Savings"
    username: str
    password: str

class BankAccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    bank_name: str
    account_number_mask: str
    account_type: str
    balance: float
    status: str
    auto_sync: bool
    last_synced_at: datetime

# --- Budget Schemas ---
class BudgetCreate(BaseModel):
    category: str
    limit_amount: float
    period: str = "Monthly"

class BudgetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category: str
    limit_amount: float
    period: str
    spent_amount: float
    remaining_amount: float
    percentage_used: float
    status: str # On Track, Warning, Overspent

# --- Goal Schemas ---
class GoalCreate(BaseModel):
    title: str
    category: str = "General"
    target_amount: float
    current_amount: float = 0.0
    deadline: datetime

class GoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    category: str
    target_amount: float
    current_amount: float
    deadline: datetime
    progress_percentage: float
    remaining_amount: float
    suggested_monthly_savings: float
    expected_completion_date: str

# --- Calculator Schemas ---
class LoanCalculateRequest(BaseModel):
    loan_amount: float
    interest_rate: float # Annual rate %
    tenure_months: int

class LoanScheduleItem(BaseModel):
    month: int
    principal_paid: float
    interest_paid: float
    total_payment: float
    remaining_balance: float

class LoanCalculateResponse(BaseModel):
    monthly_emi: float
    total_interest: float
    total_payment: float
    schedule: List[LoanScheduleItem]

# --- Chatbot Schemas ---
class ChatMessageRequest(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    reply: str
    sender: str = "bot"
    timestamp: datetime
    suggested_prompts: Optional[List[str]] = None
