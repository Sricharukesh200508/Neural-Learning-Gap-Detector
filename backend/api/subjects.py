from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models import cms
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/subjects", tags=["subjects"])

class SubjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    grade: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    topic_tree: Optional[dict] = None

@router.get("/", response_model=List[dict])
def list_subjects(db: Session = Depends(get_db)):
    subjects = db.query(cms.Subject).all()
    return subjects

@router.post("/")
def create_subject(subject: SubjectCreate, db: Session = Depends(get_db)):
    db_subject = cms.Subject(**subject.dict())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

@router.get("/{subject_id}")
def get_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = db.query(cms.Subject).filter(cms.Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject
