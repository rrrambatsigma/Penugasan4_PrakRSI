from sqlmodel import SQLModel, Session, create_engine
import os
from dotenv import load_dotenv

# 1. Panggil fungsi untuk membaca file .env
load_dotenv()

# 2. Ambil URL dari environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
# 3. Validasi (Biar tidak error NoneType)
if not DATABASE_URL:
    raise ValueError("DATABASE_URL tidak ditemukan di file .env! Pastikan file .env ada di root folder.")

engine = create_engine(DATABASE_URL)

def init_db():
    SQLModel.metadata.create_all(engine)

# Dependency session untuk router/service
def get_session():
    with Session(engine) as session:  # pakai sqlmodel.Session
        yield session

# Fungsi buat bikin semua tabel (dipanggil sekali)
def init_db():
    from src.database.schema.schema import User
    # dari sini nanti bisa ditambah model lain misal Role, Account, dll
    SQLModel.metadata.create_all(engine)