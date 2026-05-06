from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from src.database.connection import engine, init_db
from src.database.schema.schema import Role, RoleEnum
from src.middlewares.auth import AuthMiddleware, ProtectedRoute
from src.middlewares.error import register_exception_handlers
from src.routes.account_router import account_router
from src.routes.auth import auth_router
from src.routes.event_router import event_router
from src.routes.registration_router import registration_router
from src.routes.role_router import role_router
from src.routes.user_router import user_router


def seed_roles() -> None:
    with Session(engine) as db:
        for role_name in RoleEnum:
            existing = db.exec(select(Role).where(Role.name == role_name)).first()
            if not existing:
                db.add(Role(name=role_name))
        db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_roles()
    print("Application is starting up")
    yield
    print("Application is shutting down")


app = FastAPI(title="Acara RSI API", lifespan=lifespan)


# =========================
# CORS CONFIGURATION
# =========================
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


register_exception_handlers(app)


app.add_middleware(
    AuthMiddleware,
    protected_routes=[
        ProtectedRoute("/logout", ["POST"]),
    ],
    admin_routes=[
        ProtectedRoute("/events", ["POST", "PATCH", "DELETE"]),
        ProtectedRoute("/accounts", ["GET", "POST", "PATCH", "DELETE"]),
        ProtectedRoute("/roles", ["GET", "POST", "PUT", "PATCH", "DELETE"]),
        ProtectedRoute("/users", ["GET", "POST", "PUT", "PATCH", "DELETE"]),
        ProtectedRoute("/registrations", ["GET", "PATCH", "DELETE"]),
    ],
)


@app.get("/")
def root():
    return {"message": "API is running 🚀"}


app.include_router(auth_router)
app.include_router(account_router)
app.include_router(event_router)
app.include_router(user_router)
app.include_router(role_router)
app.include_router(registration_router)