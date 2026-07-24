from fastapi import APIRouter
from typing import Dict, Any, List
from app.schemas.schemas import LoanCalculateRequest, LoanCalculateResponse, LoanScheduleItem

router = APIRouter(prefix="/calculator", tags=["EMI & Loan Calculator"])

@router.post("/loan-emi", response_model=LoanCalculateResponse)
def calculate_loan_emi(req: LoanCalculateRequest) -> LoanCalculateResponse:
    P = req.loan_amount
    annual_rate = req.interest_rate
    r = (annual_rate / 12) / 100 # Monthly interest rate
    n = req.tenure_months

    if r > 0:
        emi = P * r * ((1 + r) ** n) / (((1 + r) ** n) - 1)
    else:
        emi = P / n

    total_payment = emi * n
    total_interest = total_payment - P

    schedule = []
    balance = P
    for month in range(1, min(n + 1, 361)): # Cap schedule view to 360 months
        interest_paid = balance * r
        principal_paid = emi - interest_paid
        balance = max(0.0, balance - principal_paid)

        schedule.append(LoanScheduleItem(
            month=month,
            principal_paid=round(principal_paid, 2),
            interest_paid=round(interest_paid, 2),
            total_payment=round(emi, 2),
            remaining_balance=round(balance, 2)
        ))

    return LoanCalculateResponse(
        monthly_emi=round(emi, 2),
        total_interest=round(total_interest, 2),
        total_payment=round(total_payment, 2),
        schedule=schedule
    )
