import childProcess from "child_process";
import fs from "fs";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "../../../../");

const inputPath = process.argv[2] || "docs/architecture/schema.mmd";
const inputFile = path.resolve(repoRoot, inputPath);
const outputFile = path.resolve(repoRoot, "docs/architecture/erd.svg");

try {
if (!fs.existsSync(inputFile)) {
throw new Error(`Input file not found: ${inputFile}`);
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });

const quote = (value) => `"${value.replace(/"/g, '\\"')}"`;

const command = `npx mmdc -i ${quote(inputFile)} -o ${quote(outputFile)}`;

const result = childProcess.spawnSync(command, {
cwd: repoRoot,
encoding: "utf8",
shell: true,
windowsHide: true,
});

if (result.error) {
throw result.error;
}

if (result.status !== 0) {
throw new Error(
result.stderr?.trim() ||
result.stdout?.trim() ||
`Mermaid CLI exited with status ${result.status}`
);
}

console.log("SUCCESS");
process.exit(0);
} catch (error) {
const message = error instanceof Error ? error.message : String(error);

console.error(`SYNTAX_ERROR: ${message}`);
process.exit(1);
}