# Contributing to HealerDB

Thank you for your interest in contributing to **HealerDB**! We welcome contributions to the autonomous self-healing engine, AI diagnostic models, sandbox runner, and the developer studio frontend.

---

## 🏛️ Monorepo Architecture

HealerDB is organized as a unified monorepo:

```
HealerDB/
├── backend/                  # FastAPI autonomous database engine & agents
│   ├── src/
│   │   ├── agents/           # Diagnosis (LLM + Vector), repair, apply agents
│   │   ├── api/              # FastAPI REST endpoints
│   │   ├── core/             # Pydantic settings & domain models
│   │   ├── db/               # Persistence layers (audit, proposals, vector DB)
│   │   └── services/         # Event streams & background workers
│   └── tests/                # Pytest unit & integration tests
│
├── frontend/                 # VS Code-themed Next.js 15 developer studio
│   ├── app/                  # App Router pages (dashboard, profiler, proposals, connections, audit, settings)
│   ├── components/           # UI components & VS Code shell chrome
│   └── lib/                  # Backend API client & React Query providers
│
├── docs/                     # Architectural specs and design guides
└── docker-compose.yml        # Multi-service local infrastructure
```

---

## 🚀 Getting Started Locally

### 1. Clone & Setup Environment

```bash
git clone https://github.com/PranavTJ-05/HealerDB.git
cd HealerDB
cp .env.example .env
```

Set your `GROQ_API_KEY` in `.env` for AI diagnostic reasoning.

### 2. Launch Local Database & Redis

```bash
docker compose up -d healerdb-postgres healerdb-redis
```

This brings up:
- PostgreSQL at `localhost:5433` (seeded with test anomaly datasets)
- Redis at `localhost:6379` (event stream broker)

### 3. Running Backend Services

```bash
cd backend
python3 -m venv ../.venv
source ../.venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

Health check:
```bash
curl http://localhost:8001/health
```

### 4. Running Frontend Studio

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
pytest -v
```

### Frontend Type Check & Build
```bash
cd frontend
npm run build
```

---

## 📋 Git Workflow & Commit Guidelines

We use conventional commit messages:
- `feat:` — New user-facing feature or API endpoint
- `fix:` — Bug fix or error resolution
- `refactor:` — Code restructure without behavioral changes
- `docs:` — Documentation improvements
- `chore:` — Tooling, dependency, or configuration updates

### Submitting a Pull Request
1. Branch from `main` (`git checkout -b feat/your-feature-name`).
2. Keep PRs focused, single-purpose, and well-tested.
3. Verify tests pass and no linting errors exist before opening PR.
4. Open your PR against `main` with a descriptive summary of changes.
