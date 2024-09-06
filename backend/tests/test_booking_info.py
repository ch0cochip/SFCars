from bson import ObjectId
from ..tests import conftest
import textwrap

def test_get_invalid(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/:booking_id' is called with GET with an invalid id
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.get('/bookings/invalid_id', headers=user_token)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Invalid booking id'
    }

def test_no_exist(client, user_token):
    """
    GIVEN  a Flask application configured for testing
    WHEN the '/bookings/:booking_id' is called with GET with a valid, but not existing id
    THEN check that a '400' (BAD_REQUEST) status code is returend
    """
    resp = client.get(f'/bookings/{conftest.TEST_BID}', headers=user_token)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': "Booking doesn't exist"
    }

def test_get_exists(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/booking_id' is called with GET
    THEN check that a '200' (OK) status code is returned and the booking is returned
    """
    payee = mock_db['UserAccount'].find_one()
    # register Provider and insert listing into mock_db
    provider = conftest.USER_STUB.copy()
    provider['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(provider)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    stub = conftest.BOOKING_STUB.copy()
    # create booking
    response = client.post('/listings/book', headers=user_token, json=stub)
    assert response.status_code == conftest.OK
    id = mock_db['Bookings'].find_one()['_id']
    assert response.json == {
        'booking_id': str(id)
    }

    # check booking was inserted into database
    booking = mock_db['Bookings'].find_one()
    assert booking is not None
    assert booking["listing_id"] == conftest.TEST_LID
    assert booking["start_time"] == conftest.TEST_START
    assert booking["end_time"] == conftest.TEST_END
    assert booking["price"] == 100

    # check booking was added to user account
    acc = mock_db['UserAccount'].find_one( {'_id': payee['_id'] })
    assert acc is not None
    assert acc['_id'] == booking['consumer']
    assert acc['bookings'] == [id]

    resp = client.get(f"/bookings/{booking['_id']}", headers=user_token, json={})
    assert resp.status_code == conftest.OK
    assert resp.json == {
        'consumer': str(booking['consumer']),
        'listing_id': str(booking['listing_id']),
        'start_time': booking['start_time'],
        'end_time': booking['end_time'],
        'price': booking['price'],
        'recurring': '',
        'exclusions': [],
        'paid': False,
        '_id': str(booking['_id'])
    }

def test_put_invalid_user(client, user_token, mock_db):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/:booking_id' is called with PUT from the wrong user
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    id = mock_db['UserAccount'].find_one()['_id']
    listing = conftest.LISTING_STUB.copy()
    listing['provider'] = id

    mock_db['Listings'].insert_one(listing)

    resp = client.post('/auth/register', json={
        "email": "randomuser@gmail.com",
        "password": conftest.TEST_PW,
        "first_name": conftest.TEST_FIRST_NAME,
        "last_name": conftest.TEST_LAST_NAME,
        "phone_number": conftest.TEST_PN
    })
    alternate_head = {
        "Authorization": "Bearer " + resp.get_json()['token']
    }

    stub = conftest.BOOKING_STUB.copy()
    resp = client.post('listings/book', headers=alternate_head, json=stub)
    booking_id = resp.json['booking_id']

    resp = client.put(f'/bookings/{booking_id}', headers=user_token)
    assert resp.status_code == conftest.FORBIDDEN

def test_put_valid(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/:booking_id' is called with PUT
    THEN check that a '200' (OK) status code is returned
    """
    # register Provider and insert listing into mock_db
    provider = conftest.USER_STUB.copy()
    provider['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(provider)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    stub = conftest.BOOKING_STUB.copy()
    resp = client.post('listings/book', headers=user_token, json=stub)
    booking_id = resp.json['booking_id']

    assert mock_db['Bookings'].find_one()['price'] == 100
    resp = client.put(f'/bookings/{booking_id}', headers=user_token, json={
        'price': float(200)
    })
    assert resp.status_code == conftest.OK
    assert mock_db['Bookings'].find_one()['price'] == 200

def test_put_invalid_key(client, user_token, mock_db):
    # register Provider and insert listing into mock_db
    provider = conftest.USER_STUB.copy()
    provider['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(provider)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    stub = conftest.BOOKING_STUB.copy()
    resp = client.post('listings/book', headers=user_token, json=stub)
    booking_id = resp.json['booking_id']

    resp = client.put(f'/bookings/{booking_id}', headers=user_token, json={
        'test': 'invalid!'
    })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Invalid update key'
    }

def test_put_invalid_value(client, mock_db, user_token):
    # register Provider and insert listing into mock_db
    provider = conftest.USER_STUB.copy()
    provider['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(provider)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    stub = conftest.BOOKING_STUB.copy()
    resp = client.post('listings/book', headers=user_token, json=stub)
    booking_id = resp.json['booking_id']

    assert mock_db['Bookings'].find_one()['price'] == 100
    resp = client.put(f'/bookings/{booking_id}', headers=user_token, json={
        'price': 200
    })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Update value has invalid typing'
    }

def test_cancel_booking(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings/booking' is posted to (POST)
    THEN check that a '200' (OK) status code is returned and the booking is cancelled
    """
    payee = mock_db['UserAccount'].find_one()
    # insert test user, listing and booking into database
    provider = conftest.USER_STUB.copy()
    provider['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(provider)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())
    stub = conftest.BOOKING_STUB.copy()
    resp = client.post('/listings/book', headers=user_token, json=stub)
    booking_id = resp.json['booking_id']

    assert mock_db['UserAccount'].find_one()['bookings'] == [ObjectId(booking_id)]
    assert mock_db['Bookings'].find_one()
    # post response to cancel booking
    response = client.delete(f'/bookings/{booking_id}', headers=user_token, json={
        "booking_id": str(booking_id)
    })
    assert response.status_code == 200

    # check its not in user profile, check its not in database
    assert mock_db['Bookings'].find_one() == None
    assert mock_db['UserAccount'].find_one()['bookings'] == []

    # check that cancellation email was placed into consumer's inbox
    address = conftest.LISTING_STUB['address']
    short_address = f"{address['street_number']} {address['street']}"
    message = mock_db['UserAccount'].find_one()['inbox'][1]
    message.pop('_id')
    message.pop('sender')
    message.pop('timestamp')
    expected_message = {
        'recipient_id': payee['_id'],
        'recipient': payee['email'],
        'subject': f"Booking Cancellation @ {short_address}",
        'body': textwrap.dedent(f"""Dear {payee['first_name']},

            We have confirmed your cancellation of your booking @ {short_address}.

            Additional Note: refunds are not offered as part of cancellations.

            Thank you for choosing SFCars. If you have any questions or need further assistance, please don't hesitate to contact us.

            Best regards,
            SFCars Team"""
        )
    }
    assert message == expected_message

    # check that provider has been notified
    msg = mock_db['UserAccount'].find_one({'_id': provider['_id']})['inbox'][1]
    msg.pop('_id')
    msg.pop('sender')
    msg.pop('timestamp')
    expected_msg = {
        'recipient_id': provider['_id'],
        'recipient': provider['email'],
        'subject': f"Booking Cancellation @ {short_address}",
        'body': textwrap.dedent(f"""Dear {provider['first_name']},

            Unfortunately, we have to inform you that a booking at your listing has been cancelled.

            But do not worry, your money is safe and sound and no refund is required!

            Thank you for choosing SFCars. If you have any questions or need further assistance, please don't hesitate to contact us.

            Best regards,
            SFCars Team"""
        )
    }
    assert expected_msg == msg

def test_admin_put(client, mock_db, user_token, admin_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/:booking_id' is called with PUT
    THEN check that a '200' (OK) status code is returned
    """
    # register Provider and insert listing into mock_db
    provider = conftest.USER_STUB.copy()
    provider['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(provider)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    stub = conftest.BOOKING_STUB.copy()
    resp = client.post('listings/book', headers=user_token, json=stub)
    booking_id = resp.json['booking_id']

    assert mock_db['Bookings'].find_one()['price'] == 100
    resp = client.put(f'/bookings/{booking_id}', headers=admin_token, json={
        'price': float(200)
    })
    assert resp.status_code == conftest.OK
    assert mock_db['Bookings'].find_one()['price'] == 200

def test_admin_cancel(client, mock_db, user_token, admin_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings/booking' is posted to (POST)
    THEN check that a '200' (OK) status code is returned and the booking is cancelled
    """
    # insert test user, listing and booking into database
    user_stub = conftest.USER_STUB.copy()
    user_stub['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(user_stub)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())
    stub = conftest.BOOKING_STUB.copy()
    resp = client.post('/listings/book', headers=user_token, json=stub)
    booking_id = resp.json['booking_id']

    assert mock_db['UserAccount'].find_one()['bookings'] == [ObjectId(booking_id)]
    assert mock_db['Bookings'].find_one()
    # post response to cancel booking
    response = client.delete(f'/bookings/{booking_id}', headers=admin_token, json={
        "booking_id": str(booking_id)
    })
    assert response.status_code == 200

    # check its not in user profile, check its not in database
    assert mock_db['Bookings'].find_one() == None
    assert mock_db['UserAccount'].find_one()['bookings'] == []
