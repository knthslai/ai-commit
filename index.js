#!/usr/bin/env node

'use strict'
import { execSync } from "child_process";
import { checkGitRepository } from "./helpers.js";
import { addGitmojiToCommitMessage } from "./gitmoji.js";
import { filterApi } from "./filterApi.js";
import { args } from "./config.js";

const prefix = args["prefix"] || "";

const makeCommit = (input) => {
  console.log("Committing Message... 🚀 ");
  execSync(`git commit -F -`, { input });
  console.log("Commit Successful! 🎉");
};

/**
 * send prompt to ai.
 */
const sendMessage = async (input) => {
  const model = "starcoder2";
  const url = "http://localhost:11434/api/generate";
  const data = {
    model,
    prompt: input,
    stream: false,
  };
  console.log("Prompting -> Ollama: ", model);
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const responseJson = await response.json();
    const answer = responseJson.response;

    return answer;
  } catch (err) {
    throw new Error("local model issues. details:" + err.message);
  }
};

const getPromptForSingleCommit = (diff) => {
  //for less smart models, give simpler instruction.
  return (
    "Summarize this git diff into a useful, 10 words commit message with a commit type (feat, fix, docs, style, refactor, test, chore) that best matches the changes made to the code: " +
    diff
  );
};

const generateSingleCommit = async (diff) => {
  const prompt = getPromptForSingleCommit(diff);

  if (!(await filterApi({ prompt, filterFee: args["filter-fee"] })))
    process.exit(1);

  const text = await sendMessage(prompt);

  let finalCommitMessage = prefix?.length
    ? prefix + " - " + addGitmojiToCommitMessage(text)
    : addGitmojiToCommitMessage(text);

  console.log(
    `Proposed Commit:\n------------------------------\n${finalCommitMessage}\n------------------------------`
  );
  // if (args.force) {
  //   makeCommit(finalCommitMessage);
  //   return;
  // }

  // const answer = await inquirer.prompt([
  //   {
  //     type: "confirm",
  //     name: "continue",
  //     message: "Do you want to continue?",
  //     default: true,
  //   },
  // ]);

  // if (!answer.continue) {
  //   console.log("Commit aborted by user 🙅‍♂️");
  //   process.exit(1);
  // }

  makeCommit(finalCommitMessage);
};


async function generateAICommit() {
  const isGitRepository = checkGitRepository();

  if (!isGitRepository) {
    console.error("This is not a git repository 🙅‍♂️");
    process.exit(1);
  }

  const diff = execSync("git diff --staged").toString();

  // Handle empty diff
  if (!diff) {
    console.log("No changes to commit 🙅");
    console.log(
      "May be you forgot to add the files? Try git add . and then run this script again."
    );
    process.exit(1);
  }

  await generateSingleCommit(diff);
}

await generateAICommit();
