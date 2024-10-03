from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# This instance should be initialized by app.py
db = SQLAlchemy()


# User Model
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.password = password


# Token Blocklist Model
class TokenBlocklist(db.Model):
    __tablename__ = 'token_blocklist'
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)

    def __init__(self, jti):
        self.jti = jti
        self.created_at = datetime.utcnow()





# Language Model
class Language(db.Model):
    __tablename__ = 'languages'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)


# Category Model
class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)


# Words Model
class Word(db.Model):
    __tablename__ = 'words'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    category = db.relationship('Category', backref=db.backref('words', lazy=True))
    english = db.Column(db.String(100), nullable=False)
    hungarian = db.Column(db.String(100), nullable=False)
    german = db.Column(db.String(100), nullable=False)
    slovak = db.Column(db.String(100), nullable=False)
    czech = db.Column(db.String(100), nullable=False)
    italian = db.Column(db.String(100), nullable=False)


# User Progress Model
class UserProgress(db.Model):
    __tablename__ = 'user_progress'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)  # In a real project, this would be a ForeignKey to the Users table
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    learned_words = db.Column(db.Integer, default=0)
    quiz_score = db.Column(db.Integer, default=0)


# Quiz Results Model
class QuizResult(db.Model):
    __tablename__ = 'quiz_results'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)  # ForeignKey to Users table
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    correct_answers = db.Column(db.Integer)
    incorrect_answers = db.Column(db.Integer)
