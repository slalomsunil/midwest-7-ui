# Architecture Overview

## Architecture Documentation

This document provides an overview of the system architecture. For detailed views at different levels, see:

- **[C1 - System Context](./c1-system-context.md)** - High-level view of the system and external interactions
- **[C2 - Container Diagram](./c2-container.md)** - Major containers and their relationships
- **[C3 - Component Diagram](./c3-component.md)** - Internal components within containers
- **[C4 - Code Diagram](./c4-code.md)** - Detailed code-level patterns

### C4 Model Overview

The C4 model provides a hierarchical way to visualize software architecture:

1. **Level 1 - System Context**: Shows how the system fits into the world (users, external systems)
2. **Level 2 - Containers**: Shows the high-level technical building blocks (apps, databases)
3. **Level 3 - Components**: Shows how containers are made up of components
4. **Level 4 - Code**: Shows how components are implemented (code patterns and structures)

**Navigation**: Start with C1 for high-level understanding, then drill down to C2, C3, and C4 as needed for implementation details.

---

## System Structure

### Application Type

React 19 frontend application using Create React App with modern functional components and hooks.

### Technology Stack

- **React 19.1.1**: Latest React with modern features
- **JavaScript (ES6+)**: Primary development language
- **Create React App**: Build and development tooling
- **Socket.IO Client**: Real-time WebSocket communication
- **Jest + React Testing Library**: Testing framework

### Directory Organization

```
src/
├── App.js                    # Root application component
├── App.css                   # Global styles
├── index.js                  # Application entry point
├── components/               # React components
│   ├── HomePage.js           # Main authenticated view
│   ├── LoginPage.js          # Authentication page
│   ├── LoggedInUsersPanel.js # Online users display
│   └── Chat/                 # Chat-related components
│       ├── ChatList.js       # Conversation list
│       ├── ChatWindow.js     # Message display
│       └── MessageInput.js   # Message composition
├── services/                 # Service layer
│   ├── api.js                # Backend API integration
│   ├── session.js            # Session management
│   └── socketService.js      # WebSocket client
└── __tests__/                # Test files
```

## Key Architectural Patterns

### Component-Based Architecture

- **Functional Components**: React 19 functional components with hooks
- **State Management**: useState, useEffect for local state
- **Composition**: Component hierarchy for reusability

### Service Layer Pattern

- **API Service**: Centralized HTTP client for backend communication
- **Session Service**: Authentication and session state management
- **Socket Service**: WebSocket integration for real-time features

### Authentication Flow

1. User enters username (no password required)
2. LoginPage calls API service
3. Backend validates/creates user
4. Session stored in localStorage
5. App component renders HomePage
6. WebSocket connection established

## Integration Architecture

### Backend API Integration

**API Base URL**: Configurable via environment variable

**Endpoints Used**:
- `/api/auth/login` - User authentication
- `/api/auth/register` - New user registration
- `/api/auth/logout` - Session termination
- `/api/users/online` - Fetch online users
- `/api/chat/*` - Chat and messaging endpoints

**Protocol**: REST API over HTTPS

### Real-Time Messaging

**Technology**: Socket.IO client

**Events**:
- `message:send` - Send message to recipient
- `message:receive` - Receive new message
- `user:online` - User comes online
- `user:offline` - User goes offline

**Connection**: WebSocket (WSS) to Node.js backend

## Deployment Architecture

### Hosting

**Platform**: Azure Static Web App

**Features**:
- Static file serving
- HTTPS termination
- Global CDN distribution
- Custom domain support
- Automatic SSL certificates

### Build Process

**Tool**: Create React App build scripts

**Output**: Optimized static files in `build/` directory

**Deployment**: GitHub Actions CI/CD to Azure Static Web App

## State Management

### Application-Level State

- **User Authentication**: Managed in App component
- **Session Persistence**: localStorage for session data
- **WebSocket Connection**: Managed in HomePage

### Component-Level State

- **Form Inputs**: Controlled components with useState
- **Loading States**: API call status tracking
- **Error States**: Error message display

## Styling Approach

### CSS Strategy

- **Component-scoped CSS**: Each component has its own CSS file
- **No CSS-in-JS**: Traditional CSS approach
- **WhatsApp-inspired Design**: Chat interface styling
- **Responsive**: Mobile-first responsive design

## Testing Strategy

### Testing Framework

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities

### Test Coverage

- **Component Tests**: User interaction testing
- **Service Tests**: API and session service mocking
- **Integration Tests**: Full user flows

### TDD Approach

Per Copilot instructions:
1. Write failing tests first
2. Implement minimum code to pass
3. Refactor while keeping tests green
4. Ensure zero failing tests before completion

## Related Documentation

- [React Development Guide](./react-development-guide.md)
- [Testing Guidelines](./testing-guidelines.md)
- [Code Review Standards](./code-review-standards.md)
- [Central Context](./central-context.md)
