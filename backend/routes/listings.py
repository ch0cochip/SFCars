from bson import ObjectId
from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.exceptions import Forbidden

from ..helpers import validate_jwt, is_admin
from ..db import listings as listings_db
from ..db import reviews as reviews_db

bp = Blueprint('listings', __name__, url_prefix='/listings')

@bp.route('', methods=['GET'])
def get_all():
    listings = listings_db.all()
    for listing in listings:
        listing["reviews"] = reviews_db.get_all(listing["_id"])

    return { "listings": listings }, 200

@bp.route('/new', methods=['POST'])
@jwt_required()
def new():
    user_id = validate_jwt(get_jwt_identity())

    data = request.get_json()

    if "address" not in data:
        return { "error": "Valid address is required" }, 400

    if "hourly_rate" not in data and "monthly_rate" not in data:
        return { "error": "Valid rate is required" }, 400

    if "hourly_rate" in data and not str(data["hourly_rate"]).replace('.', '', 1).isdigit():
        return { "error": "Valid hourly rate is required" }, 400

    if "monthly_rate" in data and not str(data["monthly_rate"]).replace('.', '', 1).isdigit():
        return { "error": "Valid monthly rate is required" }, 400

    if "listing_type" not in data:
        return { "error": "Valid car space type is required" }, 400

    if "max_vehicle_size" not in data:
        return { "error": "Valid max vehicle size is required" }, 400

    if "description" not in data:
        return { "error": "Valid description is required" }, 400

    if "access_type" not in data:
        return { "error": "Valid access type is required" }, 400

    if "photos" not in data:
        return { "error": "Valid images are required" }, 400

    if "instructions" not in data:
        return { "error": "Valid instructions are required" }, 400

    if "availability" not in data:
        return { "error": "Valid availability is required" }, 400

    if "electric_charging" not in data:
        return { "error": "Valid electric charging is required" }, 400

    listing_id = listings_db.new(user_id, data)

    response = { "listing_id": listing_id }
    return response, 200

@bp.route('/<listing_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required(optional=True)
def info(listing_id):

    if not ObjectId.is_valid(listing_id):
        return { "error": "Invalid listing id" }, 400

    listing_id = ObjectId(listing_id)
    listing = listings_db.get(listing_id)

    if not listing:
        return { "error": "Invalid listing id" }, 400

    if request.method == "GET":
        listing["reviews"] = reviews_db.get_all(listing_id)
        return listing, 200

    user_id = validate_jwt(get_jwt_identity())

    if listing["provider"] != user_id and not is_admin(user_id):
        raise Forbidden

    if request.method == "PUT":
        update_data = request.get_json()

        if "_id" in update_data:
            return { "error": "Cannot update id" }, 400

        if "rating" in update_data:
            return { "error": "Cannot update rating" }, 400

        for key, val in update_data.items():
            if key not in listing.keys():
                return { "error": "Invalid update key" }, 400
            if (key == "hourly_rate" or key == "monthly_rate") and str(val).replace('.', '', 1).isdigit():
                continue
            elif not isinstance(val, type(listing[key])):
                return { "error": "Update value has invalid type" }, 400

        listings_db.update_listing(listing_id, update_data)

    elif request.method == "DELETE":
        listings_db.remove_listing(listing_id)

    return {}, 200
