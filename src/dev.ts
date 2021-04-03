import Democrat, { DemocratParameters } from './democrat'

async function run(): Promise<void> {
  const democratParameter: DemocratParameters = {
    token: process.env.GITHUB_TOKEN || '',
    owner: process.env.GITHUB_OWNER || '',
    repo: process.env.GITHUB_REPO || '',
    dryRun: true,
  }

  const democrat = new Democrat(democratParameter)
  await democrat.enforceDemocracy()
}

run()
