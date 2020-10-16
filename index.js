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

        core.debug(`Getting vars`);
        const token = process.env.GITHUB_TOKEN || '';
        const sha = process.env.GITHUB_SHA || '';
        const repo = github.context.repo;
        core.debug(`Token ${token}`);
        core.debug(`Repo ${repo}`);

        core.debug(`Creating octokit`);
        const octokit = new github.getOctokit(token);

        core.debug(`Getting existing tag`);
        const tag = await octokit.git.getTag({repo, finalTagValue});

        core.debug(`Existing tag ${tag}`);

        core.debug(`Pushing new tag to the repo`);
        await octokit.git.createRef({
            ...context.repo,
            ref: `refs/tags/${finalTagValue}`,
            sha: sha,
        });

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
