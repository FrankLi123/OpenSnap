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


class WebPage(Base):  # type: ignore
    __tablename__ = "web_pages"
    id = Column(Integer, primary_key=True)
    uid = Column(String, nullable=False)
    url = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class MHTMLContent(Base):
    __tablename__ = "mhtml_contents"

    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String, index=True)
    filename = Column(String, index=True)
    content = Column(Text)