import os
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, User, TokenBlocklist, Language, Category, Word, UserProgress, QuizResult
from services import AuthService, ProfileService, LanguagesService, WordsService, CategoriesService, QuizService, \
    UserProgressService, UserKnownWordsService, QuizResultsService, QuizResultsDetailService
from repositories import UserRepository, TokenBlocklistRepository, QuizResultRepository, QuizResultDetailRepository, \
    WordsRepository

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": f"http://{os.getenv('KETTO_FE', default='localhost')}:5173"}},
     supports_credentials=True, expose_headers="Authorization")

# Configure PostgreSQL database URI
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('KETTO_DB',
                                                  default='postgresql://postgres:postgres@localhost/KettoLingo')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
db.init_app(app)
migrate = Migrate(app, db)

app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'


# Check if token is blacklisted
@jwt.token_in_blocklist_loader
def check_if_token_in_blocklist(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return TokenBlocklistRepository.is_token_blacklisted(jti)


# Registration Route
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    return jsonify(*AuthService.register_user(data['username'], data['email'], data['password']))


# Login Route
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    return jsonify(*AuthService.login_user(data['email'], data['password']))


# Logout Route
@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    return jsonify(*AuthService.logout_user(jti))


# Profile Route (GET)
@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = get_jwt_identity()
    profile_data = ProfileService.get_profile(current_user['email'])
    if "error" in profile_data:
        return jsonify(profile_data), 404
    return jsonify(profile_data), 200


# Profile Route (PUT)
@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user = get_jwt_identity()
    data = request.get_json()
    user = UserRepository.get_user_by_email(current_user['email'])

    if data.get('native_language_id') == "NoChangePlaceholder":
        # Update only the username
        updated_data = {'username': data.get('username')}
    else:
        # Update both username and native language
        updated_data = {
            'username': data.get('username'),
            'native_language_id': data.get('native_language_id')
        }

        if user.native_language_id != data.get('native_language_id'):
            # Delete quiz results and details if the native language is changed
            QuizResultRepository.delete_quiz_results_by_user(user.id)

    return jsonify(*ProfileService.update_profile(user.id, updated_data))


@app.route('/api/delete_quiz_results', methods=['DELETE'])
@jwt_required()
def delete_quiz_results():
    current_user = get_jwt_identity()
    user = UserRepository.get_user_by_email(current_user['email'])
    if not user:
        return jsonify({"error": "User not found"}), 404

    QuizResultRepository.delete_quiz_results_by_user(user.id)
    return jsonify({"message": "Quiz results deleted successfully"}), 200


# Get all languages
@app.route('/api/languages', methods=['GET'])
@jwt_required()
def get_languages():
    languages_data = LanguagesService.get_all_languages()
    if not languages_data:
        return jsonify({"error": "No languages found"}), 404
    return jsonify(languages_data), 200


# Get all languages except native
@app.route('/api/languages_dropdown', methods=['GET'])
@jwt_required()
def get_languages_dropdown():
    current_user = get_jwt_identity()
    user = UserRepository.get_user_by_email(current_user['email'])
    native_language_id = user.native_language_id
    languages_data = LanguagesService.get_all_languages_except_native(native_language_id)
    if not languages_data:
        return jsonify({"error": "No languages found"}), 404
    return jsonify(languages_data), 200


# Get words for learning
@app.route('/api/learn/<foreign_language_id>/<category_id>', methods=['GET'])
@jwt_required()
def get_words_for_learning(foreign_language_id, category_id):
    current_user = get_jwt_identity()
    user = UserRepository.get_user_by_email(current_user['email'])
    native_language_id = user.native_language_id
    words = WordsService.get_words_for_learning(native_language_id, foreign_language_id, category_id)
    if not words:
        return jsonify({"error": "No words found for the selected languages and category"}), 404
    return jsonify(words), 200


# Get all categories
@app.route('/api/categories', methods=['GET'])
@jwt_required()
def get_categories():
    categories = CategoriesService.get_all_categories()
    if not categories:
        return jsonify({"error": "No categories found"}), 404
    return jsonify(categories), 200


# Get quiz questions
@app.route('/api/quiz/<foreign_language_id>/<category_id>', methods=['GET'])
@jwt_required()
def get_quiz_questions(foreign_language_id, category_id):
    current_user = get_jwt_identity()
    user = UserRepository.get_user_by_email(current_user['email'])
    native_language_id = user.native_language_id
    questions = QuizService.get_quiz_questions(native_language_id, foreign_language_id, category_id)
    if not questions:
        return jsonify({"error": "No quiz questions found for the selected languages and category"}), 404
    return jsonify(questions), 200


# Get user progress
@app.route('/api/user_progress', methods=['GET'])
@jwt_required()
def get_user_progress():
    current_user = get_jwt_identity()
    user = UserRepository.get_user_by_email(current_user['email'])
    if not user:
        return jsonify({"error": "User not found"}), 404

    progress = UserProgressService.get_user_progress(user.id)
    return jsonify(progress), 200


# Get known words for user and category
@app.route('/api/known_words/<int:user_id>/<int:category_id>', methods=['GET'])
@jwt_required()
def get_known_words(user_id, category_id):
    known_words = UserKnownWordsService.get_known_words(user_id, category_id)
    return jsonify(known_words), 200


# Save quiz result
@app.route('/api/quiz_result', methods=['POST'])
@jwt_required()
def save_quiz_result():
    data = request.get_json()
    user_email = get_jwt_identity()['email']  # Extract email from the JWT token
    user = UserRepository.get_user_by_email(user_email)  # Retrieve user based on email

    if not user:
        return jsonify({"error": "User not found"}), 404

    user_id = user.id
    language_id = data.get('language_id')
    category_id = data.get('category_id')
    score = data.get('score')
    date = data.get('date')  # Optional
    result_details = data.get('result_details')

    result = QuizResultsService.save_quiz_result(user_id, language_id, category_id, score, date, result_details)
    return jsonify(result), 201


# Protected Route for JWT Validation
@app.route('/api/protected', methods=['GET', 'OPTIONS'])
@jwt_required()
def protected():
    if request.method == 'OPTIONS':
        return '', 200
    current_user = get_jwt_identity()
    user = UserRepository.get_user_by_email(current_user['email'])
    native_language = LanguagesService.get_language_by_id(user.native_language_id)
    return jsonify(logged_in_as=current_user, native_language=native_language), 200


# Get quizzes by user and category
@app.route('/api/quizzes', methods=['GET'])
@jwt_required()
def get_user_quizzes():
    email = request.args.get('email')
    category_id = request.args.get('categoryId')
    foreign_language_id = request.args.get('languageId')

    if not email or not category_id or not foreign_language_id:
        return jsonify({"error": "Missing email, categoryId, or languageId parameter"}), 400

    user = UserRepository.get_user_by_email(email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    native_language_id = user.native_language_id
    quizzes = QuizResultRepository.get_quizzes_by_user_category_and_language(user.id, category_id, foreign_language_id)

    quiz_data = [{
        "id": quiz.id,
        "score": quiz.score,
        "date": quiz.date.strftime('%Y-%m-%d %H:%M')
    } for quiz in quizzes]

    return jsonify(quiz_data), 200


# Get quiz details by quiz id
@app.route('/api/quiz-details/<int:quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz_details(quiz_id):
    quiz_result = QuizResultRepository.get_quiz_result_by_id(quiz_id)
    if quiz_result is None:
        return jsonify({"error": "No quiz result found for this quiz"}), 404

    quiz_details = QuizResultDetailRepository.get_quiz_details_by_quiz_id(quiz_id)
    if quiz_details is None:
        return jsonify({"error": "No details found for this quiz"}), 404

    language_id = quiz_result.language_id
    language_column = WordsRepository.get_language_column_name(language_id)
    if not language_column:
        return jsonify({"error": "Invalid language ID"}), 400

    # Parse the JSON to get the word_id and correctness
    detailed_results = []
    for detail in quiz_details.details:
        word = WordsRepository.get_word_by_id(detail['word_id'])
        if word:
            detailed_results.append({
                "word_id": word.id,
                "category_id": word.category_id,
                "word": getattr(word, language_column),
                "is_correct": detail['is_correct']
            })

    return jsonify(detailed_results), 200


if __name__ == '__main__':
    app.run(debug=True)
