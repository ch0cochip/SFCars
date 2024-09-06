from bson import ObjectId
from ..tests import conftest

def test_successful_topup(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/wallet/topup' is posted to (POST)
    THEN check that a '200' (OK) status code is returned and wallet topuped
    """
    payee = mock_db['UserAccount'].find_one()

    resp = client.post('/wallet/top-up', headers=user_token, json={
        'user_id': payee['_id'],
        'amt': 1000
    })
    assert resp.status_code == conftest.OK

    payee = mock_db['UserAccount'].find_one()
    assert payee['wallet'] == 1000

    resp = client.post('/wallet/top-up', headers=user_token, json={
        'user_id': payee['_id'],
        'amt': 500
    })
    assert resp.status_code == conftest.OK

    payee = mock_db['UserAccount'].find_one()
    assert payee['wallet'] == 1500

    # check transaction history
    history = mock_db['UserAccount'].find_one({
        '_id': payee['_id']
    })['recent_transactions']

    transaction = history[0]
    transaction.pop('_id')
    transaction.pop('timestamp')

    assert transaction == {
        'listing': None,
        'booking': None,
        'amount': 1000,
        'balance': 1000
    }

    transaction = history[1]
    transaction.pop('_id')
    transaction.pop('timestamp')
    assert transaction == {
        'listing': None,
        'booking': None,
        'amount': 500,
        'balance': 1500
    }

    assert len(payee['inbox']) == 2


def test_invalid_amt(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/wallet/top-up' is posted to with an invalid amount (POST)
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    user = mock_db['UserAccount'].find_one()

    resp = client.post('/wallet/top-up', headers=user_token, json={
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
    WHEN the '/wallet/top-up' is posted to with an invalid amount (POST)
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    user = mock_db['UserAccount'].find_one()

    resp = client.post('/wallet/top-up', headers=user_token, json={
        'user_id': user['_id'],
    })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Valid amount is required'
    }

def test_invalid_user_id(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/wallet/top-up' is posted to with an invalid user id (POST)
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.post('/wallet/top-up', headers=user_token, json={
        'user_id': 'invalid',
        'amt': 1000
    })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Valid user id is required'
    }

def test_missing_user_id(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/wallet/top-up' is posted to with an invalid user id (POST)
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.post('/wallet/top-up', headers=user_token, json={
        'amt': 1000
    })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.json == {
        'error': 'Valid user id is required'
    }