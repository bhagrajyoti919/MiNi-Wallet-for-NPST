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
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user: dict = Depends(get_current_user)
):
    db = read_db()
    # Find user's wallet
    wallet = next((w for w in db["wallets"] if w["userId"] == user["id"]), None)
    if not wallet:
        return {"total": 0, "page": page, "limit": limit, "data": []}

    transactions = [
        t for t in db["transactions"] 
        if not t.get("isDeleted") and t["walletId"] == wallet["id"]
    ]

    # 1. Status Filter (Case-insensitive)
    if status:
        status_lower = status.value.lower()
        transactions = [t for t in transactions if t["status"].lower() == status_lower]
    
    # 2. Type Filter (Paid, Received, Self transfer)
    if type:
        if type == TransactionType.PAID:
            transactions = [t for t in transactions if t["type"] == "debit"]
        elif type in [TransactionType.RECEIVED, TransactionType.SELF_TRANSFER]:
            # Currently 'credit' covers Add Money (Self transfer/Received)
            transactions = [t for t in transactions if t["type"] == "credit"]
    
    # 3. Amount Filter
    if min_amount is not None:
        transactions = [t for t in transactions if t["amount"] >= min_amount]
    if max_amount is not None:
        transactions = [t for t in transactions if t["amount"] <= max_amount]

    # 4. Date Range Filter
    if start_date:
        transactions = [t for t in transactions if t["createdAt"] >= start_date]
        
    if end_date:
        transactions = [t for t in transactions if t["createdAt"] <= end_date]

    # 5. Search Filter (Name or Description)
    if search:
        search_lower = search.lower()
        users_map = {u["id"]: u["name"] for u in db["users"]}
        filtered_txs = []
        for tx in transactions:
            match = False
            # Check description
            if tx.get("description") and search_lower in tx["description"].lower():
                match = True
            
            # Check name
            if not match:
                other_user_id = tx.get("toUserId") if tx["type"] == "debit" else tx.get("fromUserId")
                if other_user_id:
                     name = users_map.get(other_user_id, "")
                     if search_lower in name.lower():
                         match = True
                elif tx["type"] == "credit": # Wallet Top-up
                     if "wallet top-up" in search_lower or "bank transfer" in search_lower:
                         match = True

            if match:
                filtered_txs.append(tx)
        transactions = filtered_txs

    # Sort by date (newest first)
    transactions.sort(key=lambda x: x["createdAt"], reverse=True)

    # Pagination
    total = len(transactions)
    start = (page - 1) * limit
    end = start + limit
    paginated_data = transactions[start:end]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": paginated_data
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
    # Sort just in case, though db might be append-only
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
