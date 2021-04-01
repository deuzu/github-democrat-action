import * as core from '@actions/core'
import * as github from '@actions/github'

interface PullRequest {
  id: number
}

async function run(): Promise<void> {
  try {
    core.info(`Implementing democracy on org/repo. Resistence is futile.`)

    const token = core.getInput('github-token')
    const octokit = github.getOctokit(token)

    const context = github.context
    const owner = context.payload.repository?.owner.name || ''
    const repo = context.payload.repository?.name || ''

    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state: 'open'
    })

    for (const pullRequest of data) {
      const pullRequestValid =
        isPullRequestMergeable(pullRequest) &&
        arePullRequestChecksOk(pullRequest) &&
        arePullRequestReviewsOk(pullRequest) &&
        isPullRequestMature(pullRequest) &&
        isPullRequestReadyToBeMerged(pullRequest)

      if (pullRequestValid) {
        core.info(`Democracy has spoken. Pull Request #${pullRequest.id} has been voted for merge.`)

        await octokit.pulls.merge({
          owner,
          repo,
          pull_number: pullRequest.id
        })

        core.info(`Pull Request #${pullRequest.id} merged.`)
      }
    }

    core.info('Democracy will be back.')
  } catch (error) {
    core.setFailed(error.message)
  }
}

const isPullRequestMergeable = (pullRequest: PullRequest): boolean => {
  core.debug(JSON.stringify(pullRequest))

  return true
}

const arePullRequestChecksOk = (pullRequest: PullRequest): boolean => {
  core.debug(JSON.stringify(pullRequest))

  return true
}

const arePullRequestReviewsOk = (pullRequest: PullRequest): boolean => {
  core.debug(JSON.stringify(pullRequest))

  return true
}

const isPullRequestMature = (pullRequest: PullRequest): boolean => {
  core.debug(JSON.stringify(pullRequest))

  return true
}

const isPullRequestReadyToBeMerged = (pullRequest: PullRequest): boolean => {
  core.debug(JSON.stringify(pullRequest))

  return true
}

run()
