from sqlalchemy import func
from models import User, TokenBlocklist, db, Language, Word, Category, UserProgress, UserKnownWord, QuizResult, QuizResultDetail
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
        if 'native_language_id' in data:
            user.native_language_id = data['native_language_id']
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
    def get_language_by_id(language_id):
        return Language.query.get(language_id)

    @staticmethod
    def get_all_languages():
        return Language.query.all()


class WordsRepository:
    @staticmethod
    def get_word_by_id(word_id):
        return Word.query.get(word_id)

    @staticmethod
    def get_words_by_category(category_id):
        return Word.query.filter_by(category_id=category_id).all()

    @staticmethod
    def get_random_words_for_options(category_id, language_column, exclude_word, limit=3):
        return [
            getattr(word, language_column)
            for word in Word.query.filter(
                Word.category_id == category_id,
                getattr(Word, language_column) != exclude_word
            ).order_by(func.random()).limit(limit).all()
        ]

    @staticmethod
    def get_language_column_name(language_id):
        # Ensure the language_id is an integer to avoid data type mismatch
        try:
            language_id = int(language_id)
        except ValueError:
            return None

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
        return column_name


class CategoriesRepository:
    @staticmethod
    def get_categories_by_language(language_id):
        # Assuming your `Category` model has a language_id field
        return Category.query.filter_by(language_id=language_id).all()

    @staticmethod
    def get_all_categories():
        return Category.query.all()


class UserProgressRepository:
    @staticmethod
    def get_all_user_progress(user_id):
        return UserProgress.query.filter_by(user_id=user_id).all()

    @staticmethod
    def get_user_progress(user_id, category_id):
        return UserProgress.query.filter_by(user_id=user_id, category_id=category_id).first()

    @staticmethod
    def update_or_create_user_progress(user_id, category_id, learned_words, quiz_score):
        progress = UserProgressRepository.get_user_progress(user_id, category_id)
        if progress:
            progress.learned_words = learned_words
            progress.quiz_score = max(progress.quiz_score or 0, quiz_score)
        else:
            progress = UserProgress(
                user_id=user_id,
                category_id=category_id,
                learned_words=learned_words,
                quiz_score=quiz_score
            )
            db.session.add(progress)
        db.session.commit()


class UserKnownWordRepository:
    @staticmethod
    def add_known_word(user_id, word_id, category_id):
        if not UserKnownWordRepository.is_word_known(user_id, word_id):
            known_word = UserKnownWord(user_id=user_id, word_id=word_id, category_id=category_id)
            db.session.add(known_word)
            db.session.commit()

    @staticmethod
    def is_word_known(user_id, word_id):
        return UserKnownWord.query.filter_by(user_id=user_id, word_id=word_id).first() is not None

    @staticmethod
    def get_known_words_by_user_and_category(user_id, category_id):
        return UserKnownWord.query.filter_by(user_id=user_id, category_id=category_id).all()


class QuizResultRepository:
    @staticmethod
    def delete_quiz_results_by_user(user_id):
        # First, get all quiz results for the user
        quiz_results = QuizResult.query.filter_by(user_id=user_id).all()

        # Delete all quiz result details associated with these quiz results
        for quiz_result in quiz_results:
            QuizResultDetail.query.filter_by(quiz_result_id=quiz_result.id).delete()

        # Delete the quiz results themselves
        QuizResult.query.filter_by(user_id=user_id).delete()

        db.session.commit()

    @staticmethod
    def get_quiz_result_by_id(quiz_id):
        return QuizResult.query.filter_by(id=quiz_id).first()

    @staticmethod
    def add_quiz_result(user_id, language_id, category_id, score, date=None):
        if date is None:
            date = datetime.utcnow()

        quiz_result = QuizResult(
            user_id=user_id,
            language_id=language_id,
            category_id=category_id,
            score=score,
            date=date
        )

        db.session.add(quiz_result)
        db.session.commit()
        return quiz_result

    @staticmethod
    def get_quizzes_by_user_category_and_language(user_id, category_id, language_id):
        # Query the database for quiz results filtered by user_id, category_id, and language_id
        return QuizResult.query.filter_by(
            user_id=user_id,
            category_id=category_id,
            language_id=language_id
        ).all()

    @staticmethod
    def get_quizzes_by_user_and_category(user_id, category_id):
        return QuizResult.query.filter_by(user_id=user_id, category_id=category_id).all()


class QuizResultDetailRepository:
    @staticmethod
    def add_quiz_result_detail(quiz_result_id, details_json):
        # Store answers JSON directly
        detail = QuizResultDetail(
            quiz_result_id=quiz_result_id,
            details=details_json  # JSON field containing word_id and is_correct for each answer
        )
        db.session.add(detail)
        db.session.commit()

    @staticmethod
    def get_details_by_quiz_id(quiz_id):
        return QuizResultDetail.query.filter_by(quiz_result_id=quiz_id).all()

    @staticmethod
    def get_quiz_details_by_quiz_id(quiz_id):
        return QuizResultDetail.query.filter_by(quiz_result_id=quiz_id).first()


