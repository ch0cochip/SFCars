import jwt
from bson import ObjectId
from ..tests import conftest

USER_DOC = {
    "_id": conftest.TEST_UID,
    "email": conftest.TEST_EMAIL,
    "password": conftest.TEST_PW_HASH
}

def test_successful_login(client, mock_db):
    """
    GIVEN a Flask application configured for testing
    WHEN the 'auth/login' is posted to (POST)
    THEN check that a '200' (OK) status code is returned and user is registered
    """
    mock_db["UserAccount"].insert_one(USER_DOC.copy())
    response = client.post('/auth/login', json={
        "email": conftest.TEST_EMAIL,
        "password": conftest.TEST_PW
    })
    assert response.status_code == conftest.OK
    token = response.json["token"]
    data = jwt.decode(token, conftest.TEST_JWT_KEY, algorithms=["HS256"])
    # check that the returned user id is valid
    assert ObjectId(data["sub"]) == conftest.TEST_UID


def test_unsuccessful_login(client, mock_db):
    """
    GIVEN a Flask application configured for testing
    WHEN the 'auth/login' is posted to (POST)
    THEN check that a '200' (OK) status code is returned and user is registered
    """
    mock_db["UserAccount"].insert_one(USER_DOC.copy())
    response = client.post('/auth/login', json={
        "email": conftest.TEST_EMAIL,
        "password": "wrong password"
    })
    assert response.status_code == conftest.BAD_REQUEST
    assert response.json["error"] == "Invalid email or password"

