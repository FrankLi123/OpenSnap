import base64
import json
import os.path
import aiohttp

from dotenv import load_dotenv
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime

from starlette.responses import HTMLResponse

from ..db.models import Snapshot
from ..db.database import DBSession

from email import message_from_bytes
from email.policy import default
import email
from email import policy
from email.parser import BytesParser
import os

# Load environment variables from .env file
load_dotenv()

router = APIRouter()

BASE_URL = os.getenv("BASE_URL")
PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_SECRET_API_KEY = os.getenv("PINATA_SECRET_API_KEY")


async def encode_and_upload_to_pinata(file_content, file_name):
    # Encode the file content
    encoded_content = base64.b64encode(file_content) .decode('ascii') # .decode('utf-8')

    # Create a JSON object with the encoded content and original filename
    json_data = json.dumps({
        "filename": file_name,
        "content": encoded_content
    })

    # Upload the JSON data to Pinata
    url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
    headers = {
        "Content-Type": "application/json",
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET_API_KEY
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(url, data=json_data, headers=headers) as response:
            if response.status != 200:
                text = await response.text()
                raise HTTPException(status_code=response.status, detail=f"Pinata IPFS error: {text}")
            result = await response.json()
            return result['IpfsHash']


async def fetch_from_ipfs(ipfs_hash):
    url = f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                raise HTTPException(status_code=response.status, detail="Failed to fetch IPFS content")
            content = await response.json()
            return base64.b64decode(content['content']) # return base64.b64decode(content['content']).decode('utf-8')


def get_db():
    db = DBSession()
    try:
        yield db
    finally:
        db.close()


@router.post("/upload/")
async def upload(
        file: UploadFile = File(...),
        uid: str = Form(...),
        url: str = Form(...),
        db: Session = Depends(get_db)
):
    if not file.filename.endswith('.mhtml'):
        raise HTTPException(status_code=400, detail="Only MHTML files are allowed")

    # save the file to ipfs and get an ipfs hash
    file_content = await file.read()

    ipfs_hash = await encode_and_upload_to_pinata(file_content, file.filename)

    snapshot = Snapshot(
        uid=uid,
        url=url,
        file_name=file.filename,
        ipfs_hash=ipfs_hash,
        created_at=datetime.utcnow()
    )

    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    print(f"File uploaded: {file.filename}, User: {uid}, URL: {url}, ID: {snapshot.id}")

    display_url = f"{BASE_URL}/snapshot/display/{snapshot.id}"

    return {
        "message": "MHTML file uploaded successfully",
        "id": snapshot.id,
        "uid": uid,
        "url": url,
        "file_name": file.filename,
        "ipfs_hash": ipfs_hash,
        "created_at": snapshot.created_at,
        "display_url": display_url
    }


def mhtml_to_html(mhtml_content):
    # 解析MHTML内容
    msg = BytesParser(policy=policy.default).parsebytes(mhtml_content)

    # 初始化HTML和CSS内容
    html_contents = []
    css_content = ''

    # 遍历各部分
    for part in msg.walk():
        content_type = part.get_content_type()
        charset = part.get_content_charset() or 'utf-8'

        if content_type == 'text/html':
            try:
                html_content = part.get_payload(decode=True).decode(charset)
                html_contents.append(html_content)
            except (UnicodeDecodeError, LookupError) as e:
                print(f"Failed to decode HTML with charset {charset}: {e}")

        elif content_type == 'text/css':
            try:
                css_content += part.get_payload(decode=True).decode(charset) + '\n'
            except (UnicodeDecodeError, LookupError) as e:
                print(f"Failed to decode CSS with charset {charset}: {e}")

    if not html_contents:
        raise ValueError("No HTML content found in the MHTML file")

    # 合并HTML内容
    combined_html = ''
    for html in html_contents:
        # 在每个HTML的<head>部分插入CSS
        if css_content:
            css_tag = f'<style>\n{css_content}</style>'
            if '<head>' in html:
                html = html.replace('<head>', f'<head>\n{css_tag}', 1)
            else:
                html = css_tag + html
        combined_html += html

    return combined_html


@router.get("/display/{snapshot_id}", response_class=HTMLResponse)
async def display_snapshot(snapshot_id: int, db: Session = Depends(get_db)):
    snapshot = db.query(Snapshot).filter(Snapshot.id == snapshot_id).first()
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found")

    try:
        mhtml_content = await fetch_from_ipfs(snapshot.ipfs_hash)
        return HTMLResponse(content=mhtml_to_html(mhtml_content))

        raise HTTPException(status_code=500, detail="No HTML content found in MHTML file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to display MHTML content: {str(e)}")

@router.get("/list_snapshots/{uid}", response_model=List[dict])
async def list_snapshots(
        uid: str,
        offset: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    snapshots = db.query(Snapshot).filter(Snapshot.uid == uid).order_by(desc(Snapshot.created_at)).offset(offset).limit(
        limit).all()
    return [
        {
            "id": snapshot.id,
            "uid": snapshot.uid,
            "url": snapshot.url,
            "ipfs_hash": snapshot.ipfs_hash,
            "file_name": snapshot.file_name,
            "created_at": snapshot.created_at
        } for snapshot in snapshots
    ]


@router.get("/latest_snapshots/")
async def latest_snapshot(
        db: Session = Depends(get_db)
):
    snapshots = db.query(Snapshot).order_by(desc(Snapshot.created_at)).all()
    return [
        {
            "id": snapshot.id,
            "uid": snapshot.uid,
            "url": snapshot.url,
            "ipfs_hash": snapshot.ipfs_hash,
            "file_name": snapshot.file_name,
            "created_at": snapshot.created_at
        } for snapshot in snapshots
    ]
