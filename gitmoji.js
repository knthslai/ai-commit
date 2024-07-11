function addGitmojiToCommitMessage(commitMessage) {
  // Define the mapping of commit types to gitmojis
  const typeToGitmoji = {
    refactor: "♻️ (refactor): ",
    style: "💄 (style): ",
    chore: "🔧 (chore): ",
    feat: "✨ (feat): ",
    docs: "📝 (docs): ",
    test: "✅ (test): ",
    fix: "🚑 (fix): ",
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
    // check if the commitMessage contains the full key
    if (commitMessage.includes(/(\s|^)(${key})/)) {
      return `${typeToGitmoji[key]}${commitMessage}`;
    }
  }

  return typeToGitmoji.chore + commitMessage;
}

export { addGitmojiToCommitMessage }
