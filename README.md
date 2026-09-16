# HealerDB

> **Autonomous Self-Healing Database Engine & Developer Studio**  
> Continuous data anomaly detection · AI root-cause diagnosis · Isolated sandbox validation · Transactional production remediation · VS Code-themed monitoring console.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.2-DC382D.svg)](https://redis.io/)

---

## ⚡ Overview

Production databases constantly accumulate data corruptions, null leaks, schema contract drift, statistical outliers, and referential integrity breaches. Fixing these typically requires slow manual triage, SQL drafting, testing in ad-hoc environments, and manual execution.

**HealerDB automates the entire loop safely:**
1. **Detects & Profiles** — Inspects tables on-demand or receives real-time webhook telemetry on data-test failures.
2. **Diagnoses (AI + RAG)** — Leverages LLM reasoning combined with historical vector knowledge (ChromaDB) to identify precise root causes.
3. **Simulates in Ephemeral Sandbox** — Tests remediation scripts against real data clones in an isolated Testcontainers environment.
4. **Governed Human Approval** — Proposes structured SQL diffs with impacted row counts, risk level, and rollback statements via the Studio UI.
5. **Applies Transactionally** — Executes validated remedies inside single transactions with post-apply assertions and zero downtime.

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

        Studio[VS Code Studio\nNext.js 15 Frontend]
    end

    subgraph Governance & Review
        Operator[Database Admin / Operator]
    end

    DirtyData -->|Detect Anomalies| Profiler
    Profiler -->|Publish Event| StreamBroker
    StreamBroker --> Diagnostician
    Diagnostician -->|Generate Fix Hypothesis| Remediator
    Remediator -->|Dry-run & Verify Fix| Remediator
    Remediator -->|Submit Proposal| Studio
    Studio -->|Approve / Reject| Operator
    Operator --> Executor
    Executor -->|Execute Atomic Remedy| TargetDB
    Studio -->|Live Telemetry| Profiler
```

---

## 📁 Monorepo Structure

```
HealerDB/
├── docker-compose.yml          # Postgres 16 + Redis 7.2 stack
├── .env.example                # Configuration template
├── README.md                   # This file
├── CONTRIBUTING.md             # Development guide
│
├── backend/                    # FastAPI autonomous healing engine
│   ├── src/
│   │   ├── main.py             # FastAPI app, lifecycle, middleware
│   │   ├── core/
│   │   │   ├── settings.py     # Pydantic settings (env-loaded)
│   │   │   └── models.py       # Domain schemas
│   │   ├── agents/
│   │   │   ├── diagnosis.py    # LLM + Vector RAG diagnostic engine
│   │   │   ├── repair.py       # Sandbox validation & remediation planning
│   │   │   └── apply.py        # Atomic transactional executor
│   │   ├── api/                # REST endpoints (profiling, proposals, audit)
│   │   ├── db/                 # Persistent storage (audit, proposals, vectors)
│   │   └── services/           # Event bus, stream consumers, notifications
│   ├── scripts/
│   │   └── seed_dirty_data.sql # Realistic dirty-data test fixtures
│   └── requirements.txt
│
└── frontend/                   # VS Code-themed Next.js 15 Studio
    ├── app/
    │   ├── dashboard/          # System health & telemetry dashboard
    │   ├── profiler/           # Statistical column profiler + anomaly inspector
    │   ├── proposals/          # SQL diff viewer + approve/reject workflow
    │   ├── connections/        # Database connection manager
    │   ├── audit/              # Immutable repair history
    │   └── settings/           # Studio configuration viewer
    ├── components/
    │   ├── layout/             # ActivityBar, Sidebar, EditorTabs, StatusBar
    │   ├── dashboard/          # StatGrid, PipelineStream, AgentActivity
    │   ├── profiler/           # ProfilerTable, AnomalyTable
    │   ├── proposals/          # ProposalList (with SQL diff viewer)
    │   ├── connections/        # ConnectionModal, SchemaViewer, TelemetryCard
    │   └── audit/              # AuditLogTable
    └── lib/
        ├── api.ts              # Typed backend API client
        ├── query-provider.tsx  # React Query provider (10 s auto-refresh)
        └── utils.ts            # Shared utilities
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Docker & Docker Compose
- Python 3.12+ (backend)
- Node.js 20+ (frontend)
- A Groq API key

### 2. Configure Environment

```bash
git clone https://github.com/PranavTJ-05/HealerDB.git
cd HealerDB
cp .env.example .env
# Edit .env and set GROQ_API_KEY
```

### 3. Launch Infrastructure

```bash
docker compose up -d
# Starts Postgres :5433 and Redis :6379
```

### 4. Start the Backend

```bash
cd backend
python3 -m venv ../.venv
source ../.venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

Verify:
```bash
curl http://localhost:8001/health
# {"status":"ok","app":"HealerDB"}
```

### 5. Start the Frontend Studio

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

---

## 🖥️ Studio Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Live KPI metrics, 5-stage pipeline status, agent activity stream |
| `/profiler` | Statistical column profiles (null %, distinct, mean/stddev) + anomaly table |
| `/proposals` | AI-generated SQL repair diffs — review, expand, approve, or reject |
| `/connections` | Manage monitored database connections and inspect live schema |
| `/audit` | Immutable timestamped repair history with rollback availability |
| `/settings` | Read-only studio configuration (DB, Redis, LLM, execution policy) |

---

## 🔍 API Quick Reference

```bash
# Profiling
curl -X POST http://localhost:8001/api/v1/profile \
  -H "Content-Type: application/json" \
  -d '{"connection_url": "postgresql://healerdb_user:healerdb_pass@localhost:5433/healerdb", "schemas": ["public"]}'

# Dashboard summary
curl http://localhost:8001/health/summary

# Anomalies
curl http://localhost:8001/anomalies

# Proposals
curl http://localhost:8001/proposals

# Audit log
curl http://localhost:8001/audit
```

---

## 🔒 Safety Guarantees

- **No Direct Production Execution Without Sandbox** — Every proposed SQL script is executed against a test container copy before human review.
- **Atomic Operations** — All production remediations execute in an isolated transaction block with automatic rollback if assertions fail.
- **Complete Audit Trail** — Every diagnosis, proposal, simulation result, and execution state is permanently logged.
- **Dry-Run Default** — New deployments start in dry-run mode; no production changes until explicitly enabled.

---

## 📄 License
Released under the [MIT License](LICENSE).
