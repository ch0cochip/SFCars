from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from bson import ObjectId

from ..helpers import validate_jwt
from ..db import payments, db

OK = 200
BAD_REQUEST = 400
UNAUTHORIZED = 401

bp = Blueprint('payments', __name__, url_prefix='')

@bp.route('/pay', methods=['POST'])
@jwt_required()
def pay():
    payee = validate_jwt(get_jwt_identity())
    if not db.get_database()['UserAccount'].find_one({'_id': payee}):
        return { 'error': 'User does not exist in system' }, BAD_REQUEST

    data = request.get_json()

    if "bill_id" not in data or not ObjectId.is_valid(data['bill_id']):
        return { "error": "Valid booking id is required" }, BAD_REQUEST

    if "use_wallet" not in data:
        return { "error": "Valid payment option is required" }, BAD_REQUEST

    b_id = ObjectId(data['bill_id'])
    bill = db.get_database()['Bills'].find_one({'_id': b_id})
    booking = db.get_database()['Bookings'].find_one({'_id': bill['booking_id']})

    if booking['consumer'] != payee:
        return { 'error': 'Incorrect user is paying' }, UNAUTHORIZED

    resp = payments.cx_pay(data['bill_id'], payee, data['use_wallet'])
    if not resp:
        return { 'error': 'Wallet does not have enough balance' }, BAD_REQUEST

    return resp, OK


@bp.route('/wallet/withdraw', methods=["POST"])
@jwt_required()
def withdraw():
    payee = validate_jwt(get_jwt_identity())
    if not db.get_database()['UserAccount'].find_one({'_id': payee}):
        return { 'error': 'User does not exist in system' }, BAD_REQUEST

    data = request.get_json()

    if "user_id" not in data or not ObjectId.is_valid(data['user_id']):
        return { 'error': 'Valid user id is required' }, BAD_REQUEST

    if "amt" not in data or data['amt'] <= 0:
        return { 'error': 'Valid amount is required' }, BAD_REQUEST

    resp = payments.cx_withdraw(data['user_id'], data['amt'])
    if not resp:
        return { 'error': 'Wallet does not have enough balance' }, BAD_REQUEST

    return {}, OK

@bp.route('/wallet/top-up', methods=["POST"])
@jwt_required()
def topup():
    payee = validate_jwt(get_jwt_identity())
    if not db.get_database()['UserAccount'].find_one({'_id': payee}):
        return { 'error': 'User does not exist in system' }, BAD_REQUEST

    data = request.get_json()

    if "user_id" not in data or not ObjectId.is_valid(data['user_id']):
        return { 'error': 'Valid user id is required' }, BAD_REQUEST

    if "amt" not in data or data['amt'] <= 0:
        return { 'error': 'Valid amount is required' }, BAD_REQUEST

    payments.cx_topup(data['user_id'], data['amt'])
    return {}, OK

@bp.route('/bill', methods=['POST'])
@jwt_required()
def bill():
    payee = validate_jwt(get_jwt_identity())
    if not db.get_database()['UserAccount'].find_one({'_id': payee}):
        return { 'error': 'User does not exist in system' }, BAD_REQUEST

    data = request.get_json()

    if 'booking_id' not in data or not ObjectId.is_valid(data['booking_id']):
        return { 'error': 'Valid booking is required' }, BAD_REQUEST

    payments.cx_bill(payee)

    return {}, OK