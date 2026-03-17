"""
/api/upload — Accept file uploads (PDF, DOCX, TXT) and extract text.
"""

import logging
import tempfile
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from agents.tools.parsers import extract_text

logger = logging.getLogger(__name__)
router = APIRouter()


class UploadResponse(BaseModel):
    text: str
    filename: str
    file_type: str


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Accept a file upload (PDF, DOCX, TXT) and extract readable text.
    Returns the extracted text which can then be sent to /api/analyze.
    """
    try:
        # Validate file type
        file_ext = file.filename.split('.')[-1].lower() if file.filename else ''
        if file_ext not in ['pdf', 'docx', 'doc', 'txt']:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: .{file_ext}. Please upload PDF, DOCX, or TXT files."
            )

        # Save uploaded file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_ext}') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            # Extract text using our parser
            extracted_text = extract_text(tmp_path)
            
            logger.info(f"Successfully extracted {len(extracted_text)} characters from {file.filename}")
            
            return UploadResponse(
                text=extracted_text,
                filename=file.filename or "unknown",
                file_type=file_ext
            )
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    except ValueError as e:
        # Raised by extract_text for corrupted/unreadable files
        logger.error(f"File extraction failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("File upload failed")
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")
