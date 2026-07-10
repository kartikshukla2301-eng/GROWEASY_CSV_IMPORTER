# 🚀 AI Powered CSV Importer for GrowEasy CRM

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Express](https://img.shields.io/badge/Express.js-4-lightgrey)
![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-purple)
![License](https://img.shields.io/badge/License-MIT-green)

An AI-powered full-stack CSV Importer that intelligently extracts, validates, and maps **any CSV file** into the GrowEasy CRM schema using Large Language Models through OpenRouter.

Instead of relying on fixed column names, the application understands arbitrary CSV structures, performs AI-based field mapping, validates the output, and streams real-time progress to the user.

---

# 🌐 Live Demo

### Frontend
https://groweasy-csv-importer-client-six.vercel.app/

### Backend
Render Deployment

---

# ✨ Features

## 📂 Smart CSV Upload

- Drag & Drop Upload
- CSV Validation
- File Size Validation
- Client-side CSV Parsing
- Instant Data Preview

---

## 🤖 AI Powered Processing

- Intelligent Column Mapping
- Automatic CRM Field Detection
- Batch Processing
- Multi Model Support
- OpenRouter Integration
- Retry Mechanism
- AI Prompt Optimization

---

## ⚡ Real-time Experience

- Live Import Progress (SSE)
- Processing Status
- Preview Before Import
- Import Summary
- Imported & Skipped Records

---

## 🛡️ Security

- Prompt Injection Protection
- File Validation
- Runtime Schema Validation
- Business Rule Enforcement
- Error Handling

---

# 🏗️ Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js 14 |
| Language | TypeScript |
| Backend | Express.js |
| Styling | Tailwind CSS |
| State | Zustand |
| Upload | React Dropzone |
| CSV Parsing | PapaParse + csv-parse |
| Validation | Zod |
| AI | OpenRouter |
| Concurrency | p-limit |

---

# 📁 Project Structure

```
csv-importer
│
├── client
│   ├── app
│   ├── components
│   ├── hooks
│   ├── store
│   ├── lib
│   └── types
│
├── server
│   ├── controllers
│   ├── services
│   ├── middleware
│   ├── routes
│   ├── utils
│   └── config
│
└── shared
    ├── schema
    ├── enums
    └── types
```

---

# ⚙️ Architecture

```text
          CSV Upload
               │
               ▼
      Next.js Frontend
               │
               ▼
      Express Backend
               │
               ▼
       Batch Processor
               │
               ▼
      OpenRouter AI API
               │
               ▼
     Business Validation
               │
               ▼
        Import Results
```

---

# 🔄 Workflow

```
Upload CSV

↓

Preview CSV

↓

Confirm Import

↓

Batch Processing

↓

AI Extraction

↓

Validation

↓

CRM Mapping

↓

Results
```

---

# 🧠 AI Pipeline

The application uses OpenRouter to perform intelligent extraction.

### AI automatically

- Detects Name
- Detects Email
- Detects Phone Number
- Detects Company
- Detects Address
- Detects City
- Detects Country
- Detects CRM Status
- Detects Data Source
- Normalizes Dates
- Removes Invalid Data

After AI processing:

- Zod Validation
- Business Rule Validation
- Skip Invalid Records
- Date Formatting
- Phone Parsing

---

# 📸 Screenshots

## Upload

> Add Screenshot

---

## Preview

> Add Screenshot

---

## Processing

> Add Screenshot

---

## Results

> Add Screenshot

---

# 🚀 Installation

Clone Repository

```bash
git clone https://github.com/kartikshukla2301-eng/GROWEASY_CSV_IMPORTER.git
```

Install

```bash
npm install
```

Run

```bash
npm run dev
```

---

# 🔧 Environment Variables

```
OPENROUTER_API_KEY=

OPENROUTER_MODEL=google/gemini-2.5-flash

PORT=4000

NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

BATCH_SIZE=25

BATCH_CONCURRENCY=3
```

---

# 📡 API

## Health Check

```
GET /api/health
```

---

## Import CSV

```
POST /api/csv/import
```

Returns

- Live Progress Events
- Import Summary
- Imported Records
- Skipped Records

---

# 🧪 Testing

Backend

```bash
cd server

npm test
```

Frontend

```bash
cd client

npm test
```

---

# 🚀 Deployment

Frontend

- Vercel

Backend

- Render

AI

- OpenRouter

---

# 💡 Design Decisions

- AI instead of fixed column mapping
- Batch Processing for scalability
- Server Sent Events for live progress
- Stateless Backend
- Shared Types
- Runtime Validation
- Automatic Model Switching
- Prompt Injection Protection

---

# ⚙️ Performance

- Concurrent Batch Processing
- Streaming Responses
- Memory Uploads
- Stateless Processing
- Optimized API Calls

---

# 🔒 Security

- Prompt Sanitization
- Upload Validation
- Type-safe Parsing
- Zod Runtime Validation
- Error Boundary Handling

---

# 🚧 Challenges Solved

- Unknown CSV Structures
- AI Response Validation
- Concurrent Batch Processing
- Real-time Progress Streaming
- CRM Field Mapping
- Phone Number Parsing
- Date Normalization
- Retry Mechanism

---

# 🔮 Future Improvements

- Authentication
- Excel Support
- Database Integration
- Import History
- Duplicate Detection
- Background Jobs
- Webhooks
- Dashboard Analytics

---

# 👨‍💻 Author

**Kartik Shukla**

🎓 B.Tech CSE (2027)

GitHub

https://github.com/kartikshukla2301-eng

LinkedIn

https://www.linkedin.com/in/kartik-shukla-cse

---

## ⭐ If you found this project useful, don't forget to star the repository.
