# GitHub OAuth Setup Guide

This guide explains how to complete the GitHub OAuth implementation for the assembler service.

## 1. GitHub OAuth App Setup

To use the GitHub OAuth flow, you need to create a GitHub OAuth App:

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Dynamic Boilerplate Generator
   - **Homepage URL**: `http://localhost:5173` (your frontend URL)
   - **Authorization callback URL**: `http://localhost:5001/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

## 2. Environment Configuration

Update your `.env` file with the GitHub OAuth credentials:

```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5001/auth/github/callback
```

## 3. OAuth Flow API Endpoints

### Frontend Integration Endpoints

#### Get OAuth URL
```http
GET /api/github/auth-url/{userId}?redirect={frontendUrl}
```

Returns the GitHub OAuth URL that the frontend should redirect to.

**Example Response:**
```json
{
  "success": true,
  "authUrl": "http://localhost:5001/auth/github?userId=user123&redirect=http://localhost:5173",
  "userId": "user123"
}
```

#### Check Connection Status
```http
GET /api/github/status/{userId}
```

Check if a user has connected their GitHub account.

**Example Response:**
```json
{
  "success": true,
  "connected": true,
  "user": {
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### Disconnect GitHub Account
```http
POST /api/github/disconnect/{userId}
```

Disconnect a user's GitHub account.

**Example Response:**
```json
{
  "success": true,
  "disconnected": true,
  "message": "GitHub account disconnected successfully"
}
```

### OAuth Flow Endpoints

#### Initiate OAuth
```http
GET /auth/github?userId={userId}&redirect={frontendUrl}
```

Redirects to GitHub OAuth authorization page.

#### OAuth Callback
```http
GET /auth/github/callback
```

Handles the OAuth callback from GitHub and redirects back to frontend.

## 4. Frontend Implementation Example

```javascript
// Check if user has connected GitHub
async function checkGitHubStatus(userId) {
  const response = await fetch(`/api/github/status/${userId}`);
  const data = await response.json();
  return data.data;
}

// Get OAuth URL and redirect user
async function connectGitHub(userId) {
  const response = await fetch(`/api/github/auth-url/${userId}?redirect=${window.location.origin}`);
  const data = await response.json();

  if (data.success) {
    window.location.href = data.data.authUrl;
  }
}

// Disconnect GitHub account
async function disconnectGitHub(userId) {
  const response = await fetch(`/api/github/disconnect/${userId}`, {
    method: 'POST'
  });
  const data = await response.json();
  return data.data;
}

// Handle OAuth success/error on frontend
function handleOAuthResult() {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');

  if (status === 'success') {
    const username = urlParams.get('username');
    console.log(`GitHub connected successfully for user: ${username}`);
    // Update UI to show connected state
  } else if (status === 'error') {
    const error = urlParams.get('error');
    console.error(`GitHub OAuth failed: ${error}`);
    // Show error message to user
  }
}
```

## 5. Complete User Flow

1. **Check Status**: Frontend calls `/api/github/status/{userId}` to check if user is connected
2. **Show UI**: Display "Connect GitHub" button if not connected, or "Connected as @username" if connected
3. **Connect**: When user clicks connect, call `/api/github/auth-url/{userId}` and redirect to the returned URL
4. **OAuth**: User completes OAuth on GitHub and is redirected back to frontend
5. **Handle Result**: Frontend handles the OAuth result and updates UI accordingly
6. **Use Integration**: User can now generate projects directly to GitHub repositories

## 6. Security Features

- **State Parameter**: OAuth flow uses encrypted state parameter to prevent CSRF attacks
- **Scope Limitation**: Only requests necessary permissions (user:email, repo, public_repo)
- **Token Storage**: Access tokens are securely stored in the database
- **User Association**: Tokens are properly associated with user IDs

## 7. Error Handling

The implementation includes comprehensive error handling for:
- Invalid OAuth credentials
- Network failures
- Token expiration
- Repository creation/access errors
- Git push failures

## 8. Testing the Flow

1. Start the service: `npm run start:dev`
2. Test status endpoint: `curl "http://localhost:5001/api/github/status/test-user"`
3. Get OAuth URL: `curl "http://localhost:5001/api/github/auth-url/test-user"`
4. Visit the OAuth URL in browser (will redirect to GitHub)
5. Complete OAuth flow and verify token storage

## Next Steps

After setting up the GitHub OAuth App and updating the environment variables, the complete OAuth flow will be functional and ready for frontend integration.