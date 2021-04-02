import * as core from '@actions/core'
import * as github from '@actions/github'

interface PullRequest {
  number: number
  mergeable: boolean
  updatedAt: Date
  labels: (string | undefined)[]
  base: string
  reviewScore: number
}

export const enforceDemocracy = async (token: string, owner: string, repo: string): Promise<void> => {
  core.info(`Implementing democracy on ${owner}/${repo}. Resistence is futile.`)

  const octokit = github.getOctokit(token)

  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: 'open'
  })

  for (const { number: pullRequestNumber } of data) {
    const { data: pullRequestDetail } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: pullRequestNumber
    })

    const { data: pullRequestReviews } = await octokit.pulls.listReviews({
      owner,
      repo,
      pull_number: pullRequestNumber
    })

    const pullRequest: PullRequest = {
      number: pullRequestDetail.number,
      mergeable: !!pullRequestDetail.mergeable,
      updatedAt: new Date(pullRequestDetail.updated_at),
      labels: pullRequestDetail.labels.map((label) => label.name),
      base: pullRequestDetail.base.ref,
      reviewScore: pullRequestReviews.reduce((accumulator, review) => {
        if ('APPROVED' === review.state) {
          accumulator += 1
        }

        if ('REQUEST_CHANGE' === review.state) {
          accumulator += -1
        }

        return accumulator
      }, 0)
    }

    const pullRequestValid =
      isPullRequestMergeable(pullRequest) &&
      isPullRequestBaseValid(pullRequest) &&
      arePullRequestChecksOk(pullRequest) &&
      arePullRequestReviewsOk(pullRequest) &&
      isPullRequestReadyToBeMerged(pullRequest) &&
      isPullRequestMature(pullRequest)

    if (!pullRequestValid) {
      core.info(`Pull Request #${pullRequest.number} does not fit contraints for merge`)

      continue
    }

    core.info(`Democracy has spoken. Pull Request #${pullRequest.number} has been voted for merge.`)

    await octokit.pulls.merge({
      owner,
      repo,
      pull_number: pullRequest.number,
      merge_method: 'squash'
    })

    core.info(`Pull Request #${pullRequest.number} merged.`)
  }

  core.info('Democracy enforcer will be back.')
}

const isPullRequestMergeable = (pullRequest: PullRequest): boolean => pullRequest.mergeable

// todo enable checks verification to avoid failed merges
const arePullRequestChecksOk = (pullRequest: PullRequest): boolean => !!pullRequest

const arePullRequestReviewsOk = (pullRequest: PullRequest): boolean => pullRequest.reviewScore > 1

const isPullRequestMature = (pullRequest: PullRequest): boolean =>
  (+new Date() - pullRequest.updatedAt.getTime()) / (1000 * 60 * 60) > 24

const isPullRequestReadyToBeMerged = (pullRequest: PullRequest): boolean => -1 !== pullRequest.labels.indexOf('ready')

const isPullRequestBaseValid = (pullRequest: PullRequest): boolean => 'main' === pullRequest.base
