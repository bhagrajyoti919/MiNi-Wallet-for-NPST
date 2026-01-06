from fastapi import APIRouter
from db import read_db

router = APIRouter(prefix="/config", tags=["Config"])

@router.get("/business-rules")
def get_rules():
    return read_db()["businessRules"]
