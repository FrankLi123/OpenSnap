from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from loguru import logger
from starlette.types import Message

from saveit.router import webpage

app = FastAPI()


async def set_body(request: Request, body: bytes):
    async def receive() -> Message:
        return {"type": "http.request", "body": body}

    request._receive = receive


async def get_body(request: Request):
    body = await request.body()
    content_type = request.headers.get("Content-Type")
    await set_body(request, body)
    if content_type == "application/json":
        return body.decode('utf-8')
    else:
        return body


@app.middleware("http")
async def error_handling(request: Request, call_next):
    body = await get_body(request)
    logger.info(f"Request: {request.url} {request.method} {body}")
    response = await call_next(request)
    return response


@app.get("/")
async def redirect_root_to_docs():
    return RedirectResponse("/docs")


app.include_router(router=webpage.router, prefix="/webpage", tags=["webpage"])

@app.on_event("startup")
async def startup_event():
    pass
