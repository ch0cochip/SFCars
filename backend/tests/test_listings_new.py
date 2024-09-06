from bson import ObjectId
from ..tests import conftest

def test_successful_listing(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings/new' is posted to (POST)
    THEN check that a '200' (OK) status code is returned and the listing is created
    """
    listing_stub = conftest.LISTING_STUB.copy()

    response = client.post('/listings/new', headers=user_token ,
                           json=listing_stub)
    assert response.status_code == conftest.OK
    assert ObjectId().is_valid(response.json["listing_id"])
    listing = mock_db["Listings"].find_one({
        "_id": ObjectId(response.json["listing_id"])
    })
    assert listing

    user_id = listing['provider']
    user_acc = mock_db['UserAccount'].find_one({'_id': user_id})
    assert user_acc['listings'] == [listing['_id']]

    assert ObjectId().is_valid(listing.pop("_id"))
    assert ObjectId().is_valid(listing.pop("provider"))
    listing_stub.pop('_id')
    listing_stub.pop('provider')

    assert listing == listing_stub


def test_invalid_token(client):
    """
    GIVEN a Flask application configured for testing
    WHEN the 'listings/new' is posted with an invalid address (POST)
    THEN check that a '400' (BAD REQUEST) code and suitable message is returned
    """
    response = client.post('/listings/new', headers={"Authorization": "invalid"},
                           json=conftest.LISTING_STUB.copy())
    assert response.status_code == conftest.UNAUTHORIZED


def test_missing_address(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the 'listings/new' is posted with a missing address (POST)
    THEN check that a '400' (BAD REQUEST) code and suitable message is returned
    """
    test_body = conftest.LISTING_STUB.copy().copy()
    test_body.pop("address")
    response = client.post('/listings/new', headers=user_token,
                           json=test_body)
    assert response.status_code == conftest.BAD_REQUEST
    assert response.json == {
        "error": "Valid address is required",
    }


def test_missing_hourly_rate(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the 'listings/new' is posted with a missing rate (POST)
    THEN check that a '400' (BAD REQUEST) code and suitable message is returned
    """
    test_body = conftest.LISTING_STUB.copy().copy()
    test_body.pop('hourly_rate')
    response = client.post('/listings/new', headers=user_token,
                           json=test_body)
    assert response.status_code == conftest.OK


def test_missing_monthly_rate(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the 'listings/new' is posted with a missing rate (POST)
    THEN check that a '400' (BAD REQUEST) code and suitable message is returned
    """
    test_body = conftest.LISTING_STUB.copy().copy()
    test_body.pop("monthly_rate")
    response = client.post('/listings/new', headers=user_token,
                           json=test_body)
    assert response.status_code == conftest.OK


def test_missing_rate(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the 'listings/new' is posted with a missing rate (POST)
    THEN check that a '400' (BAD REQUEST) code and suitable message is returned
    """
    test_body = conftest.LISTING_STUB.copy().copy()
    test_body.pop("monthly_rate")
    test_body.pop("hourly_rate")
    response = client.post('/listings/new', headers=user_token,
                           json=test_body)
    assert response.status_code == conftest.BAD_REQUEST
    assert response.json == {
        "error": "Valid rate is required",
    }


def test_invalid_hourly_rate(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the 'listings/new' is posted with an invalid rate (POST)
    THEN check that a '400' (BAD REQUEST) code and suitable message is returned
    """
    test_body = conftest.LISTING_STUB.copy().copy()
    test_body["hourly_rate"] = "invalid rate"
    response = client.post('/listings/new', headers=user_token,
                           json=test_body)
    assert response.status_code == conftest.BAD_REQUEST
    assert response.json == {
        "error": "Valid hourly rate is required",
    }


def test_invalid_monthly_rate(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the 'listings/new' is posted with an invalid rate (POST)
    THEN check that a '400' (BAD REQUEST) code and suitable message is returned
    """
    test_body = conftest.LISTING_STUB.copy().copy()
    test_body["monthly_rate"] = "invalid rate"
    response = client.post('/listings/new', headers=user_token,
                           json=test_body)
    assert response.status_code == conftest.BAD_REQUEST
    assert response.json == {
        "error": "Valid monthly rate is required",
    }


def test_missing_listing_type(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the 'listings/new' is posted with a missing listing_type (POST)
    THEN check that a '400' (BAD REQUEST) code and suitable message is returned
    """
    test_body = conftest.LISTING_STUB.copy().copy()
    test_body.pop("listing_type")
    response = client.post('/listings/new', headers=user_token,
                           json=test_body)
    assert response.status_code == conftest.BAD_REQUEST
    assert response.json == {
        "error": "Valid car space type is required",
    }


def test_missing_max_vehicle_size(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the 'listings/new' is posted with a missing max_vehicle_size (POST)
    THEN check that a '400' (BAD REQUEST) code and suitable message is returned
    """
    test_body = conftest.LISTING_STUB.copy().copy()
    test_body.pop("max_vehicle_size")
    response = client.post('/listings/new', headers=user_token,
                           json=test_body)
    assert response.status_code == conftest.BAD_REQUEST
    assert response.json == {
        "error": "Valid max vehicle size is required",
    }


def test_missing_description(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the 'listings/new' is posted with a missing description (POST)
    THEN check that a '400' (BAD REQUEST) code and suitable message is returned
    """
    test_body = conftest.LISTING_STUB.copy().copy()
    test_body.pop("description")
    response = client.post('/listings/new', headers=user_token,
                           json=test_body)
    assert response.status_code == conftest.BAD_REQUEST
    assert response.json == {
        "error": "Valid description is required",
    }


def test_missing_access_type(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the 'listings/new' is posted with a missing access_type (POST)
    THEN check that a '400' (BAD REQUEST) code and suitable message is returned
    """
    test_body = conftest.LISTING_STUB.copy().copy()
    test_body.pop("access_type")
    response = client.post('/listings/new', headers=user_token,
                           json=test_body)
    assert response.status_code == conftest.BAD_REQUEST
    assert response.json == {
        "error": "Valid access type is required",
    }


def test_missing_images(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the 'listings/new' is posted with a missing images (POST)
    THEN check that a '400' (BAD REQUEST) code and suitable message is returned
    """
    test_body = conftest.LISTING_STUB.copy().copy()
    test_body.pop("photos")
    response = client.post('/listings/new', headers=user_token,
                           json=test_body)
    assert response.status_code == conftest.BAD_REQUEST
    assert response.json == {
        "error": "Valid images are required",
    }
