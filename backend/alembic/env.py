import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Import SQLModel
from sqlmodel import SQLModel

# --- BAGIAN KRUSIAL: IMPORT MODEL ---
# Kita harus mengimport schema agar SQLModel.metadata terisi dengan definisi tabel
# ------------------------------------
from src.database.schema.schema import RoleEnum, User, Account

# Objek Config Alembic, yang menyediakan akses ke nilai dalam file .ini.
config = context.config

# Interpretasi file config untuk logging Python.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Tambahkan objek MetaData model di sini untuk dukungan 'autogenerate'
target_metadata = SQLModel.metadata

def run_migrations_offline() -> None:
    """Jalankan migrasi dalam mode 'offline'."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Jalankan migrasi dalam mode 'online'."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()