import pypdf
import docx
import requests
from bs4 import BeautifulSoup
from fastapi import UploadFile
from io import BytesIO

async def process_file(file: UploadFile):
    content = await file.read()
    filename = file.filename
    
    text = ""
    try:
        if filename.lower().endswith(".pdf"):
            pdf_reader = pypdf.PdfReader(BytesIO(content))
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
                
        elif filename.lower().endswith(".docx"):
            doc = docx.Document(BytesIO(content))
            for para in doc.paragraphs:
                text += para.text + "\n"
        
        # Normalize text
        text = text.replace('\x00', '') # Remove null bytes
        
        return {"text": text, "filename": filename, "size": len(content), "status": "processed"}
    except Exception as e:
        return {"error": str(e), "filename": filename}

async def process_url(url: str):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove scripts and styles
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
            
        text = soup.get_text()
        
        # Clean text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        return {"text": text, "url": url, "status": "processed"}
    except Exception as e:
        return {"error": str(e), "url": url}
