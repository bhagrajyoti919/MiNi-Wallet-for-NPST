from fastapi import APIRouter
from db import read_db, write_db
from models import BusinessRulesUpdate

router = APIRouter(prefix="/config", tags=["Config"])

@router.get("/business-rules")
def get_rules():
    return read_db()["businessRules"]

@router.put("/business-rules")
def update_rules(rules: BusinessRulesUpdate):
    db = read_db()
    current_rules = db.get("businessRules", {})
    # Update only the provided fields
    current_rules["maxTransferLimit"] = rules.maxTransferLimit
    db["businessRules"] = current_rules
    write_db(db)
    return current_rules
