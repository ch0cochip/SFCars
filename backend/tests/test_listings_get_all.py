from bson import ObjectId
from ..tests import conftest

LISTING_BODY = {
    "address": {
        "street": "test street"
    },
    "daily_price": 100,
    "monthly_price": 400,
    "space_type": "Driveway",
    "max_size": "SUV",
    "description": "test description",
    "access_type": "key card",
    "images": ["test base64 image string"],
    "features": ["test feature"]
}


def test_get_single(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings' is called with GET with 1 listing
    THEN check that a '200' (OK) status code is returned and 1 listing is returned
    """
    client.post('/listings/new', headers=user_token, json=conftest.LISTING_STUB.copy())

    resp = client.get('/listings', headers=user_token)
    assert resp.status_code == conftest.OK

    assert len(resp.json["listings"]) == 1
    listing = mock_db["Listings"].find_one({
        "_id": ObjectId(resp.json["listings"][0]["_id"])
    })
    assert listing


def test_get_multiple(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings' is called with GET with 3 listing
    THEN check that a '200' (OK) status code is returned and 3 listing is returned
    """
    client.post('/listings/new', headers=user_token, json=conftest.LISTING_STUB.copy())
    client.post('/listings/new', headers=user_token, json=conftest.LISTING_STUB.copy())
    client.post('/listings/new', headers=user_token, json=conftest.LISTING_STUB.copy())

    resp = client.get('/listings', headers=user_token)
    assert resp.status_code == conftest.OK

    assert len(resp.json["listings"]) == 3

def test_get_empty(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings' is called with GET with 0 listing
    THEN check that a '200' (OK) status code is returned and 0 listing is returned
    """
    resp = client.get('/listings', headers=user_token)
    assert resp.status_code == conftest.OK

    assert len(resp.json["listings"]) == 0
