from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    currency = Column(String, default="EGP")
    created_at = Column(DateTime, default=func.now())
    
    transactions = relationship("Transaction", back_populates="user")
    budgets = relationship("Budget", back_populates="user")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    user = relationship("User", back_populates="transactions")
    
class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    monthly_limit = Column(Float, nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now())
    user = relationship("User", back_populates="budgets")
