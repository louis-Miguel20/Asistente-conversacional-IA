from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from services import document_processor

router = APIRouter()

@router.post("/")
async def ingest_document(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None)
):
    if not file and not url:
        raise HTTPException(status_code=400, detail="No file or URL provided")
    
    try:
        if file:
            result = await document_processor.process_file(file)
        else:
            result = await document_processor.process_url(url)
            
        return result
    except Exception as e:
        # Log error
        print(f"Error processing document: {e}")
        raise HTTPException(status_code=500, detail=str(e))
