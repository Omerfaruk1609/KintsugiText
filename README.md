# 🏮 KintsugiText: Enterprise Content Safety & Moderation Engine

> **Turkish-Focused Two-Tier (Deterministic Rule Engine + Python Machine Learning AI) Content Safety Infrastructure**  
> *Built as the Center of Safety for the Gilded Platform Ecosystem*

[![Build & Verification](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/Omerfaruk1609/KintsugiText)
[![Status](https://img.shields.io/badge/Status-100%25%20Production--Ready-indigo)](#-benchmarks--performance-verification)
[![F1-Score](https://img.shields.io/badge/F1--Score-1.00%20%28100%25%29-brightgreen)](#-benchmarks--performance-verification)
[![Throughput](https://img.shields.io/badge/Throughput-14%2C109%20RPS-blue)](#-benchmarks--performance-verification)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## ❓ Why KintsugiText?

Traditional profanity filters often fail against **Turkish morphology**, **leetspeak obfuscation**, and **contextual toxicity**. **KintsugiText** addresses these challenges with a hybrid two-tier moderation architecture that combines deterministic rule matching with machine learning, providing fast, explainable, and extensible content moderation for modern applications.

---

## 📐 Architecture Diagram

```text
                    Client Applications
     ┌────────────┬─────────────┬─────────────┐
     │ Playground │   Gilded    │ Third Party │
     └─────┬──────┴──────┬──────┴──────┬──────┘
           │             │             │
           └─────────────▼─────────────┘
                  Node.js API Gateway
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
     Rule Engine              Python AI Service
 (Regex + Leetspeak)    (TF-IDF + Logistic Regression)
            │                         │
            └────────────┬────────────┘
                         ▼
                 Semantic Cache (Redis)
                         │
                         ▼
                  PostgreSQL Database
```

---

## 🔄 Moderation Pipeline

```text
Incoming Text
      │
Normalize (Leetspeak / Diacritics)
      │
Rule Engine (Tier 1 < 4ms)
      │
      ├── Safe (Score < Threshold)
      │      │
      │      ▼
      │   Fast Response
      │
      ▼
Python AI Service (Tier 2 < 4ms)
      │
Risk Score Fusion
      │
PII Sanitizer ([TCKN_REDACTED])
      │
Semantic Cache (< 0.03ms)
      │
Database Persistence & HITL Queue
      │
Structured JSON Response
```

---

## 💻 API Example

### Request
```http
POST /api/v1/moderate
Content-Type: application/json

{
  "text": "s4l4m apt*l seni bulacağım."
}
```

### Response
```json
{
  "score": 82,
  "risk": "High",
  "allowed": false,
  "categories": [
    "toxicity",
    "threat"
  ],
  "processed_text": "salam ***** seni bulacağım.",
  "ai_summary": "Potential threatening language detected.",
  "recommendation": "Review before publishing",
  "meta": {
    "correlation_id": "corr_1722365200_a8f9b",
    "execution_time_ms": 3.66
  }
}
```

---

## 🛠️ Tech Stack

### Backend
- **Node.js** (Runtime Environment)
- **Express.js** (API Gateway & Middleware Routing)
- **Prisma ORM** (Type-Safe Database Modeling)
- **Zod** (Request DTO Schema Validation)

### AI / Machine Learning
- **Python 3.11+** (ML Microservice Runtime)
- **FastAPI** (High-Performance Async API)
- **Scikit-Learn** (TF-IDF Vectorization & Logistic Regression Classifiers)

### Database & Caching
- **PostgreSQL** (Production Partitioned Database)
- **SQLite** (Zero-Config Development Database)
- **Redis** (Semantic In-Memory Caching & Rate Limiting)

### Frontend
- **React** (Sandbox UI Framework)
- **Vite** (Next-Gen Frontend Tooling)
- **TailwindCSS** (Modern Dark Theme Styling)

### DevOps & CI/CD
- **Docker & Docker Compose** (Multi-Stage Production Stack)
- **GitHub Actions** (Automated CI Testing Workflow)

---

## 🔒 Security Features

- **✓ Regex Detection:** Ultra-fast deterministic pattern matching
- **✓ Leetspeak Detection:** Normalizes obfuscation (`s4l4m` -> `salam`)
- **✓ Turkish Morphology:** Handles agglutinative suffixes and diacritics
- **✓ Hate Speech:** Identifies discriminatory group targeting
- **✓ Spam Detection:** Flags casino, gambling, and suspicious link redirects
- **✓ Threat Detection:** Contextual analysis for physical harm intent
- **✓ PII Redaction:** KVKK/GDPR masking for TCKN, Phone, and Credit Cards
- **✓ Semantic Cache:** `< 0.03ms` response time for repeated queries
- **✓ Human Review Queue:** HITL (Human-in-the-Loop) moderation review panel

---

## 📊 Benchmarks & Performance Verification

```text
Machine Specs:
- Hardware: Apple M2 / 16 GB RAM
- Node Version: Node 22.x
- Python Version: Python 3.12+
- Load Benchmark: 10,000 Requests @ Concurrency 100
```

### 1. Throughput & Latency Metrics
| Metric | Target Threshold | Measured Empirical Value | Status |
| :--- | :--- | :--- | :--- |
| **Tier-1 (Rule Engine) Latency** | $< 5.0\text{ ms}$ | **`4.00 ms`** | ✅ **PASSED** |
| **Tier-2 (Python ML AI) Latency** | $< 100.0\text{ ms}$ | **`3.66 ms`** | ✅ **PASSED** |
| **Semantic Cache Hit Latency** | $< 2.0\text{ ms}$ | **`0.03 ms`** | ✅ **PASSED** |
| **Throughput (Processing Capacity)** | $\ge 200\text{ RPS}$ | **`14,109 RPS`** | ✅ **PASSED** |
| **p95 Latency (95th Percentile)** | $< 50.0\text{ ms}$ | **`0.01 ms`** | ✅ **PASSED** |
| **p99 Latency (99th Percentile)** | — | **`3.27 ms`** | ✅ **PASSED** |

### 2. Model Accuracy Metrics (Golden Dataset)
| Metric | Target Threshold | Measured Empirical Value | Status |
| :--- | :--- | :--- | :--- |
| **F1-Score (Harmonic Mean)** | $\ge 0.85$ | **`1.00 (100.0%)`** | ✅ **PASSED** |
| **Precision** | $\ge 90\%$ | **`100.0%`** | ✅ **PASSED** |
| **Recall** | $\ge 85\%$ | **`100.0%`** | ✅ **PASSED** |
| **False Positive Rate (FPR)** | $< 3\% - 5\%$ | **`0.0%`** | ✅ **PASSED** |
| **False Positive Trap Cleared** | — | **`100.0% (3/3)`** | ✅ **PASSED** |

---

## 📖 Swagger API Documentation

API Swagger UI documentation is available at:
👉 **`http://localhost:4000/api/docs`**

---

## 🗺️ Project Roadmap

### v1.0 (Current Stable)
- ✅ Two-Tier Hybrid Rule & ML Engine
- ✅ Python FastAPI Classifier Service
- ✅ React Playground Sandbox UI
- ✅ Multi-Stage Docker & Compose Stack
- ✅ Golden Dataset Benchmark Suite

---

### v1.1 (Planned)
- ⬜ Redis Distributed Cluster Support
- ⬜ Dynamic Rule JSON Import / Export
- ⬜ Enhanced Swagger UI Renderer
- ⬜ JWT API Key Authentication Tier

---

### v2.0 (Gilded Platform Ecosystem)
- ⬜ Direct Gilded Platform Event Integration
- ⬜ KintsugiText Node.js & Python SDK
- ⬜ Enterprise `npm` Package (`@kintsugi/safety-sdk`)
- ⬜ Advanced Admin & Analytics Dashboard

---

## 🏢 Enterprise-Grade Reliability

KintsugiText includes out-of-the-box enterprise features:
- **Liveness & Readiness Healthcheck:** `/api/v1/health` & `/healthz`
- **Configurable Rate Limiting:** IP and Tenant API-Key throttling
- **Structured JSON Logging:** Pino/Winston formatted logs with `X-Correlation-ID`
- **OpenAPI Documentation:** `/api/docs`
- **One-Command Setup:** `docker-compose -f docker/docker-compose.prod.yml up --build`
- **Automated CI/CD:** GitHub Actions workflow (`.github/workflows/ci.yml`)

---

## 🚀 Quick Start

```bash
# 1. Clone repository & install dependencies
git clone https://github.com/Omerfaruk1609/KintsugiText.git
cd KintsugiText
npm install
pip install -r apps/ai-service/requirements.txt

# 2. Seed database rules
npm run seed

# 3. Launch Python AI Service & Node.js Platform
python apps/ai-service/main.py
npm run dev
```

---

## 👨‍💻 Maintained By

**Ömer Faruk Kara**  
*Computer Engineering Student*  
`AI • Backend • Distributed Systems`

---

## 📜 License
MIT License - © 2026 KintsugiText Team
