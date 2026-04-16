from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, JSON, Float, Table, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum
from datetime import datetime

Base = declarative_base()

class DifficultyLevel(enum.Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"
    EXPERT = "Expert"

class QuestionType(enum.Enum):
    MCQ = "MCQ"
    TRUE_FALSE = "True/False"
    SHORT_ANSWER = "Short Answer"
    CODING = "Coding"

# Relationships for Quiz-Question mapping
quiz_question_association = Table(
    'quiz_question', Base.metadata,
    Column('quiz_id', Integer, ForeignKey('quizzes.id')),
    Column('question_id', Integer, ForeignKey('questions.id')),
    Column('order', Integer)
)

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, PRIMARY KEY=True, index=True)
    name = Column(String(100), unique=True, index=True)
    description = Column(Text)
    grade = Column(String(20))
    icon = Column(String(50)) # Emoji or Lucide icon name
    color = Column(String(20)) # Tailind color class
    topic_tree = Column(JSON) # Hierarchical JSON of topics -> concepts
    created_at = Column(DateTime, default=datetime.utcnow)

    questions = relationship("Question", back_populates="subject")
    quizzes = relationship("Quiz", back_populates="subject")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, PRIMARY KEY=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    type = Column(Enum(QuestionType))
    text = Column(Text) # Supports Markdown + LaTeX
    difficulty = Column(Enum(DifficultyLevel))
    options = Column(JSON) # For MCQs: [{"id": "a", "text": "...", "is_correct": bool}]
    correct_answer = Column(Text) # For short answer/coding
    test_cases = Column(JSON) # For coding: [{"input": "...", "expected": "..."}]
    hint = Column(Text, nullable=True)
    explanation = Column(Text)
    points = Column(Integer, default=1)
    estimated_time = Column(Integer) # In seconds
    tags = Column(JSON) # List of strings
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject", back_populates="questions")

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, PRIMARY KEY=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    title = Column(String(200))
    description = Column(Text)
    duration_minutes = Column(Integer)
    total_marks = Column(Integer)
    
    # Settings
    allow_multiple_attempts = Column(Boolean, default=False)
    proctoring_enabled = Column(Boolean, default=True)
    randomize_questions = Column(Boolean, default=True)
    passing_score_pct = Column(Float, default=40.0)
    
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)

    subject = relationship("Subject", back_populates="quizzes")
    questions = relationship("Question", secondary=quiz_question_association)
    attempts = relationship("QuizAttempt", back_populates="quiz")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id = Column(Integer, PRIMARY KEY=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    student_id = Column(String(100)) # Linked to Supabase User ID
    score = Column(Float, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Advanced Telemetry Summary
    engagement_avg = Column(Float)
    proctoring_flags_count = Column(Integer, default=0)
    behavioral_summary = Column(JSON) # Llama-generated feedback

    quiz = relationship("Quiz", back_populates="attempts")
    responses = relationship("QuestionResponse", back_populates="attempt")

class QuestionResponse(Base):
    __tablename__ = "question_responses"
    id = Column(Integer, PRIMARY KEY=True, index=True)
    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    answer_given = Column(Text)
    is_correct = Column(Boolean)
    time_spent = Column(Integer) # Seconds spent on this question
    
    attempt = relationship("QuizAttempt", back_populates="responses")
