# Project Structure

This document outlines the structure of the Hasura Crash Course project.

```
hasura-crash-course/
├── backend/
│   ├── index.js              # Express.js server with custom APIs
│   ├── package.json          # Backend dependencies
│   └── .env                  # Environment variables for backend
├── frontend/
│   ├── public/               # Static assets
│   ├── src/                  # React source code
│   │   ├── App.tsx           # Main application component
│   │   ├── Login.tsx         # Login component
│   │   └── interfaces.ts     # TypeScript interfaces
│   ├── package.json          # Frontend dependencies
│   └── .env                  # Environment variables for frontend
├── hasura/
│   ├── metadata/             # Hasura metadata
│   ├── migrations/           # Database migrations
│   └── config.yaml           # Hasura configuration
├── docker-compose.yaml       # Docker configuration for Hasura and PostgreSQL
├── README.md                 # Project overview
└── package.json              # Root package.json
```

## Component Overview

1. **Frontend**: React application for the chat interface
2. **Backend**: Express.js server handling custom business logic
3. **Hasura**: GraphQL engine with PostgreSQL database
4. **Docker**: Containerization for Hasura and PostgreSQL services