import logging
import os
import time

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from predictor import Predictor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FreshCheck API", version="1.0.0")
predictor = Predictor()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    try:
        predictor.load()
    except FileNotFoundError as exc:
        logger.error("%s", exc)
        raise


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "freshcheck-api", "health": "/health", "analyze": "/api/analyze"}


@app.post("/api/analyze")
async def analyze(image: UploadFile = File(...)) -> dict:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")

    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="Imagen vacía")

    max_bytes = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail="Imagen demasiado grande")

    start = time.perf_counter()
    try:
        result = predictor.predict_from_bytes(data)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Error en inferencia")
        raise HTTPException(status_code=500, detail="Error al procesar la imagen") from exc

    result["latency"] = round((time.perf_counter() - start) * 1000)
    return result
