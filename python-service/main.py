"""
Local, offline image-editing service for the BZ Lifestyle admin dashboard.
Runs InstructPix2Pix on the local GPU — no API key, no billing, no internet
dependency once the model is downloaded.
"""
import base64
import io

import torch
from diffusers import StableDiffusionInstructPix2PixPipeline, EulerAncestralDiscreteScheduler
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from PIL import Image
from pydantic import BaseModel
from rembg import remove, new_session

MODEL_ID = "timbrooks/instruct-pix2pix"

app = FastAPI()
pipe: StableDiffusionInstructPix2PixPipeline | None = None
bg_session = None


@app.on_event("startup")
def load_model():
    global pipe, bg_session
    print(f"Loading {MODEL_ID} onto GPU... (first run downloads ~5GB, please wait)")
    pipe = StableDiffusionInstructPix2PixPipeline.from_pretrained(
        MODEL_ID, torch_dtype=torch.float16, safety_checker=None
    )
    pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
    pipe.to("cuda")
    print("Model ready.")

    print("Loading background-removal model... (first run downloads ~175MB)")
    bg_session = new_session("u2net")
    print("Background-removal model ready.")


class GenerateRequest(BaseModel):
    prompt: str
    image_base64: str


class RemoveBackgroundRequest(BaseModel):
    image_base64: str
    bg_color: str = "#f5f5f5"


@app.get("/health")
def health():
    return {"ready": pipe is not None, "bgRemovalReady": bg_session is not None}


@app.post("/generate")
def generate(req: GenerateRequest):
    if pipe is None:
        return JSONResponse(status_code=503, content={"error": "Model is still loading, try again shortly."})

    try:
        image_bytes = base64.b64decode(req.image_base64)
        source_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        # InstructPix2Pix works best around 512px on the long edge.
        source_image.thumbnail((512, 512))

        result = pipe(
            req.prompt,
            image=source_image,
            num_inference_steps=20,
            image_guidance_scale=1.5,
            guidance_scale=7.5,
        ).images[0]

        buffer = io.BytesIO()
        result.save(buffer, format="PNG")
        encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return {"imageDataUrl": f"data:image/png;base64,{encoded}"}
    except Exception as exc:  # surface a readable message to the Node proxy
        return JSONResponse(status_code=500, content={"error": str(exc)})


@app.post("/remove-background")
def remove_background(req: RemoveBackgroundRequest):
    if bg_session is None:
        return JSONResponse(status_code=503, content={"error": "Background-removal model is still loading, try again shortly."})

    try:
        image_bytes = base64.b64decode(req.image_base64)
        source_image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
        source_image.thumbnail((1024, 1024))

        # Cuts out the foreground subject (the shoe) onto a transparent background.
        cutout = remove(source_image, session=bg_session)

        hex_color = req.bg_color.lstrip("#")
        r, g, b = (int(hex_color[i : i + 2], 16) for i in (0, 2, 4))
        backdrop = Image.new("RGBA", cutout.size, (r, g, b, 255))
        composited = Image.alpha_composite(backdrop, cutout).convert("RGB")

        buffer = io.BytesIO()
        composited.save(buffer, format="PNG")
        encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return {"imageDataUrl": f"data:image/png;base64,{encoded}"}
    except Exception as exc:
        return JSONResponse(status_code=500, content={"error": str(exc)})
