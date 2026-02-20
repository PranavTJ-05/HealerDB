# HealerDB — Architecture Reference

> **Version:** 0.4.0  
> **Audience:** Backend engineers, frontend engineers, technical reviewers  
> **Last verified:** April 25, 2026 — full pipeline tested against Northwind database  
> **Status:** Production-ready

---

## Table of Contents

1. [Motivation](#1-motivation)
2. [Tech Stack](#2-tech-stack)
3. [Infrastructure (Docker Compose)](#3-infrastructure-docker-compose)
4. [Project Structure](#4-project-structure)
5. [Design Patterns](#5-design-patterns)
6. [Target Database — Northwind](#6-target-database--northwind)
7. [Internal Postgres Tables](#7-internal-postgres-tables)
8. [Redis Streams](#8-redis-streams)
9. [ChromaDB Knowledge Base](#9-chromadb-knowledge-base)
10. [Full Pipeline Flow](#10-full-pipeline-flow)
11. [Business Logic](#11-business-logic)
12. [API Reference](#12-api-reference)
13. [Environment Variables](#13-environment-variables)
14. [Boot Sequence](#14-boot-sequence)
15. [Known Gaps and Constraints](#15-known-gaps-and-constraints)
16. [Verified Pipeline Run](#16-verified-pipeline-run)
17. [Changelog](#17-changelog)

---

## 1. Motivation

HealerDB is an **autonomous database health monitoring and self-healing system**. Production databases accumulate data quality failures — NULL violations, range violations, uniqueness violations, referential integrity failures, and format violations — that are detected by monitoring tools (OpenMetadata) but require manual intervention to fix.

HealerDB closes this loop by:

1. **Receiving** test failure events from OpenMetadata via webhook
2. **Classifying** failures using a rule-based detector
3. **Diagnosing** root cause using Gemini 2.5 Pro with RAG from a ChromaDB knowledge base
4. **Previewing** the fix safely in an ephemeral sandbox (testcontainers Postgres)
5. **Proposing** the fix to a human operator for approval
6. **Executing** the approved fix on production with post-apply verification
7. **Auditing** every outcome — applied, dry run, rolled back, or escalated

The system is **safe-first**: every fix is sandbox-tested before a human sees it, and every production apply runs inside an explicit transaction with post-apply assertions and automatic rollback on failure.

---

## 2. Tech Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Backend framework | FastAPI | 0.115.0 |
| ASGI server | Uvicorn | 0.30.6 with `standard` extras |
| Language | Python | 3.12 |
| Target database driver | asyncpg | 0.30.0 (async) |
| Target database ORM | SQLAlchemy | 2.0.36 async |
| Sync DB driver (sandbox) | psycopg2-binary | 2.9.10 |
| Data validation | Pydantic | 2.7.0 |
| Settings management | pydantic-settings | 2.3.0 |
| HTTP client | httpx | 0.27.0 |
| Message broker | Redis Streams | via redis-py 5.0.7 |
| LLM provider | Google Gemini | `google-generativeai`, model: `gemini-2.5-pro` |
| Vector store | ChromaDB | 0.5.0 |
| Embedding model | sentence-transformers | 3.0.1, model: `all-MiniLM-L6-v2` |
| Sandbox executor | testcontainers-python | 4.14.2, postgres extra |
| Metadata catalog | OpenMetadata | 1.6.1 (Docker Compose) |
| In-process ingestion | openmetadata-ingestion | 1.6.1, postgres extra |
| Infrastructure | Docker Compose | All supporting services |

---

## 3. Infrastructure (Docker Compose)

All services run via `docker/openmetadata/docker-compose.yml`.

| Container | Image | Port Mapping | Purpose |
|---|---|---|---|
| `openmetadata_server` | `docker.getcollate.io/openmetadata/server:1.6.1` | 8585–8586 | OpenMetadata API + UI |
| `openmetadata_postgresql` | `docker.getcollate.io/openmetadata/postgresql:1.6.1` | 5432 | OpenMetadata internal DB |
| `openmetadata_elasticsearch` | `docker.elastic.co/elasticsearch/elasticsearch:8.11.4` | 9200, 9300 | OM search backend |
| `openmetadata_ingestion` | `docker.getcollate.io/openmetadata/ingestion:1.6.1` | 8080 | Airflow-based ingestion (not used for in-process flow) |
| `healerdb_postgres` | `postgres:16-alpine` | **5433:5432** | Target database HealerDB monitors and heals |
| `healerdb_redis` | `redis:7.2-alpine` | 6379 | Redis Streams event bus |

> **Note:** The target database container is named `healerdb_postgres`. All external connections use `localhost:5433`.

---

## 4. Project Structure

```
healerdb/
├── src/
│   ├── agents/
│   │   ├── detector.py          # Rule-based failure classifier
│   │   ├── diagnosis.py         # LLM diagnosis via Gemini 2.5 Pro
│   │   ├── profiler.py          # Direct Postgres profiling engine
│   │   ├── repair.py            # Sandbox orchestrator (post-approval)
│   │   └── apply.py             # Production fix executor
│   ├── api/
│   │   ├── webhook.py           # OpenMetadata webhook receiver
│   │   ├── dashboard.py         # Audit / stream / escalation / health endpoints
│   │   ├── profiler_routes.py   # Profiling API endpoints
│   │   ├── onboarding_routes.py # Database connect + re-profile endpoints
│   │   ├── proposal_routes.py   # Proposal approve / reject / detail endpoints
│   │   └── table_routes.py      # Live table data endpoint
│   ├── core/
│   │   ├── config.py            # All settings via pydantic-settings (.env)
│   │   └── models.py            # All Pydantic models
│   ├── db/
│   │   ├── target_db.py         # Async read connection to healerdb_postgres
│   │   ├── audit_log.py         # _healerdb_audit table CRUD
│   │   ├── event_store.py       # _healerdb_events table CRUD
│   │   ├── vector_store.py      # ChromaDB wrapper
│   │   ├── profiling_store.py   # _healerdb_profiling_reports table CRUD
│   │   ├── proposal_store.py    # _healerdb_proposals table CRUD
│   │   └── connection_registry.py # _healerdb_connections table CRUD
│   ├── sandbox/
│   │   ├── executor.py          # testcontainers ephemeral Postgres orchestration
│   │   └── validator.py         # SQL assertions against sandbox or production
│   ├── services/
│   │   ├── om_client.py         # OpenMetadata REST API client (with token refresh)
│   │   ├── event_bus.py         # Redis Streams publisher
│   │   ├── stream_consumer.py   # Redis Streams consumer (Diagnosis pipeline)
│   │   └── om_ingestion.py      # In-process MetadataWorkflow runner
│   └── main.py                  # FastAPI app + lifespan boot sequence
├── docker/
│   └── openmetadata/
│       ├── docker-compose.yml
│       └── openmetadata.env
├── scripts/
│   └── seed_dirty_data.sql      # Intentionally dirty test data (orders/customers schema)
├── data/
│   └── chromadb/                # ChromaDB persistent storage (local disk)
├── .env                         # Runtime config (never committed)
└── requirements.txt
```

---

## 5. Design Patterns

- **Event-driven pipeline:** All inter-agent communication goes through Redis Streams. No direct agent-to-agent calls.
- **Background tasks:** FastAPI `BackgroundTasks` handles webhook enrichment and onboarding without blocking HTTP responses.
- **Consumer groups:** Redis XREADGROUP with consumer groups ensures at-least-once delivery and allows ACK-based retry on failure.
- **Proposal gate:** A human-approval step sits between diagnosis and repair. The repair agent only runs when a proposal is explicitly approved via API.
- **Dry-run toggle:** `DRY_RUN=true` allows the full pipeline to run without writing to production. Toggled at runtime via `POST /dry-run/toggle`. Does not persist across server restarts — reads from `.env` on each boot.
- **Sandbox-first:** Every fix is validated in an ephemeral testcontainers Postgres clone before proposal creation (preview run) and again after approval (full validation run).
- **asyncpg JSONB constraint:** All JSONB inserts use `CAST(:param AS jsonb)` syntax. The `::jsonb` cast operator is rejected by asyncpg's prepared statement engine.
- **Model vs dict contract:** All `get_*` functions in `db/` return Pydantic model objects, not dicts. API routes must use attribute access (`.field_name`), not bracket access (`["field_name"]`).

---

## 6. Target Database — Northwind

The system has been tested and verified against the **Northwind** database loaded into `healerdb_postgres`.

| Property | Value |
|---|---|
| Database name | `northwind` |
| Tables | 14 |
| Total rows (orders) | 830 |
| Total rows (customers) | 91 |
| Total rows (employees) | 9 |
| Connection | `localhost:5433` |
| User | `healerdb_user` |
| Password | `healerdb_pass` |

### Known Dirty Data in Northwind (natural, not seeded)

| Table | Column | Anomaly | Count |
|---|---|---|---|
| `orders` | `ship_region` | NULL values | 54 |
| `orders` | `shipped_date` | NULL values | 21 |
| `customers` | `region` | NULL values | 60 |
| `employees` | `region` | NULL values | 5 → **FIXED** (applied April 21, 2026) |

**Profiling summary (last run):** 15 total anomalies, 12 critical, 3 warnings across 14 tables.

---

## 7. Internal Postgres Tables

All internal tables are prefixed with `_healerdb_` and excluded from profiling scans. They live inside the target database.

### `_healerdb_events`

Stores enriched webhook events immediately after OM enrichment.

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | |
| `event_id` | VARCHAR(36) UNIQUE NOT NULL | UUID from webhook |
| `table_fqn` | TEXT NOT NULL | e.g. `northwind_svc.northwind.public.employees` |
| `table_name` | TEXT NOT NULL | Last segment of FQN |
| `enrichment_ok` | BOOLEAN | True if OM schema context was fetched |
| `severity` | VARCHAR(20) | low / medium / high / critical |
| `event_data` | JSONB NOT NULL | Full `EnrichedFailureEvent` serialized |
| `created_at` | TIMESTAMPTZ | Default NOW() |

Indexes: `event_id`, `created_at DESC`

---

### `_healerdb_proposals`

Stores repair proposals awaiting human approval.

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | |
| `proposal_id` | VARCHAR(36) UNIQUE NOT NULL | UUID |
| `event_id` | VARCHAR(36) NOT NULL | Soft FK to `_healerdb_events` |
| `table_fqn` | TEXT NOT NULL | |
| `table_name` | TEXT NOT NULL | |
| `failure_categories` | TEXT[] | e.g. `['null_violation']` |
| `root_cause` | TEXT | LLM-generated plain English |
| `confidence` | FLOAT | 0.0–1.0. Threshold: 0.70 |
| `fix_sql` | TEXT | Contains `{table}` placeholder |
| `fix_description` | TEXT | Human-readable |
| `rollback_sql` | TEXT nullable | |
| `estimated_rows` | INTEGER nullable | |
| `sandbox_passed` | BOOLEAN | From preview sandbox run |
| `rows_before` | INTEGER | Sandbox before count |
| `rows_after` | INTEGER | Sandbox after count |
| `rows_affected` | INTEGER | rows_deleted + rows_updated |
| `sample_before` | JSONB | Up to N rows before fix (configurable via `SANDBOX_DIFF_ROWS`) |
| `sample_after` | JSONB | Up to N rows after fix |
| `status` | VARCHAR(30) | See ProposalStatus enum |
| `created_at` | TIMESTAMPTZ | |
| `decided_at` | TIMESTAMPTZ nullable | Set on approve/reject |
| `decision_by` | TEXT | Default: `system` |
| `rejection_reason` | TEXT nullable | |
| `diagnosis_json` | TEXT | Serialized `DiagnosisResult` |
| `event_json` | TEXT | Serialized `EnrichedFailureEvent` |

**ProposalStatus values:** `pending_approval`, `approved`, `rejected`, `executing`, `completed`, `failed`

> **Known issue:** Proposals that fail mid-execution are left in `executing` status permanently. A new webhook must be fired to generate a fresh proposal.

---

### `_healerdb_audit`

One row per fix attempt.

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | |
| `event_id` | VARCHAR(36) NOT NULL | |
| `table_fqn` | TEXT NOT NULL | |
| `table_name` | TEXT NOT NULL | |
| `action` | VARCHAR(20) NOT NULL | `applied` / `dry_run` / `failed` / `rolled_back` / `skipped` |
| `fix_sql` | TEXT | `{table}` already substituted |
| `rollback_sql` | TEXT nullable | |
| `rows_affected` | INTEGER | |
| `dry_run` | BOOLEAN | |
| `sandbox_passed` | BOOLEAN | |
| `confidence` | FLOAT | |
| `failure_categories` | TEXT[] | |
| `applied_at` | TIMESTAMPTZ | Default NOW() |
| `post_apply_json` | JSONB | Array of assertion results |
| `error` | TEXT nullable | Exception message if failed |
| `metadata_json` | JSONB | Reserved |

---

### `_healerdb_profiling_reports`

Stores full profiling reports from the profiler agent.

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | |
| `report_id` | VARCHAR(36) UNIQUE NOT NULL | UUID |
| `connection_hint` | TEXT | `host:port/db` — no credentials stored |
| `status` | VARCHAR(20) | completed / failed / partial |
| `tables_scanned` | INTEGER | |
| `total_anomalies` | INTEGER | |
| `critical_count` | INTEGER | |
| `warning_count` | INTEGER | |
| `duration_ms` | INTEGER | |
| `report_data` | JSONB NOT NULL | Full `ProfilingReport` serialized |
| `created_at` | TIMESTAMPTZ | Default NOW() |

> `get_report(report_id)` returns a `ProfilingReport` Pydantic model, not a dict.

---

### `_healerdb_connections`

Registry of databases connected via `POST /api/v1/connect`.

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | |
| `connection_id` | VARCHAR(36) UNIQUE NOT NULL | UUID |
| `service_name` | TEXT NOT NULL | OM service name |
| `connection_hint` | TEXT NOT NULL | `host:port/db` |
| `db_name` | TEXT NOT NULL | |
| `schema_names` | TEXT[] | Default: `['public']` |
| `status` | VARCHAR(20) | pending / connected / ingesting / profiling / ready / failed |
| `om_service_fqn` | TEXT | Assigned by OM after registration |
| `profiling_report_id` | TEXT nullable | UUID of associated profiling report |
| `tables_found` | INTEGER | |
| `total_anomalies` | INTEGER | |
| `critical_count` | INTEGER | |
| `error` | TEXT nullable | |
| `registered_at` | TIMESTAMPTZ | Default NOW() |
| `last_profiled_at` | TIMESTAMPTZ nullable | |

> `get_connection(connection_id)` returns a `DatabaseConnection` Pydantic model, not a dict.

---

### `_healerdb_reports` (Auto-Documentation)

Stores structured fix reports written on every successful production apply.

See [Auto-Documentation feature doc](./autodoc.md) for full schema.

---

## 8. Redis Streams

| Stream Key | Publisher | Consumer | Purpose |
|---|---|---|---|
| `healerdb:events` | `event_bus.py` | `stream_consumer.py` | Enriched webhook events → diagnosis pipeline |
| `healerdb:repair` | `proposal_routes.py` (on approve) | `repair.py` | Approved diagnoses ready for repair |
| `healerdb:apply` | `repair.py` | `apply.py` | Sandbox-validated fixes ready for production apply |
| `healerdb:escalation` | `stream_consumer.py`, `apply.py`, `proposal_routes.py` | Read-only via dashboard | Events that could not be auto-repaired |

All streams use consumer group `healerdb-agents`. Max length capped at 500–1000 entries.

> Messages published before a server restart may remain unconsumed if the apply agent's consumer group already has them in pending state. Fire a fresh webhook to generate a new event rather than attempting to re-consume stale messages.

---

## 9. ChromaDB Knowledge Base

| Property | Value |
|---|---|
| Collection name | `healerdb_fixes` |
| Embedding model | `all-MiniLM-L6-v2` (384-dim, cosine similarity) |
| Persistent path | `./data/chromadb` |
| Documents on last verified run | 11 |

Each document encodes: `table_fqn + failure_category + problem_description + fix_sql`

Metadata fields: `fix_id`, `table_fqn`, `failure_category`, `problem_description`, `fix_sql`, `was_successful`, `event_id`, `stored_at`

5 bootstrap entries are seeded on startup if the collection is empty. Successful sandbox passes (repair agent) add additional entries.

---

## 10. Full Pipeline Flow

```
OpenMetadata test failure
    │
    ▼
POST /api/v1/webhook/om-test-failure
    │  (returns 200 immediately)
    │
    ▼ (background task)
om_client.get_table_context(table_fqn)
    │  → OM API: GET /api/v1/tables/name/{fqn}
    │  → OM API: GET /api/v1/lineage/table/{id}
    │  [enrichment may fail if table not registered — pipeline continues]
    │
    ▼
event_store.write_event(enriched_event)   → _healerdb_events
event_bus.publish(enriched_event)         → XADD healerdb:events
    │
    ▼ (stream_consumer reads healerdb:events)
detector.run_detector(event)
    │  → rule-based classification → FailureCategory, severity, is_actionable
    │
    ▼
diagnosis_agent.run(event, detector_result)
    │  → vector_store.find_similar_fixes()  [RAG: top-3, threshold 0.3]
    │  → Gemini 2.5 Pro LLM call
    │  → parse JSON → DiagnosisResult
    │
    ├── confidence < 0.70  → publish to healerdb:escalation
    │
    └── confidence >= 0.70 →
            run_sandbox(event, diagnosis)  [preview run]
                │  → fetch schema + up to 500 rows from target DB
                │  → spin up ephemeral postgres:16-alpine (testcontainers)
                │  → seed schema + rows
                │  → execute fix_sql with {table} substituted
                │  → run SQL assertions (validator.py)
                │  → capture data diff (sample_before, sample_after)
                │  → _sanitize_rows() strips memoryview/bytes
                │
                ▼
            proposal_store.create_proposal()  → _healerdb_proposals (status=pending_approval)
                │
                ▼
            WAIT FOR HUMAN DECISION (poll GET /proposals/pending)
                │
                ├── POST /proposals/{id}/reject
                │       → status=rejected, publish to escalation
                │
                └── POST /proposals/{id}/approve
                        → publish DiagnosisResult to healerdb:repair
                        │
                        ▼ (repair_agent reads healerdb:repair)
                    run_sandbox()  [full validation, up to 3 retries]
                        │  → sandbox passed → store fix in ChromaDB KB
                        ▼
                    publish to healerdb:apply
                        │
                        ▼ (apply_agent reads healerdb:apply)
                    DRY_RUN=true  → log intent, write audit row (action=dry_run)
                    DRY_RUN=false →
                        SET LOCAL statement_timeout = 30000ms
                        execute fix_sql ({table} substituted)
                        run post-apply assertions (if POST_APPLY_VERIFY=true)
                        assertions pass  → COMMIT → audit row (action=applied)
                                        → write FixReport → annotate OpenMetadata
                                        → update Slack card with incident links
                        assertions fail  → ROLLBACK → audit row (action=rolled_back)
                                        → publish to escalation
```

---

## 11. Business Logic

### `{table}` Placeholder Substitution

`fix_sql` stores `{table}` as a literal placeholder throughout the entire pipeline. Substitution happens **only at execution time** in `apply.py`:

```python
fix_sql = decision.fix_sql.replace("{table}", f'"{table_name}"')
```

### Detector Classification Rules

| Keywords | FailureCategory |
|---|---|
| `not_null`, `null`, `not be null`, `null values` | `NULL_VIOLATION` |
| `between`, `range`, `min`, `max`, `negative`, `greater`, `less` | `RANGE_VIOLATION` |
| `unique`, `duplicate`, `distinct` | `UNIQUENESS_VIOLATION` |
| `foreign key`, `referential`, `fk`, `not exist` | `REFERENTIAL_INTEGRITY` |
| `regex`, `format`, `pattern`, `like`, `email`, `phone` | `FORMAT_VIOLATION` |
| `column not found`, `schema`, `missing column`, `type mismatch` | `SCHEMA_DRIFT` |

Severity escalation: `REFERENTIAL_INTEGRITY` or `SCHEMA_DRIFT` → CRITICAL. Critical column name match (`customer_id`, `order_id`, `id`, `amount`, `email`, `status`) → HIGH. Multiple categories → MEDIUM. `SCHEMA_DRIFT` → `is_actionable=False`, skip LLM, escalate directly.

### Profiler Detection Logic

| Check | Trigger | Method |
|---|---|---|
| Null rate | All columns | `COUNT WHERE col IS NULL` |
| High null rate warning | nullable + rate > 80% | Same |
| Uniqueness | Column name contains `id`, `uuid`, `email`, `username`, `phone`, `ssn` | `GROUP BY HAVING COUNT > 1` |
| Range / outlier | Numeric types | IQR method |
| Negative values | Numeric + name contains `amount`, `price`, `cost`, `fee`, `total`, `balance`, `quantity` | `WHERE col < 0` |
| Email format | Text + column name in `email`, `email_address`, `mail` | Regex |
| Referential integrity | FK columns from `information_schema` | LEFT JOIN check |

Row cap: Tables > 100,000 rows are sampled. `_healerdb_*` tables excluded.

### Sandbox Execution

- Image: `postgres:16-alpine` (testcontainers-python 4.14.2)
- Run in: `asyncio.to_thread` — never blocks event loop
- Timeout: 120 seconds, up to 3 retries
- Diff strategy: Full-row JSON hashing (`json.dumps(row, sort_keys=True)`) — no primary key dependency
- Row display limit: `SANDBOX_DIFF_ROWS` (default 20)
- Sanitization: `_sanitize_rows()` strips `memoryview` → `None`, `bytes` → `None`, dates → ISO string, decimals → float

### Health Score Formula

- `total_anomalies == 0` → score = 100, status = `clean`
- `critical_count == 0` → score = `max(50, 100 − warnings × 3)`, status = `partial`
- `critical_count > 0` → score = `max(0, 100 − critical × 10 − warnings × 3)`, status = `dirty`

---

## 12. API Reference

**Base URL:** `http://localhost:8001/api/v1`  
**Auth:** None — all endpoints are publicly accessible.  
**Content-Type:** `application/json`

| Method | Route | Description |
|---|---|---|
| POST | `/webhook/om-test-failure` | Receive OM test failure event |
| GET | `/health` | Basic health check |
| GET | `/status` | Full pipeline status |
| GET | `/audit?limit={n}` | Audit log (default 20, max 100) |
| GET | `/audit/{event_id}` | Single audit entry detail |
| GET | `/streams` | Redis stream lengths |
| GET | `/escalations?limit={n}` | Escalation queue |
| POST | `/dry-run/toggle` | Toggle live / safe mode (in-memory, not persisted) |
| GET | `/connections/{id}/health` | Health score + per-table anomaly breakdown |
| POST | `/profile` | Profile a database directly |
| GET | `/profile/{report_id}` | Full profiling report |
| GET | `/profile/{report_id}/anomalies` | Filtered anomaly list |
| GET | `/profiles?limit={n}` | List profiling report summaries |
| POST | `/connect` | Connect and onboard a database |
| GET | `/connections/{connection_id}` | Poll onboarding status |
| GET | `/connections` | List all connections |
| POST | `/connections/{id}/re-profile` | Re-profile existing connection |
| GET | `/tables/live` | Live table rows + column metadata + anomaly columns |
| GET | `/proposals/pending` | Pending approval queue |
| GET | `/proposals?status={s}&limit={n}` | All proposals (filterable) |
| GET | `/proposals/{proposal_id}` | Full proposal with diff + computed display fields |
| POST | `/proposals/{proposal_id}/approve` | Approve and execute fix |
| POST | `/proposals/{proposal_id}/reject` | Reject fix |
| POST | `/proposals/{proposal_id}/re-sandbox` | Refresh sandbox preview |

---

## 13. Environment Variables

| Variable | Default | Notes |
|---|---|---|
| `OM_HOST` | `http://localhost:8585` | OpenMetadata server URL |
| `OM_ADMIN_EMAIL` | `admin@open-metadata.org` | |
| `OM_ADMIN_PASSWORD` | — | Plain text, base64-encoded at runtime |
| `REDIS_HOST` | `localhost` | |
| `REDIS_PORT` | `6379` | |
| `REDIS_STREAM_NAME` | `healerdb:events` | |
| `REDIS_REPAIR_STREAM` | `healerdb:repair` | |
| `REDIS_ESCALATION_STREAM` | `healerdb:escalation` | |
| `REDIS_APPLY_STREAM` | `healerdb:apply` | |
| `REDIS_CONSUMER_GROUP` | `healerdb-agents` | Shared across all agents |
| `REDIS_CONSUMER_NAME` | `diagnosis-agent-1` | |
| `APP_HOST` | `0.0.0.0` | |
| `APP_PORT` | `8000` | Note: frontend proxies to 8001 |
| `GEMINI_API_KEY` | — | Required — Google Gemini API key |
| `LLM_MODEL` | `gemini-2.5-pro` | |
| `LLM_MAX_TOKENS` | `4096` | |
| `CHROMA_PERSIST_DIR` | `./data/chromadb` | |
| `CHROMA_COLLECTION` | `healerdb_fixes` | |
| `CONFIDENCE_THRESHOLD` | `0.70` | Min confidence to mark as repairable |
| `TARGET_DB_HOST` | `localhost` | |
| `TARGET_DB_PORT` | `5433` | External port mapping |
| `TARGET_DB_NAME` | `northwind` | |
| `TARGET_DB_USER` | `healerdb_user` | |
| `TARGET_DB_PASSWORD` | `healerdb_pass` | |
| `SANDBOX_MAX_RETRIES` | `3` | |
| `SANDBOX_SAMPLE_ROWS` | `500` | Max rows seeded into sandbox |
| `SANDBOX_DIFF_ROWS` | `20` | Max rows shown in data diff |
| `SANDBOX_TIMEOUT_SECONDS` | `120` | |
| `DRY_RUN` | `true` | Does not persist across restarts |
| `APPLY_STATEMENT_TIMEOUT_MS` | `30000` | |
| `POST_APPLY_VERIFY` | `true` | Run assertions after live apply |

---

## 14. Boot Sequence

```
1. vector_store.connect()           → ChromaDB (sync, must be first)
   vector_store.seed_bootstrap_fixes()

2. init_audit_table()               → _healerdb_audit
   init_event_store()               → _healerdb_events
   init_profiling_store()           → _healerdb_profiling_reports
   init_connection_registry()       → _healerdb_connections
   init_proposal_store()            → _healerdb_proposals

3. event_bus.connect()              → Redis ping

4. stream_consumer.connect()        → Create consumer group (idempotent)
   asyncio.create_task(stream_consumer.start())

5. repair_agent.connect()
   asyncio.create_task(repair_agent.start())

6. apply_agent.connect()
   asyncio.create_task(apply_agent.start())
```

Expected boot log (all components healthy):
```
[Boot] ChromaDB ready
[Boot] Audit table ready
[Boot] Event store ready
[Boot] Profiling store ready
[Boot] Connection registry ready
[Boot] Proposal store ready
[Boot] Event bus ready
[Boot] Diagnosis consumer running
[Boot] Repair agent running
[Boot] Apply agent running
HealerDB ready ✓
```

---

## 15. Known Gaps and Constraints

**No Authentication Layer** — All endpoints are publicly accessible. No JWT, API key, or session validation.

**No Credential Storage** — Credentials submitted via `POST /connect` are not persisted. Only `connection_hint` (`host:port/db`) is stored. Re-profiling requires re-submitting credentials.

**`WEBHOOK_SECRET` Unused** — Defined in `.env` but webhook payloads are not signature-validated.

**OM FQN Mismatch** — The FQN prefix in webhook payloads is `northwind_svc` (auto-generated by `POST /connect`). OM returns 404 for table lookups under this prefix because tables were not successfully indexed. Pipeline continues with `enrichment_success=false` — does not block diagnosis or repair.

**Proposal Stuck at `executing`** — Proposals that fail mid-pipeline are left in `executing` status permanently. No automatic reset.

**`DRY_RUN` Not Persisted** — `POST /dry-run/toggle` changes in-memory state only. Server restart resets to `.env` value (`true` by default).

**Validator Assertion Coverage** — `validator.py` supports null checks, range checks, uniqueness, and email regex. `format_violation` and `schema_drift` categories return `passed=True` with a `skipped` note. Range bounds are hardcoded to `[0, 9_999_999]`.

**Sandbox Windows Compatibility** — testcontainers on Windows occasionally produces Docker API 500 errors on container removal. Retry logic (3 attempts, 2-second gap) mitigates. `TESTCONTAINERS_HOST_OVERRIDE=localhost` may be required.

**`list_connections()` Bug** — `out.append(d)` is indented inside the datetime conversion loop. Only the last item is appended per row correctly. Non-critical for single-connection scenarios.

**ChromaDB File Lock on Windows** — ChromaDB holds file locks while the server is running. Cleanup: stop server → delete `./data/chromadb/` → restart.

---

## 16. Verified Pipeline Run

End-to-end pipeline run against Northwind `employees.region` NULL violation (April 21, 2026):

| Stage | Result |
|---|---|
| Webhook received | ✅ `event_id=a949d871` accepted |
| OM enrichment | ⚠️ 404 — table not in OM, pipeline continued |
| Event stored | ✅ `_healerdb_events` written |
| Redis published | ✅ `healerdb:events` XADD |
| Detector | ✅ `null_violation`, severity=low, actionable=True |
| Diagnosis (Gemini 2.5 Pro) | ✅ confidence=0.92, repairable=True |
| Sandbox preview | ✅ 9 rows seeded, 4 rows fixed, assertion PASSED |
| Proposal created | ✅ `pending_approval` |
| Human approval | ✅ `POST /proposals/{id}/approve` |
| Repair sandbox | ✅ PASSED attempt 1/3 |
| ChromaDB store | ✅ Fix stored in knowledge base |
| Apply agent | ✅ LIVE mode, `rowcount=4`, COMMITTED |
| Audit written | ✅ `action=applied`, `dry_run=false`, `rows_affected=4` |
| Production data | ✅ employees 5, 6, 7, 9 → `region='unknown'` |

---

## 17. Changelog

### v0.4.0 — April 23–25, 2026

**`src/core/config.py`**
Added `sandbox_diff_rows: int = 20` (env: `SANDBOX_DIFF_ROWS`). Controls max changed rows surfaced in `sample_before`/`sample_after`. Replaces all previous hardcoded `limit=5` and `[:3]` slices.

**`src/sandbox/executor.py`**
Fixed meaningless data diff caused by unordered `LIMIT 5` snapshots. New approach: fetch all rows before/after ordered by `ctid`, compute diff via full-row JSON hashing (`_compute_diff`). Falls back to deterministic sample only if zero rows changed. `{}` rows render as "Deleted" / "Inserted" pills in the frontend.

**`src/api/proposal_routes.py`**
Removed hardcoded `[:3]` slice on `sample_before`/`sample_after` in re-sandbox endpoint. Now uses `settings.sandbox_diff_rows` consistently.

**`src/db/audit_log.py`**
Expanded `fetch_recent_audit` SELECT to include `fix_sql`, `rollback_sql`, `post_apply_json`. Added `fetch_audit_entry(event_id)` for single-entry lookup used by the new detail endpoint.

**`src/api/dashboard.py`**
Updated audit serializer to parse `post_apply_json` into an array. Added `GET /audit/{event_id}` detail endpoint.

**Auto-Documentation feature (v0.4.0)**
On every successful production apply, three things happen automatically: a `FixReport` record is written to `_healerdb_reports`, the fixed column's description in OpenMetadata is annotated, and the Slack resolved card is updated with incident links. See [autodoc.md](./autodoc.md) for full reference.

**Slack Bot integration**
Conversational database reliability agent embedded in Slack. Posts live anomaly cards, self-updates as pipeline progresses, answers questions in proposal threads via Gemini 2.5 Pro with full context, stores rejection reasons in ChromaDB. See [slack-integration.md](./slack-integration.md) for full reference.

### v0.3.0 — April 21, 2026 (6 backend fixes)

Repair agent fallback, re-profile endpoint implementation, dashboard/table_routes deduplication, model-vs-dict contract enforcement across all routes, `_extract_failed_tests` instance method fix. All 6 fixes documented inline — full detail in git history.