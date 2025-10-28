# Contributing to Engify.ai

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Engify-AI-App.git`
3. Install dependencies: `pnpm install`
4. Copy `.env.example` to `.env.local` and configure
5. Run development server: `pnpm dev`

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### Commit Messages

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Tests
- `chore:` - Maintenance

Example: `feat: add prompt audit scoring algorithm`

### Code Style

- TypeScript strict mode
- ESLint + Prettier configured
- Run `pnpm lint` before committing
- Run `pnpm format` to auto-format

## Adding Features

### New Prompts

1. Add to `/src/data/prompts/`
2. Follow existing pattern structure
3. Include KERNEL compliance
4. Add tests

### New Patterns

1. Document in `/docs/patterns/`
2. Add to Pattern Playground
3. Include examples
4. Update pattern count

### New Learning Resources

1. Add to `/src/data/learning-resources.json`
2. Include proper categorization
3. Verify links work
4. Add tags for searchability

## Testing

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test PromptCard

# Coverage
pnpm test:coverage
```

## Documentation

- Update README.md for major changes
- Add to CHANGELOG.md
- Update relevant docs in `/docs/`
- Include code comments

## Pull Request Process

1. Update documentation
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Create PR with clear description
6. Link related issues

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing

- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

## Code Review

- Be respectful and constructive
- Focus on code, not person
- Explain reasoning
- Suggest improvements
- Approve when ready

## Community

- Be welcoming and inclusive
- Help others learn
- Share knowledge
- Respect different perspectives

## Questions?

- Open an issue for bugs
- Discussions for questions
- Email: hello@engify.ai

Thank you for contributing! 🚀
