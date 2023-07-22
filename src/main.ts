import * as core from '@actions/core'
import * as github from '@actions/github'
import dotenv from 'dotenv'
import Democrat from './democrat'
import DemocratConfig from './democrat-config'

dotenv.config()

async function run(): Promise<void> {
  try {
    const {
      eventName,
      payload: { action, number, repository },
    } = github.context

    const actionLogger = (level: string, message: string): void => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const coreUntyped = core as any
      coreUntyped[level](message)
      /* eslint-enable @typescript-eslint/no-explicit-any */
    }

    const democratConfig = new DemocratConfig(
      core.getInput('githubToken') ? core.getInput('githubToken') : undefined,
      repository?.full_name,
      core.getInput('voters') ? core.getInput('voters') : undefined,
      core.getInput('dryRun') === 'true' || core.getInput('dryRun') === '1' ? true : undefined,
      core.getInput('prMinimumReviewScore') ? parseInt(core.getInput('prMinimumReviewScore')) : undefined,
      core.getInput('prVotingTimeHours') ? parseInt(core.getInput('prVotingTimeHours')) : undefined,
      core.getInput('prMarkAsMergeableLabel') ? core.getInput('prMarkAsMergeableLabel') : undefined,
      core.getInput('prTargetBranch') ? core.getInput('prTargetBranch') : undefined,
      core.getInput('githubToken') ? actionLogger : undefined
    )

    const democrat = new Democrat(democratConfig)

    if ('pull_request' === eventName && 'opened' === action) {
      await democrat.votingOpening(number)

      return
    }

    await democrat.enforceDemocracy()
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }

    if ('string' === typeof error) {
      core.setFailed(error)
    }
  }
}

run()
