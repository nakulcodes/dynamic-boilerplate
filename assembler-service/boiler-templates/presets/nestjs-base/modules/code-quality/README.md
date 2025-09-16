# Code Quality Module

This module provides comprehensive code quality tools and configurations for maintaining consistent, high-quality code across your NestJS project.

## Features

### 🔧 Linting & Formatting
- **ESLint**: Advanced TypeScript and JavaScript linting with NestJS-specific rules
- **Prettier**: Consistent code formatting across the entire codebase
- **Import Organization**: Automatic import sorting and organization
- **TypeScript Rules**: Strict type checking and modern TypeScript patterns

### 🪝 Git Hooks
- **Husky**: Git hooks management for automated quality checks
- **Lint-staged**: Run linters only on staged files for faster commits
- **Pre-commit**: Automatic linting and formatting before commits
- **Commit Message**: Conventional commit format validation

### 📝 Commit Standards
- **Commitizen**: Interactive commit message generation
- **Commitlint**: Conventional commit message validation
- **Conventional Changelog**: Standardized commit message format

### 🔍 IDE Integration
- **VSCode Settings**: Optimized editor configuration
- **Extension Recommendations**: Essential VSCode extensions
- **Auto-formatting**: Format on save and code actions

## Installed Tools

### ESLint Plugins & Rules
- `@typescript-eslint/eslint-plugin` - TypeScript-specific linting rules
- `eslint-plugin-import` - Import/export syntax validation
- `eslint-plugin-nestjs` - NestJS-specific best practices
- `eslint-config-prettier` - Disables ESLint rules that conflict with Prettier

### Code Formatting
- `prettier` - Code formatter with opinionated defaults
- `lint-staged` - Run linters on git staged files
- Automatic import sorting and organization

### Git Workflow
- `husky` - Git hooks management
- `commitizen` - Interactive commit message generation
- `@commitlint/cli` - Commit message linting
- `@commitlint/config-conventional` - Conventional commit standards

## Configuration Files

### ESLint Configuration (`.eslintrc.js`)
```javascript
// Comprehensive rules including:
- TypeScript strict mode
- Import organization
- NestJS best practices
- Security rules
- Performance optimizations
```

### Prettier Configuration (`.prettierrc`)
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Lint-staged Configuration (`.lintstagedrc.json`)
```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

## Available Scripts

### Linting
```bash
npm run lint           # Fix linting issues automatically
npm run lint:check     # Check for linting issues without fixing
```

### Formatting
```bash
npm run format         # Format all files with Prettier
npm run format:check   # Check formatting without applying changes
```

### Commits
```bash
npm run commit         # Interactive commit with Commitizen
git commit             # Standard commit with automatic validation
```

## Git Hooks

### Pre-commit Hook
Automatically runs on every commit:
1. **Lint-staged**: Runs ESLint and Prettier on staged files
2. **Type checking**: Validates TypeScript types
3. **Format check**: Ensures consistent formatting

### Commit Message Hook
Validates commit messages against conventional commit standards:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions or modifications
- `chore:` - Maintenance tasks

## VSCode Integration

### Automatic Setup
The module includes VSCode configuration for:
- **Format on Save**: Automatic Prettier formatting
- **ESLint Integration**: Real-time linting feedback
- **Import Organization**: Auto-organize imports on save
- **Extension Recommendations**: Essential development extensions

### Recommended Extensions
- ESLint - JavaScript/TypeScript linting
- Prettier - Code formatting
- Error Lens - Inline error display
- GitLens - Enhanced Git integration
- Path Intellisense - File path autocompletion

## Code Quality Rules

### TypeScript Rules
- **Explicit return types**: Function return types must be declared
- **No any types**: Discourage use of `any` type
- **Strict null checks**: Prevent null/undefined errors
- **Unused variable detection**: Remove unused code
- **Async/await validation**: Proper async code handling

### Import Rules
- **Import ordering**: Consistent import organization
- **No duplicate imports**: Prevent duplicate import statements
- **Unused imports**: Remove unused import statements
- **Relative imports**: Prefer relative imports for local files

### NestJS Rules
- **Validation pipes**: Enforce input validation
- **API documentation**: Require Swagger decorators
- **Controller tags**: Organize API endpoints
- **Dependency injection**: Proper service registration

### Security Rules
- **No eval**: Prevent code injection vulnerabilities
- **No script URLs**: Block potentially dangerous URLs
- **Input validation**: Ensure proper request validation
- **Error handling**: Consistent error response patterns

## Best Practices

### 1. Commit Workflow
```bash
# Stage your changes
git add .

# Use interactive commit (recommended)
npm run commit

# Or use standard git commit (with validation)
git commit -m "feat: add user authentication module"
```

### 2. Code Style
- Use consistent naming conventions (camelCase, PascalCase)
- Add explicit return types to functions
- Organize imports by type (external, internal, relative)
- Use meaningful variable and function names

### 3. Error Handling
```typescript
// ✅ Good: Explicit error handling
async findUser(id: string): Promise<User | null> {
  try {
    return await this.userRepository.findById(id);
  } catch (error) {
    this.logger.error(`Failed to find user ${id}`, error);
    return null;
  }
}

// ❌ Bad: No error handling
async findUser(id: string) {
  return this.userRepository.findById(id);
}
```

### 4. Type Safety
```typescript
// ✅ Good: Explicit types
interface CreateUserDto {
  name: string;
  email: string;
  age?: number;
}

// ❌ Bad: Using any
function createUser(userData: any): any {
  // Implementation
}
```

## Troubleshooting

### Common Issues

#### ESLint Errors
```bash
# Fix auto-fixable issues
npm run lint

# Check specific file
npx eslint src/path/to/file.ts --fix
```

#### Prettier Conflicts
```bash
# Format specific files
npx prettier --write src/**/*.ts

# Check formatting
npm run format:check
```

#### Husky Hook Failures
```bash
# Reinstall husky hooks
npx husky install

# Manual hook setup
echo 'npx lint-staged' > .husky/pre-commit
chmod +x .husky/pre-commit
```

#### Commitlint Issues
```bash
# Test commit message
echo "feat: add new feature" | npx commitlint

# Interactive commit
npm run commit
```

### IDE Issues

#### VSCode Not Formatting
1. Install recommended extensions
2. Reload VSCode window
3. Check VSCode settings are applied
4. Verify Prettier is set as default formatter

#### ESLint Not Working
1. Ensure ESLint extension is installed
2. Check TypeScript version compatibility
3. Verify .eslintrc.js configuration
4. Restart ESLint server (`Cmd+Shift+P` → "ESLint: Restart ESLint Server")

## Customization

### Adding Custom Rules
Edit `.eslintrc.js` to add project-specific rules:
```javascript
rules: {
  // Your custom rules
  'my-custom-rule': 'error',
}
```

### Prettier Configuration
Modify `.prettierrc` for different formatting preferences:
```json
{
  "printWidth": 120,
  "tabWidth": 4,
  "useTabs": true
}
```

### Commit Message Format
Customize `commitlint.config.js` for different commit types:
```javascript
'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'custom-type']]
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Code Quality
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint:check
      - run: npm run format:check
```

### Pre-deployment Checks
```bash
# Run before deployment
npm run lint:check && npm run format:check && npm run test
```

This module ensures consistent code quality, proper formatting, and standardized commit messages across your entire development team.