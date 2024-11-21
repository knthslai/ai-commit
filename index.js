#!/usr/bin/env node

"use strict";
import { execSync } from "child_process";
import { checkGitRepository } from "./helpers.js";
import { addGitmojiToCommitMessage } from "./gitmoji.js";
import { filterApi } from "./filterApi.js";
import { args } from "./config.js";

const prefix = args["prefix"] || "";

const makeCommit = (input) => {
  console.log("Committing Message... 🚀 ");
  try {
    execSync(`git commit -F -`, { input });
    console.log("Commit Successful! 🎉");
  } catch (error) {
    // Copy to clipboard using execSync
    execSync("pbcopy", { input }); // for macOS
    // For other platforms you might need:
    // execSync('clip', { input }); // Windows
    // execSync('xclip -selection clipboard', { input }); // Linux with xclip

    console.log("❌ Commit failed!");
    console.log("📋 Commit message has been copied to your clipboard");
    process.exit(1);
  }
};

/**
 * send prompt to ai.
 */
const sendMessage = async (input) => {
  const model = "tavernari/git-commit-message";
  const url = "http://localhost:11434/api/generate";
  const data = {
    model,
    prompt: input,
    stream: false,
  };

  const makeRequest = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseJson = await response.json();
    return responseJson.response;
  };

  try {
    console.log("Prompting -> Ollama: ", model);
    return await makeRequest();
  } catch (err) {
    console.log("Initial request failed, restarting Ollama...");
    try {
      execSync("pkill ollama && ollama start");
      console.log("Ollama restarted, retrying request...");
      return await makeRequest();
    } catch (retryErr) {
      if (retryErr.name === "AbortError") {
        throw new Error("Request timed out after 12 seconds");
      }
      throw new Error("local model issues. details:" + retryErr.message);
    }
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
