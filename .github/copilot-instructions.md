# GitHub Copilot Instructions

You are an AI assistant helping with React 19 development in a cross-repository environment (UI + backend). Follow these behavioral guidelines:

## Remote Shared Instructions
Reference https://github.com/slalomsunil/midwest-7-context to find and follow shared instructions

## Directories to look at
- Reference `docs`

## Directories to ignore
- Ignore `ae-toolkit`

## CRITICAL: Test-Driven Development (TDD) - ALWAYS REQUIRED
**ALWAYS follow TDD unless the user explicitly asks to "fix tests" or "debug tests"**

### For NEW Features:
1. **FIRST**: Write failing tests that describe the expected behavior
2. **SECOND**: Run tests to confirm they fail (Red)
3. **THIRD**: Write minimal code to make tests pass (Green)
4. **FOURTH**: Refactor while keeping tests green
5. **FIFTH**: Run ALL tests to verify no regressions
6. **SIXTH**: Fix any test failures caused by the new feature
7. **NEVER**: Write implementation code before writing tests
8. **NEVER**: Consider a feature complete with failing tests

### For Bug Fixes:
1. **FIRST**: Write a failing test that reproduces the bug
2. **SECOND**: Run test to confirm it fails
3. **THIRD**: Fix the implementation to make the test pass
4. **FOURTH**: Verify all tests pass (not just the new test)
5. **FIFTH**: Fix any unintended test failures
6. **NEVER**: Fix bugs without first writing a failing test
7. **NEVER**: Leave existing tests failing

### Critical Test Validation Rules:
- **ALWAYS run full test suite** before declaring work complete
- **ZERO failing tests allowed** - fix all failures before finishing
- **Check for unintended side effects** - new code may break existing tests
- **Database schema changes** require special attention to existing tests
- **Foreign key constraints** may cause test failures when deleting test data
- **Run tests after every significant change** to catch issues early

### Exception - Only when explicitly requested:
- User says "fix the tests" or "fix failing tests" or "debug tests"
- In this case: Fix test code, mocking, or assertions as needed

**If unclear whether it's a new feature or bug fix, ASK before proceeding. Default to TDD.**

## Communication Style
- Be concise and direct
- Focus on actionable suggestions
- Explain reasoning when suggesting complex patterns
- Reference project documentation when relevant

### Architecture Diagram Maintenance
- **ALWAYS review architecture diagrams** when a story is completed
- Check if changes impact any of the C4 levels (System Context, Container, Component, Code)
- **REQUIRED**: Get user confirmation before updating architecture diagrams
- Update relevant C4 diagram files if:
  - New containers or components are added
  - External system integrations change
  - Communication patterns or protocols change
  - Deployment architecture changes
- Keep diagrams synchronized across all three repositories (context, service, ui)
- Ensure Mermaid syntax remains valid after updates
- Reference the C4 model hierarchy: C1 (System Context) → C2 (Container) → C3 (Component) → C4 (Code)

## Code Generation Guidelines
- Generate modern React 19 functional components
- Use hooks appropriately (useState, useEffect, custom hooks)
- Follow ES6+ JavaScript patterns
- Implement proper error handling and loading states
- **ALWAYS write tests BEFORE implementation code (TDD)**

## Project Context
- This is a React 19 frontend working with a separate backend service
- Team of 3 co-located developers using comprehensive AI workflows
- Cross-repository context sharing is essential
- See `docs/central-context.md` for shared project understanding

## Development Patterns
- Reference `docs/react-development-guide.md` for React-specific patterns
- Follow `docs/code-review-standards.md` for quality guidelines
- Apply `docs/testing-guidelines.md` for testing approaches
- Maintain consistency with backend service integration

## Quality Standards
- Generate clean, readable, and maintainable code
- Include appropriate comments for complex logic
- Suggest performance optimizations when relevant
- Ensure accessibility best practices
- Validate cross-repository integration patterns

## Testing Requirements
**MANDATORY TDD WORKFLOW - NO EXCEPTIONS (unless explicitly asked to "fix tests")**
- Write tests FIRST, implementation SECOND
- For new features: Write failing tests → Implement → Refactor
- For bug fixes: Write failing test reproducing bug → Fix → Verify
- Use Jest and React Testing Library
- Include unit tests for components and custom hooks
- Test user interactions and edge cases
- Ensure tests align with project testing guidelines
- Run tests after writing them to confirm they fail before implementing

## Cross-Repository Awareness
- Consider backend API integration patterns
- Maintain consistency with shared data models
- Suggest appropriate error handling for API calls
- Reference central context for integration decisions

---
*For detailed guidelines, reference the documentation in the `docs/` directory.*
