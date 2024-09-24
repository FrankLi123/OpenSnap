from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
)
from sqlalchemy import DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()  # type: ignore


class WebPage(Base):  # type: ignore
    __tablename__ = "web_pages"
    id = Column(Integer, primary_key=True)
    uid = Column(String, nullable=False)
    url = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
