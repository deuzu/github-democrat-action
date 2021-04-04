<br />
<p align="center">
  <!-- <a href="#">
    <img src="./logo.png" alt="Logo" width="80" height="80">
  </a> -->

  <h3 align="center">Github Democrat Action</h3>

  <p align="center">
    Enforce democracy on a repository by merging pull requests by voting score.
    <br />
    <a href="https://github.com/deuzu/github-democrat-action/"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/deuzu/github-democrat-action/issues">Report Bug</a>
    ·
    <a href="https://github.com/deuzu/github-democrat-action/issues">Request Feature</a>
    ·
    <a href="https://github.com/deuzu/github-democrat-action/pulls">Send a Pull Request</a>
  </p>
</p>

## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Installation](#installation)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)
* [Acknowledgements](#acknowledgements)

## About The Project

### Built With

* [Node](https://nodejs.org)
* [Github actions](https://github.com/features/actions)
* [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Installation

Create a new workflow in `.github/workflows/democracy-enforcer.yaml`.

```yaml
name: 'democracy-enforcer'

on:
  schedule:
    - cron: '*/30 * * * *'

jobs:
  enforce-democracy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: deuzu/github-democrat-action
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

The job will hunt pull requests and merge ones that fit the following constraints:
- receive more than half of the majority vote cast (votes are review approves and request changes)
- is ready to be merged (with a `ready` label)
- is mature (last commit is older than 24h)
- target is the `main` branch

To avoid fraud, it's advised to add protections on the main branch:
- [X] Require pull request reviews before merging
- [X] Dismiss stale pull request approvals when new commits are pushed
- [X] Require status checks to pass before merging

## Roadmap

See the [open issues](https://github.com/deuzu/github-democrat-action/issues) for a list of proposed features (and known issues).

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **extremely appreciated**.
Please read [those guidelines](./.github/CONTRIBUTING.md) before contributing to this repository.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat-amazing-feature`)
3. Commit your Changes (`git commit -m 'feat(scope): Add some AmazingFeature' -m "Closes #42"`)
4. Push to the Branch (`git push origin feat-amazing-feature`)
5. Open a Pull Request

## License

[MIT](./LICENSE)

## Contact

## Acknowledgements
