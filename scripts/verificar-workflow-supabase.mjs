import { readFileSync } from "node:fs";

const path = ".github/workflows/mantener-vivo-y-respaldar.yml";
const workflow = readFileSync(path, "utf8");
const problems = [];

const required = [
  "permissions:\n  contents: read",
  "SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}",
  'npx --yes supabase@2.114.0 db dump --db-url "$SUPABASE_DB_URL"',
  "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1",
  "actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a",
  "retention-days: 90",
  "workflow_dispatch:",
  "schedule:",
];

for (const fragment of required) {
  if (!workflow.includes(fragment)) problems.push(`Falta: ${fragment}`);
}

for (const forbidden of [
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_PROJECT_REF",
  "SUPABASE_DB_PASSWORD",
  "pull_request:",
  "version: latest",
]) {
  if (workflow.includes(forbidden)) problems.push(`Prohibido: ${forbidden}`);
}

const secretReferences = [...workflow.matchAll(/secrets\.([A-Z0-9_]+)/g)].map((m) => m[1]);
if (secretReferences.length !== 1 || secretReferences[0] !== "SUPABASE_DB_URL") {
  problems.push(`Secretos inesperados: ${secretReferences.join(", ") || "ninguno"}`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log("Workflow Supabase: privilegio mínimo verificado");
