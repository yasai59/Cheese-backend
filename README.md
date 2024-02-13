# Cheese Backend

The official source code for the backend of the Cheese platform

## Routes

### User
- **POST /api/user**
  - Request **body**:
  ```json
  {
    "user": {
        "username": "username",
        "email": "email@g.com",
        "password": "1234",
        "role_id": 1
    }
  }
  ```
  - Response:
  ```json
  {
    "message": "User created successfully",
    "token": "<token>",
    "user": {
      "id": 7,
      "username": "username",
      "email": "email@g.com",
      "active": 1,
      "role_id": 1,
      "creation_date": "2024-02-13T09:40:14.000Z",
      "lot_number": 10,
      "photo": null,
      "google": 0,
      "verified": 0
      }
  }
  ```
- **POST /api/user/login**
  - Request **body**:
  ```json
  {
    "username": "username",
    "password": "1234"
  }
  ```
  - Response:
  ```json
  {
    "message": "User logged in successfully",
    "token": "<token>",
    "user": {
      "id": 7,
      "username": "username",
      "email": "email@g.com",
      "active": 1,
      "role_id": 1,
      "creation_date": "2024-02-13T09:40:14.000Z",
      "lot_number": 10,
      "photo": null,
      "google": 0,
      "verified": 0
      }
  }
  ```
- **GET /api/user/verify**
  - Request **url**:
  ```
  https://<your_domain>/api/user/verify?code=<codeProvidedByEmail>
  ```
  - Response:
  ```html
  <h1>User verified successfully</h1>
  <!-- OR -->
  <h1>Error verifying the user</h1>
  <!-- OR -->
  <h1>Verification link not valid</h1>
  ```

## dependences

- Bun :)

## How to use it

- Clone the repo
```bash
git clone https://github.com/yasai59/Cheese-backend.git
```

- Enter the folder and install dependencies
```bash
cd Cheese-backend
bun install
```

## Thank you!

This project was made with love by Arnau Rios and Alejandro Vidal (Yasai)