from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AddMoneyRequest(BaseModel):
    amount: float

class TransferRequest(BaseModel):
    toUserId: str
    amount: float

class TransactionStatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = None
