import { mocked } from 'ts-jest/utils'
import Democrat from '../src/democrat'
import { getOctokit } from '@actions/github'

jest.mock('@actions/github', () => ({ getOctokit: jest.fn() }))

describe('Democrat', () => {
  const pullListMock = jest.fn(() => ({ data: [{ number: 42 }] }))
  const pullGetMock = jest.fn(() => ({
    data: {
      number: 42,
      mergeable: true,
      updated_at: '2021-04-02T10:08:28Z',
      labels: [{ name: 'ready' }],
      base: { ref: 'main' },
    },
  }))
  const pullListReviewsMock = jest.fn(() => ({
    data: [{ state: 'APPROVED' }, { state: 'APPROVED' }, { state: 'REQUEST_CHANGE' }],
  }))
  const pullMergeMock = jest.fn()

  const octokitMock: any = mocked(getOctokit, true)
  octokitMock.mockImplementation(() => ({
    pulls: {
      list: pullListMock,
      get: pullGetMock,
      listReviews: pullListReviewsMock,
      merge: pullMergeMock,
    },
  }))

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Enforce democracy', async () => {
    const democratParameters = { token: '12345abc', owner: 'org', repo: 'repo', dryRun: false, logFunction: () => {} }
    const pullRequestParameters = {
      minimumReviewScore: 1,
      maturity: 24,
      markAsMergeableLabel: 'ready',
      targetBranch: 'main',
    }
    const democrat = new Democrat(democratParameters, pullRequestParameters)
    await democrat.enforceDemocracy()

    expect(pullListMock).toHaveBeenCalledTimes(1)
    expect(pullGetMock).toHaveBeenCalledTimes(1)
    expect(pullListReviewsMock).toHaveBeenCalledTimes(1)
    expect(pullMergeMock).toHaveBeenCalledTimes(1)
  })

  test('Enforce democracy - DryRun', async () => {
    const democratParameters = { token: '12345abc', owner: 'org', repo: 'repo', dryRun: true, logFunction: () => {} }
    const pullRequestParameters = {
      minimumReviewScore: 1,
      maturity: 24,
      markAsMergeableLabel: 'ready',
      targetBranch: 'main',
    }
    const democrat = new Democrat(democratParameters, pullRequestParameters)
    await democrat.enforceDemocracy()

    expect(pullListMock).toHaveBeenCalledTimes(1)
    expect(pullGetMock).toHaveBeenCalledTimes(1)
    expect(pullListReviewsMock).toHaveBeenCalledTimes(1)
    expect(pullMergeMock).toHaveBeenCalledTimes(0)
  })
})
