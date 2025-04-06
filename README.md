# Reenter Application

A modern property rental management system built with React, TypeScript, and Node.js.

## Project Structure

This project is organized into two main directories:

- `frontend`: React application built with Vite, TypeScript, and TailwindCSS
- `backend`: Express API server (Node.js)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

### Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/reenter.git
   cd reenter
   ```

2. Install dependencies:
   ```
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Database Setup:
   - Create a PostgreSQL database named `reenter_db`
   - Update database credentials in `backend/.env` if needed (default credentials are already set)
   - Check the database connection:
     ```
     cd backend
     npm run check-db
     ```
   - If there are any issues, follow the instructions provided by the check-db script
   - Initialize database schema:
     ```
     npm run init-db
     ```
   - If you need sample data for development (NOT for production):
     ```
     npm run seed-db
     ```

4. Environment Configuration:
   - Frontend: Configure environment variables in `frontend/.env` (development) and `frontend/.env.production` (production)
   - Backend: Configure environment variables in `backend/.env`

### Running the Application

#### Development Mode

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. In a separate terminal, start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

#### Production Mode

1. Set environment variables for production:
   ```
   # Backend
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=<your-secure-jwt-secret>
   DB_USER=<db-username>
   DB_PASSWORD=<db-password>
   DB_HOST=<db-host>
   DB_PORT=<db-port>
   DB_NAME=<db-name>
   ```

2. Build the frontend:
   ```
   cd frontend
   npm run build
   ```

3. Start the backend server which will serve the frontend build:
   ```
   cd backend
   npm start
   ```

4. Access the application at `http://localhost:5000`

## Database Schema

The application uses PostgreSQL with the following main tables:

- `users`: User accounts with authentication details
- `leases`: Property rental agreements between landlords and tenants
- `payments`: Rent payment records
- `notifications`: User notifications
- `social_connections`: Social media connections for users
- `verifications`: User verification records
- `bank_accounts`: User banking information
- `ratings`: Landlord and tenant ratings

## Features

- User authentication (login, signup, protected routes)
- Dashboard for property overview
- Lease management
- Payment tracking
- Messaging system
- Notification center
- Profile management
- Settings

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Vite
  - React Router
  - TailwindCSS
  - Headless UI
  - Heroicons

- Backend:
  - Node.js
  - Express
  - PostgreSQL
  - JSON Web Tokens (JWT)
  - bcrypt for password hashing

## Security Considerations

- Always use strong, unique JWT secrets in production
- Ensure database credentials are properly secured
- Set up proper authentication and authorization checks
- Validate all user inputs
- Use HTTPS in production environments
- Implement rate limiting for sensitive endpoints

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 