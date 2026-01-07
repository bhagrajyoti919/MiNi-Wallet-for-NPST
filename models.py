from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SetPinRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=6, pattern=r"^\d+$")

class AddMoneyRequest(BaseModel):
    amount: float = Field(..., gt=0)
    pin: str = Field(..., min_length=4, max_length=6, pattern=r"^\d+$")

class TransferRequest(BaseModel):
    toUserId: str
    amount: float = Field(..., gt=0)
    pin: str = Field(..., min_length=4, max_length=6, pattern=r"^\d+$")

class UserUpdateRequest(BaseModel):
    name: str = Field(..., min_length=2)

class TransactionStatusUpdate(BaseModel):
    status: Literal["success", "pending", "failed"]
    reason: Optional[str] = None

class BusinessRulesUpdate(BaseModel):
    maxTransferLimit: float = Field(..., gt=0)
