from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

class RegisterInput(BaseModel):
    name: str
    email: str
    password: str

class LoginInput(BaseModel):
    email: str
    password: str

class TransactionCreate(BaseModel):
    title: str
    amount: float
    type: str
    category: str
    date: date
    notes: Optional[str] = None

class TransactionUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    date: Optional[date] = None
    notes: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    title: str
    amount: float
    type: str
    category: str
    date: date
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
    
class BudgetCreate(BaseModel):
    category: str
    monthly_limit: float
    month: int
    year: int

class BudgetResponse(BaseModel):
    id: int
    category: str
    monthly_limit: float
    month: int
    year: int

    class Config:
        from_attributes = True