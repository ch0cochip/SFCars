import hashlib
import re
import textwrap
from datetime import datetime as dt
from typing import Optional

import pymongo
from bson import ObjectId
from bson.errors import InvalidId
from dateutil.relativedelta import relativedelta as rd
from werkzeug.exceptions import Unauthorized

from .db import db
from .db import bookings as bookings_db, user as user_db

BAD_REQUEST = 400


def is_valid_email(email: str):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def is_valid_phone_number(phone_number):
    phone_number = "".join(str(phone_number).split())
    pattern = r"^04([0-9]{8})$"
    return re.match(pattern, phone_number)

def validate_jwt(jwt_identity) -> ObjectId:
    """
    Returns ObjectId from jwt_identity if valid, otherwise raises Unauthorized
    """
    try:
        # attempt to convert jwt_identity to objectid
        id = ObjectId(jwt_identity)

        # check if user exists in db
        if not user_db.get_user(id):
            raise Unauthorized
        return id

    except InvalidId:
        raise Unauthorized

def generate_hash(input: str) -> str:
    return hashlib.sha256(input.encode()).hexdigest()

def is_admin(user_id):
    user_id = ObjectId(user_id)
    user = user_db.get_user(user_id)
    if not user:
        return False
    return user['is_admin']

############################## RECURRING BOOKINGS ##############################
def check_for_overlaps(new_start: str, new_end: str):
    new_start = dt.fromisoformat(new_start)
    new_end = dt.fromisoformat(new_end)

    bookings_db = db.get_database()['Bookings']
    all_bookings = bookings_db.find({
        'end_time': {'$gte': dt.now().isoformat()}
    }).sort('end_time', pymongo.ASCENDING)

    for bkn in all_bookings:
        dt_start = dt.fromisoformat(bkn['start_time'])
        end = extract_end_date(bkn['start_time'], bkn['end_time'])
        dt_end = dt.fromisoformat(end)

        # get Hour : Minute : Second values
        bkn_stime = dt_start.time()
        bkn_etime = dt_end.time()

        if check_date_overlaps(dt_start, dt_end, new_start, new_end):
            return {"error": "Invalid time slot"}, BAD_REQUEST

        if bkn['recurring'] == 'daily':
            # Check exclusions first and see if it coincides with the dates.
            if not check_exclusions(bkn['_id'], bkn['start_time'], bkn['end_time'], new_start, new_end):
                return

            new_start_time = new_start.time()
            new_end_time = new_end.time()
            if check_time_overlaps(bkn_stime, bkn_etime, new_start_time, new_end_time):
                return {"error": "Invalid time slot"}, BAD_REQUEST

        # For the rest of recurring types, dates are used instead to check.
        elif bkn['recurring'] == 'weekly':
            while dt_start <= new_end:
                dt_start += rd(days=7)
                dt_end += rd(days=7)
                if check_date_overlaps(dt_start, dt_end, new_start, new_end):
                    return {"error": "Invalid time slot"}, BAD_REQUEST

        elif bkn['recurring'] == 'biweekly':
            while dt_start <= new_end:
                dt_start += rd(days=14)
                dt_end += rd(days=14)
                if check_date_overlaps(dt_start, dt_end, new_start, new_end):
                    return {"error": "Invalid time slot"}, BAD_REQUEST

        elif bkn['recurring'] == 'monthly':
            while dt_start <= new_end:
                dt_start += rd(months=1)
                dt_end += rd(months=1)
                if check_date_overlaps(dt_start, dt_end, new_start, new_end):
                    return {"error": "Invalid time slot"}, BAD_REQUEST


''' check_time_overlaps
    Given an existing booking's start and end times and a new booking's start and
    end times, check if they overlap.
    Returns TRUE if they overlap, otherwise FALSE.
'''
def check_time_overlaps(start_time: dt.time, end_time: dt.time, new_start: dt.time, \
                       new_end: dt.time) -> bool:
    return not (new_start > start_time and new_end > end_time) or \
           not (new_start < start_time and new_end < end_time)

''' check_date_overlaps
    Given an existing booking's start and end dates and a new booking's start and
    end dates, check if they overlap.
    Returns TRUE if overlaps, otherwise FALSE.
'''
def check_date_overlaps(start_time: dt, end_time: dt, new_start: dt, \
                        new_end: dt) -> bool:
    if (start_time > new_start and end_time > new_end) or \
       (start_time < new_start and end_time < new_end):
            return False
    else:
        return True

''' extract_end_date
    Extracts the actual ending date for recurring bookings when given the
    starting and ending dates. This is because the design for recurring was to
    set the YEAR to 9998 to symbolise forever.
'''
def extract_end_date(start: dt, end: dt) -> dt:
    start_year = '{:%Y}'.format(dt.strptime(start, '%Y-%m-%dT%H:%M:%S'))
    end = '{:%m-%dT%H:%M:%S}'.format(dt.strptime(end, '%Y-%m-%dT%H:%M:%S'))
    return start_year + '-' + end

''' check_exclusions
    Searches through a parent booking's exclusions (mainly for recurring bookings)
    and checks for overlaps with a booking that is trying to be created.
    Returns TRUE if there is an overlap, otherwise FALSE.
'''
def check_exclusions(parent_id: ObjectId, parent_start, parent_end, new_start, new_end):
    parent = bookings_db.get(parent_id)
    par_start_date = dt.fromisoformat(parent_start).date()
    par_end_date = dt.fromisoformat(parent_end).date()

    new_start_date = new_start.date()
    new_end_date = new_end.date()

    for exc_id in parent['exclusions']:
        exc = bookings_db.get(exc_id)
        exc_start = dt.strptime(exc['start_time'], '%Y-%m-%dT%H:%M:%S')
        exc_end = dt.strptime(exc['end_time'], '%Y-%m-%dT%H:%M:%S')

        exc_start_date = exc_start.date()
        exc_end_date = exc_end.date()
        exc_start_time = exc_start.time()
        exc_end_time = exc_end.time()

        # Specific edge case for daily bookings: bookings occur "daily", except
        # for specific exclusions. Therefore, only need to compare an exclusion's
        # dates and match them. If they match, then only need to compare time periods.
        if parent['recurring'] == 'daily':
            if exc_start_date == new_start_date and exc_end_date == new_end_date:
                if check_time_overlaps(exc_start_time, exc_end_time, new_start.time(), new_end.time()):
                    return False

        if exc_start_date == par_start_date and exc_end_date == par_end_date:
            if check_time_overlaps(exc_start_time, exc_end_time, new_start.time(), new_end.time()):
                return False

    return True

########################### INBOX MESSAGE TEMPLATES ###########################
def email_cx_booking_confirmation(data: dict) -> Optional[dict]:
    address = data['address']
    short_address = address['street_number'] + ' ' + address['street']
    consumer_message = {
        'recipient_id': data['recipient_id'],
        'email': data['email'],
        'subject': f"Booking Confirmation @ {short_address}",
        'body': textwrap.dedent(f"""Dear {data['first_name']},

            We are pleased to inform you that your parking space booking has been confirmed!

            Details:
            - Booking ID: {data['booking_id']}
            - Address: {address['formatted_address']}
            - Start Time: {data['start_time']}
            - End Time: {data['end_time']}
            - Total Price: {data['price']}

            Thank you for choosing SFCars. If you have any questions or need further assistance, please don't hesitate to contact us.

            Best regards,
            SFCars Team"""
        )
    }

    return consumer_message


def email_cx_booking_cancellation(data: dict) -> Optional[dict]:
    address = data['address']
    short_address = address['street_number'] + ' ' + address['street']
    consumer_message = {
        'recipient_id': data['recipient_id'],
        'email': data['email'],
        'subject': f"Booking Cancellation @ {short_address}",
        'body': textwrap.dedent(f"""Dear {data['first_name']},

            We have confirmed your cancellation of your booking @ {short_address}.

            Additional Note: refunds are not offered as part of cancellations.

            Thank you for choosing SFCars. If you have any questions or need further assistance, please don't hesitate to contact us.

            Best regards,
            SFCars Team"""
        )
    }
    return consumer_message


def email_provider_booking(data: dict) -> Optional[dict]:
    address = data['address']
    short_address = address['street_number'] + ' ' + address['street']
    provider_message = {
        'recipient_id': data['recipient_id'],
        'email': data['email'],
        'subject': f"Your listing has been booked!",
        'body': textwrap.dedent(f"""Dear {data['first_name']},

            We are pleased to inform you that your listing @ {short_address} has been booked!

            Details:
            - Listing: {data['listing_id']},
            - Address: {data['address']['formatted_address']},
            - Start Time: {data['start_time']},
            - End Time: {data['end_time']},
            - Price: {data['price']}

            Once the booking has been paid, payment will be transferred into your wallet.

            Thank you for choosing SFCars. If you have any questions or need further assistance, please don't hesitate to contact us.

            Best regards,
            SFCars Team"""
        )
    }

    return provider_message

def email_provider_cancel(data: dict) -> Optional[dict]:
    address = data['address']
    short_address = address['street_number'] + ' ' + address['street']
    provider_message = {
        'recipient_id': data['recipient_id'],
        'email': data['email'],
        'subject': f"Booking Cancellation @ {short_address}",
        'body': textwrap.dedent(f"""Dear {data['first_name']},

            Unfortunately, we have to inform you that a booking at your listing has been cancelled.

            But do not worry, your money is safe and sound and no refund is required!

            Thank you for choosing SFCars. If you have any questions or need further assistance, please don't hesitate to contact us.

            Best regards,
            SFCars Team"""
        )
    }
    return provider_message

def payment_receipt(data: dict) -> Optional[dict]:
    consumer_msg = {
        'recipient_id': data['recipient_id'],
        'email': data['email'],
        'subject': f"Payment Receipt #{data['payment_id']}",
        'body': textwrap.dedent(f"""Dear {data['first_name']},

            We hope this email finds you well. We are delighted to confirm your booking.

            As requested, here is the payment receipt for your reference.

            Payment Details:
            Transaction ID: {data['payment_id']}
            Date: {data['payment_date']},
            Amount: {data['price']},
            Payment Status: {data['payment_status']}

            Please keep this email for your records.

            Thank you for choosing SFCars. If you have any questions or need further assistance, please don't hesitate to contact us.

            Best regards,
            SFCars Team"""
        )
    }
    return consumer_msg

def payment_received(data: dict) -> Optional[dict]:
    provider_msg = {
        'recipient_id': data['recipient_id'],
        'email': data['email'],
        'subject': f"Payment Received #{data['payment_id']}",
        'body': textwrap.dedent(f"""Dear {data['first_name']},

            We hope this email finds you well. We are pleased to inform you that your car space listing has been booked by another customer!

            As requested, here is the payment receipt for your reference.

            Payment Details:
            Transaction ID: {data['payment_id']}
            Date: {data['payment_date']},
            Amount: {data['price']},
            Payment Status: {data['payment_status']}

            Please keep this email for your records.

            Thank you for choosing SFCars. If you have any questions or need further assistance, please don't hesitate to contact us.

            Best regards,
            SFCars Team"""
        )
    }
    return provider_msg

def notify_of_review(data: dict) -> Optional[dict]:
    address = data['address']
    short_address = address['street_number'] + ' ' + address['street']
    provider_msg = {
        'recipient_id': data['recipient_id'],
        'email': data['email'],
        'subject': f'Review created on your listing @ {short_address}',
        'body': textwrap.dedent(f"""Dear {data['first_name']},

            A review has been made on your listing @ ...

            Here are the details of your review:

            Name: {data['name']}
            Rating: {data['rating']}
            Message: {data['message']}

            Thank you for choosing SFCars. If you have any questions or need further assistance, please don't hesitate to contact us.

            Best regards,
            SFCars Team"""
        )
    }
    return provider_msg
