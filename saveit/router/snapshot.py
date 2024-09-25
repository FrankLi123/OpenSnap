import os.path

from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime
from ..db.models import Snapshot
from ..db.database import DBSession

router = APIRouter()


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

    snapshot_file_name = f"{file.filename}-{datetime.now()}.mhtml"
    # save file to local storage
    parent_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    with open(f"{parent_path}/resources/mhtml/{snapshot_file_name}", "wb") as f:
        f.write(file.file.read())

    snapshot = Snapshot(
        uid=uid,
        url=url,
        file_name=snapshot_file_name,
        created_at=datetime.utcnow()
    )

    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    print(f"File uploaded: {file.filename}, User: {uid}, URL: {url}, ID: {snapshot.id}")

    return {
        "message": "MHTML file uploaded successfully",
        "id": snapshot.id,
        "uid": uid,
        "url": url,
        "file_name": snapshot_file_name,
        "created_at": snapshot.created_at
    }


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
