from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models import cms
from pydantic import BaseModel
from typing import List, Optional, Any

router = APIRouter(prefix="/questions", tags=["questions"])

class QuestionCreate(BaseModel):
    subject_id: int
    type: str # MCQ, TRUE_FALSE, SHORT_ANSWER, CODING
    text: str
    difficulty: str # Easy, Medium, Hard, Expert
    options: Optional[List[dict]] = None
    correct_answer: Optional[str] = None
    test_cases: Optional[List[dict]] = None
    hint: Optional[str] = None
    explanation: str
    points: int = 1
    estimated_time: int
    tags: Optional[List[str]] = None

@router.post("/")
def create_question(q: QuestionCreate, db: Session = Depends(get_db)):
    db_q = cms.Question(**q.dict())
    db.add(db_q)
    db.commit()
    db.refresh(db_q)
    return db_q

@router.get("/")
def list_questions(
    subject_id: Optional[int] = None, 
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(cms.Question)
    if subject_id:
        query = query.filter(cms.Question.subject_id == subject_id)
    if difficulty:
        query = query.filter(cms.Question.difficulty == difficulty)
    return query.all()

@router.delete("/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(cms.Question).filter(cms.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()
    return {"message": "Question deleted"}
