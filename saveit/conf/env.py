from pydantic import Field
from dotenv import load_dotenv
from pydantic.v1 import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    ENV: str = Field(default="dev", env="ENV")
    DB_CONNECTION: str = Field(..., env="DB_CONNECTION")


settings = Settings()
