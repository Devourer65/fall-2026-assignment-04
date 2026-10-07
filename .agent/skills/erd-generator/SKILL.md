---
name: erd-generator
description: Convert domain requirements into a verified Mermaid Entity-Relationship Diagram and a rendered SVG asset when requested to design an ERD, data model, or architecture diagram.
---

# ERD Generator

Convert domain requirements into a verified Mermaid Entity-Relationship Diagram
and a rendered SVG asset.

Operational Rules
1. Parse the Domain Requirements

Analyze the user's requirements and identify:

Entities
Attributes for each entity
Primary keys (PK)
Foreign keys (FK)
Data types
Required versus optional attributes
Relationships between entities
Relationship cardinalities

Resolve reasonable business ambiguities explicitly before writing the diagram.
Do not invent relationships that are not supported by the requirements.

Use Mermaid erDiagram syntax.

For Mermaid ERD relationships, use appropriate cardinality markers, including:

|| — exactly one
o| — zero or one
|{ — one or many
o{ — zero or many

Clearly annotate primary and foreign keys in entity attributes using PK and
FK.

2. Write the Mermaid Source

Create or overwrite:

docs/architecture/schema.mmd

Write the complete Mermaid ERD directly to that file.

The file must contain a valid Mermaid erDiagram definition and must be
renderable by Mermaid CLI.

Do not merely provide the Mermaid source in the response. The source file must
actually be written to disk.

3. Validate and Render

From the repository root, execute:

node .agent/skills/erd-generator/scripts/render_erd.js docs/architecture/schema.mmd

The renderer must produce:

docs/architecture/erd.svg

A successful execution prints:

SUCCESS

and exits with status code 0.

4. Self-Correction Loop

If the renderer exits unsuccessfully and reports:

SYNTAX_ERROR:

inspect the reported Mermaid compilation error.

Then:

Identify the invalid Mermaid syntax.
Correct docs/architecture/schema.mmd.
Re-run the renderer.
Repeat as necessary, for a maximum of 3 retries after the initial attempt.

Do not silently ignore a rendering failure.

If all three retries fail, report the final Mermaid compilation error to the
user rather than claiming that the ERD was successfully generated.

5. Verification

After successful rendering, verify that:

docs/architecture/schema.mmd exists.
docs/architecture/erd.svg exists.
The renderer exited with status 0.
The Mermaid source represents the requested entities and relationships.

Do not report success unless the renderer actually succeeds.

6. Final Response

After successful verification:

Present the final raw Mermaid source in a fenced mermaid code block.
Reference the generated SVG asset:

docs/architecture/erd.svg

Keep the final response concise and distinguish the source file from the
rendered SVG asset.

Constraints
Use the repository's existing Mermaid CLI installation.
Do not install additional Mermaid packages unless explicitly requested.
Use npx mmdc through the provided renderer script.
Keep the Mermaid source deterministic and readable.
Preserve existing project files unless the task explicitly requires changing
them.
Never claim that an SVG was generated without successfully running the
renderer.
Never suppress or discard Mermaid compiler errors.
The renderer script is responsible for converting Mermaid compilation errors
into the SYNTAX_ERROR: format expected by this skill.