# API Keys Management API

This document describes the API endpoints for managing API keys in the dashboard.

## Base URL
```
http://localhost:3000/api/keys
```

## Endpoints

### GET /api/keys
Retrieve all API keys.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Production API Key",
      "key": "pk_live_1234567890abcdef",
      "description": "API key for production environment",
      "permissions": ["read", "write"],
      "createdAt": "2024-01-15",
      "lastUsed": "2024-01-20"
    }
  ]
}
```

### POST /api/keys
Create a new API key.

**Request Body:**
```json
{
  "name": "My API Key",
  "description": "Description of the API key",
  "permissions": ["read", "write"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "My API Key",
    "key": "pk_abc123def456_xyz789",
    "description": "Description of the API key",
    "permissions": ["read", "write"],
    "createdAt": "2024-01-25",
    "lastUsed": "Never"
  }
}
```

### PUT /api/keys
Update an existing API key.

**Request Body:**
```json
{
  "id": 1,
  "name": "Updated API Key Name",
  "description": "Updated description",
  "permissions": ["read", "write", "delete"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated API Key Name",
    "key": "pk_live_1234567890abcdef",
    "description": "Updated description",
    "permissions": ["read", "write", "delete"],
    "createdAt": "2024-01-15",
    "lastUsed": "2024-01-20"
  }
}
```

### DELETE /api/keys?id={id}
Delete an API key.

**Parameters:**
- `id` (query parameter): The ID of the API key to delete

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Production API Key",
    "key": "pk_live_1234567890abcdef",
    "description": "API key for production environment",
    "permissions": ["read", "write"],
    "createdAt": "2024-01-15",
    "lastUsed": "2024-01-20"
  },
  "message": "API key deleted successfully"
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400` - Bad Request (missing required fields)
- `404` - Not Found (API key not found)
- `500` - Internal Server Error

## Permissions

Available permissions:
- `read` - Read access
- `write` - Write access
- `delete` - Delete access
- `admin` - Administrative access

## Notes

- API keys are generated automatically with a prefix `pk_` followed by a random string
- The `lastUsed` field is set to "Never" for newly created keys
- This implementation uses in-memory storage for demonstration purposes. In production, you should use a proper database.
