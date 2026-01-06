import uuid
from datetime import datetime

def generate_id(prefix: str):
    return f"{prefix}_{uuid.uuid4().hex[:8]}"

def now():
    return datetime.utcnow().isoformat() + "Z"
