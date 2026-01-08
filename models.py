from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SetPinRequest(BaseModel):
    pin: str

class AddMoneyRequest(BaseModel):
    amount: float
    pin: str

class TransferRequest(BaseModel):
    toUserId: str
    amount: float
    pin: str

class UserUpdateRequest(BaseModel):
    name: str

class TransactionStatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = None

class BusinessRulesUpdate(BaseModel):
    maxTransferLimit: float
