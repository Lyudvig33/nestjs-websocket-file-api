# 🚀 NestJS File Management API - REST API with WebSockets

Modern NestJS server with REST API, WebSockets, PostgreSQL, and file handling support.

## 📋 Table of Contents

- [Features](#-features)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Running](#-running)
- [API Documentation](#-api-documentation)
- [WebSocket Events](#-websocket-events)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Docker](#-docker)
- [Environment Variables](#-environment-variables)

## ✨ Features

### 🔐 Authentication & Authorization

- ✅ User registration with validation
- ✅ JWT authentication (Access + Refresh tokens)
- ✅ Password hashing with bcrypt
- ✅ Protected endpoints with Guards
- ✅ User profile management

### 📁 File Handling

- ✅ Single and multiple file uploads
- ✅ File type validation (jpg, jpeg, png, webp, pdf)
- ✅ File size limit (20MB)
- ✅ Metadata storage in database
- ✅ File deletion with filesystem cleanup
- ✅ CRUD operations for files

### 🔄 WebSocket Real-time Notifications

- ✅ JWT authentication for WebSocket
- ✅ File upload/delete notifications
- ✅ User action notifications
- ✅ Room system
- ✅ Ping/Pong for connection testing

### 🗄️ Database

- ✅ PostgreSQL with TypeORM
- ✅ Migrations and synchronization
- ✅ Transactions
- ✅ Entity relationships

### 🛡️ Security & Validation

- ✅ Input data validation
- ✅ Data sanitization
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Centralized error handling

## 🛠 Technologies

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL, TypeORM
- **Authentication**: JWT, bcrypt
- **WebSockets**: Socket.IO
- **File Upload**: Multer
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker, Docker Compose
- **Package Manager**: Yarn

## 📦 Installation

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Yarn
- Docker (optional)

### Clone and Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd nestjs-file-management-api

# Install dependencies
yarn install
```

## 🚀 Running

### Local Development

1. **Database Setup**

```bash
# Create PostgreSQL database
createdb myappdb

# Or use Docker for PostgreSQL
docker run --name postgres-dev -e POSTGRES_DB=myappdb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16-alpine
```

2. **Environment Variables Setup**

```bash
# Copy example configuration
cp .env.example .env

# Edit .env file
nano .env
```

3. **Run in Development Mode**

```bash
# Run with hot reload
yarn start:dev

# Or run in normal mode
yarn start
```

### Production

```bash
# Build project
yarn build

# Run production version
yarn start:prod
```

## 📚 API Documentation

After starting the server, Swagger documentation is available at:

- **Local**: http://localhost:9000/api/docs
- **Docker**: http://localhost:5000/api/docs

### Main Endpoints

#### 🔐 Authentication

```
POST /v1/auth/register     - User registration
POST /v1/auth/login        - User login
POST /v1/auth/refresh      - Token refresh
```

#### 👤 Users

```
GET    /v1/users/me        - Get profile
PUT    /v1/users/me        - Update profile
DELETE /v1/users/me        - Deactivate account
```

#### 📁 Files

```
POST   /v1/medias          - Upload file
POST   /v1/medias/bulk     - Upload multiple files
GET    /v1/medias          - Get file list
GET    /v1/medias/:id      - Get file by ID
DELETE /v1/medias/:id      - Delete file
```

## 🔄 WebSocket Events

### Connection

```javascript
const socket = io('http://localhost:9000/notifications', {
  auth: {
    token: 'YOUR_JWT_TOKEN',
  },
});
```

### Events

#### Files

- `file_uploaded` - File uploaded
- `file_deleted` - File deleted

#### Users

- `user_registered` - User registered
- `user_logged_in` - User logged in
- `user_profile_updated` - Profile updated
- `user_account_deactivated` - Account deactivated

#### System

- `connected` - Connection established
- `system_message` - System message
- `pong` - Ping response

#### Rooms

- `joined_room` - Joined room
- `left_room` - Left room

### Usage Example

```javascript
socket.on('file_uploaded', (data) => {
  console.log('File uploaded:', data);
});

socket.on('user_logged_in', (data) => {
  console.log('User logged in:', data);
});

// Join room
socket.emit('join_room', { room: 'notifications' });

// Ping for connection testing
socket.emit('ping');
```

## 📁 Project Structure

```
src/
├── core/                    # Core modules
│   ├── config/             # Configuration
│   ├── constants/          # Constants
│   ├── decorators/         # Decorators
│   ├── dtos/              # Data Transfer Objects
│   ├── entities/          # Database entities
│   ├── filters/           # Exception filters
│   ├── gateways/          # WebSocket gateways
│   ├── guards/            # Authorization guards
│   ├── helpers/           # Helper functions
│   ├── interceptors/      # Interceptors
│   ├── messages/          # Error messages
│   ├── models/            # Data models
│   ├── modules/           # Core modules
│   ├── pipes/             # Validation pipes
│   ├── validation/        # Validation
│   └── validators/        # Validators
├── resources/              # API resources
│   ├── auth/              # Authentication
│   ├── users/             # Users
│   └── medias/            # Files
├── app.module.ts          # Main module
└── main.ts               # Entry point
```

## 🧪 Testing

### WebSocket Testing

Open `websocket-test.html` file in browser to test WebSocket connection.

### API Testing

#### User Registration

```bash
curl -X POST http://localhost:9000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

#### User Login

```bash
curl -X POST http://localhost:9000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

#### File Upload

```bash
curl -X POST http://localhost:9000/v1/medias \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@example.jpg"
```

#### Get File List

```bash
curl -X GET http://localhost:9000/v1/medias \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🐳 Docker

### Running with Docker Compose

```bash
# Build and run all services
docker-compose up --build

# Run in background mode
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

### Available Services

- **API**: http://localhost:5000
- **PostgreSQL**: localhost:5432
- **Swagger**: http://localhost:5000/api/docs

## ⚙️ Environment Variables

### Main Settings

```env
# Application
NODE_ENV=development
API_PORT=9000
ENABLE_SWAGGER=true

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=myappdb
DATABASE_SYNC=true

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=5d
```

### Password Requirements

- Minimum 8 characters
- Contains lowercase letters
- Contains uppercase letters
- Contains numbers
- Contains special characters

## 🔧 Development Commands

```bash
# Install dependencies
yarn install

# Run in development mode
yarn start:dev

# Build project
yarn build

# Linting
yarn lint

# Code formatting
yarn format


# Database migrations
yarn migration:generate
yarn migration:run
yarn migration:revert
```

## 📝 License

This project is created for educational purposes.

## 👨‍💻 Author

**Lyudvig Asoyan**

---

## 🎯 Implementation Features

### Architecture

- Modular NestJS architecture
- Separation into core and resources modules
- Dependency Injection
- Decorators for validation and documentation

### Security

- JWT tokens with refresh mechanism
- Password hashing
- Input validation and sanitization
- Rate limiting
- CORS configuration

### Performance

- Database transactions
- Optimized queries
- Static file caching
- WebSocket for real-time notifications

### Scalability

- Docker containerization
- Horizontal scaling
- Microservice architecture
- Separation of concerns

---

**Ready to use! 🚀**
