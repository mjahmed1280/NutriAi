# NutriAI - Your Personal AI Nutritionist

NutriAI is a full-stack web application designed to provide personalized nutrition and lifestyle advice. It leverages the power of **NVIDIA NIM (Nutrition Intelligence Model)** to generate evidence-based, empathetic, and context-aware responses based on user profiles.

## 🚀 Features

- **Personalized Onboarding:** Collects user details like age, goals, dietary preferences, and allergies to tailor advice.
- **AI-Powered Chat:** Real-time streaming chat interface powered by large language models via NVIDIA NIM.
- **Interactive UI:** Modern, responsive design built with React and Tailwind CSS.
- **Context Awareness:** The AI remembers your profile and conversation context to provide relevant suggestions.
- **Suggestion Engine:** Automatically generates follow-up questions or topic suggestions.

## 🛠️ Tech Stack

- **Frontend:**
  - React 19
  - TypeScript
  - Vite
  - Tailwind CSS
- **Backend:**
  - Python 3
  - Flask
  - NVIDIA NIM API Integration

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **NVIDIA NIM API Key**

## ⚙️ Installation & Setup

The project is divided into two separate services: `frontend` and `backend`.

### 1. Backend Setup

The backend acts as a secure proxy to the NVIDIA NIM API.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment (recommended):
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate

    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Configure environment variables:
    -   Create a file named `.env.backend` in the `backend/` directory.
    -   Add your NVIDIA NIM API key:
        ```env
        NIM_KEY=nvapi-your-key-here
        ```

5.  Start the server:
    ```bash
    python app_nim.py
    ```
    The backend will run on `http://localhost:5000`.

### 2. Frontend Setup

The frontend is a React application that connects to the backend.

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will run on `http://localhost:3000`.

## 🏃‍♂️ Running the Application

1.  Ensure the **Backend** is running (`python app_nim.py`).
2.  Ensure the **Frontend** is running (`npm run dev`).
3.  Open your browser and navigate to `http://localhost:3000`.
4.  Complete the onboarding process and start chatting with your AI Nutritionist!

## 📂 Project Structure

```text
/
├── frontend/           # React + TypeScript Client
│   ├── components/     # UI Components (ChatWindow, Onboarding, etc.)
│   ├── services/       # API Integration (geminiService.ts)
│   └── ...
├── backend/            # Python Flask Server
│   ├── app_nim.py      # Production Server (NVIDIA NIM)
│   ├── requirements.txt
│   └── ...
└── ARCHITECTURE.md     # Detailed Architectural Documentation
```

## ⚠️ Disclaimer

NutriAI is an AI tool for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider regarding any medical condition.