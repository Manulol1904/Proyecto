"""Ejecuta: python inspect_model.py [ruta/al/modelo.keras]"""
import sys
from pathlib import Path

from tensorflow import keras

path = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).parent / "model" / "fruit_multioutput_model.keras")
model = keras.models.load_model(path)

print("Ruta:", path)
print("Entrada:", model.input_shape)
print("Salida:", model.output_shape)
if isinstance(model.output, list):
    for i, out in enumerate(model.output):
        print(f"  Salida {i}:", out.shape)
