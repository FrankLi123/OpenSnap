from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import database_exists, create_database

from saveit.conf.env import settings
from saveit.db.models import Base

url = settings.DB_CONNECTION

if not database_exists(url):
    create_database(url)
engine = create_engine(url, connect_args={"options": "-c timezone=utc"})
Base.metadata.create_all(bind=engine)  # type: ignore

DBSession = sessionmaker(bind=engine)
