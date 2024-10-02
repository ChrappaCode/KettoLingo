from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configure PostgreSQL database URI
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@localhost/KettoLingo'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'

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
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')


# Token Blocklist Model
class TokenBlocklist(db.Model):
    __tablename__ = 'token_blocklist'
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)

    def __init__(self, jti):
        self.jti = jti
        self.created_at = datetime.utcnow()


# Check if a token is blacklisted (stored in the DB)
@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(jwt_header, jwt_payload):
    jti = jwt_payload['jti']  # Get the unique identifier for the JWT
    token = TokenBlocklist.query.filter_by(jti=jti).first()
    return token is not None  # Return True if the token is found in the blocklist


# Registration Route
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    new_user = User(username=username, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


# Login Route
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity={'email': email})
    return jsonify(access_token=access_token), 200


# Logout Route to blacklist the token
@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']  # Get the unique identifier for the token
    db.session.add(TokenBlocklist(jti=jti))  # Add the token to the blocklist
    db.session.commit()
    return jsonify(msg="Successfully logged out"), 200


# Protected Route Example (Requires JWT)
@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


if __name__ == '__main__':
    app.run(debug=True)
