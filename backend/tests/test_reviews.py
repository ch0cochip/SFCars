from bson import ObjectId
from ..tests import conftest

def test_invalid_booking_id(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/<booking_id>/review' is called with an invalid id
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.get('/bookings/invalid_id/review', headers=user_token)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.get_json()["error"] == "Invalid booking id"

def test_nonexisting_booking_id(client, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/<booking_id>/review' is called with an non-existing id
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    invalid_id = ObjectId()
    resp = client.get(f'/bookings/{invalid_id}/review', headers=user_token)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.get_json()["error"] == "Booking doesn't exist"

def test_invalid_user(client, list_book):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/<booking_id>/review' is called with an invalid user
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    register_data = {
        "email": "invalid@email.com",
        "password": conftest.TEST_PW,
        "first_name": conftest.TEST_FIRST_NAME,
        "last_name": conftest.TEST_LAST_NAME,
        "phone_number": "0400023646",
    }

    resp = client.post('/auth/register', json=register_data)
    token_head = {
       "Authorization": "Bearer " + resp.get_json()["token"]
    }
    resp = client.get(f'/bookings/{list_book[1]}/review', headers=token_head)
    assert resp.status_code == conftest.FORBIDDEN

def test_post_no_rating(client, user_token, list_book):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/<booking_id>/review' is called with no rating
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    body = conftest.REVIEW_STUB.copy()
    body.pop("rating")
    resp = client.post(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = body)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.get_json()["error"] == "Valid rating is required"

def test_post_no_message(client, user_token, list_book):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/<booking_id>/review' is called with no message
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    body = conftest.REVIEW_STUB.copy()
    body.pop("message")
    resp = client.post(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = body)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.get_json()["error"] == "Valid message is required"

def test_post_success(client, mock_db, user_token, list_book):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/<booking_id>/review' is called with a valid body
    THEN check that a '200' (OK) status code is returned and a review is created
    """
    body = conftest.REVIEW_STUB.copy()
    resp = client.post(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = body)
    assert resp.status_code == conftest.OK
    assert ObjectId.is_valid(resp.get_json()["review_id"])
    assert mock_db["Reviews"].find_one()["message"] == "message"
    assert mock_db["Reviews"].find_one()["rating"] == 2.0
    assert mock_db["Reviews"].find_one()["name"] == "John"

    assert mock_db["Listings"].find_one({ "_id": ObjectId(list_book[0]) })["rating"] == 2.0
    provider_id = mock_db["Listings"].find_one()["provider"]
    # User has two listiings so account rating should be 1
    provider = mock_db["UserAccount"].find_one({ "_id": provider_id })
    assert provider["rating"] == 1.0

    # CHECK provider's inbox for notification of review (should have booking and review)
    assert len(provider['inbox']) == 2

def test_post_existing(client, user_token, list_book):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/<booking_id>/review' is called with an existing review
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    body = conftest.REVIEW_STUB.copy()
    resp = client.post(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = body)
    assert resp.status_code == conftest.OK

    resp = client.post(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = body)
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.get_json()["error"] == "Review already exists"

def test_put_key_not_allowed(client, user_token, list_book):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/<booking_id>/review' is called with a not allowed key
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    body = conftest.REVIEW_STUB.copy()
    resp = client.post(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = body)
    assert resp.status_code == conftest.OK

    resp = client.put(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = { "_id": "invalid" })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.get_json()["error"] == "Cannot update _id"

def test_put_invalid_key(client, user_token, list_book):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/<booking_id>/review' is called with an invalid key
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    body = conftest.REVIEW_STUB.copy()
    resp = client.post(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = body)
    assert resp.status_code == conftest.OK

    resp = client.put(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = { "invalid_key": "invalid" })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.get_json()["error"] == "Invalid update key"

def test_put_invalid_type(client, user_token, list_book):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/<booking_id>/review' is called with an invalid value type
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    body = conftest.REVIEW_STUB.copy()
    resp = client.post(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = body)
    assert resp.status_code == conftest.OK

    resp = client.put(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = { "message": 123 })
    assert resp.status_code == conftest.BAD_REQUEST
    assert resp.get_json()["error"] == "Update value has invalid typing"

def test_put_success(client, mock_db, user_token, list_book):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/<booking_id>/review' is called with a valid body
    THEN check that a '200' (OK) status code is returned and the review is updated
    """
    body = conftest.REVIEW_STUB.copy()
    resp = client.post(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = body)
    assert resp.status_code == conftest.OK
    assert mock_db["Reviews"].find_one()["message"] == "message"

    resp = client.put(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = { "message": "new message" })
    assert resp.status_code == conftest.OK
    assert mock_db["Reviews"].find_one()["message"] == "new message"

def test_delete_success(client, mock_db, user_token, list_book):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/<booking_id>/review' is called
    THEN check that a '200' (OK) status code is returned and the review is removed
    """
    body = conftest.REVIEW_STUB.copy()
    resp = client.post(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = body)
    assert resp.status_code == conftest.OK

    resp = client.delete(f'/bookings/{list_book[1]}/review', headers=user_token, json={})
    assert resp.status_code == conftest.OK
    assert not mock_db["Reviews"].find_one()

def test_get_success(client, user_token, list_book):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/bookings/<booking_id>/review' is called
    THEN check that a '200' (OK) status code and the review body is returned
    """
    body = conftest.REVIEW_STUB.copy()
    resp = client.post(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = body)
    assert resp.status_code == conftest.OK

    resp = client.get(f'/bookings/{list_book[1]}/review', headers=user_token)
    assert resp.status_code == conftest.OK
    assert resp.get_json()["message"] == "message"
    assert resp.get_json()["rating"] == 2.0

def test_get_listing_reviews(client, user_token, list_book):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/listings/<listing_id>' is called
    THEN check that a '200' (OK) status code and all the listings reviews
    """
    body = conftest.REVIEW_STUB.copy()
    resp = client.post(f'/bookings/{list_book[1]}/review', headers=user_token,
                      json = body)
    assert resp.status_code == conftest.OK

    resp = client.get(f'/listings/{list_book[0]}', headers=user_token)
    assert resp.status_code == conftest.OK
    listing_reviews = resp.get_json()["reviews"]

    assert listing_reviews[0]["message"] == "message"
    assert listing_reviews[0]["rating"] == 2.0
