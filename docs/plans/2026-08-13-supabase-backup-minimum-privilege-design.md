# Supabase maintenance and backup with minimum privilege

Date: 2026-08-13

## Context

The current daily GitHub Actions workflow links the Supabase project with a personal access token, a project reference, and the database password. A Supabase personal access token carries the privileges of the user account, so storing it in a repository secret gives the workflow more authority than a database backup needs.

## Decision

Use one repository secret, `SUPABASE_DB_URL`, containing the project-specific Postgres connection string. Do not store `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, or a separate `SUPABASE_DB_PASSWORD` in GitHub.

This follows Supabase's documented automated-backup pattern: run `supabase db dump --db-url "$SUPABASE_DB_URL"` directly against the selected project.

## Workflow design

- Trigger only on a daily schedule and manual `workflow_dispatch`.
- Set job permissions to `contents: read`.
- Install a pinned Supabase CLI version rather than `latest`.
- Connect only through `SUPABASE_DB_URL`.
- Produce separate role, schema, and data dumps.
- Treat any empty required dump as a failure.
- Store the backup as a GitHub Actions artifact with 90-day retention.
- Do not commit backups to the repository.
- Do not print the connection URL, password, or environment.
- The daily database reads performed by the dumps provide real database activity; the workflow must not claim success if the connection or dump fails.

## Security boundaries

- The secret is encrypted in GitHub Actions Secrets and is never written into Git.
- Its authority is limited to the dedicated `deuda-fuera-paz-dentro` database instead of the owner's Supabase account.
- The workflow is not available on `pull_request`, so untrusted pull-request code cannot request the secret.
- Repository permissions remain read-only; artifact upload needs no repository write permission.
- Production deployment and database backup are separate operations. A push to `main` must not expose the database URL to Vercel or client-side code.

## Failure handling

- Missing secret: fail immediately with a generic message naming only `SUPABASE_DB_URL`.
- Connection or dump failure: fail the run and upload no misleading backup.
- Empty schema or data output: fail before artifact upload.
- Artifact upload failure: fail the run so it is visible in Actions.
- No retry loop that could hide persistent authentication or network failures.

## Verification

1. Validate the workflow YAML and review the diff for secret interpolation or logging.
2. Configure `SUPABASE_DB_URL` with `gh secret set` from the protected production environment file without echoing its value.
3. Run the workflow manually.
4. Confirm the run succeeds and creates non-empty role, schema, and data files in a 90-day artifact.
5. Inspect logs to confirm the database URL and password never appear.
6. Push the pending commits to `main`, verify the Vercel deployment, and run smoke checks against production routes and protected downloads.

## Explicit non-goals

- Do not store a Supabase personal access token in GitHub.
- Do not invent or configure missing Resend credentials or the deferred postal address.
- Do not weaken the private Storage bucket or expose service-role credentials to the browser.
