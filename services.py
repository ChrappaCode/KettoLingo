from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from repositories import UserRepository, TokenBlocklistRepository

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
