# Location-Based Service API

This is a location-based service that allows you to search for places. It uses JWT for authentication.

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Running the Application

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/haivutuan93/location_based_service
    cd location-based-service
    ```
    *Note: A pre-configured `.env` file is required in the root directory for the application to run.*

2.  **Start the Application**
    ```bash
    ./start.sh
    ```
    *(If you get a "permission denied" error, you may need to make the script executable by running: `chmod +x start.sh`)*

    This script will:
    - Build and start the Docker containers for the backend and database.
    - Automatically run database migrations.
    
    The API will then be available at `http://localhost:3000`.

3.  **Stop the Application**
    ```bash
    ./stop.sh
    ```
     *(If needed, run `chmod +x stop.sh` to make it executable.)*

## API Usage

The API requires authentication for some endpoints. You need to register a user, log in to get a JWT token, and then use that token in the `Authorization` header for protected requests.

### 1. Register a new user

Create a new user by sending a `POST` request to the `/api/auth/register` endpoint.

```bash
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"email": "test@example.com", "password": "password123"}'
```

### 2. Log in to get a JWT Token

Log in with your user credentials to receive a JWT token.

```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "test@example.com", "password": "password123"}'
```

The response will contain a token:

```json
{
  "token": "your_jwt_token_here"
}
```

Copy the `token` value from the response.

### 3. Search for places

Search for places within a certain radius. You can also filter by `name` and `type`.

**a. Search by location and radius:**
```bash
curl -X GET "http://localhost:3000/api/places/search?latitude=16.6925&longitude=-3.3457&radius=100000"
```

**b. Search with a name filter:**
```bash
curl -X GET "http://localhost:3000/api/places/search?latitude=10.762622&longitude=106.660172&radius=100000&name=Circle"
```

**c. Search with a type filter:**
```bash
curl -X GET "http://localhost:3000/api/places/search?latitude=10.762622&longitude=106.660172&radius=100000&type=gas_station"
```

**d. Search with both name and type filters:**
```bash
curl -X GET "http://localhost:3000/api/places/search?latitude=10.762622&longitude=106.660172&radius=100000&name=Winmart&type=gas_station"
```

This will return a list of places based on your search criteria.

### 4. Add a place to favorites

To add a place to your favorites, you need to be authenticated. Make sure to store your token from the login step.

```bash
export TOKEN="your_jwt_token_here"
```

```bash
curl -X POST http://localhost:3000/api/users/favorites \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{"placeId": 1}'
```

### 5. View your favorite places

```bash
curl -X GET http://localhost:3000/api/users/favorites \
-H "Authorization: Bearer $TOKEN"
```

### 6. Remove a place from favorites

```bash
curl -X DELETE http://localhost:3000/api/users/favorites/1 \
-H "Authorization: Bearer $TOKEN"
```
