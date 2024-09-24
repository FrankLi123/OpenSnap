from pydantic import Field, BaseSettings

from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    ENV: str = Field(default="dev", env="ENV")
    DB_CONNECTION: str = Field(..., env="DB_CONNECTION")


settings = Settings()
