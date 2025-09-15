Dynamic Boilerplate Generator — README & PRD
Summary

This document is a detailed Product Requirements Document (PRD) and developer README in Markdown format. It describes a system that generates ready-to-use project repositories from a base preset and selected feature modules. It is written for implementation by developers or by an AI assistant (for example: Claude, Cursor) to implement end-to-end.

Contents:

Product overview and goals

High-level architecture and components

Data models and module metadata format

Preset and module repository layouts

Generated project layout

Detailed assembler algorithm and example TypeScript implementation

API contract (HTTP)

CI / testing / verification steps

Security, secrets, and GitHub integration

Developer guidelines for creating modules

Roadmap, milestones, and acceptance criteria

Troubleshooting and operational notes

1. Goals and non-goals
1.1 Goals

Provide a deterministic, modular generator that assembles a new project from:

a base preset (framework scaffold)

a set of selected modules (feature folders)

Ensure generated projects are runnable (install dependencies, start).

Support:

Download as ZIP

Push to GitHub (user account or organization)

Allow simple module metadata (deps, envs, inject points).

Provide hooks for customization and post-install operations.

Allow future use of LLMs for advanced merging/conflict resolution and docs generation.

1.2 Non-goals (initial MVP)

LLM-based freeform code generation for core assembly (do not rely on LLM to decide merges).

Support all languages and frameworks initially — start with one preset (NestJS).

Preserve module commit history (no subtrees) in MVP.

2. High-level architecture

Components:

Frontend (UI)

Preset selector

Module checkbox list

Inputs for projectName, visibility, GitHub push options

Preview (tree & package.json)

Backend API (Assembler Service)

Accepts generation requests

Validates modules, runs assembler, returns ZIP or GitHub URL

Template repository (boiler-templates)

presets/<preset>/base/

presets/<preset>/modules/<module>/

Each module has files/ and meta.json

Worker/Queue

Optional queue (BullMQ, RabbitMQ) to process generation tasks

Storage

Temporary storage (local / ephemeral) or S3 for ZIPs

GitHub integration

OAuth or GitHub App for pushing repos

Optional LLM integration

For conflict resolution, README customization, or code polishing

Text representation of architecture:

User (UI) --> Backend API --> Queue --> Worker (Assembler) --> Storage / GitHub
                               ^
                               |
                          boiler-templates (git)

3. Preset and module repository layouts
3.1 Top-level boiler-templates layout
boiler-templates/
├─ presets/
│  ├─ nestjs-base/
│  │  ├─ base/                 # base project files (no feature modules)
│  │  └─ modules/
│  │     ├─ signup/
│  │     │  ├─ files/
│  │     │  └─ meta.json
│  │     ├─ signin/
│  │     │  ├─ files/
│  │     │  └─ meta.json
│  │     ├─ gmail/
│  │     │  ├─ files/
│  │     │  └─ meta.json
│  │     └─ google-calendar/
│  │        ├─ files/
│  │        └─ meta.json
│  └─ nextjs-frontend/         # future preset
├─ scaffolding-scripts/
└─ docs/

3.2 Module structure (per module)
modules/<module>/
├─ files/                       # the exact file tree to copy into generated project (template-able)
│  └─ src/...
├─ meta.json                    # metadata describing deps, env, inject points, scripts
├─ README.module.md (optional)  # module-specific developer notes

4. Module meta.json format (schema)

meta.json should be JSON and contain at least the following keys.

Example:

{
  "name": "gmail",
  "description": "Gmail integration (OAuth2 + Gmail API)",
  "deps": {
    "googleapis": "^110.0.0"
  },
  "devDeps": {
    "@types/googleapis": "^110.0.0"
  },
  "env": [
    "GMAIL_CLIENT_ID",
    "GMAIL_CLIENT_SECRET",
    "GMAIL_REDIRECT_URI"
  ],
  "filesPath": "files",
  "conflicts": [],
  "inject": {
    "src/app.module.ts": {
      "import": ["import { GmailModule } from './integrations/providers/gmail/gmail.module';"],
      "register": ["GmailModule"]
    }
  },
  "postInstall": [
    "scripts/module-setup.js"
  ]
}


Field explanations:

name: unique module name.

description: short description.

deps / devDeps: key-value pairs for package.json.

env: list of required environment variable names.

filesPath: relative path inside the module folder where files live (default: files).

conflicts: list of other modules that cannot be selected together.

inject: mapping of target files to import lines and register entries (used with placeholder markers).

postInstall: scripts or commands to run after assembly (relative to module folder).

5. Generated project example layout

This is the project structure the assembler will produce for the default NestJS preset.

my-project/
├─ .github/
│  └─ workflows/
│     └─ ci.yml
├─ .env.example
├─ README.md
├─ package.json
├─ tsconfig.json
├─ src/
│  ├─ main.ts
│  ├─ app.module.ts
│  ├─ app.controller.ts
│  ├─ auth/
│  ├─ users/
│  └─ integrations/
│     └─ providers/
│        ├─ gmail/
│        └─ google-calendar/
└─ meta.json


meta.json in generated project (auto-created) example:

{
  "generatedAt": "2025-09-15T12:00:00Z",
  "preset": "nestjs-base",
  "modules": ["signup","signin","gmail"],
  "envRequired": ["DATABASE_URL","JWT_SECRET","GMAIL_CLIENT_ID","GMAIL_CLIENT_SECRET"]
}

6. Injection markers / placeholders (how modules register themselves)

Design base files to include explicit placeholders to keep merging deterministic.

Example src/app.module.ts (base):

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
// MODULE_IMPORTS_PLACEHOLDER

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    // MODULE_REGISTER_PLACEHOLDER
  ],
  controllers: [],
  providers: []
})
export class AppModule {}


Assembler will:

Insert import lines at // MODULE_IMPORTS_PLACEHOLDER (prepend or replace depending on strategy).

Insert module entries (e.g. GmailModule,) at // MODULE_REGISTER_PLACEHOLDER.

7. Assembler algorithm (step-by-step)

High-level steps the assembler (worker) takes upon a generation request:

Validate request payload (preset exists, modules exist).

Create an isolated working directory (temp dir or tenant-specific folder).

Copy presets/<preset>/base/ into working directory — apply templating (projectName, author, ports).

For each selected module:

Load meta.json

Validate conflicts (fail fast if conflict)

Copy module files/ into working directory. Use a deterministic merge policy for conflicts:

If file does not exist: copy

If file exists: apply merging strategy (overwrite, append, or create .conflict)

Merge meta.deps and meta.devDeps into the cumulative package.json

Aggregate env into meta.json for the generated project

Apply inject instructions:

Add import lines to target files with marker // MODULE_IMPORTS_PLACEHOLDER

Add registrations (symbols) in arrays with marker // MODULE_REGISTER_PLACEHOLDER

Run postInstall scripts if specified (optionally in sandbox)

Write final merged package.json to working directory.

Write generated project meta.json.

Optionally run npm ci / pnpm install (configurable).

Produce output:

ZIP file to download (store and provide URL)

OR create a Git repository and push generated code (GitHub App or user token).

Return response with location (zip URL or GitHub repo URL), required env list, and next steps.

8. Example TypeScript assembler (concise and explained)

This example is the main logic condensed (adapted for README). Keep or adapt the full implementation in your codebase.

// assembleProject.ts (concise)
// Note: This is an illustrative snippet. Use the earlier longer implementation for production.

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import globby from 'globby';
import Handlebars from 'handlebars';
import simpleGit from 'simple-git';
import { Octokit } from '@octokit/rest';

type ModuleMeta = { /* as earlier schema */ };

async function copyAndRender(srcDir: string, destDir: string, ctx: Record<string, any>) {
  const files = await globby(['**/*', '**/.*'], { cwd: srcDir, dot: true, onlyFiles: true });
  for (const f of files) {
    const src = path.join(srcDir, f);
    const dest = path.join(destDir, f);
    await fs.ensureDir(path.dirname(dest));
    const text = await fs.readFile(src, 'utf8');
    const rendered = Handlebars.compile(text)(ctx);
    await fs.writeFile(dest, rendered, 'utf8');
  }
}

async function assembleProject(opts: {
  presetPath: string;
  modules: string[];
  ctx?: Record<string, any>;
  outputDir?: string;
}) {
  const { presetPath, modules, ctx = {}, outputDir } = opts;
  const workDir = outputDir ?? path.join(os.tmpdir(), `generated-${Date.now()}`);
  await fs.ensureDir(workDir);

  // copy base
  await copyAndRender(path.join(presetPath, 'base'), workDir, ctx);

  // load base package.json
  const basePkgPath = path.join(workDir, 'package.json');
  const basePkg = (await fs.pathExists(basePkgPath)) ? await fs.readJson(basePkgPath) : {};

  let mergedPkg = { ...basePkg };
  const envSet = new Set<string>();

  for (const m of modules) {
    const modRoot = path.join(presetPath, 'modules', m);
    const meta = await fs.readJson(path.join(modRoot, 'meta.json'));
    // conflict checks omitted here for brevity
    const filesDir = path.join(modRoot, meta.filesPath || 'files');
    if (await fs.pathExists(filesDir)) {
      await copyAndRender(filesDir, workDir, ctx);
    }
    Object.assign(mergedPkg.dependencies ??= {}, meta.deps ?? {});
    Object.assign(mergedPkg.devDependencies ??= {}, meta.devDeps ?? {});
    (meta.env ?? []).forEach(e => envSet.add(e));
    // inject imports / registrations:
    if (meta.inject) {
      for (const [target, ins] of Object.entries(meta.inject)) {
        const targetPath = path.join(workDir, target);
        let content = await fs.readFile(targetPath, 'utf8');
        if (ins.import) {
          content = content.replace('// MODULE_IMPORTS_PLACEHOLDER', ins.import.join('\n') + '\n// MODULE_IMPORTS_PLACEHOLDER');
        }
        if (ins.register) {
          content = content.replace('// MODULE_REGISTER_PLACEHOLDER', ins.register.map(s => `${s},`).join('\n') + '\n// MODULE_REGISTER_PLACEHOLDER');
        }
        await fs.writeFile(targetPath, content, 'utf8');
      }
    }
  }

  // write merged package.json
  await fs.writeJson(path.join(workDir, 'package.json'), mergedPkg, { spaces: 2 });

  // write meta.json with env
  await fs.writeJson(path.join(workDir, 'meta.json'), {
    generatedAt: new Date().toISOString(),
    modules,
    envRequired: Array.from(envSet)
  }, { spaces: 2 });

  return { outputDir: workDir };
}


Notes:

Use ts-morph for robust AST-based injection (recommended for TypeScript projects).

The above code uses simple string replacement for placeholders.

9. HTTP API contract
9.1 Endpoint: POST /api/generate

Request payload (JSON):

{
  "preset": "nestjs-base",
  "modules": ["signup","signin","gmail","google-calendar"],
  "projectName": "acme-backend",
  "author": "dev@example.com",
  "output": {
    "type": "zip",            // "zip" | "github"
    "github": {               // required if type == "github"
      "owner": "my-org-or-user",
      "repoName": "acme-backend",
      "authMethod": "oauth"   // or "github_app"
    }
  },
  "options": {
    "runInstall": false,
    "nodeVersion": "18"
  }
}


Response (success):

{
  "status": "queued",
  "taskId": "task-abc123",
  "message": "Generation started"
}


Alternate immediate-response mode (synchronous):

{
  "status": "success",
  "outputUrl": "https://.../acme-backend.zip",
  "repoUrl": null,
  "envRequired": ["DATABASE_URL","JWT_SECRET","GMAIL_CLIENT_ID"]
}


Error response example:

{
  "status": "error",
  "error": "Module conflict: gmail conflicts with custom-gmail"
}

9.2 Endpoint: GET /api/task/:taskId

Returns status of generation task and final artifact link.

10. GitHub integration best practices

Options:

GitHub OAuth (user token)

Pros: quick to implement for single-user scenarios

Cons: tokens are long-lived unless implemented with short-lived tokens; requires storing token or immediate use

GitHub App (recommended)

Use GitHub App to create repositories on behalf of installations

Use JWT for authentication to get installation access tokens (short-lived)

Better for org installs and enterprise

Deploy keys

Could be used to push to a repo if repo is pre-created

Security notes:

Do not store user GH tokens in plaintext. If storing, encrypt at rest and rotate.

Prefer ephemeral tokens (GitHub App installation tokens).

Use least-privilege scopes (repo creation only).

Provide a UI flow to request permissions and explicitly ask users where the repo should be created.

Push flow (GitHub App recommended):

Create repo via GitHub REST API (with private: true if user desires).

In local workingDir: git init, git add ., git commit -m "Initial commit".

Add remote and push (git push -u origin main) using temporary credentials.

11. Security, secrets, and environment variables

Required env variables per module must not be pushed to repo.

Generate .env.example (not .env) with variable names and short comments.

If creating repo and user wants secrets set in GitHub Actions / repo secrets, use GitHub Secrets API (only with a GitHub App with permission).

Post-install scripts should never require secrets to run; if they do, warn the user.

Sanitize module content: modules should not contain hard-coded secrets, private keys, or tokens.

Rate limiting and quotas: enforce per-user rate limits for generation.

12. Developer guidelines for creating modules

Checklist for module authors:

Keep module self-contained under files/. Files should be placed in target position relative to project root.

Use placeholders for dynamic values: {{projectName}}, {{author}}, {{port}}.

Do not modify unknown base files; instead, use inject and placeholder markers.

Provide meta.json with deps, devDeps, env, inject, and postInstall.

Avoid changing the same base file as other modules; if unavoidable, document conflict behavior in meta.json.conflicts.

Include unit tests (optional) and a README.module.md demonstrating how the module works.

Keep code style consistent with the preset (e.g., lint rules).

13. Testing & verification plan

Unit tests

Validate meta.json schema

Validate merge logic of package.json merging

Validate injection logic (markers replaced correctly)

Integration tests

Generate a project with a set of modules, then run:

npm ci (or pnpm install)

npm run build (if available)

npm run test (if module includes tests)

These should run in CI or sandboxed container to avoid unsafe execution.

Smoke tests

Start the generated app in a detached process and check HTTP health endpoint (/health or /).

End-to-end tests (optional)

Full flow: user selects modules in UI, generate, push to GitHub, clone, install and run automated tests.

CI example (GitHub Actions snippet):

name: Assembler Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install
        run: npm ci
      - name: Unit tests
        run: npm run test --silent

14. Monitoring, metrics, and logging

Important metrics:

generations_total (counter)

generation_success / generation_failed

average_generation_time_seconds

active_generations (gauge)

templates_used (per preset/module)

GitHub push success/fail counts

Disk usage for temp storage

Logging:

Detailed error logs for failed merges and missing inject markers.

Store a generation audit record: user, preset, modules, timestamp, taskId, artifact location, push result.

Alerting:

Alert on high failure rate, disk exhaustion, or repeated rate-limit rejections from GitHub.

15. Roadmap and milestones
Milestone 0 — MVP (2–4 weeks)

Implement boiler-templates with nestjs-base/base and modules: signup, signin, gmail, google-calendar.

Implement assembler with:

copyAndRender for files

package.json merging

inject at placeholders

env aggregation and meta.json generation

Synchronous ZIP output

Simple frontend: select preset, checkboxes, download zip

Unit and integration tests for assembler

Acceptance criteria:

Generated project installs and starts (npm ci && npm run start:dev) in > 80% of runs for default modules.

CI runs tests for assembler logic.

Milestone 1 — GitHub push + queue (weeks 4–8)

Add GitHub OAuth option and GitHub App option

Implement worker queue for generation

Add push-to-github flow

Implement basic UI preview (file tree, package.json)

Acceptance criteria:

Repo can be created in user account and pushed with no long-lived tokens stored.

UI shows preview and provides repo link after push.

Milestone 2 — Robust merging, AST injection, module marketplace (weeks 8–16)

Implement ts-morph AST-based injection for TypeScript files

Create module upload flow (private marketplace)

Add CI templates and Dockerfile generation option

Add LLM-based conflict resolution (optional, gated)

Acceptance criteria:

Injection via AST handles imports and array registration without string markers.

Marketplace supports private modules for teams.

16. How and where to use LLMs

Allowed roles for LLM (non-critical):

Generate module README content tailored to selected modules.

Suggest conflict resolutions when two modules touch the same file (present suggestions to user).

Generate tailored onboarding instructions and README.md for generated project.

Assist in customizing modules based on natural-language requests (e.g., "use phone instead of email for signup") — but require user verification and tests.

Do NOT let LLM:

Decide which files to copy/merge as the primary mechanism in MVP.

Make changes to critical security-sensitive code without human review.

Be the single source of truth for dependency resolution (prefer deterministic semver selection).

17. API examples and sample payloads
Example synchronous request (download ZIP)

Request:

POST /api/generate
Content-Type: application/json

{
  "preset": "nestjs-base",
  "modules": ["signup","signin","gmail"],
  "projectName": "acme-backend",
  "output": {"type": "zip"},
  "ctx": {"author": "dev@company.com"}
}


Success response:

{
  "status": "success",
  "outputUrl": "https://storage.example.com/generation/abc123/acme-backend.zip",
  "envRequired": ["DATABASE_URL","JWT_SECRET","GMAIL_CLIENT_ID"]
}

Example async request (push to GitHub)

Request:

{
  "preset": "nestjs-base",
  "modules": ["signup","signin","gmail"],
  "projectName": "acme-backend",
  "output": {
    "type": "github",
    "github": {
      "owner": "my-org",
      "repoName": "acme-backend",
      "authMethod": "github_app"
    }
  },
  "ctx": {}
}


Response:

{
  "status": "queued",
  "taskId": "task-xyz"
}

18. Developer setup and run instructions (local dev)

Clone boiler-templates repo.

Clone assembler service repo.

Install dependencies:

cd assembler-service
npm install


Create .env with:

PORT=3000
GITHUB_TOKEN=ghp_... # for dev only
STORAGE_PATH=./tmp/output


Run the server:

npm run build
npm start
# or for dev
npm run dev


Use curl or Postman to POST to /api/generate.

To test locally:

Use output.type=zip to avoid GitHub integration during early dev.

Inspect outputDir or ZIP file to review generated project.

19. Troubleshooting and common errors

Missing marker // MODULE_IMPORTS_PLACEHOLDER

Cause: module tried to inject imports but base file lacks marker.

Fix: Update base file to include marker or change meta.inject to target a valid file.

Package.json dependency conflicts

Cause: two modules require different major versions.

Fix: implement semver resolution logic (choose highest compatible or prompt user).

PostInstall script fails

Cause: script assumes available env vars or local tools.

Fix: document required envs and change scripts not to depend on secrets.

GitHub push fails (permission)

Cause: token lacks repo creation permission or GitHub App not installed.

Fix: use GitHub App or request correct OAuth scopes from the user.

Large binary files in module files

Cause: vendor binaries or images were added to files/.

Fix: avoid adding large binaries into files/, store them elsewhere or in assets.

20. Appendix: Example meta.json for Gmail module
{
  "name": "gmail",
  "description": "Gmail integration (OAuth2 + Gmail API)",
  "deps": {
    "googleapis": "^110.0.0"
  },
  "devDeps": {},
  "env": [
    "GMAIL_CLIENT_ID",
    "GMAIL_CLIENT_SECRET",
    "GMAIL_REDIRECT_URI",
    "GMAIL_REFRESH_TOKEN"
  ],
  "filesPath": "files",
  "conflicts": [],
  "inject": {
    "src/app.module.ts": {
      "import": ["import { GmailModule } from './integrations/providers/gmail/gmail.module';"],
      "register": ["GmailModule"]
    }
  },
  "postInstall": ["scripts/setup-gmail.js"]
}

21. Acceptance criteria (final)

The system can generate a NestJS project with selected modules signup, signin, gmail that:

Produces a ZIP file containing a runnable project.

npm ci completes without dependency errors in a fresh environment.

npm run start:dev starts the app (basic health endpoint reachable).

meta.json lists all env vars required by selected modules.

The assembler prevents selecting modules with declared conflicts.

The assembler can push the generated repo to GitHub using a GitHub App (or OAuth) and returns a repo URL.

Basic tests for assembler pass in CI.

22. Next steps you can ask me to produce now

Full assembleProject.ts file (complete, production-ready, with error handling and ts-morph injection).

A sample boiler-templates starter ZIP containing base, signup, and gmail modules.

A NestJS endpoint implementation (POST /api/generate) wired to the assembler.

A ts-morph helper for AST-based import and registration injection.

If you want any of the above produced as files or code blocks, tell me which item and I will generate it directly.