from bson import ObjectId

from ..tests import conftest


def test_daily_booking(mock_db, user_token, client):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listing/booking' is posted to with recurring field (POST)
    THEN check that a '200' (OK) status code is returned and booking is added
         to the user's acc and the listing
    """
    user_stub = conftest.USER_STUB.copy()
    user_stub['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(user_stub)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    # create and insert booking
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-01T10:00:00' # 10am-11am
    b_stub['end_time'] = '2023-12-01T11:00:00'
    b_stub['recurring'] = 'daily'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.OK

    # check booking was inserted into database
    booking = mock_db['Bookings'].find_one()
    assert booking['listing_id'] == conftest.TEST_LID
    assert booking['start_time'] == '2023-12-01T10:00:00'
    assert booking['end_time'] == '9998-12-01T11:00:00'
    assert booking['price'] == 100.0
    assert booking['recurring'] == 'daily'

    # check booking was inserted into user account
    user_acc = mock_db['UserAccount'].find_one()
    assert user_acc['bookings'] == [ObjectId(resp.json['booking_id'])]

def test_daily_booking_overlap(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listing/booking' is posted with an invalid time slot between
        an existing recurring booking
    THEN check that a '400' (BAD_REQUEST) is returned
    """
    user_stub = conftest.USER_STUB.copy()
    user_stub['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(user_stub)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    # create and insert booking
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-01T10:00:00' # 10am-11am
    b_stub['end_time'] = '2023-12-01T11:00:00'
    b_stub['recurring'] = 'daily'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.OK

    # create booking that is purposefully overlapping
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-02T10:00:00'
    b_stub['end_time'] = '2023-12-02T11:00:00'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        "error": "Invalid time slot"
    }

    # create a valid booking that is not overlapping
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-02T11:00:00' #11am-12pm
    b_stub['end_time'] = '2023-12-02T12:00:00'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        "error": "Invalid time slot"
    }

def test_weekly_booking(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listing/booking' is posted with an 'weekly' recurring field (POST)
    THEN check that a '200' (OK) status code is returned
    """
    user_stub = conftest.USER_STUB.copy()
    user_stub['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(user_stub)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    # create and insert booking
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-01T10:00:00' # 10am-11am
    b_stub['end_time'] = '2023-12-01T11:00:00'
    b_stub['recurring'] = 'weekly'
    b_stub['duration'] = 1
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.OK

    # check booking was inserted into database
    booking = mock_db['Bookings'].find_one()
    assert booking['listing_id'] == conftest.TEST_LID
    assert booking['start_time'] == '2023-12-01T10:00:00'
    assert booking['end_time'] == '9998-12-01T11:00:00'
    assert booking['price'] == 100.0
    assert booking['recurring'] == 'weekly'

    # check booking was inserted into user account
    user_acc = mock_db['UserAccount'].find_one()
    assert user_acc['bookings'] == [ObjectId(resp.json['booking_id'])]

def test_weekly_overlap(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listing/booking' is posted with an invalid time slot between
        an existing recurring booking
    THEN check that a '400' (BAD_REQUEST) is returned
    """
    user_stub = conftest.USER_STUB.copy()
    user_stub['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(user_stub)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    # create and insert booking
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-01T10:00:00' # 10am-11am
    b_stub['end_time'] = '2023-12-01T11:00:00'
    b_stub['recurring'] = 'weekly'
    b_stub['duration'] = 0 # same day booking
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.OK

    # create booking that is purposefully overlapping - 1 week ahead
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-08T10:00:00'
    b_stub['end_time'] = '2023-12-08T11:00:00'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        "error": "Invalid time slot"
    }

    # create booking that is purposefully overlapping - 2 week ahead
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-15T10:00:00'
    b_stub['end_time'] = '2023-12-15T11:00:00'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        "error": "Invalid time slot"
    }

    # create booking that should insert properly
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-07T10:00:00'
    b_stub['end_time'] = '2023-12-07T11:00:00'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.OK

def test_biweekly_booking(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listing/booking' is posted with a 'biweekly' reucrring field (POST)
    THEN check that a '200' OK status code is returned
    """
    user_stub = conftest.USER_STUB.copy()
    user_stub['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(user_stub)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    # create and insert booking
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-01T10:00:00' # 10am-11am
    b_stub['end_time'] = '2023-12-01T11:00:00'
    b_stub['recurring'] = 'biweekly'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.OK

    # check booking was inserted into database
    booking = mock_db['Bookings'].find_one()
    assert booking['listing_id'] == conftest.TEST_LID
    assert booking['start_time'] == '2023-12-01T10:00:00'
    assert booking['end_time'] == '9998-12-01T11:00:00'
    assert booking['price'] == 100.0
    assert booking['recurring'] == 'biweekly'

    # check booking was inserted into user account
    user_acc = mock_db['UserAccount'].find_one()
    assert user_acc['bookings'] == [ObjectId(resp.json['booking_id'])]

def test_biweekly_overlap(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listing/booking' is posted with an invalid time slot between
        an existing recurring booking
    THEN check that a '400' (BAD_REQUEST) is returned
    """
    user_stub = conftest.USER_STUB.copy()
    user_stub['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(user_stub)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    # create and insert booking
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-01T10:00:00' # 10am-11am
    b_stub['end_time'] = '2023-12-01T11:00:00'
    b_stub['recurring'] = 'biweekly'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.OK

    # create booking that is purposefully overlapping - 2 week ahead
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-15T10:00:00'
    b_stub['end_time'] = '2023-12-15T11:00:00'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        "error": "Invalid time slot"
    }

    # create booking that is purposefully overlapping - 4 week ahead
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-29T10:00:00'
    b_stub['end_time'] = '2023-12-29T11:00:00'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        "error": "Invalid time slot"
    }

    # create booking that is 1 week ahead, should work!
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-07T10:00:00'
    b_stub['end_time'] = '2023-12-07T11:00:00'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.OK

def test_monthly_booking(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listing/booking' is posted with a 'monthly' reucrring field (POST)
    THEN check that a '200' OK status code is returned
    """
    user_stub = conftest.USER_STUB.copy()
    user_stub['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(user_stub)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    # create and insert booking
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-01T10:00:00' # 10am-11am
    b_stub['end_time'] = '2023-12-01T11:00:00'
    b_stub['recurring'] = 'monthly'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.OK

    # check booking was inserted into database
    booking = mock_db['Bookings'].find_one()
    assert booking['listing_id'] == conftest.TEST_LID
    assert booking['start_time'] == '2023-12-01T10:00:00'
    assert booking['end_time'] == '9998-12-01T11:00:00'
    assert booking['price'] == 100.0
    assert booking['recurring'] == 'monthly'

    # check booking was inserted into user account
    user_acc = mock_db['UserAccount'].find_one()
    assert user_acc['bookings'] == [ObjectId(resp.json['booking_id'])]

def test_monthly_overlap(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listing/booking' is posted with an invalid time slot between
        an existing recurring booking
    THEN check that a '400' (BAD_REQUEST) is returned
    """
    user_stub = conftest.USER_STUB.copy()
    user_stub['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(user_stub)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    # create and insert booking
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-01T10:00:00' # 10am-11am
    b_stub['end_time'] = '2023-12-01T11:00:00'
    b_stub['recurring'] = 'monthly'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.OK

    # create booking that is purposefully overlapping - 1 month ahead
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2024-01-01T10:00:00'
    b_stub['end_time'] = '2024-01-01T11:00:00'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        "error": "Invalid time slot"
    }

    # create booking that is purposefully overlapping - 2 month ahead
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2024-02-01T10:00:00'
    b_stub['end_time'] = '2024-02-01T11:00:00'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        "error": "Invalid time slot"
    }

    # create booking that is valid and assert it works
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2024-02-02T10:00:00'
    b_stub['end_time'] = '2024-02-02T11:00:00'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.OK