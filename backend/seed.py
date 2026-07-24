import os
from datetime import datetime, timedelta
import random

from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.transaction import Transaction
from app.models.bank_account import BankAccount
from app.models.budget import Budget
from app.models.goal import Goal
from app.models.notification import Notification
from app.core.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if demo user exists
    demo_email = "demo@intelliwealth.ai"
    existing_user = db.query(User).filter(User.email == demo_email).first()
    
    if existing_user:
        print("Demo user already exists. Database is seeded.")
        db.close()
        return

    print("Seeding database with demo user & rich financial dataset...")

    # 1. Create Demo User
    user = User(
        name="Utkarsh Sharma",
        email=demo_email,
        hashed_password=get_password_hash("password123"),
        monthly_income=120000.0,
        occupation="Senior AI Engineer",
        risk_preference="Moderate",
        financial_goals="Emergency Fund, Buy Electric SUV, Wealth Growth",
        preferred_currency="INR"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Bank Accounts
    h_acc = BankAccount(
        user_id=user.id,
        bank_name="HDFC Bank",
        account_number_mask="**** 8492",
        account_type="Savings Account",
        balance=185400.0,
        status="Connected",
        auto_sync=True,
        last_synced_at=datetime.utcnow()
    )
    i_acc = BankAccount(
        user_id=user.id,
        bank_name="ICICI Bank",
        account_number_mask="**** 3105",
        account_type="Salary Account",
        balance=94200.0,
        status="Connected",
        auto_sync=True,
        last_synced_at=datetime.utcnow() - timedelta(hours=3)
    )
    db.add_all([h_acc, i_acc])
    db.commit()

    # 3. Budgets
    b1 = Budget(user_id=user.id, category="Food", limit_amount=15000.0, period="Monthly")
    b2 = Budget(user_id=user.id, category="Shopping", limit_amount=12000.0, period="Monthly")
    b3 = Budget(user_id=user.id, category="Travel", limit_amount=8000.0, period="Monthly")
    b4 = Budget(user_id=user.id, category="Bills", limit_amount=10000.0, period="Monthly")
    b5 = Budget(user_id=user.id, category="Entertainment", limit_amount=6000.0, period="Monthly")
    b6 = Budget(user_id=user.id, category="Overall", limit_amount=65000.0, period="Monthly")
    db.add_all([b1, b2, b3, b4, b5, b6])

    # 4. Goals
    g1 = Goal(
        user_id=user.id,
        title="Emergency Safety Fund",
        category="Emergency Fund",
        target_amount=360000.0,
        current_amount=210000.0,
        deadline=datetime.utcnow() + timedelta(days=180)
    )
    g2 = Goal(
        user_id=user.id,
        title="Electric Car Downpayment",
        category="Car",
        target_amount=500000.0,
        current_amount=180000.0,
        deadline=datetime.utcnow() + timedelta(days=365)
    )
    g3 = Goal(
        user_id=user.id,
        title="Japan Vacation 2027",
        category="Vacation",
        target_amount=250000.0,
        current_amount=65000.0,
        deadline=datetime.utcnow() + timedelta(days=240)
    )
    db.add_all([g1, g2, g3])

    # 5. Transactions Dataset across 30 days
    sample_txs = [
        ("Tech Corp Salary Credit", 120000.0, "income", "Salary", "Direct Deposit", "Monthly Salary", "ICICI Bank", 1),
        ("House Rent Payment", 28000.0, "expense", "Rent", "Net Banking", "Apartment rent", "HDFC Bank", 2),
        ("Zomato Gourmet Order", 850.0, "expense", "Food", "UPI", "Dinner with friends", "HDFC Bank", 3),
        ("Swiggy Instamart Groceries", 1420.0, "expense", "Food", "UPI", "Weekly vegetables & essentials", "HDFC Bank", 4),
        ("Amazon Electronics Purchase", 12490.0, "expense", "Shopping", "Credit Card", "Wireless Headphones", "HDFC Bank", 5),
        ("Uber Trip to Airport", 1120.0, "expense", "Travel", "UPI", "Cab to T2 Terminal", "ICICI Bank", 6),
        ("Airtel Fiber Broadband Bill", 1179.0, "expense", "Bills", "Auto-Debit", "1Gbps Unlimited Plan", "HDFC Bank", 7),
        ("Starbucks Coffee", 480.0, "expense", "Food", "Card", "Flat White & Croissant", "HDFC Bank", 8),
        ("Zerodha Monthly SIP Index Fund", 15000.0, "expense", "Investment", "Auto-Debit", "Nifty 50 Index SIP", "ICICI Bank", 9),
        ("HPCL Petrol Pump", 3200.0, "expense", "Fuel", "Credit Card", "Full tank refill", "HDFC Bank", 10),
        ("Netflix 4K Subscription", 649.0, "expense", "Entertainment", "Credit Card", "Monthly Premium Plan", "HDFC Bank", 11),
        ("Spotify Family Plan", 179.0, "expense", "Entertainment", "UPI", "Audio Streaming", "ICICI Bank", 12),
        ("Myntra End of Season Sale", 4850.0, "expense", "Shopping", "Credit Card", "Jackets and sneakers", "HDFC Bank", 13),
        ("BookMyShow Movie Tickets", 920.0, "expense", "Entertainment", "UPI", "IMAX 3D Movies", "HDFC Bank", 14),
        ("Apollo Pharmacy Essentials", 640.0, "expense", "Healthcare", "UPI", "Vitamins & First Aid", "ICICI Bank", 15),
        ("Star Health Insurance Premium", 18500.0, "expense", "Insurance", "Net Banking", "Annual Health Cover", "HDFC Bank", 16),
        ("Freelance AI Consultation", 35000.0, "income", "Salary", "Wire Transfer", "AI Advisory Work", "ICICI Bank", 18),
        ("Blinkit Quick Delivery", 530.0, "expense", "Food", "UPI", "Snacks and beverages", "HDFC Bank", 20),
        ("Bookstore Technical Books", 1450.0, "expense", "Education", "UPI", "System Design & Python Deep Learning", "ICICI Bank", 22),
        ("Electricity Bill TNEB", 2400.0, "expense", "Bills", "Net Banking", "Bi-monthly AC electricity bill", "HDFC Bank", 25)
    ]

    for merch, amt, t_type, cat, pm, notes, b_name, days_ago in sample_txs:
        tx = Transaction(
            user_id=user.id,
            date=datetime.utcnow() - timedelta(days=days_ago),
            merchant=merch,
            amount=amt,
            type=t_type,
            category=cat,
            payment_method=pm,
            notes=notes,
            source="Bank Sync",
            bank_account_name=b_name
        )
        db.add(tx)

    # 6. Notifications
    n1 = Notification(
        user_id=user.id,
        title="Unusual Spending Alert",
        message="Your Shopping expenses reached ₹17,340 this month (35% higher than your average).",
        type="warning",
        is_read="false"
    )
    n2 = Notification(
        user_id=user.id,
        title="Goal Milestone Reached!",
        message="Emergency Fund is now 58% completed. Keep it up!",
        type="success",
        is_read="false"
    )
    n3 = Notification(
        user_id=user.id,
        title="Monthly Budget Summary",
        message="You saved ₹28,400 this month. Health Score updated to 78/100.",
        type="info",
        is_read="true"
    )
    db.add_all([n1, n2, n3])

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
