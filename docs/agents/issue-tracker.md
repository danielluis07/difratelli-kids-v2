# Issue tracker: GitHub

Issues and specs live in GitHub Issues for
`danielluis07/difratelli-kids-v2`. Use the `gh` CLI.

## Conventions

- Create: `gh issue create --title "..." --body-file <path>`
- Read: `gh issue view <number> --comments`
- List: `gh issue list --state open --json number,title,body,labels,comments`
- Comment: `gh issue comment <number> --body-file <path>`
- Apply labels: `gh issue edit <number> --add-label "..."`
- Remove labels: `gh issue edit <number> --remove-label "..."`
- Close: `gh issue close <number> --comment "..."`

Use temporary UTF-8 files for multiline bodies.
Infer the repository from the Git remote.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## Skill operations

“Publish to the issue tracker” means create a GitHub issue.
“Fetch the relevant ticket” means read the issue and its comments.

## Wayfinding operations

- Map: one issue labelled `wayfinder:map`, containing Notes,
  Decisions-so-far, and Fog.
- Child tickets: link through GitHub sub-issues when available.
  Otherwise, add a task list to the map and `Part of #<map>`
  to each child.
- Ticket labels: `wayfinder:research`, `wayfinder:prototype`,
  `wayfinder:grilling`, or `wayfinder:task`.
- Blocking: use native GitHub issue dependencies when available.
  Otherwise, record `Blocked by: #<number>` in the child body.
- Frontier: select the first open child in map order with no
  open blockers and no assignee.
- Claim: assign the ticket to the driving developer.
- Resolve: comment with the answer, close the ticket, and add
  a summary and link to the map's Decisions-so-far.
