---
name: kysely-migration-generator
description: Convert a Mermaid ERD into a type-safe, executable Kysely database migration when requested to generate database migrations from an architecture schema.
---

# Kysely Migration Generator

Convert a Mermaid ERD into a type-safe, executable Kysely database migration.

Input

Read the Mermaid ERD from:

docs/architecture/schema.mmd

The Mermaid source must contain an erDiagram definition with entities,
attributes, keys, and relationships.

Before generating the migration, inspect the existing migration structure in:

src/db/migrations/001_initial_schema.ts

Follow the project's existing Kysely conventions unless the Mermaid ERD requires
otherwise.

Translation Rules
1. Entities → Tables

Convert every Mermaid entity into a PostgreSQL table.

Entity names must be converted to lowercase snake_case.

Examples:

USERS → users
BOOK_AUTHORS → book_authors
LIBRARY_LOANS → library_loans

Do not create tables for entities that are not present in the Mermaid ERD.

2. Attributes → Columns

Convert each Mermaid attribute into a Kysely column.

Preserve the semantic data type represented by the Mermaid attribute.

Use appropriate PostgreSQL/Kysely types, including:

int, integer → integer
serial → serial
bigint → bigint
varchar, string → varchar
text → text
boolean, bool → boolean
date → date
timestamp → timestamp
uuid → uuid

When the Mermaid type includes a length, preserve it where appropriate.

For example:

varchar(255)

should become:

.addColumn('email', 'varchar(255)')
3. Primary Keys

Attributes marked PK must become primary keys.

For integer primary-key IDs, prefer an auto-generating PostgreSQL serial
column when appropriate:

.addColumn('id', 'serial', (col) => col.primaryKey())

For UUID primary keys, use an appropriate UUID column and configure an
appropriate database-side default when required by the schema.

Do not create duplicate primary-key constraints.

4. Foreign Keys

Attributes marked FK must become foreign-key columns.

The foreign key must reference the corresponding primary-key column of the
related table.

Use Kysely's .references() and configure cascading deletion:

.addColumn('user_id', 'integer', (col) =>
  col.references('users.id').onDelete('cascade')
)

Foreign-key types must be compatible with the referenced primary-key type.

Do not create a foreign-key reference to a table or column that does not exist.

5. Cardinalities

Interpret Mermaid relationship cardinalities when generating constraints.

One-to-many

For:

||--o{

create a foreign key on the "many" side pointing to the primary key of the
"one" side.

Example:

USERS ||--o{ LOANS : creates

means loans contains the foreign key:

user_id → users.id

The foreign key must use:

.references('users.id').onDelete('cascade')
One-to-one

For:

||--o|

create a foreign key on the dependent side and enforce uniqueness on that
foreign-key column.

Example:

USERS ||--o| USER_PROFILES : has

requires the appropriate foreign-key column on user_profiles and a unique
constraint so that a user can have at most one profile.

Use Kysely's .unique() where appropriate.

6. Required and Optional Attributes

Mermaid attributes without optional relationship semantics should be treated
according to the schema requirements.

When an attribute is explicitly required, use:

.notNull()

Optional attributes should remain nullable.

Do not automatically make every column NOT NULL unless the ERD or domain
requirements support that decision.

7. Table Creation Order

Create tables in dependency order.

A table referenced by a foreign key must be created before the table containing
that foreign key.

For example:

users
  ↓
loans

must result in users being created before loans.

When dependencies form a cycle, choose a safe Kysely/PostgreSQL strategy rather
than generating invalid table creation order.

8. Migration File Name

Create the migration inside:

src/db/migrations/

using:

<timestamp>_<migration_name>.ts

For example:

src/db/migrations/20261007123000_library_schema.ts

Use a unique timestamp and a descriptive snake_case migration name.

Do not overwrite:

001_initial_schema.ts

unless the user explicitly asks for that file to be modified.

9. Migration Structure

The generated migration must import Kysely and any required SQL helpers:

import { Kysely, sql } from 'kysely';

The migration must export:

export async function up(db: Kysely<any>): Promise<void> {
  // create tables
}

export async function down(db: Kysely<any>): Promise<void> {
  // drop tables
}

The up function must create all tables, columns, keys, constraints, and
relationships represented by the Mermaid ERD.

The down function must remove all generated tables.

10. Reverse Dependency Order

The down function must drop tables in the reverse order of their dependencies.

If:

users → loans → loan_items

then the down function must drop:

loan_items
loans
users

This prevents foreign-key dependency errors during rollback.

Validation

After generating the migration:

Run the project's TypeScript build:
npm run build
If TypeScript compilation fails, inspect the error and correct the
generated migration.
Do not claim the migration is valid until the project builds successfully.

If a database is available and the user requests full verification, run:

npm run migrate:up

and verify that the migration executes without database errors.

Self-Correction

If npm run build fails:

Read the TypeScript error.
Identify the invalid generated code.
Correct the migration.
Run npm run build again.
Continue until the migration compiles or the error cannot reasonably be
resolved.

If database execution fails:

Read the database error.
Identify the incorrect table, column, constraint, type, or dependency order.
Correct the migration.
Re-run the migration verification.

Never report successful migration generation when the generated TypeScript does
not compile.

Final Output

After successful generation, report:

The generated migration file path.
The tables created.
That up and down functions are present.
Whether npm run build succeeded.
Whether database migration execution was verified, if it was requested.

Do not modify the Mermaid ERD unless the user explicitly asks for the ERD to
be changed.