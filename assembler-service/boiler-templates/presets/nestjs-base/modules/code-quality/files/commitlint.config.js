module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type enum
    'type-enum': [
      2,
      'always',
      [
        'build',    // Changes that affect the build system or external dependencies
        'ci',       // Changes to our CI configuration files and scripts
        'docs',     // Documentation only changes
        'feat',     // A new feature
        'fix',      // A bug fix
        'perf',     // A code change that improves performance
        'refactor', // A code change that neither fixes a bug nor adds a feature
        'style',    // Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
        'test',     // Adding missing tests or correcting existing tests
        'revert',   // Reverts a previous commit
        'chore',    // Other changes that don't modify src or test files
      ],
    ],
    // Subject case
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    // Subject length
    'subject-max-length': [2, 'always', 100],
    'subject-min-length': [2, 'always', 3],
    // Body length
    'body-max-line-length': [2, 'always', 100],
    // Footer length
    'footer-max-line-length': [2, 'always', 100],
  },
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
};