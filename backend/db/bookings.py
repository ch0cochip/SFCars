from typing import Optional
from bson.objectid import ObjectId
from . import db
from . import inbox, user as user_db, listings
from .. import helpers
from pymongo import ReturnDocument
from datetime import datetime as dt
from dateutil.relativedelta import relativedelta as rd

def new(data: dict) -> ObjectId:
    bookings = db.get_database()["Bookings"]

    consumer = user_db.get_user(data['consumer'])
    end_time = '{:%m-%dT%H:%M:%S}'.format(dt.strptime(data['end_time'], '%Y-%m-%dT%H:%M:%S'))
    end_time = ('9998-' + end_time) if data['recurring'] != '' else data['end_time']

    booking_doc = {
        "consumer": consumer['_id'],
        "listing_id": ObjectId(data['listing_id']),
        "start_time": data['start_time'],
        "end_time": end_time,
        "price": float(data['price']),
        "recurring": data['recurring'],
        "exclusions": [],
        "paid": False,
    }
    booking_id = bookings.insert_one(booking_doc).inserted_id

    # update user's booking list
    db.get_database()['UserAccount'].find_one_and_update(
        {'_id': consumer['_id']},
        {'$push': {'bookings': booking_id}},
        return_document=ReturnDocument.AFTER
    )

    # add booking confirmation message to user's inbox
    start_time = dt.fromisoformat(data['start_time'])
    end_time = dt.fromisoformat(data['end_time'])
    listing = listings.get(data['listing_id'])

    consumer_message = helpers.email_cx_booking_confirmation({
        'recipient_id': consumer['_id'],
        'email': consumer['email'],
        'booking_id': booking_id,
        'first_name': consumer['first_name'],
        'address': listing['address'],
        'start_time': start_time,
        'end_time': end_time,
        'price': data['price']
    })
    inbox.create(consumer_message)

    # add booking notification to provider's inbox
    provider = user_db.get_user(listing['provider'])
    provider_message = helpers.email_provider_booking({
        'recipient_id': provider['_id'],
        'email': provider['email'],
        'first_name': provider['first_name'],
        'listing_id': listing['_id'],
        'address': listing['address'],
        'start_time': start_time,
        'end_time': end_time,
        'price': data['price']
    })
    inbox.create(provider_message)

    return booking_id

''' cancel
    Given the booking_id and a flag to indicate the deletion factor, which is
    either single or future instances for recurring cases, otherwise, it will
    be empty
    start_date: dt, end_date: dt, typing: str
'''
def cancel(booking_id: ObjectId, data: dict) -> None:
    bookings_db = db.get_database()["Bookings"]
    users = db.get_database()["UserAccount"]

    booking_id = ObjectId(booking_id)
    booking = get(booking_id)

    # get user_id and booking document
    consumer = booking['consumer']

    if not data.get('type', ''):
        # delete booking from Bookings and UserAccount, not recurring.
        delete_booking(booking_id)
        users.find_one_and_update(
            {"_id": consumer},
            {"$pull": {'bookings': booking_id}},
            return_document=ReturnDocument.AFTER
        )

    elif data['type'] == 'single':
        # wants to delete a single instance of a recurring booking
        e_id = create_exclusion(booking_id, data)
        dup_id = create_duplicate(booking_id, data)

        delete_booking(e_id)
        bookings_db.update_one(
            {'_id': booking_id},
            {'$pull': {'exclusions': e_id}}
        )

    elif data['type'] == 'future':
        # wants to delete all future instances
        dup_id = create_duplicate(booking_id, data)

        delete_booking(dup_id)
        bookings_db.update_one(
            {'_id': booking_id},
            {'$unset': {'child': 1}}
        )

    consumer = user_db.get_user(consumer)
    listing = listings.get(booking['listing_id'])
    # Email the consumer to confirm their cancellation of the booking
    message = helpers.email_cx_booking_cancellation({
        'address': listing['address'],
        'recipient_id': consumer['_id'],
        'email': consumer['email'],
        'first_name': consumer['first_name'],
    })
    inbox.create(message)

    # Email the provider to notify them that the booking has been cancelled
    provider = user_db.get_user(listing['provider'])
    msg = helpers.email_provider_cancel({
        'address': listing['address'],
        'recipient_id': provider['_id'],
        'email': provider['email'],
        'first_name': provider['first_name']
    })
    inbox.create(msg)


def get(booking_id: ObjectId) -> Optional[dict]:
    booking_id = ObjectId(booking_id)
    bookings = db.get_database()['Bookings']
    return bookings.find_one({ '_id': booking_id })

def get_completed(user_id: ObjectId) -> list:
    user_id = ObjectId(user_id)
    user = user_db.get_user(user_id)
    if not user:
        return []

    res = []
    # add each completed booking to return result
    for bkn in user['bookings']:
        info = get(bkn)
        if not info:
            return []
        if info['end_time'] < dt.now().isoformat():
            res.append(info)

    return res # list of completed bookings ids in order of creation

def update(booking_id: ObjectId, body: dict) -> None:
    booking_id = ObjectId(booking_id)
    bookings = db.get_database()['Bookings']

    booking = get(booking_id)

    if booking['recurring'] == '':
        bookings.update_one({'_id': booking_id}, {"$set": body})
        return booking_id
    else:
        exc_id = create_exclusion(booking_id, body)
        dup_id = create_duplicate(booking_id, body)
        return [exc_id, dup_id]

''' create_duplicate
    Given the booking_id of the original recurring booking and the start and end
    times for the new booking.
    Original recurring booking ends at its last appointment
    New duplicate recurring booking starts at what would be the next date.
'''
def create_duplicate(booking_id: ObjectId, body: dict):
    booking_id = ObjectId(booking_id)
    bookings = db.get_database()['Bookings']

    booking = get(booking_id)

    # Create duplicate record which continues at the next starting date of the
    # original recurring booking

    # Gather the date from the new booking since the times would have changed
    if booking['recurring'] == 'daily':
        start_date = dt.fromisoformat(body['start_time']).date() + rd(days=1)
        end_date = dt.fromisoformat(body['end_time']).date() + rd(days=1)
        original_end = end_date - rd(days=2)
    elif booking['recurring'] == 'weekly':
        start_date = dt.fromisoformat(body['start_time']).date() + rd(days=7)
        end_date = dt.fromisoformat(body['end_time']).date() + rd(days=7)
        original_end = end_date - rd(days=14)
    elif booking['recurring'] == 'biweekly':
        start_date = dt.fromisoformat(body['start_time']).date() + rd(days=14)
        end_date = dt.fromisoformat(body['end_time']).date() + rd(days=14)
        original_end = end_date - rd(days=28)
    elif booking['recurring'] == 'monthly':
        start_date = dt.fromisoformat(body['start_time']).date() + rd(months=1)
        end_date = dt.fromisoformat(body['end_time']).date() + rd(months=1)
        original_end = end_date - rd(months=2)

    start = dt.combine(
        start_date,
        dt.fromisoformat(booking['start_time']).time()
    )
    end = dt.combine(
        end_date,
        dt.fromisoformat(booking['end_time']).time()
    )

    dup = booking.copy()
    dup['_id'] = ObjectId()
    dup['parent'] = booking['_id']
    dup['start_time'] = dt.isoformat(start)
    dup['end_time'] = dt.isoformat(end)
    dup['exclusions'] = []

    bookings.insert_one(dup)

    # Update original booking's end_time to the previous day's end time
    # to signal its ending.
    # THE DATE of the new exclusion's start_time - the recurring length
    # with the original end time.
    original_end = dt.combine(
        original_end,
        dt.fromisoformat(booking['end_time']).time()
    )

    bookings.update_one(
        {'_id': booking_id},
        {'$set': {'end_time': dt.isoformat(original_end)}}
    )

    # Add new duplicate booking's id to exclusions of original booking to link
    bookings.update_one(
        {'_id': booking_id},
        {'$set': {'child': dup['_id']}}
    )

    return dup['_id']

''' create_exclusion
    Given the booking_id and the new data to update with, this function will
    create an exclusion record and insert into the Bookings database and return
    the exclusion record's id.
'''
def create_exclusion(booking_id: ObjectId, body: dict):
    booking_id = ObjectId(booking_id)
    bookings = db.get_database()['Bookings']

    booking = get(booking_id)
    exclusion = booking.copy()
    new_data = {
        '_id': ObjectId(),
        'parent': booking_id,
        'recurring': ''
    }
    exclusion.update(new_data)
    exclusion.update(body.copy())

    bookings.insert_one(exclusion)

    bookings.update_one(
        {'_id': booking_id},
        {'$push': {'exclusions': exclusion['_id']}}
    )

    return exclusion['_id']

def get_listing_bookings(listing_id: ObjectId) -> list:
    bookings = db.get_database()["Bookings"]

    return list(bookings.find({"listing_id": listing_id}))

def delete_booking(booking_id: ObjectId) -> None:
    db.get_database()['Bookings'].delete_one({'_id': booking_id})
