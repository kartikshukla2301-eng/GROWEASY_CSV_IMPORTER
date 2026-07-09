# GrowEasy CSV Importer

A full-stack web application that accepts **any** CSV file and uses an LLM (via [OpenRouter](https://openrouter.ai)) to intelligently extract, map, and validate its data into the GrowEasy CRM lead schema. The system handles arbitrary column names and structures without relying on fixed header assumptions.

---

## Features

- **Drag-and-drop CSV upload** with client-side validation (file type, size limit)
- **Client-side CSV parsing and preview** before any AI processing (PapaParse)
- **Explicit confirmation step** before triggering backend extraction
- **Batched AI extraction** with bounded concurrency (configurable batch size and concurrency)
- **Real-time batch progress** via Server-Sent Events (SSE)
- **Single retry per batch** with a stricter prompt on LLM validation failure
- **Per-batch failure isolation** — failed batches are marked as skipped, never abort the full import
- **Post-AI business rule enforcement** — enum whitelisting, skip rules, date normalization
- **Full import results** with imported records, skipped records, and skip reasons
- **Prompt injection mitigation** — input sanitization strips role-injection and instruction-override patterns
- **Phone number intelligence** — E.164 country code splitting for 100+ international dialing codes
- **OpenRouter-powered AI** — switch models with a single environment variable; multi-model fallback on failure

---

## Tech Stack

| Layer | Package | Purpose |
|-------|---------|---------|
| **Frontend** | Next.js 14 (App Router) | File-based routing, server components, Vercel deployment |
| | TypeScript (strict) | Type safety across the full stack |
| | Tailwind CSS | Utility-first styling |
| | Zustand | Lightweight state management (zero boilerplate) |
| | react-dropzone | Accessible drag-and-drop file input |
| | PapaParse | Battle-tested CSV parser with BOM handling |
| | @tanstack/react-table | Headless table primitives for data display |
| **Backend** | Express | Lightweight HTTP server |
| | multer | Multipart file upload handling |
| | csv-parse | Server-side CSV parsing with encoding support |
| | Zod | Runtime schema validation with TypeScript type inference |
| | p-limit | Bounded concurrency for batch processing |
| **AI** | OpenRouter API | Unified LLM gateway — supports Gemini, GPT, Claude, DeepSeek, Llama, Qwen, and more |
| **Shared** | Zod schemas | Shared types and validation between client and server |

---

## Project Structure

```
csv-importer/
├── .env.example                    # Environment variable template
├── package.json                    # Root: concurrently runs client + server
│
├── shared/                         # Shared between client and server
│   ├── enums.ts                    # CRM_STATUS_VALUES, DATA_SOURCE_VALUES
│   └── schema.ts                   # Zod schemas: CrmRecord, LlmBatchResponse, ImportResponse
│
├── client/                         # Next.js 14 frontend
│   └── src/
│       ├── app/
│       │   ├── layout.tsx          # Root layout with metadata
│       │   ├── page.tsx            # Main page — step-based UI (upload → preview → processing → result)
│       │   └── globals.css         # Tailwind directives + global styles
│       ├── components/
│       │   ├── upload/
│       │   │   └── UploadZone.tsx  # Drag-and-drop file picker
│       │   ├── preview/
│       │   │   ├── PreviewTable.tsx # Raw CSV data preview table
│       │   │   └── ConfirmBar.tsx  # "Start import" confirmation bar
│       │   ├── result/
│       │   │   ├── ResultSummary.tsx # Import statistics cards
│       │   │   ├── ImportedTable.tsx # CRM records table
│       │   │   └── SkippedTable.tsx # Skipped rows table with reasons
│       │   └── ui/
│       │       ├── Button.tsx      # Reusable button (primary/secondary/ghost)
│       │       ├── Badge.tsx       # Status badge component
│       │       ├── Card.tsx        # Card container
│       │       ├── EmptyState.tsx  # Empty state placeholder
│       │       ├── ProgressBar.tsx # Batch progress indicator
│       │       ├── Spinner.tsx     # Loading spinner
│       │       ├── StepIndicator.tsx # Step breadcrumb (upload → preview → processing → result)
│       │       └── Toast.tsx       # Toast notification
│       ├── hooks/
│       │   ├── useCsvParse.ts      # Client-side CSV validation + PapaParse integration
│       │   └── useCsvImport.ts     # SSE import trigger + progress tracking
│       ├── lib/
│       │   ├── api.ts              # SSE client: POST /api/csv/import with streaming
│       │   └── csvParser.ts        # PapaParse wrapper returning ParsedFile
│       ├── store/
│       │   └── importStore.ts      # Zustand store: step, parsedFile, progress, result, error
│       └── types/
│           └── index.ts            # Client types: ImportStep, ParsedFile, ImportProgress
│
└── server/                         # Express backend
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── server.ts               # Entry point: validates config, starts HTTP server
        ├── app.ts                  # Express app: CORS, routes, error handler
        ├── config/
        │   └── env.ts              # Environment config: OpenRouter, batching, upload limits
        ├── controllers/
        │   └── csv.controller.ts   # SSE controller: streams progress + final result
        ├── middleware/
        │   ├── upload.ts           # Multer config: memory storage, file filter, size limit
        │   └── errorHandler.ts     # Centralized error handler + AppError factory
        ├── routes/
        │   ├── csv.routes.ts       # POST /api/csv/import
        │   └── health.routes.ts    # GET /api/health
        ├── services/
        │   ├── ai/
        │   │   ├── aiProvider.ts           # AiProvider interface (extractBatch)
        │   │   ├── openrouter.provider.ts  # OpenRouter HTTP client with retry
        │   │   ├── providerFactory.ts      # Singleton factory: builds ProviderManager from env
        │   │   ├── providerManager.ts      # Multi-model failover with cooldown
        │   │   └── prompt.ts               # LLM prompt builder with CRM schema instructions
        │   ├── batching/
        │   │   └── batchingService.ts      # Splits rows into batches, runs with p-limit concurrency
        │   ├── csv/
        │   │   └── csvParser.service.ts    # Server-side CSV parsing (csv-parse/sync)
        │   ├── extraction/
        │   │   └── extractionService.ts    # Orchestrator: parse → batch → AI → result
        │   └── validation/
        │       ├── responseValidator.ts    # Zod validation of LLM JSON responses
        │       └── businessRules.ts        # Deterministic post-AI rules: enum whitelist, skip, dates
        ├── types/
        │   └── index.ts            # Server types: RawRow, ParsedCsv, BatchResult, AppError
        └── utils/
            ├── dateNormalizer.ts    # Date format normalization (DD/MM/YYYY → ISO 8601)
            ├── phoneParser.ts      # E.164 phone number splitting (100+ country codes)
            └── sanitize.ts         # Prompt injection mitigation for CSV cell values
    └── __tests__/
        ├── businessRules.test.ts
        ├── csvParser.test.ts
        ├── dateNormalizer.test.ts
        ├── phoneParser.test.ts
        ├── providerManager.test.ts
        └── responseValidator.test.ts
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Browser (Next.js on Vercel)                             │
│                                                          │
│  UploadZone → PapaParse → PreviewTable → ConfirmBar      │
│       │                                                  │
│       ▼  POST /api/csv/import (multipart, SSE response)  │
└───────┬──────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  Express Server (Render / Railway / Docker)               │
│                                                          │
│  multer ─→ csv-parse ─→ batchingService ─→ p-limit       │
│                              │                           │
│               ┌──────────────┼──────────────┐            │
│               ▼              ▼              ▼            │
│           batch 1        batch 2        batch N          │
│               │              │              │            │
│               ▼              ▼              ▼            │
│       OpenRouterProvider.extractBatch()                   │
│               │                                          │
│               ├─→ responseValidator (Zod)                │
│               ├─→ retry once with stricter prompt         │
│               └─→ businessRules (enum whitelist, dates)   │
│                                                          │
│  SSE progress events ─→ Browser (ProgressBar)            │
│  SSE result event    ─→ Browser (ImportedTable)          │
└───────┬──────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  OpenRouter API                                          │
│  https://openrouter.ai/api/v1/chat/completions           │
│                                                          │
│  Supported models:                                       │
│  • google/gemini-2.5-flash                               │
│  • openai/gpt-4.1-mini                                   │
│  • anthropic/claude-sonnet-4                             │
│  • deepseek/deepseek-chat-v3                             │
│  • qwen/qwen3-coder                                     │
│  • meta-llama/llama-3.3-70b-instruct                     │
│  • ... and 200+ more                                     │
└──────────────────────────────────────────────────────────┘
```

---

## Request Flow

```
1. [Upload screen]
   User drops a CSV file
   → useCsvParse validates file type (.csv) and size (≤5 MB)
   → PapaParse parses CSV in the browser
   → store.setParsedFile() transitions to Preview

2. [Preview screen]
   PreviewTable renders raw rows (no AI call yet)
   User clicks "Confirm import"
   → useCsvImport calls importCsv(file)

3. [Processing screen]
   POST /api/csv/import (SSE stream opens)
   Server: parseCsvBuffer → processBatches
   For each batch:
     → sanitizeRow() strips prompt injection patterns
     → OpenRouterProvider.extractBatch() → OpenRouter API
     → parseAndValidateLlmResponse() with Zod
     → retry once if validation fails (stricter prompt)
     → applyBusinessRules()
     → SSE "progress" event → browser updates ProgressBar

   All batches complete → SSE "result" event

4. [Result screen]
   store.setResult() transitions to Result
   ResultSummary: total / imported / skipped counts
   ImportedTable: CRM records
   SkippedTable: skipped rows with reasons
```

---

## AI Extraction Pipeline

The backend builds a structured prompt (`services/ai/prompt.ts`) that instructs the LLM to:

1. **Map arbitrary columns** to CRM fields using header text and cell value patterns (e.g. a column called "Contact" containing phone numbers maps to `mobile_without_country_code`)
2. **Split phone numbers** — `+91 9876543210` → `country_code: "91"`, `mobile_without_country_code: "9876543210"`
3. **Handle multi-value fields** — multiple emails/phones → first goes to the dedicated field, extras appended to `crm_note`
4. **Enforce enum constraints** — `crm_status` must be one of: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE` (or empty)
5. **Enforce data source** — `data_source` must be one of: `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots` (or empty)
6. **Output ISO 8601 dates** — `created_at` must be parseable by `new Date()`
7. **Skip incomplete records** — records with neither email nor mobile are marked `skipped: true`
8. **Return strict JSON** — no markdown fences, no prose

### Post-AI Validation (Deterministic)

After the LLM responds, the backend applies a **deterministic safety net** regardless of LLM output:

| Layer | What it does |
|-------|--------------|
| `responseValidator.ts` | Strips markdown fences, `JSON.parse`, Zod schema validation |
| Retry | On validation failure → retry once with stricter prompt prefix |
| `businessRules.ts` | Enum whitelist enforcement, skip rule (no email + no mobile), date normalization |
| `dateNormalizer.ts` | Handles DD/MM/YYYY, DD-MM-YYYY → ISO 8601 conversion |
| `sanitize.ts` | Strips role-injection patterns (`system:`, `ignore previous`, etc.) from CSV cells before prompting |

### Model Fallback

When `OPENROUTER_MODELS` is configured with multiple models, the `ProviderManager` provides automatic failover:

- Models are tried in order
- On retryable errors (rate limit 429, timeout 408, 5xx, validation failure) → switch to next model
- After 3 consecutive failures → model enters 60-second cooldown
- On non-retryable errors (401/403 auth, 400 bad request) → fail immediately
- On recovery → cooldown resets automatically

---

## CRM Schema

Each imported record maps to the following schema (all fields optional):

| Field | Type | Description |
|-------|------|-------------|
| `name` | string \| null | Full name of the lead |
| `email` | string \| null | Primary email address |
| `country_code` | string \| null | Numeric dialing code (e.g. `"91"`) |
| `mobile_without_country_code` | string \| null | Local phone digits only |
| `company` | string \| null | Company or organization |
| `city` | string \| null | City |
| `state` | string \| null | State or province |
| `country` | string \| null | Country |
| `lead_owner` | string \| null | Assigned sales person |
| `crm_status` | enum \| `""` | `GOOD_LEAD_FOLLOW_UP` · `DID_NOT_CONNECT` · `BAD_LEAD` · `SALE_DONE` |
| `data_source` | enum \| `""` | `leads_on_demand` · `meridian_tower` · `eden_park` · `varah_swamy` · `sarjapur_plots` |
| `crm_note` | string \| null | Remarks, extra contacts, overflow data |
| `created_at` | string \| null | ISO 8601 date |
| `possession_time` | string \| null | Expected possession timeframe |
| `description` | string \| null | General description |

---

## Installation

```bash
# Clone
git clone https://github.com/your-org/groweasy-csv-importer
cd groweasy-csv-importer

# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

---

## Environment Variables

Copy `.env.example` to `.env` in the project root and fill in your values:

```env
# OpenRouter (required)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=google/gemini-2.5-flash
OPENROUTER_MAX_TOKENS=2048

# Optional: Multi-model fallback (comma-separated)
# OPENROUTER_MODELS=google/gemini-2.5-flash,openai/gpt-4.1-mini,anthropic/claude-sonnet-4

# Server
PORT=4000
CORS_ORIGIN=http://localhost:3000

# Upload limits
MAX_UPLOAD_SIZE_MB=5

# Batch processing
BATCH_SIZE=25
BATCH_CONCURRENCY=3

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | ✅ | — | Your OpenRouter API key |
| `OPENROUTER_MODEL` | ✅* | — | Primary model (e.g. `google/gemini-2.5-flash`) |
| `OPENROUTER_MODELS` | — | — | Comma-separated fallback list (overrides `OPENROUTER_MODEL`) |
| `OPENROUTER_MAX_TOKENS` | — | `2048` | Max output tokens per request |
| `PORT` | — | `4000` | Backend server port |
| `CORS_ORIGIN` | — | `http://localhost:3000` | Allowed frontend origin |
| `MAX_UPLOAD_SIZE_MB` | — | `5` | Max CSV file size in MB |
| `BATCH_SIZE` | — | `25` | Rows per LLM batch |
| `BATCH_CONCURRENCY` | — | `3` | Max concurrent batch requests |
| `NEXT_PUBLIC_API_BASE_URL` | — | `http://localhost:4000` | Backend URL for the frontend |

\* Either `OPENROUTER_MODEL` or `OPENROUTER_MODELS` must be set.

### Switching Models

Change a single environment variable — no code changes needed:

```env
# Google
OPENROUTER_MODEL=google/gemini-2.5-flash

# OpenAI
OPENROUTER_MODEL=openai/gpt-4.1-mini

# Anthropic
OPENROUTER_MODEL=anthropic/claude-sonnet-4

# DeepSeek
OPENROUTER_MODEL=deepseek/deepseek-chat-v3

# Qwen
OPENROUTER_MODEL=qwen/qwen3-coder

# Meta Llama
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct
```

Browse all available models at [openrouter.ai/models](https://openrouter.ai/models).

---

## Running Locally

The root `package.json` uses `concurrently` to start both services:

```bash
# From the project root
npm run dev
```

This starts:
- **Next.js** dev server at `http://localhost:3000`
- **Express** server at `http://localhost:4000`

Or run them separately:

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check — returns `{ status: "ok", timestamp }` |
| `POST` | `/api/csv/import` | Upload CSV file, triggers batched AI extraction. Returns an SSE stream. |

### POST /api/csv/import

**Request:**
```
Content-Type: multipart/form-data
Body: file=<csv-file>
```

**SSE Response Stream:**
```
event: progress
data: {"batchIndex":1,"totalBatches":4}

event: progress
data: {"batchIndex":2,"totalBatches":4}

event: progress
data: {"batchIndex":3,"totalBatches":4}

event: progress
data: {"batchIndex":4,"totalBatches":4}

event: result
data: {
  "totalRows": 80,
  "totalImported": 74,
  "totalSkipped": 6,
  "imported": [
    {
      "name": "Rajesh Sharma",
      "email": "rajesh@example.com",
      "country_code": "91",
      "mobile_without_country_code": "9876543210",
      "company": "Acme Realty",
      "city": "Bangalore",
      "state": "Karnataka",
      "country": "India",
      "crm_status": "GOOD_LEAD_FOLLOW_UP",
      "data_source": "leads_on_demand",
      "created_at": "2024-01-15T00:00:00.000Z",
      "crm_note": null,
      "lead_owner": null,
      "possession_time": null,
      "description": null
    }
  ],
  "skipped": [
    {
      "row": 7,
      "reason": "missing email and mobile",
      "rawData": { "Name": "Unknown", "Status": "New" }
    }
  ]
}
```

**Error Response:**
```json
{
  "error": {
    "code": "CSV_PARSE_ERROR",
    "message": "CSV parsing failed: ..."
  }
}
```

---

## Testing

### Backend (Jest)

```bash
cd server
npm test
```

Test coverage includes:

| Test File | What it covers |
|-----------|----------------|
| `csvParser.test.ts` | CSV parsing, BOM handling, empty files, duplicate headers |
| `businessRules.test.ts` | Enum whitelisting, skip rules, date normalization, field sanitization |
| `dateNormalizer.test.ts` | DD/MM/YYYY, DD-MM-YYYY, ISO 8601, nil values |
| `phoneParser.test.ts` | Country code splitting, E.164 parsing, multi-number extraction |
| `responseValidator.test.ts` | JSON parsing, markdown fence stripping, Zod validation |
| `providerManager.test.ts` | Failover logic, cooldown, recovery, non-retryable error detection |

### Frontend (Vitest)

```bash
cd client
npm test
```

---

## Deployment

```
Vercel (client/)
  NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com

Render or Railway (server/)
  OPENROUTER_API_KEY=sk-or-v1-...
  OPENROUTER_MODEL=google/gemini-2.5-flash
  OPENROUTER_MAX_TOKENS=2048
  CORS_ORIGIN=https://your-app.vercel.app
  PORT=4000
```

The client and server are deployed independently. CORS is restricted to the frontend origin. No database is provisioned — all processing is stateless and per-request.

### Deployment Steps

1. Push the repository to GitHub
2. Connect `client/` to a new **Vercel** project — set `NEXT_PUBLIC_API_BASE_URL` in Vercel environment variables
3. Connect `server/` to **Render** or **Railway** — set all server-side environment variables
4. Update `CORS_ORIGIN` on the server to match the Vercel deployment URL

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **OpenRouter as the single AI gateway** | Eliminates maintaining 3+ separate SDK integrations. One API key, one HTTP call, access to 200+ models. Model switching requires only an env var change. |
| **No database** | The importer is stateless by design — each import is a self-contained request/response cycle. Persistence can be added downstream. |
| **SSE instead of WebSocket** | Simpler to implement for unidirectional server→client streaming. Works through CDNs and proxies. No persistent connection management. |
| **Zod for validation** | Single source of truth for types (TypeScript inference) and runtime validation. Shared schemas between client/server avoid drift. |
| **Deterministic business rules after AI** | The LLM is best-effort. Business rules (`businessRules.ts`) act as a safety net: enum values are always whitelisted, dates always normalized, incomplete records always skipped. |
| **Prompt injection mitigation** | CSV cells are sanitized before inclusion in LLM prompts — role-injection patterns (`system:`, `ignore previous`) are stripped to prevent adversarial inputs from manipulating extraction. |
| **Batch-level failure isolation** | A single failing batch marks its rows as skipped rather than aborting the entire import. This ensures partial success on large files. |

---

## Future Improvements

- Add authentication so only authorized users can trigger imports
- Support Excel/XLSX files as an input format
- Persist imports to a database with per-import audit history
- Add duplicate detection based on email or phone number
- Expose a webhook on import completion for downstream integrations
- Add column-mapping override UI for edge cases where the AI mapping is incorrect

---

## License

MIT
