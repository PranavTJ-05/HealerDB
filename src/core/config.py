from pathlib import Path

from dotenv import load_dotenv
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # OpenMetadata
    om_host: str = "http://localhost:8585"
    om_admin_email: str = "admin@open-metadata.org"
    om_admin_password: str = "abcd1234"

    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str = ""
    redis_stream_name: str = "healerdb:events"
    redis_repair_stream: str = "healerdb:repair"
    redis_escalation_stream: str = "healerdb:escalation"
    redis_apply_stream: str = "healerdb:apply"
    redis_consumer_group: str = "healerdb-agents"
    redis_consumer_name: str = "diagnosis-agent-1"

    # App
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    webhook_secret: str = "healerdb_secret_123"
    

    # LLM
    groq_api_key: SecretStr = Field(...)
    llm_model: str = "llama-3.3-70b-versatile"
    llm_max_tokens: int = 4096

    # ChromaDB
    chroma_persist_dir: str = "./data/chromadb"
    chroma_collection: str = "healerdb_fixes"

    # Diagnosis
    confidence_threshold: float = 0.70

    # Target database
    target_db_host: str = "localhost"
    target_db_port: int = 5433
    target_db_name: str = "healerdb"
    target_db_user: str = "healerdb_user"
    target_db_password: str = "healerdb_pass"

    # Sandbox
    sandbox_max_retries: int = 3
    sandbox_sample_rows: int = 500
    sandbox_timeout_seconds: int = 60
    sandbox_diff_rows: int = 20

    # Apply
    dry_run: bool = True
    apply_statement_timeout_ms: int = 30000
    post_apply_verify: bool = True

    # Slack Bot
    slack_bot_token: str = ""
    slack_app_token: str = ""
    slack_ops_channel: str = "healerdb-ops"
    healerdb_base_url: str = "http://localhost:8001"
    
settings = Settings()
