const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const tagValue = core.getInput('tag-value');
        const revision = core.getInput('revision-number');
        console.log(`Base tag ${tagValue}`);
        const time = (new Date()).toISOString().slice(0, 10).replace(/-/g, "");
        const finalTagValue = `${tagValue}/${time}.${revision}`
        core.setOutput("final-tag-value", finalTagValue);
        // const payload = JSON.stringify(github.context.payload, undefined, 2)
        // console.log("Payload " + payload);
        console.log(`Final tag to push: ${finalTagValue}`);

        console.log(`Getting vars`);
        const token = core.getInput('github_token');
        const sha = process.env.GITHUB_SHA || '';
        const owner = github.context.repo.owner;
        const repo = github.context.repo.repo;
        console.log(`Token ${token}`);
        console.log(`Repo ${JSON.stringify(repo)}`);

        console.log(`Creating octokit`);
        const octokit = github.getOctokit(token);

        // console.log(`Getting existing tag`);
        // const tag = await octokit.git.getTag({owner, repo, finalTagValue});
        //
        // console.log(`Existing tag ${tag}`);

        console.log(`Pushing new tag to the repo`);
        await octokit.git.createRef({
            owner,
            repo,
            ref: `refs/tags/${finalTagValue}`,
            sha: sha,
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
