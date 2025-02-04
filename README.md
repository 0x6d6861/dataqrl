# DataQRL

A microservice-based file processing application that allows users to upload, process, and analyze various types of files.

## Features

- File upload and processing
- Real-time progress tracking using Server-Sent Events (SSE)
- Support for various file formats
- Interactive data visualization
- Search and filter processed data
- RESTful API with Swagger documentation

## Architecture

The application is built using a microservices architecture with the following components:

### Backend Services

- **Upload Service**: Handles file uploads and initial metadata storage
- **Processing Service**: Processes uploaded files and extracts data
- **Events Service**: Manages real-time events and notifications using SSE

### Frontend

- Built with React + Vite
- Uses HeroUI components for the user interface
- Real-time progress tracking and notifications
- Responsive design

### Infrastructure

- MongoDB for data storage
- Redis for caching and pub/sub
- Nginx as API Gateway
- Docker for containerization

## Prerequisites

- Docker and Docker Compose
- Node.js 22 or later
- npm or yarn package manager

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd DataQRL
 ```
2. Create environment files:
Create a .env file in the root directory:
```plaintext
MONGODB_URI=mongodb://user:password@mongodb:27017/dataqrl
REDIS_URL=redis://redis:6379
UPLOAD_DIR=/app/uploads
DOCS_PORT=8081
```
3. Build and start the services:
```bash
docker compose -f infrastructure/docker/docker-compose.yml up --build
   ```
4. The following services will be available:
- Frontend: http://localhost:80
- Upload Service: http://localhost:3000
- Processing Service: http://localhost:3001
- Events Service: http://localhost:3002
- API Documentation: http://localhost:4040
## Development
### Backend Development
1. Navigate to the backend directory:
      ```bash
   cd backend
   ```
2. Install dependencies:
    ```bash
   npm install
   ```
3. Start the services in development mode:
   ```bash
    npm run dev:upload    # Start upload service
    npm run dev:processing # Start processing service
    npm run dev:events    # Start events service
   ```
### Frontend Development
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
      ```bash
   npm run dev
   ```
## Project Structure
```plaintext
.
├── backend/                 # Backend services
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── services/       # Microservices implementation
│   │   ├── repository/     # Data access layer
│   │   └── utils/          # Shared utilities
│   └── package.json
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main application component
│   └── package.json
├── infrastructure/         # Infrastructure configuration
│   ├── docker/            # Docker configuration
│   │   ├── docker/         # Docker services configuration
│   │   └── docker-compose.yml     # Docker compose configuration
│   └── nginx/             # Nginx configuration
└── openapi/               # API documentation
 ```

## API Documentation
The API documentation is available through Swagger UI at http://localhost:4040 when the application is running.