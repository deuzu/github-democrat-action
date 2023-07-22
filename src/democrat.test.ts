import Democrat from './democrat'
import DemocratConfig from './democrat-config'

jest.mock('./github-client')

describe('Democrat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Voting Opening', async () => {
    expect(true).toBe(true)
  })

  test('Enforce democracy', async () => {
    const config = new DemocratConfig(
      'token',
      'deuzu/github-democrat-action',
      'deuzu, not-deuzu',
      true,
      2,
      12,
      'ready-to-merge',
      'prod',
      () => {}
    )
    const democrat = new Democrat(config)
    await democrat.enforceDemocracy()

    // TODO
    expect(true).toBe(true)
  })
})
