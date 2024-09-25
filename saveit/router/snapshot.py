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


@router.get("/display/{snapshot_id}", response_class=HTMLResponse)
async def display_snapshot(snapshot_id: int, db: Session = Depends(get_db)):
    snapshot = db.query(Snapshot).filter(Snapshot.id == snapshot_id).first()
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found")

    try:
        mhtml_content = await fetch_from_ipfs(snapshot.ipfs_hash)

        # Ensure mhtml_content is bytes
        if isinstance(mhtml_content, str):
            mhtml_content = mhtml_content.encode('utf-8')

        # Parse the MHTML content
        msg = message_from_bytes(mhtml_content, policy=default)

        # Extract the HTML content
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                html_content = part.get_payload(decode=True)
                # Ensure html_content is str
                if isinstance(html_content, bytes):
                    html_content = html_content.decode(part.get_content_charset() or 'utf-8')
                return HTMLResponse(content=html_content)

        raise HTTPException(status_code=500, detail="No HTML content found in MHTML file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to display MHTML content: {str(e)}")

@router.get("/list_snapshots/", response_model=List[dict])
async def list_snapshots(
        uid: str,
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    snapshots = db.query(Snapshot).filter(Snapshot.uid == uid).order_by(desc(Snapshot.created_at)).offset(skip).limit(
        limit).all()
    return [
        {
            "id": snapshot.id,
            "uid": snapshot.uid,
            "url": snapshot.url,
            "file_name": snapshot.file_name,
            "created_at": snapshot.created_at
        } for snapshot in snapshots
    ]


@router.get("/search/{keyword}")
async def search(keyword: str):
    return {"keyword": keyword}
