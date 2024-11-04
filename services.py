import random
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from repositories import UserRepository, TokenBlocklistRepository, LanguagesRepository, WordsRepository, \
    CategoriesRepository, UserProgressRepository, UserKnownWordRepository, QuizResultRepository, \
    QuizResultDetailRepository
import logging

bcrypt = Bcrypt()


class AuthService:
    @staticmethod
    def register_user(username, email, password):
        existing_user = UserRepository.get_user_by_email(email)
        if existing_user:
            return {"error": "User already exists"}, 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = UserRepository.create_user(username, email, hashed_password)
        return {"message": "User registered successfully"}, 201

    @staticmethod
    def login_user(email, password):
        user = UserRepository.get_user_by_email(email)
        if not user or not bcrypt.check_password_hash(user.password, password):
            return {"error": "Invalid credentials"}, 401
        access_token = create_access_token(identity={'email': email})
        return {"access_token": access_token}, 200

    @staticmethod
    def logout_user(jti):
        TokenBlocklistRepository.add_to_blocklist(jti)
        return {"message": "Successfully logged out"}, 200


class ProfileService:
    @staticmethod
    def get_profile(email):
        user = UserRepository.get_user_by_email(email)
        if user:
            return {'username': user.username, 'email': user.email}
        return {"error": "User not found"}

    @staticmethod
    def update_profile(user_id, data):
        user = UserRepository.update_user(user_id, data)
        return {"message": "Profile updated successfully", "username": user.username, "email": user.email}, 200


class LanguagesService:
    @staticmethod
    def get_all_languages():
        languages = LanguagesRepository.get_all_languages()
        return [{'id': lang.id, 'name': lang.name} for lang in languages]


class WordsService:
    @staticmethod
    def get_words_for_learning(native_language_id, foreign_language_id, category_id):
        words = WordsRepository.get_words_by_category(category_id)
        if not words:
            return []
        native_column = WordsService.get_language_column_name(native_language_id)
        foreign_column = WordsService.get_language_column_name(foreign_language_id)
        return [
            {'native_word': getattr(word, native_column), 'foreign_word': getattr(word, foreign_column)}
            for word in words
        ]

    @staticmethod
    def get_quiz_questions(native_language_id, foreign_language_id, category_id):
        words = WordsRepository.get_words_by_category(category_id)
        native_column = WordsService.get_language_column_name(native_language_id)
        foreign_column = WordsService.get_language_column_name(foreign_language_id)
        questions = []
        for word in words:
            correct_answer = getattr(word, native_column)
            question_text = getattr(word, foreign_column)
            options = WordsRepository.get_random_words_for_options(category_id, native_column, correct_answer)
            options.append(correct_answer)
            random.shuffle(options)
            questions.append({'question': question_text, 'correct_answer': correct_answer, 'options': options})
        return questions

    @staticmethod
    def get_language_column_name(language_id):
        language_map = {1: 'english', 2: 'hungarian', 3: 'german', 4: 'slovak', 5: 'czech', 6: 'italian'}
        return language_map.get(int(language_id))


class CategoriesService:
    @staticmethod
    def get_categories_by_language(language_id):
        categories = CategoriesRepository.get_categories_by_language(language_id)
        return [{'id': cat.id, 'name': cat.name} for cat in categories]

    @staticmethod
    def get_all_categories():
        categories = CategoriesRepository.get_all_categories()
        return [{'id': cat.id, 'name': cat.name} for cat in categories]


class QuizService:
    @staticmethod
    def record_quiz_result(user_id, language_id, category_id, score, question_details):
        # Add the main quiz result
        quiz_result = QuizResultRepository.add_quiz_result(user_id, language_id, category_id, score)

        # Add each question detail in the result details
        for detail in question_details:
            QuizResultDetailRepository.add_quiz_result_detail(
                quiz_result_id=quiz_result.id,
                word_id=detail['word_id'],
                is_correct=detail['is_correct']  # Use 'is_correct' as per the updated method
            )

        return {"message": "Quiz result recorded successfully"}

    @staticmethod
    def get_quiz_questions(native_language_id, foreign_language_id, category_id):
        words = WordsRepository.get_words_by_category(category_id)
        native_column = WordsRepository.get_language_column_name(native_language_id)
        foreign_column = WordsRepository.get_language_column_name(foreign_language_id)
        questions = []
        for word in words:
            correct_answer = getattr(word, native_column, "[No Translation]")
            question = getattr(word, foreign_column, "[No Translation]")
            questions.append({'question': question, 'correct_answer': correct_answer})
        return questions


class UserProgressService:
    @staticmethod
    def get_user_progress(user_id):
        # Fetch all progress entries for the user
        user_progress = UserProgressRepository.get_all_user_progress(user_id)
        return [
            {
                'category_id': progress.category_id,
                'learned_words': progress.learned_words,
                'quiz_score': progress.quiz_score
            }
            for progress in user_progress
        ]

    @staticmethod
    def update_user_progress(user_id, category_id, learned_words, quiz_score):
        UserProgressRepository.update_or_create_user_progress(user_id, category_id, learned_words, quiz_score)


class UserKnownWordsService:
    @staticmethod
    def mark_word_as_known(user_id, word_id, category_id):
        UserKnownWordRepository.add_known_word(user_id, word_id, category_id)

    @staticmethod
    def get_known_words(user_id, category_id):
        known_words = UserKnownWordRepository.get_known_words_by_user_and_category(user_id, category_id)
        return [{'word_id': word.word_id} for word in known_words]


class QuizResultsService:
    @staticmethod
    def get_quizzes_by_user_and_category(user_id, category_id):
        quizzes = QuizResultRepository.get_quizzes_by_user_and_category(user_id, category_id)
        return [
            {
                'id': quiz.id,
                'score': quiz.score,
                'date': quiz.date.strftime('%Y-%m-%d %H:%M')
            }
            for quiz in quizzes
        ]

    @staticmethod
    def save_quiz_result(user_id, language_id, category_id, score, date=None, result_details=None):
        # Save the main quiz result
        quiz_result = QuizResultRepository.add_quiz_result(user_id, language_id, category_id, score, date)

        # Combine all details into one JSON object
        if result_details:
            details_json = [{"word_id": detail["word_id"], "is_correct": detail["is_correct"]} for detail in
                            result_details]
            QuizResultDetailRepository.add_quiz_result_detail(quiz_result_id=quiz_result.id, details_json=details_json)

        return {"message": "Quiz result saved successfully"}


class QuizResultsDetailService:
    @staticmethod
    def get_quiz_details(quiz_id):
        details = QuizResultDetailRepository.get_details_by_quiz_id(quiz_id)
        return [{'word_id': detail.word_id, 'is_correct': detail.is_correct} for detail in details]
