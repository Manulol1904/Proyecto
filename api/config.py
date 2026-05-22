import json
import os
from dataclasses import dataclass
from pathlib import Path

API_DIR = Path(__file__).resolve().parent
DEFAULT_LABELS_PATH = API_DIR / "labels.json"


def _resolve_model_path(filename: str) -> Path:
    explicit = os.getenv("MODEL_PATH")
    if explicit:
        return Path(explicit)

    candidates = [
        API_DIR / filename,
        API_DIR / "model" / filename,
    ]
    for path in candidates:
        if path.is_file():
            return path

    return candidates[1]


@dataclass(frozen=True)
class ModelConfig:
    model_path: Path
    input_width: int
    input_height: int
    normalize: str
    fruit_classes: list[str]
    state_classes: list[str]
    state_to_condition: dict[str, str]
    vegetables: frozenset[str]


def load_config() -> ModelConfig:
    labels_path = Path(os.getenv("LABELS_PATH", str(DEFAULT_LABELS_PATH)))

    with labels_path.open(encoding="utf-8") as f:
        raw = json.load(f)

    model_filename = raw.get("model_file", "fruit_multioutput_model.keras")
    model_path = _resolve_model_path(model_filename)

    return ModelConfig(
        model_path=model_path,
        input_width=int(raw.get("input_width", 224)),
        input_height=int(raw.get("input_height", 224)),
        normalize=str(raw.get("normalize", "efficientnet")),
        fruit_classes=list(raw["fruit_classes"]),
        state_classes=list(raw["state_classes"]),
        state_to_condition=dict(raw["state_to_condition"]),
        vegetables=frozenset(raw.get("vegetables", [])),
    )
