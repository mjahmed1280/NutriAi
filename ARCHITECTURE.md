# Project Architecture Documentation

## Overview

This project is a **Full-Stack Chat Application** powered by **NVIDIA NIM (Nutrition Intelligence Model)**. It uses a modern React frontend and a Python-based backend, hosted as separate services.

## Directory Structure

```text
/
├── frontend/           # React + TypeScript application
├── backend/            # Python Flask API server (NIM Integration)
└── ARCHITECTURE.md     # This documentation
```

## 1. Frontend Service

The frontend is a modern Single Page Application (SPA) built with React.

- **Directory:** `frontend/`
- **Framework:** React 19 (Vite)
- **Language:** TypeScript
- **State Management:** React Hooks (`useState`, `useEffect`) + LocalStorage
- **Styling:** Tailwind CSS (via CDN)
- **Running Port:** `http://localhost:3000` (Default)

### Key Components
- **`frontend/components/ChatWindow.tsx`**: The core chat interface handling message display, markdown rendering, and user input.
- **`frontend/services/geminiService.ts`**: The API client. Connects to the NIM backend.
  - **Configuration:** Reads `VITE_BACKEND_URL` environment variable. Defaults to `http://localhost:5000/api/nim-chat`.

### Setup & Run
```bash
cd frontend
npm install
npm run dev
```

## 2. Backend Service (Production)

The backend is a Flask server that acts as a secure proxy to NVIDIA's NIM API.

- **Directory:** `backend/`
- **File:** `backend/app_nim.py` (Production Entry Point)
- **Framework:** Flask
- **Language:** Python 3
- **Running Port:** `http://localhost:5000` (Default)
- **Provider:** NVIDIA NIM (via `integrate.api.nvidia.com`)

### Key Files
- **`backend/app_nim.py`**: The main server entry point for production.
- **`backend/.env.backend`**: Configuration file containing secrets.
- **`backend/requirements.txt`**: Python dependencies (`flask`, `flask-cors`, `requests`, `python-dotenv`).

### Configuration
The backend requires a `.env.backend` file in the `backend/` directory with the following key:
```env
NIM_KEY=nvapi-...
```

### Setup & Run
```bash
cd backend
# Recommended: Create a virtual environment
# python -m venv venv
# source venv/bin/activate  # or venv\Scripts\activate on Windows

pip install -r requirements.txt
python app_nim.py
```

## 3. Integration Data Flow

1.  **User Input:** User types a message in the Frontend `ChatWindow`.
2.  **API Call:** `geminiService` sends a `POST` request to `http://localhost:5000/api/nim-chat`.
    -   Payload: `{ "messages": [ {"role": "system", "content": "..."}, {"role": "user", "content": "..."} ] }`
3.  **Proxy:** Backend (`app_nim.py`) receives the request.
4.  **NIM Processing:** Backend forwards the request to NVIDIA NIM API using the `NIM_KEY`.
5.  **Streaming:** Backend streams the text chunks back to the Frontend via Server-Sent Events (SSE) logic.
6.  **Display:** Frontend accumulates chunks and renders Markdown in real-time.

## 4. Deployment

-   **Frontend:** Deploy to Vercel, Netlify, or similar. Set `VITE_BACKEND_URL` to your production backend URL.
-   **Backend:** Deploy `app_nim.py` to a container service (Cloud Run, Docker, etc.). Ensure `NIM_KEY` is set as an environment variable.