---
title: FreshCheck API
emoji: 🍎
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

API de inferencia para el modelo multi-output EfficientNet (frutas + estado Healthy/Rotten).

Endpoints: `GET /health` · `POST /api/analyze` (multipart, campo `image`)

Sube `fruit_multioutput_model.keras` en la **raíz** del Space (junto al Dockerfile). No hace falta crear la carpeta `model/`.
