# Code Review Standards

## AI-Assisted Code Review Process

### Review Workflow
1. **Author Preparation**: Use Copilot/Cursor to self-review before submitting
2. **AI Pre-Review**: Run AI analysis on changes for initial feedback
3. **Team Review**: Human review focusing on business logic and architecture
4. **AI Validation**: Final AI check for consistency and best practices

### Review Checklist

#### Code Quality
- [ ] Code follows React development patterns from [React Development Guide](react-development-guide.md)
- [ ] Components are properly structured and documented
- [ ] No obvious performance anti-patterns
- [ ] Proper error handling implemented
- [ ] Consistent code style and formatting

#### AI Tool Usage
- [ ] AI-generated code has been reviewed and validated
- [ ] Comments explain complex AI-assisted logic
- [ ] Generated tests cover edge cases and functionality
- [ ] AI suggestions align with project patterns

#### Cross-Repository Consistency
- [ ] Changes align with [Central Context](central-context.md)
- [ ] API integration follows established patterns
- [ ] Data models are consistent with backend contracts
- [ ] Error handling matches cross-repository standards

#### Testing Requirements
- [ ] Tests follow [Testing Guidelines](testing-guidelines.md)
- [ ] AI-generated tests are comprehensive and meaningful
- [ ] Test coverage meets project standards
- [ ] Integration points are properly tested

### AI Review Prompts

#### For Copilot
Ask Copilot to review code for:
- React best practices and performance
- Component structure and reusability
- Hook usage and state management
- Accessibility considerations

#### For Cursor
Use Cursor to analyze:
- Code architecture and organization
- Cross-file consistency and patterns
- Documentation completeness
- Refactoring opportunities

### Common Review Focus Areas

#### React Components
- Proper hook usage and dependencies
- Component composition and reusability
- Props validation and default values
- Lifecycle management and cleanup

#### State Management
- Appropriate state placement (local vs global)
- State update patterns and immutability
- Custom hook design and reusability
- Performance implications of state changes

#### API Integration
- Error handling and loading states
- Data transformation and validation
- Caching and optimization strategies
- Cross-repository contract compliance

### Review Documentation
- Document review decisions and rationale
- Link to relevant guidelines and standards
- Explain AI tool usage and validation
- Note any deviations from established patterns

---
*Use AI tools to enhance, not replace, human judgment in code review.*
