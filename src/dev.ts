import { DemocratParameters, enforceDemocracy } from './democrat'

const democratParameter: DemocratParameters = {
  token: process.env.GITHUB_TOKEN || '',
  owner: process.env.GITHUB_OWNER || '',
  repo: process.env.GITHUB_REPO || '',
  dryRun: true,
}

enforceDemocracy(democratParameter)
