from ..tests import conftest

def test_get_valid(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/user/profile' is called with GET
    THEN check that a '200' (OK) status code and the users profile is returned
    """
    resp = client.get('/user/profile', headers=user_token)

    assert resp.status_code == conftest.OK

    user = mock_db["UserAccount"].find_one()

    user["_id"] = str(user["_id"])
    user.pop("password")

    assert user == resp.json

def test_put_valid(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/user/profile' is called with PUT
    THEN check that a '200' (OK) status code is returned and the profile is updated
    """
    user = mock_db["UserAccount"].find_one()

    resp = client.put('/user/profile', headers=user_token, json={
        "first_name": "new_first"
    })

    assert resp.status_code == conftest.OK

    new_user = mock_db["UserAccount"].find_one()

    assert user["first_name"] != new_user["first_name"]
    assert new_user["first_name"] == "new_first"

def test_put_remove_key(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/user/profile' is called with PUT with a key that can't be updated
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    user = mock_db["UserAccount"].find_one()

    resp = client.put('/user/profile', headers=user_token, json={
        "password": "cannot_update_password"
    })

    assert resp.status_code == conftest.BAD_REQUEST

    # No change
    new_user = mock_db["UserAccount"].find_one()
    assert user == new_user

def test_put_invalid_key(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/user/profile' is called with PUT with an invalid key
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    user = mock_db["UserAccount"].find_one()

    resp = client.put('/user/profile', headers=user_token, json={
        "invalid_key": "invalid_key"
    })

    assert resp.status_code == conftest.BAD_REQUEST

    # No change
    new_user = mock_db["UserAccount"].find_one()
    assert user == new_user

def test_put_invalid_type(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/user/profile' is called with PUT with an invalid value type
    THEN check that a '400' (BAD_REQUEST) status code is returned
    """
    user = mock_db["UserAccount"].find_one()

    resp = client.put('/user/profile', headers=user_token, json={
        "first_name": ["invalid array"]
    })

    assert resp.status_code == conftest.BAD_REQUEST

    # No change
    new_user = mock_db["UserAccount"].find_one()
    assert user == new_user

def test_delete_valid(client, mock_db, user_token):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/user/profile' is called with GET
    THEN check that a '200' (OK) status code and the users profile is returned
    """
    # User should exist
    assert mock_db["UserAccount"].find_one()

    resp = client.delete('/user/profile', headers=user_token)

    assert resp.status_code == conftest.OK

    # User should not exist
    assert not mock_db["UserAccount"].find_one()
