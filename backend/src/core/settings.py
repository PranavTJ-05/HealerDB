from pathlib import Path
from dotenv import load_dotenv
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
ROOT_DIR = BACKEND_DIR.parent
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")


class AppSettings(BaseSettings):
    """
    Core runtime settings for HealerDB.
    All operational parameters feature robust production defaults,
    requiring only database and LLM credentials from the environment.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── LLM Engine (Required) ────────────────────────────────────────────────
    groq_api_key: SecretStr = Field(default=SecretStr(""), description="Groq API key for autonomous diagnosis")
    llm_model: str = "llama-3.3-70b-versatile"
    llm_max_tokens: int = 4096

    # ── Target Monitored Database ────────────────────────────────────────────
    target_db_host: str = "localhost"
    target_db_port: int = 5433
    target_db_name: str = "healerdb"
    target_db_user: str = "healerdb_user"
    target_db_password: str = "healerdb_pass"

    # ── Application Server ───────────────────────────────────────────────────
    app_host: str = "0.0.0.0"
    app_port: int = 8001
    webhook_secret: str = "healerdb_secret_123"
    healerdb_base_url: str = "http://localhost:8001"

    # ── Event Broker & Pipeline Streams ──────────────────────────────────────
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str = ""
    redis_stream_name: str = "healerdb:events"
    redis_repair_stream: str = "healerdb:repair"
    redis_escalation_stream: str = "healerdb:escalation"
    redis_apply_stream: str = "healerdb:apply"
    redis_consumer_group: str = "healerdb-agents"
    redis_consumer_name: str = "diagnosis-agent-1"

    # ── Knowledge Base (RAG) ─────────────────────────────────────────────────
    chroma_persist_dir: str = "./data/chromadb"
    chroma_collection: str = "healerdb_fixes"

    # ── Autonomous Decision Parameters ───────────────────────────────────────
    confidence_threshold: float = 0.70

    # ── Ephemeral Sandbox Testing ────────────────────────────────────────────
    sandbox_max_retries: int = 3
    sandbox_sample_rows: int = 500
    sandbox_timeout_seconds: int = 60
    sandbox_diff_rows: int = 20

    # ── Safe Execution & Verification ────────────────────────────────────────
    dry_run: bool = True
    apply_statement_timeout_ms: int = 30000
    post_apply_verify: bool = True

    # ── Optional Integrations ────────────────────────────────────────────────
    om_host: str = "http://localhost:8585"
    om_admin_email: str = "admin@open-metadata.org"
    om_admin_password: str = "abcd1234"

    slack_bot_token: str = ""
    slack_app_token: str = ""
    slack_ops_channel: str = "healerdb-ops"


# Global singleton instance
settings = AppSettings()
