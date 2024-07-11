function addGitmojiToCommitMessage(commitMessage) {
  // Define the mapping of commit types to gitmojis
  const typeToGitmoji = {
    feat: "✨ (feat): ",
    fix: "🚑 (fix): ",
    docs: "📝 (docs): ",
    style: "💄 (style): ",
    refactor: "♻️ (refactor): ",
    test: "✅ (test): ",
    chore: "🔧 (chore): ",
  };

  // iterate over each key in the typeToGitmoji object and check if the commitMessage starts with the corresponding key
  // if it does, return the corresponding gitmoji
  // if it doesn't, return the original commitMessage
  for (const key in typeToGitmoji) {
    if (commitMessage.includes(`(${key})`)) {
      return `${typeToGitmoji[key]}${commitMessage}`;
    }
  }
  for (const key in typeToGitmoji) {
    if (commitMessage.includes(` ${key} `)) {
      return `${typeToGitmoji[key]}${commitMessage}`;
    }
  }

  return typeToGitmoji.chore + commitMessage;
}

export { addGitmojiToCommitMessage }
