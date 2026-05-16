FROM python:3.11-slim-bookworm

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    MODEL_PATH=/app/model/fruit_multioutput_model.keras \
    LABELS_PATH=/app/labels.json

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY config.py predictor.py main.py labels.json README.md ./
RUN mkdir -p model
# En Hugging Face subes el .keras en la raíz del Space (no hace falta carpeta model/)
COPY fruit_multioutput_model.keras ./model/fruit_multioutput_model.keras

ENV PORT=7860
EXPOSE 7860

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
