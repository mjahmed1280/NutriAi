# NutriAI - Your Personal AI Nutritionist

**Live Demo:** [https://nutri-ai-bot.vercel.app/](https://nutri-ai-bot.vercel.app/)

NutriAI is a web application designed to provide personalized nutrition and lifestyle advice. It leverages the power of **NVIDIA NIM** (via the `meta/llama-4-maverick-17b-128e-instruct` model) to generate evidence-based, empathetic, and context-aware responses based on user profiles.

## 🚀 Features

- **Personalized Onboarding:** Collects user details like age, goals, dietary preferences, and allergies to tailor advice.
- **AI-Powered Chat:** Real-time streaming chat interface powered by large language models via NVIDIA NIM.
- **Interactive UI:** Modern, responsive design built with React and Tailwind CSS.
- **Context Awareness:** The AI remembers your profile and conversation context to provide relevant suggestions.
- **Suggestion Engine:** Automatically generates follow-up questions or topic suggestions.
- **Rate Limiting:** Enforces a global daily limit of 50 API calls to manage costs.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **API Proxy:** Vercel Edge Functions (Serverless)
- **AI Model:** NVIDIA NIM (Llama 4 Maverick)
- **Database:** Vercel KV (Upstash Redis) for Rate Limiting

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **NVIDIA NIM API Key**
- **Vercel KV Store** (for production rate limiting)

## ⚙️ Installation & Setup

This project uses a serverless architecture. The `frontend` folder contains everything needed for both local development and deployment. The Python `backend` folder is legacy/optional and not required for the Vercel deployment.

### Local Development

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    -   Create a `.env` file in the `frontend/` directory.
    -   Add your NVIDIA NIM API key:
        ```env
        VITE_NIM_KEY=nvapi-your-key-here
        VITE_AI_PROVIDER=nim
        ```

4.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will run on `http://localhost:3000`.

    *Note: In development, the app uses a Vite proxy (`/nim-api`) to call the NVIDIA API directly, bypassing CORS and Rate Limiting.*

## 🚀 Deployment (Vercel)

The application is optimized for Vercel.

1.  **Push to GitHub.**
2.  **Import to Vercel:**
    -   Set **Root Directory** to `frontend`.
    -   **Framework Preset:** Vite.
3.  **Integrations:**
    -   Connect a **Vercel KV** store (Storage tab) to your project. This automatically sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
4.  **Environment Variables:**
    -   Add `NIM_KEY` (Your NVIDIA API Key).

## 📂 Project Structure

```text
/
├── frontend/           # React App & Serverless Functions
│   ├── api/            # Vercel Serverless Functions (nim.js)
│   ├── components/     # UI Components
│   ├── services/       # API Integration (geminiService.ts)
│   └── ...
├── backend/            # (Legacy) Python Flask Server
└── ARCHITECTURE.md     # Detailed Architectural Documentation
```

## ⚠️ Disclaimer

NutriAI is an AI tool for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider regarding any medical condition.