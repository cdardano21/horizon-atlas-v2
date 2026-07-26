import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const sprintArg = args.find((arg) => arg.startsWith("--sprint="));
const sprint = sprintArg ? sprintArg.split("=")[1] : "SPRINT_1";

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    const rendered = [command, ...commandArgs].join(" ");
    throw new Error(`Command failed: ${rendered}`);
  }
}

function main() {
  console.log(`Starting Wave 1 sprint cycle for ${sprint}`);

  run("npm", ["run", "expansion:wave1:applyTemplates", "--", `--sprint=${sprint}`]);
  run("npm", ["run", "expansion:wave1:sprintMerge"]);
  run("npm", ["run", "expansion:wave1:sprintPartialApply", "--", `--sprint=${sprint}`]);
  run("npm", ["run", "expansion:wave1:preflightStrict"]);

  console.log(`Completed Wave 1 sprint cycle for ${sprint}`);
}

main();
