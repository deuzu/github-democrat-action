import DryRunClient from './dry-run-client'
import GithubClient from './github-client'
import { GithubClientInterface, Logger } from './types'

export default class DemocratConfig {
  private token: string
  private owner: string
  private repo: string
  private voters: string[]
  private dryRun: boolean
  private prMinimumReviewScore: number
  private prVotingTimeHours: number
  private prMarkAsMergeableLabel: string
  private prTargetBranch: string
  private logger: Logger
  private githubClient: GithubClientInterface

  constructor(
    token: string | undefined,
    ownerRepo: string | undefined,
    voters: string | undefined,
    dryRun: boolean | undefined,
    prMinimumReviewScore: number | undefined,
    prVotingTimeHours: number | undefined,
    prMarkAsMergeableLabel: string | undefined,
    prTargetBranch: string | undefined,
    logger: Logger | undefined
  ) {
    const shouldBeDefined = (property: string): never => {
      throw new Error(`${property} should be defined`)
    }

    this.token = token ?? process.env.GITHUB_TOKEN ?? shouldBeDefined('token')
    const [owner, repo] = (ownerRepo ?? (process.env.GITHUB_REPOSITORY || '/')).split('/')
    this.owner = owner ?? shouldBeDefined('owner')
    this.repo = repo ?? shouldBeDefined('repo')
    this.voters = (voters ?? (process.env.VOTERS || ''))
      .split(',')
      .map((voter: string): string => voter.trim())
      .filter((voter: string): boolean => !!voter)
    this.dryRun = dryRun ?? !!process.env.DRY_RUN
    this.prMinimumReviewScore = prMinimumReviewScore ?? parseInt(process.env.PR_MINIMUM_REVIEW_SCORE ?? '1')
    this.prVotingTimeHours = prVotingTimeHours ?? parseInt(process.env.PR_VOTING_TIME_HOURS || '24')
    this.prMarkAsMergeableLabel = prMarkAsMergeableLabel ?? (process.env.PR_MARK_AS_MERGEABLE_LABEL || 'ready')
    this.prTargetBranch = prTargetBranch ?? (process.env.PR_TARGET_BRANCH || 'main')
    // eslint-disable-next-line no-console
    const loggerDefault: Logger = (level, message) => console.log(`${level} - ${message}`)
    this.logger = logger ?? loggerDefault
    const githubClient = new GithubClient(this.token, this.owner, this.repo)
    this.githubClient = this.dryRun ? new DryRunClient(githubClient, this.logger) : githubClient
  }

  getToken(): string {
    return this.token
  }

  getOwner(): string {
    return this.owner
  }

  getRepo(): string {
    return this.repo
  }

  getVoters(): string[] {
    return this.voters
  }

  isDryRun(): boolean {
    return this.dryRun
  }

  getPrMinimumReviewScore(): number {
    return this.prMinimumReviewScore
  }

  getPrVotingTimeHours(): number {
    return this.prVotingTimeHours
  }

  getPrMarkAsMergeableLabel(): string {
    return this.prMarkAsMergeableLabel
  }

  getPrTargetBranch(): string {
    return this.prTargetBranch
  }

  getLogger(): Logger {
    return this.logger
  }

  getGithubClient(): GithubClientInterface {
    return this.githubClient
  }
}
