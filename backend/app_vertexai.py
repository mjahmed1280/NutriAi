import os
import json
from flask import Flask, request, Response, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv

# GenAI SDK
from google import genai
from google.genai.types import HttpOptions, Content

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local"))

app = Flask(__name__)
CORS(app)

# ===============================
# Configuration
# ===============================
PROJECT_ID = "adh-na-433204"
LOCATION = "asia-south1"
MODEL_NAME = "gemini-2.5-flash"

# Service account JSON in SAME directory as app.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KEY_FILE_PATH = os.path.join(BASE_DIR, "sa-vertexai.json")

# Use Application Default Credentials (ADC)
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = KEY_FILE_PATH

# ===============================
# Create GenAI client
# ===============================
try:
    client = genai.Client(
        vertexai=True,
        project=PROJECT_ID,
        location=LOCATION,
        http_options=HttpOptions(api_version="v1"),
    )
    print("✅ GenAI Client initialized successfully")
except Exception as e:
    print(f"❌ Error initializing GenAI Client: {e}")

# ===============================
# Helpers
# ===============================
def format_history(history_list):
    contents = []
    for msg in history_list:
        role = msg.get("role", "user")
        text = msg.get("text") or msg.get("message") or ""
        if text.strip():
            # Must use .parts with a list of { "text": ... }
            contents.append(
                Content(role=role, parts=[{"text": text}])
            )
    return contents

# ===============================
# Routes
# ===============================
@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.json or {}

        message = data.get("message", "")
        history_data = data.get("history", [])
        system_instruction = data.get("systemInstruction")

        contents = []

        if system_instruction:
            contents.append(
                Content(role="system", parts=[{"text": system_instruction}])
            )

        contents.extend(format_history(history_data))

        if message:
            contents.append(
                Content(role="user", parts=[{"text": message}])
            )

        # def generate():
        #     try:
        #         for chunk in client.models.generate_content_stream(
        #             model=MODEL_NAME,
        #             contents=contents,
        #         ):
        #             if chunk.text:
        #                 yield chunk.text
        #     except Exception as e:
        #         print(f"Streaming error: {e}")
        #         yield f"[Error: {str(e)}]"
        
            
        def generate():
            try:
                # If there’s a system instruction, add it as a normal user message
                if system_instruction:
                    # Insert as the first content
                    contents.insert(0, Content(role="user", text=system_instruction))

                # Streaming call (no system_instruction parameter)
                for chunk in client.models.generate_content_stream(
                    model=MODEL_NAME,
                    contents=contents,
                ):
                    if chunk.text:
                        yield chunk.text

            except Exception as e:
                print(f"Streaming error: {e}")
                yield f'[Error: {str(e)}]'

        return Response(
            stream_with_context(generate()),
            mimetype="text/plain",
        )

    except Exception as e:
        print(f"Request error: {e}")
        return Response(
            json.dumps({"error": str(e)}),
            status=500,
            mimetype="application/json",
        )

@app.route("/health", methods=["GET"])
def health():
    return "GenAI Flask Backend Running", 200

# ===============================
# Main
# ===============================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=port, debug=True)
