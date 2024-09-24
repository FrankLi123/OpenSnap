from fastapi import APIRouter

router = APIRouter()


@router.get("/search/{keyword}")
async def search(keyword: str):
    return {"keyword": keyword}


@router.post("/upload/")
async def upload():
    return {"message": "File uploaded successfully"}
