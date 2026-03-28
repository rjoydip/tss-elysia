export const EnvProtection = async (/* { project, client, $, directory, worktree } */) => {
  return {
    "tool.execute.before": async (
      input: { tool: string },
      output: { args: { filePath: string | string[] } },
    ) => {
      if (input.tool === "read" && output.args.filePath.includes(".env")) {
        throw new Error("Do not read .env files");
      }
    },
  };
};
