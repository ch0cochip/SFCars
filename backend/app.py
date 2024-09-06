from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from . import config
from .routes import auth, listings, user, bookings, payments, inbox
from . import json_encoder

def create_app():
    app = Flask(__name__)
    app.json = json_encoder.CustomJSONProvider(app)

    CORS(app, resources={r"/*": {"origins": "*"}})
    app.config['CORS_HEADERS'] = 'Content-Type'
    app.config["JWT_SECRET_KEY"] = config.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False
    JWTManager(app)

    app.register_blueprint(auth.bp)
    app.register_blueprint(listings.bp)
    app.register_blueprint(user.bp)
    app.register_blueprint(bookings.bp)
    app.register_blueprint(payments.bp)
    app.register_blueprint(inbox.bp)

    return app
