from bson import ObjectId
from ..tests import conftest
import textwrap
from datetime import datetime as dt

################################### SPECIFIC ###################################

def test_get_specific_message(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the ('/inbox/<message_id>') is requested for (GET)
    THEN check that a '200' (OK) status code is returned
    """
    payee = mock_db['UserAccount'].find_one()
    # register Provider and insert listing into mock_db
    provider = conftest.USER_STUB.copy()
    provider['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(provider)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    stub = conftest.BOOKING_STUB.copy()

    # create booking which will put a message into the inbox
    response = client.post('/listings/book', headers=user_token, json=stub)
    assert response.status_code == conftest.OK
    booking = mock_db['Bookings'].find_one()
    assert response.json == {
        'booking_id': str(booking['_id'])
    }

    # get the message
    acc = mock_db['UserAccount'].find_one( {'_id': payee['_id'] })
    message = acc['inbox'][0]

    resp = client.get(f"/inbox/{message['_id']}", headers=user_token, json={})
    assert resp.status_code == conftest.OK

    msg = resp.json.copy()
    msg.pop('timestamp')

    address = conftest.LISTING_STUB['address']
    short_address = f"{address['street_number']} {address['street']}"
    assert msg == {
        '_id': str(message['_id']),
        'sender': 'noreply@sfcars.com.au',
        'recipient_id': str(payee['_id']),
        'recipient': payee['email'],
        'subject': f'Booking Confirmation @ {short_address}',
        'body': textwrap.dedent(f"""Dear {payee['first_name']},

            We are pleased to inform you that your parking space booking has been confirmed!

            Details:
            - Booking ID: {booking['_id']}
            - Address: {address['formatted_address']}
            - Start Time: {dt.fromisoformat(booking['start_time'])}
            - End Time: {dt.fromisoformat(booking['end_time'])}
            - Total Price: {booking['price']}

            Thank you for choosing SFCars. If you have any questions or need further assistance, please don't hesitate to contact us.

            Best regards,
            SFCars Team"""
        )
    }

def test_delete_specific_message(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the ('/inbox/<message_id>') is deleted (DELETE)
    THEN check that a '200' (OK) status code is returned
    """
    payee = mock_db['UserAccount'].find_one()
    # register Provider and insert listing into mock_db
    provider = conftest.USER_STUB.copy()
    provider['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(provider)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    stub = conftest.BOOKING_STUB.copy()

    # create booking which will put a message into the inbox
    response = client.post('/listings/book', headers=user_token, json=stub)
    assert response.status_code == conftest.OK
    booking = mock_db['Bookings'].find_one()
    assert response.json == {
        'booking_id': str(booking['_id'])
    }

    # get the message
    acc = mock_db['UserAccount'].find_one( {'_id': payee['_id'] })
    message = acc['inbox'][0]

    resp = client.get(f"/inbox/{message['_id']}", headers=user_token, json={})
    assert resp.status_code == conftest.OK
    msg = resp.json.copy()
    msg.pop('timestamp')

    address = conftest.LISTING_STUB['address']
    short_address = f"{address['street_number']} {address['street']}"
    assert msg == {
        '_id': str(message['_id']),
        'sender': 'noreply@sfcars.com.au',
        'recipient_id': str(payee['_id']),
        'recipient': payee['email'],
        'subject': f'Booking Confirmation @ {short_address}',
        'body': textwrap.dedent(f"""Dear {payee['first_name']},

            We are pleased to inform you that your parking space booking has been confirmed!

            Details:
            - Booking ID: {booking['_id']}
            - Address: {address['formatted_address']}
            - Start Time: {dt.fromisoformat(booking['start_time'])}
            - End Time: {dt.fromisoformat(booking['end_time'])}
            - Total Price: {booking['price']}

            Thank you for choosing SFCars. If you have any questions or need further assistance, please don't hesitate to contact us.

            Best regards,
            SFCars Team"""
        )
    }

    # delete inbox message
    resp = client.delete(f"/inbox/{message['_id']}", headers=user_token, json={})
    assert resp.status_code == conftest.OK

    # check inbox and assert message is not there anymore
    payee = mock_db['UserAccount'].find_one({'_id': payee['_id']})
    assert payee['inbox'] == []

def test_specific_invalid_user(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the ('/inbox/<message_id>') is (GET) with an invalid user_id
    THEN check that a '200' (OK) status code is returned
    """
    payee = mock_db['UserAccount'].find_one()
    # register Provider and insert listing into mock_db
    provider = conftest.USER_STUB.copy()
    provider['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(provider)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    stub = conftest.BOOKING_STUB.copy()

    # create booking which will put a message into the inbox
    response = client.post('/listings/book', headers=user_token, json=stub)
    assert response.status_code == conftest.OK
    booking = mock_db['Bookings'].find_one()
    assert response.json == {
        'booking_id': str(booking['_id'])
    }

    # Create another user which cannot open the inbox message in user_token
    register_data = {
        "email": "invalid@email.com",
        "password": conftest.TEST_PW,
        "first_name": conftest.TEST_FIRST_NAME,
        "last_name": conftest.TEST_LAST_NAME,
        "phone_number": "0400023646",
    }

    resp = client.post('/auth/register', json=register_data)
    token_head = {
       "Authorization": "Bearer " + resp.get_json()["token"]
    }

    # get the message id
    acc = mock_db['UserAccount'].find_one( {'_id': payee['_id'] })
    message = acc['inbox'][0]

    # Change token to the new user, should return bad_request since message
    # does not exist in this user's inbox
    resp = client.get(f"/inbox/{message['_id']}", headers=token_head, json={})
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Invalid message'
    }

def test_specific_missing_user(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the ('/inbox/<message_id>') is (GET) with an missing token
    THEN check that a '401' (UNAUTHORIZED) status code is returned
    """
    payee = mock_db['UserAccount'].find_one()
    # register Provider and insert listing into mock_db
    provider = conftest.USER_STUB.copy()
    provider['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(provider)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    stub = conftest.BOOKING_STUB.copy()

    # create booking which will put a message into the inbox
    response = client.post('/listings/book', headers=user_token, json=stub)
    assert response.status_code == conftest.OK
    booking = mock_db['Bookings'].find_one()
    assert response.json == {
        'booking_id': str(booking['_id'])
    }

    # get the message id
    acc = mock_db['UserAccount'].find_one( {'_id': payee['_id'] })
    message = acc['inbox'][0]

    # Change token to missing
    resp = client.get(f"/inbox/{message['_id']}", headers='', json={})
    assert resp.status_code == conftest.UNAUTHORIZED

def test_specific_invalid_message(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the ('/inbox/<message_id>') is (GET) with an missing message_id
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.get('/inbox/invalid', headers=user_token, json={})

    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Invalid message'
    }

################################### OVERVIEW ###################################
def test_overview_get_success(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the ('/inbox') is requested for (GET)
    THEN check that a '200' (OK) status code is returned
    """
    user = mock_db['UserAccount'].find_one()

    id1 = ObjectId()
    id2 = ObjectId()
    id3 = ObjectId()

    mock_db['UserAccount'].update_one(
        { '_id': user['_id'] },
        { '$set': { 'inbox': [id1, id2, id3] } }
    )

    resp = client.get('/inbox', headers=user_token, json={})
    assert resp.status_code == conftest.OK
    assert resp.json == [str(id1), str(id2), str(id3)]

def test_overview_delete_success(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the ('/inbox') is requested for (DELETE)
    THEN check that a '200' (OK) status code is returned
    """
    user = mock_db['UserAccount'].find_one()

    id1 = ObjectId()
    id2 = ObjectId()
    id3 = ObjectId()

    mock_db['UserAccount'].update_one(
        { '_id': user['_id'] },
        { '$set': { 'inbox': [{'_id': id1}, {'_id': id2}, {'_id': id3}] } }
    )

    resp = client.get('/inbox', headers=user_token, json={})
    assert resp.status_code == conftest.OK
    assert resp.json == [{'_id': str(id1)}, {'_id': str(id2)}, {'_id': str(id3)}]

    resp = client.delete('/inbox', headers=user_token, json={
        'message_id': [id1, id2]
    })

    resp = client.get('/inbox', headers=user_token, json={})
    assert resp.status_code == conftest.OK
    assert resp.json == [{'_id': str(id3)}]

def test_overview_invalid_message_id(client, user_token):
    """
    GIVEN a Flask environment configured for testing
    WHEN the '/inbox' is requested for (GET) with an invalid message_id
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.get('/inbox', headers=user_token, json={
        'message_id': ['invalid!']
    })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Invalid message'
    }

def test_overview_invalid_user_id(client):
    """
    GIVEN a Flask environment configured for testing
    WHEN the '/inbox' is requested for (GET) with an invalid token
    THEN check that a '401' (UNAUTHORIZED) status code is returned
    """
    resp = client.get('/inbox', headers={"Authorization": "invalid"}, json={})
    assert resp.status_code == conftest.UNAUTHORIZED

def test_overview_delete_invalid_message(client, user_token):
    """
    GIVEN a Flask environment configured for testing
    WHEN the '/inbox' is requested for (DELETE) with no selected messages
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.delete('/inbox', headers=user_token, json={
        'empty': 'empty'
    })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Messages must be selected'
    }
