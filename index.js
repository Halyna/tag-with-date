const core = require('@actions/core');
const github = require('@actions/github');


// async function exec(command) {
//     let stdout = "";
//     let stderr = "";
//
//     try {
//         const options = {
//             listeners: {
//                 stdout: (data) => {
//                     stdout += data.toString();
//                 },
//                 stderr: (data) => {
//                     stderr += data.toString();
//                 },
//             },
//         };
//
//         const code = await _exec(command, undefined, options);
//
//         return {
//             code,
//             stdout,
//             stderr,
//         };
//     } catch (err) {
//         return {
//             code: 1,
//             stdout,
//             stderr,
//             error: err,
//         };
//     }
// }


async function run() {
    try {
        // `who-to-greet` input defined in action metadata file
        const tagValue = core.getInput('tag-value');
        const revision = core.getInput('revision-number');
        console.log(`Base tag ${tagValue}`);
        const time = (new Date()).toISOString().slice(0, 10).replace(/-/g, "");
        const finalTagValue = `${tagValue}/${time}.${revision}`
        core.setOutput("final-tag-value", finalTagValue);
        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2)
        console.log("Payload " + payload);
        console.log(`Final tag to push: ${finalTagValue}`);
        console.log(`Why is everything broken`);

        // const tagAlreadyExists = !!(
        //     await exec(`git tag -l "${finalTagValue}"`)
        // ).stdout.trim();
        //
        // if (tagAlreadyExists) {
        //     core.debug("This tag already exists. Skipping the tag creation.");
        //     return;
        // }

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
        // const tag = await octokit.git.getTag({repo, finalTagValue});
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
