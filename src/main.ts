import dotenv from 'dotenv'
import * as core from '@actions/core'
import * as github from '@actions/github'
import Democrat, { DemocratParameters, PullRequestParameters } from './democrat'

dotenv.config()

async function run(): Promise<void> {
  try {
    const context = github.context
    const [owner, repo] = (context.payload.repository?.full_name || process.env.GITHUB_REPOSITORY || '/').split('/')

    const democratParameters: DemocratParameters = {
      token: core.getInput('githubToken') || process.env.GITHUB_TOKEN || '',
      owner,
      repo,
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
      maturity: parseInt(core.getInput('prMaturity') || process.env.PR_MATURITY || ''),
      markAsMergeableLabel: core.getInput('prMarkAsMegeableLabel') || process.env.PR_MARK_AS_MERGEABLE_LABEL || '',
      targetBranch: core.getInput('prTargetBranch') || process.env.PR_TARGET_BRANCH || '',
    }

    const democrat = new Democrat(democratParameters, pullRequestParameters)
    await democrat.enforceDemocracy()
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
