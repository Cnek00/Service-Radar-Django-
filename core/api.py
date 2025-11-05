# core/api.py
from ninja import Router

router = Router()

@router.get("/status")
def status(request):
    """API durum kontrolü için basit endpoint"""
    return {"status": "ok", "message": "ServiceRadar API is running!"}