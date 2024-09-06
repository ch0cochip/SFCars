from bson import ObjectId
from ..tests import conftest

def test_get_analytics(client, list_book):
    """
    GIVEN a Flask application configured for testing
    WHEN the '/user/analytics' is called
    THEN check that a '200' (OK) status code and all the listings reviews
    """
    resp = client.get('/user/analytics', headers=list_book[2])
    assert resp.status_code == conftest.OK
    data = resp.get_json()
    assert data["monthly_revenue"] == [{'month': 1, 'revenue': 100.0}]
    assert data["total_bookings"] == 1

def test_get_analytics_empty(client, user_token):
    resp = client.get('/user/analytics', headers=user_token)
    assert resp.status_code == conftest.OK
    assert resp.get_json() == {
        "monthly_revenue": [],
        "bookings_per_listing": [],
        "total_bookings": 0
    }
