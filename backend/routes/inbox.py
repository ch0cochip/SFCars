from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from bson import ObjectId
from werkzeug.exceptions import Forbidden

from ..helpers import validate_jwt
from ..db import inbox
from ..db import user as user_db

OK = 200
BAD_REQUEST = 400

bp = Blueprint('inbox', __name__, url_prefix='/inbox')

@bp.route('', methods=['GET', 'DELETE'])
@jwt_required()
def overview():
    ''' Purpose
        Overview screen of the inbox, allows user to select multiple messages to
        delete mainly
    '''
    user_id = validate_jwt(get_jwt_identity())
    if not ObjectId.is_valid(user_id):
        return { 'error': 'Invalid user id' }, BAD_REQUEST

    data = request.get_json()
    if 'message_id' in data:
        for id in data['message_id']:
            if not ObjectId.is_valid(id):
                return { 'error': 'Invalid message' }, BAD_REQUEST

    user = user_db.get_user(ObjectId(user_id))
    if not user:
        return { 'error': 'Invalid user id' }, BAD_REQUEST

    if request.method == 'GET':
        return inbox.get_all(user_id), OK

    elif request.method == 'DELETE':
        if 'message_id' not in data:
            return { 'error': 'Messages must be selected' }, BAD_REQUEST

        ids = data['message_id']
        if not isinstance(ids, list):
             ids = [ids]
        inbox.delete(user_id, ids)

    return {}, OK

@bp.route('/<message_id>', methods=['GET', 'DELETE'])
@jwt_required()
def specific_info(message_id):
    user_id = validate_jwt(get_jwt_identity())
    if not ObjectId.is_valid(message_id):
        return { 'error': 'Invalid message' }, BAD_REQUEST

    user = user_db.get_user(ObjectId(user_id))
    if not user:
        return { 'error': 'Invalid user id' }, BAD_REQUEST

    if request.method == 'GET':
        resp = inbox.get(user_id, message_id)
        if not resp:
            return { 'error': 'Invalid message' }, BAD_REQUEST

        if resp['recipient_id'] != user_id:
            raise Forbidden

        return resp, OK

    elif request.method == 'DELETE':
        inbox.delete(user_id, [message_id])

    return {}, OK