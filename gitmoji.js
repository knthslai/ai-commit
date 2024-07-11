function addGitmojiToCommitMessage(preCommitMessage) {
  const commitMessage = preCommitMessage.trim();
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

  function sliceIfStartsWith(str, slice) {
    return str.startsWith(slice) ? str.slice(slice.length + 1) : str;
  }

  // iterate over each key in the typeToGitmoji object and check if the commitMessage starts with the corresponding key
  // if it does, return the corresponding gitmoji
  // if it doesn't, return the original commitMessage
  for (const key in typeToGitmoji) {
    if (commitMessage.includes(`(${key})`)) {
      return `${typeToGitmoji[key]}${sliceIfStartsWith(commitMessage, key)}`;
    }
  }

  for (const key in typeToGitmoji) {
    const capitalizedKey = key.slice(0, 1).toUpperCase() + key.slice(1);
    if (commitMessage.includes(capitalizedKey)) {
      return `${typeToGitmoji[key]}${sliceIfStartsWith(
        commitMessage,
        capitalizedKey
      )}`;
    }
  }

  for (const key in typeToGitmoji) {
    // check if the commitMessage contains the full key
    if (commitMessage.includes(key)) {
      return `${typeToGitmoji[key]}${sliceIfStartsWith(commitMessage, key)}`;
    }
  }

  return typeToGitmoji.chore + commitMessage;
}

export { addGitmojiToCommitMessage };
