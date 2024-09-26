from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
)
from sqlalchemy import DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()  # type: ignore


class Snapshot(Base):  # type: ignore
    __tablename__ = "snapshots"
    id = Column(Integer, primary_key=True)
    uid = Column(String, nullable=False)
    url = Column(String, nullable=False)
    ipfs_hash = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


