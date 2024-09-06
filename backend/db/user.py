from bson import ObjectId
from typing import Optional

from ..helpers import generate_hash
from ..db import db

def user_register(data: dict) -> ObjectId:
    user_id = ObjectId()
    user_doc = {
        "_id": user_id,
        "email": data["email"],
        "password": generate_hash(data["password"]),
        "first_name":  data["first_name"],
        "last_name": data["last_name"],
        "phone_number": data["phone_number"],
        "vehicle_details": [],
        "payment_details": [],
        "bookings": [],
        "reviews": [],
        "listings": [],
        "is_admin": False,
        "revenue": 0,
        "rating": None,
        "inbox": [],
        "pfp": '',
        "wallet": 0,
        "recent_transactions": []
    }

    db.get_database()["UserAccount"].insert_one(user_doc)
    return user_id

def admin_register(data: dict) -> ObjectId:
    user_id = ObjectId()
    user_doc = {
        "_id": user_id,
        "email": data["email"],
        "password": generate_hash(data["password"]),
        "first_name":  data["first_name"],
        "last_name": data["last_name"],
        "phone_number": data["phone_number"],
        "vehicle_details": [],
        "payment_details": [],
        "bookings": [],
        "reviews": [],
        "listings": [],
        "is_admin": True,
        "revenue": 0,
        "rating": None,
        "inbox": [],
        "pfp": '',
        "wallet": 0,
        "recent_transcations": []
    }

    db.get_database()["UserAccount"].insert_one(user_doc)
    return user_id


def user_login(data: dict) -> Optional[ObjectId]:
    collection = db.get_database()["UserAccount"]
    user = collection.find_one({
        "email": data["email"],
        "password": generate_hash(data["password"])
    })
    id = None
    if user:
        id = ObjectId(user["_id"])

    return id

def get_user(user_id: ObjectId) -> dict:
    users = db.get_database()["UserAccount"]
    user = users.find_one({ "_id": user_id })
    return user if user else {}

def update_user(user_id: ObjectId, body: dict) -> None:
    users = db.get_database()["UserAccount"]
    users.update_one({ "_id": user_id }, {"$set":body})

def remove_user(user_id: ObjectId) -> None:
    users = db.get_database()["UserAccount"]
    users.delete_one({ "_id": user_id })
