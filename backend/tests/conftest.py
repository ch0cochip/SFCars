import pytest
import mongomock
import os
from flask import Flask
from unittest.mock import patch
from bson import ObjectId
from flask_jwt_extended import JWTManager

from ..routes import auth, listings, bookings, user, payments, inbox

from ..helpers import generate_hash
from ..json_encoder import CustomJSONProvider

TEST_JWT_KEY = "testingsecretkey"
TEST_PW_HASH = generate_hash("password123")
TEST_UID = ObjectId()
TEST_LID = ObjectId()
TEST_BID = ObjectId()
TEST_EMAIL = "spam123@gmail.com"
TEST_PW = "password123"
TEST_FIRST_NAME = "John"
TEST_LAST_NAME = "Doe"
TEST_PN = "0416 123 980"
TEST_START = '2022-01-01T00:00:00'
TEST_END = '2023-01-01T00:00:00'

USER_STUB = {
    "_id": TEST_UID,
    "email": TEST_EMAIL,
    "password": TEST_PW,
    "first_name": TEST_FIRST_NAME,
    "last_name": TEST_LAST_NAME,
    "phone_number": TEST_PN,
    "inbox": [],
    "wallet": 0,
}

LISTING_STUB = {
    "_id": TEST_LID,
    "provider": TEST_UID,
    "address": {
        "formatted_address": "123 Pitt Street, Sydney NSW 2000, Australia",
        "street_number": "123",
        "street": "Pitt Street",
        "city": "Sydney",
        "state": "NSW",
        "postcode": "2000",
        "country": "Australia",
        "lat": -33.8688197,
        "lng": 151.2092955,
        "place_id": "ChIJP3Sa8ziYEmsRUKgyFmh9AQM"
    },
    "hourly_rate": 4.2,
    "monthly_rate": 100,
    "listing_type": "Driveway",
    "max_vehicle_size": "SUV",
    "description": "none",
    "access_type": "key card",
    "photos": ["image1", "image2"],
    "safety_features": ["ev"],
    "amenities": ["amenities"],
    "electric_charging": "yes?",
    "instructions": "instructions",
    "availability": {
        "is_24_7": True,
        "start_time": "time",
        "end_time": "time",
        "available_days": [],
    },
    "rating": 0,
}

BOOKING_STUB = {
    "_id": TEST_BID,
    "listing_id": TEST_LID,
    "start_time": TEST_START,
    "end_time": TEST_END,
    "price": 100.0,
    "recurring": '',
}

REVIEW_STUB = {
    "rating": 2,
    "message": "message"
}

OK = 200
BAD_REQUEST = 400
UNAUTHORIZED = 401
FORBIDDEN = 403

@pytest.fixture
def mock_db():
    # create mock mongodb database
    mock_db = mongomock.MongoClient().db
    yield mock_db

@pytest.fixture
def client(mock_db):
    # create test flask client
    app = Flask(__name__)
    app.json = CustomJSONProvider(app)

    app.config["JWT_SECRET_KEY"] = TEST_JWT_KEY
    JWTManager(app)

    app.register_blueprint(auth.bp)
    app.register_blueprint(listings.bp)
    app.register_blueprint(bookings.bp)
    app.register_blueprint(user.bp)
    app.register_blueprint(payments.bp)
    app.register_blueprint(inbox.bp)

    os.environ["CONFIG_TYPE"] = 'config.TestingConfig'
    client = app.test_client()

    with patch('backend.db.db.get_database', return_value=mock_db):
        yield client

@pytest.fixture
def user_token(client):
    """
    Registers a user and yields their token
    """
    register_data = {
        "email": "alternatetest@email.com",
        "password": TEST_PW,
        "first_name": TEST_FIRST_NAME,
        "last_name": TEST_LAST_NAME,
        "phone_number": TEST_PN,
    }

    resp = client.post('/auth/register', json=register_data)
    token_head = {
       "Authorization": "Bearer " + resp.get_json()["token"]
    }
    yield token_head

@pytest.fixture
def admin_token(client):
    """
    Registers a user and yields their token
    """
    register_data = {
        "email": "admin@email.com",
        "password": TEST_PW + "admin",
        "first_name": TEST_FIRST_NAME + "admin",
        "last_name": TEST_LAST_NAME + "admin",
        "phone_number": "0400023646",
    }

    resp = client.post('/auth/register/admin', json=register_data)
    token_head = {
       "Authorization": "Bearer " + resp.get_json()["token"]
    }
    yield token_head

@pytest.fixture
def list_book(client, user_token):
    """
    Creates a listing and a booking
    """
    register_data = {
        "email": "listing@email.com",
        "password": TEST_PW + "listing",
        "first_name": TEST_FIRST_NAME + "listing",
        "last_name": TEST_LAST_NAME + "listing",
        "phone_number": "0400023646",
    }

    resp = client.post('/auth/register', json=register_data)
    token_head = {
       "Authorization": "Bearer " + resp.get_json()["token"]
    }

    listing_stub = LISTING_STUB.copy()
    resp = client.post('/listings/new', json=listing_stub, headers=token_head)
    listing_id = resp.get_json()["listing_id"]

    booking_stub = BOOKING_STUB.copy()
    booking_stub["listing_id"] = listing_id
    resp = client.post('/listings/book', json=booking_stub, headers=user_token)
    booking_id = resp.get_json()["booking_id"]

    client.post('/listings/new', json=listing_stub, headers=token_head)

    yield listing_id, booking_id, token_head
