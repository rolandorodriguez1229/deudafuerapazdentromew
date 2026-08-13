# Supabase Minimum-Privilege Backup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the account-wide Supabase token in GitHub Actions with one project-specific database URL, verify the daily backup, then publish and smoke-test the pending production release.

**Architecture:** GitHub Actions connects directly to the dedicated Postgres database through the Supabase session pooler and runs pinned CLI dump commands. The only GitHub secret is `SUPABASE_DB_URL`; the workflow has read-only repository permissions and stores backups as 90-day artifacts. Deployment remains independent: validated commits are pushed to `main`, which Vercel deploys.

**Tech Stack:** GitHub Actions, Supabase CLI 2.114.0, Postgres connection URL, Node.js static verifier, Git, Vercel.

---

### Task 1: Add a static security verifier for the workflow

**Files:**
- Create: `scripts/verificar-workflow-supabase.mjs`
- Test: `.github/workflows/mantener-vivo-y-respaldar.yml`

**Step 1: Create the verifier**

Create `scripts/verificar-workflow-supabase.mjs` with:

```js
import { readFileSync } from "node:fs";

const path = ".github/workflows/mantener-vivo-y-respaldar.yml";
const workflow = readFileSync(path, "utf8");
const problems = [];

const required = [
  "permissions:\n  contents: read",
  "SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}",
  'npx --yes supabase@2.114.0 db dump --db-url "$SUPABASE_DB_URL"',
  "actions/checkout@11d5960a326750d5838078e36cf38b85af677262",
  "actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02",
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
```

**Step 2: Run the verifier against the current workflow**

Run:

```bash
node scripts/verificar-workflow-supabase.mjs
```

Expected: FAIL, listing the old personal-token secrets and the missing minimum-privilege fragments.

**Step 3: Commit the failing verifier**

```bash
git add scripts/verificar-workflow-supabase.mjs
git commit -m "Verifica privilegio mínimo del respaldo Supabase"
```

### Task 2: Replace the workflow with the one-secret design

**Files:**
- Modify: `.github/workflows/mantener-vivo-y-respaldar.yml`
- Test: `scripts/verificar-workflow-supabase.mjs`

**Step 1: Replace the workflow**

Use this complete workflow:

```yaml
name: Supabase — actividad diaria y respaldo

on:
  schedule:
    - cron: "12 9 * * *"
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: supabase-mantenimiento
  cancel-in-progress: false

jobs:
  mantener:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}
    steps:
      - name: Validar configuración
        shell: bash
        run: |
          set -euo pipefail
          test -n "${SUPABASE_DB_URL:-}" || {
            echo "Falta el secreto SUPABASE_DB_URL"
            exit 1
          }

      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4

      - name: Respaldar roles, esquema y datos
        shell: bash
        run: |
          set -euo pipefail
          mkdir -p respaldo
          npx --yes supabase@2.114.0 db dump --db-url "$SUPABASE_DB_URL" -f respaldo/roles.sql --role-only
          npx --yes supabase@2.114.0 db dump --db-url "$SUPABASE_DB_URL" -f respaldo/esquema.sql
          npx --yes supabase@2.114.0 db dump --db-url "$SUPABASE_DB_URL" -f respaldo/datos.sql --data-only --use-copy
          test -s respaldo/roles.sql || { echo "El volcado de roles salió vacío"; exit 1; }
          test -s respaldo/esquema.sql || { echo "El volcado de esquema salió vacío"; exit 1; }
          test -s respaldo/datos.sql || { echo "El volcado de datos salió vacío"; exit 1; }

      - name: Guardar respaldo fuera de Supabase
        uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4
        with:
          name: respaldo-${{ github.run_number }}
          path: respaldo/
          retention-days: 90
          if-no-files-found: error

      - name: Resumen correcto
        if: success()
        run: |
          {
            echo "### Supabase — mantenimiento diario"
            echo ""
            echo "- Conexión y lectura diaria completadas."
            echo "- Roles, esquema y datos guardados en el artefacto \`respaldo-${{ github.run_number }}\`."
            echo "- Retención: 90 días."
          } >> "$GITHUB_STEP_SUMMARY"

      - name: Resumen de fallo
        if: failure()
        run: |
          {
            echo "### Supabase — mantenimiento fallido"
            echo ""
            echo "La conexión, el volcado o el artefacto falló. Revisa este run; no se declara respaldo exitoso."
          } >> "$GITHUB_STEP_SUMMARY"
```

**Step 2: Run the static verifier**

```bash
node scripts/verificar-workflow-supabase.mjs
```

Expected: `Workflow Supabase: privilegio mínimo verificado`.

**Step 3: Check the diff**

```bash
git diff --check
git diff -- .github/workflows/mantener-vivo-y-respaldar.yml scripts/verificar-workflow-supabase.mjs
```

Expected: no whitespace errors; no reference to `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, or `SUPABASE_DB_PASSWORD` in the workflow.

**Step 4: Commit**

```bash
git add .github/workflows/mantener-vivo-y-respaldar.yml
git commit -m "Reduce privilegios del respaldo Supabase"
```

### Task 3: Update production documentation

**Files:**
- Modify: `docs/GPS-SETUP.md` under `3-quater. Que el proyecto no se duerma, y respaldos fuera de Supabase`

**Step 1: Replace the three-secret instructions**

Document that the workflow requires only:

```markdown
| Secreto | De dónde sale |
|---|---|
| `SUPABASE_DB_URL` | URL Postgres del session pooler del proyecto dedicado, con `sslmode=require`; se guarda únicamente como GitHub Actions Secret. |

No se guarda `SUPABASE_ACCESS_TOKEN`: tiene los privilegios de la cuenta y no es necesario para respaldar una sola base. El flujo usa `supabase db dump --db-url`, de acuerdo con la guía oficial de respaldos de Supabase.
```

Also state that the workflow has `contents: read`, never runs on pull requests, uses immutable action SHAs, and never prints the URL.

**Step 2: Verify documentation and forbidden references**

```bash
grep -n "SUPABASE_DB_URL" docs/GPS-SETUP.md
grep -nE "SUPABASE_ACCESS_TOKEN|SUPABASE_PROJECT_REF|SUPABASE_DB_PASSWORD" .github/workflows/mantener-vivo-y-respaldar.yml && exit 1 || true
node scripts/verificar-workflow-supabase.mjs
```

Expected: the document contains `SUPABASE_DB_URL`; the workflow contains none of the three broad/old secret names; verifier passes.

**Step 3: Commit**

```bash
git add docs/GPS-SETUP.md
git commit -m "Documenta el respaldo Supabase de un solo secreto"
```

### Task 4: Create the project-scoped GitHub secret without displaying it

**Files:**
- Read only: `.env.produccion.local`
- Read only: `supabase/.temp/pooler-url`
- External secret: GitHub Actions `SUPABASE_DB_URL`

**Step 1: Confirm the source files are protected**

```bash
test "$(stat -c %a .env.produccion.local)" = "600"
test -s supabase/.temp/pooler-url
```

Expected: both commands succeed; do not print either file.

**Step 2: Confirm an authenticated GitHub secret-writing path**

Prefer an already authenticated GitHub CLI. If `gh` is unavailable, install it from GitHub's official package repository and use an interactive `gh auth login`; do not extract, print, or repurpose a Git credential. Stop only if interactive authorization is required.

```bash
gh auth status --hostname github.com
```

Expected: authenticated as the owner with access to `rolandorodriguez1229/deudafuerapazdentromew`.

**Step 3: Build the URL in memory and pipe it directly into GitHub Secrets**

Run from the repository root:

```bash
python3 - <<'PY' | gh secret set SUPABASE_DB_URL --repo rolandorodriguez1229/deudafuerapazdentromew
from pathlib import Path
from urllib.parse import quote, urlsplit, urlunsplit

values = {}
for raw in Path('.env.produccion.local').read_text().splitlines():
    line = raw.strip()
    if not line or line.startswith('#') or '=' not in line:
        continue
    key, value = line.split('=', 1)
    values[key] = value.strip().strip('"').strip("'")

password = values['SUPABASE_DB_PASSWORD']
pooler = urlsplit(Path('supabase/.temp/pooler-url').read_text().strip())
username = quote(pooler.username or '', safe='')
netloc = f"{username}:{quote(password, safe='')}@{pooler.hostname}:{pooler.port}"
query = 'sslmode=require'
print(urlunsplit((pooler.scheme, netloc, pooler.path, query, '')), end='')
PY
```

Expected: GitHub confirms that `SUPABASE_DB_URL` was set. The URL must never be printed or saved to a temporary file.

**Step 4: Verify only the secret name**

```bash
gh secret list --repo rolandorodriguez1229/deudafuerapazdentromew | cut -f1
```

Expected: includes `SUPABASE_DB_URL`. Do not inspect the value.

### Task 5: Validate the release locally

**Files:**
- Test: entire repository

**Step 1: Run security and repository checks**

```bash
node scripts/verificar-workflow-supabase.mjs
git diff --check
npm test
npm run lint
npm run build
```

Expected: all commands exit 0. Record existing unrelated warnings separately; do not hide failures.

**Step 2: Verify Git state and destination**

```bash
git status --short --branch
git remote get-url origin
git log --oneline origin/main..HEAD
```

Expected: clean worktree, branch `main`, destination `rolandorodriguez1229/deudafuerapazdentromew`, and the reviewed pending commits only.

### Task 6: Publish, run the backup, and verify production

**Files:**
- External: GitHub `main`
- External: GitHub Actions workflow `mantener-vivo-y-respaldar.yml`
- External: Vercel production deployment

**Step 1: Push the validated branch**

```bash
git push origin main
```

Expected: `origin/main` advances to local `HEAD`; Vercel starts a production deployment.

**Step 2: Trigger and watch the backup manually**

```bash
gh workflow run mantener-vivo-y-respaldar.yml --repo rolandorodriguez1229/deudafuerapazdentromew --ref main
gh run watch --repo rolandorodriguez1229/deudafuerapazdentromew --exit-status
```

Expected: run succeeds.

**Step 3: Verify the artifact without exposing data**

List the latest run and artifact metadata. Confirm the artifact is non-empty and retention is 90 days. Do not print SQL contents because the data dump may contain personal information.

**Step 4: Verify Vercel production**

Confirm the deployment for `main` is ready, then run read-only smoke checks against:

```text
https://www.deudafuerapazdentro.com/
https://www.deudafuerapazdentro.com/diagnostico
https://www.deudafuerapazdentro.com/lista-de-espera
https://www.deudafuerapazdentro.com/descargas
https://www.deudafuerapazdentro.com/reembolsos
```

Expected: public routes respond successfully; `/descargas` rejects missing/invalid authorization safely; no private object is publicly listable or downloadable without a valid signed URL.

**Step 5: Report genuine remaining blockers**

Report `RESEND_API_KEY`, `EMAIL_FROM`, and the deferred `EMAIL_POSTAL_ADDRESS` only if still absent. Do not invent values and do not block the safe backup or deployment on them.
