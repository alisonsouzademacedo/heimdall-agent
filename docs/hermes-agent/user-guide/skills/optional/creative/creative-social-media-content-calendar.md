<!-- source: https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar -->
[Skip to main content](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar#__docusaurus_skipToContent_fallback)

On this page

Plan multi-platform social campaigns: briefs to posting.

## Skill metadata [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar\#skill-metadata "Direct link to Skill metadata")

|  |  |
| --- | --- |
| Source | Optional — install with `hermes skills install official/creative/social-media-content-calendar` |
| Path | `optional-skills/creative/social-media-content-calendar` |
| Version | `0.1.0` |
| Author | Ben Barclay (benbarclay), Hermes Agent |
| License | MIT |
| Platforms | linux, macos, windows |
| Tags | `Social-Media`, `Content-Calendar`, `Campaigns`, `Publishing` |
| Related skills | [`xurl`](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/social-media/social-media-xurl), [`humanizer`](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/creative/creative-humanizer) |

## Reference: full SKILL.md [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar\#reference-full-skillmd "Direct link to Reference: full SKILL.md")

info

The following is the complete skill definition that Hermes loads when this skill is triggered. This is what the agent sees as instructions when the skill is active.

# Social Media Content Calendar

Plan a concrete calendar across selected social platforms. This skill owns campaign structure, post briefs, channel adaptation, approvals, and publishing verification; platform skills such as `xurl` own API commands. For platforms without a connector, the verified handoff ends at approved drafts for the user's scheduler — say so rather than claiming publication.

## When to Use [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar\#when-to-use "Direct link to When to Use")

- "Build next month's social calendar."
- "Turn this launch into posts for X, LinkedIn, Instagram, and TikTok."
- "Draft and schedule a campaign."
- "Repurpose these articles/videos into social content."

Don't use for: single one-off posts (use the platform skill directly).

## Procedure [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar\#procedure "Direct link to Procedure")

### 1\. Define campaign constraints [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar\#1-define-campaign-constraints "Direct link to 1. Define campaign constraints")

Record objective, audience, offer/message, platforms, date range, cadence, voice, mandatory/prohibited claims, links, tracking convention, localization, and approval/publishing authority. Done when each proposed post has a clear business purpose.

### 2\. Inventory source material [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar\#2-inventory-source-material "Direct link to 2. Inventory source material")

Collect verified product facts, launches, articles, media, testimonials with permission, brand assets, and key dates using `read_file` and `web_extract`. Mark claim owners and expiration. Done when unsupported claims and missing assets are visible.

### 3\. Build themes and calendar slots [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar\#3-build-themes-and-calendar-slots "Direct link to 3. Build themes and calendar slots")

Create a balanced mix such as education, proof, product, community, event, behind-the-scenes, and conversation. Account for platform cadence and campaign milestones. Done when dates, platforms, themes, and objectives form a coherent calendar rather than duplicate cross-posts.

### 4\. Write platform-specific briefs [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar\#4-write-platform-specific-briefs "Direct link to 4. Write platform-specific briefs")

For each post specify hook, core message, format, copy length, CTA, link, asset dimensions/content, accessibility text, tags/mentions, and success metric. Adapt rather than copy-paste between platforms. Done when a creator can produce the asset without hidden context.

### 5\. Draft copy and assets [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar\#5-draft-copy-and-assets "Direct link to 5. Draft copy and assets")

Load `humanizer` for voice; generate visuals with the `image_generate` tool where assets are needed. Preserve factual claims and shared campaign identity while respecting platform norms. Done when every calendar slot has draft copy and asset status.

### 6\. Run editorial and risk review [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar\#6-run-editorial-and-risk-review "Direct link to 6. Run editorial and risk review")

Check factual accuracy, tone, repetition, rights/permissions, accessibility, disclosures, link destination, date relevance, and crisis sensitivity. Mark `draft`, `needs review`, or `approved`; do not publish from draft. Done when every post has a disposition and owner.

### 7\. Schedule or hand off [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar\#7-schedule-or-hand-off "Direct link to 7. Schedule or hand off")

Present the approval batch. Publish/schedule only approved posts using available platform skills (`xurl` for X); for platforms without a connector, deliver the approved package (copy, assets, timing) for the user's scheduling tool and mark those slots handed-off, not published. Read back scheduled time, account, content preview, and provider post/job ID for anything actually published. Done when the calendar reflects verified publishing or handoff status per slot.

## Pitfalls [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar\#pitfalls "Direct link to Pitfalls")

- Identical copy on every platform.
- Filling cadence with low-value repetitive posts.
- Publishing unverified metrics, testimonials, or future claims.
- Confusing generated asset completion with scheduled publication.
- Claiming "scheduled" for platforms where the handoff ended at drafts.

## Verification [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar\#verification "Direct link to Verification")

- [ ] Every post traces to a campaign objective and a verified claim inventory.
- [ ] No post was published from `draft` or `needs review` state.
- [ ] Published slots have provider-confirmed IDs; handed-off slots are marked as such.
- [ ] Rights, permissions, and disclosures checked before any publish.

- [Skill metadata](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar#skill-metadata)
- [Reference: full SKILL.md](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar#reference-full-skillmd)
- [When to Use](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar#when-to-use)
- [Procedure](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar#procedure)
  - [1\. Define campaign constraints](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar#1-define-campaign-constraints)
  - [2\. Inventory source material](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar#2-inventory-source-material)
  - [3\. Build themes and calendar slots](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar#3-build-themes-and-calendar-slots)
  - [4\. Write platform-specific briefs](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar#4-write-platform-specific-briefs)
  - [5\. Draft copy and assets](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar#5-draft-copy-and-assets)
  - [6\. Run editorial and risk review](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar#6-run-editorial-and-risk-review)
  - [7\. Schedule or hand off](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar#7-schedule-or-hand-off)
- [Pitfalls](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar#pitfalls)
- [Verification](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-social-media-content-calendar#verification)
