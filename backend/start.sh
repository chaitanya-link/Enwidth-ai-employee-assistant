#!/bin/sh
set -e

if [ ! -d "/app/chroma_data" ] || [ -z "$(ls -A /app/chroma_data 2>/dev/null)" ]; then
  echo "No existing vector database found — building it now..."
  python app/vectorstore.py
else
  echo "Existing vector database found — skipping rebuild to save API quota."
fi

exec uvicorn main:app --host 0.0.0.0 --port 8000 --app-dir app