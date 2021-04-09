import * as github from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'
import { Endpoints } from '@octokit/types'

export interface DemocratParameters {
  readonly token: string
  readonly owner: string
  readonly repo: string
  readonly dryRun?: boolean
  readonly logFunction?: (level: string, message: string) => void
}

interface PullCandidate {
  readonly number: number
  readonly mergeable: boolean
  readonly updatedAt: Date
  readonly labels: (string | undefined)[]
  readonly base: string
  readonly reviewScore: number
}

type listPullsData = Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data']
type getPullData = Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}']['response']['data']
type listReviewsData = Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews']['response']['data']

export default class Democrat {
  private democratParameters: DemocratParameters
  private octokit: InstanceType<typeof GitHub>
  private logger: (level: string, message: string) => void

  constructor(democratParameters: DemocratParameters) {
    this.democratParameters = democratParameters
    this.octokit = github.getOctokit(democratParameters.token)
    /* eslint-disable no-console */
    this.logger = democratParameters.logFunction || ((level, message) => console.log(`${level} - ${message}`))
    /* eslint-enable no-console */
  }

  async enforceDemocracy(): Promise<void> {
    const { owner, repo } = this.democratParameters
    this.logger('info', `Implementing democracy on ${owner}/${repo}, resistance is futile.`)

    const pulls = await this.fetchPulls()
    this.logger('info', `${pulls.length} pull request(s) is/are candidate(s) for merge.`)
    const pullsAndReviews = await this.fetchPullDetailsAndReviews(pulls)
    const pullCandidates = this.buildPullCandidates(pullsAndReviews)
    const electedPullCandidates = pullCandidates.filter(this.validatePullCandidate)
    this.logger('info', `${electedPullCandidates.length} pull request(s) left after validation.`)

    await this.mergePulls(electedPullCandidates)

    this.logger('info', 'Democracy enforcer will be back.')
  }

  private async fetchPulls(): Promise<listPullsData> {
    const { owner, repo } = this.democratParameters

    const response = await this.octokit.pulls.list({
      owner,
      repo,
      state: 'open',
    })

    return response.data
  }

  private async fetchPullDetailsAndReviews(pulls: listPullsData): Promise<[getPullData, listReviewsData][]> {
    const promises: Promise<[getPullData, listReviewsData]>[] = pulls.map(
      async ({ number: pullRequestNumber }) =>
        new Promise(async (resolve, reject) => {
          const pull = this.fetchPullDetails(pullRequestNumber)
          const reviews = this.fetchReviews(pullRequestNumber)

          try {
            const all = await Promise.all([pull, reviews])
            resolve(all)
          } catch (error) {
            reject(error)
          }
        })
    )

    return Promise.all(promises)
  }

  private async fetchPullDetails(pullNumber: number): Promise<getPullData> {
    const { owner, repo } = this.democratParameters

    const response = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    })

    return response.data
  }

  private async fetchReviews(pullNumber: number): Promise<listReviewsData> {
    const { owner, repo } = this.democratParameters

    const response = await this.octokit.pulls.listReviews({
      owner,
      repo,
      pull_number: pullNumber,
    })

    return response.data
  }

  private buildPullCandidates(pullsAndReviews: [getPullData, listReviewsData][]): PullCandidate[] {
    const pullCandidates = []

    for (const [pull, reviews] of pullsAndReviews) {
      pullCandidates.push(this.buildPullCandidate(pull, reviews))
    }

    return pullCandidates
  }

  private buildPullCandidate(pull: getPullData, reviews: listReviewsData): PullCandidate {
    return {
      number: pull.number,
      mergeable: !!pull.mergeable,
      updatedAt: new Date(pull.updated_at),
      labels: pull.labels.map((label) => label.name),
      base: pull.base.ref,
      reviewScore: reviews.reduce((accumulator, review): number => {
        if ('APPROVED' === review.state) {
          accumulator += 1
        }

        if ('REQUEST_CHANGE' === review.state) {
          accumulator += -1
        }

        return accumulator
      }, 0),
    }
  }

  private validatePullCandidate = (pullCandidate: PullCandidate): boolean => {
    return (
      pullCandidate.mergeable &&
      pullCandidate.reviewScore >= 1 &&
      (+new Date() - pullCandidate.updatedAt.getTime()) / (1000 * 60 * 60) > 24 &&
      -1 !== pullCandidate.labels.indexOf('ready') &&
      'main' === pullCandidate.base
    )
  }

  private async mergePulls(pulls: PullCandidate[]): Promise<void[]> {
    const promises = pulls.map(async (pull) => this.mergePull(pull))

    return Promise.all(promises)
  }

  private async mergePull(pull: PullCandidate): Promise<void> {
    const { owner, repo, dryRun } = this.democratParameters
    this.logger('info', `Democracy has spoken. Pull Request #${pull.number} has been voted for merge.`)

    if (dryRun === true) {
      this.logger('info', `Dry-run enabled. Pull Request #${pull.number} will not be merged.`)

      return new Promise((resolve) => resolve(undefined))
    }

    await this.octokit.pulls.merge({
      owner,
      repo,
      pull_number: pull.number,
      merge_method: 'squash',
    })

    return this.logger('info', `Pull Request #${pull.number} merged.`)
  }
}
