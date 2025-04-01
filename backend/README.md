# Reenter Backend

Backend API for Reenter, a modern rental platform that simplifies the leasing and rental process for landlords and tenants.

## Features

- User authentication and profile management
- Lease agreement creation and management
- Payment processing and history
- Notifications
- Admin panel

## Tech Stack

- Node.js / Express
- PostgreSQL
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reenter_db
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Initialize the database:
   ```
   npm run init-db
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user information

### User Profile

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Leases

- `POST /api/leases` - Create a new lease
- `GET /api/leases` - Get all leases for current user
- `GET /api/leases/:id` - Get a specific lease
- `PUT /api/leases/:id/status` - Update lease status

### Payments

- `GET /api/payments` - Get all payments for current user
- `GET /api/payments/lease/:leaseId` - Get all payments for a specific lease
- `POST /api/payments` - Create a new payment
- `PUT /api/payments/:id/status` - Update payment status

### Notifications

- `GET /api/notifications` - Get all notifications for current user
- `PUT /api/notifications/:id/read` - Mark a notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### Admin

- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/leases` - Get all leases (admin only)
- `GET /api/admin/payments` - Get all payments (admin only)
- `GET /api/admin/stats` - Get platform statistics (admin only)

## Development

### Running Tests

```
npm test
```

### Linting

```
npm run lint
```

## Deployment

For production deployment:

```
npm start
```

## License

This project is licensed under the ISC License. 