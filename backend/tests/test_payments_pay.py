from bson import ObjectId
from ..tests import conftest

def test_successful_pay(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/pay' is posted to (POST)
    THEN check that a '200' (OK) status code is returned and payment is processed
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

    # payee is user_token and post payment
    b_id = mock_db['Bills'].find_one()['_id']
    resp = client.post('/pay', headers=user_token, json={
        'bill_id': b_id,
        'use_wallet': False
    })
    assert resp.status_code == conftest.OK

    # assert payment went through to provider and revenue in UserAccount
    # & BankAccount is updated
    provider_acc = mock_db['UserAccount'].find_one({'_id': ObjectId(provider['_id'])})
    assert provider_acc['revenue'] == 85
    assert mock_db['BankAccount'].find_one()['balance'] == 15

    # check provider's transaction history for correct transaction
    transaction = provider_acc['recent_transactions'][0]
    transaction.pop('_id')
    transaction.pop('timestamp')
    assert transaction == {
        'listing': conftest.TEST_LID,
        'booking': None,
        'amount': 85,
        'balance': 85
    }

    # check provider's inbox for payment received email
    assert len(provider_acc['inbox']) == 1

    # check payee's transaction history for correct transaction
    transaction = mock_db['UserAccount'].find_one({
        '_id': payee
    })['recent_transactions'][0]
    transaction.pop('_id')
    transaction.pop('timestamp')
    assert transaction == {
        'listing': None,
        'booking': booking['_id'],
        'amount': -100,
        'balance': 0
    }

    # check payee's inbox for payment receipt
    payee = mock_db['UserAccount'].find_one({'_id': payee})
    receipt = payee['inbox'][-1]
    assert receipt['subject'] == f"Payment Receipt #{b_id}"

    # assert bill was added to the bookings[bills]
    assert len(mock_db['Bookings'].find_one({'_id': booking['_id']})['bills']) == 1

    # assert bill has set to paid
    bill = mock_db['Bills'].find_one()
    assert bill['paid'] == True

def test_successful_wallet_payment(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/pay' is posted to with {use_wallet: True} (POST)
    THEN check that a '200' (OK) status code is returned and payment is processed
    """
    payee = mock_db['UserAccount'].find_one()
    mock_db['UserAccount'].update_one(
        {'_id': payee['_id']},
        {'$inc': {'wallet': 1000}}
    )

    # register user one and insert listing into mock_db
    provider = conftest.USER_STUB.copy()
    provider['listings'] = [conftest.TEST_LID]

    mock_db['UserAccount'].insert_one(provider)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    # create booking
    booking_stub = conftest.BOOKING_STUB.copy()
    resp = client.post('/listings/book', headers=user_token, json=booking_stub)
    assert resp.status_code == conftest.OK

    # Create bill
    booking = mock_db['Bookings'].find_one()
    resp = client.post('/bill', headers=user_token, json={
        'booking_id': booking['_id']
    })
    assert resp.status_code == conftest.OK

    # payee is user_token and post payment
    b_id = mock_db['Bills'].find_one()['_id']
    resp = client.post('/pay', headers=user_token, json={
        'bill_id': b_id,
        'use_wallet': True
    })
    assert resp.status_code == conftest.OK

    booking = mock_db['Bookings'].find_one()
    assert booking['paid'] == True

    # assert payment went through and revenue in UserAccount & BankAccount is updated
    provider_acc = mock_db['UserAccount'].find_one({'_id': ObjectId(provider['_id'])})

    assert provider_acc['revenue'] == 85
    assert mock_db['BankAccount'].find_one()['balance'] == 15

    # assert payee's wallet was deducted
    payee = mock_db['UserAccount'].find_one({'_id': payee['_id']})
    assert payee['wallet'] == 900

    # check provider's transaction history for correct transaction
    transaction = provider_acc['recent_transactions'][0]
    transaction.pop('_id')
    transaction.pop('timestamp')
    assert transaction == {
        'listing': conftest.TEST_LID,
        'booking': None,
        'amount': 85,
        'balance': 85
    }

    # check payee's transaction history for correct transaction
    transaction = mock_db['UserAccount'].find_one({
        '_id': payee['_id']
    })['recent_transactions'][0]
    transaction.pop('_id')
    transaction.pop('timestamp')
    assert transaction == {
        'listing': None,
        'booking': booking['_id'],
        'amount': -100,
        'balance': 900
    }

    # assert bill has set to paid
    bill = mock_db['Bills'].find_one()
    assert bill['paid'] == True

def test_wallet_low(client, user_token, mock_db):
    """
    GIVEN a Flask environemnt configured for testing
    WHEN the '/pay' is posted to with { use_wallet: true } but insufficient
        balance in the wallet (POST)
    THEN check that 400 (BAD_REQUEST) is returned
    """
    payee = mock_db['UserAccount'].find_one()
    # register user one and insert listing into mock_db
    user_stub = conftest.USER_STUB.copy()
    user_stub['listings'] = [conftest.TEST_LID]


    mock_db['UserAccount'].insert_one(user_stub)
    mock_db['Listings'].insert_one(conftest.LISTING_STUB.copy())

    # create booking
    booking_stub = conftest.BOOKING_STUB.copy()
    resp = client.post('/listings/book', headers=user_token, json=booking_stub)
    assert resp.status_code == conftest.OK

    # Create bill
    booking = mock_db['Bookings'].find_one()
    resp = client.post('/bill', headers=user_token, json={
        'booking_id': booking['_id']
    })
    assert resp.status_code == conftest.OK

    # payee is user_token and post payment
    b_id = mock_db['Bills'].find_one()['_id']
    resp = client.post('/pay', headers=user_token, json={
        'bill_id': b_id,
        'use_wallet': True
    })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Wallet does not have enough balance'
    }

def test_missing_booking_id(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/pay' is posted to with an invalid booking id (POST)
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.post('/pay', headers=user_token, json={'none': 'none'})
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Valid booking id is required'
    }

def test_incorrect_user_paying(client, user_token, mock_db):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/pay' is posted to with the wrong user paying (POST)
    THEN check that a '400' (BAD_REQUEST) status code is returned
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

    # create bill for booking
    booking = mock_db['Bookings'].find_one()
    resp = client.post('/bill', headers=user_token, json={
        'booking_id': booking['_id']
    })
    assert resp.status_code == conftest.OK

    # modify booking to change consumer id
    booking = mock_db['Bookings'].find_one()
    mock_db['Bookings'].find_one_and_update(
        {'_id': booking['_id']},
        {'$set': { 'consumer': ObjectId() }}
    )

    b_id = mock_db['Bills'].find_one()['_id']
    resp = client.post('/pay', headers=user_token, json={
        'bill_id': b_id,
        'use_wallet': False
    })

    assert resp.status_code == conftest.UNAUTHORIZED
    assert resp.json == {
        'error': 'Incorrect user is paying'
    }

