from fastapi import APIRouter, Query, Depends
from typing import Optional
from enum import Enum
from db import read_db, write_db
from models import TransactionStatusUpdate
from dependencies import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])

class TransactionStatus(str, Enum):
    SUCCESSFUL = "success"
    PENDING = "pending"
    FAILED = "failed"

class TransactionType(str, Enum):
    PAID = "Paid"
    RECEIVED = "Received"
    SELF_TRANSFER = "Self transfer"

@router.get("")
def get_transactions(
    status: Optional[TransactionStatus] = None,
    type: Optional[TransactionType] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    db = read_db()
    wallet = next((w for w in db["wallets"] if w["userId"] == user["id"]), None)
    if not wallet:
        return {"total": 0, "data": []}

    transactions = [
        t for t in db["transactions"] 
        if not t.get("isDeleted") and t["walletId"] == wallet["id"]
    ]

    if status:
        status_lower = status.value.lower()
        transactions = [t for t in transactions if t["status"].lower() == status_lower]
    
    if type:
        if type == TransactionType.PAID:
            transactions = [t for t in transactions if t["type"] == "debit"]
        elif type in [TransactionType.RECEIVED, TransactionType.SELF_TRANSFER]:
            transactions = [t for t in transactions if t["type"] == "credit"]
    
    if min_amount is not None:
        transactions = [t for t in transactions if t["amount"] >= min_amount]
    if max_amount is not None:
        transactions = [t for t in transactions if t["amount"] <= max_amount]

    if start_date:
        transactions = [t for t in transactions if t["createdAt"] >= start_date]
        
    if end_date:
        transactions = [t for t in transactions if t["createdAt"] <= end_date]

    transactions.sort(key=lambda x: x["createdAt"], reverse=True)

    return {
        "total": len(transactions),
        "data": transactions
    }

@router.get("/recent")
def recent_transactions(user: dict = Depends(get_current_user)):
    db = read_db()
    wallet = next((w for w in db["wallets"] if w["userId"] == user["id"]), None)
    if not wallet:
        return []
        
    user_txs = [
        t for t in db["transactions"] 
        if not t.get("isDeleted") and t["walletId"] == wallet["id"]
    ]
    user_txs.sort(key=lambda x: x["createdAt"], reverse=True)
    
    return user_txs[:10]

@router.patch("/{tx_id}/status")
def update_status(tx_id: str, payload: TransactionStatusUpdate):
    db = read_db()
    for tx in db["transactions"]:
        if tx["id"] == tx_id:
            tx["status"] = payload.status
            if payload.reason:
                tx["reason"] = payload.reason
            write_db(db)
            return tx
    return {"error": "Transaction not found"}

@router.delete("/{tx_id}")
def delete_transaction(tx_id: str):
    db = read_db()
    for i, tx in enumerate(db["transactions"]):
        if tx["id"] == tx_id:
            db["transactions"].pop(i)
            write_db(db)
            return {"message": "Transaction deleted permanently"}
    return {"error": "Transaction not found"}
