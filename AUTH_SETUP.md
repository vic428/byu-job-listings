# Job Listing Application - Authentication Setup Guide

## Overview
This project now includes a complete authentication system using Node.js/Express with JWT tokens and SQLite database. Users can register, login, and access a personalized dashboard.

## Prerequisites
- Node.js v20+ installed
- npm (comes with Node.js)

## Installation Steps

### 1. Install Dependencies
Open a terminal in the `Job-Listing` directory and run:
```bash
npm install
```

This will install:
- `express` - Web framework
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `sqlite3` - Database
- `cors` - Cross-origin requests
- `body-parser` - Request body parsing
- `dotenv` - Environment variables

### 2. Configuration
The `.env` file is already created with default settings:
```
PORT=3000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
DB_PATH=./database.db
NODE_ENV=development
```

**Important:** In production, change `JWT_SECRET` to a strong, random value.

### 3. Start the Server
```bash
npm start
```

or in development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Project Structure

```
Job-Listing/
├── server.js                 # Main Express server
├── authRoutes.js             # Authentication routes (register, login, profile)
├── middleware.js             # Authentication middleware (JWT verification)
├── db.js                     # Database initialization and tables
├── package.json              # Dependencies
├── .env                      # Environment variables
├── database.db               # SQLite database (created on first run)
├── login.html                # Login page
├── register.html             # Registration page
├── dashboard.html            # User dashboard (requires authentication)
├── index.html                # Home page with login/register buttons
├── css/
│   ├── styles.css           # Main stylesheet
│   └── dashboard.css        # Dashboard styles
└── js/
    └── main.js              # Frontend JavaScript
```

## API Endpoints

### Authentication Routes
- **POST** `/api/auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe"
  }
  ```
  Response: `{ token, user }`

- **POST** `/api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
  Response: `{ token, user }`

- **GET** `/api/auth/profile` - Get user profile
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ id, email, fullName, createdAt }`

### User Routes (require authentication)
- **GET** `/api/user/applications` - Get user's job applications
  - Headers: `Authorization: Bearer <token>`

- **GET** `/api/user/saved-jobs` - Get user's saved jobs
  - Headers: `Authorization: Bearer <token>`

- **POST** `/api/user/apply` - Apply for a job
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ jobId, jobTitle, companyName }`

- **POST** `/api/user/save-job` - Save a job
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ jobId, jobTitle, companyName }`

## Features

### User Registration
- Create new account at `/register.html`
- Password validation (min 6 characters)
- Duplicate email prevention
- Automatic login after registration

### User Login
- Login at `/login.html`
- JWT token stored in localStorage
- 7-day token expiration

### Protected Dashboard
- Access `/dashboard.html` requires login
- Displays personalized user information
- Shows user's applications and saved jobs
- Logout button in header

### Database
SQLite database stores:
- **users** table: email, password (hashed), fullName, createdAt
- **applications** table: userId, jobId, jobTitle, companyName, status, applicationDate
- **saved_jobs** table: userId, jobId, jobTitle, companyName, savedDate

## Testing the Application

### 1. Start the server
```bash
npm start
```

### 2. Register a new user
- Go to `http://localhost:3000`
- Click "Register"
- Fill in the form and submit
- You'll be automatically logged in and redirected to the dashboard

### 3. Login
- Click "Login" on the home page
- Enter your registered credentials
- You'll be redirected to the dashboard

### 4. Logout
- Click the "Logout" button in the dashboard header
- You'll be redirected to the login page

## Security Notes

1. **Passwords are hashed** using bcryptjs (10 salt rounds)
2. **JWT tokens expire** in 7 days
3. **Protected routes** require valid JWT in Authorization header
4. **Database** uses SQLite (suitable for development; use PostgreSQL/MySQL in production)

## Production Deployment

For production:
1. Change `JWT_SECRET` in `.env` to a strong random value
2. Use PostgreSQL or MySQL instead of SQLite
3. Enable HTTPS
4. Set `NODE_ENV=production`
5. Use environment variables for sensitive data
6. Consider adding rate limiting and input validation
7. Implement password reset functionality
8. Add email verification for new accounts

## Troubleshooting

### Port already in use
If port 3000 is already in use, change it in `.env`:
```
PORT=3001
```

### Database locked error
Delete `database.db` file and restart the server to reset the database.

### Token expired errors
Clear localStorage and login again:
- Open browser DevTools (F12)
- Go to Application > LocalStorage
- Clear all stored data

### CORS errors
The server is configured with CORS enabled. Ensure requests include proper headers.

## Next Steps

1. Add email verification for new accounts
2. Implement password reset functionality
3. Add user profile editing
4. Implement job application functionality
5. Add saved jobs management
6. Set up notification system
7. Deploy to production (Heroku, AWS, etc.)

## Support

For issues or questions, check the console for error messages. The server logs all requests and errors to the console.
