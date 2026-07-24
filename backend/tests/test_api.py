import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "IntelliWealth" in response.json()["message"]

def test_user_registration_and_login():
    random_str = str(uuid.uuid4())[:8]
    email = f"test_{random_str}@intelliwealth.ai"
    # Register
    reg_res = client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": email,
        "password": "testpassword123",
        "monthly_income": 90000.0,
        "occupation": "AI Researcher",
        "risk_preference": "Moderate",
        "financial_goals": "Emergency Fund",
        "preferred_currency": "INR"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    assert token is not None

    # Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "testpassword123"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

def test_auto_categorization():
    res = client.post("/api/v1/transactions/auto-categorize", json={
        "merchant": "Swiggy Instamart Groceries",
        "amount": 450.0
    })
    assert res.status_code == 200
    assert res.json()["category"] == "Food"

def test_loan_calculator():
    res = client.post("/api/v1/calculator/loan-emi", json={
        "loan_amount": 500000.0,
        "interest_rate": 8.5,
        "tenure_months": 60
    })
    assert res.status_code == 200
    assert res.json()["monthly_emi"] > 0
    assert len(res.json()["schedule"]) > 0

def test_education_topics():
    res = client.get("/api/v1/education/topics")
    assert res.status_code == 200
    assert len(res.json()) >= 5
