#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, resolve, relative } from "node:path";

const repoRoot = resolve(dirname(new URL(import.meta.url).pathname), "..");

const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);
const ignoredDirs = new Set([
  ".git",
  "node_modules",
  ".next",
  "playwright-report",
  "test-results",
]);

function walkMarkdownFiles(root) {
  const files = [];
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = resolve(current, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) {
          stack.push(fullPath);
        }
        continue;
      }

      if (MARKDOWN_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function isExternalLink(target) {
  return /^(https?:|mailto:|tel:|data:|javascript:)/i.test(target);
}

function resolveLinkTarget(filePath, linkTarget) {
  const withoutAnchor = linkTarget.split("#")[0].trim();
  if (!withoutAnchor) return null;

  if (withoutAnchor.startsWith("/")) {
    return resolve(repoRoot, `.${withoutAnchor}`);
  }

  return resolve(dirname(filePath), withoutAnchor);
}

function doesTargetExist(targetPath) {
  if (!targetPath) return true;
  if (existsSync(targetPath)) return true;

  if (!extname(targetPath)) {
    if (existsSync(`${targetPath}.md`)) return true;
    if (existsSync(`${targetPath}.mdx`)) return true;
    if (existsSync(resolve(targetPath, "index.md"))) return true;
    if (existsSync(resolve(targetPath, "index.mdx"))) return true;
  }

  return false;
}

function checkFileLinks(filePath) {
  const content = readFileSync(filePath, "utf8");
  const issues = [];
  const markdownLinkRegex = /\[[^\]]+\]\(([^)]+)\)/g;

  let match;
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    const rawTarget = match[1].trim();
    if (!rawTarget || isExternalLink(rawTarget) || rawTarget.startsWith("#")) continue;

    const target = resolveLinkTarget(filePath, rawTarget);
    if (!doesTargetExist(target)) {
      issues.push({
        source: relative(repoRoot, filePath),
        target: rawTarget,
      });
    }
  }

  return issues;
}

function main() {
  const markdownFiles = walkMarkdownFiles(repoRoot);
  const issues = markdownFiles.flatMap((filePath) => checkFileLinks(filePath));

  if (issues.length > 0) {
    console.error("Internal reference check failed.");
    for (const issue of issues) {
      console.error(`- ${issue.source} -> ${issue.target}`);
    }
    process.exit(1);
  }

  console.log("Internal reference check passed.");
  console.log(`- Markdown files scanned: ${markdownFiles.length}`);
}

main();