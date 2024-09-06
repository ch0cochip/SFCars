from flask import Blueprint, request
from flask_jwt_extended import create_access_token
from ..db import user, db
from .. import helpers

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    database = db.get_database()
    user_account = database["UserAccount"]

    if "email" not in data or not helpers.is_valid_email(data["email"]):
        return {"error": "Email is required"}, 400

    if user_account.find_one({"email": data["email"]}):
        return {"error": "Email already registered"}, 400

    if "password" not in data or len(data["password"]) < 8:
        return {"error": "Password is required"}, 400

    if "first_name" not in data or "last_name" not in data:
        return {"error": "Name is required"}, 400

    if "phone_number" not in data or \
        not helpers.is_valid_phone_number(data["phone_number"]):
        return {"error": "Phone number is required"}, 400

    id = user.user_register(data)
    return { "token": create_access_token(identity=str(id)) }, 200

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    user_id = user.user_login(data)
    if user_id:
        return { "token": create_access_token(identity=str(user_id)) }, 200
    else:
        return {"error": "Invalid email or password"}, 400

@bp.route('/register/admin', methods=['POST'])
def register_admin():
    data = request.get_json()
    database = db.get_database()
    user_account = database["UserAccount"]

    if "email" not in data or not helpers.is_valid_email(data["email"]):
        return {"error": "Email is required"}, 400

    if user_account.find_one({"email": data["email"]}):
        return {"error": "Email already registered"}, 400

    if "password" not in data or len(data["password"]) < 8:
        return {"error": "Password is required"}, 400

    if "first_name" not in data or "last_name" not in data:
        return {"error": "Name is required"}, 400

    if "phone_number" not in data or \
        not helpers.is_valid_phone_number(data["phone_number"]):
        return {"error": "Phone number is required"}, 400

    id = user.admin_register(data)
    return { "token": create_access_token(identity=str(id)) }, 200
