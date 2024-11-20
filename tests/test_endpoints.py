import json


def test_register_user(test_client):
    # Testing user registration
    response = test_client.post('/api/register', json={
        'username': 'testuser',
        'email': 'testuser@example.com',
        'password': 'password123'
    })
    assert response.status_code == 200
    assert b"User registered successfully" in response.data


def test_login_user(test_client):
    # Case 1: Test invalid credentials
    invalid_credentials = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    response = test_client.post('/api/login', json=invalid_credentials)

    response_json = response.get_json()
    assert response_json[1] == 401
    assert response_json[0] == {'error': 'Invalid credentials'}

    # Case 2: Test valid credentials
    valid_credentials = {
        "email": "testuser@example.com",
        "password": "password123"
    }
    response = test_client.post('/api/login', json=valid_credentials)

    response_json = response.get_json()
    assert response_json[1] == 200
    assert "access_token" in response_json[0]


def test_get_languages(test_client):
    # Simulating a logged-in user with a valid JWT token
    login_response = test_client.post('/api/login', json={
        'email': 'testuser@example.com',
        'password': 'password123'
    })

    response_json = login_response.get_json()
    token = response_json[0]['access_token']

    response = test_client.get('/api/languages', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    assert isinstance(json.loads(response.data), list)


def test_get_categories(test_client):
    # Simulating a logged-in user
    login_response = test_client.post('/api/login', json={
        'email': 'testuser@example.com',
        'password': 'password123'
    })

    response_json = login_response.get_json()
    token = response_json[0]['access_token']

    response = test_client.get('/api/categories', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    assert isinstance(json.loads(response.data), list)


def test_protected_route(test_client):
    # Testing a protected route
    login_response = test_client.post('/api/login', json={
        'email': 'testuser@example.com',
        'password': 'password123'
    })

    response_json = login_response.get_json()
    token = response_json[0]['access_token']

    response = test_client.get('/api/protected', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
