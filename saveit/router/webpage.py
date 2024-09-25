from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from ..db.models import MHTMLContent
from ..db.database import DBSession

router = APIRouter()


def get_db():
    db = DBSession()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def read_root():
    return {"Hello": "World"}


@router.get("/search/{keyword}")
async def search(keyword: str):
    return {"keyword": keyword}


@router.post("/upload/")
async def upload(
    file: UploadFile = File(...),
    identifier: str = Form(...),  # Add this line
    db: Session = Depends(get_db)
):
    try:
        if not file.filename.endswith('.mhtml'):
            raise HTTPException(status_code=400, detail="Only MHTML files are allowed")

        content = await file.read()

        mhtml_content = MHTMLContent(
            filename=file.filename,
            content=content.decode(),
            identifier=identifier  # Add this line
        )
        db.add(mhtml_content)
        db.commit()
        db.refresh(mhtml_content)

        print(f"File uploaded: {file.filename}, User: {identifier}, ID: {mhtml_content.id}")

        return {
            "message": "MHTML file uploaded successfully",
            "id": mhtml_content.id,
            "identifier": identifier
        }
    except Exception as e:
        print(f"Error uploading file: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")