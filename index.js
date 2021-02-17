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
        const sha = process.env.GITHUB_SHA || ''
        let owner
        let repo
        if (!process.env.GITHUB_REPOSITORY) {
            owner = 'mightykingdom'
            repo = 'MKNetV2'
        } else {
            owner = github.context.repo.owner
            repo = github.context.repo.repo
        }

        const octokit = github.getOctokit(token, auto_traversal = true)

        let page = 1
        console.log(`Fetching existing tags`)
        let fetchResult = await octokit.repos.listTags({
            owner,
            repo,
            per_page: 100,
            page: page
        });

        let existingTags = fetchResult.data
        let link = fetchResult.headers.link
        while (link && link.includes('rel="next"')) {
            page += 1
            console.log(`Fetching existing tags page ${page}`)
            fetchResult = await octokit.repos.listTags({
                owner,
                repo,
                per_page: 100,
                page: page
            })
            link = fetchResult.headers.link
            existingTags = existingTags.concat(fetchResult.data)
        }

        console.log(`Found ${existingTags.length} existing tags`)
        let filtered = existingTags.filter(item => item.name == finalTagValue)
        while (filtered.length > 0) {
            revision += 1
            finalTagValue = `${tagValue}/${time}.${revision}`
            filtered = existingTags.filter(item => item.name == finalTagValue)
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
