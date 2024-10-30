from sqlalchemy import func

from models import User, TokenBlocklist, db, Language, Word, Category
from datetime import datetime


class UserRepository:
    @staticmethod
    def get_user_by_email(email):
        return User.query.filter_by(email=email).first()

    @staticmethod
    def get_user_by_id(user_id):
        return User.query.filter_by(id=user_id).first()

    @staticmethod
    def create_user(username, email, password):
        new_user = User(username=username, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()
        return new_user

    @staticmethod
    def update_user(user_id, data):
        user = UserRepository.get_user_by_id(user_id)
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        db.session.commit()
        return user


class TokenBlocklistRepository:
    @staticmethod
    def add_to_blocklist(jti):
        token = TokenBlocklist(jti=jti, created_at=datetime.utcnow())
        db.session.add(token)
        db.session.commit()

    @staticmethod
    def is_token_blacklisted(jti):
        return TokenBlocklist.query.filter_by(jti=jti).first() is not None


class LanguagesRepository:
    @staticmethod
    def get_all_languages():
        return Language.query.all()


class WordsRepository:

    @staticmethod
    def get_words_by_category(category_id):
        return Word.query.filter_by(category_id=category_id).all()  # Fetch words by category only

    @staticmethod
    def get_random_words_for_options(category_id, language_column, exclude_word, limit=3):
        # Fetch random words from the same category, excluding the correct answer
        return [
            getattr(word, language_column)
            for word in
            Word.query.filter(Word.category_id == category_id, getattr(Word, language_column) != exclude_word)
            .order_by(func.random()).limit(limit).all()
        ]

    @staticmethod
    def get_language_column_name(language_id):
        # Map language IDs to the correct column names in the database
        language_map = {
            1: 'english',
            2: 'hungarian',
            3: 'german',
            4: 'slovak',
            5: 'czech',
            6: 'italian'
        }
        column_name = language_map.get(language_id)
        return column_name or "unknown_language"  # Default to "unknown_language" if no match is found




class CategoriesRepository:
    @staticmethod
    def get_all_categories():
        return Category.query.all()