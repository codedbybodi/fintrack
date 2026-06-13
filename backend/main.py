from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import date
import calendar
from google import genai
from google.genai import types as genai_types
from db import get_db, engine
from auth import hash_password, verify_password, create_access_token, decode_token
import models, schemas
import os

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FinTrack API", version="1.0.0")

# CORS - allows React frontend to call this API 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https//localhost:5173", "https//localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

gemini_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def  get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try: 
        email = decode_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Auth routes
@app.post("/auth/register", tags=["Auth"])
def register(data: schemas.RegisterInput, db: Session = Depends(get_db)):
    if len(data.password.encode("utf-8"))> 72:
        raise HTTPException(status_code=400, detail="Password must be 72 bytes or shorter")
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Registered!", "user_id": user.id}

@app.post("/auth/login", tags=["Auth"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Wrong credentials")
    return{"access_token": create_access_token({"sub": user.email}), "token_type": "bearer"}

@app.get("/auth/me", tags=["Auth"])
def get_me(current_user: models.User = Depends(get_current_user)):
    return{"id": current_user.id, "name": current_user.name, "email": current_user.email, "currency": current_user.currency}

# Transaction routes
@app.get("/transactions", response_model=List[schemas.TransactionResponse], tags=["Transactions"])
def get_transactions(type: Optional[str] = None, category: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends (get_current_user)):
    query = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id)
    if type:
        query = query.filter(models.Transaction.type == type)
    if category:
        query = query.filter(models.Transaction.type == type)
    return query.order_by(models.Transaction.date.desc()).all()

@app.post("/transactions", response_model=schemas.TransactionResponse, tags=["Transactions"])
def create_transaction(data: schemas.TransactionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    transaction = models.Transaction(user_id=current_user.id, **data.dict())
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction

@app.put("/transactions/{id}", response_model=schemas.TransactionResponse, tags=["Transacions"])
def update_transaction(id: int, data: schemas.TransactionUpdate, db: Session = Depends(get_current_user), current_user: models.User = Depends(get_current_user)):  
    tx = db.query(models.Transaction).filter(models.Transaction.id == id, models.Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(tx, key, value)
    db.commit()
    db.refresh(tx)
    return tx

@app.delete("/transactions/{id}", tags=["Transactions"])
def delete_transaction(id:int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == id, models.Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="not found")
    db.delete(tx)
    db.commit()
    return{"message":"Deleted"}

# Dashboard routes
@app.get("/dashboard/summary", tags=["Dashboard"])
def get_summery(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    transactions = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).all()

    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expenses = sum(t.amount for t in transactions if t.type == "expense")
    balance = total_income - total_expenses

    return{
        "balance": round(balance, 2),
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "transaction_count": len(transactions) 
        }

@app.get("/dashboard/by-category", tags=["Dashboard"])
def get_by_category(db: Session = Depends(get_db), cuurent_user: models.User = Depends(get_current_user)):
    transactions = db.query(models.Transaction).filter(models.Transaction.user_id == cuurent_user.id, models.Transaction.type == "expense").all()

    categories = {}
    for t in transactions:
        categories[t.category] = categories.get(t.category, 0) + t.amount    
    return [{"category": k, "amount": round(v, 2)} for k, v in sorted(categories.items(), key=lambda x: x[1], reverse=True)]

@app.get("/dashboard/monthly", tags=["Dashboard"])
def get_monthly(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    transations = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).all()

    monthly = {}
    for t in transations:
        key = f"{t.date.year}-{t.date.month:02d}"
        if key not in monthly:
            monthly[key] = {"month": key, "income": 0, "expenses": 0}
        if t.type == "income":
            monthly[key]["income"] += t.amount
        else:
            monthly[key]["expenses"] += t.amount
    return sorted(monthly.values(), key=lambda x: x["month"])

# Budget routes
@app.get("/budgets", response_model=List[schemas.BudgetResponse], tags=["Budgets"])
def get_budget(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Budget).filter(models.Budget.user_id == current_user.id).all()

@app.post("/budgets", response_model=schemas.BudgetResponse, tags=["Budgets"])
def create_budget(data: schemas.BudgetCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    budget = models.Budget(user_id=current_user.id, **data.dict())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget

@app.post("/ai/insights", tags=["AI"])
def ai_insights(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    transactions = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).all()

    if not transactions:
        return { "insights": "Add some transactions first to get AI insights!" }
    
    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expense = sum(t.amount for t in transactions if t.type == "expense")
    balance = total_income - total_expense

    categories = {}
    for t in transactions:
        if t.type == "expense":
            categories[t.category] = categories.get(t.category, 0) + t.amount
    
    top_category = max(categories, key=categories.get) if categories else "N/A"

    prompt = f"""You are a personal finance advisor. Analyze this user's fincances and give friendly, specific advice.
 
Financial Summary:
- Total Income: {total_income:,.0f} EGP
- Total Expenses: {total_expense:,.0f} EGP
- Balance: {balance:,.0f} EGP
- Saving Rate: {((balance/total_income)*100):.1f}% of income saved
- Top spending category: {top_category} ({categories.get(top_category, 0):,.0f} EGP)
- Spending by category: {categories}
    
Give exactly 4 insights in this format:
1. A summary of their financial health (1-2 sentences)
2. Their biggest spending pattern and what it means
3. one Spacific actionable saving tip based on their data
4. A postitve encouragement about their progress
     
    Keep it conversational, specific to their numbers, and under 200 words total."""

    response = gemini_client.models.generate_content(model="gemini-3-flash-preview", contents=prompt)

    return {
        "insights" : response.text,
        "summary": {
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
            "saving_rate": round((balance / total_income * 100), 1) if total_income > 0 else 0,
            "top_category": top_category,
            "top_category_amount": categories.get(top_category, 0)
        }
    }