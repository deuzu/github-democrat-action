# Contributing to Github Democrat Action

## Commit messages

In order to keep commits history clear and descriptive, we follow very precise rules over how our Git commit messages must be formatted. This specification is inspired by the [AngularJS commit message format](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits) and [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

Each commit message consists of a header, a body, and a footer.

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Type

Must be one of the following:
- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing or correcting existing tests
- chore: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Scope

The scope could be anything specifying place of the commit change.

### Body (optionnal)

Just as in the subject, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about Breaking Changes and is also the place to reference related issues.

Breaking Changes, if any, must be indicated in the footer and should start with `BREAKING CHANGE: `.
References should start with either `Closes`, `Fixes` or `Relates` then a space, a `#` and the reference's id.

```
BREAKING CHANGE: doing that change the output of this
Closes #42
```
