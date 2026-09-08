from contextlib import asynccontextmanager
import logging
import sys
import time
from typing import Any, AsyncGenerator, Dict
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.core.config import get_settings
from app.database.mongodb import db_manager

# ---------------------------------------------------------------------------
# Structured Logging Setup
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("app.main")

settings = get_settings()


# ---------------------------------------------------------------------------
# Application Lifespan (Startup & Shutdown)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and clean database connection shutdown."""
    logger.info("Starting up %s (version: %s)...", settings.PROJECT_NAME, settings.VERSION)
    await db_manager.connect()
    yield
    logger.info("Shutting down %s...", settings.PROJECT_NAME)
    await db_manager.close()


# ---------------------------------------------------------------------------
# FastAPI App Initialization
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Unified REST API for Web & Mobile applications powered by FastAPI and MongoDB.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request Timing & Logging Middleware (Never logs sensitive tokens/passwords)
# ---------------------------------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    path = request.url.path
    method = request.method
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    logger.info("%s %s completed in %.2f ms (Status: %d)", method, path, duration * 1000, response.status_code)
    return response


# ---------------------------------------------------------------------------
# Global Exception Handlers (Standardized Error Envelope)
# ---------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
            "detail": exc.detail,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        errors.append({"location": loc, "message": err.get("msg")})
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Request validation failed.",
            "detail": errors,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled server exception: %s", str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected internal server error occurred.",
            "detail": None,
        },
    )


# ---------------------------------------------------------------------------
# Root and Health Endpoints
# ---------------------------------------------------------------------------
@app.get(
    "/",
    tags=["General"],
    summary="Root greeting and API metadata",
)
async def root() -> Dict[str, Any]:
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "health": "/health",
    }


async def _get_health_status() -> Dict[str, Any]:
    db_health = await db_manager.check_health()
    return {
        "status": "healthy" if db_health["status"] == "connected" else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_health,
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Application and MongoDB Health Status",
)
async def health() -> Dict[str, Any]:
    return await _get_health_status()


@app.get(
    "/api/health",
    tags=["Health"],
    summary="API Health Status (Prefixed)",
)
async def api_health() -> Dict[str, Any]:
    return await _get_health_status()


# ---------------------------------------------------------------------------
# Include API Routers
# ---------------------------------------------------------------------------
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
