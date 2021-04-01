import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    core.info(`Implementing democracy on org/repo. Resistence is futile.`)

    const token = core.getInput('github-token')
    const octokit = github.getOctokit(token)

    const context = github.context
    const owner = context.payload.repository?.owner.name || ''
    const repo = context.payload.repository?.name || ''

    const response = await octokit.pulls.list({
      owner,
      repo,
      state: 'open'
    })

    core.debug(JSON.stringify(response))

    core.info('Democracy will be back.')
  } catch (error) {
    core.setFailed(error.message)
  }
}

// const listPullRequests = async () => {
//   const requestBody = await requestGithub({ url: pullRequestUrl + '?state=open' })

//   return JSON.parse(requestBody)
// }

// const getPullRequestsVotes = async pullRequests => {
//   const votes = {}

//   for (const pullRequest of pullRequests) {
//     // const data = await Promise.all(getPullRequest(pullRequest.number), getIssue(pullRequest.number), getLastCommit(pullRequest.number))
//     const singlePullRequest = await getPullRequest(pullRequest.number)
//     const issue = await getIssue(pullRequest.number)
//     const lastCommit = await getLastCommit(pullRequest.number)

//     const pullRequestData = {
//       updatedAt: lastCommit.commit.committer.date,
//       title: pullRequest.title,
//       mergeable: singlePullRequest.mergeable,
//     }

//     if (!validatePullRequest(pullRequestData)) {
//       continue
//     }

//     votes[pullRequest.number] = await getVoteResult(pullRequest.number)
//   }

//   return votes
// }

// const getVoteResult = async pullRequestNumber => {
//   const reactions = await listPullRequestReactions(pullRequestNumber)
//   const voters = await getOrganizationMembers()

//   let voteResult = 0
//   const voteReactionRegex = new RegExp('(\\+|-)1')

//   reactions
//     .filter(reaction => {
//       const reactionIsVote = voteReactionRegex.test(reaction.content)
//       const userHasRightToVote = voters.indexOf(reaction.user.id)

//       return reactionIsVote && userHasRightToVote
//     })
//     .map(reaction => voteResult = voteResult + parseInt(reaction.content))

//   return voteResult
// }

// const validatePullRequest = (pullRequest) => {
//   const now = moment().utc()
//   const updatedAt24hoursForward = moment(pullRequest.updatedAt).utc().add(24, 'h')
//   const pullRequestIsMature = updatedAt24hoursForward.diff(now, 'minutes') < 0
//   const pullRequestIsReadyToMerge = pullRequest.title.trim().startsWith(pullRequestReadyToMergePrefix)
//   const pullRequestIsMergeable = pullRequest.mergeable

//   return pullRequestIsMature && pullRequestIsReadyToMerge && pullRequestIsMergeable
// }

// const processPullRequest = async pullRequestsVoteResults => {
//   const voteResult = {}

//   for (const i in pullRequestsVoteResults) {
//     const pullRequestVoteResult = pullRequestsVoteResults[i]
//     if (pullRequestVoteResult >= 2) {
//       log(`Democracy has spoken. Pull Request #${i} has been voted for merge.`)
//       await mergePullRequest(i)
//       log(`Pull Request #${i} merged.`)
//     } else {
//       log(`Democracy has spoken. Pull Request #${i} has not been been voted to merge. Ignored.`)
//     }
//   }
// }

run()
