# HR Management System

Production-ready HR/Employee Management System built with Laravel 10 (API) and React 18 (Vite).

## Tech Stack

**Backend:**
- Laravel 10 (API-only)
- MySQL
- Laravel Sanctum (Token-based authentication)
- Spatie Laravel Permission (Role & Permission management)

**Frontend:**
- React 18
- Vite
- React Router
- TanStack Query
- Zustand (State management)
- Axios

## Features

- ✅ Token-based authentication with Laravel Sanctum
- ✅ Role-based access control (Admin, HR Manager, Employee)
- ✅ RESTful API with resource controllers
- ✅ Clean architecture: Service + Repository pattern
- ✅ FormRequest validation
- ✅ API Resources for consistent JSON responses
- ✅ Employee management
- ✅ Department management
- ✅ Attendance tracking
- ✅ Leave management

## Project Structure

```
hr-management-system/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/API/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   ├── Repositories/
│   │   └── Services/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
├── frontend/                # React App
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── store/
│   │   └── routes.jsx
│   └── package.json
└── API_DOCUMENTATION.md     # Complete API docs
```

## Quick Start

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 20.19+ or 22+
- MySQL 8.0+

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Configure database in .env
# DB_DATABASE=hr_management
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations and seed data
php artisan migrate --force
php artisan db:seed --force

# Start server
php artisan serve
```

Backend will run at: `http://127.0.0.1:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:5173`

## Default Credentials

**Admin Account:**
- Email: `admin@example.com`
- Password: `password`
- Role: Admin (full access)

## API Endpoints

### Authentication
- `POST /api/login` - Login
- `POST /api/register` - Register new user
- `GET /api/me` - Get current user
- `POST /api/logout` - Logout

### Protected Resources (require Bearer token)
- `/api/departments` - Department CRUD
- `/api/employees` - Employee CRUD
- `/api/attendances` - Attendance CRUD
- `/api/leaves` - Leave CRUD

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API documentation with request/response examples.

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get current user (use token from login response)
curl -X GET http://127.0.0.1:8000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Test Script

Run the automated test script:

```bash
./test-api.sh
```

This will test all authentication endpoints and verify token functionality.

## User Roles & Permissions

### Admin
- Full system access
- All CRUD operations on all resources

### HR Manager
- Create, update, view departments
- Create, update, view employees
- Create, update, view attendance
- Create, update, view leaves
- No delete permissions

### Employee
- Self-service operations (customize based on requirements)

## Architecture

### Backend

**Repository Pattern:**
```
Controller → Service → Repository → Model
```

**Request Flow:**
1. Request validated by FormRequest
2. Controller calls Service method
3. Service contains business logic
4. Repository handles database operations
5. Resource transforms model to JSON response

### Frontend

**State Management:**
- Zustand for auth state
- TanStack Query for server state
- React Router for navigation

## Development

### Adding New Features

1. Create migration: `php artisan make:migration create_table_name`
2. Create model: `php artisan make:model ModelName`
3. Create repository: `app/Repositories/ModelRepository.php`
4. Create service: `app/Services/ModelService.php`
5. Create controller: `php artisan make:controller API/ModelController`
6. Create FormRequest: `php artisan make:request StoreModelRequest`
7. Create Resource: `php artisan make:resource ModelResource`
8. Add routes to `routes/api.php`

### Running Tests

```bash
# Backend tests
cd backend
php artisan test

# Frontend tests
cd frontend
npm test
```

## Security

- Token-based authentication via Laravel Sanctum
- Password hashing with bcrypt
- Rate limiting: 60 requests/minute per user/IP
- CORS configured for localhost development
- FormRequest validation on all inputs
- SQL injection prevention via Eloquent ORM

## Production Deployment

### Backend

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false`
3. Generate app key: `php artisan key:generate`
4. Cache config: `php artisan config:cache`
5. Cache routes: `php artisan route:cache`
6. Optimize autoloader: `composer install --optimize-autoloader --no-dev`

### Frontend

```bash
npm run build
```

Deploy the `dist/` folder to your web server.

## License

This project is open-source and available under the MIT License.

## Support

For API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

For issues or questions, please open an issue on GitHub.
