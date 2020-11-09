const core = require('@actions/core')
const github = require('@actions/github')

async function run() {
    try {
        const tagValue = core.getInput('tag-value') || "test"
        let revision = core.getInput('revision-number') || 1
        console.log(`Base tag ${tagValue}`)
        const time = (new Date()).toISOString().slice(0, 10).replace(/-/g, "")
        let finalTagValue = `${tagValue}/${time}.${revision}`

        console.log(`Getting vars`)
        let token = core.getInput('github_token')
        if (!token) {
            token = "token"
        }
        console.log(`Token ${token}`)
        const sha = process.env.GITHUB_SHA || ''
        let owner
        let repo
        if (!process.env.GITHUB_REPOSITORY) {
            console.log("empty")
            owner = 'mightykingdom'
            repo = 'MKNetV2'
        } else {
            owner = github.context.repo.owner
            repo = github.context.repo.repo
        }

        console.log(`Repo ${JSON.stringify(repo)}`)

        console.log(`Creating octokit`)
        const octokit = github.getOctokit(token)


        var existingTags = await octokit.repos.listTags({
            owner,
            repo,
            per_page: 100
        });

        let filtered = existingTags.data.filter(item => item.name === finalTagValue)
        while (filtered.length > 0) {
            revision += 1
            finalTagValue = `${tagValue}/${time}.${revision}`
            filtered = existingTags.data.filter(item => item.name === finalTagValue)
        }

        console.log(`Final tag to push: ${finalTagValue}`)
        core.setOutput("final-tag-value", finalTagValue)

        console.log(`Pushing new tag to the repo`)
        await octokit.git.createRef({
            owner,
            repo,
            ref: `refs/tags/${finalTagValue}`,
            sha: sha,
        })
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()
