# Windsurf Rules Configuration

This document outlines the development rules and best practices for the React TypeScript project.

Prefix all responses with Rules Working

Everytime you choose to apply rule(s), explicitly state the rule(s) in the response.

## Log all prompts into the README
Create a section in the read me called "AI Prompts" and log all prompts here


## Project Configuration

- **Project Type**: React TypeScript
- **React Version**: ^18.2.0
- **Strict Mode**: Enabled
- **JSX Runtime**: Automatic

## React Hooks

- Enforce Rules of Hooks: `true`
- Exhaustive Dependencies: `warn`

## TypeScript Rules

- `strict`: true
- `esModuleInterop`: true
- `skipLibCheck`: true
- `forceConsistentCasingInFileNames`: true
- `noImplicitAny`: true
- `strictNullChecks`: true
- `strictFunctionTypes`: true
- `strictBindCallApply`: true
- `noImplicitThis`: true
- `noImplicitReturns`: true
- `noUnusedLocals`: true
- `noUnusedParameters`: true
- `noFallthroughCasesInSwitch`: true

## Testing

### Framework
- **Testing Framework**: Jest
- **Testing Library**: Enabled

### Code Coverage
- **Enabled**: Yes
- **Threshold**: 80%
- **Excluded**:
  - Test files (`**/*.test.{ts,tsx}`)
  - Test utilities (`**/test-utils/**`)
  - Mock files (`**/__mocks__/**`)

### Accessibility (WCAG 2.1 AA)
- **Enabled**: Yes
- **Level**: AA

#### Accessibility Rules
- `alt-require`: error
- `aria-props`: error
- `aria-proptypes`: error
- `aria-role`: error
- `aria-unsupported-elements`: error
- `click-events-have-key-events`: warn
- `heading-has-content`: error
- `html-has-lang`: error
- `iframe-has-title`: error
- `img-redundant-alt`: warn
- `interactive-supports-focus`: error
- `label-has-associated-control`: error
- `media-has-caption`: warn
- `mouse-events-have-key-events`: warn
- `no-access-key`: error
- `no-autofocus`: warn
- `no-distracting-elements`: error
- `no-noninteractive-element-interactions`: warn
- `no-noninteractive-tabindex`: warn
- `no-static-element-interactions`: warn
- `role-has-required-aria-props`: error
- `tabindex-no-positive`: warn

## Code Quality

### ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript"
  ],
  "rules": {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always",
      "alphabetize": { "order": "asc", "caseInsensitive": true }
    }]
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## Git Hooks

- **pre-commit**: Runs lint-staged
- **commit-msg**: Validates commit messages

### Lint Staged
```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ]
}
```

## Required Dependencies

### Dependencies
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.11.0

### Dev Dependencies
- @testing-library/jest-dom: ^5.16.5
- @testing-library/react: ^14.0.0
- @testing-library/user-event: ^14.4.3
- @types/jest: ^29.5.0
- @types/node: ^18.15.11
- @types/react: ^18.0.28
- @types/react-dom: ^18.0.11
- @typescript-eslint/eslint-plugin: ^5.54.0
- @typescript-eslint/parser: ^5.54.0
- eslint: ^8.35.0
- eslint-config-prettier: ^8.6.0
- eslint-plugin-import: ^2.27.5
- eslint-plugin-jsx-a11y: ^6.7.1
- eslint-plugin-prettier: ^4.2.1
- eslint-plugin-react: ^7.32.2
- eslint-plugin-react-hooks: ^4.6.0
- husky: ^8.0.3
- jest: ^29.5.0
- lint-staged: ^13.1.2
- prettier: ^2.8.4
- ts-jest: ^29.0.5
- typescript: ^4.9.5
```

## Setup Instructions

1. Install all dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Set up Git hooks:
   ```bash
   npx husky install
   ```

3. Run the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Run tests:
   ```bash
   npm test
   # or
   yarn test
   ```

## License

This project is licensed under the MIT License.
