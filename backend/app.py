"""
ScamShield AI - Master FastAPI Application Server
Provides secure REST API endpoints for multi-modal scam detection, authentication,
threat intelligence, and reporting.
"""
import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.database.db import init_db
from backend.routes.auth import router as auth_router
from backend.routes.analysis import router as analysis_router
from backend.routes.history import router as history_router
from backend.routes.reports import router as reports_router
from backend.routes.extension import router as extension_router

app = FastAPI(
    title="ScamShield AI API",
    description="Enterprise Scam and Phishing Detection Platform API",
    version="1.0.0"
)

# CORS configuration for development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    print("[ScamShield AI] Database and threat intelligence initialized successfully.")

# Include sub-routers
app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(history_router)
app.include_router(reports_router)
app.include_router(extension_router)

@app.get("/api/health")
def healthcheck():
    return {
        "status": "operational",
        "service": "ScamShield AI Detection Engine",
        "version": "1.0.0",
        "disclaimer": "AI predictions are advisory and should not be treated as absolute proof."
    }

# Safe error handling: never leak raw Python stack traces to clients
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "message": exc.detail}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log securely server-side
    print(f"[ScamShield Error] {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": True, "message": "An internal analysis error occurred. Please verify your input and try again."}
    )

# Static files if frontend build exists
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
