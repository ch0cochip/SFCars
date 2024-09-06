from bson import ObjectId
from ..tests import conftest

def test_successful_bill(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bill' is posted to (POST)
    THEN check that a '200' (OK) status code is returned and a bill is created
    """
    payee = mock_db['UserAccount'].find_one()['_id']
    # register user one and insert listing into mock_db
    provider = conftest.USER_STUB.copy()
    provider['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(provider)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    # create booking
    booking_stub = conftest.BOOKING_STUB.copy()
    resp = client.post('/listings/book', headers=user_token, json=booking_stub)
    assert resp.status_code == conftest.OK

    booking = mock_db['Bookings'].find_one()
    # create bill for booking
    resp = client.post('/bill', headers=user_token, json={
        'booking_id': booking['_id']
    })
    assert resp.status_code == conftest.OK

    # assert bill was created
    bill = mock_db['Bills'].find_one()
    bill.pop('_id')
    assert bill == {
        'user_id': payee,
        'booking_id': booking['_id'],
        'start_time': booking['start_time'],
        'end_time': booking['end_time'],
        'price': booking['price'],
        'paid': False
    }

def test_duplicate_bill(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bill' is posted to and a bill already exists (POST)
    THEN check that a '200' (OK) status code is returned and no extra bill is created
    """
    payee = mock_db['UserAccount'].find_one()['_id']
    # register user one and insert listing into mock_db
    provider = conftest.USER_STUB.copy()
    provider['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(provider)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    # create booking
    booking_stub = conftest.BOOKING_STUB.copy()
    resp = client.post('/listings/book', headers=user_token, json=booking_stub)
    assert resp.status_code == conftest.OK

    booking = mock_db['Bookings'].find_one()
    # create bill for booking
    resp = client.post('/bill', headers=user_token, json={
        'booking_id': booking['_id']
    })
    assert resp.status_code == conftest.OK

    # assert bill was created
    bill = mock_db['Bills'].find_one()
    bill.pop('_id')
    assert bill == {
        'user_id': payee,
        'booking_id': booking['_id'],
        'start_time': booking['start_time'],
        'end_time': booking['end_time'],
        'price': booking['price'],
        'paid': False
    }
    # assert bill exists in bookings document
    assert len(mock_db['Bookings'].find_one({'_id': booking['_id']})['bills']) == 1

    # create another bill for booking
    resp = client.post('/bill', headers=user_token, json={
        'booking_id': booking['_id']
    })
    assert resp.status_code == conftest.OK

    # assert no duplicate bill was created
    assert len(mock_db['Bookings'].find_one({'_id': booking['_id']})['bills']) == 1
