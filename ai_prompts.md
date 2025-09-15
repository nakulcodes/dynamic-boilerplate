1. Add short path for bolier plate on database and utils
2. Add comon function like pagination utility, response intercetors for global format handling
3. Add swagger api docs for boilerplate


1. For env access used configService instead of directly process.env. 
2. All module for backend should be under src/modules/
3. Add mail modules resend and smtp which can be selected on boilerplate generation


1. Mail service will have basic method like send mail and all with generated template besing set as argument. Think in such a way. And update mail service accordingly. We will have template in our db entity for storing templates for message like mail, whatsapp, messsage and we will popeulate variable in that so mail service will reieve template id and variable
2. Add login for github and outlook in same project. 


1. Add health check module
2. Add file module like s3 aws
3. Add notifications send using twillio
4. Add stripe module


1. .env.template should be generated as we select modules
2. FOr database entities entites should be in folder above src i.e. database. Inside that entities should hold all entities and repositories will have all respositoried for respective entities. 
3. Have user selection if primary generated column should be uuid or simple int
4. Each module will inject repository directly as @db/repositorie/<name of repo>


1. Now implement redis layer to store refresh token and add good and solid auth system. 


. config

Purpose: Centralized typed config loader + validation for all modules.

When: Always.

Key env vars: none specific (module reads others).

Likely deps / exports: @nestjs/config, Zod or Joi; ConfigService, typed config schemas.

Notes: Validate at startup; expose typed config objects for modules.

2. database (orm)

Purpose: Prisma / TypeORM wrapper, connection manager, migrations runner.

When: When app uses a database.

Key env vars: DATABASE_URL, NODE_ENV, MIGRATION_STRATEGY.

Deps / exports: Prisma or TypeORM, migration CLI.

Exposes: DB client via DI, repository helpers.


18. audit-log

Purpose: Immutable audit trail for sensitive events.

Key env vars: AUDIT_SINK.

Exposes: @Audit() decorator; audit query endpoints.

Module manifest example (module.json)

Use this template inside each module folder to standardize UI/CLI generation.

{
  "id": "auth-jwt",
  "name": "Auth (JWT)",
  "description": "JWT-based authentication with access + refresh tokens and cookie/session support.",
  "category": "auth",
  "required": true,
  "env": [
    { "key": "JWT_SECRET", "required": true, "example": "super-secret" },
    { "key": "REFRESH_SECRET", "required": false, "example": "refresh-secret" }
  ],
  "routes": ["/auth/login", "/auth/refresh", "/auth/logout"],
  "dependsOn": ["users", "config"],
  "optionalDeps": ["rate-limit", "audit-log"],
  "qualityChecklist": ["openapi", "unit-tests", "e2e-tests", "README"]
}