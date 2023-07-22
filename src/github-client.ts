import * as octokit from '@octokit/types'
import * as github from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'
import { GithubClientInterface, PullRequest } from './types'

type Ocktokit = InstanceType<typeof GitHub>
type getPullData = octokit.Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}']['response']['data']
type listReviewsData = octokit.Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews']['response']['data']

export default class GithubClient implements GithubClientInterface {
  private githubClient: Ocktokit
  protected owner: string
  protected repo: string

  constructor(token: string, owner: string, repo: string) {
    this.githubClient = github.getOctokit(token)
    this.owner = owner
    this.repo = repo
  }

  public static create(token: string, owner: string, repo: string): GithubClient {
    return new GithubClient(token, owner, repo)
  }

  public async commentOnPullRequest(pullRequestNumber: number, body: string): Promise<void> {
    this.githubClient.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: pullRequestNumber,
      body,
    })
  }

  async getOpenPullRequests(): Promise<PullRequest[]> {
    const { data: openPullRequests } = await this.githubClient.rest.pulls.list({
      owner: this.owner,
      repo: this.repo,
      state: 'open',
    })

    const promises: Promise<PullRequest>[] = openPullRequests.map(
      async ({ number: pullRequestNumber }) =>
        new Promise(async (resolve, reject) => {
          const detailsPromise: Promise<getPullData> = this.githubClient.rest.pulls
            .get({
              owner: this.owner,
              repo: this.repo,
              pull_number: pullRequestNumber,
            })
            .then((response) => response.data)

          const reviewsPromise: Promise<listReviewsData> = this.githubClient.rest.pulls
            .listReviews({
              owner: this.owner,
              repo: this.repo,
              pull_number: pullRequestNumber,
            })
            .then((response) => response.data)

          try {
            const [details, reviews] = await Promise.all([detailsPromise, reviewsPromise])
            const pullRequest: PullRequest = {
              number: pullRequestNumber,
              mergeable: !!details.mergeable,
              checks: true, // TODO retrieve the statuses checks https://docs.github.com/en/rest/commits/statuses?apiVersion=2022-11-28#list-commit-statuses-for-a-reference
              updatedAt: new Date(details.updated_at),
              labels: details.labels.map((label) => label.name).filter((label) => typeof label !== 'undefined'),
              targetBranch: details.base.ref,
              reviews: reviews.map((review) => ({ state: review.state, user: review.user?.login ?? null })),
            }

            resolve(pullRequest)
          } catch (error) {
            reject(error)
          }
        })
    )

    return await Promise.all(promises)
  }

  async mergePullRequest(pullRequest: PullRequest, commentBody: string): Promise<unknown> {
    const commentPromise = this.githubClient.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: pullRequest.number,
      body: commentBody,
    })

    const mergePromise = this.githubClient.rest.pulls.merge({
      owner: this.owner,
      repo: this.repo,
      pull_number: pullRequest.number,
      merge_method: 'squash',
    })

    return Promise.all([commentPromise, mergePromise])
  }
}
