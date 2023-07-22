import DemocratConfig from './democrat-config'
import { GithubClientInterface, Logger, PullRequest } from './types'

export default class Democrat {
  private config: DemocratConfig
  private logger: Logger
  private githubClient: GithubClientInterface

  constructor(config: DemocratConfig) {
    this.config = config
    this.logger = config.getLogger()
    this.githubClient = config.getGithubClient()
  }

  async votingOpening(pullNumber: number): Promise<void> {
    const voters = this.config.getVoters()
    const targetBranch = this.config.getPrTargetBranch()
    const markAsMergeableLabel = this.config.getPrMarkAsMergeableLabel()
    const votingTimeHours = this.config.getPrVotingTimeHours()
    const minimumReviewScore = this.config.getPrMinimumReviewScore()

    const votersLink = voters.map((voter) => `[${voter}](https://github.com/${voter})`)
    const body = `
## The Github Democrat is now taking care of this pull request. Voting is open!

To be eligible for merge, the pull request must:
- be mergeable (no conflicts)
- target the branch \`${targetBranch}\`
- have a \`${markAsMergeableLabel}\` label
- have been unmodified for \`${votingTimeHours}h\`
- have a review score of \`${minimumReviewScore}\` or more (approves +1 & request changes -1)

Allowed voters are: ${voters.length > 0 ? votersLink.join(', ') : ':open_hands: everyone :open_hands:'}
    `

    this.githubClient.commentOnPullRequest(pullNumber, body)
  }

  async enforceDemocracy(): Promise<void> {
    this.logger(
      'info',
      `Implementing democracy on ${this.config.getOwner()}/${this.config.getRepo()}, resistance is futile.`
    )

    const openPullRequests = await this.githubClient.getOpenPullRequests()
    this.logger('info', `${openPullRequests.length} pull request(s) is/are candidate(s) for merge.`)

    const mergeablePullRequests = this.getMergeablePullRequests(openPullRequests)
    this.logger('info', `${mergeablePullRequests.length} pull request(s) passed validation thus ready for merge.`)
    await this.mergePullRequests(mergeablePullRequests, 'Democracy has spoken, the pull request will be merged.')

    this.logger('info', 'Democracy enforcer will be back.')
  }

  private getMergeablePullRequests(pullRequests: PullRequest[]): PullRequest[] {
    return pullRequests.filter((pullRequest) => {
      const errors = this.validatePullRequests(pullRequest)

      if (errors.length > 0) {
        this.logger(
          'info',
          `Pull request #${pullRequest.number} did not pass validation. Errors: ${errors.join(', ')}.`
        )

        return false
      }

      return true
    })
  }

  private validatePullRequests(pullRequest: PullRequest): string[] {
    const targetBranch = this.config.getPrTargetBranch()
    const markAsMergeableLabel = this.config.getPrMarkAsMergeableLabel()
    const votingTimeHours = this.config.getPrVotingTimeHours()
    const minimumReviewScore = this.config.getPrMinimumReviewScore()
    const voters = this.config.getVoters()
    const errors = []
    const reviewScore = pullRequest.reviews.reduce((accumulator, review): number => {
      if (voters.length === 0 || review.user === null || -1 === voters.indexOf(review.user)) {
        return accumulator
      }

      if ('APPROVED' === review.state) {
        accumulator += 1
      }

      if ('CHANGES_REQUESTED' === review.state) {
        accumulator += -1
      }

      return accumulator
    }, 0)
    const lastCommitSinceHours = (+new Date() - pullRequest.updatedAt.getTime()) / (1000 * 60 * 60)
    const hasMergeableLabel = -1 !== pullRequest.labels.indexOf(markAsMergeableLabel)

    pullRequest.mergeable || errors.push('not mergeable')
    pullRequest.checks || errors.push(`some checks did not pass`)
    reviewScore >= minimumReviewScore || errors.push(`review score too low: ${reviewScore}`)
    lastCommitSinceHours > votingTimeHours ||
      errors.push(`not mature enough (last commit ${lastCommitSinceHours.toPrecision(1)}h ago)`)
    hasMergeableLabel || errors.push(`missing \`${markAsMergeableLabel}\` label`)
    targetBranch === pullRequest.targetBranch ||
      errors.push(`wrong target branch: ${pullRequest.targetBranch} instead of ${targetBranch}`)

    return errors
  }

  private async mergePullRequests(pullRequests: PullRequest[], commentBody: string): Promise<void[]> {
    const promises: Promise<void>[] = pullRequests.map(async (pullRequest) => {
      this.logger('info', `Democracy has spoken. Pull Request #${pullRequest.number} has been voted for merge.`)

      return (
        this.githubClient
          .mergePullRequest(pullRequest, commentBody)
          // eslint-disable-next-line github/no-then
          .then(() => this.logger('info', `Pull Request #${pullRequest.number} merged.`))
      )
    })

    return Promise.all(promises)
  }
}
