# Domain Docs

## Layout

This repository uses a single-context layout:

- `GLOSSARY.md` at the repository root.
- Architecture decision records in `docs/adr/`.

## Before exploring

Read the root glossary and ADRs relevant to the area being changed.

If these files do not exist, proceed silently. Do not suggest
creating them upfront. The domain-modeling skill creates them
when terms or decisions are resolved.

If a root `GLOSSARY-MAP.md` is introduced later, follow its links
to relevant context glossaries and check context-specific ADRs.

## Vocabulary

Use the glossary's terms in issues, proposals, hypotheses, and tests.
Avoid synonyms the glossary explicitly rejects.

If a needed concept is missing, reconsider invented terminology
or note the gap for domain-modeling.

## ADR conflicts

Explicitly identify any proposal that contradicts an existing ADR,
and explain why the decision should be reconsidered.
