import * as core from '@actions/core'
import * as github from '@actions/github'
import { DemocratParameters, enforceDemocracy } from './democrat'

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token')
    const context = github.context
    const owner = context.payload.repository?.owner.name
    const repo = context.payload.repository?.name

    if (!owner || !repo) {
      throw new Error('`owner` and/or `repo` missing from Github context')
    }

    const democratParameter: DemocratParameters = { token, owner, repo }
    enforceDemocracy(democratParameter)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
