const core = require('@actions/core');
const github = require('@actions/github');


async function exec(command) {
    let stdout = "";
    let stderr = "";

    try {
        const options = {
            listeners: {
                stdout: (data) => {
                    stdout += data.toString();
                },
                stderr: (data) => {
                    stderr += data.toString();
                },
            },
        };

        const code = await _exec(command, undefined, options);

        return {
            code,
            stdout,
            stderr,
        };
    } catch (err) {
        return {
            code: 1,
            stdout,
            stderr,
            error: err,
        };
    }
}


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
        // const payload = JSON.stringify(github.context.payload, undefined, 2)
        console.log(`Final tag to push: ${finalTagValue}`);

        const tagAlreadyExists = !!(
            await exec(`git tag -l "${finalTagValue}"`)
        ).stdout.trim();

        if (tagAlreadyExists) {
            core.debug("This tag already exists. Skipping the tag creation.");
            return;
        }

        core.debug(`Pushing new tag to the repo`);

        const octokit = new GitHub(core.getInput("github_token"));
        await octokit.git.createRef({
            ...context.repo,
            ref: `refs/tags/${finalTagValue}`,
            sha: GITHUB_SHA,
        });

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
