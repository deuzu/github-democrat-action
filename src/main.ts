import dotenv from 'dotenv'
import * as core from '@actions/core'
import * as github from '@actions/github'
import Democrat, { DemocratParameters } from './democrat'

dotenv.config()

async function run(): Promise<void> {
  try {
    const context = github.context
    const token = core.getInput('githubToken') || process.env.GITHUB_TOKEN || ''
    const [owner, repo] = (context.payload.repository?.full_name || process.env.GITHUB_REPOSITORY || '/').split('/')
    const dryRun = (core.getInput('dryRun') || process.env.DRY_RUN) === 'true'

    const democratParameter: DemocratParameters = {
      token,
      owner,
      repo,
      dryRun,
      logFunction: (level: string, message: string) => {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const coreUntyped = core as any
        coreUntyped[level](message)
        /* eslint-enable @typescript-eslint/no-explicit-any */
      },
    }

    const democrat = new Democrat(democratParameter)
    await democrat.enforceDemocracy()
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
