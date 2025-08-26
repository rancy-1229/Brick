import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://rancy:@localhost:5432/brick_local"

    class Config:
        env_file = ".env"


settings = Settings()