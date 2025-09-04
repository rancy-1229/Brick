import os


class Settings:
    DATABASE_URL: str = "postgresql+psycopg2://rancy:@localhost:5432/brick_local"
    DEBUG: bool = True


settings = Settings()