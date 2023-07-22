export type Logger = (level: string, message: string) => void

export interface GithubClientInterface {
  commentOnPullRequest: (pullRequestNumber: number, body: string) => Promise<void>
  getOpenPullRequests: () => Promise<PullRequest[]>
  mergePullRequest: (pullRequest: PullRequest, commentBody: string) => Promise<unknown>
}

export interface PullRequest {
  readonly number: number
  readonly mergeable: boolean
  readonly checks: boolean
  readonly updatedAt: Date
  readonly labels: string[]
  readonly targetBranch: string
  readonly reviews: PullRequestReview[]
}

export interface PullRequestReview {
  readonly state: string
  readonly user: string | null
}
