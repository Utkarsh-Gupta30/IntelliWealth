from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.db.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.core.security import get_current_user_id

router = APIRouter(prefix="/education", tags=["Investment Education"])

EDUCATION_TOPICS = [
    {
        "id": "sip",
        "title": "SIP (Systematic Investment Plan)",
        "category": "Mutual Funds",
        "definition": "A Systematic Investment Plan allows you to invest a fixed sum regularly in a mutual fund scheme, promoting rupee-cost averaging.",
        "benefits": ["Disciplined investing habit", "Rupee-cost averaging", "Power of compounding over 5+ years", "Flexibility starting from ₹500/month"],
        "risks": ["Market volatility in short term", "Equity funds can fluctuate"],
        "examples": "Investing ₹5,000/month in Nifty 50 Index Fund for 10 years at assumed 12% CAGR yields ~₹11.6 Lakhs.",
        "beginner_tips": "Start early, choose index funds with low expense ratios, and never stop SIPs during market downturns.",
        "faqs": [
            {"q": "Can I stop a SIP anytime?", "a": "Yes, SIPs are flexible and carry no lock-in unless under ELSS tax saving funds."},
            {"q": "What is the best frequency?", "a": "Monthly SIPs align best with salaried income cycles."}
        ]
    },
    {
        "id": "mutual-funds",
        "title": "Mutual Funds",
        "category": "Pooled Investment",
        "definition": "A pool of money collected from many investors to invest in securities like stocks, bonds, and short-term debt.",
        "benefits": ["Professional fund management", "Instant diversification", "High liquidity", "Regulated by SEBI"],
        "risks": ["Expense ratio costs", "No guaranteed returns"],
        "examples": "Large-Cap Funds, Flexi-Cap Funds, Debt Funds, Liquid Funds.",
        "beginner_tips": "Diversify across 2-3 well-established funds with proven track records.",
        "faqs": [
            {"q": "Direct vs Regular Fund?", "a": "Direct funds have lower expense ratios, resulting in higher returns long-term."}
        ]
    },
    {
        "id": "stocks",
        "title": "Direct Equities & Stocks",
        "category": "Equity",
        "definition": "Buying fractional ownership in publicly listed companies traded on stock exchanges.",
        "benefits": ["Potential for multibagger returns", "Dividend income", "Voting rights"],
        "risks": ["High volatility", "Company default risk", "Requires active research"],
        "examples": "Reliance Industries, Tata Consultancy Services, Apple, Microsoft.",
        "beginner_tips": "Understand company fundamentals before investing. Don't trade on unverified tips.",
        "faqs": [
            {"q": "How to start?", "a": "Open a Demat account with a discount broker like Zerodha or Groww."}
        ]
    },
    {
        "id": "etf",
        "title": "ETFs (Exchange Traded Funds)",
        "category": "Passive Indexing",
        "definition": "Funds that track an index (like Nifty 50 or S&P 500) and trade on stock exchanges just like individual shares.",
        "benefits": ["Ultra-low expense ratio (< 0.1%)", "Real-time trading during market hours", "Instant broad market exposure"],
        "risks": ["Tracking error", "Brokerage transaction costs"],
        "examples": "Nifty BeES, JuniorBeES, Gold ETF, Nasdaq 100 ETF.",
        "beginner_tips": "Index ETFs are ideal for long-term passive investors aiming for market-average growth.",
        "faqs": [
            {"q": "Is Demat required for ETF?", "a": "Yes, ETFs trade directly via Demat & Trading accounts."}
        ]
    },
    {
        "id": "emergency-fund",
        "title": "Emergency Fund Setup",
        "category": "Risk Management",
        "definition": "A cash reserve set aside strictly for unexpected life events, such as job loss, medical emergencies, or home repairs.",
        "benefits": ["Financial safety net", "Prevents high-interest debt", "Peace of mind"],
        "risks": ["Opportunity cost if kept in zero-interest cash"],
        "examples": "Maintain 6 months of expenses in a high-yield savings account or liquid mutual fund.",
        "beginner_tips": "Keep it separate from your regular checking account so you aren't tempted to spend it.",
        "faqs": [
            {"q": "Where to store Emergency Fund?", "a": "High-yield savings accounts or Instant-Redemption Liquid Mutual Funds."}
        ]
    },
    {
        "id": "tax-saving",
        "title": "Tax Saving (Section 80C & ELSS)",
        "category": "Tax Planning",
        "definition": "Instruments specified under tax laws (e.g. 80C in India) allowing deduction up to ₹1.5 Lakhs per year.",
        "benefits": ["Immediate tax reduction", "ELSS has shortest lock-in (3 years)", "Wealth creation"],
        "risks": ["3-year lock-in period for ELSS"],
        "examples": "ELSS Mutual Funds, PPF, NPS, Tax Saver FDs.",
        "beginner_tips": "ELSS offers the best growth potential among 80C options due to equity exposure.",
        "faqs": [
            {"q": "What is ELSS lock-in?", "a": "Each SIP installment in ELSS is locked for exactly 36 months."}
        ]
    }
]

@router.get("/topics")
def get_investment_topics():
    return EDUCATION_TOPICS

@router.get("/ai-suggestion")
def get_ai_investment_suggestion(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()

    income = user.monthly_income if user else 75000.0
    total_expense = sum(t.amount for t in transactions if t.type == "expense")
    savings = max(0.0, income - total_expense)

    risk_pref = user.risk_preference if user else "Moderate"
    currency = user.preferred_currency if user else "INR"
    symbol = "₹" if currency == "INR" else "$"

    # AI Educational Allocation Strategy
    emergency_target = total_expense * 6 if total_expense > 0 else 150000.0
    suggested_sip = savings * 0.50 if savings > 5000 else 3000.0

    advice_steps = [
        f"You currently generate approx {symbol}{savings:,.2f}/month in net surplus savings.",
        f"First Priority: Ensure your 6-Month Emergency Fund target ({symbol}{emergency_target:,.2f}) is funded.",
        f"For learning purposes with a **{risk_pref}** risk profile, consider allocating {symbol}{suggested_sip:,.2f}/month towards low-cost Nifty 50 / Index ETFs.",
        "Maintain disciplined monthly SIPs and avoid market timing."
    ]

    return {
        "user_income": income,
        "current_monthly_savings": savings,
        "risk_preference": risk_pref,
        "educational_advice": advice_steps,
        "suggested_learning_sip": round(suggested_sip, 2),
        "disclaimer": "This information is generated for educational & financial literacy purposes only and does not constitute personalized investment advice."
    }
