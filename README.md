# ScamShield AI — Autonomous Scam & Phishing Detection Platform

> **"Detect. Understand. Stay Safe."**

ScamShield AI is an enterprise-grade cybersecurity web application designed to detect, analyze, and explain phishing and fraudulent threats across **text messages**, **emails**, **URLs**, and **screenshot imagery**.

Unlike opaque "black-box" classifiers, ScamShield AI prioritizes **Explainable AI (XAI)** — providing granular evidence quotes, severity classifications, tactical rationale for why an item was flagged, and context-specific safety playbooks.

---

## Key Features & Capabilities

### 1. Multi-Modal Detection
- **Message Analyzer**: Detects artificial urgency, financial windfalls, prize scams, credential harvesting, fear/intimidation, and unearned gain triggers using TF-IDF NLP vectorization and calibrated classifiers.
- **Phishing Email Scanner**: Identifies sender domain spoofing, display name mismatches, impersonation lures, and malicious attachment/link directives.
- **URL & Domain Intelligence**: Analyzes domain structure, protocol security (HTTPS), URL entropy, character randomization, Punycode homograph attacks, suspicious TLDs (`.xyz`, `.top`, `.cc`, `.biz`, etc.), direct IP hosts, and excessive subdomain nesting.
- **Screenshot OCR Processor**: Ingests uploaded image screenshots (PNG, JPG, WEBP), performs optical character extraction, isolates embedded URLs, and displays the extracted text directly to the user alongside the forensic assessment.

### 2. Standardized Risk Engine & Safety Philosophy
- **Standardized Score**: Continuous 0–100 scale categorized into four operational tiers:
  - `0–29`: **LOW** (Likely Safe)
  - `30–59`: **MEDIUM** (Suspicious)
  - `60–79`: **HIGH** (Likely Scam)
  - `80–100`: **CRITICAL** (Likely Scam)
- **Product Safety Rule**: Adheres to strict advisory safety guidelines. The system **never claims 100% safe or 100% scam**, emphasizing that automated predictions are advisory.
- **Calibrated Confidence**: Confidence percentages dynamically calibrated against ground-truth classification margins.

### 3. Explainable AI (XAI)
Every flagged detection returns:
- **Indicator Name**: The specific psychological or technical tactic (e.g. *Artificial Urgency & Time Pressure*, *Credential & Sensitive Data Harvesting*).
- **Grounded Evidence**: The exact excerpt, parameter, or token triggering the indicator.
- **Severity Level**: `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`.
- **Forensic Explanation**: Clear explanation of how attackers exploit this tactic.

### 4. 15+ Supported Scam Categories
- Banking Scam
- UPI Scam (QR code collect tricks, UPI PIN extortion)
- OTP Scam (Credential theft & social engineering)
- KYC Scam (SIM block threats, Aadhaar/PAN extortion)
- Job Scam (Telegram task fraud, rating schemes)
- Investment Scam (Guaranteed high yields, fake crypto bots)
- Loan Scam (Zero-CIBIL advance fee extortion)
- Lottery Scam (KBC, UK National Lottery counterfeits)
- Prize Scam (Fake anniversary giveaways, Amazon/Flipkart vouchers)
- Delivery Scam (Customs fee hold, FedEx/India Post package redelivery)
- Government Impersonation (Income Tax refund, traffic e-challan summons)
- Tech Support Scam (Trojan alert popups, fake Microsoft/Apple support)
- Social Media Scam (Copyright infringement threats, blue checkmark baits)
- Crypto Scam (Seed phrase sync, giveaway doubler schemes)
- Phishing & "Category uncertain" fallbacks

### 5. Privacy & Data Protection
- **Automatic PII Redaction**: Phone numbers, credit cards, PAN cards, Aadhaar IDs, and UPI handles are scrubbed prior to any database logging.
- **Ephemeral Processing**: Users can opt out of audit history logging with 1 click.
- **Audit Control**: Users can inspect, export, or permanently wipe audit trails.
- **Backend Isolation**: Machine learning weights and API credentials remain isolated on the backend.

---

## System Architecture

```text
               Client Browser (React + TypeScript + Tailwind)
                                     │
                                     ▼  REST API (Port 5174 / 8000)
                     FastAPI Application Gateway (app.py)
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
  Auth Router                Analysis Router               Reports & History
  (JWT + Bcrypt)        (Multi-Modal Coordinator)       (Audit Trail & Metrics)
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
   NLP Text Engine              URL Engine               OCR Image Processor
 (TF-IDF + LogReg)        (Random Forest + Heuristics)   (Pillow / Tesseract)
        │                            │                            │
        └────────────────────────────┼────────────────────────────┘
                                     ▼
                            Risk Scoring Engine
                        (0–100 Standardized Tiers)
                                     │
                                     ▼
                          Explanation Engine (XAI)
                    (Forensic Indicators + Safety Plan)
                                     │
                                     ▼
                        SQLite Database & Threat Hub
```

---

## Directory Structure

```text
ScamShield AI/
├── backend/
│   ├── app.py                      # Master FastAPI server
│   ├── database/
│   │   ├── db.py                   # SQLite schema, thread-safe connection, seed data
│   │   └── scamshield.db
│   ├── routes/
│   │   ├── analysis.py             # Multi-modal detection endpoints
│   │   ├── auth.py                 # JWT token auth & lead analyst demo login
│   │   ├── history.py              # Searchable, filterable audit history
│   │   └── reports.py              # Incident report generator, stats & telemetry
│   ├── services/
│   │   ├── text_detector.py        # NLP pipeline & indicator heuristics
│   │   ├── url_detector.py         # URL feature extraction, entropy & RF model
│   │   ├── image_processor.py      # Screenshot validation, OCR & text isolation
│   │   ├── risk_engine.py          # Calibrated 0-100 risk scoring
│   │   └── explanation_engine.py   # Grounded indicators & recommendation catalog
│   ├── models/
│   │   ├── text_model.pkl          # Serialized NLP pipeline
│   │   ├── url_model.pkl           # Serialized Random Forest model
│   │   └── model_metrics.json      # Ground-truth evaluation metrics
│   ├── utils/
│   │   └── security.py             # Password hashing, JWT & PII sanitization
│   └── requirements.txt
├── datasets/
│   ├── scam_messages.csv
│   ├── legitimate_messages.csv
│   ├── phishing_urls.csv
│   ├── legitimate_urls.csv
│   ├── generate_datasets.py        # Balanced dataset generator & partitioner
│   ├── train/
│   ├── validation/
│   └── test/
├── scripts/
│   └── train_models.py             # Model training, ROC-AUC & confusion matrix
├── frontend/
│   ├── src/
│   │   ├── api/client.ts           # Type-safe API client
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Dynamic cybersecurity navigation & status
│   │   │   ├── Footer.tsx          # Advisory banner & privacy principles
│   │   │   ├── RiskGauge.tsx       # Animated SVG 0-100 risk score meter
│   │   │   ├── IndicatorCard.tsx   # Grounded evidence & severity tags
│   │   │   ├── LoadingIndicator.tsx# Multi-stage progress checklist
│   │   │   └── ReportModal.tsx     # Incident audit exporter (JSON / Print)
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx     # Hero, trust indicators, architecture flow
│   │   │   ├── DashboardPage.tsx   # Live KPIs, risk distribution & threat stats
│   │   │   ├── AnalyzePage.tsx     # 4-Tab detection console with sample presets
│   │   │   ├── HistoryPage.tsx     # Searchable audit table with filters & deletion
│   │   │   ├── ThreatIntelPage.tsx # Threat signatures & malicious domains
│   │   │   ├── ModelMetricsPage.tsx# ML evaluation suite & confusion matrix
│   │   │   └── PrivacyPage.tsx     # PII Sanitizer interactive playground
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css               # Dark theme, glassmorphism & cyber styling
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## Machine Learning Evaluation

The models are trained using `scripts/train_models.py` with strict train/validation/test splits to eliminate data leakage. Particular focus is placed on **Recall** to avoid false negatives (missing real scams).

| Metric | NLP Text Model | Random Forest URL Model |
| :--- | :--- | :--- |
| **Accuracy** | 100.0% | 100.0% |
| **Precision** | 100.0% | 100.0% |
| **Recall (FN Guard)** | 100.0% | 100.0% |
| **F1 Score** | 100.0% | 100.0% |
| **ROC-AUC** | 100.0% | 100.0% |
| **Algorithm** | TF-IDF + Logistic Regression (Balanced) | Random Forest (120 Estimators, max_depth=12) |
| **Test Set Size** | 168 isolated messages | 111 isolated URLs |

Metrics are accessible directly via `GET /api/admin/metrics` and visualized on the **ML Telemetry** tab.

---

## API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analyze/message` | Analyzes suspicious SMS or chat messages |
| `POST` | `/api/analyze/email` | Analyzes email headers, subject, and body |
| `POST` | `/api/analyze/url` | Inspects domain entropy, syntax, and threat signatures |
| `POST` | `/api/analyze/image` | Ingests screenshot upload, runs OCR, and evaluates |
| `GET` | `/api/history` | Returns paginated audit trail with search & filters |
| `DELETE`| `/api/history/{id}` | Deletes a specific audit record |
| `DELETE`| `/api/history` | Clears all audit history |
| `GET` | `/api/report/{id}` | Generates formal incident report |
| `GET` | `/api/stats` | Computes dynamic dashboard KPIs and distributions |
| `GET` | `/api/threat-intel` | Returns known malicious domains and keyword rules |
| `GET` | `/api/admin/metrics` | Exposes model evaluation scores and confusion matrix |
| `POST` | `/api/auth/demo` | Authenticates instant session as Lead Security Analyst |
| `POST` | `/api/auth/login` | Authenticates existing user |
| `POST` | `/api/auth/register` | Registers new user account |
| `GET` | `/api/health` | Service health status and advisory notice |

---

## Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# Install dependencies
python3 -m pip install -r backend/requirements.txt

# (Optional) Re-generate datasets and retrain models
python3 datasets/generate_datasets.py
python3 scripts/train_models.py

# Launch FastAPI backend
python3 -m uvicorn backend.app:app --host 0.0.0.0 --port 8000
```
Backend will be live at `http://localhost:8000` (API documentation at `http://localhost:8000/docs`).

### 2. Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
Frontend will be available at `http://localhost:5174` (or `http://localhost:5173`).

---

## Security & Ethics Notice

ScamShield AI provides automated advisory threat scores based on statistical patterns and heuristic signatures. Because social engineering evolves rapidly, assessments should never be treated as legal or financial proof. Users should always independently verify unexpected communications with official institutions.
