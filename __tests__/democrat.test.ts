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
    data: [
      { user: { login: 'deuzu' }, state: 'APPROVED' },
      { user: { login: 'contributor' }, state: 'APPROVED' },
      { user: { login: 'angry_contributor' }, state: 'CHANGES_REQUESTED' },
      { user: { login: 'non_approved_contributor' }, state: 'CHANGES_REQUESTED' },
    ],
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
    const democratParameters = {
      token: '12345abc',
      owner: 'org',
      repo: 'repo',
      voters: ['deuzu', 'contributor', 'angry_contributor'],
      dryRun: false,
      logFunction: () => {},
    }
    const pullRequestParameters = {
      minimumReviewScore: 1,
      votingTimeHours: 24,
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
    const democratParameters = {
      token: '12345abc',
      owner: 'org',
      repo: 'repo',
      voters: ['deuzu', 'contributor', 'angry_contributor'],
      dryRun: true,
      logFunction: () => {},
    }
    const pullRequestParameters = {
      minimumReviewScore: 1,
      votingTimeHours: 24,
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
