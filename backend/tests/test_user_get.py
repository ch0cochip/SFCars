from bson import ObjectId
from ..tests import conftest

USER_STUB = conftest.USER_STUB.copy()
USER_STUB.pop("_id")

def test_valid(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/user/:user_id' is called with GET
    THEN check that a '200' (OK) status code is returned and the user is returned
    """
    user = mock_db["UserAccount"].find_one()

    resp = client.get(f'/user/{user["_id"]}', headers=user_token)

    assert resp.status_code == conftest.OK

    user["_id"] = str(user["_id"])
    user.pop("password")
    user.pop("payment_details")

    assert resp.json == user

def test_invalid_user_id(client):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/user/:user_id' is called with GET with an invalid user id
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    invalid_id = ObjectId()
    resp = client.get(f'/user/{invalid_id}')

    assert resp.status_code == conftest.BAD_REQUEST

def test_invalid_object_id(client):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/user/:user_id' is called with GET with an invalid object id
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    resp = client.get('/user/invalid_id')

    assert resp.status_code == conftest.BAD_REQUEST
