from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from loguru import logger
from starlette.types import Message

from saveit.router import snapshot

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
    try:
        response = await call_next(request)
    except Exception as e:
        logger.error(f"Request: {request.url} {request.method} {body}")
        logger.exception(e)
        response = {"error": str(e)}
    return response


@app.get("/",include_in_schema=False)
async def redirect_root_to_docs():
    return RedirectResponse("/docs")


app.include_router(router=snapshot.router, prefix="/snapshot", tags=["snapshot"])


@app.on_event("startup")
async def startup_event():
    pass
