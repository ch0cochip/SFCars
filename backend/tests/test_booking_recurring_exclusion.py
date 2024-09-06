from bson import ObjectId
from . import conftest

def test_daily_exclusion(client, user_token, mock_db):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/booking/{booking_id}' is updated with (PUT)
    THEN check that a '200' status code is returned and an exclusion
        is made and works properly.
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

    # create an exclusion record
    b_id = ObjectId(resp.json['booking_id'])
    resp = client.put(f'/bookings/{b_id}', headers=user_token, json={
        'start_time': '2023-12-02T11:00:00',
        'end_time': '2023-12-02T12:00:00'
    })

    # assert exclusion record exists
    ids = resp.json['booking_id']
    assert resp.status_code == conftest.OK
    assert resp.json == {'booking_id' : [ids[0], ids[1]]}

    ids = [ObjectId(x) for x in ids]
    booking = mock_db['Bookings'].find_one({'_id': b_id})
    assert booking['exclusions'] == [ids[0]]
    assert booking['child'] == ids[1]

    # assert exclusion data
    exclusion = mock_db['Bookings'].find_one({'_id': ids[0]})
    assert exclusion['parent'] == b_id
    assert exclusion['start_time'] == '2023-12-02T11:00:00'
    assert exclusion['end_time'] == '2023-12-02T12:00:00'

    # assert duplicate record exists
    dup = mock_db['Bookings'].find_one({'_id': ids[1]})
    assert dup['start_time'] == '2023-12-03T10:00:00'
    assert dup['end_time'] == '2023-12-03T11:00:00'
    assert dup['price'] == 100

    booking = mock_db['Bookings'].find_one({'_id': b_id})

    # Because an exclusion exists on the record, should be able to book this
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-02T10:00:00' # 10am-11am
    b_stub['end_time'] = '2023-12-02T11:00:00'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.OK



    # Confirming that the daily time period still works at a distant future
    b_stub = conftest.BOOKING_STUB.copy()
    b_stub['start_time'] = '2023-12-30T10:00:00'
    b_stub['end_time'] = '2023-12-30T11:00:00'
    resp = client.post('/listings/book', headers=user_token, json=b_stub)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        "error": "Invalid time slot"
    }

def test_weekly_exclusion(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/booking/{booking_id}' is updated with (PUT)
    THEN check that a '200' status code is returned, an exclusion record is made,
        and the weekly recurring booking is split into two.
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
    b_id = ObjectId(resp.json['booking_id'])

    # create an exclusion record on the 8th, changing the times to 11am-12pm.
    resp = client.put(f'/bookings/{b_id}', headers=user_token, json={
        'start_time': '2023-12-08T11:00:00',
        'end_time': '2023-12-08T12:00:00'
    })

    # assert exclusion record exists
    ids = resp.json['booking_id']
    assert resp.status_code == conftest.OK
    assert resp.json == {'booking_id' : [ids[0], ids[1]]}

    ids = [ObjectId(x) for x in ids]
    booking = mock_db['Bookings'].find_one({'_id': b_id})
    assert booking['exclusions'] == [ids[0]]
    assert booking['child'] == ids[1]

    # assert exclusion data
    exc = mock_db['Bookings'].find_one({'_id': ids[0]})
    assert exc['parent'] == b_id
    assert exc['start_time'] == '2023-12-08T11:00:00'
    assert exc['end_time'] == '2023-12-08T12:00:00'

    # assert original weekly booking is split into its original with updated
    # end date and the new with the future recurrences
    original = mock_db['Bookings'].find_one({'_id': b_id})
    assert original['end_time'] == '2023-12-01T11:00:00'

    # Assert duplicate booking starts from what should be the next starting date
    dup = mock_db['Bookings'].find_one({'_id': ids[1]})
    assert dup['start_time'] == '2023-12-15T10:00:00'
    assert dup['end_time'] == '2023-12-15T11:00:00'
    assert dup['recurring'] == 'weekly'
    assert dup['parent'] == b_id
    assert dup['exclusions'] == []

def test_biweekly_exclusion(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/booking/{booking_id}' is updated with (PUT)
    THEN check that a '200' status code is returned, an exclusion record is made,
        and the weekly recurring booking is split into two.
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
    b_id = ObjectId(resp.json['booking_id'])

    # create an exclusion record on the 8th, changing the times to 11am-12pm.
    resp = client.put(f'/bookings/{b_id}', headers=user_token, json={
        'start_time': '2023-12-15T11:00:00',
        'end_time': '2023-12-15T12:00:00'
    })

    # assert exclusion record exists
    ids = resp.json['booking_id']
    assert resp.status_code == conftest.OK
    assert resp.json == {'booking_id' : [ids[0], ids[1]]}

    ids = [ObjectId(x) for x in ids]
    booking = mock_db['Bookings'].find_one({'_id': b_id})
    assert booking['exclusions'] == [ids[0]]
    assert booking['child'] == ids[1]

    # assert exclusion data
    exc = mock_db['Bookings'].find_one({'_id': ids[0]})
    assert exc['parent'] == b_id
    assert exc['start_time'] == '2023-12-15T11:00:00'
    assert exc['end_time'] == '2023-12-15T12:00:00'

    # assert original weekly booking is split into its original with updated
    # end date and the new with the future recurrences
    original = mock_db['Bookings'].find_one({'_id': b_id})
    assert original['end_time'] == '2023-12-01T11:00:00'

    # Assert duplicate booking starts from what should be the next starting date
    dup = mock_db['Bookings'].find_one({'_id': ids[1]})
    assert dup['start_time'] == '2023-12-29T10:00:00'
    assert dup['end_time'] == '2023-12-29T11:00:00'
    assert dup['recurring'] == 'biweekly'
    assert dup['parent'] == b_id
    assert dup['exclusions'] == []

def test_monthly_exclusion(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/booking/{booking_id}' is updated with (PUT)
    THEN check that a '200' status code is returned, an exclusion record is made,
        and the weekly recurring booking is split into two.
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
    b_id = ObjectId(resp.json['booking_id'])

    # create an exclusion record on the 8th, changing the times to 11am-12pm.
    resp = client.put(f'/bookings/{b_id}', headers=user_token, json={
        'start_time': '2024-01-01T11:00:00',
        'end_time': '2024-01-01T12:00:00'
    })

    # assert exclusion record exists
    ids = resp.json['booking_id']
    assert resp.status_code == conftest.OK
    assert resp.json == {'booking_id' : [ids[0], ids[1]]}

    ids = [ObjectId(x) for x in ids]
    booking = mock_db['Bookings'].find_one({'_id': b_id})
    assert booking['exclusions'] == [ids[0]]
    assert booking['child'] == ids[1]

    # assert exclusion data
    exc = mock_db['Bookings'].find_one({'_id': ids[0]})
    assert exc['parent'] == b_id
    assert exc['start_time'] == '2024-01-01T11:00:00'
    assert exc['end_time'] == '2024-01-01T12:00:00'

    # assert original weekly booking is split into its original with updated
    # end date and the new with the future recurrences
    original = mock_db['Bookings'].find_one({'_id': b_id})
    assert original['end_time'] == '2023-12-01T11:00:00'

    # Assert duplicate booking starts from what should be the next starting date
    dup = mock_db['Bookings'].find_one({'_id': ids[1]})
    assert dup['start_time'] == '2024-02-01T10:00:00'
    assert dup['end_time'] == '2024-02-01T11:00:00'
    assert dup['recurring'] == 'monthly'
    assert dup['parent'] == b_id
    assert dup['exclusions'] == []

