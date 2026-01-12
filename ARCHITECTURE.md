# Project Architecture Documentation

## Overview

This project is a **Serverless Full-Stack Chat Application** powered by **NVIDIA NIM**. It uses a modern React frontend hosted on Vercel, utilizing Vercel Edge Functions to securely proxy API requests to NVIDIA's inference endpoints and Vercel KV for rate limiting.

## Directory Structure

```text
/
├── frontend/           # Main Application (React + Serverless API)
│   ├── api/            # Vercel Serverless Functions
│   ├── components/     # React UI Components
│   └── services/       # Frontend Logic
├── backend/            # (Legacy) Python Flask API server
└── ARCHITECTURE.md     # This documentation
```

## 1. Frontend Service (The Core)

The application is a Single Page Application (SPA) built with React.

- **Directory:** `frontend/`
- **Framework:** React 19 (Vite)
- **Language:** TypeScript
- **State Management:** React Hooks + LocalStorage
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

### Key Components
- **`frontend/components/ChatWindow.tsx`**: Handles chat UI, markdown rendering, and user input.
- **`frontend/services/geminiService.ts`**: The intelligent service layer that switches logic based on the environment:
  - **Development:** Calls local Vite proxy (`/nim-api/chat/completions`) using client-side key.
  - **Production:** Calls Vercel Serverless Function (`/api/nim`) to keep the key secure.

## 2. Serverless API (Production Backend)

Instead of a standalone backend server, we use Vercel Edge Functions to secure the API key.

- **File:** `frontend/api/nim.js`
- **Runtime:** Vercel Edge Runtime
- **Purpose:** Receives requests from the frontend, injects the `NIM_KEY`, checks Rate Limits via KV, and proxies the request to NVIDIA.

## 3. Integration Data Flow

### A. Local Development Flow
1.  **Browser:** Sends request to `http://localhost:3000/nim-api/chat/completions`.
2.  **Vite Proxy:** Rewrites URL -> `https://integrate.api.nvidia.com/v1/chat/completions`.
3.  **Authentication:** Uses `VITE_NIM_KEY` from local `.env`.
4.  **Response:** Streams directly back to the browser.
    *   *Note: Rate limiting is bypassed in local dev.*

### B. Production Flow (Vercel)
1.  **Browser:** Sends request to `/api/nim` (Relative URL).
2.  **Vercel Edge Function (`api/nim.js`):**
    -   **Security Check:** Verifies Origin/Referer.
    -   **Rate Limit Check:**
        -   Connects to Vercel KV (Upstash Redis).
        -   Increments daily counter: `nutriai_global_limit_{YYYY-MM-DD}`.
        -   If > 50, returns `429 Too Many Requests`.
    -   **NIM Proxy:**
        -   Reads `NIM_KEY` from secure Vercel Environment Variables.
        -   Forwards request to NVIDIA NIM API.
3.  **NVIDIA:** Processes request and streams response.
4.  **Edge Function:** Streams the response back to the client.

## 4. Environment Variables

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `VITE_NIM_KEY` | Local Dev | Your NVIDIA API Key (in `frontend/.env`). |
| `VITE_AI_PROVIDER` | Frontend | Set to `nim`. |
| `NIM_KEY` | Production | Your NVIDIA API Key (Set in Vercel Settings). |
| `ratelimitstore_KV_REST_API_URL` | Production | Vercel KV Connection URL (from 'ratelimitstore' integration). |
| `ratelimitstore_KV_REST_API_TOKEN` | Production | Vercel KV Auth Token (from 'ratelimitstore' integration). |

## 5. Legacy Backend
The `backend/` folder contains the original Python Flask implementation. It is currently **not used** in the deployed Vercel version but serves as a reference or alternative deployment option (e.g., for Docker/Cloud Run).