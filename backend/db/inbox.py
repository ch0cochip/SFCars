from bson import ObjectId
from typing import Optional
from datetime import datetime

from ..db import user as user_db
from ..helpers import db

def create(data: dict) -> ObjectId:
    id = ObjectId()
    message_doc = {
        '_id': id,
        'sender': 'noreply@sfcars.com.au',
        'recipient_id': data['recipient_id'],
        'recipient': data['email'],
        'subject': data['subject'],
        'body': data['body'],
        'timestamp': datetime.now().isoformat()
    }

    # push message to user's inbox
    db.get_database()['UserAccount'].update_one(
        { '_id': ObjectId(data['recipient_id']) },
        { '$push': { 'inbox': message_doc } }
    )

def delete(user_id: ObjectId, message_id: ObjectId) -> None:
    # find user in database and delete message from inbox
    user_id = ObjectId(user_id)
    message_id = [ObjectId(x) for x in message_id]

    db.get_database()['UserAccount'].update_one(
        { '_id': user_id },
        { '$pull': { 'inbox': { '_id': { '$in': message_id } } } }
    )

def get(user_id: ObjectId, message_id: ObjectId) -> Optional[dict]:
    user_id = ObjectId(user_id)
    message_id = ObjectId(message_id)

    user = user_db.get_user(user_id)

    for message in user['inbox']:
        if message['_id'] == message_id:
            return message

    return {}

def get_all(user_id: ObjectId) -> Optional[dict]:
    user_id = ObjectId(user_id)
    user = user_db.get_user(user_id)
    return user['inbox']