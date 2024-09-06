from bson import ObjectId
from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.exceptions import Forbidden

from .. import helpers
from ..db import bookings, reviews, inbox, user as user_db, listings
from datetime import datetime as dt

OK = 200
BAD_REQUEST = 400

bp = Blueprint('bookings', __name__, url_prefix='')

@bp.route('/listings/book', methods=['POST'])
@jwt_required()
def new():
    # get user_id from token
    consumer = helpers.validate_jwt(get_jwt_identity())
    consumer = user_db.get_user(consumer)
    data = request.get_json()

    if "listing_id" not in data:
        return { "error": "Valid listing id is required" }, BAD_REQUEST

    if "start_time" not in data:
        return { "error": "Valid starting time is required" }, BAD_REQUEST

    if "end_time" not in data:
        return { "error": "Valid end time is required" }, BAD_REQUEST

    if "price" not in data or not str(data["price"]).replace('.', '', 1).isdigit():
        return { "error": "Valid pricing is required" }, BAD_REQUEST


    # check if user is trying to book their own listing
    listing = listings.get(data['listing_id'])
    if listing['provider'] == consumer['_id']:
        return { 'error': 'User cannot book their own listing' }, BAD_REQUEST

    # check for time overlaps with existing bookings
    resp = helpers.check_for_overlaps(data['start_time'], data['end_time'])
    if resp is not None:
        return resp

    # create booking
    data['consumer'] = consumer['_id']
    booking_id = bookings.new(data)
    response = {
        "booking_id": booking_id
    }

    return response, OK

@bp.route('/bookings/<booking_id>', methods=['GET', 'DELETE', 'PUT'])
@jwt_required(optional=True)
def info(booking_id):
    if not ObjectId.is_valid(booking_id):
        return { 'error': 'Invalid booking id' }, BAD_REQUEST

    booking_id = ObjectId(booking_id)
    booking = bookings.get(booking_id)

    if not booking:
        return { 'error': "Booking doesn't exist" }, BAD_REQUEST

    if request.method == "GET":
        return booking, OK

    consumer = helpers.validate_jwt(get_jwt_identity())

    if booking['consumer'] != consumer and not helpers.is_admin(consumer):
        raise Forbidden

    if request.method == 'PUT':
        update_data = request.get_json()

        if '_id' in update_data:
            return { 'error': 'Cannot update id' }, BAD_REQUEST

        for key, val in update_data.items():
            if key not in booking.keys():
                return { 'error': 'Invalid update key' }, BAD_REQUEST
            if not isinstance(val, type(booking[key])):
                return { 'error': 'Update value has invalid typing' }, BAD_REQUEST

        new_id = bookings.update(booking_id, update_data)

        return { 'booking_id': new_id }, OK

    elif request.method == 'DELETE':
        data = request.get_json()

        bookings.cancel(booking_id, data)

    return {}, OK

@bp.route('/profile/completed-bookings', methods=['GET'])
@jwt_required()
def completed():
    user_id = helpers.validate_jwt(get_jwt_identity())

    c_bookings = []
    completed_ids = bookings.get_completed(user_id)
    for b_id in completed_ids:
        c_bookings.append(bookings.get(b_id['_id']))

    return c_bookings, OK

@bp.route('bookings/<booking_id>/review', methods=['GET', 'POST', 'PUT', 'DELETE'])
@jwt_required()
def review(booking_id):
    user_id = helpers.validate_jwt(get_jwt_identity())

    if not ObjectId.is_valid(booking_id):
        return { 'error': 'Invalid booking id' }, BAD_REQUEST

    booking_id = ObjectId(booking_id)
    booking = bookings.get(booking_id)

    if not booking:
        return { 'error': "Booking doesn't exist" }, BAD_REQUEST

    if booking['consumer'] != user_id and not helpers.is_admin(user_id):
        raise Forbidden

    if request.method == "POST":
        data = request.get_json()

        if reviews.get(booking_id):
            return { 'error': 'Review already exists' }, BAD_REQUEST

        if "rating" not in data:
            return { 'error': 'Valid rating is required' }, BAD_REQUEST

        if "message" not in data:
            return { 'error': 'Valid message is required' }, BAD_REQUEST

        id = reviews.new(user_id, booking_id, data)
        return { 'review_id': id }, OK

    review = reviews.get(booking_id)
    if not review:
        return { 'error': 'Review does not exist' }, BAD_REQUEST

    if request.method == "GET":
        return review, OK

    if request.method == 'PUT':
        data = request.get_json()

        for key in ["_id", "user_id", "booking_id", "listing_id", "name", "timestamp"]:
            if key in data:
                return { 'error': 'Cannot update ' + key }, BAD_REQUEST

        for key, val in data.items():
            if key not in review.keys():
                return { 'error': 'Invalid update key' }, BAD_REQUEST
            if not isinstance(val, type(review[key])):
                return { 'error': 'Update value has invalid typing' }, BAD_REQUEST

        reviews.update(review["_id"], data)
        return { 'booking_id': review["_id"] }, OK

    if request.method == 'DELETE':
        data = request.get_json()
        reviews.delete(review["_id"])

    return {}, OK
