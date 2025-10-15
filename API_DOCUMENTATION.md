# Innotech Backend API Documentation

## Base URL
```
Development: http://localhost:8001
Production: [Your production URL]
```

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Team Management](#team-management)
4. [General APIs](#general-apis)
5. [Request Management](#request-management)
6. [Error Handling](#error-handling)
7. [Authentication Requirements](#authentication-requirements)

---

## Authentication

### 1. Start Google OAuth
```http
GET /auth/google
```
**Description:** Redirects user to Google OAuth consent screen.  
**Authentication:** None  
**Response:** Redirects to Google OAuth page

### 2. Google OAuth Callback
```http
GET /auth/google/callback
```
**Description:** Handles Google OAuth callback and creates/updates user.  
**Authentication:** None (handled by Google)  
**Response:** Redirects to frontend with token

### 3. Authentication Success
```http
GET /auth/success
```
**Description:** Returns authenticated user information.  
**Authentication:** Session-based  
**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "profileImage": "https://...",
    "isKietian": false,
    "participationCategory": "college"
  }
}
```

### 4. Authentication Failed
```http
GET /auth/failed
```
**Response:**
```json
{
  "success": false,
  "message": "Authentication failed"
}
```

### 5. Logout
```http
POST /auth/logout
```
**Authentication:** Required  
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 6. Get Current User Info
```http
GET /auth/me
```
**Authentication:** Required  
**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "profileImage": "https://...",
    "isKietian": false,
    "participationCategory": "college"
  }
}
```

---

## User Management

### 1. Get User Profile
```http
GET /api/user/profile
```
**Authentication:** Required (JWT)  
**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "userId": "ABC123",
    "email": "john@example.com",
    "phonenumber": "+1234567890",
    "profileImage": "https://...",
    "isKietian": false,
    "participationCategory": "college",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Complete Basic Profile
```http
PUT /api/user/complete-profile
```
**Authentication:** Required (JWT)  
**Request Body:**
```json
{
  "name": "John Doe",
  "phonenumber": "+1234567890",
  "participationCategory": "college", // school, college, researcher, startup
  "isKietian": true
}
```
**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

### 3. Complete College Student Profile
```http
POST /api/user/complete-profile/college-student
```
**Authentication:** Required (JWT)  
**Request Body:**
```json
{
  "college": "KIET Group of Institutions",
  "course": "B.Tech",
  "year": 3,
  "branch": "CSE"
}
```

### 4. Complete School Student Profile
```http
POST /api/user/complete-profile/school-student
```
**Authentication:** Required (JWT)  
**Request Body:**
```json
{
  "school": "ABC School",
  "standard": 12,
  "board": "CBSE",
  "uid": "unique-school-id"
}
```

### 5. Complete Researcher Profile
```http
POST /api/user/complete-profile/researcher
```
**Authentication:** Required (JWT)  
**Request Body:**
```json
{
  "uid": "unique-researcher-id",
  "universityName": "University Name",
  "pursuingDegree": "Masters" // Masters, PhD, Other
}
```

### 6. Complete Startup Profile
```http
POST /api/user/complete-profile/startup
```
**Authentication:** Required (JWT)  
**Request Body:**
```json
{
  "startupName": "Tech Startup",
  "website": "https://startup.com",
  "startupSector": "Technology",
  "stage": "prototype", // ideation, prototype, early, scaling
  "city": "Delhi",
  "teamSize": 5,
  "founderName": "Founder Name",
  "founderEmail": "founder@startup.com",
  "founderUid": "unique-founder-id",
  "founderPhonenumber": "+1234567890",
  "description": "Startup description",
  "problemSolving": "Problem we solve",
  "uvp": "Unique value proposition",
  "pitchDeckLink": "https://pitchdeck.link",
  "isFunded": false,
  "fundedBy": "Investor Name", // optional
  "eventExpections": "networking", // optional
  "additionalInfo": "Additional information" // optional
}
```

---

## Team Management

### 1. Create Team
```http
POST /api/team/create
```
**Authentication:** Required (JWT + Complete Profile)  
**Request Body:**
```json
{
  "teamName": "Team Warriors",
  "memberUserIds": [2, 3, 4], // Array of user IDs to invite (1-4 members)
  "department": "CSE", // Leader's department
  
  // For college participation category:
  "categoryId": 1,
  "problemStatementId": 1,
  
  // For startup participation category:
  "startupId": 1,
  
  // For school participation category:
  "schoolStudentId": 1,
  "categoryId": 1,
  "problemStatementId": 1,
  "inovationIdeaName": "Innovation Name", // optional
  "inovationIdeaDesc": "Innovation Description", // optional
  
  // For researcher participation category:
  "inovationIdeaName": "Research Idea", // optional
  "inovationIdeaDesc": "Research Description" // optional
}
```
**Response:**
```json
{
  "success": true,
  "message": "Team created successfully and requests sent to members",
  "data": {
    "team": {
      "id": 1,
      "teamName": "Team Warriors",
      "teamCode": "CL-1234",
      "leaderUserId": 1,
      "participationCategory": "college",
      "isKeitian": false,
      "teamSize": 4,
      "isCompleted": false,
      "department": "CSE",
      "categoryId": 1,
      "problemStatementId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "requestsSent": 3
  }
}
```

### 2. Get User's Team
```http
GET /api/team/my-team
```
**Authentication:** Required (JWT + Complete Profile)  
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "teamName": "Team Warriors",
    "teamCode": "CL-1234",
    "leaderUserId": 1,
    "participationCategory": "college",
    "isKeitian": false,
    "teamSize": 4,
    "isCompleted": true,
    "department": "CSE",
    "leaderUser": { /* user object */ },
    "member1": { /* user object */ },
    "member2": { /* user object */ },
    "member3": { /* user object */ },
    "member4": null,
    "category": { /* category object */ },
    "problemStatement": { /* problem statement object */ }
  }
}
```

### 3. Get Team Details
```http
GET /api/team/:teamId
```
**Authentication:** Required (JWT + Complete Profile + Team Member)  
**Response:** Same as Get User's Team

---

## Request Management

### 1. Get Pending Requests
```http
GET /api/team/requests/pending
```
**Authentication:** Required (JWT + Complete Profile)  
**Description:** Get all pending team join requests sent to the current user.  
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "pending",
      "team": {
        "id": 1,
        "teamName": "Team Warriors",
        "teamCode": "CL-1234",
        "leaderUser": { /* leader user object */ },
        "category": { /* category object */ },
        "problemStatement": { /* problem statement object */ }
      },
      "requestedBy": { /* requester user object */ }
    }
  ]
}
```

### 2. Respond to Request
```http
POST /api/team/requests/:requestId/respond
```
**Authentication:** Required (JWT + Complete Profile)  
**Request Body:**
```json
{
  "action": "accept" // or "reject"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Request accepted successfully",
  "data": { /* updated request object */ }
}
```

### 3. Get Sent Requests
```http
GET /api/team/requests/sent
```
**Authentication:** Required (JWT + Complete Profile)  
**Description:** Get all requests sent by the current user.  
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "pending",
      "team": {
        "id": 1,
        "teamName": "Team Warriors",
        "teamCode": "CL-1234"
      },
      "requestedTo": { /* target user object */ }
    }
  ]
}
```

### 4. Cancel Request
```http
DELETE /api/team/requests/:requestId/cancel
```
**Authentication:** Required (JWT + Complete Profile)  
**Description:** Cancel a pending request (only by the sender).  
**Response:**
```json
{
  "success": true,
  "message": "Request cancelled successfully"
}
```

---

## General APIs

### 1. Get Categories
```http
GET /api/categories
```
**Authentication:** None  
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Web Development",
      "description": "Web development projects",
      "problemStatements": [
        {
          "id": 1,
          "title": "E-commerce Platform",
          "description": "Build an e-commerce platform",
          "categoryId": 1
        }
      ]
    }
  ]
}
```

### 2. Get Problem Statements
```http
GET /api/problem-statements/:categoryId
```
**Authentication:** None  
**Parameters:**
- `categoryId` (required): Category ID to filter problem statements
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "E-commerce Platform",
      "description": "Build a modern e-commerce platform",
      "categoryId": 1,
      "category": {
        "id": 1,
        "name": "Web Development"
      }
    }
  ]
}
```

### 3. Search Users
```http
GET /api/search/users?query=john&participationCategory=college
```
**Authentication:** Required (JWT)  
**Query Parameters:**
- `query` (required): Search term (minimum 2 characters)
- `participationCategory` (optional): Filter by participation category
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "John Smith",
      "email": "john.smith@example.com",
      "userId": "JS123",
      "profileImage": "https://...",
      "participationCategory": "college",
      "isKietian": true
    }
  ]
}
```

### 4. Health Check
```http
GET /api/health
```
**Authentication:** None  
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Error Handling

All API endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes:
- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (authentication required, invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

### Common Error Scenarios:

#### Authentication Errors:
```json
{
  "success": false,
  "message": "Access token required"
}
```

#### Validation Errors:
```json
{
  "success": false,
  "message": "Team name, department, and member user IDs array are required"
}
```

#### Profile Completion Required:
```json
{
  "success": false,
  "message": "Please complete your profile to continue",
  "redirect": "/complete-profile"
}
```

---

## Authentication Requirements

### JWT Token Authentication
Most APIs require JWT token authentication. Include the token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

### Cookie Authentication
Some APIs also support cookie-based authentication:

```javascript
fetch('/api/endpoint', {
  credentials: 'include'
});
```

### Profile Completion Requirements
Team-related APIs require users to have completed their profile:
1. Basic profile completion (`participationCategory`, `phonenumber`)
2. Category-specific profile completion (college, school, researcher, or startup)

---

## Frontend Integration Examples

### 1. Google Authentication Flow
```javascript
// Redirect to Google OAuth
window.location.href = 'http://localhost:8001/auth/google';

// Handle success redirect (in your frontend route)
// URL will be: http://localhost:3000/auth/success?token=JWT_TOKEN
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
localStorage.setItem('authToken', token);
```

### 2. Making Authenticated Requests
```javascript
const token = localStorage.getItem('authToken');

const response = await fetch('http://localhost:8001/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### 3. Creating a Team
```javascript
const teamData = {
  teamName: "Code Warriors",
  memberUserIds: [15, 23, 7],
  department: "CSE",
  categoryId: 2,
  problemStatementId: 5
};

const response = await fetch('http://localhost:8001/api/team/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(teamData)
});
```

### 4. Search Users for Team
```javascript
const searchUsers = async (query) => {
  const response = await fetch(
    `http://localhost:8001/api/search/users?query=${encodeURIComponent(query)}&participationCategory=college`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
};
```

### 5. Handle Requests
```javascript
// Get pending requests
const pendingRequests = await fetch('http://localhost:8001/api/team/requests/pending', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Accept a request
const acceptRequest = async (requestId) => {
  return fetch(`http://localhost:8001/api/team/requests/${requestId}/respond`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'accept' })
  });
};
```

---

## Environment Variables Required

```env
# Server Configuration
PORT=8001
NODE_ENV=development

# Database Configuration
DATABASE_URL="your-database-url"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8001/auth/google/callback

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

---

## Data Models Reference

### User Object
```json
{
  "id": 1,
  "name": "John Doe",
  "userId": "JD123",
  "email": "john@example.com",
  "phonenumber": "+1234567890",
  "googleId": "google-oauth-id",
  "profileImage": "https://...",
  "participationCategory": "college",
  "isKietian": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Team Object
```json
{
  "id": 1,
  "teamName": "Team Warriors",
  "teamCode": "CL-1234",
  "leaderUserId": 1,
  "participationCategory": "college",
  "isKeitian": false,
  "teamSize": 4,
  "categoryId": 1,
  "problemStatementId": 1,
  "department": "CSE",
  "isCompleted": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Request Object
```json
{
  "id": 1,
  "teamId": 1,
  "requestedById": 1,
  "requestedToId": 2,
  "status": "pending"
}
```

This documentation provides everything needed for frontend integration with the Innotech Backend API!