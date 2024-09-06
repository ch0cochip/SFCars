from bson import ObjectId
from ..tests import conftest

def test_successful_withdraw(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/wallet/withdraw' is posted to (POST)
    THEN check that a '200' (OK) status code is returned and money withdrawed
    """
    mock_db['UserAccount'].update_one(
        {},
        {'$inc': {'wallet': 1000}}
    )

    payee = mock_db['UserAccount'].find_one()
    assert payee['wallet'] == 1000

    resp = client.post('/wallet/withdraw', headers=user_token, json={
        'user_id': payee['_id'],
        'amt': 1000
    })
    assert resp.status_code == conftest.OK

    payee = mock_db['UserAccount'].find_one()
    assert payee['wallet'] == 0

    # check transaction history
    transaction = mock_db['UserAccount'].find_one({
        '_id': payee['_id']
    })['recent_transactions'][0]
    transaction.pop('_id')
    transaction.pop('timestamp')

    assert transaction == {
        'listing': None,
        'booking': None,
        'amount': -1000,
        'balance': 0
    }

    # check payee's inbox for receipt
    assert len(payee['inbox']) == 1

def test_unsuccessful_withdraw(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/wallet/withdraw' is posted to without sufficient balance in wallet (POST)
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    user = mock_db['UserAccount'].find_one()

    resp = client.post('/wallet/withdraw', headers=user_token, json={
        'user_id': user['_id'],
        'amt': 1000
    })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Wallet does not have enough balance'
    }

def test_invalid_amt(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/wallet/withdraw' is posted to with an invalid amount (POST)
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    user = mock_db['UserAccount'].find_one()

    resp = client.post('/wallet/withdraw', headers=user_token, json={
        'user_id': user['_id'],
        'amt': -1000
    })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Valid amount is required'
    }

def test_missing_amt(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/wallet/withdraw' is posted to with an invalid amount (POST)
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    user = mock_db['UserAccount'].find_one()

    resp = client.post('/wallet/withdraw', headers=user_token, json={
        'user_id': user['_id'],
    })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Valid amount is required'
    }

def test_invalid_user_id(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/wallet/withdraw' is posted to with an invalid user id (POST)
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.post('/wallet/withdraw', headers=user_token, json={
        'user_id': 'invalid',
        'amt': 1000
    })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Valid user id is required'
    }

def test_missing_user_id(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/wallet/withdraw' is posted to with an invalid user id (POST)
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.post('/wallet/withdraw', headers=user_token, json={
        'amt': 1000
    })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Valid user id is required'
    }