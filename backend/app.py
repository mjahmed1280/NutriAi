import os
import json
import requests
from flask import Flask, request, Response, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv

# Load env vars (.env must contain NIM_KEY)
load_dotenv(".env.backend")

app = Flask(__name__)
CORS(app)

# ===============================
# Configuration
# ===============================
NIM_API_KEY = os.getenv("NIM_KEY")
INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
MODEL_NAME = "meta/llama-4-maverick-17b-128e-instruct"  # or your preferred model

if not NIM_API_KEY:
    raise ValueError("NIM_KEY not set in environment variables")

# ===============================
# Streaming helper for NIM
# ===============================
def stream_nim_response(messages):
    """
    Generator that connects to NIM's streaming chat API and yields chunks.
    """
    headers = {
        "Authorization": f"Bearer {NIM_API_KEY}",
        "Accept": "text/event-stream",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "max_tokens": 1024,
        "temperature": 0.5,
        "top_p": 1.0,
        "stream": True
    }

    try:
        # Stream request
        response = requests.post(INVOKE_URL, headers=headers, json=payload, stream=True)
        response.raise_for_status()

        # Read SSE lines
        for line in response.iter_lines():
            if line:
                decoded = line.decode("utf-8")
                # SSE sends lines prefixed with "data: "
                if decoded.startswith("data: "):
                    json_str = decoded[len("data: "):]
                    if json_str.strip() and json_str.strip() != "[DONE]":
                        try:
                            obj = json.loads(json_str)
                            # The NIM API returns delta content like OpenAI
                            choices = obj.get("choices")
                            if choices and choices[0].get("delta"):
                                content = choices[0]["delta"].get("content")
                                if content:
                                    yield content
                        except json.JSONDecodeError:
                            # Ignore parse errors
                            pass

    except requests.exceptions.RequestException as e:
        yield f"[Error calling NIM API: {str(e)}]"


# ===============================
# Flask routes
# ===============================
@app.route("/api/nim-chat", methods=["POST"])
def nim_chat():
    """
    POST body expected:
    {
      "messages": [
        {"role": "system", "content": "..."},
        {"role": "user", "content": "..."},
        ...
      ]
    }
    """
    try:
        data = request.get_json(force=True)
        messages = data.get("messages", [])

        # Validate required fields
        if not isinstance(messages, list):
            return Response(json.dumps({"error": "Invalid 'messages' format"}), status=400)

        return Response(
            stream_with_context(stream_nim_response(messages)),
            mimetype="text/plain"
        )

    except Exception as ex:
        return Response(json.dumps({"error": str(ex)}), status=500, mimetype="application/json")


@app.route("/health", methods=["GET"])
def health():
    return "NIM Flask Backend Running", 200


# ===============================
# Run Server
# ===============================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
