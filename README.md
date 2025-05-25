# Vanya Forest Conservation API Documentation

## Base URL

`http://localhost:8000/api`

---

## Authentication

### Register User

**URL**: `/auth/register`  
**Method**: `POST`  
**Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "phone": "+919876543210",
  "address": {
    "street": "123 Forest Rd",
    "town": "Green Valley",
    "pin": "123456",
    "district": "Western Ghats",
    "state": "Karnataka"
  },
  "role": "user"
}
```

**Response** (201 Created):

```json
{
  "message": "User registered successfully",
  "user": {
    "userId": "751681",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "JWT_TOKEN"
}
```

### Login

**URL**: `/auth/login`  
**Method**: `POST`  
**Body**:

```json
{
  "email": "john@example.com",
  "password": "secure123"
}
```

**Response** (200 OK):

```json
{
  "message": "Login successful",
  "user": {
    "userId": "751681",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "JWT_TOKEN"
}
```

## Reports

### Create Report

**URL**: `/reports`  
**Method**: `POST`  
**Headers**: `Authorization: Bearer JWT_TOKEN`  
**Body**:

```json
{
  "incidentType": "WILDLIFE_SIGHTING",
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "accuracy": 10.5
  },
  "description": "Tiger sighting near village",
  "severity": "HIGH"
}
```

**Response** (201 Created):

```json
{
  "message": "Report created successfully",
  "report": {
    "reportId": "abc123-def456",
    "status": "REPORTED",
    "createdAt": "2023-11-15T12:34:56Z"
  }
}
```

### Get User's Reports

**URL**: `/reports/my-reports`  
**Method**: `GET`  
**Headers**: `Authorization: Bearer JWT_TOKEN`  
**Response** (200 OK):

```json
{
  "reports": [
    {
      "reportId": "abc123-def456",
      "incidentType": "WILDLIFE_SIGHTING",
      "status": "REPORTED"
    }
  ]
}
```

## Social Posts

### Create Post

**URL**: `/posts`  
**Method**: `POST`  
**Headers**: `Authorization: Bearer JWT_TOKEN`  
**Body**:

```json
{
  "content": "Spotted a tiger today!",
  "imageUrl": "https://example.com/tiger.jpg"
}
```

**Response** (201 Created):

```json
{
  "postId": "8a08e432-35be-41ad-ba88-e64c26460215",
  "content": "Spotted a tiger today!",
  "likes": 0,
  "comments": []
}
```

### Add Comment

**URL**: `/posts/{postId}/comments`  
**Method**: `POST`  
**Headers**: `Authorization: Bearer JWT_TOKEN`  
**Body**:

```json
{
  "text": "Amazing sighting!"
}
```

**Response** (201 Created):

```json
{
  "commentId": "comm123",
  "text": "Amazing sighting!",
  "userName": "John Doe",
  "createdAt": "2023-11-16T10:30:45Z"
}
```

### Like Post

**URL**: `/posts/{postId}/like`  
**Method**: `POST`  
**Headers**: `Authorization: Bearer JWT_TOKEN`  
**Response** (200 OK):

```json
{
  "action": "liked",
  "likesCount": 5
}
```

## Admin Endpoints

### Get All Reports (Admin)

**URL**: `/admin/reports`  
**Method**: `GET`  
**Headers**: `Authorization: Bearer ADMIN_JWT_TOKEN`  
**Response** (200 OK):

```json
{
  "reports": [
    {
      "reportId": "abc123",
      "incidentType": "WILDLIFE_SIGHTING",
      "status": "VERIFIED"
    }
  ]
}
```

### Create Fundraiser (Admin)

**URL**: `/admin/fundraisers`  
**Method**: `POST`  
**Headers**: `Authorization: Bearer ADMIN_JWT_TOKEN`  
**Body**:

```json
{
  "title": "Save the Tigers",
  "description": "Anti-poaching initiative",
  "targetAmount": 50000
}
```

**Response** (201 Created):

```json
{
  "fundraiserId": "fund123",
  "title": "Save the Tigers",
  "currentAmount": 0
}
```

## Error Responses

### 400 Bad Request:

```json
{
  "message": "Missing required fields"
}
```

### 401 Unauthorized:

```json
{
  "message": "Please authenticate"
}
```

### 403 Forbidden:

```json
{
  "message": "Access denied"
}
```

### 404 Not Found:

```json
{
  "message": "Post not found"
}
```

### 500 Server Error:

```json
{
  "message": "Internal server error"
}
```

## Setup Instructions

Install dependencies:

```bash
npm install
```

Create .env file:

```env
JWT_SECRET=your_secret_key
FIREBASE_SERVICE_ACCOUNT=path/to/serviceAccount.json
```

Run server:

```bash
npm start
```

This README includes:

- All API endpoints with clear HTTP methods
- Required headers (especially for authenticated routes)
- Example request bodies
- Example success/error responses
- Setup instructions
- Consistent formatting for easy reading

You can extend this with:

- Rate limiting info
- Pagination details
- Webhook notifications
- Changelog/versioning
