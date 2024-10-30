import random

from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from repositories import UserRepository, TokenBlocklistRepository, LanguagesRepository, WordsRepository, \
    CategoriesRepository
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
        # Fetch user by email
        user = UserRepository.get_user_by_email(email)

        # If user doesn't exist or password is incorrect, return an error
        if not user or not bcrypt.check_password_hash(user.password, password):
            return {"error": "Invalid credentials"}, 401

        # Generate the JWT token if authentication is successful
        access_token = create_access_token(identity={'email': email})

        # Return the JWT token as part of the response
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
            return {
                'username': user.username,
                'email': user.email
            }
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
        logging.debug(
            f"Native Language ID: {native_language_id}, Foreign Language ID: {foreign_language_id}, Category ID: {category_id}")

        # Fetch words based on category
        words = WordsRepository.get_words_by_category(category_id)

        if not words:
            return []

        # Dynamically map the native and foreign language fields
        native_column = WordsService.get_language_column_name(native_language_id)
        foreign_column = WordsService.get_language_column_name(foreign_language_id)

        logging.debug(f"Mapped Native Column: {native_column}, Mapped Foreign Column: {foreign_column}")

        if not native_column or not foreign_column:
            return [{'native_word': '[Invalid Language]', 'foreign_word': '[Invalid Language]'}]  # Error case

        # Map the correct words
        return [
            {
                'native_word': getattr(word, native_column),
                'foreign_word': getattr(word, foreign_column)
            }
            for word in words
        ]

    @staticmethod
    def get_quiz_questions(native_language_id, foreign_language_id, category_id):
        logging.debug(
            f"Native Language ID: {native_language_id}, Foreign Language ID: {foreign_language_id}, Category ID: {category_id}")

        # Fetch words based on category
        words = WordsRepository.get_words_by_category(category_id)

        if not words:
            return []

        # Dynamically map the native and foreign language fields
        native_column = WordsService.get_language_column_name(native_language_id)
        foreign_column = WordsService.get_language_column_name(foreign_language_id)

        logging.debug(f"Mapped Native Column: {native_column}, Mapped Foreign Column: {foreign_column}")

        if not native_column or not foreign_column:
            return [{'question': '[Invalid Language]', 'correct_answer': '[Invalid Language]', 'options': []}]

        # Create quiz questions
        questions = []
        for word in words:
            correct_answer = getattr(word, native_column)
            question_text = getattr(word, foreign_column)

            # Get a list of random words for incorrect options
            options = WordsRepository.get_random_words_for_options(category_id, native_column, correct_answer)
            options.append(correct_answer)  # Add the correct answer to the options

            random.shuffle(options)  # Shuffle options to randomize the position of the correct answer

            questions.append({
                'question': question_text,
                'correct_answer': correct_answer,
                'options': options
            })

        return questions

    @staticmethod
    def get_language_column_name(language_id):
        # Ensure the language_id is an integer to avoid data type mismatch
        try:
            language_id = int(language_id)
        except ValueError:
            logging.error(f"Invalid language ID (could not convert to int): {language_id}")
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
        if not column_name:
            logging.error(f"Invalid language ID: {language_id}")
        else:
            logging.debug(f"Language ID {language_id} mapped to column '{column_name}'")
        return column_name


class CategoriesService:
    @staticmethod
    def get_all_categories():
        categories = CategoriesRepository.get_all_categories()
        return [{'id': cat.id, 'name': cat.name} for cat in categories]


class QuizService:
    @staticmethod
    def get_quiz_questions(native_language_id, foreign_language_id, category_id):
        words = WordsRepository.get_words_by_category(category_id)

        if not words:
            return []

        native_column = WordsRepository.get_language_column_name(native_language_id)
        foreign_column = WordsRepository.get_language_column_name(foreign_language_id)

        # If either column name is None (invalid language ID), return an error message
        if not native_column or not foreign_column:
            logging.error(f"Invalid language ID(s): native={native_language_id}, foreign={foreign_language_id}")
            return [{'error': 'Invalid native or foreign language selection'}]

        # Generate quiz questions
        questions = []
        for word in words:
            correct_answer = getattr(word, native_column, "[No Translation]")
            question = getattr(word, foreign_column, "[No Translation]")

            # Create a question entry
            questions.append({
                'question': question,
                'correct_answer': correct_answer
            })

        return questions