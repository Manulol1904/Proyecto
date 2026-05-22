from __future__ import annotations

import io
import logging
from typing import Any

import numpy as np
from PIL import Image
from tensorflow import keras
from tensorflow.keras.applications.efficientnet import preprocess_input

from config import load_config

logger = logging.getLogger(__name__)


class Predictor:
    def __init__(self) -> None:
        self.config = load_config()
        self.model: keras.Model | None = None

    def load(self) -> None:
        path = self.config.model_path
        if not path.is_file():
            raise FileNotFoundError(
                f"No se encontró el modelo en {path}. "
                "Descarga desde Colab 'fruit_multioutput_model.keras' y colócalo en api/ o api/model/"
            )

        logger.info("Cargando modelo desde %s", path)
        self.model = keras.models.load_model(path)
        logger.info("Salidas del modelo: %s", self.model.output_names)

    def _preprocess(self, image: Image.Image) -> np.ndarray:
        cfg = self.config
        rgb = image.convert("RGB").resize(
            (cfg.input_width, cfg.input_height),
            Image.Resampling.BILINEAR,
        )
        arr = np.asarray(rgb, dtype=np.float32)

        if cfg.normalize == "efficientnet":
            arr = preprocess_input(arr)
        elif cfg.normalize == "imagenet":
            arr = arr / 255.0
            mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
            std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
            arr = (arr - mean) / std
        else:
            arr = arr / 255.0

        return np.expand_dims(arr, axis=0)

    @staticmethod
    def _softmax(logits: np.ndarray) -> np.ndarray:
        logits = logits.astype(np.float64)
        logits = logits - np.max(logits)
        exp = np.exp(logits)
        return exp / np.sum(exp)

    @staticmethod
    def _as_probabilities(vector: np.ndarray) -> np.ndarray:
        if np.all(vector >= 0) and np.isclose(vector.sum(), 1.0, atol=1e-3):
            return vector.astype(np.float64)
        return Predictor._softmax(vector)

    def _normalize_outputs(self, raw: Any) -> list[np.ndarray]:
        if isinstance(raw, dict):
            fruit = raw.get("fruit_output")
            state = raw.get("state_output")
            if fruit is None or state is None:
                raise ValueError(
                    f"Salidas del modelo no reconocidas: {list(raw.keys())}. "
                    "Se esperan 'fruit_output' y 'state_output'."
                )
            return [np.asarray(fruit), np.asarray(state)]

        if isinstance(raw, (list, tuple)):
            if len(raw) < 2:
                raise ValueError("El modelo multi-output debe devolver 2 tensores.")
            return [np.asarray(raw[0]), np.asarray(raw[1])]

        raise ValueError(f"Tipo de salida no soportado: {type(raw)}")

    def _produce_type(self, fruit_name: str) -> str:
        return "Vegetable" if fruit_name in self.config.vegetables else "Fruit"

    def _decode_multi_output(self, outputs: list[np.ndarray]) -> dict[str, Any]:
        cfg = self.config
        fruit_probs = self._as_probabilities(outputs[0][0])
        state_probs = self._as_probabilities(outputs[1][0])

        fruit_index = int(np.argmax(fruit_probs))
        state_index = int(np.argmax(state_probs))

        if fruit_index >= len(cfg.fruit_classes):
            raise ValueError(
                f"Índice de fruta {fruit_index} fuera de rango "
                f"(esperadas {len(cfg.fruit_classes)} clases)."
            )
        if state_index >= len(cfg.state_classes):
            raise ValueError(
                f"Índice de estado {state_index} fuera de rango "
                f"(esperadas {len(cfg.state_classes)} clases)."
            )

        fruit_name = cfg.fruit_classes[fruit_index]
        state_name = cfg.state_classes[state_index]
        condition = cfg.state_to_condition.get(state_name, state_name)

        return {
            "produceName": fruit_name,
            "produceType": self._produce_type(fruit_name),
            "condition": condition,
            "fruitTypeConfidence": round(float(fruit_probs[fruit_index] * 100.0), 1),
            "conditionConfidence": round(float(state_probs[state_index] * 100.0), 1),
            "modelState": state_name,
        }

    def predict_from_bytes(self, data: bytes) -> dict[str, Any]:
        if self.model is None:
            raise RuntimeError("El modelo no está cargado")

        image = Image.open(io.BytesIO(data))
        batch = self._preprocess(image)
        raw = self.model.predict(batch, verbose=0)
        outputs = self._normalize_outputs(raw)
        result = self._decode_multi_output(outputs)
        result.pop("modelState", None)
        return result
