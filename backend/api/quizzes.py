from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models import cms
from pydantic import BaseModel
from typing import List, Optional
import random

router = APIRouter(prefix="/quizzes", tags=["quizzes"])

class QuizCreate(BaseModel):
    subject_id: int
    title: str
    description: str
    duration_minutes: int
    total_marks: int
    proctoring_enabled: bool = True
    passing_score_pct: float = 40.0

@router.post("/")
def create_quiz(quiz: QuizCreate, db: Session = Depends(get_db)):
    db_quiz = cms.Quiz(**quiz.dict())
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@router.post("/{quiz_id}/generate-questions")
def auto_generate_questions(
    quiz_id: int, 
    distribution: dict, # {"Easy": 5, "Medium": 10, "Hard": 5}
    db: Session = Depends(get_db)
):
    quiz = db.query(cms.Quiz).filter(cms.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    selected_questions = []
    for diff, count in distribution.items():
        questions = db.query(cms.Question).filter(
            cms.Question.subject_id == quiz.subject_id,
            cms.Question.difficulty == diff
        ).all()
        
        if len(questions) < count:
            raise HTTPException(status_code=400, detail=f"Not enough {diff} questions in bank")
            
        selected_questions.extend(random.sample(questions, count))
    
    # Associate questions with quiz
    quiz.questions = selected_questions
    db.commit()
    return {"message": f"Successfully added {len(selected_questions)} questions to quiz"}

@router.get("/{quiz_id}")
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(cms.Quiz).filter(cms.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return {
        "id": quiz.id,
        "title": quiz.title,
        "questions": [
            {"id": q.id, "text": q.text, "type": q.type.value, "options": q.options if q.type == cms.QuestionType.MCQ else None}
            for q in quiz.questions
        ]
    }
