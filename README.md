# HealerDB

> **Autonomous Self-Healing Database Engine & Health Guard**  
> Continuous data anomaly detection, automated AI root-cause diagnosis, isolated sandbox validation, and transactional production remediation.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.2-DC382D.svg)](https://redis.io/)

---

## ⚡ Overview

Production databases constantly accumulate data corruptions, null leaks, schema contract drift, statistical outliers, and referential integrity breaches. Fixing these typically requires slow manual triage, SQL drafting, testing in ad-hoc environments, and manual execution.

**HealerDB automates the entire loop safely:**
1. **Detects & Profiles**: Inspects tables on-demand or receives real-time webhook telemetry on data test failures.
2. **Diagnoses (AI + RAG)**: Leverages LLM reasoning combined with historical vector knowledge (ChromaDB) to identify precise root causes.
3. **Simulates in Ephemeral Sandbox**: Tests remediation scripts against real data clones in an isolated environment to verify that the fix resolves the violation without side-effects.
4. **Governed Human Approval**: Proposes structured diffs, impacted row counts, and rollback statements via interactive Slack cards and Webhooks.
5. **Applies Transactionally**: Executes validated remedies inside single transactions with post-apply assertions and zero downtime.

---

## 🏗️ Architecture & Pipeline Flow

```mermaid
flowchart TD
    subgraph Data Layer
        TargetDB[(Target Database\nPostgreSQL)]
        DirtyData[Data Outliers / Null Leaks / Uniqueness Breaches]
    end

    subgraph HealerDB Engine
        Profiler[Database Profiler &\nWebhook Gateway]
        StreamBroker[(Redis Event Stream\nhealerdb:events)]
        
        subgraph Autonomous Agents
            Diagnostician[Diagnostic Agent\nLLM + ChromaDB RAG]
            Remediator[Remediation Agent\nTestcontainers Sandbox]
            Executor[Execution Agent\nAtomic Tx + Rollback Safe]
        end
    end

    subgraph Governance & Review
        Operator[Database Admin / Operator]
        SlackBot[Slack Notification & Approval]
    end

    DirtyData -->|Detect Anomalies| Profiler
    Profiler -->|Publish Event| StreamBroker
    StreamBroker --> Diagnostician
    Diagnostician -->|Generate Fix Hypothesis| Remediator
    Remediator -->|Dry-run & Verify Fix| Remediator
    Remediator -->|Submit Proposal| Operator
    Operator -.->|Approve / Reject| SlackBot
    SlackBot --> Executor
    Executor -->|Execute Atomic Remedy| TargetDB
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Docker & Docker Compose
- Python 3.12+ (if running backend locally)
- A Groq API key (for fast LLM diagnosis)

### 2. Configure Environment
Clone the repository and prepare your `.env` file:
```bash
cp .env.example .env
```
Edit `.env` and fill in your `GROQ_API_KEY`. The database parameters default to the local docker environment automatically.

### 3. Launch Services
Start the database and stream broker:
```bash
docker compose up -d
```

### 4. Run HealerDB Backend
Create your virtual environment and run the server:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8001
```

Verify the system status:
```bash
curl http://localhost:8001/health
# {"status":"ok","app":"HealerDB"}

curl http://localhost:8001/api/v1/status
# Returns pipeline status for all autonomous agents
```

---

## 🔍 Instant Database Profiling

Run an autonomous scan against any Postgres database to surface schema and data quality anomalies:
```bash
curl -X POST http://localhost:8001/api/v1/profile \
  -H "Content-Type: application/json" \
  -d '{
    "connection_url": "postgresql://healerdb_user:healerdb_pass@localhost:5433/healerdb",
    "schemas": ["public"]
  }'
```

Sample Response:
```json
{
  "report_id": "3985f3b0-0735-46d9-821c-f94ee35c690e",
  "connection_hint": "localhost:5433/healerdb",
  "status": "completed",
  "tables_scanned": 2,
  "total_anomalies": 6,
  "critical_count": 6,
  "warning_count": 0,
  "duration_ms": 154,
  "message": "Found 6 anomalies across 2 tables (6 critical, 0 warnings)"
}
```

---

## 📁 Repository Structure

```
HealerDB/
├── docker-compose.yml         # Minimal production Docker stack (Postgres + Redis)
├── .env.example               # Clean configuration template
├── scripts/                   # Database seed and test datasets
│   └── seed_dirty_data.sql    # Sandbox test fixtures with realistic anomalies
├── src/
│   ├── main.py                # FastAPI lifecycle, routes, and middleware
│   ├── core/
│   │   ├── settings.py        # Centralized Pydantic application settings
│   │   ├── config.py          # Legacy compatibility bridge
│   │   └── models.py          # Domain data schemas and validation models
│   ├── agents/
│   │   ├── diagnosis.py       # Diagnostic engine (LLM + Vector RAG)
│   │   ├── repair.py          # Sandbox validation & remediation planning
│   │   └── apply.py           # Safe transactional execution & rollback
│   ├── api/                   # REST API endpoints (profiling, proposals, audit)
│   ├── db/                    # Persistent storage (audit log, proposals, vectors)
│   └── services/              # Event bus, stream consumers, and notifications
└── tests/                     # Automated unit and integration tests
```

---

## 🔒 Safety Guarantees
- **No Direct Production Execution Without Sandbox**: Every proposed SQL script is executed against a test container copy before human review.
- **Atomic Operations**: All production remediations execute in an isolated transaction block with automatic rollback if assertions fail.
- **Complete Audit Trail**: Every diagnosis, proposal, simulation result, and execution state is permanently logged in `_healerdb_audit`.

---

## 📄 License
Released under the [MIT License](LICENSE).
