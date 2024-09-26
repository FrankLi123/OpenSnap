from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from loguru import logger
from starlette.types import Message

from saveit.router import snapshot
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/", include_in_schema=False)
async def redirect_root_to_docs():
    return RedirectResponse("/docs")


app.include_router(router=snapshot.router, prefix="/snapshot", tags=["snapshot"])

from fastapi.responses import StreamingResponse
import io


def create_mhtml_content():
    mhtml_content = """From: <Saved by FastAPI>
Subject: Example MHTML
MIME-Version: 1.0
Content-Type: multipart/related;
    type="text/html";
    boundary="----=_NextPart_000_0000_01D77C01.9C1C0100"

This is a multi-part message in MIME format.

------=_NextPart_000_0000_01D77C01.9C1C0100
Content-Type: text/html
Content-Transfer-Encoding: quoted-printable
Content-Location: http://example.com/

<!DOCTYPE html>
<html>
<head>
    <title>MHTML Example</title>
</head>
<body>
    <h1>Hello, MHTML!</h1>
    <p>This is an example of an MHTML file served by FastAPI.</p>
</body>
</html>

------=_NextPart_000_0000_01D77C01.9C1C0100--
"""
    return mhtml_content

from fastapi.responses import Response

@app.get("/mhtml-example")
async def get_mhtml():
    with open("/Users/thomas/repo/014/sAveIt/tests/mhtml server - Google Search.mhtml") as f:
        mhtml_content = f.read()


    return Response(
        content=mhtml_content,
        media_type="application/x-mimearchive"
    )




@app.on_event("startup")
async def startup_event():
    pass
