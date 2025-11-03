# React Development Guide

## React 19 Development Patterns

### Component Structure
- **Functional Components**: Use function declarations for all components
- **Hooks**: Leverage React 19 hooks (useState, useEffect, useContext, custom hooks)
- **Props**: Use destructuring for props and provide clear prop types via comments
- **JSX**: Follow React best practices for JSX structure and formatting

### File Organization
```
src/
├── components/          # Reusable UI components
├── pages/              # Page-level components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── styles/             # CSS and styling files
└── __tests__/          # Test files
```

### AI-Assisted Development Patterns

#### Component Generation
- Use Copilot/Cursor for component scaffolding
- Generate prop interfaces and default values
- Create component documentation and examples

#### State Management
- Leverage AI for complex state logic patterns
- Generate useReducer patterns for complex state
- Create custom hooks for reusable state logic

#### Performance Optimization
- Use AI to identify potential performance improvements
- Generate memoization patterns (useMemo, useCallback)
- Optimize re-renders and component updates

### Code Style Guidelines
- **ES6+**: Use modern JavaScript features
- **Arrow Functions**: For inline functions and callbacks
- **Destructuring**: For props, state, and imports
- **Template Literals**: For string concatenation
- **Async/Await**: For asynchronous operations

### Common Patterns
- **Error Boundaries**: Implement for robust error handling
- **Loading States**: Consistent loading UI patterns
- **Form Handling**: Controlled components with validation
- **API Integration**: Custom hooks for data fetching
- **Routing**: React Router patterns (when implemented)

### AI Tool Integration
- **Copilot**: Use for code completion, function generation, and refactoring
- **Cursor**: Leverage for code navigation, documentation, and large-scale changes
- **Context Awareness**: Reference central-context.md for cross-repository consistency

### Testing Patterns
See [Testing Guidelines](testing-guidelines.md) for comprehensive testing approaches.

### Code Review Focus Areas
See [Code Review Standards](code-review-standards.md) for AI-assisted review processes.

---
*Reference the Central Context for cross-repository integration patterns.*
