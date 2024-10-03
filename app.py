from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, User, TokenBlocklist
from services import AuthService, ProfileService
from repositories import UserRepository, TokenBlocklistRepository

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True, expose_headers="Authorization")

# Configure PostgreSQL database URI
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@localhost/KettoLingo'
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
        return jsonify(profile_data), 404  # Return 404 if user not found

    return jsonify(profile_data), 200  # Return 200 if successful



# Profile Route (PUT)
@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user = get_jwt_identity()
    data = request.get_json()
    user = UserRepository.get_user_by_email(current_user['email'])
    return jsonify(*ProfileService.update_profile(user.id, data))

@app.route('/api/protected', methods=['GET', 'OPTIONS'])
@jwt_required()
def protected():
    if request.method == 'OPTIONS':
        return '', 200

    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


if __name__ == '__main__':
    app.run(debug=True)
