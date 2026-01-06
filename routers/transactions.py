from fastapi import APIRouter, Query, Depends
from typing import Optional
from db import read_db, write_db
from models import TransactionStatusUpdate
from dependencies import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("")
def get_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
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

    if status:
        transactions = [t for t in transactions if t["status"] == status]
    
    if start_date:
        transactions = [t for t in transactions if t["createdAt"] >= start_date]
        
    if end_date:
        transactions = [t for t in transactions if t["createdAt"] <= end_date]

    # Sort by date (newest first)
    transactions.sort(key=lambda x: x["createdAt"], reverse=True)

    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    paginated_data = transactions[start_idx:end_idx]

    return {
        "total": len(transactions),
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
    for tx in db["transactions"]:
        if tx["id"] == tx_id:
            tx["isDeleted"] = True
            write_db(db)
            return {"message": "Transaction deleted"}
    return {"error": "Transaction not found"}
