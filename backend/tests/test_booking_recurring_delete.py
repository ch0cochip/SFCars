from bson import ObjectId
from . import conftest

def test_daily_cancel_single(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/booking/{booking_id}' is single cancelled with (DELETE)
    THEN check that a '200' status code is returned
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
    b_id = resp.json['booking_id']

    # delete a single instance
    resp = client.delete(f'/bookings/{b_id}', headers=user_token, json={
        'start_time': '2023-12-03T10:00:00',
        'end_time': '2023-12-03T11:00:00',
        'type': 'single'
    })
    assert resp.status_code == conftest.OK

    # assert original booking's data
    original = mock_db['Bookings'].find_one({'_id': ObjectId(b_id)})
    assert original['start_time'] == '2023-12-01T10:00:00'
    assert original['end_time'] == '2023-12-02T11:00:00'
    assert original['child']

    # assert new recurring booking's data
    new = mock_db['Bookings'].find_one({'_id': original['child']})
    assert new['start_time'] == '2023-12-04T10:00:00'
    assert new['end_time'] == '2023-12-04T11:00:00'
    assert new['recurring'] == 'daily'

def test_daily_cancel_future(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/booking/{booking_id}' is single cancelled with (DELETE)
    THEN check that a '200' status code is returned
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
    b_id = resp.json['booking_id']

    # delete a future instance
    resp = client.delete(f'/bookings/{b_id}', headers=user_token, json={
        'start_time': '2023-12-03T10:00:00',
        'end_time': '2023-12-03T11:00:00',
        'type': 'future'
    })
    assert resp.status_code == conftest.OK

    # assert original booking's data
    original = mock_db['Bookings'].find_one({'_id': ObjectId(b_id)})
    assert original['start_time'] == '2023-12-01T10:00:00'
    assert original['end_time'] == '2023-12-02T11:00:00'

    # assert original booking does NOT continue onwards
    assert not original.get('child')

def test_weekly_cancel_single(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/booking/{booking_id}' is single cancelled with (DELETE)
    THEN check that a '200' status code is returned
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
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.OK
    b_id = resp.json['booking_id']

    # delete a single instance
    resp = client.delete(f'/bookings/{b_id}', headers=user_token, json={
        'start_time': '2023-12-08T10:00:00',
        'end_time': '2023-12-08T11:00:00',
        'type': 'single'
    })
    assert resp.status_code == conftest.OK

    # assert original booking's data
    original = mock_db['Bookings'].find_one({'_id': ObjectId(b_id)})
    assert original['start_time'] == '2023-12-01T10:00:00'
    assert original['end_time'] == '2023-12-01T11:00:00'
    assert original['child']

    # assert new recurring booking's data
    new = mock_db['Bookings'].find_one({'_id': original['child']})
    assert new['start_time'] == '2023-12-15T10:00:00'
    assert new['end_time'] == '2023-12-15T11:00:00'
    assert new['recurring'] == 'weekly'

def test_weekly_cancel_future(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/booking/{booking_id}' is single cancelled with (DELETE)
    THEN check that a '200' status code is returned
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
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.OK
    b_id = resp.json['booking_id']

    # delete a future instance
    resp = client.delete(f'/bookings/{b_id}', headers=user_token, json={
        'start_time': '2023-12-15T10:00:00',
        'end_time': '2023-12-15T11:00:00',
        'type': 'future'
    })
    assert resp.status_code == conftest.OK

    # assert original booking's data
    original = mock_db['Bookings'].find_one({'_id': ObjectId(b_id)})
    assert original['start_time'] == '2023-12-01T10:00:00'
    assert original['end_time'] == '2023-12-08T11:00:00'

    # assert original booking does NOT continue onwards
    assert not original.get('child')

def test_biweekly_cancel_single(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/booking/{booking_id}' is single cancelled with (DELETE)
    THEN check that a '200' status code is returned
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
    b_id = resp.json['booking_id']

    # delete a single instance
    resp = client.delete(f'/bookings/{b_id}', headers=user_token, json={
        'start_time': '2023-12-29T10:00:00',
        'end_time': '2023-12-29T11:00:00',
        'type': 'single'
    })
    assert resp.status_code == conftest.OK

    # assert original booking's data
    original = mock_db['Bookings'].find_one({'_id': ObjectId(b_id)})
    assert original['start_time'] == '2023-12-01T10:00:00'
    assert original['end_time'] == '2023-12-15T11:00:00'
    assert original['child']

    # assert new recurring booking's data
    new = mock_db['Bookings'].find_one({'_id': original['child']})
    assert new['start_time'] == '2024-01-12T10:00:00'
    assert new['end_time'] == '2024-01-12T11:00:00'
    assert new['recurring'] == 'biweekly'

def test_biweekly_cancel_future(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/booking/{booking_id}' is single cancelled with (DELETE)
    THEN check that a '200' status code is returned
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
    b_id = resp.json['booking_id']

    # delete a future instance
    resp = client.delete(f'/bookings/{b_id}', headers=user_token, json={
        'start_time': '2023-12-29T10:00:00',
        'end_time': '2023-12-29T11:00:00',
        'type': 'future'
    })
    assert resp.status_code == conftest.OK

    # assert original booking's data
    original = mock_db['Bookings'].find_one({'_id': ObjectId(b_id)})
    assert original['start_time'] == '2023-12-01T10:00:00'
    assert original['end_time'] == '2023-12-15T11:00:00'

    # assert original booking does NOT continue onwards
    assert not original.get('child')

def test_monthly_cancel_single(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/booking/{booking_id}' is single cancelled with (DELETE)
    THEN check that a '200' status code is returned
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
    b_id = resp.json['booking_id']

    # delete a single instance
    resp = client.delete(f'/bookings/{b_id}', headers=user_token, json={
        'start_time': '2024-03-01T10:00:00',
        'end_time': '2024-03-01T11:00:00',
        'type': 'single'
    })
    assert resp.status_code == conftest.OK

    # assert original booking's data
    original = mock_db['Bookings'].find_one({'_id': ObjectId(b_id)})
    assert original['start_time'] == '2023-12-01T10:00:00'
    assert original['end_time'] == '2024-02-01T11:00:00'
    assert original['child']

    # assert new recurring booking's data
    new = mock_db['Bookings'].find_one({'_id': original['child']})
    assert new['start_time'] == '2024-04-01T10:00:00'
    assert new['end_time'] == '2024-04-01T11:00:00'
    assert new['recurring'] == 'monthly'

def test_monthly_cancel_future(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/booking/{booking_id}' is single cancelled with (DELETE)
    THEN check that a '200' status code is returned
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
    b_id = resp.json['booking_id']

    # delete a future instance
    resp = client.delete(f'/bookings/{b_id}', headers=user_token, json={
        'start_time': '2024-03-01T10:00:00',
        'end_time': '2024-03-01T11:00:00',
        'type': 'future'
    })
    assert resp.status_code == conftest.OK

    # assert original booking's data
    original = mock_db['Bookings'].find_one({'_id': ObjectId(b_id)})
    assert original['start_time'] == '2023-12-01T10:00:00'
    assert original['end_time'] == '2024-02-01T11:00:00'

    # assert original booking does NOT continue onwards
    assert not original.get('child')