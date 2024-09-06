from bson import ObjectId
from ..tests import conftest

def test_get_invalid(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings/:listing_id' is called with GET with an invalid id
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.get('/listings/invalid_id', headers=user_token)
    assert resp.status_code == conftest.BAD_REQUEST

def test_get_exists(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings/:listing_id' is called with GET
    THEN check that a '200' (OK) status code is returned and the listing is returned
    """
    resp = client.post('/listings/new', headers=user_token, json=conftest.LISTING_STUB.copy())
    listing_id = resp.json["listing_id"]

    resp = client.get(f'/listings/{listing_id}', headers=user_token)
    assert resp.status_code == conftest.OK

    listing = mock_db["Listings"].find_one({
        "_id": ObjectId(resp.json["_id"])
    })
    assert listing

def test_put_invalid_user(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings/:listing_id' is called with PUT from the wrong user
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.post('/auth/register', json={
        "email": "randomuser@email.com",
        "password": conftest.TEST_PW,
        "first_name": conftest.TEST_FIRST_NAME,
        "last_name": conftest.TEST_LAST_NAME,
        "phone_number": conftest.TEST_PN,
    })
    alternate_head = {
       "Authorization": "Bearer " + resp.get_json()["token"]
    }
    resp = client.post('/listings/new', headers=alternate_head, json=conftest.LISTING_STUB.copy())
    listing_id = resp.json["listing_id"]

    resp = client.put(f'/listings/{listing_id}', headers=user_token)
    assert resp.status_code == conftest.FORBIDDEN

def test_put_valid(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings/:listing_id' is called with PUT
    THEN check that a '200' (OK) status code is returned the listing is updated
    """
    resp = client.post('/listings/new', headers=user_token, json=conftest.LISTING_STUB.copy())
    listing_id = resp.json["listing_id"]

    assert mock_db["Listings"].find_one()["listing_type"] == "Driveway"
    resp = client.put(f'/listings/{listing_id}', headers=user_token, json={
        "listing_type": "new type"
    })
    assert resp.status_code == conftest.OK
    assert mock_db["Listings"].find_one()["listing_type"] == "new type"

def test_put_invalid_key(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings/:listing_id' is called with PUT with an invalid key
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.post('/listings/new', headers=user_token, json=conftest.LISTING_STUB.copy())
    listing_id = resp.json["listing_id"]

    resp = client.put(f'/listings/{listing_id}', headers=user_token, json={
        "test": "new type"
    })
    assert resp.status_code == conftest.BAD_REQUEST

def test_put_invalid_value(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings/:listing_id' is called with PUT with an invalid value
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.post('/listings/new', headers=user_token, json=conftest.LISTING_STUB.copy())
    listing_id = resp.json["listing_id"]

    resp = client.put(f'/listings/{listing_id}', headers=user_token, json={
        "images": "wrong type"
    })
    assert resp.status_code == conftest.BAD_REQUEST

def test_delete(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings/:listing_id' is called with DELETE
    THEN check that a '200' (OK) status code is returned and the listing is deleted
    """
    resp = client.post('/listings/new', headers=user_token, json=conftest.LISTING_STUB.copy())
    listing_id = resp.json["listing_id"]

    listing = mock_db['Listings'].find_one({'_id': ObjectId(listing_id)})

    user_acc = mock_db['UserAccount'].find_one({'_id': ObjectId(listing['provider'])})
    assert len(user_acc['listings']) == 1

    resp = client.delete(f'/listings/{listing_id}', headers=user_token)
    assert resp.status_code == conftest.OK

    user_acc = mock_db['UserAccount'].find_one({'_id': ObjectId(listing['provider'])})

    assert mock_db["Listings"].find_one() is None
    assert len(user_acc['listings']) == 0

def test_admin_put(client, mock_db, user_token, admin_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings/:listing_id' is called with PUT by an admin
    THEN check that a '200' (OK) status code is returned the listing is updated
    """
    resp = client.post('/listings/new', headers=user_token, json=conftest.LISTING_STUB.copy())
    listing_id = resp.json["listing_id"]

    assert mock_db["Listings"].find_one()["listing_type"] == "Driveway"
    resp = client.put(f'/listings/{listing_id}', headers=admin_token, json={
        "listing_type": "new type"
    })
    assert resp.status_code == conftest.OK
    assert mock_db["Listings"].find_one()["listing_type"] == "new type"

def test_admin_delete(client, mock_db, user_token, admin_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings/:listing_id' is called with DELETE by an admin
    THEN check that a '200' (OK) status code is returned and the listing is deleted
    """
    resp = client.post('/listings/new', headers=user_token, json=conftest.LISTING_STUB.copy())
    listing_id = resp.json["listing_id"]

    resp = client.delete(f'/listings/{listing_id}', headers=admin_token)
    assert resp.status_code == conftest.OK

    assert mock_db["Listings"].find_one() is None

