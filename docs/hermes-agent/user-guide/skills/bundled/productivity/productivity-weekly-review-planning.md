<!-- source: https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning -->
[Skip to main content](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#__docusaurus_skipToContent_fallback)

On this page

Weekly reset: commitments, stalled work, next-week plan.

## Skill metadata [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning\#skill-metadata "Direct link to Skill metadata")

|  |  |
| --- | --- |
| Source | Bundled (installed by default) |
| Path | `skills/productivity/weekly-review-planning` |
| Version | `0.1.0` |
| Author | Ben Barclay (benbarclay), Hermes Agent |
| License | MIT |
| Platforms | linux, macos, windows |
| Tags | `Weekly-Review`, `Planning`, `Tasks`, `Calendar`, `Productivity` |
| Related skills | [`obsidian`](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/note-taking/note-taking-obsidian), [`notion`](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-notion), [`airtable`](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-airtable), [`google-workspace`](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-google-workspace), [`email-inbox-triage`](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-email-inbox-triage) |

## Reference: full SKILL.md [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning\#reference-full-skillmd "Direct link to Reference: full SKILL.md")

info

The following is the complete skill definition that Hermes loads when this skill is triggered. This is what the agent sees as instructions when the skill is active.

# Weekly Review and Planning

Run a bounded weekly reset across the user's chosen systems. This is a concrete recurring task, not a generic productivity methodology — the `weekly-review` Automation Blueprint schedules it as a cron job.

## When to Use [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning\#when-to-use "Direct link to When to Use")

- "Run my weekly review."
- "What did I commit to and what is slipping?"
- "Plan next week from my calendar, tasks, and notes."
- "Find stale projects and waiting items."
- A cron tick fires for a scheduled weekly review.

Don't use for: daily briefs (see the `google-workspace` daily-brief reference) or single-inbox triage (`email-inbox-triage`).

## Procedure [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning\#procedure "Direct link to Procedure")

### 1\. Set systems and window [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning\#1-set-systems-and-window "Direct link to 1. Set systems and window")

Confirm timezone, review period, planning horizon, authoritative task/project store, calendars, inboxes, and allowed writes. Default to recommendations/drafts, not mutations. Done when source-of-truth conflicts have a declared winner.

### 2\. Review calendar evidence [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning\#2-review-calendar-evidence "Direct link to 2. Review calendar evidence")

Load `google-workspace` or the relevant calendar connector. Inspect the completed week for meetings and commitments, then the next 1-2 weeks for deadlines, travel, preparation, and capacity. Capture follow-ups implied by past events and conflicts ahead. Done when both retrospective and horizon are covered.

### 3\. Clear capture inboxes [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning\#3-clear-capture-inboxes "Direct link to 3. Clear capture inboxes")

Review the task inbox, notes (`obsidian`, `notion`), flagged email (`email-inbox-triage` owns thread-level triage), and other declared capture points. Convert each item to next action, project, waiting, scheduled, someday, reference, archive, or delete proposal. Do not mutate until scope is approved. Done when remaining unprocessed items are counted and stated.

### 4\. Reconcile active projects [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning\#4-reconcile-active-projects "Direct link to 4. Reconcile active projects")

For each project identify desired outcome, next action, owner, deadline, blocker, last meaningful activity, and source link. Flag projects with no next action, missed dates, duplicate records, or contradictory status. Done when every active project is actionable or explicitly paused.

### 5\. Review waiting and commitments [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning\#5-review-waiting-and-commitments "Direct link to 5. Review waiting and commitments")

Find promises made by the user and items owed by others. Propose follow-ups with dates and channels. Do not infer that silence means completion. Done when each waiting item has an owner and next review/follow-up date.

### 6\. Build a capacity-aware plan [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning\#6-build-a-capacity-aware-plan "Direct link to 6. Build a capacity-aware plan")

Estimate fixed calendar load and select a small set of weekly outcomes plus near-term next actions. Rank by consequence, deadline, dependency, and effort; do not fill every free hour. Done when the plan fits actual capacity and names deferred work.

### 7\. Apply approved updates [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning\#7-apply-approved-updates "Direct link to 7. Apply approved updates")

Update tasks/projects, create calendar holds, archive processed items, and draft follow-ups only as approved. Read every changed record back from the provider. Done when verified writes match the review summary.

## Output Shape [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning\#output-shape "Direct link to Output Shape")

1. Wins and completed commitments
2. Overdue or at risk
3. Waiting/follow-ups
4. Stalled or ambiguous projects
5. Next week's outcomes and calendar constraints
6. Proposed updates awaiting approval
7. Coverage gaps

## Pitfalls [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning\#pitfalls "Direct link to Pitfalls")

- Planning from tasks without calendar capacity.
- Carrying every unfinished item forward as high priority.
- Marking projects active with no next action.
- Silently deleting or rescheduling personal commitments.
- Treating silence from others as completion.

## Verification [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning\#verification "Direct link to Verification")

- [ ] Both the completed week and the planning horizon were covered, or gaps are stated.
- [ ] Every stalled/waiting flag traces to a specific record, event, or thread.
- [ ] No task, event, or note was mutated without approval; approved writes were read back.
- [ ] The plan names what was deferred, not just what was chosen.

- [Skill metadata](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#skill-metadata)
- [Reference: full SKILL.md](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#reference-full-skillmd)
- [When to Use](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#when-to-use)
- [Procedure](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#procedure)
  - [1\. Set systems and window](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#1-set-systems-and-window)
  - [2\. Review calendar evidence](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#2-review-calendar-evidence)
  - [3\. Clear capture inboxes](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#3-clear-capture-inboxes)
  - [4\. Reconcile active projects](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#4-reconcile-active-projects)
  - [5\. Review waiting and commitments](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#5-review-waiting-and-commitments)
  - [6\. Build a capacity-aware plan](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#6-build-a-capacity-aware-plan)
  - [7\. Apply approved updates](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#7-apply-approved-updates)
- [Output Shape](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#output-shape)
- [Pitfalls](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#pitfalls)
- [Verification](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/productivity/productivity-weekly-review-planning#verification)
