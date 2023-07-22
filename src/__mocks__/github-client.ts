import { GithubClientInterface, PullRequest } from "../types"

export default class GithubClient implements GithubClientInterface {
  constructor() {
    console.log('mock constructor')
  }

  async commentOnPullRequest(pullRequestNumber: number, body: string): Promise<void> {
    console.log(`Mock commentOnPullRequest. number: #${pullRequestNumber}, body: ${body}`)

    return new Promise((resolve) => resolve())
  }

  async getOpenPullRequests(): Promise<PullRequest[]> {
    console.log(`Mock getOpenPullRequests`)

    return new Promise((resolve) => resolve([]))
  }

  async mergePullRequest(pullRequest: PullRequest, commentBody: string): Promise<unknown> {
    console.log(`Mock commentOnPullRequest. number: #${pullRequest.number}, commentBody: ${commentBody}`)

    return new Promise((resolve) => resolve(undefined))
  }
}
