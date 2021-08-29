import * as core from '@actions/core'
import * as github from '@actions/github'
import dotenv from 'dotenv'
import Democrat, { DemocratParameters, PullRequestParameters } from './democrat'

dotenv.config()

async function run(): Promise<void> {
  try {
    const context = github.context
    const {
      eventName,
      payload: { action, number },
    } = context
    const [owner, repo] = (context.payload.repository?.full_name || process.env.GITHUB_REPOSITORY || '/').split('/')
    const voters = core
      .getInput('voters')
      .split(',')
      .map((voter: string): string => voter.trim())
      .filter((voter: string): boolean => !!voter)

    const democratParameters: DemocratParameters = {
      token: core.getInput('githubToken') || process.env.GITHUB_TOKEN || '',
      owner,
      repo,
      voters,
      dryRun: (core.getInput('dryRun') || process.env.DRY_RUN) === 'true',
      logFunction: (level: string, message: string) => {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const coreUntyped = core as any
        coreUntyped[level](message)
        /* eslint-enable @typescript-eslint/no-explicit-any */
      },
    }

    const pullRequestParameters: PullRequestParameters = {
      minimumReviewScore: parseInt(core.getInput('prMinimumReviewScore') || process.env.PR_MINIMUM_REVIEW_SCORE || ''),
      votingTimeHours: parseInt(core.getInput('prVotingTimeHours') || process.env.PR_VOTING_TIME_HOURS || ''),
      markAsMergeableLabel: core.getInput('prMarkAsMegeableLabel') || process.env.PR_MARK_AS_MERGEABLE_LABEL || '',
      targetBranch: core.getInput('prTargetBranch') || process.env.PR_TARGET_BRANCH || '',
    }

    const democrat = new Democrat(democratParameters, pullRequestParameters)

    if ('pull_request' === eventName && 'opened' === action) {
      await democrat.votingOpening(number)

      return
    }

    await democrat.enforceDemocracy()
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
