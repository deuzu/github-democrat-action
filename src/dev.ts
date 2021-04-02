import { enforceDemocracy } from './democrat'

enforceDemocracy(process.env.GITHUB_TOKEN || '', process.env.GITHUB_OWNER || '', process.env.GITHUB_REPO || '')
