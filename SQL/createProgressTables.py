from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Boolean, TIMESTAMP, UniqueConstraint, \
    DateTime
#import sqlalchemy.orm.declarative_base
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


# Set up database connection (adjust the URI as needed)
DATABASE_URI = 'postgresql://postgres:postgres@localhost/KettoLingo'
engine = create_engine(DATABASE_URI)
Session = sessionmaker(bind=engine)
session = Session()

# Base model
Base = declarative_base()


# Define tables in order

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(200), nullable=False)

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)

class Language(Base):
    __tablename__ = "languages"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)

class Word(Base):
    __tablename__ = "words"
    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    english = Column(String(100), nullable=True)
    hungarian = Column(String(100), nullable=True)
    german = Column(String(100), nullable=True)
    slovak = Column(String(100), nullable=True)
    czech = Column(String(100), nullable=True)
    italian = Column(String(100), nullable=True)

class UserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    learned_words = Column(Integer, default=0)
    quiz_score = Column(Integer, default=0)

class UserKnownWord(Base):
    __tablename__ = "user_known_words"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    word_id = Column(Integer, ForeignKey("words.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

class QuizResult(Base):
    __tablename__ = "quiz_results"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    score = Column(Integer, nullable=False)

class QuizResultDetail(Base):
    __tablename__ = "quiz_results_detailed"
    id = Column(Integer, primary_key=True)
    quiz_result_id = Column(Integer, ForeignKey("quiz_results.id"), nullable=False)
    word_id = Column(Integer, ForeignKey("words.id"), nullable=False)
    is_correct = Column(Integer, nullable=False)

# Create tables
Base.metadata.create_all(engine)