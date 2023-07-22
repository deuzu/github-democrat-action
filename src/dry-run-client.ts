import { GithubClientInterface, Logger, PullRequest } from './types'

export default class DryRunClient implements GithubClientInterface {
  private githubClient: GithubClientInterface
  private logger: Logger

  constructor(githubClient: GithubClientInterface, logger: Logger) {
    this.githubClient = githubClient
    this.logger = logger
  }

  async commentOnPullRequest(pullRequestNumber: number, body: string): Promise<void> {
    this.logger(
      'info',
      `Dry-run enabled. The following comment will not be created one the pull request #${pullRequestNumber}: ${body}`
    )

    return new Promise(() => {})
  }

  async getOpenPullRequests(): Promise<PullRequest[]> {
    return this.githubClient.getOpenPullRequests()
  }

  async mergePullRequest(pullRequest: PullRequest): Promise<unknown> {
    this.logger('info', `Dry-run enabled. Pull Request #${pullRequest.number} will not be merged.`)

    return new Promise(() => {})
  }
}
