from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.schemas import UserRegister, UserLogin, Token, UserOut, UserUpdate
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user_id

router = APIRouter(prefix="/auth", tags=["Authentication & Profile"])

@router.post("/register", response_model=Token)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email is already registered")
        
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_pwd,
        monthly_income=user_in.monthly_income,
        occupation=user_in.occupation,
        risk_preference=user_in.risk_preference,
        financial_goals=user_in.financial_goals,
        preferred_currency=user_in.preferred_currency
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
def login_user(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    access_token = create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserOut)
def get_current_user_profile(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/profile", response_model=UserOut)
def update_profile(profile_in: UserUpdate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if profile_in.name is not None:
        user.name = profile_in.name
    if profile_in.monthly_income is not None:
        user.monthly_income = profile_in.monthly_income
    if profile_in.occupation is not None:
        user.occupation = profile_in.occupation
    if profile_in.risk_preference is not None:
        user.risk_preference = profile_in.risk_preference
    if profile_in.financial_goals is not None:
        user.financial_goals = profile_in.financial_goals
    if profile_in.preferred_currency is not None:
        user.preferred_currency = profile_in.preferred_currency
        
    db.commit()
    db.refresh(user)
    return user
