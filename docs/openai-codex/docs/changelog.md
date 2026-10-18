<!-- source: https://learn.chatgpt.com/docs/changelog -->
For the complete documentation index, see [llms.txt](https://learn.chatgpt.com/llms.txt). Markdown versions of documentation pages are available by appending
`.md` to the page URL.

## Search the docs

Search docs

### Suggested

responses createreasoning\_effortrealtimeprompt caching

Primary navigation

Search docs

### Suggested

responses createreasoning\_effortrealtimeprompt caching

Overview  Features  Configuration  Developers  Security  Administration  Use Cases  Resources

DocsOverview

- [Home](https://learn.chatgpt.com/docs)

### Get started

- [Quickstart](https://learn.chatgpt.com/docs/quickstart)
- [Use ChatGPT](https://learn.chatgpt.com/docs/use-chatgpt)
- [Get started with Work](https://learn.chatgpt.com/docs/get-started-with-work)
- [Meet dots](https://learn.chatgpt.com/docs/dots?nav=overview)
- [Import from another agent](https://learn.chatgpt.com/docs/import)

### Foundations

- [Prompting](https://learn.chatgpt.com/docs/prompting)
- [Model selection](https://learn.chatgpt.com/docs/model-selection)
- [Personalize ChatGPT](https://learn.chatgpt.com/docs/personalize)
- [Skills & Plugins](https://learn.chatgpt.com/docs/skills-and-plugins)
- [Permissions](https://learn.chatgpt.com/docs/permission-modes)

### Explore

- [What's new](https://learn.chatgpt.com/docs/whats-new)
- [Models](https://learn.chatgpt.com/docs/models)
- [Pricing](https://learn.chatgpt.com/docs/pricing)
- [Glossary](https://learn.chatgpt.com/docs/glossary)

### Available on

- [ChatGPT desktop app](https://learn.chatgpt.com/docs/app)
- [ChatGPT mobile app](https://learn.chatgpt.com/docs/mobile)
- [ChatGPT on the web](https://learn.chatgpt.com/docs/web)
- [Codex CLI](https://learn.chatgpt.com/docs/codex/cli)
- [Codex IDE extension](https://learn.chatgpt.com/docs/codex/ide)
- [Codex Cloud](https://learn.chatgpt.com/docs/cloud)

### Releases

- [Changelog](https://learn.chatgpt.com/docs/changelog)
- [Feature Maturity](https://learn.chatgpt.com/docs/feature-maturity)
- [Open Source](https://learn.chatgpt.com/docs/open-source)

[API Dashboard](https://platform.openai.com/login)

[Try ChatGPT](https://chatgpt.com/)

[All updates](https://learn.chatgpt.com/docs/changelog) [General](https://learn.chatgpt.com/docs/changelog?type=general) [ChatGPT desktop app](https://learn.chatgpt.com/docs/changelog?type=codex-app) [Codex Mobile](https://learn.chatgpt.com/docs/changelog?type=codex-mobile) [Codex CLI](https://learn.chatgpt.com/docs/changelog?type=codex-cli)

[October 2026](https://learn.chatgpt.com/docs/changelog#month-2026-10) [September 2026](https://learn.chatgpt.com/docs/changelog#month-2026-09) [August 2026](https://learn.chatgpt.com/docs/changelog#month-2026-08) [July 2026](https://learn.chatgpt.com/docs/changelog#month-2026-07) [June 2026](https://learn.chatgpt.com/docs/changelog#month-2026-06) [May 2026](https://learn.chatgpt.com/docs/changelog#month-2026-05) [April 2026](https://learn.chatgpt.com/docs/changelog#month-2026-04) [March 2026](https://learn.chatgpt.com/docs/changelog#month-2026-03) [February 2026](https://learn.chatgpt.com/docs/changelog#month-2026-02) [January 2026](https://learn.chatgpt.com/docs/changelog#month-2026-01) [December 2025](https://learn.chatgpt.com/docs/changelog#month-2025-12) [November 2025](https://learn.chatgpt.com/docs/changelog#month-2025-11) [October 2025](https://learn.chatgpt.com/docs/changelog#month-2025-10) [September 2025](https://learn.chatgpt.com/docs/changelog#month-2025-09) [August 2025](https://learn.chatgpt.com/docs/changelog#month-2025-08) [June 2025](https://learn.chatgpt.com/docs/changelog#month-2025-06) [May 2025](https://learn.chatgpt.com/docs/changelog#month-2025-05)

## October 2026

- 2026-10-15



### Codex CLI 0.163.0






```
$ npm install -g @openai/codex@0.163.0


```



View details



## New Features



  - Open `/config` to search preferences across categories, change supported settings immediately, and see which changes require a restart. ( [#52990](https://github.com/openai/codex/pull/52990), [#53429](https://github.com/openai/codex/pull/53429))
  - Send a follow-up while Codex is responding to steer it immediately. Interrupting a turn also stops active Code Mode cells and their nested tool calls. ( [#51812](https://github.com/openai/codex/pull/51812), [#51835](https://github.com/openai/codex/pull/51835))
  - Configure a leader key in `/keymap`. The default is `Ctrl+X`, shortcut hints stay open until you choose or cancel, and voice mute moves to `F9`. ( [#52273](https://github.com/openai/codex/pull/52273))
  - Restart a managed background server from `/daemon`. Codex warns about work the restart could interrupt, then reconnects automatically. ( [#53173](https://github.com/openai/codex/pull/53173))
  - Codex can run independent read-only tools in parallel, including skill, memory, and conversation-history lookups. ( [#52245](https://github.com/openai/codex/pull/52245))
  - Daybreak is enabled by default for eligible accounts. `codex exec` can also select it with an OpenAI API key when the server offers access. ( [#53701](https://github.com/openai/codex/pull/53701), [#53717](https://github.com/openai/codex/pull/53717))

## Bug Fixes

  - Resuming a saved thread restores its permissions and network approvals, while respecting explicit overrides and current managed policy. ( [#53150](https://github.com/openai/codex/pull/53150), [#53419](https://github.com/openai/codex/pull/53419), [#53424](https://github.com/openai/codex/pull/53424))
  - The network proxy now checks permission before a DNS lookup, rejects duplicate `Host` headers, and prevents credential aliases from bypassing inspection hooks. ( [#51650](https://github.com/openai/codex/pull/51650), [#52661](https://github.com/openai/codex/pull/52661), [#53506](https://github.com/openai/codex/pull/53506))
  - Return to an existing side conversation with `/side` after switching threads. Answers to pending prompts also go back to the thread that asked. ( [#52184](https://github.com/openai/codex/pull/52184), [#53436](https://github.com/openai/codex/pull/53436))
  - On Windows, `Ctrl+V` and `Shift+Insert` paste text as well as images. On WSL, repeated pastes reuse the clipboard reader, and copy attempts time out instead of hanging. ( [#53224](https://github.com/openai/codex/pull/53224), [#52967](https://github.com/openai/codex/pull/52967), [#53453](https://github.com/openai/codex/pull/53453))
  - Local commands finish promptly when a child keeps an output pipe open. Remote commands preserve late-arriving output so the final poll can still collect it. ( [#52652](https://github.com/openai/codex/pull/52652), [#53331](https://github.com/openai/codex/pull/53331), [#53622](https://github.com/openai/codex/pull/53622))
  - `codex exec` no longer prints the same file diff again after an unrelated command. ( [#53444](https://github.com/openai/codex/pull/53444))

## Documentation

  - Updated the bundled OpenAI Docs guidance for migrations to the GPT-6 family, including model-specific reasoning, tool use, and data residency considerations. ( [#51768](https://github.com/openai/codex/pull/51768))
  - Clarified how the Linux sandbox uses bubblewrap for filesystem isolation and seccomp for syscall filtering. ( [#52610](https://github.com/openai/codex/pull/52610))

## Chores

  - Codex now uses its standard shell executor and no longer bundles a patched `zsh`. Configurations using the retired shell flags receive a migration notice. ( [#52160](https://github.com/openai/codex/pull/52160), [#52213](https://github.com/openai/codex/pull/52213))
  - Reduced Linux and macOS release package size by stripping symbols from packaged binaries while preserving them in the original build outputs. ( [#52178](https://github.com/openai/codex/pull/52178))

## Changelog

Full Changelog: [`rust-v0.162.0...rust-v0.163.0`](https://github.com/openai/codex/compare/rust-v0.162.0...rust-v0.163.0)

  - [#51539](https://github.com/openai/codex/pull/51539) Add completion-aware realtime attachment and session-scoped detach [@zahan-oai](https://github.com/zahan-oai)
  - [#51547](https://github.com/openai/codex/pull/51547) Add a Windows MXC sandbox opt-out [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#51556](https://github.com/openai/codex/pull/51556) Complete dynamic tool lifecycles on cancellation [@mikelam-oai](https://github.com/mikelam-oai)
  - [#51575](https://github.com/openai/codex/pull/51575) Expose package assembly helpers and support gzip DotSlash artifacts [@bolinfest](https://github.com/bolinfest)
  - [#51595](https://github.com/openai/codex/pull/51595) Add thread ID exclusions to `thread/list` [@btraut-openai](https://github.com/btraut-openai)
  - [#51602](https://github.com/openai/codex/pull/51602) Distinguish thread listing failures from exhausted history [@btraut-openai](https://github.com/btraut-openai)
  - [#51611](https://github.com/openai/codex/pull/51611) Signal abandonment of unanswered MCP elicitations [@nicksteele-oai](https://github.com/nicksteele-oai)
  - [#51627](https://github.com/openai/codex/pull/51627) Stabilize Guardian snapshot prefixes by separating assistant context [@jif-oai](https://github.com/jif-oai)
  - [#51642](https://github.com/openai/codex/pull/51642) Fix retained context handling for typed section content [@jif-oai](https://github.com/jif-oai)
  - [#51650](https://github.com/openai/codex/pull/51650) Require hostname authorization before proxy DNS lookups [@jif-oai](https://github.com/jif-oai)
  - [#51651](https://github.com/openai/codex/pull/51651) Persist Guardian review failures for reports across restarts [@jif-oai](https://github.com/jif-oai)
  - [#51652](https://github.com/openai/codex/pull/51652) Record telemetry for AGENTS.md changes made by apply\_patch [@jif-oai](https://github.com/jif-oai)
  - [#51678](https://github.com/openai/codex/pull/51678) Move Windows sandbox tests into a dedicated integration binary [@jif-oai](https://github.com/jif-oai)
  - [#51683](https://github.com/openai/codex/pull/51683) Roll back stale Guardian reviews before reusing reviewer history [@olliem-oai](https://github.com/olliem-oai)
  - [#51689](https://github.com/openai/codex/pull/51689) Wait for helper completion in HTTP header cancellation tests [@jif-oai](https://github.com/jif-oai)
  - [#51690](https://github.com/openai/codex/pull/51690) Add a feature flag for Code Mode tool description ordering [@swastik-oai](https://github.com/swastik-oai)
  - [#51704](https://github.com/openai/codex/pull/51704) Honor tool-description-first ordering in Code Mode [@swastik-oai](https://github.com/swastik-oai)
  - [#51710](https://github.com/openai/codex/pull/51710) Fix a discovery race in the external auth refresh test [@jgershen-oai](https://github.com/jgershen-oai)
  - [#51734](https://github.com/openai/codex/pull/51734) Load persisted sender context for Guardian reviews [@jif-oai](https://github.com/jif-oai)
  - [#51755](https://github.com/openai/codex/pull/51755) Reuse MCP handler metadata for cache comparisons [@owenlin0](https://github.com/owenlin0)
  - [#51761](https://github.com/openai/codex/pull/51761) Reduce tool metadata cloning in the code-mode runtime [@akira-oai](https://github.com/akira-oai)
  - [#51768](https://github.com/openai/codex/pull/51768) Expand OpenAI Docs migration guidance to the GPT-6 model family [@kkahadze-oai](https://github.com/kkahadze-oai)
  - [#51775](https://github.com/openai/codex/pull/51775) Prevent recursive Tokio tracing in telemetry and SQLite logs [@zbarsky-openai](https://github.com/zbarsky-openai)
  - [#51786](https://github.com/openai/codex/pull/51786) Preserve sandbox overrides across execution requests [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#51794](https://github.com/openai/codex/pull/51794) Advertise Ultrafast for GPT-6.1 Sol on Amazon Bedrock [@celia-oai](https://github.com/celia-oai)
  - [#51800](https://github.com/openai/codex/pull/51800) Remove duplicate field initializers in extension registry tests [@anp-oai](https://github.com/anp-oai)
  - [#51808](https://github.com/openai/codex/pull/51808) Preserve diagnostic reasons for MCP user verification failures [@berkdeniz-oai](https://github.com/berkdeniz-oai)
  - [#51812](https://github.com/openai/codex/pull/51812) Enable instant interrupts by default [@pakrym-oai](https://github.com/pakrym-oai)
  - [#51819](https://github.com/openai/codex/pull/51819) Migrate the MXC sandbox to the 1.0.0 SDK [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#51822](https://github.com/openai/codex/pull/51822) Avoid sharing violations when repairing Windows runtime ACLs [@johnl-oai](https://github.com/johnl-oai)
  - [#51823](https://github.com/openai/codex/pull/51823) Share MCP binding tool metadata with prepared calls [@owenlin0](https://github.com/owenlin0)
  - [#51828](https://github.com/openai/codex/pull/51828) Add policy-based file contents integrity checks [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#51831](https://github.com/openai/codex/pull/51831) Add MXC sandbox integrity dependency and policy preparation [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#51835](https://github.com/openai/codex/pull/51835) Enable code mode interruption by default [@won-openai](https://github.com/won-openai)
  - [#51840](https://github.com/openai/codex/pull/51840) Add a bubblewrap backend for sandbox integrity checks [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#51841](https://github.com/openai/codex/pull/51841) Add a macOS Seatbelt backend for sandbox integrity [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#51842](https://github.com/openai/codex/pull/51842) Add a sandbox integrity runner with outcome and timing metrics [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#51843](https://github.com/openai/codex/pull/51843) Run sandbox integrity checks before commands and filesystem operations [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#51847](https://github.com/openai/codex/pull/51847) Preserve Cargo package names in Bazel Rust builds [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#51848](https://github.com/openai/codex/pull/51848) Align Bazel release builds with Cargo and fix platform compatibility [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#51849](https://github.com/openai/codex/pull/51849) Fix package smoke tests for Cargo and Bazel debug symbols [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#51850](https://github.com/openai/codex/pull/51850) Add Bazel release staging archives [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#51855](https://github.com/openai/codex/pull/51855) Add Bazel support to the Codex package build action [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#51856](https://github.com/openai/codex/pull/51856) Build Bazel release artifacts alongside Cargo artifacts [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#51857](https://github.com/openai/codex/pull/51857) Add an app-server prompt prefix compatibility test [@jif-oai](https://github.com/jif-oai)
  - [#51865](https://github.com/openai/codex/pull/51865) Use readable plugin mentions without suppressing same-name skills [@canvrno-oai](https://github.com/canvrno-oai)
  - [#51866](https://github.com/openai/codex/pull/51866) Preserve line breaks and links in multiline async questions [@pash-openai](https://github.com/pash-openai)
  - [#51868](https://github.com/openai/codex/pull/51868) Record tool registration metrics for each sampling request [@akira-oai](https://github.com/akira-oai)
  - [#51872](https://github.com/openai/codex/pull/51872) Keep global app-server config independent of the launch directory [@etraut-openai](https://github.com/etraut-openai)
  - [#51884](https://github.com/openai/codex/pull/51884) Add experimental prediction forks that inherit parent context [@liame-oai](https://github.com/liame-oai)
  - [#51890](https://github.com/openai/codex/pull/51890) Add the missing `mxc-sdk` UTF-8 resource patch for Bazel [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#51892](https://github.com/openai/codex/pull/51892) Preserve tool call completeness when recorded arguments are truncated [@ningyi-oai](https://github.com/ningyi-oai)
  - [#51893](https://github.com/openai/codex/pull/51893) Record metrics for incremental tool updates [@akira-oai](https://github.com/akira-oai)
  - [#51895](https://github.com/openai/codex/pull/51895) Report specific reasons for WebSocket continuation failures [@pakrym-oai](https://github.com/pakrym-oai)
  - [#51896](https://github.com/openai/codex/pull/51896) Preserve native errors in Windows sandbox ACL diagnostics [@alishobeiri-oai](https://github.com/alishobeiri-oai)
  - [#51897](https://github.com/openai/codex/pull/51897) Use a dedicated matcher for network domain policies [@rafael-oai](https://github.com/rafael-oai)
  - [#51908](https://github.com/openai/codex/pull/51908) Honor the user input setting for asynchronous questions [@mandal-OAI](https://github.com/mandal-OAI)
  - [#51930](https://github.com/openai/codex/pull/51930) Support model-specific function description prefixes [@tz-openai](https://github.com/tz-openai)
  - [#51963](https://github.com/openai/codex/pull/51963) Attribute compaction analytics to the correct voice session [@reia-oai](https://github.com/reia-oai)
  - [#51974](https://github.com/openai/codex/pull/51974) Log Windows sandbox availability and backend selection [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#52034](https://github.com/openai/codex/pull/52034) Preserve agent state when unloading idle multi-agent v2 children [@jif-oai](https://github.com/jif-oai)
  - [#52040](https://github.com/openai/codex/pull/52040) Add regression coverage for cancelled agent reloads [@jif-oai](https://github.com/jif-oai)
  - [#52048](https://github.com/openai/codex/pull/52048) Cover instant interruption in steered-input persistence tests [@jif-oai](https://github.com/jif-oai)
  - [#52061](https://github.com/openai/codex/pull/52061) Run Guardian conversation classifiers concurrently and preserve action order [@felixxia-oai](https://github.com/felixxia-oai)
  - [#52062](https://github.com/openai/codex/pull/52062) Add scenario coverage for worker context across idle eviction [@jif-oai](https://github.com/jif-oai)
  - [#52065](https://github.com/openai/codex/pull/52065) Require assessment text in the Guardian parser [@ioanbudea-OAI](https://github.com/ioanbudea-OAI)
  - [#52081](https://github.com/openai/codex/pull/52081) Fix idle cleanup for disconnected multi-agent v2 children [@jif-oai](https://github.com/jif-oai)
  - [#52119](https://github.com/openai/codex/pull/52119) Expose originating tool call metadata in command environments [@leo-oai](https://github.com/leo-oai)
  - [#52160](https://github.com/openai/codex/pull/52160) Remove the patched zsh shell execution backend [@jif-oai](https://github.com/jif-oai)
  - [#52164](https://github.com/openai/codex/pull/52164) Make environment context date and timezone configurable [@surajs-oai](https://github.com/surajs-oai)
  - [#52176](https://github.com/openai/codex/pull/52176) Show AWS GovCloud guidance at startup and remember acknowledgment [@jackz100](https://github.com/jackz100)
  - [#52177](https://github.com/openai/codex/pull/52177) Set a User-Agent for package archive downloads [@bolinfest](https://github.com/bolinfest)
  - [#52178](https://github.com/openai/codex/pull/52178) Strip symbols from source-built release package binaries [@bolinfest](https://github.com/bolinfest)
  - [#52182](https://github.com/openai/codex/pull/52182) Expose a verified sandbox launcher to local MCP servers [@bolinfest](https://github.com/bolinfest)
  - [#52183](https://github.com/openai/codex/pull/52183) Add optional descriptions to agent message board channels [@jif-oai](https://github.com/jif-oai)
  - [#52184](https://github.com/openai/codex/pull/52184) Preserve side conversations across thread navigation [@etraut-openai](https://github.com/etraut-openai)
  - [#52193](https://github.com/openai/codex/pull/52193) Enforce managed MXC requirements on Windows [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#52195](https://github.com/openai/codex/pull/52195) Track source attribution for individual context parts [@tz-openai](https://github.com/tz-openai)
  - [#52200](https://github.com/openai/codex/pull/52200) Allow plugin toggles while searching and preserve filters on refresh [@fcoury-oai](https://github.com/fcoury-oai)
  - [#52203](https://github.com/openai/codex/pull/52203) Expose Codex lifecycle status in iTerm2 sessions [@fcoury-oai](https://github.com/fcoury-oai)
  - [#52213](https://github.com/openai/codex/pull/52213) Stop bundling patched zsh in Codex packages [@jif-oai](https://github.com/jif-oai)
  - [#52215](https://github.com/openai/codex/pull/52215) Enforce application network policy in standalone MCP commands [@lsingh-oai](https://github.com/lsingh-oai)
  - [#52220](https://github.com/openai/codex/pull/52220) Add configurable default plugin activation policy [@stevenlee-oai](https://github.com/stevenlee-oai)
  - [#52223](https://github.com/openai/codex/pull/52223) Enforce application network policy for daemon updates [@jackz100](https://github.com/jackz100)
  - [#52225](https://github.com/openai/codex/pull/52225) Fix config rebuild call in the Windows MXC preference test [@virajrai-oai](https://github.com/virajrai-oai)
  - [#52226](https://github.com/openai/codex/pull/52226) Include foreground activity in iTerm2 session status [@fcoury-oai](https://github.com/fcoury-oai)
  - [#52228](https://github.com/openai/codex/pull/52228) Honor API-key feature gates in TUI Daybreak selection [@julee-oai](https://github.com/julee-oai)
  - [#52234](https://github.com/openai/codex/pull/52234) Support request IDs in exec-server WebSocket handshakes [@mattj-openai](https://github.com/mattj-openai)
  - [#52235](https://github.com/openai/codex/pull/52235) Recover gRPC code-mode sessions after missing-session errors [@surajs-oai](https://github.com/surajs-oai)
  - [#52241](https://github.com/openai/codex/pull/52241) Preserve subagent capabilities independently of forked history [@anp-oai](https://github.com/anp-oai)
  - [#52245](https://github.com/openai/codex/pull/52245) Enable parallel execution for read-only tools [@zamoshchin-openai](https://github.com/zamoshchin-openai)
  - [#52250](https://github.com/openai/codex/pull/52250) Add opt-in Guardian trust for orchestrator connector identities [@ankushg](https://github.com/ankushg)
  - [#52256](https://github.com/openai/codex/pull/52256) Normalize formatting in docs, web assets, and sample scripts [@anp-oai](https://github.com/anp-oai)
  - [#52268](https://github.com/openai/codex/pull/52268) Preserve large arguments in executed tool call metadata [@ningyi-oai](https://github.com/ningyi-oai)
  - [#52270](https://github.com/openai/codex/pull/52270) Enable text selection in the fullscreen TUI footer [@fcoury-oai](https://github.com/fcoury-oai)
  - [#52273](https://github.com/openai/codex/pull/52273) Add configurable persistent leader shortcuts to the TUI [@fcoury-oai](https://github.com/fcoury-oai)
  - [#52274](https://github.com/openai/codex/pull/52274) Add structured tracing for Guardian reviews and background scoring [@ioanbudea-OAI](https://github.com/ioanbudea-OAI)
  - [#52277](https://github.com/openai/codex/pull/52277) Preserve UTF-8 byte semantics in network domain matching [@rafael-oai](https://github.com/rafael-oai)
  - [#52278](https://github.com/openai/codex/pull/52278) Honor custom OTLP metrics exporters when analytics is disabled [@jackz100](https://github.com/jackz100)
  - [#52288](https://github.com/openai/codex/pull/52288) Remove duplicate field initializers from extension registry tests [@anp-oai](https://github.com/anp-oai)
  - [#52295](https://github.com/openai/codex/pull/52295) Emit one developer notice per incremental namespace update batch [@akira-oai](https://github.com/akira-oai)
  - [#52299](https://github.com/openai/codex/pull/52299) Make Bazel release jobs advisory [@anp-oai](https://github.com/anp-oai)
  - [#52302](https://github.com/openai/codex/pull/52302) Add opt-in credential masking for proxied sandboxed sessions [@winston-openai](https://github.com/winston-openai)
  - [#52304](https://github.com/openai/codex/pull/52304) Persist remote-control RPC preferences in managed daemon settings [@etraut-openai](https://github.com/etraut-openai)
  - [#52325](https://github.com/openai/codex/pull/52325) Track history initialization in Responses turn metadata [@anp-oai](https://github.com/anp-oai)
  - [#52329](https://github.com/openai/codex/pull/52329) Remove per-content source attribution metadata [@anp-oai](https://github.com/anp-oai)
  - [#52330](https://github.com/openai/codex/pull/52330) Clamp wrapped source ranges before remapping terminal hyperlinks [@bc-openai](https://github.com/bc-openai)
  - [#52337](https://github.com/openai/codex/pull/52337) Add durable thread read state with revision-checked updates [@btraut-openai](https://github.com/btraut-openai)
  - [#52350](https://github.com/openai/codex/pull/52350) Expose experimental durable thread read state in the app server [@btraut-openai](https://github.com/btraut-openai)
  - [#52363](https://github.com/openai/codex/pull/52363) Expand realtime v3 voice support [@jacksonmoody-oai](https://github.com/jacksonmoody-oai)
  - [#52381](https://github.com/openai/codex/pull/52381) Preserve per-session routing for gRPC code mode [@cassirer-openai](https://github.com/cassirer-openai)
  - [#52384](https://github.com/openai/codex/pull/52384) Notify subscribers when thread read state changes [@btraut-openai](https://github.com/btraut-openai)
  - [#52395](https://github.com/openai/codex/pull/52395) Add experimental app-server thread read-state updates [@btraut-openai](https://github.com/btraut-openai)
  - [#52418](https://github.com/openai/codex/pull/52418) Avoid an extra blank quote line when pasting text with a trailing newline [@bc-openai](https://github.com/bc-openai)
  - [#52535](https://github.com/openai/codex/pull/52535) Add opt-in history prefix preservation for full agent forks [@jif-oai](https://github.com/jif-oai)
  - [#52557](https://github.com/openai/codex/pull/52557) Forward clipboard copies to the terminal in Herdr sessions [@fcoury-oai](https://github.com/fcoury-oai)
  - [#52568](https://github.com/openai/codex/pull/52568) Expose message board permissions and structured denials [@jif-oai](https://github.com/jif-oai)
  - [#52591](https://github.com/openai/codex/pull/52591) Fix races in remote environment and session replacement tests [@jif-oai](https://github.com/jif-oai)
  - [#52608](https://github.com/openai/codex/pull/52608) Upgrade `hyper` to 1.11.1 and test connection closure [@jif-oai](https://github.com/jif-oai)
  - [#52610](https://github.com/openai/codex/pull/52610) Align Linux sandbox names and docs with bubblewrap and seccomp [@bolinfest](https://github.com/bolinfest)
  - [#52621](https://github.com/openai/codex/pull/52621) Add template setup for local agent message boards [@jif-oai](https://github.com/jif-oai)
  - [#52629](https://github.com/openai/codex/pull/52629) Consolidate local message board storage helpers [@jif-oai](https://github.com/jif-oai)
  - [#52635](https://github.com/openai/codex/pull/52635) Skip background workspace routing reads without ChatGPT auth [@joesavona](https://github.com/joesavona)
  - [#52637](https://github.com/openai/codex/pull/52637) Add experimental thread item lookup by ID [@btraut-openai](https://github.com/btraut-openai)
  - [#52640](https://github.com/openai/codex/pull/52640) Count interrupted goal continuations toward the no-activity limit [@etraut-openai](https://github.com/etraut-openai)
  - [#52648](https://github.com/openai/codex/pull/52648) Limit daemon feature compatibility checks to explicit CLI overrides [@etraut-openai](https://github.com/etraut-openai)
  - [#52652](https://github.com/openai/codex/pull/52652) Bound local exec-server output draining after process exit [@jif-oai](https://github.com/jif-oai)
  - [#52659](https://github.com/openai/codex/pull/52659) Add an opt-in feature for subagent model context defaults [@hlevy-openai](https://github.com/hlevy-openai)
  - [#52660](https://github.com/openai/codex/pull/52660) Handle completion events in either order in shell snapshot tests [@jif-oai](https://github.com/jif-oai)
  - [#52661](https://github.com/openai/codex/pull/52661) Prevent brokered credential aliases from bypassing MITM hooks [@viyatb-oai](https://github.com/viyatb-oai)
  - [#52671](https://github.com/openai/codex/pull/52671) Add retention annotations to submitted tool outputs [@won-openai](https://github.com/won-openai)
  - [#52674](https://github.com/openai/codex/pull/52674) Move the exec-server test fixture into shared test support [@anp-oai](https://github.com/anp-oai)
  - [#52676](https://github.com/openai/codex/pull/52676) Refresh persisted capability roots from owner-provided configuration [@teddywyly-oai](https://github.com/teddywyly-oai)
  - [#52679](https://github.com/openai/codex/pull/52679) Add timeout-aware exec-server configuration reads [@hlevy-openai](https://github.com/hlevy-openai)
  - [#52681](https://github.com/openai/codex/pull/52681) Reject reserved Serde JSON keys in code mode [@cassirer-openai](https://github.com/cassirer-openai)
  - [#52682](https://github.com/openai/codex/pull/52682) Validate Windows sandbox accounts before password repair [@zm-oai](https://github.com/zm-oai)
  - [#52685](https://github.com/openai/codex/pull/52685) Preserve code mode cancellation during output serialization [@cassirer-openai](https://github.com/cassirer-openai)
  - [#52686](https://github.com/openai/codex/pull/52686) Add opt-in retention for turn tool outputs [@won-openai](https://github.com/won-openai)
  - [#52689](https://github.com/openai/codex/pull/52689) Forward per-turn Cyber access programs to Guardian [@daneschneider-oai](https://github.com/daneschneider-oai)
  - [#52696](https://github.com/openai/codex/pull/52696) Fix marketplace path matching for Windows junctions [@zm-oai](https://github.com/zm-oai)
  - [#52700](https://github.com/openai/codex/pull/52700) Update the exec-server stable compatibility baseline to Codex 0.162.1 [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#52702](https://github.com/openai/codex/pull/52702) Retry bootstrap GETs through the system proxy after request failures [@abhinav-oai](https://github.com/abhinav-oai)
  - [#52707](https://github.com/openai/codex/pull/52707) Migrate the Windows MXC sandbox to split MXC crates [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#52721](https://github.com/openai/codex/pull/52721) Explain session creation failures during server shutdown [@etraut-openai](https://github.com/etraut-openai)
  - [#52723](https://github.com/openai/codex/pull/52723) Add opt-in gRPC over stdio for the code-mode host [@cconger](https://github.com/cconger)
  - [#52724](https://github.com/openai/codex/pull/52724) Add observers for initial exec-server connection attempts [@aaronl-openai](https://github.com/aaronl-openai)
  - [#52725](https://github.com/openai/codex/pull/52725) Report terminal program status with OSC 7501 [@fcoury-oai](https://github.com/fcoury-oai)
  - [#52736](https://github.com/openai/codex/pull/52736) Allow model catalogs to override incremental tool notices [@akira-oai](https://github.com/akira-oai)
  - [#52742](https://github.com/openai/codex/pull/52742) Add opt-in output token replay for OpenAI requests [@pakrym-oai](https://github.com/pakrym-oai)
  - [#52748](https://github.com/openai/codex/pull/52748) Make code-mode `exit()` stop the entire cell [@cconger](https://github.com/cconger)
  - [#52756](https://github.com/openai/codex/pull/52756) Classify voice session failures and record terminal outcomes [@bc-openai](https://github.com/bc-openai)
  - [#52778](https://github.com/openai/codex/pull/52778) Make pinned transcript prompts clickable [@fcoury-oai](https://github.com/fcoury-oai)
  - [#52825](https://github.com/openai/codex/pull/52825) Report exec runtime resets before accepting further requests [@JenZhao](https://github.com/JenZhao)
  - [#52923](https://github.com/openai/codex/pull/52923) Stabilize the realtime steering timeline test [@anp-oai](https://github.com/anp-oai)
  - [#52937](https://github.com/openai/codex/pull/52937) Retain client-marked tool outputs across compaction [@won-openai](https://github.com/won-openai)
  - [#52946](https://github.com/openai/codex/pull/52946) Keep agent command center rows stable across progress updates [@fcoury-oai](https://github.com/fcoury-oai)
  - [#52952](https://github.com/openai/codex/pull/52952) Verify reset notification during code-mode host recovery [@etraut-openai](https://github.com/etraut-openai)
  - [#52959](https://github.com/openai/codex/pull/52959) Reduce stack usage in async TUI tests [@jif-oai](https://github.com/jif-oai)
  - [#52964](https://github.com/openai/codex/pull/52964) Defer owned transcript redraws during raw paste bursts [@etraut-openai](https://github.com/etraut-openai)
  - [#52967](https://github.com/openai/codex/pull/52967) Reuse and prewarm the WSL clipboard text reader [@etraut-openai](https://github.com/etraut-openai)
  - [#52968](https://github.com/openai/codex/pull/52968) Keep startup modals protected when terminal input draining times out [@etraut-openai](https://github.com/etraut-openai)
  - [#52972](https://github.com/openai/codex/pull/52972) Upgrade `rmcp` to `3.5.1` and harden lifecycle tests [@alishobeiri-oai](https://github.com/alishobeiri-oai)
  - [#52990](https://github.com/openai/codex/pull/52990) Add a searchable `/config` preferences panel to the TUI [@fcoury-oai](https://github.com/fcoury-oai)
  - [#53049](https://github.com/openai/codex/pull/53049) Add connection-bound reply handles for app-server requests [@bc-openai](https://github.com/bc-openai)
  - [#53109](https://github.com/openai/codex/pull/53109) Handle broken pipes gracefully in plugin list output [@fcoury-oai](https://github.com/fcoury-oai)
  - [#53148](https://github.com/openai/codex/pull/53148) Fix startup draft recovery for pending Vim Replace keys [@etraut-openai](https://github.com/etraut-openai)
  - [#53150](https://github.com/openai/codex/pull/53150) Restore thread-owned permissions on cold resume [@etraut-openai](https://github.com/etraut-openai)
  - [#53152](https://github.com/openai/codex/pull/53152) Allow selecting and copying TUI turn tips [@etraut-openai](https://github.com/etraut-openai)
  - [#53153](https://github.com/openai/codex/pull/53153) Show subagent navigation shortcuts in TUI help [@etraut-openai](https://github.com/etraut-openai)
  - [#53155](https://github.com/openai/codex/pull/53155) Keep remote app-server events deliverable during shutdown [@etraut-openai](https://github.com/etraut-openai)
  - [#53156](https://github.com/openai/codex/pull/53156) Simplify the custom terminal drawing API [@bc-openai](https://github.com/bc-openai)
  - [#53173](https://github.com/openai/codex/pull/53173) Allow restarting managed background servers from the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#53201](https://github.com/openai/codex/pull/53201) Keep agents navigation available after a thread is archived [@etraut-openai](https://github.com/etraut-openai)
  - [#53224](https://github.com/openai/codex/pull/53224) Support Windows clipboard text paste shortcuts in the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#53331](https://github.com/openai/codex/pull/53331) Finish remote exec cleanup when output streams remain open [@jif-oai](https://github.com/jif-oai)
  - [#53339](https://github.com/openai/codex/pull/53339) Test final polling of remote processes with open output streams [@jif-oai](https://github.com/jif-oai)
  - [#53358](https://github.com/openai/codex/pull/53358) Remove selected protocol, apply-patch, MCP, and TUI tests [@vb-openai](https://github.com/vb-openai)
  - [#53369](https://github.com/openai/codex/pull/53369) Allow turns when the agent message board is unavailable [@jif-oai](https://github.com/jif-oai)
  - [#53382](https://github.com/openai/codex/pull/53382) Ignore the unsafe-libyaml advisory in dependency audits [@swastik-oai](https://github.com/swastik-oai)
  - [#53389](https://github.com/openai/codex/pull/53389) Use cached login credentials for Guardian decisions [@swastik-oai](https://github.com/swastik-oai)
  - [#53393](https://github.com/openai/codex/pull/53393) Distinguish Guardian parent-compaction failure reasons [@ioanbudea-OAI](https://github.com/ioanbudea-OAI)
  - [#53400](https://github.com/openai/codex/pull/53400) Add explicit local board connections with fixed runtime access [@jif-oai](https://github.com/jif-oai)
  - [#53412](https://github.com/openai/codex/pull/53412) Isolate arg0 helper directories by operating system [@jif-oai](https://github.com/jif-oai)
  - [#53419](https://github.com/openai/codex/pull/53419) Restore saved thread permissions during configuration loading [@jif-oai](https://github.com/jif-oai)
  - [#53424](https://github.com/openai/codex/pull/53424) Add regression coverage for network grants on cold thread resume [@jif-oai](https://github.com/jif-oai)
  - [#53426](https://github.com/openai/codex/pull/53426) Preserve Windows runtime registration failure diagnostics [@zm-oai](https://github.com/zm-oai)
  - [#53429](https://github.com/openai/codex/pull/53429) Apply configuration toggles live and improve settings navigation [@fcoury-oai](https://github.com/fcoury-oai)
  - [#53436](https://github.com/openai/codex/pull/53436) Route TUI request replies to their originating connection and thread [@bc-openai](https://github.com/bc-openai)
  - [#53438](https://github.com/openai/codex/pull/53438) Stop identifying Apple Terminal from `TERM_SESSION_ID` [@etraut-openai](https://github.com/etraut-openai)
  - [#53440](https://github.com/openai/codex/pull/53440) Preserve status line accents on 16-color terminals [@etraut-openai](https://github.com/etraut-openai)
  - [#53443](https://github.com/openai/codex/pull/53443) Use local MSVC toolchains for native Windows Bazel tests [@etraut-openai](https://github.com/etraut-openai)
  - [#53444](https://github.com/openai/codex/pull/53444) Suppress repeated turn diffs in `codex exec` human output [@fcoury-oai](https://github.com/fcoury-oai)
  - [#53451](https://github.com/openai/codex/pull/53451) Treat incomplete responses as terminal errors [@jif-oai](https://github.com/jif-oai)
  - [#53452](https://github.com/openai/codex/pull/53452) Close input admission while a turn finishes recording [@etraut-openai](https://github.com/etraut-openai)
  - [#53453](https://github.com/openai/codex/pull/53453) Prefer the Windows clipboard and bound copy attempts on WSL [@etraut-openai](https://github.com/etraut-openai)
  - [#53485](https://github.com/openai/codex/pull/53485) Update `quinn-proto` to 0.11.18 [@smurching-oai](https://github.com/smurching-oai)
  - [#53496](https://github.com/openai/codex/pull/53496) Preserve pending Effects toggles across save refreshes [@fcoury-oai](https://github.com/fcoury-oai)
  - [#53506](https://github.com/openai/codex/pull/53506) Reject duplicate Host headers in the network proxy [@jfoo-oai](https://github.com/jfoo-oai)
  - [#53556](https://github.com/openai/codex/pull/53556) Deduplicate TUI modifier handling and terminal color caching [@bc-openai](https://github.com/bc-openai)
  - [#53595](https://github.com/openai/codex/pull/53595) Add async compaction feature configuration [@rka-oai](https://github.com/rka-oai)
  - [#53606](https://github.com/openai/codex/pull/53606) Prepare compaction helpers for background requests [@rka-oai](https://github.com/rka-oai)
  - [#53614](https://github.com/openai/codex/pull/53614) Add infrastructure for speculative remote V2 compaction [@rka-oai](https://github.com/rka-oai)
  - [#53617](https://github.com/openai/codex/pull/53617) Allow hiding native tools while retaining the multi-agent V2 runtime [@jif-oai](https://github.com/jif-oai)
  - [#53620](https://github.com/openai/codex/pull/53620) Reuse background results for remote V2 compaction [@rka-oai](https://github.com/rka-oai)
  - [#53622](https://github.com/openai/codex/pull/53622) Preserve remote exec output until it is collected [@jif-oai](https://github.com/jif-oai)
  - [#53628](https://github.com/openai/codex/pull/53628) Record truncation metrics for accepted Guardian review inputs [@ioanbudea-OAI](https://github.com/ioanbudea-OAI)
  - [#53631](https://github.com/openai/codex/pull/53631) Materialize the thread before testing a discovered daemon restart [@jif-oai](https://github.com/jif-oai)
  - [#53632](https://github.com/openai/codex/pull/53632) Stabilize write ordering in the shared message board scenario [@jif-oai](https://github.com/jif-oai)
  - [#53633](https://github.com/openai/codex/pull/53633) Add an environment API key fallback for Guardian Decisions [@swastik-oai](https://github.com/swastik-oai)
  - [#53654](https://github.com/openai/codex/pull/53654) Keep spawned children provisional until the spawn result returns [@jif-oai](https://github.com/jif-oai)
  - [#53657](https://github.com/openai/codex/pull/53657) Share hook configuration across cloned hook views [@jif-oai](https://github.com/jif-oai)
  - [#53660](https://github.com/openai/codex/pull/53660) Extract shared multi-agent v2 thread spawning [@jif-oai](https://github.com/jif-oai)
  - [#53668](https://github.com/openai/codex/pull/53668) Improve remote exec-server test startup diagnostics [@jif-oai](https://github.com/jif-oai)
  - [#53670](https://github.com/openai/codex/pull/53670) Account for token usage from incomplete responses [@jif-oai](https://github.com/jif-oai)
  - [#53672](https://github.com/openai/codex/pull/53672) Keep discovered Apps tools available during startup recovery [@jif-oai](https://github.com/jif-oai)
  - [#53673](https://github.com/openai/codex/pull/53673) Publish Rust releases with the GitHub CLI [@jif-oai](https://github.com/jif-oai)
  - [#53678](https://github.com/openai/codex/pull/53678) Preserve inherited context in prediction forks [@keyz](https://github.com/keyz)
  - [#53689](https://github.com/openai/codex/pull/53689) Constrain API-key model access programs to server support [@julee-oai](https://github.com/julee-oai)
  - [#53691](https://github.com/openai/codex/pull/53691) Account for replay caches in encrypted compaction budgets [@ioanbudea-OAI](https://github.com/ioanbudea-OAI)
  - [#53693](https://github.com/openai/codex/pull/53693) Add keyboard selection support to the transcript view [@fcoury-oai](https://github.com/fcoury-oai)
  - [#53698](https://github.com/openai/codex/pull/53698) Interrupt and drain canceled classifier responses before socket reuse [@felixxia-oai](https://github.com/felixxia-oai)
  - [#53699](https://github.com/openai/codex/pull/53699) Cancel Guardian V2 classifications that exceed the tool-call lag window [@felixxia-oai](https://github.com/felixxia-oai)
  - [#53701](https://github.com/openai/codex/pull/53701) Enable CLI Daybreak by default and enforce background-turn eligibility [@julee-oai](https://github.com/julee-oai)
  - [#53706](https://github.com/openai/codex/pull/53706) Preserve URLs and email addresses during external agent migration [@jif-oai](https://github.com/jif-oai)
  - [#53709](https://github.com/openai/codex/pull/53709) Separate MCP sandbox policy from launcher metadata [@bolinfest](https://github.com/bolinfest)
  - [#53717](https://github.com/openai/codex/pull/53717) Enable Cyber access programs for API-key sessions by default [@julee-oai](https://github.com/julee-oai)
  - [#53723](https://github.com/openai/codex/pull/53723) Wire V2 capability discovery through exec-server RPC [@TAFOYA-OAI](https://github.com/TAFOYA-OAI)

[Full release on Github](https://github.com/openai/codex/releases/tag/rust-v0.163.0)

- 2026-10-14



### GPT-5.5 retirement in Codex




Effective October 14, 2026, at noon PDT (19:00 UTC), GPT-5.5 retires from
Codex for users signed in with ChatGPT. The OpenAI API and Codex sessions
authenticated with an API key aren’t affected.



Use **GPT-6.1 Sol** (`gpt-6.1-sol`) when available to your plan and client.
Update workspace defaults, saved model settings, managed configurations,
custom agents, scheduled tasks, and scripts that still select `gpt-5.5`.



See [GPT-5.5 retirement](https://learn.chatgpt.com/docs/models#gpt-55-retirement) for plan-specific
replacements and [workspace model availability](https://learn.chatgpt.com/docs/enterprise/workspace-model-availability#prepare-for-the-gpt-55-retirement)
for administrator guidance.

- 2026-10-09



### Composer predictions in Codex




Composer predictions adds autocomplete-style suggestions for your next message in
the Codex desktop app. After Codex responds, it uses the current conversation to
suggest a follow-up prompt in the message box. Press **Tab** to accept the suggestion
as an editable draft, or type your own message. Accepting a prediction doesn’t send
it for you.



The feature is available in beta to users aged 18 and older with personal ChatGPT
Pro plans in supported regions, in local and SSH threads with GPT-6 Astra and
GPT-6.1 Sol.



Learn more about [composer predictions](https://learn.chatgpt.com/docs/features/composer-predictions).

- 2026-10-09



### Codex CLI 0.162.1






```
$ npm install -g @openai/codex@0.162.1


```



View details



## Bug Fixes



  - Fixed a TUI crash when asynchronous questions contain multiple lines, preserving line breaks and complete hyperlink destinations. ( [#51866](https://github.com/openai/codex/pull/51866))
  - Fixed startup failures caused by differences between a running background server's feature settings and CLI defaults. Compatibility checks now apply only to explicit command-line feature overrides. ( [#52648](https://github.com/openai/codex/pull/52648))

Full Changelog: [`rust-v0.162.0...rust-v0.162.1`](https://github.com/openai/codex/compare/rust-v0.162.0...rust-v0.162.1)

[Full release on Github](https://github.com/openai/codex/releases/tag/rust-v0.162.1)

- 2026-10-08



### Codex app  26.1007




### Performance improvements and bug fixes



  - Fixed queued messages getting stuck on **Sending** and restored **Steer** in
    secondary app windows.
  - Improved scrolling and navigation between files in the **Changes** panel.
  - Added clearer recovery guidance when a tool call needs approval but the chat’s
    permissions prevent approval requests, with a link to those permissions when available.

- 2026-10-08



### GPT-6.1 Sol Ultrafast in Codex and ChatGPT Work




Ultrafast mode speeds up token generation with GPT-6.1 Sol in Codex and
ChatGPT Work.



Ultrafast is available on Pro $500 and eligible Enterprise and Edu plans.
Enterprise access is off by default; workspace owners must enable it.
GPT-6.1 Sol Ultrafast supports inference residency in the United States and
Europe (EEA + Switzerland).



See [Ultrafast mode](https://learn.chatgpt.com/docs/agent-configuration/speed#ultrafast-mode) for plan
and workspace requirements, [Models](https://learn.chatgpt.com/docs/models#gpt-61-sol) for model
guidance, and [Pricing](https://learn.chatgpt.com/docs/pricing) for usage and credit rates.

- 2026-10-08



### Codex CLI 0.162.0






```
$ npm install -g @openai/codex@0.162.0


```



View details



## New Features



  - Add tools for creating and listing managed Git worktrees from trusted local projects when the worktrees feature is enabled. ( [#50148](https://github.com/openai/codex/pull/50148))
  - Pin tasks in the agent Command Center with `p` and keep them in a shared Pinned group when supported by the server. ( [#51500](https://github.com/openai/codex/pull/51500))
  - Navigate and copy transcript blocks with `/copy`, use `Ctrl+Insert` to copy selections, and tune mouse-wheel scrolling with `tui.mouse_scroll_speed`. ( [#50434](https://github.com/openai/codex/pull/50434), [#50215](https://github.com/openai/codex/pull/50215), [#50209](https://github.com/openai/codex/pull/50209))
  - Make URLs clickable in approval headers, questions, MCP prompts, warnings, banners, and verification prompts, including when links wrap across lines. ( [#51439](https://github.com/openai/codex/pull/51439), [#51449](https://github.com/openai/codex/pull/51449), [#51450](https://github.com/openai/codex/pull/51450), [#51451](https://github.com/openai/codex/pull/51451), [#51452](https://github.com/openai/codex/pull/51452), [#51458](https://github.com/openai/codex/pull/51458))
  - Configure live web access and remote compaction capabilities for custom Responses-compatible model providers. ( [#50459](https://github.com/openai/codex/pull/50459))
  - Add JavaScript helpers for streaming promise results as they settle, plus opt-in ranked tool search in Code Mode. ( [#51126](https://github.com/openai/codex/pull/51126), [#51209](https://github.com/openai/codex/pull/51209))

## Bug Fixes

  - Respect server model and reasoning-summary defaults for new TUI threads while retaining explicit launch overrides. ( [#50013](https://github.com/openai/codex/pull/50013), [#50811](https://github.com/openai/codex/pull/50811), [#50913](https://github.com/openai/codex/pull/50913))
  - Preserve existing CRLF line endings in `apply_patch` updates without requiring an opt-in. ( [#51203](https://github.com/openai/codex/pull/51203))
  - Fix Linux sandbox startup with multiple denied files, reject writable sandbox-construction executables, and keep ripgrep configuration from weakening deny-glob masks. ( [#50059](https://github.com/openai/codex/pull/50059), [#51211](https://github.com/openai/codex/pull/51211), [#51407](https://github.com/openai/codex/pull/51407), [#51527](https://github.com/openai/codex/pull/51527))
  - Restore ordinary drive-letter file access on Windows 10 and match Windows sandbox temp permissions to the child process environment. ( [#51511](https://github.com/openai/codex/pull/51511), [#51512](https://github.com/openai/codex/pull/51512))
  - Honor server `Retry-After` advice for retryable Responses and WebSocket failures. ( [#50418](https://github.com/openai/codex/pull/50418), [#51440](https://github.com/openai/codex/pull/51440))
  - Fix archive checksum verification when installing through Windows PowerShell with PowerShell 7 module paths present. ( [#51257](https://github.com/openai/codex/pull/51257))

## Chores

  - Publish a signed PowerShell installer with Windows releases. ( [#51158](https://github.com/openai/codex/pull/51158))
  - Keep older stable releases and prereleases from replacing newer stable download targets or installer aliases. ( [#51186](https://github.com/openai/codex/pull/51186), [#51425](https://github.com/openai/codex/pull/51425))

## Changelog

Full Changelog: [`rust-v0.161.0...rust-v0.162.0`](https://github.com/openai/codex/compare/rust-v0.161.0...rust-v0.162.0)

  - [#50013](https://github.com/openai/codex/pull/50013) Honor server model defaults when starting fresh TUI threads [@etraut-openai](https://github.com/etraut-openai)
  - [#50018](https://github.com/openai/codex/pull/50018) Use descriptor-safe helpers for executable test fixtures [@jif-oai](https://github.com/jif-oai)
  - [#50019](https://github.com/openai/codex/pull/50019) Protect the guardian decisions API key from environment forwarding [@swastik-oai](https://github.com/swastik-oai)
  - [#50026](https://github.com/openai/codex/pull/50026) Preserve user restrictions in Guardian handoff context [@jif-oai](https://github.com/jif-oai)
  - [#50035](https://github.com/openai/codex/pull/50035) Follow MCP tool pagination in legacy protocol mode [@jif-oai](https://github.com/jif-oai)
  - [#50039](https://github.com/openai/codex/pull/50039) Keep transcript Find results readable after closing the query [@fcoury-oai](https://github.com/fcoury-oai)
  - [#50045](https://github.com/openai/codex/pull/50045) Keep transcript Find expansion scoped to the current match [@fcoury-oai](https://github.com/fcoury-oai)
  - [#50046](https://github.com/openai/codex/pull/50046) Stabilize Windows voice build cache keys across tool reinstalls [@anp-oai](https://github.com/anp-oai)
  - [#50050](https://github.com/openai/codex/pull/50050) Keep plugin and skill snapshots scoped to each step [@sayan-oai](https://github.com/sayan-oai)
  - [#50052](https://github.com/openai/codex/pull/50052) Preserve question context in recovered TUI answer drafts [@imac-oai](https://github.com/imac-oai)
  - [#50054](https://github.com/openai/codex/pull/50054) Check token estimate filtering directly on the tracing subscriber [@tamird](https://github.com/tamird)
  - [#50058](https://github.com/openai/codex/pull/50058) Upgrade Windows bindings to `windows-sys` 0.61.2 [@tamird](https://github.com/tamird)
  - [#50059](https://github.com/openai/codex/pull/50059) Fix Linux sandbox startup with multiple denied files [@yuzhu-oai](https://github.com/yuzhu-oai)
  - [#50066](https://github.com/openai/codex/pull/50066) Add a bounded Decisions transport for Guardian comparison classification [@swastik-oai](https://github.com/swastik-oai)
  - [#50082](https://github.com/openai/codex/pull/50082) Enable dynamic tool inheritance for fresh V2 subagents [@ke-oai](https://github.com/ke-oai)
  - [#50083](https://github.com/openai/codex/pull/50083) Add paginated reverse lookup for thread attachments [@joeytrasatti-openai](https://github.com/joeytrasatti-openai)
  - [#50087](https://github.com/openai/codex/pull/50087) Preserve queued agent mail across session eviction [@jif-oai](https://github.com/jif-oai)
  - [#50093](https://github.com/openai/codex/pull/50093) Prevent shared instruction providers from delegating to themselves [@bryanashley](https://github.com/bryanashley)
  - [#50094](https://github.com/openai/codex/pull/50094) Add attachment owner lookup to the app-server [@joeytrasatti-openai](https://github.com/joeytrasatti-openai)
  - [#50099](https://github.com/openai/codex/pull/50099) Add opt-in Decisions comparison for Guardian V2 [@swastik-oai](https://github.com/swastik-oai)
  - [#50105](https://github.com/openai/codex/pull/50105) Consolidate chat composer footer logic in `footer_state` [@imac-oai](https://github.com/imac-oai)
  - [#50109](https://github.com/openai/codex/pull/50109) Keep fullscreen prompts bounded and scrollable [@imac-oai](https://github.com/imac-oai)
  - [#50112](https://github.com/openai/codex/pull/50112) Centralize TUI loading glyphs and frame scheduling [@imac-oai](https://github.com/imac-oai)
  - [#50113](https://github.com/openai/codex/pull/50113) Add a native gRPC client for cloud thread resume and attach [@bc-openai](https://github.com/bc-openai)
  - [#50128](https://github.com/openai/codex/pull/50128) Expose the model selected for a running turn's next step [@sayan-oai](https://github.com/sayan-oai)
  - [#50129](https://github.com/openai/codex/pull/50129) Preserve Windows environment variables for remote MCP servers [@aidanv-oai](https://github.com/aidanv-oai)
  - [#50131](https://github.com/openai/codex/pull/50131) Add opt-in JSON diagnostics for TCP tunnels [@richardopenai](https://github.com/richardopenai)
  - [#50140](https://github.com/openai/codex/pull/50140) Use the server permission catalog for TUI permission shortcuts [@etraut-openai](https://github.com/etraut-openai)
  - [#50148](https://github.com/openai/codex/pull/50148) Add managed worktree tools to the TUI [@bc-openai](https://github.com/bc-openai)
  - [#50162](https://github.com/openai/codex/pull/50162) Bound in-flight file opens in exec-server [@anp-oai](https://github.com/anp-oai)
  - [#50166](https://github.com/openai/codex/pull/50166) Upgrade `age` to 0.12.1 and remove the obsolete advisory exception [@michaelm-openai](https://github.com/michaelm-openai)
  - [#50177](https://github.com/openai/codex/pull/50177) Enable writable file streaming in exec-server [@anp-oai](https://github.com/anp-oai)
  - [#50183](https://github.com/openai/codex/pull/50183) Add `dots` to issue labeler guidance [@etraut-openai](https://github.com/etraut-openai)
  - [#50189](https://github.com/openai/codex/pull/50189) Replace the Figma OAuth exception with Mercado Pago [@mzeng-openai](https://github.com/mzeng-openai)
  - [#50199](https://github.com/openai/codex/pull/50199) Restore the account email in `/status` after account updates [@etraut-openai](https://github.com/etraut-openai)
  - [#50200](https://github.com/openai/codex/pull/50200) Report the configured TUI mode in `codex doctor` [@etraut-openai](https://github.com/etraut-openai)
  - [#50207](https://github.com/openai/codex/pull/50207) Release stable Markdown tables into scrollback during streaming [@etraut-openai](https://github.com/etraut-openai)
  - [#50209](https://github.com/openai/codex/pull/50209) Make transcript mouse scroll speed configurable [@etraut-openai](https://github.com/etraut-openai)
  - [#50215](https://github.com/openai/codex/pull/50215) Support Ctrl+Insert for copying TUI selections [@etraut-openai](https://github.com/etraut-openai)
  - [#50216](https://github.com/openai/codex/pull/50216) Use the shared text editor for command-center task renaming [@bc-openai](https://github.com/bc-openai)
  - [#50219](https://github.com/openai/codex/pull/50219) Bound tmux option probes to one second [@etraut-openai](https://github.com/etraut-openai)
  - [#50273](https://github.com/openai/codex/pull/50273) Record Guardian V2 Decisions agreement and latency metrics [@swastik-oai](https://github.com/swastik-oai)
  - [#50339](https://github.com/openai/codex/pull/50339) Add end-to-end coverage for MCP sandbox state enforcement [@bolinfest](https://github.com/bolinfest)
  - [#50345](https://github.com/openai/codex/pull/50345) Keep the subagent picker consistent with thread archive state [@etraut-openai](https://github.com/etraut-openai)
  - [#50348](https://github.com/openai/codex/pull/50348) Back off automatic remote control reconnects with jitter [@cooper-oai](https://github.com/cooper-oai)
  - [#50354](https://github.com/openai/codex/pull/50354) Skip unrelated subtrees during config alias normalization [@btraut-openai](https://github.com/btraut-openai)
  - [#50359](https://github.com/openai/codex/pull/50359) Render ANSI styles in TUI hook system messages [@etraut-openai](https://github.com/etraut-openai)
  - [#50360](https://github.com/openai/codex/pull/50360) Remove initial messages from session configuration events [@owenlin0](https://github.com/owenlin0)
  - [#50375](https://github.com/openai/codex/pull/50375) Use printable ASCII terminal titles under GNU Screen [@imac-oai](https://github.com/imac-oai)
  - [#50380](https://github.com/openai/codex/pull/50380) Fix thread unloading after disconnect during MCP startup [@yuzhu-oai](https://github.com/yuzhu-oai)
  - [#50384](https://github.com/openai/codex/pull/50384) Allow opting into 16 KiB ARM64 code pages for macOS signing [@chess-oai](https://github.com/chess-oai)
  - [#50389](https://github.com/openai/codex/pull/50389) Honor configured keybindings before transcript navigation [@etraut-openai](https://github.com/etraut-openai)
  - [#50396](https://github.com/openai/codex/pull/50396) Honor pager bindings for transcript page keys [@bc-openai](https://github.com/bc-openai)
  - [#50402](https://github.com/openai/codex/pull/50402) Consolidate command execution output into `aggregated_output` [@owenlin0](https://github.com/owenlin0)
  - [#50416](https://github.com/openai/codex/pull/50416) Clarify Git worktree choices for new and forked conversations [@bc-openai](https://github.com/bc-openai)
  - [#50418](https://github.com/openai/codex/pull/50418) Honor Retry-After headers in failed Responses events [@anp-oai](https://github.com/anp-oai)
  - [#50427](https://github.com/openai/codex/pull/50427) Cap persisted command output in paginated history at 64 KiB [@owenlin0](https://github.com/owenlin0)
  - [#50431](https://github.com/openai/codex/pull/50431) Preserve terminal hyperlinks in agents overview previews [@bc-openai](https://github.com/bc-openai)
  - [#50433](https://github.com/openai/codex/pull/50433) Allow API-key accounts to use Daybreak in the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#50434](https://github.com/openai/codex/pull/50434) Add keyboard copy selection to the owned transcript [@bc-openai](https://github.com/bc-openai)
  - [#50435](https://github.com/openai/codex/pull/50435) Persist additional tool definitions in rollout history [@pakrym-oai](https://github.com/pakrym-oai)
  - [#50437](https://github.com/openai/codex/pull/50437) Add a CLI command to uninstall the legacy Windows sandbox [@chess-oai](https://github.com/chess-oai)
  - [#50441](https://github.com/openai/codex/pull/50441) Support ordered response items in world-state context updates [@pakrym-oai](https://github.com/pakrym-oai)
  - [#50442](https://github.com/openai/codex/pull/50442) Preserve native USD amounts in thread usage responses [@asohrabi-oai](https://github.com/asohrabi-oai)
  - [#50443](https://github.com/openai/codex/pull/50443) Stabilize paused-time code-mode service tests [@seanh-oai](https://github.com/seanh-oai)
  - [#50445](https://github.com/openai/codex/pull/50445) Assert that only direct tool calls emit timing events [@seanh-oai](https://github.com/seanh-oai)
  - [#50446](https://github.com/openai/codex/pull/50446) Bundle rollout attachments into a gzip tar archive [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#50447](https://github.com/openai/codex/pull/50447) Remove the provider capability gate for tool namespaces [@pakrym-oai](https://github.com/pakrym-oai)
  - [#50454](https://github.com/openai/codex/pull/50454) Measure rollout persistence size reductions [@owenlin0](https://github.com/owenlin0)
  - [#50458](https://github.com/openai/codex/pull/50458) Truncate oversized MCP results in paginated thread history [@owenlin0](https://github.com/owenlin0)
  - [#50459](https://github.com/openai/codex/pull/50459) Add capability overrides for custom model providers [@celia-oai](https://github.com/celia-oai)
  - [#50462](https://github.com/openai/codex/pull/50462) Populate thread previews from delegated task inputs [@bc-openai](https://github.com/bc-openai)
  - [#50464](https://github.com/openai/codex/pull/50464) Add the `incremental_tools` feature flag [@pakrym-oai](https://github.com/pakrym-oai)
  - [#50465](https://github.com/openai/codex/pull/50465) Retry registry authentication outages and jitter executor reconnects [@apanasenko-oai](https://github.com/apanasenko-oai)
  - [#50467](https://github.com/openai/codex/pull/50467) Copy transcript selections as literal text while preserving rich HTML [@fcoury-oai](https://github.com/fcoury-oai)
  - [#50470](https://github.com/openai/codex/pull/50470) Account for JSON overhead when truncating MCP tool results [@owenlin0](https://github.com/owenlin0)
  - [#50472](https://github.com/openai/codex/pull/50472) Enable Ultrafast service tiers for Amazon Bedrock Astra models [@celia-oai](https://github.com/celia-oai)
  - [#50477](https://github.com/openai/codex/pull/50477) Use the app-server default output cap for TUI workspace commands [@etraut-openai](https://github.com/etraut-openai)
  - [#50480](https://github.com/openai/codex/pull/50480) Skip managed config loading for registered Windows sandbox refreshes [@zm-oai](https://github.com/zm-oai)
  - [#50499](https://github.com/openai/codex/pull/50499) Include installer stderr in daemon update failures [@etraut-openai](https://github.com/etraut-openai)
  - [#50503](https://github.com/openai/codex/pull/50503) Use Enter to accept transcript Find results and Escape to cancel [@fcoury-oai](https://github.com/fcoury-oai)
  - [#50504](https://github.com/openai/codex/pull/50504) Center TUI confirmations over their retained backdrop [@bc-openai](https://github.com/bc-openai)
  - [#50505](https://github.com/openai/codex/pull/50505) Keep Command Center selection adjacent after task removal [@bc-openai](https://github.com/bc-openai)
  - [#50507](https://github.com/openai/codex/pull/50507) Record Windows sandbox service stop diagnostics [@zm-oai](https://github.com/zm-oai)
  - [#50510](https://github.com/openai/codex/pull/50510) Require GovCloud guidance acknowledgment after Bedrock setup [@jackz100](https://github.com/jackz100)
  - [#50516](https://github.com/openai/codex/pull/50516) Add scenario coverage for remote `/compact` context preservation [@pakrym-oai](https://github.com/pakrym-oai)
  - [#50525](https://github.com/openai/codex/pull/50525) Reject unknown TUI keys in strict config validation [@etraut-openai](https://github.com/etraut-openai)
  - [#50531](https://github.com/openai/codex/pull/50531) Persist realtime transcript tails before closure without inference [@guinness-oai](https://github.com/guinness-oai)
  - [#50536](https://github.com/openai/codex/pull/50536) Keep shared MCP types stable in Code Mode exec descriptions [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#50540](https://github.com/openai/codex/pull/50540) Send incremental tool catalog updates in Responses Lite [@pakrym-oai](https://github.com/pakrym-oai)
  - [#50546](https://github.com/openai/codex/pull/50546) Keep MCP resource helpers available in code mode [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#50555](https://github.com/openai/codex/pull/50555) Skip daemon auto-start for Windows-mounted WSL homes [@etraut-openai](https://github.com/etraut-openai)
  - [#50558](https://github.com/openai/codex/pull/50558) Avoid reading the current directory when resolving absolute paths [@etraut-openai](https://github.com/etraut-openai)
  - [#50559](https://github.com/openai/codex/pull/50559) Distinguish daemon release identity from executable contents [@etraut-openai](https://github.com/etraut-openai)
  - [#50562](https://github.com/openai/codex/pull/50562) Keep Code Mode tool discovery guidance stable across catalog changes [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#50564](https://github.com/openai/codex/pull/50564) Allow transcript selection and copying while bottom modals are open [@etraut-openai](https://github.com/etraut-openai)
  - [#50687](https://github.com/openai/codex/pull/50687) Keep third-party tools deferred in strict Code Mode Only [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#50695](https://github.com/openai/codex/pull/50695) Preserve local Markdown link labels in the TUI [@bc-openai](https://github.com/bc-openai)
  - [#50700](https://github.com/openai/codex/pull/50700) Let the transport create the Windows remote-control socket directory [@etraut-openai](https://github.com/etraut-openai)
  - [#50720](https://github.com/openai/codex/pull/50720) Decode Windows Terminal's mapped Shift+Enter sequence [@bc-openai](https://github.com/bc-openai)
  - [#50727](https://github.com/openai/codex/pull/50727) Show model and reasoning effort near the top of task details [@etraut-openai](https://github.com/etraut-openai)
  - [#50741](https://github.com/openai/codex/pull/50741) Keep environment-backed tools exposed across readiness changes [@won-openai](https://github.com/won-openai)
  - [#50756](https://github.com/openai/codex/pull/50756) Show unavailable slash commands when searched in side conversations [@bc-openai](https://github.com/bc-openai)
  - [#50764](https://github.com/openai/codex/pull/50764) Allow `/archive` while a turn is running [@bc-openai](https://github.com/bc-openai)
  - [#50781](https://github.com/openai/codex/pull/50781) Restrict TUI MCP startup notifications to owned threads [@etraut-openai](https://github.com/etraut-openai)
  - [#50782](https://github.com/openai/codex/pull/50782) Retry Windows daemon release publication on transient file locks [@etraut-openai](https://github.com/etraut-openai)
  - [#50786](https://github.com/openai/codex/pull/50786) Remember Command Center grouping across launches [@bc-openai](https://github.com/bc-openai)
  - [#50788](https://github.com/openai/codex/pull/50788) Open slash commands from empty drafts in Vim Normal mode [@bc-openai](https://github.com/bc-openai)
  - [#50802](https://github.com/openai/codex/pull/50802) Fall back to mklink when Windows daemon junction updates are denied [@etraut-openai](https://github.com/etraut-openai)
  - [#50803](https://github.com/openai/codex/pull/50803) Use the managed daemon for eligible remote-control launches [@etraut-openai](https://github.com/etraut-openai)
  - [#50804](https://github.com/openai/codex/pull/50804) Preserve review lifecycle ordering on failure [@etraut-openai](https://github.com/etraut-openai)
  - [#50808](https://github.com/openai/codex/pull/50808) Prune TUI snapshots and consolidate behavior tests [@etraut-openai](https://github.com/etraut-openai)
  - [#50811](https://github.com/openai/codex/pull/50811) Honor server reasoning summary defaults in new TUI threads [@etraut-openai](https://github.com/etraut-openai)
  - [#50913](https://github.com/openai/codex/pull/50913) Use server model defaults for connected TUI fresh starts [@etraut-openai](https://github.com/etraut-openai)
  - [#50940](https://github.com/openai/codex/pull/50940) Recover malformed Windows deny-read ACL state safely [@zm-oai](https://github.com/zm-oai)
  - [#50962](https://github.com/openai/codex/pull/50962) Gate stable environment tool exposure behind a feature flag [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#50964](https://github.com/openai/codex/pull/50964) Track inference tool changes in turn analytics [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#50977](https://github.com/openai/codex/pull/50977) Isolate tracing in the strict third-party tool deferral test [@alishobeiri-oai](https://github.com/alishobeiri-oai)
  - [#51061](https://github.com/openai/codex/pull/51061) Gate Guardian continuation tests on classifier request capture [@jif-oai](https://github.com/jif-oai)
  - [#51063](https://github.com/openai/codex/pull/51063) Honor prior cancellation before starting Codex delegates [@jif-oai](https://github.com/jif-oai)
  - [#51064](https://github.com/openai/codex/pull/51064) Ignore stale refresh responses in agents overview tests [@jif-oai](https://github.com/jif-oai)
  - [#51065](https://github.com/openai/codex/pull/51065) Scope Guardian V2 response timing to snapshot sampling [@swastik-oai](https://github.com/swastik-oai)
  - [#51067](https://github.com/openai/codex/pull/51067) Use issuing-step context for Guardian MCP elicitation reviews [@jif-oai](https://github.com/jif-oai)
  - [#51070](https://github.com/openai/codex/pull/51070) Preserve trusted-tool context in Guardian Decisions requests [@swastik-oai](https://github.com/swastik-oai)
  - [#51117](https://github.com/openai/codex/pull/51117) Install full context in compaction replacement history [@pakrym-oai](https://github.com/pakrym-oai)
  - [#51119](https://github.com/openai/codex/pull/51119) Clarify incremental tool namespace updates in Responses Lite [@akira-oai](https://github.com/akira-oai)
  - [#51126](https://github.com/openai/codex/pull/51126) Add promise settlement streaming helpers to code mode [@cconger](https://github.com/cconger)
  - [#51133](https://github.com/openai/codex/pull/51133) Allow Guardian Decisions to fall back to `OPENAI_API_KEY` [@swastik-oai](https://github.com/swastik-oai)
  - [#51137](https://github.com/openai/codex/pull/51137) Recover Guardian reviews from parent checkpoints [@felixxia-oai](https://github.com/felixxia-oai)
  - [#51139](https://github.com/openai/codex/pull/51139) Force fresh Guardian sessions for parent-checkpoint recovery [@felixxia-oai](https://github.com/felixxia-oai)
  - [#51140](https://github.com/openai/codex/pull/51140) Isolate Guardian checkpoint recovery flags per review attempt [@felixxia-oai](https://github.com/felixxia-oai)
  - [#51156](https://github.com/openai/codex/pull/51156) Send base instructions as Responses input messages [@pakrym-oai](https://github.com/pakrym-oai)
  - [#51157](https://github.com/openai/codex/pull/51157) Enforce required environment skills before model inference [@anp-oai](https://github.com/anp-oai)
  - [#51158](https://github.com/openai/codex/pull/51158) Sign the PowerShell installer in Windows releases [@chess-oai](https://github.com/chess-oai)
  - [#51184](https://github.com/openai/codex/pull/51184) Remove obsolete Guardian thread-context enables from tests [@felixxia-oai](https://github.com/felixxia-oai)
  - [#51185](https://github.com/openai/codex/pull/51185) Retry transient gRPC code-mode session admission failures [@cassirer-openai](https://github.com/cassirer-openai)
  - [#51186](https://github.com/openai/codex/pull/51186) Prevent stable release pointers from moving backward [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#51188](https://github.com/openai/codex/pull/51188) Record base instructions in incremental tool history [@pakrym-oai](https://github.com/pakrym-oai)
  - [#51191](https://github.com/openai/codex/pull/51191) Clean up Unix app-server control-socket startup lock files [@etraut-openai](https://github.com/etraut-openai)
  - [#51192](https://github.com/openai/codex/pull/51192) Wait for SIGCONT when resuming the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#51193](https://github.com/openai/codex/pull/51193) Test thread archiving before the first turn [@btraut-openai](https://github.com/btraut-openai)
  - [#51194](https://github.com/openai/codex/pull/51194) Add browser extension request headers to config requirements [@jn-openai](https://github.com/jn-openai)
  - [#51198](https://github.com/openai/codex/pull/51198) Allow concurrent release builds while serializing publication [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#51200](https://github.com/openai/codex/pull/51200) Upgrade Bazel to 9.2.0 and refresh the module lockfile [@anp-oai](https://github.com/anp-oai)
  - [#51202](https://github.com/openai/codex/pull/51202) Distinguish namespace removals in incremental tool updates [@akira-oai](https://github.com/akira-oai)
  - [#51203](https://github.com/openai/codex/pull/51203) Make apply\_patch preserve line endings unconditionally [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#51206](https://github.com/openai/codex/pull/51206) Record initialization analytics for resumed subagents [@peilin-openai](https://github.com/peilin-openai)
  - [#51207](https://github.com/openai/codex/pull/51207) Gate CLI Daybreak controls and selection behind an opt-in feature [@julee-oai](https://github.com/julee-oai)
  - [#51209](https://github.com/openai/codex/pull/51209) Add ranked tool discovery to JavaScript code mode [@zamoshchin-openai](https://github.com/zamoshchin-openai)
  - [#51211](https://github.com/openai/codex/pull/51211) Reject sandbox-writable bubblewrap executables from PATH [@viyatb-oai](https://github.com/viyatb-oai)
  - [#51215](https://github.com/openai/codex/pull/51215) Measure raw MCP tool catalog sizes in telemetry [@owenlin0](https://github.com/owenlin0)
  - [#51217](https://github.com/openai/codex/pull/51217) Preserve review targets and scope misalignment continuation metadata [@yunhan-wei](https://github.com/yunhan-wei)
  - [#51220](https://github.com/openai/codex/pull/51220) Honor the OTLP metrics temporality preference [@daniel-oai](https://github.com/daniel-oai)
  - [#51221](https://github.com/openai/codex/pull/51221) Separate environment requests from runtime selections [@anp-oai](https://github.com/anp-oai)
  - [#51223](https://github.com/openai/codex/pull/51223) Remove legacy personality template metadata [@rhan-oai](https://github.com/rhan-oai)
  - [#51230](https://github.com/openai/codex/pull/51230) Make session lookup pagination stable and report listing failures [@etraut-openai](https://github.com/etraut-openai)
  - [#51235](https://github.com/openai/codex/pull/51235) Remove default model labels from TUI model pickers [@etraut-openai](https://github.com/etraut-openai)
  - [#51241](https://github.com/openai/codex/pull/51241) Add a partial answer message phase [@rb-oai](https://github.com/rb-oai)
  - [#51249](https://github.com/openai/codex/pull/51249) Handle partial answers consistently across agent workflows [@rb-oai](https://github.com/rb-oai)
  - [#51253](https://github.com/openai/codex/pull/51253) Enforce Fast and Ultra Fast policies independently [@dpatel-oai](https://github.com/dpatel-oai)
  - [#51256](https://github.com/openai/codex/pull/51256) Start the Windows sandbox service during registered Core setup [@zm-oai](https://github.com/zm-oai)
  - [#51257](https://github.com/openai/codex/pull/51257) Fix installer checksum verification under Windows PowerShell [@zm-oai](https://github.com/zm-oai)
  - [#51260](https://github.com/openai/codex/pull/51260) Handle partial answers in realtime routing and thread search [@rb-oai](https://github.com/rb-oai)
  - [#51329](https://github.com/openai/codex/pull/51329) Remove partial-history subagent forks [@jif-oai](https://github.com/jif-oai)
  - [#51330](https://github.com/openai/codex/pull/51330) Measure total Guardian approval decision duration [@jif-oai](https://github.com/jif-oai)
  - [#51331](https://github.com/openai/codex/pull/51331) Track sub-agent result delivery outcomes [@jif-oai](https://github.com/jif-oai)
  - [#51332](https://github.com/openai/codex/pull/51332) Record multi-agent wait duration by outcome [@jif-oai](https://github.com/jif-oai)
  - [#51333](https://github.com/openai/codex/pull/51333) Record the multi-agent version in turn analytics [@jif-oai](https://github.com/jif-oai)
  - [#51334](https://github.com/openai/codex/pull/51334) Count Guardian denial-limit interruptions in telemetry [@jif-oai](https://github.com/jif-oai)
  - [#51335](https://github.com/openai/codex/pull/51335) Update collaboration snapshots for full-history fork instructions [@jif-oai](https://github.com/jif-oai)
  - [#51347](https://github.com/openai/codex/pull/51347) Measure shell snapshot use and wait time per command [@jif-oai](https://github.com/jif-oai)
  - [#51350](https://github.com/openai/codex/pull/51350) Allow larger shell snapshots when replaying from a file [@jif-oai](https://github.com/jif-oai)
  - [#51355](https://github.com/openai/codex/pull/51355) Add bounded diagnostics for agent spawn failures [@jif-oai](https://github.com/jif-oai)
  - [#51378](https://github.com/openai/codex/pull/51378) Keep Guardian v2 WebSocket pools warm with concurrent replenishment [@jif-oai](https://github.com/jif-oai)
  - [#51391](https://github.com/openai/codex/pull/51391) Make URLs in asynchronous question titles clickable [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#51396](https://github.com/openai/codex/pull/51396) Let late low-risk scores complete pending Guardian reviews [@jif-oai](https://github.com/jif-oai)
  - [#51400](https://github.com/openai/codex/pull/51400) Prevent later Guardian scores from releasing earlier pending reviews [@jif-oai](https://github.com/jif-oai)
  - [#51402](https://github.com/openai/codex/pull/51402) Preserve turn attribution across recovery and compaction [@eddie-openai](https://github.com/eddie-openai)
  - [#51407](https://github.com/openai/codex/pull/51407) Protect ripgrep lookup during Linux sandbox construction [@viyatb-oai](https://github.com/viyatb-oai)
  - [#51411](https://github.com/openai/codex/pull/51411) Suppress repeated image paste presses in legacy terminals [@etraut-openai](https://github.com/etraut-openai)
  - [#51415](https://github.com/openai/codex/pull/51415) Expose and persist turn lineage across the app server [@eddie-openai](https://github.com/eddie-openai)
  - [#51419](https://github.com/openai/codex/pull/51419) Preserve turn attribution when queued mail wakes durable sleep [@eddie-openai](https://github.com/eddie-openai)
  - [#51420](https://github.com/openai/codex/pull/51420) Finish idle thread unloads after slow shutdown [@jif-oai](https://github.com/jif-oai)
  - [#51421](https://github.com/openai/codex/pull/51421) Include root turn IDs in host-owned Apps tool calls [@eddie-openai](https://github.com/eddie-openai)
  - [#51422](https://github.com/openai/codex/pull/51422) Accept environment requests at thread and turn settings boundaries [@anp-oai](https://github.com/anp-oai)
  - [#51425](https://github.com/openai/codex/pull/51425) Skip stable installer alias publishing for prereleases [@zsol-openai](https://github.com/zsol-openai)
  - [#51426](https://github.com/openai/codex/pull/51426) Remove the Bazel JVM override for Windows ARM64 voice builds [@anp-oai](https://github.com/anp-oai)
  - [#51427](https://github.com/openai/codex/pull/51427) Prevent invalidated wakeups from starting a turn [@jif-oai](https://github.com/jif-oai)
  - [#51433](https://github.com/openai/codex/pull/51433) Show hook status messages as titles in the hooks browser [@abhinav-oai](https://github.com/abhinav-oai)
  - [#51439](https://github.com/openai/codex/pull/51439) Preserve clickable URLs in TUI approval headers [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#51440](https://github.com/openai/codex/pull/51440) Honor Retry-After in WebSocket error events [@anp-oai](https://github.com/anp-oai)
  - [#51441](https://github.com/openai/codex/pull/51441) Fix core integration tests for updated turn APIs [@anp-oai](https://github.com/anp-oai)
  - [#51449](https://github.com/openai/codex/pull/51449) Make URLs clickable in TUI user input questions [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#51450](https://github.com/openai/codex/pull/51450) Make URLs clickable in MCP elicitation prompts [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#51451](https://github.com/openai/codex/pull/51451) Make URLs in the TUI warnings viewer clickable [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#51452](https://github.com/openai/codex/pull/51452) Make banner URLs clickable across wrapped lines [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#51457](https://github.com/openai/codex/pull/51457) Preserve status usage hyperlinks when the URL wraps [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#51458](https://github.com/openai/codex/pull/51458) Make URLs clickable in user verification prompts [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#51459](https://github.com/openai/codex/pull/51459) Preserve wrapped help links in Windows sandbox prompts [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#51460](https://github.com/openai/codex/pull/51460) Retry realtime sideband attachment while an existing call activates [@bullman-oai](https://github.com/bullman-oai)
  - [#51463](https://github.com/openai/codex/pull/51463) Record resolved model and reasoning effort in sub-agent activity [@sdcoffey](https://github.com/sdcoffey)
  - [#51465](https://github.com/openai/codex/pull/51465) Add an optional JSON transcript format for Guardian [@felixxia-oai](https://github.com/felixxia-oai)
  - [#51466](https://github.com/openai/codex/pull/51466) Keep Guardian transcript records structured through budget recovery [@felixxia-oai](https://github.com/felixxia-oai)
  - [#51467](https://github.com/openai/codex/pull/51467) Keep submission logs useful without exposing payloads [@chess-oai](https://github.com/chess-oai)
  - [#51470](https://github.com/openai/codex/pull/51470) Raise the managed app-server file descriptor limit on Unix [@etraut-openai](https://github.com/etraut-openai)
  - [#51471](https://github.com/openai/codex/pull/51471) Preserve clickable URLs in pending input previews [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#51472](https://github.com/openai/codex/pull/51472) Preserve clickable URLs in TUI selection rows [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#51473](https://github.com/openai/codex/pull/51473) Preserve URL destinations in wrapped hook details [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#51480](https://github.com/openai/codex/pull/51480) Preserve tool declaration mode across resumed context windows [@pakrym-oai](https://github.com/pakrym-oai)
  - [#51482](https://github.com/openai/codex/pull/51482) Use PathUri for skill identity and path matching [@anp-oai](https://github.com/anp-oai)
  - [#51483](https://github.com/openai/codex/pull/51483) Add correlated, credential-free rendezvous connection diagnostics [@alexi-openai](https://github.com/alexi-openai)
  - [#51491](https://github.com/openai/codex/pull/51491) Classify executor capability root ownership independently of parsing [@stevenlee-oai](https://github.com/stevenlee-oai)
  - [#51492](https://github.com/openai/codex/pull/51492) Remove obsolete fields from persisted turn context [@pakrym-oai](https://github.com/pakrym-oai)
  - [#51493](https://github.com/openai/codex/pull/51493) Bind capability roots to environment selections [@anp-oai](https://github.com/anp-oai)
  - [#51499](https://github.com/openai/codex/pull/51499) Load rollout history on a single blocking worker [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#51500](https://github.com/openai/codex/pull/51500) Add shared task pinning to the agent command center [@etraut-openai](https://github.com/etraut-openai)
  - [#51502](https://github.com/openai/codex/pull/51502) Bound relay connection attempts and handle pongs during blocked writes [@alexi-openai](https://github.com/alexi-openai)
  - [#51503](https://github.com/openai/codex/pull/51503) Expose selected environments to MCP contributors [@mtsui-oai](https://github.com/mtsui-oai)
  - [#51510](https://github.com/openai/codex/pull/51510) Preserve live TUI settings when configuration reloads fail [@imac-oai](https://github.com/imac-oai)
  - [#51511](https://github.com/openai/codex/pull/51511) Fix Windows 10 drive-letter opens for no-follow filesystem operations [@zm-oai](https://github.com/zm-oai)
  - [#51512](https://github.com/openai/codex/pull/51512) Align Windows sandbox temp permissions with the child environment [@zm-oai](https://github.com/zm-oai)
  - [#51515](https://github.com/openai/codex/pull/51515) Expose detailed agent tree shutdown failure reports [@keitht-openai](https://github.com/keitht-openai)
  - [#51517](https://github.com/openai/codex/pull/51517) Pass thread persistence intent to attachment uploads [@kchainani-oai](https://github.com/kchainani-oai)
  - [#51525](https://github.com/openai/codex/pull/51525) Preserve the CLI MXC preference in executor config reads [@zm-oai](https://github.com/zm-oai)
  - [#51527](https://github.com/openai/codex/pull/51527) Ignore ripgrep configuration when expanding sandbox deny globs [@viyatb-oai](https://github.com/viyatb-oai)

[Full release on Github](https://github.com/openai/codex/releases/tag/rust-v0.162.0)

- 2026-10-07



### Codex app  26.1002




### Performance improvements and bug fixes



  - Fixed Windows sandbox refresh failures after app updates.
  - Fixed worktree creation and chat forking for WSL repositories whose paths
    conflicted with Windows directories.
  - Kept the recent chats section collapsed when switching between chats.
  - Fixed **Remove from section** so it removes a chat from its sidebar section
    without pinning it.

- 2026-10-07



### ChatGPT for iOS  1.2026.272




### New features



  - Page previews now appear inline in responses.
  - Added support for opening Codex task links directly on iOS.

### Improvements and bug fixes

  - Redesigned the approval picker with clearer permission choices.
  - Find plugins from a single Plugins entry in the composer’s plus menu.
  - Faster streaming in long threads, with fewer freezes.
  - New tasks keep your selected computer while it reconnects or is offline.
  - Improved worktree support so files and changes match the checkout used on desktop.
  - Fixed task lists remaining empty after connecting.
  - Smoother keyboard transitions when starting tasks and swiping back.
  - Status updates no longer appear as questions that need an answer.
  - Clearer manual pairing code entry, including support for pasting formatted codes.

- 2026-10-07



### Codex CLI 0.161.0






```
$ npm install -g @openai/codex@0.161.0


```



View details



## New Features



  - GPT-6.1 Sol is now the default model in the bundled and Amazon Bedrock catalogs. ( [#49318](https://github.com/openai/codex/pull/49318), [#49339](https://github.com/openai/codex/pull/49339))
  - Amazon Bedrock supports multi-agent V2 and Ultra reasoning on compatible models; Bedrock Mantle also accepts AWS GovCloud regions. ( [#49345](https://github.com/openai/codex/pull/49345), [#49813](https://github.com/openai/codex/pull/49813))
  - Sign in to MCP servers from an active terminal session with `/mcp login <name>`. ( [#49290](https://github.com/openai/codex/pull/49290))
  - Choose your microphone, speaker, and microphone input channels for voice conversations, with preferences saved locally. ( [#49437](https://github.com/openai/codex/pull/49437), [#49836](https://github.com/openai/codex/pull/49836))
  - Daybreak is opt-in through `--enable cli_daybreak` or `features.cli_daybreak=true`; `daybreak=true` alone is insufficient. By default, controls and indicators are hidden, `/daybreak` is unavailable, and automatic Cyber routing is omitted—even for saved Daybreak threads. Saved preferences remain intact. Opt-in routing requires eligible ChatGPT sign-in, the OpenAI provider, and advertised model/program support. ( [#49856](https://github.com/openai/codex/pull/49856), [#49858](https://github.com/openai/codex/pull/49858), [#49859](https://github.com/openai/codex/pull/49859), [#49861](https://github.com/openai/codex/pull/49861), [#51207](https://github.com/openai/codex/pull/51207))
  - Select a Cyber access program per turn with `codex exec --cyber-access-program` or the TypeScript SDK’s `cyberAccessProgram` option. The explicit exec override remains available with `cli_daybreak` disabled and leaves the saved choice unchanged. ( [#49939](https://github.com/openai/codex/pull/49939), [#51207](https://github.com/openai/codex/pull/51207))

## Bug Fixes

  - Approved filesystem escalation can now grant broader write access while preserving denied reads and network restrictions. Background tasks retain their originating turn’s permissions. ( [#49353](https://github.com/openai/codex/pull/49353), [#49880](https://github.com/openai/codex/pull/49880))
  - Explicit launch permissions survive terminal reconnects and new sessions, while implicit client settings no longer overwrite server or saved-thread web-search settings. ( [#49809](https://github.com/openai/codex/pull/49809), [#49799](https://github.com/openai/codex/pull/49799))
  - Elevated Windows terminal sessions can start using an embedded server, and sandboxed PowerShell preserves relative paths beneath protected user profiles. ( [#49855](https://github.com/openai/codex/pull/49855), [#49690](https://github.com/openai/codex/pull/49690))
  - Enter correctly submits buffered input after paste detection expires, including in Vim insert mode. ( [#49810](https://github.com/openai/codex/pull/49810))
  - Thread resume includes the latest committed history. Startup detects recoverable SQLite corruption earlier and preserves damaged databases as backups. ( [#49599](https://github.com/openai/codex/pull/49599), [#49701](https://github.com/openai/codex/pull/49701))
  - Responses retries and WebSocket-to-HTTP fallback honor server retry guidance, reducing premature failures during overload. ( [#49441](https://github.com/openai/codex/pull/49441))

## Documentation

  - Authentication guidance now accounts for keyring storage instead of implying credentials always reside in `auth.json`. ( [#49361](https://github.com/openai/codex/pull/49361))

## Chores

  - Publishing an older alpha or hotfix no longer moves npm alpha tags backward. ( [#49704](https://github.com/openai/codex/pull/49704))

## Changelog

Full Changelog: [`rust-v0.160.0...rust-v0.161.0`](https://github.com/openai/codex/compare/rust-v0.160.0...rust-v0.161.0)

  - [#49246](https://github.com/openai/codex/pull/49246) Use executable fixture copying in the bundled bwrap test [@felixxia-oai](https://github.com/felixxia-oai)
  - [#49257](https://github.com/openai/codex/pull/49257) Allow Guardian cached approvals with incomplete root context [@felixxia-oai](https://github.com/felixxia-oai)
  - [#49260](https://github.com/openai/codex/pull/49260) Restrict enterprise MCP auth and fail closed on config refresh [@nicksteele-oai](https://github.com/nicksteele-oai)
  - [#49261](https://github.com/openai/codex/pull/49261) Preserve Windows sandbox runner launch errors [@zm-oai](https://github.com/zm-oai)
  - [#49262](https://github.com/openai/codex/pull/49262) Trace turn phases and correlate accepted input with turns [@jif-oai](https://github.com/jif-oai)
  - [#49266](https://github.com/openai/codex/pull/49266) Remove the remote agent message board client README [@jif-oai](https://github.com/jif-oai)
  - [#49267](https://github.com/openai/codex/pull/49267) Support remote agent message boards in multi-agent sessions [@jif-oai](https://github.com/jif-oai)
  - [#49269](https://github.com/openai/codex/pull/49269) Preserve thread overrides and cloud policy validity during config reloads [@nicksteele-oai](https://github.com/nicksteele-oai)
  - [#49275](https://github.com/openai/codex/pull/49275) Isolate realtime conversation tests from Responses prewarm connections [@felixxia-oai](https://github.com/felixxia-oai)
  - [#49276](https://github.com/openai/codex/pull/49276) Enable enterprise MCP sign-in and account-scoped grant cleanup [@nicksteele-oai](https://github.com/nicksteele-oai)
  - [#49277](https://github.com/openai/codex/pull/49277) Avoid a turn teardown race in the Guardian agent message test [@felixxia-oai](https://github.com/felixxia-oai)
  - [#49280](https://github.com/openai/codex/pull/49280) Restrict capability roots to captured turn environments [@miz-openai](https://github.com/miz-openai)
  - [#49286](https://github.com/openai/codex/pull/49286) Model exec-server session attachment state as an enum [@jif-oai](https://github.com/jif-oai)
  - [#49290](https://github.com/openai/codex/pull/49290) Add `/mcp login <name>` to the TUI [@nicksteele-oai](https://github.com/nicksteele-oai)
  - [#49294](https://github.com/openai/codex/pull/49294) Record Guardian context mode in review and classification telemetry [@felixxia-oai](https://github.com/felixxia-oai)
  - [#49295](https://github.com/openai/codex/pull/49295) Simplify configuration fingerprint canonicalization [@jif-oai](https://github.com/jif-oai)
  - [#49297](https://github.com/openai/codex/pull/49297) Scan the session index backwards for batch thread name lookups [@jif-oai](https://github.com/jif-oai)
  - [#49300](https://github.com/openai/codex/pull/49300) Compact the inline hidden tag buffer once per chunk [@jif-oai](https://github.com/jif-oai)
  - [#49305](https://github.com/openai/codex/pull/49305) Batch metadata reads when resolving thread names [@jif-oai](https://github.com/jif-oai)
  - [#49308](https://github.com/openai/codex/pull/49308) Run piped legacy Windows sandbox processes without a console [@etraut-openai](https://github.com/etraut-openai)
  - [#49312](https://github.com/openai/codex/pull/49312) Notify parent agents when Guardian stops a subagent [@jif-oai](https://github.com/jif-oai)
  - [#49316](https://github.com/openai/codex/pull/49316) Bump taiki-e/install-action to v2.87.21 in CI setup [@jgershen-oai](https://github.com/jgershen-oai)
  - [#49318](https://github.com/openai/codex/pull/49318) Add GPT-6.1 Sol as the default catalog model [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#49325](https://github.com/openai/codex/pull/49325) Retry Windows sandbox runner logon once on error 1056 [@zm-oai](https://github.com/zm-oai)
  - [#49330](https://github.com/openai/codex/pull/49330) Keep remote control reconnect backoff capped during sustained failures [@yansenzhou-oai](https://github.com/yansenzhou-oai)
  - [#49332](https://github.com/openai/codex/pull/49332) Clean up canceled exec-server RPC requests immediately [@jif-oai](https://github.com/jif-oai)
  - [#49339](https://github.com/openai/codex/pull/49339) Add GPT-6.1 Sol to Bedrock catalogs and make it the default [@celia-oai](https://github.com/celia-oai)
  - [#49345](https://github.com/openai/codex/pull/49345) Enable multi-agent V2 and Ultra reasoning on Amazon Bedrock [@celia-oai](https://github.com/celia-oai)
  - [#49353](https://github.com/openai/codex/pull/49353) Allow approved filesystem escalation while preserving denied reads [@viyatb-oai](https://github.com/viyatb-oai)
  - [#49357](https://github.com/openai/codex/pull/49357) Continue Markdown blockquotes when pasting multiline text [@bc-openai](https://github.com/bc-openai)
  - [#49360](https://github.com/openai/codex/pull/49360) Carry shell invocation metadata and report executor PATH directories [@anp-oai](https://github.com/anp-oai)
  - [#49361](https://github.com/openai/codex/pull/49361) Clarify credential storage wording across authentication UI and docs [@celia-oai](https://github.com/celia-oai)
  - [#49369](https://github.com/openai/codex/pull/49369) Update Bedrock GPT-6 Sol catalog tests to expect multi-agent V2 [@celia-oai](https://github.com/celia-oai)
  - [#49379](https://github.com/openai/codex/pull/49379) Compile hook matchers during discovery [@jif-oai](https://github.com/jif-oai)
  - [#49384](https://github.com/openai/codex/pull/49384) Track credential storage outcomes and redact sensitive errors [@celia-oai](https://github.com/celia-oai)
  - [#49388](https://github.com/openai/codex/pull/49388) Fix Windows path inference for opaque URIs with slash prefixes [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#49389](https://github.com/openai/codex/pull/49389) Serialize tests that share Windows sandbox accounts [@jgershen-oai](https://github.com/jgershen-oai)
  - [#49392](https://github.com/openai/codex/pull/49392) Add attributed MCP OAuth credential storage telemetry [@celia-oai](https://github.com/celia-oai)
  - [#49395](https://github.com/openai/codex/pull/49395) Remove randomized greetings from TUI session headers [@etraut-openai](https://github.com/etraut-openai)
  - [#49401](https://github.com/openai/codex/pull/49401) Preserve live tool-call metadata across request windows [@ningyi-oai](https://github.com/ningyi-oai)
  - [#49403](https://github.com/openai/codex/pull/49403) Add an experimental flag for bundled tools in login shells [@anp-oai](https://github.com/anp-oai)
  - [#49406](https://github.com/openai/codex/pull/49406) Support explicit cyber access programs with OpenAI API keys [@julee-oai](https://github.com/julee-oai)
  - [#49407](https://github.com/openai/codex/pull/49407) Recover exec-server sessions after environment info timeouts [@vivi](https://github.com/vivi)
  - [#49408](https://github.com/openai/codex/pull/49408) Compare tool call metadata in the recorder refresh test [@euroelessar](https://github.com/euroelessar)
  - [#49411](https://github.com/openai/codex/pull/49411) Bind the app-server time provider to a local variable [@euroelessar](https://github.com/euroelessar)
  - [#49414](https://github.com/openai/codex/pull/49414) Filter graceful shutdown guard and trigger traces from SQLite logs [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#49415](https://github.com/openai/codex/pull/49415) Truncate input text in protocol debug output [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#49416](https://github.com/openai/codex/pull/49416) Omit payloads from multiline ANSI warnings [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#49424](https://github.com/openai/codex/pull/49424) Infer Windows UNC paths with forward and mixed slashes [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#49425](https://github.com/openai/codex/pull/49425) Prune diagnostic logs periodically by age and database size [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#49426](https://github.com/openai/codex/pull/49426) Enable analytics by default for daemon-launched app servers [@bc-openai](https://github.com/bc-openai)
  - [#49432](https://github.com/openai/codex/pull/49432) Preserve bootstrap discovery across authentication changes [@cooper-oai](https://github.com/cooper-oai)
  - [#49437](https://github.com/openai/codex/pull/49437) Add local audio device selection to TUI voice settings [@bc-openai](https://github.com/bc-openai)
  - [#49441](https://github.com/openai/codex/pull/49441) Honor server retry advice across Responses retries and fallback [@anp-oai](https://github.com/anp-oai)
  - [#49444](https://github.com/openai/codex/pull/49444) Use `memrchr` to find newlines in reverse JSONL scans [@btraut-openai](https://github.com/btraut-openai)
  - [#49467](https://github.com/openai/codex/pull/49467) Restore executor tool paths after login shell startup [@anp-oai](https://github.com/anp-oai)
  - [#49472](https://github.com/openai/codex/pull/49472) Use server-authoritative permissions in the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#49473](https://github.com/openai/codex/pull/49473) Use the rmcp SDK for enterprise-managed token exchanges [@nicksteele-oai](https://github.com/nicksteele-oai)
  - [#49475](https://github.com/openai/codex/pull/49475) Complete turn abort callbacks before emitting terminal events [@euroelessar](https://github.com/euroelessar)
  - [#49478](https://github.com/openai/codex/pull/49478) Discover and validate MCP authorization servers before ID-JAG exchange [@nicksteele-oai](https://github.com/nicksteele-oai)
  - [#49480](https://github.com/openai/codex/pull/49480) Add experimental thread prediction protocol types [@keyz](https://github.com/keyz)
  - [#49489](https://github.com/openai/codex/pull/49489) Add regression coverage for account switches between analytics batches [@anp-oai](https://github.com/anp-oai)
  - [#49517](https://github.com/openai/codex/pull/49517) Add a fork shortcut to the TUI command center [@etraut-openai](https://github.com/etraut-openai)
  - [#49560](https://github.com/openai/codex/pull/49560) Add an opt-in model catalog to multi-agent context [@jif-oai](https://github.com/jif-oai)
  - [#49564](https://github.com/openai/codex/pull/49564) Copy selected file paths as plain text in the TUI [@fcoury-oai](https://github.com/fcoury-oai)
  - [#49584](https://github.com/openai/codex/pull/49584) Skip host skill discovery for Guardian reviews [@jif-oai](https://github.com/jif-oai)
  - [#49595](https://github.com/openai/codex/pull/49595) Make the strict network approval test independent of request order [@jif-oai](https://github.com/jif-oai)
  - [#49598](https://github.com/openai/codex/pull/49598) Persist explicit user goal edits in model history [@felixxia-oai](https://github.com/felixxia-oai)
  - [#49599](https://github.com/openai/codex/pull/49599) Return authoritative replay history when resuming a thread [@felixxia-oai](https://github.com/felixxia-oai)
  - [#49600](https://github.com/openai/codex/pull/49600) Reuse unchanged history snapshots when resuming threads [@felixxia-oai](https://github.com/felixxia-oai)
  - [#49624](https://github.com/openai/codex/pull/49624) Use server authentication for explicit remote session commands [@cooper-oai](https://github.com/cooper-oai)
  - [#49642](https://github.com/openai/codex/pull/49642) Allow managed requirements to disable the Windows MXC sandbox [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#49675](https://github.com/openai/codex/pull/49675) Serialize Responses routing fields before large inputs [@jbeckwith-oai](https://github.com/jbeckwith-oai)
  - [#49678](https://github.com/openai/codex/pull/49678) Escape command drafts when recovering question answers [@imac-oai](https://github.com/imac-oai)
  - [#49683](https://github.com/openai/codex/pull/49683) Add a managed feature gate for in-app voice [@vishnu-oai](https://github.com/vishnu-oai)
  - [#49686](https://github.com/openai/codex/pull/49686) Deliver remote message board notifications to active turns [@jif-oai](https://github.com/jif-oai)
  - [#49689](https://github.com/openai/codex/pull/49689) Export skill invocation events through OpenTelemetry [@jif-oai](https://github.com/jif-oai)
  - [#49690](https://github.com/openai/codex/pull/49690) Preserve PowerShell relative paths in the elevated Windows sandbox [@johnl-oai](https://github.com/johnl-oai)
  - [#49692](https://github.com/openai/codex/pull/49692) Keep compressed rollout snippet searches on one blocking worker [@npancha-openai](https://github.com/npancha-openai)
  - [#49693](https://github.com/openai/codex/pull/49693) Move thread history projection into one blocking task [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#49694](https://github.com/openai/codex/pull/49694) Batch rollout listing scans on cancellable blocking workers [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#49696](https://github.com/openai/codex/pull/49696) Make exec-server file reads cancellable between chunks [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#49701](https://github.com/openai/codex/pull/49701) Detect SQLite corruption during startup and preserve recovery backups [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#49702](https://github.com/openai/codex/pull/49702) Rename exec-server file handle management identifiers [@anp-oai](https://github.com/anp-oai)
  - [#49704](https://github.com/openai/codex/pull/49704) Prevent npm alpha dist-tags from moving backward [@imac-oai](https://github.com/imac-oai)
  - [#49706](https://github.com/openai/codex/pull/49706) Upgrade the argument comment lint toolchain and Dylint [@tamird](https://github.com/tamird)
  - [#49708](https://github.com/openai/codex/pull/49708) Move session index I/O off async runtime threads [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#49710](https://github.com/openai/codex/pull/49710) Classify SQLite corruption using typed error codes [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#49712](https://github.com/openai/codex/pull/49712) Avoid full-string scans in token-budget truncation [@jif-oai](https://github.com/jif-oai)
  - [#49713](https://github.com/openai/codex/pull/49713) Remove repository-local Codex guidance, skills, and environment config [@anp-oai](https://github.com/anp-oai)
  - [#49714](https://github.com/openai/codex/pull/49714) Decouple API-key cyber access programs from model discovery [@julee-oai](https://github.com/julee-oai)
  - [#49715](https://github.com/openai/codex/pull/49715) Add account security setup reminders to the TUI [@dennyku](https://github.com/dennyku)
  - [#49778](https://github.com/openai/codex/pull/49778) Define exec-server protocol types for streamed file writes [@anp-oai](https://github.com/anp-oai)
  - [#49781](https://github.com/openai/codex/pull/49781) Include the environment's MXC backend in MCP sandbox metadata [@zm-oai](https://github.com/zm-oai)
  - [#49782](https://github.com/openai/codex/pull/49782) Clean up process groups for failed shell snapshot captures [@jif-oai](https://github.com/jif-oai)
  - [#49783](https://github.com/openai/codex/pull/49783) Preserve background thread requests when forking in the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#49784](https://github.com/openai/codex/pull/49784) Add a requirements feature gate for the browser annotation API [@tepman-oai](https://github.com/tepman-oai)
  - [#49785](https://github.com/openai/codex/pull/49785) Persist empty paginated threads when naming them [@rd-oai](https://github.com/rd-oai)
  - [#49786](https://github.com/openai/codex/pull/49786) Clarify V2 spawn model override guidance for context catalogs [@jif-oai](https://github.com/jif-oai)
  - [#49787](https://github.com/openai/codex/pull/49787) Remove `AGENTS.md` from Bazel core test data [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#49792](https://github.com/openai/codex/pull/49792) Add retained conversation support to Guardian async sampling [@felixxia-oai](https://github.com/felixxia-oai)
  - [#49793](https://github.com/openai/codex/pull/49793) Add conversation mode to Guardian v2 async classification [@felixxia-oai](https://github.com/felixxia-oai)
  - [#49795](https://github.com/openai/codex/pull/49795) Avoid duplicate sync reviews in Guardian classifier continuations [@felixxia-oai](https://github.com/felixxia-oai)
  - [#49796](https://github.com/openai/codex/pull/49796) Deduplicate Guardian retained-context omission notices [@felixxia-oai](https://github.com/felixxia-oai)
  - [#49798](https://github.com/openai/codex/pull/49798) Share cached exec-server environment info with Arc [@anp-oai](https://github.com/anp-oai)
  - [#49799](https://github.com/openai/codex/pull/49799) Preserve server web-search settings in the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#49800](https://github.com/openai/codex/pull/49800) Allow cleanup of replay-only side conversations with missing threads [@bc-openai](https://github.com/bc-openai)
  - [#49801](https://github.com/openai/codex/pull/49801) Update the Rust toolchain action for argument-comment linting [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#49804](https://github.com/openai/codex/pull/49804) Use platform-specific modifier labels in TUI shortcut hints [@bc-openai](https://github.com/bc-openai)
  - [#49805](https://github.com/openai/codex/pull/49805) Add capability-gated writable file streams to the exec-server client [@anp-oai](https://github.com/anp-oai)
  - [#49806](https://github.com/openai/codex/pull/49806) Accept unknown Codex error variants in the app-server protocol [@anp-oai](https://github.com/anp-oai)
  - [#49807](https://github.com/openai/codex/pull/49807) Enable API-key model discovery by default [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#49809](https://github.com/openai/codex/pull/49809) Preserve local launch permissions across TUI sessions and reconnects [@etraut-openai](https://github.com/etraut-openai)
  - [#49810](https://github.com/openai/codex/pull/49810) Flush expired paste bursts before handling Enter [@bc-openai](https://github.com/bc-openai)
  - [#49811](https://github.com/openai/codex/pull/49811) Handle unsupported `fs/writeBlock` requests in exec-server [@anp-oai](https://github.com/anp-oai)
  - [#49812](https://github.com/openai/codex/pull/49812) Move shadow skill ranking off the turn preparation path [@vkg-oai](https://github.com/vkg-oai)
  - [#49813](https://github.com/openai/codex/pull/49813) Support AWS GovCloud regions for Amazon Bedrock Mantle [@alexsong-oai](https://github.com/alexsong-oai)
  - [#49814](https://github.com/openai/codex/pull/49814) Add coordinated shutdown for local agent trees [@owenlin0](https://github.com/owenlin0)
  - [#49816](https://github.com/openai/codex/pull/49816) Remove browser-open success messages from the TUI [@bc-openai](https://github.com/bc-openai)
  - [#49817](https://github.com/openai/codex/pull/49817) Add an advisory Bedrock GovCloud requirements check [@alexsong-oai](https://github.com/alexsong-oai)
  - [#49818](https://github.com/openai/codex/pull/49818) Use dedicated parameters for sandboxed file opens [@anp-oai](https://github.com/anp-oai)
  - [#49819](https://github.com/openai/codex/pull/49819) Recover daemon startup and updater re-exec after cwd deletion [@etraut-openai](https://github.com/etraut-openai)
  - [#49822](https://github.com/openai/codex/pull/49822) Box the resume future in the agents overview permissions test [@sayan-oai](https://github.com/sayan-oai)
  - [#49835](https://github.com/openai/codex/pull/49835) Clarify service tier default save errors in the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#49836](https://github.com/openai/codex/pull/49836) Allow microphone channel selection for voice conversations [@bc-openai](https://github.com/bc-openai)
  - [#49843](https://github.com/openai/codex/pull/49843) Preserve daemon diagnostics and include updater logs in reports [@etraut-openai](https://github.com/etraut-openai)
  - [#49846](https://github.com/openai/codex/pull/49846) Capture host-supplied extension data for each turn [@sayan-oai](https://github.com/sayan-oai)
  - [#49847](https://github.com/openai/codex/pull/49847) Persist world-state snapshots alongside rendered context [@pakrym-oai](https://github.com/pakrym-oai)
  - [#49850](https://github.com/openai/codex/pull/49850) Launch Windows daemon children in a dedicated working directory [@etraut-openai](https://github.com/etraut-openai)
  - [#49852](https://github.com/openai/codex/pull/49852) Improve diagnostics for report attachment failures [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#49855](https://github.com/openai/codex/pull/49855) Use embedded mode for elevated Windows TUI sessions [@etraut-openai](https://github.com/etraut-openai)
  - [#49856](https://github.com/openai/codex/pull/49856) Support Daybreak selection in `codex exec` [@etraut-openai](https://github.com/etraut-openai)
  - [#49857](https://github.com/openai/codex/pull/49857) Use the model catalog to select TUI cyber refusal guidance [@etraut-openai](https://github.com/etraut-openai)
  - [#49858](https://github.com/openai/codex/pull/49858) Add a persistent `/daybreak` toggle to the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#49859](https://github.com/openai/codex/pull/49859) Honor Daybreak settings in TUI continuations and background tasks [@etraut-openai](https://github.com/etraut-openai)
  - [#49861](https://github.com/openai/codex/pull/49861) Add Daybreak state to the status line and terminal title [@etraut-openai](https://github.com/etraut-openai)
  - [#49867](https://github.com/openai/codex/pull/49867) Update elevated-launch warning snapshot to use `⌃o` for copy [@etraut-openai](https://github.com/etraut-openai)
  - [#49874](https://github.com/openai/codex/pull/49874) Point usage and credit links to ChatGPT settings [@etraut-openai](https://github.com/etraut-openai)
  - [#49875](https://github.com/openai/codex/pull/49875) Decouple TUI startup presentation from execution configuration [@etraut-openai](https://github.com/etraut-openai)
  - [#49876](https://github.com/openai/codex/pull/49876) Remove personality plumbing from the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#49880](https://github.com/openai/codex/pull/49880) Bind permission grants to the originating turn [@anp-oai](https://github.com/anp-oai)
  - [#49894](https://github.com/openai/codex/pull/49894) Return world-state snapshots and context updates together [@pakrym-oai](https://github.com/pakrym-oai)
  - [#49898](https://github.com/openai/codex/pull/49898) Scope extension filesystem access to callback permissions [@anp-oai](https://github.com/anp-oai)
  - [#49910](https://github.com/openai/codex/pull/49910) Preserve validation errors for invalid TUI keybindings [@etraut-openai](https://github.com/etraut-openai)
  - [#49912](https://github.com/openai/codex/pull/49912) Respect approval policies in temporary structured threads [@etraut-openai](https://github.com/etraut-openai)
  - [#49939](https://github.com/openai/codex/pull/49939) Add per-turn Cyber access program selection to exec and the SDK [@mldangelo-oai](https://github.com/mldangelo-oai)
  - [#49946](https://github.com/openai/codex/pull/49946) Prevent stale file search results from being labeled with a new query [@jif-oai](https://github.com/jif-oai)
  - [#49951](https://github.com/openai/codex/pull/49951) Include preceding assistant context in Guardian sender reviews [@jif-oai](https://github.com/jif-oai)
  - [#49956](https://github.com/openai/codex/pull/49956) Cache the placeholder regex for MCP hook argument expansion [@jif-oai](https://github.com/jif-oai)
  - [#49959](https://github.com/openai/codex/pull/49959) Test session index thread-name append and removal [@jif-oai](https://github.com/jif-oai)
  - [#49972](https://github.com/openai/codex/pull/49972) Share byte buffers across exec-server output chunks [@jif-oai](https://github.com/jif-oai)
  - [#49987](https://github.com/openai/codex/pull/49987) Add renewable EMA HTTP authentication and credential versioning [@nicksteele-oai](https://github.com/nicksteele-oai)
  - [#49993](https://github.com/openai/codex/pull/49993) Preserve the async Guardian history prefix as retained context changes [@felixxia-oai](https://github.com/felixxia-oai)

[Full release on Github](https://github.com/openai/codex/releases/tag/rust-v0.161.0)

- 2026-10-05



### Codex CLI 0.160.1






```
$ npm install -g @openai/codex@0.160.1


```



View details



## Bug Fixes



  - Preserve `SYSTEMROOT`, `TEMP`, and `TMP` when launching remote stdio MCP servers with explicitly configured remote environment variables, allowing Unix hosts to retain the Windows executor's startup environment.

## Changelog

  - [#51121](https://github.com/openai/codex/pull/51121): Backport Windows remote MCP environment preservation to 0.160.

[Full release on Github](https://github.com/openai/codex/releases/tag/rust-v0.160.1)

- 2026-10-02



### ChatGPT for iOS  1.2026.267




### New features



  - New Home Screen widgets show recent tasks from your selected computers.
  - Track remaining usage and reset times with Home Screen and Lock Screen widgets.
  - Added a setting to keep the keyboard open after sending a message.

### Improvements and bug fixes

  - Faster task list refresh when returning to the app, with existing task titles preserved.
  - Fixed missing tasks when loading or scrolling through task lists.
  - Smoother home screen, send, and keyboard transitions.
  - Canceling a queued prompt returns recoverable text and attachments to the composer.
  - Improved transcript stability when selecting text and loading older messages.
  - Worktree creation now respects your computer’s configured storage location.

- 2026-10-01



### Codex app  26.930




### New features



  - Added the option to move selected chats to a project at once.

### Performance improvements and bug fixes

  - Improved recovery when attaching managed worktrees to chats.
  - Fixed large diffs appearing blank at some zoom levels.
  - Improved retries after queued messages fail to send or chats fail to open.

- 2026-10-01



### Codex CLI 0.160.0






```
$ npm install -g @openai/codex@0.160.0


```



View details



## New Features



  - Browse older tasks in the agent command center with a keyboard-accessible “Show more” action. ( [#49106](https://github.com/openai/codex/pull/49106))
  - Select transcript text and paste with middle-click in fullscreen mode on supported local Linux X11 terminals. ( [#49112](https://github.com/openai/codex/pull/49112))
  - Start sessions outside a project with workspace defaults when policy permits, and restore saved permissions when resuming. ( [#49160](https://github.com/openai/codex/pull/49160))
  - Added opt-in Guardian review capabilities to retrieve earlier user instructions and include context from agent handoffs. ( [#49036](https://github.com/openai/codex/pull/49036), [#49057](https://github.com/openai/codex/pull/49057))

## Bug Fixes

  - Unsent queued messages now resume after reconnection once uncertain submissions are resolved, avoiding duplicate sends. ( [#49105](https://github.com/openai/codex/pull/49105))
  - The terminal UI now preserves server provider, reasoning-summary, and verbosity settings and shows the correct sessions in resume and fork history. ( [#49144](https://github.com/openai/codex/pull/49144), [#49161](https://github.com/openai/codex/pull/49161), [#49171](https://github.com/openai/codex/pull/49171))
  - Fixed Windows sandbox PowerShell fallbacks and long-path permission repairs, and suppressed unwanted console windows from background helpers. ( [#49019](https://github.com/openai/codex/pull/49019), [#49058](https://github.com/openai/codex/pull/49058), [#49098](https://github.com/openai/codex/pull/49098), [#49164](https://github.com/openai/codex/pull/49164), [#49386](https://github.com/openai/codex/pull/49386))
  - Subagents now retain environments that are still starting and receive their configuration or preparation failure. ( [#49075](https://github.com/openai/codex/pull/49075))
  - Prevented SQLite stalls during connection setup and logging, and surfaced initialization errors instead of masking them as timeouts. ( [#49032](https://github.com/openai/codex/pull/49032), [#49102](https://github.com/openai/codex/pull/49102))
  - Explicit provider model catalogs no longer include unsupported bundled models or reuse stale entries after refresh failures. ( [#49135](https://github.com/openai/codex/pull/49135))

## Documentation

  - Clarified how provider credentials use the configured storage backend and how `env_key` identifies the API-key environment variable. ( [#49118](https://github.com/openai/codex/pull/49118))

## Chores

  - Reduced repeated plugin-loading work by caching parsed manifests and reusing HTTP connections for remote plugin requests. ( [#49099](https://github.com/openai/codex/pull/49099), [#49100](https://github.com/openai/codex/pull/49100))
  - Added background reclamation of unused log database space to reduce disk usage. ( [#49069](https://github.com/openai/codex/pull/49069))

## Changelog

Full Changelog: [`rust-v0.159.0...rust-v0.160.0`](https://github.com/openai/codex/compare/rust-v0.159.0...rust-v0.160.0)

  - [#48983](https://github.com/openai/codex/pull/48983) Avoid full metadata rewrites for thread timestamp updates [@jif-oai](https://github.com/jif-oai)
  - [#49000](https://github.com/openai/codex/pull/49000) Isolate the memory startup metadata test from Git enrichment [@jif-oai](https://github.com/jif-oai)
  - [#49019](https://github.com/openai/codex/pull/49019) Use a compatible PowerShell fallback for the Windows MXC sandbox [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#49028](https://github.com/openai/codex/pull/49028) Use the numeric ioctl value in the macOS sandbox policy [@aionescu-oai](https://github.com/aionescu-oai)
  - [#49031](https://github.com/openai/codex/pull/49031) Clarify ChatGPT sign-in success copy [@bc-openai](https://github.com/bc-openai)
  - [#49032](https://github.com/openai/codex/pull/49032) Avoid SQLite stalls from connection setup and stderr span logging [@jif-oai](https://github.com/jif-oai)
  - [#49036](https://github.com/openai/codex/pull/49036) Add opt-in conversation history retrieval to Guardian reviews [@felixxia-oai](https://github.com/felixxia-oai)
  - [#49037](https://github.com/openai/codex/pull/49037) Show the Plan mode cycling hint in the fullscreen status line [@fcoury-oai](https://github.com/fcoury-oai)
  - [#49038](https://github.com/openai/codex/pull/49038) Preserve encrypted agent messages in Guardian reviews [@felixxia-oai](https://github.com/felixxia-oai)
  - [#49041](https://github.com/openai/codex/pull/49041) Copy selections within inline code as plain text [@fcoury-oai](https://github.com/fcoury-oai)
  - [#49043](https://github.com/openai/codex/pull/49043) Update Pro plan display names in the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#49057](https://github.com/openai/codex/pull/49057) Add handoff-aware root context for Guardian reviews [@jif-oai](https://github.com/jif-oai)
  - [#49058](https://github.com/openai/codex/pull/49058) Fix Windows sandbox ACL repair for long runtime paths [@darius-oai](https://github.com/darius-oai)
  - [#49060](https://github.com/openai/codex/pull/49060) Update Guardian messaging snapshots for native agent messages [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#49065](https://github.com/openai/codex/pull/49065) Update Guardian handoff snapshot for separate agent messages [@cassirer-openai](https://github.com/cassirer-openai)
  - [#49067](https://github.com/openai/codex/pull/49067) Keep configuration values out of Windows sandbox policy events [@zm-oai](https://github.com/zm-oai)
  - [#49069](https://github.com/openai/codex/pull/49069) Reclaim unused SQLite log database pages in the background [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#49073](https://github.com/openai/codex/pull/49073) Surface realtime voice catalog failures in the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#49074](https://github.com/openai/codex/pull/49074) Propagate Cargo package versions to Bazel Rust targets [@tamird](https://github.com/tamird)
  - [#49075](https://github.com/openai/codex/pull/49075) Preserve pending environments when spawning subagents [@sayan-oai](https://github.com/sayan-oai)
  - [#49076](https://github.com/openai/codex/pull/49076) Avoid collecting unused Git metadata in skill analytics [@tamird](https://github.com/tamird)
  - [#49079](https://github.com/openai/codex/pull/49079) Update and centralize TUI subscription labels [@etraut-openai](https://github.com/etraut-openai)
  - [#49082](https://github.com/openai/codex/pull/49082) Skip remote Git discovery for Guardian diff paths [@jif-oai](https://github.com/jif-oai)
  - [#49084](https://github.com/openai/codex/pull/49084) Track app-server running turns incrementally [@tamird](https://github.com/tamird)
  - [#49089](https://github.com/openai/codex/pull/49089) Render follow-up directive labels in the TUI and copied responses [@etraut-openai](https://github.com/etraut-openai)
  - [#49093](https://github.com/openai/codex/pull/49093) Simplify startup promotions to platform-specific desktop app tips [@etraut-openai](https://github.com/etraut-openai)
  - [#49096](https://github.com/openai/codex/pull/49096) Update `h2` from 0.4.16 to 0.4.19 in Cargo and Bazel lockfiles [@cassirer-openai](https://github.com/cassirer-openai)
  - [#49097](https://github.com/openai/codex/pull/49097) Notify lifecycle extensions of compaction usage limits [@xli-oai](https://github.com/xli-oai)
  - [#49098](https://github.com/openai/codex/pull/49098) Resolve Windows sandbox PowerShell fallbacks on the exec server [@zm-oai](https://github.com/zm-oai)
  - [#49099](https://github.com/openai/codex/pull/49099) Cache parsed plugin manifests across plugin workflows [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#49100](https://github.com/openai/codex/pull/49100) Reuse the HTTP connection pool for remote plugin requests [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#49102](https://github.com/openai/codex/pull/49102) Preserve SQLite vacuum modes and surface pool initialization errors [@bc-openai](https://github.com/bc-openai)
  - [#49103](https://github.com/openai/codex/pull/49103) Balance Windows Bazel test shards using duration estimates [@jgershen-oai](https://github.com/jgershen-oai)
  - [#49105](https://github.com/openai/codex/pull/49105) Resume unsent TUI input after reconnecting [@etraut-openai](https://github.com/etraut-openai)
  - [#49106](https://github.com/openai/codex/pull/49106) Add history pagination to the agent command center [@bc-openai](https://github.com/bc-openai)
  - [#49112](https://github.com/openai/codex/pull/49112) Add X11 primary selection and middle-click paste support [@fcoury-oai](https://github.com/fcoury-oai)
  - [#49114](https://github.com/openai/codex/pull/49114) Point remote compaction tests at the mock ChatGPT server [@OLI-OAI](https://github.com/OLI-OAI)
  - [#49117](https://github.com/openai/codex/pull/49117) Attribute analytics requests to each thread's product SKU [@papayo-oai](https://github.com/papayo-oai)
  - [#49118](https://github.com/openai/codex/pull/49118) Correct provider authentication storage documentation [@celia-oai](https://github.com/celia-oai)
  - [#49119](https://github.com/openai/codex/pull/49119) Add recovery guidance to content-filter retries [@won-openai](https://github.com/won-openai)
  - [#49127](https://github.com/openai/codex/pull/49127) Deduplicate cloud and executor skill listings before budgeting [@TAFOYA-OAI](https://github.com/TAFOYA-OAI)
  - [#49130](https://github.com/openai/codex/pull/49130) Move content-filter guidance into the shared Responses retry handler [@won-openai](https://github.com/won-openai)
  - [#49135](https://github.com/openai/codex/pull/49135) Treat explicit provider model catalogs as authoritative [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#49136](https://github.com/openai/codex/pull/49136) Remove the plus separator after Option symbols in TUI key hints [@bc-openai](https://github.com/bc-openai)
  - [#49138](https://github.com/openai/codex/pull/49138) Expose original error details to turn lifecycle contributors [@bryanashley](https://github.com/bryanashley)
  - [#49144](https://github.com/openai/codex/pull/49144) Preserve server reasoning summary and verbosity settings in the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#49145](https://github.com/openai/codex/pull/49145) Hide reasoning summary settings in `/status` for server connections [@etraut-openai](https://github.com/etraut-openai)
  - [#49147](https://github.com/openai/codex/pull/49147) Simplify cloud task base URL normalization [@akira-oai](https://github.com/akira-oai)
  - [#49153](https://github.com/openai/codex/pull/49153) Omit blockquote markers when copying quoted selections in the TUI [@bc-openai](https://github.com/bc-openai)
  - [#49160](https://github.com/openai/codex/pull/49160) Support projectless TUI sessions with workspace defaults [@etraut-openai](https://github.com/etraut-openai)
  - [#49161](https://github.com/openai/codex/pull/49161) Honor app-server provider defaults in the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#49164](https://github.com/openai/codex/pull/49164) Suppress Windows console windows for background subprocesses [@etraut-openai](https://github.com/etraut-openai)
  - [#49171](https://github.com/openai/codex/pull/49171) Fix model provider lookup for TUI history [@etraut-openai](https://github.com/etraut-openai)
  - [#49386](https://github.com/openai/codex/pull/49386) \[0.160\] Backport remaining Windows console fix to frozen alpha.6 [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#49763](https://github.com/openai/codex/pull/49763) \[0.160\] Backport maintenance-line catalog and security reminder updates [@andrewgu-oai](https://github.com/andrewgu-oai)

[Full release on Github](https://github.com/openai/codex/releases/tag/rust-v0.160.0)

## September 2026

- 2026-09-30



### Codex CLI 0.159.3






```
$ npm install -g @openai/codex@0.159.3


```



View details



## New Features



  - Eligible local sessions signed in with ChatGPT can now show optional reminders to complete account security setup. ( [#49744](https://github.com/openai/codex/pull/49744))

## Changelog

Full Changelog: [`rust-v0.159.2...rust-v0.159.3`](https://github.com/openai/codex/compare/rust-v0.159.2...rust-v0.159.3)

  - [#49744](https://github.com/openai/codex/pull/49744) \[0.159\] Backport account security setup reminders for 0.159.3 [@andrewgu-oai](https://github.com/andrewgu-oai)

[Full release on Github](https://github.com/openai/codex/releases/tag/rust-v0.159.3)

- 2026-09-29



### Codex app  26.928




### Performance improvements and bug fixes



  - Improved terminal startup in attached worktrees and fixed failures caused by
    unavailable worktree environment settings.
  - Kept earlier answers visible when you send new instructions during a task.
  - Fixed automatic scrolling and prevented keyboard navigation through messages
    from jumping back to the latest response.
  - Improved startup recovery when you return to the app window.

- 2026-09-29



### GPT-6.1 Sol in Codex and ChatGPT Work




GPT-6.1 Sol offers near-Astra performance for complex work at a lower cost than
Astra. Consider it for repeated, long-running work across code, apps, and
documents. Availability depends on your plan, client, and workspace settings.



Use `gpt-6.1-sol`. See
[Models](https://learn.chatgpt.com/docs/models#gpt-61-sol) for availability and
[model selection](https://learn.chatgpt.com/api/docs/guides/model-selection#when-to-consider-gpt-61-sol)
to compare models.

- 2026-09-29



### Codex CLI 0.159.2






```
$ npm install -g @openai/codex@0.159.2


```



View details



## Bug Fixes



  - Suppressed console windows flashing on Windows when Codex launches background processes and sandboxed commands. ( [#49385](https://github.com/openai/codex/pull/49385))

## Changelog

Full Changelog: [`rust-v0.159.1...rust-v0.159.2`](https://github.com/openai/codex/compare/rust-v0.159.1...rust-v0.159.2)

  - [#49385](https://github.com/openai/codex/pull/49385) \[0.159\] Backport Windows console suppression for 0.159.2 [@andrewgu-oai](https://github.com/andrewgu-oai)

[Full release on Github](https://github.com/openai/codex/releases/tag/rust-v0.159.2)

- 2026-09-29



### Codex CLI 0.159.1






```
$ npm install -g @openai/codex@0.159.1


```



View details



## New Features



  - Added GPT-6.1 Sol as the default model in the bundled catalog and Amazon Bedrock Mantle and Runtime catalogs. ( [#49323](https://github.com/openai/codex/pull/49323), [#49342](https://github.com/openai/codex/pull/49342))

## Changelog

Full Changelog: [`rust-v0.159.0...rust-v0.159.1`](https://github.com/openai/codex/compare/rust-v0.159.0...rust-v0.159.1)

  - [#49323](https://github.com/openai/codex/pull/49323) \[0.159\] Prepare 0.159.1 release backports [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#49342](https://github.com/openai/codex/pull/49342) \[0.159\] Backport GPT-6.1 Sol Bedrock catalogs [@celia-oai](https://github.com/celia-oai)

[Full release on Github](https://github.com/openai/codex/releases/tag/rust-v0.159.1)

- 2026-09-29



### Codex CLI 0.159.0






```
$ npm install -g @openai/codex@0.159.0


```



View details



## New Features



  - Opt-in `instant_interrupt` lets new input steer Codex during model responses or long-running code-mode calls. ( [#48135](https://github.com/openai/codex/pull/48135), [#48141](https://github.com/openai/codex/pull/48141))
  - New sessions get a compact welcome screen and consistent headers, with occasional tips during and after turns. ( [#48513](https://github.com/openai/codex/pull/48513), [#48562](https://github.com/openai/codex/pull/48562), [#48352](https://github.com/openai/codex/pull/48352))
  - The warnings viewer dismisses reviewed warnings when closed; press `k` to keep one for later. ( [#48205](https://github.com/openai/codex/pull/48205), [#48206](https://github.com/openai/codex/pull/48206))
  - You can scroll the transcript while deciding whether to implement a plan. ( [#48805](https://github.com/openai/codex/pull/48805))
  - Native Mermaid rendering supports more flowchart edges, labels, and node groups. ( [#48814](https://github.com/openai/codex/pull/48814), [#48895](https://github.com/openai/codex/pull/48895))
  - App-server clients can paginate thread history from a specific item. ( [#48151](https://github.com/openai/codex/pull/48151))

## Bug Fixes

  - Windows launches avoid stray console windows for MCP servers, code-mode hosts, and piped commands; restrictive launchers can fall back to embedded mode. ( [#48138](https://github.com/openai/codex/pull/48138), [#48238](https://github.com/openai/codex/pull/48238), [#48483](https://github.com/openai/codex/pull/48483), [#48491](https://github.com/openai/codex/pull/48491))
  - Copying transcript selections preserves Markdown tables, formatting, and significant whitespace. More terminals now copy automatically on selection. ( [#48548](https://github.com/openai/codex/pull/48548), [#48549](https://github.com/openai/codex/pull/48549), [#48469](https://github.com/openai/codex/pull/48469))
  - Blank sessions retain drafts when switching tasks, and threads can be archived and listed before their first turn. ( [#48628](https://github.com/openai/codex/pull/48628), [#48828](https://github.com/openai/codex/pull/48828), [#48199](https://github.com/openai/codex/pull/48199))
  - Local ChatGPT sign-in opens the browser reliably; onboarding also provides a shortcut to copy the login link. ( [#48502](https://github.com/openai/codex/pull/48502), [#48544](https://github.com/openai/codex/pull/48544))
  - Approved commands retain explicit filesystem denials, and `.aws` directories are protected by default under writable roots. ( [#48155](https://github.com/openai/codex/pull/48155), [#48176](https://github.com/openai/codex/pull/48176))
  - Fixed macOS TLS access in network-enabled sandboxes and remote environments that require proxy access. ( [#48565](https://github.com/openai/codex/pull/48565), [#48198](https://github.com/openai/codex/pull/48198))

## Chores

  - Removed automatic follow-up prompt suggestions and the `tui.prompt_suggestions` setting. ( [#48621](https://github.com/openai/codex/pull/48621))
  - Removed the bundled `plugin-creator` skill. ( [#48604](https://github.com/openai/codex/pull/48604))

## Changelog

Full Changelog: [`rust-v0.158.0...rust-v0.159.0`](https://github.com/openai/codex/compare/rust-v0.158.0...rust-v0.159.0)

  - [#48135](https://github.com/openai/codex/pull/48135) Add opt-in code-mode yielding on new user input [@pakrym-oai](https://github.com/pakrym-oai)
  - [#48138](https://github.com/openai/codex/pull/48138) Suppress console windows when spawning the code-mode host on Windows [@zm-oai](https://github.com/zm-oai)
  - [#48141](https://github.com/openai/codex/pull/48141) Preempt model responses when new user input arrives [@pakrym-oai](https://github.com/pakrym-oai)
  - [#48143](https://github.com/openai/codex/pull/48143) Preserve executor MCP credential boundaries across reconnects [@rreichel3-oai](https://github.com/rreichel3-oai)
  - [#48151](https://github.com/openai/codex/pull/48151) Add item anchors to `thread/items/list` pagination [@btraut-openai](https://github.com/btraut-openai)
  - [#48155](https://github.com/openai/codex/pull/48155) Preserve filesystem denials when preparing approved commands [@viyatb-oai](https://github.com/viyatb-oai)
  - [#48157](https://github.com/openai/codex/pull/48157) Allow Windows daemon launches with residual job membership [@etraut-openai](https://github.com/etraut-openai)
  - [#48158](https://github.com/openai/codex/pull/48158) Fix Guardian retained context spacing and empty assistant handling [@olliem-oai](https://github.com/olliem-oai)
  - [#48168](https://github.com/openai/codex/pull/48168) Generate unique exec-server process IDs for every request [@sdcoffey](https://github.com/sdcoffey)
  - [#48174](https://github.com/openai/codex/pull/48174) Preserve usage limit windows in turn and compaction analytics [@rhan-oai](https://github.com/rhan-oai)
  - [#48176](https://github.com/openai/codex/pull/48176) Protect `.aws` directories under sandbox writable roots [@jackz100](https://github.com/jackz100)
  - [#48187](https://github.com/openai/codex/pull/48187) Fix zsh alias quoting in sourced shell snapshots [@jif-oai](https://github.com/jif-oai)
  - [#48190](https://github.com/openai/codex/pull/48190) Bound agent message board SSE frames before parsing [@jif-oai](https://github.com/jif-oai)
  - [#48197](https://github.com/openai/codex/pull/48197) Optimize `blake3` in Bazel fastbuilds [@jif-oai](https://github.com/jif-oai)
  - [#48198](https://github.com/openai/codex/pull/48198) Honor execution environment proxy requirements [@seanh-oai](https://github.com/seanh-oai)
  - [#48199](https://github.com/openai/codex/pull/48199) Keep archived threads with empty previews visible in listings [@acrognale-oai](https://github.com/acrognale-oai)
  - [#48200](https://github.com/openai/codex/pull/48200) Extract Responses header conversion into a shared module [@anp-oai](https://github.com/anp-oai)
  - [#48205](https://github.com/openai/codex/pull/48205) Dismiss viewed TUI warnings when closing the viewer [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48206](https://github.com/openai/codex/pull/48206) Add a keep-and-next action to the warnings viewer [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48207](https://github.com/openai/codex/pull/48207) Preserve queued output for observers during code-mode termination [@pakrym-oai](https://github.com/pakrym-oai)
  - [#48211](https://github.com/openai/codex/pull/48211) Keep Codex visible during external editor handoff [@etraut-openai](https://github.com/etraut-openai)
  - [#48213](https://github.com/openai/codex/pull/48213) Isolate executable fixture copies in CLI tests on Linux [@jif-oai](https://github.com/jif-oai)
  - [#48222](https://github.com/openai/codex/pull/48222) Preserve late result metadata for truncated code-mode calls [@ningyi-oai](https://github.com/ningyi-oai)
  - [#48224](https://github.com/openai/codex/pull/48224) Preserve model and access program pairs during compaction [@jamy-OAI](https://github.com/jamy-OAI)
  - [#48229](https://github.com/openai/codex/pull/48229) Extract Responses failure parsing into a dedicated module [@anp-oai](https://github.com/anp-oai)
  - [#48238](https://github.com/openai/codex/pull/48238) Suppress console windows for local Windows MCP servers [@malsamiri-oai](https://github.com/malsamiri-oai)
  - [#48272](https://github.com/openai/codex/pull/48272) Prevent Windows daemon launches from retaining launcher stdio [@zm-oai](https://github.com/zm-oai)
  - [#48318](https://github.com/openai/codex/pull/48318) Keep TUI reconnect attempts running until the shared deadline [@etraut-openai](https://github.com/etraut-openai)
  - [#48344](https://github.com/openai/codex/pull/48344) Preserve tool metadata for OpenAI provider endpoint overrides [@peilin-openai](https://github.com/peilin-openai)
  - [#48350](https://github.com/openai/codex/pull/48350) Display reconnect commands on a separate line [@etraut-openai](https://github.com/etraut-openai)
  - [#48352](https://github.com/openai/codex/pull/48352) Show turn tips while working and after completion in the TUI [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48353](https://github.com/openai/codex/pull/48353) Stabilize skill catalogs across executor availability changes [@vkg-oai](https://github.com/vkg-oai)
  - [#48469](https://github.com/openai/codex/pull/48469) Default to copying transcript selections in more terminals [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48483](https://github.com/openai/codex/pull/48483) Prevent console windows for piped Windows child processes [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48489](https://github.com/openai/codex/pull/48489) Fix Mermaid shape, relationship, and state description parsing [@etraut-openai](https://github.com/etraut-openai)
  - [#48491](https://github.com/openai/codex/pull/48491) Fall back to embedded mode under restrictive Windows launchers [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48502](https://github.com/openai/codex/pull/48502) Fix ChatGPT browser sign-in for local app servers [@etraut-openai](https://github.com/etraut-openai)
  - [#48508](https://github.com/openai/codex/pull/48508) Preserve WebSocket continuations when steering a turn [@pakrym-oai](https://github.com/pakrym-oai)
  - [#48513](https://github.com/openai/codex/pull/48513) Refresh the TUI welcome screen for new sessions [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48531](https://github.com/openai/codex/pull/48531) Add context to Windows sandbox runtime registration errors [@zm-oai](https://github.com/zm-oai)
  - [#48544](https://github.com/openai/codex/pull/48544) Make onboarding login links easier to copy [@etraut-openai](https://github.com/etraut-openai)
  - [#48547](https://github.com/openai/codex/pull/48547) Fade blossom replays back to the idle state [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48548](https://github.com/openai/codex/pull/48548) Preserve table cell source metadata through TUI rendering [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48549](https://github.com/openai/codex/pull/48549) Preserve Markdown tables and whitespace when copying TUI responses [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48551](https://github.com/openai/codex/pull/48551) Fix TUI math rendering for zero and big wedge expressions [@etraut-openai](https://github.com/etraut-openai)
  - [#48560](https://github.com/openai/codex/pull/48560) Keep working tips stable during transcript interaction [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48562](https://github.com/openai/codex/pull/48562) Use a consistent borderless session header in the TUI [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48565](https://github.com/openai/codex/pull/48565) Allow macOS TLS trust evaluation in network-enabled Seatbelt profiles [@winston-openai](https://github.com/winston-openai)
  - [#48568](https://github.com/openai/codex/pull/48568) Allow exec-server to proxy permitted private IPs upstream [@open-matt](https://github.com/open-matt)
  - [#48574](https://github.com/openai/codex/pull/48574) Preserve deferred tool namespace names before descriptions [@adaley-openai](https://github.com/adaley-openai)
  - [#48575](https://github.com/openai/codex/pull/48575) Allow provisioned executors more time to come online [@richardopenai](https://github.com/richardopenai)
  - [#48604](https://github.com/openai/codex/pull/48604) Remove the bundled `plugin-creator` skill [@martinauyeung-oai](https://github.com/martinauyeung-oai)
  - [#48611](https://github.com/openai/codex/pull/48611) Centralize persistent mode enablement checks [@alishobeiri-oai](https://github.com/alishobeiri-oai)
  - [#48621](https://github.com/openai/codex/pull/48621) Remove follow-up prompt suggestions from the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#48623](https://github.com/openai/codex/pull/48623) Preserve empty Markdown list markers in the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#48626](https://github.com/openai/codex/pull/48626) Stop showing previous-session summaries when switching TUI sessions [@etraut-openai](https://github.com/etraut-openai)
  - [#48628](https://github.com/openai/codex/pull/48628) Preserve blank TUI sessions when switching tasks [@etraut-openai](https://github.com/etraut-openai)
  - [#48643](https://github.com/openai/codex/pull/48643) Set the provisioned macOS CLI bundle name to ChatGPT [@riley-oai](https://github.com/riley-oai)
  - [#48646](https://github.com/openai/codex/pull/48646) Fix the session-start helper call in the command center test [@etraut-openai](https://github.com/etraut-openai)
  - [#48686](https://github.com/openai/codex/pull/48686) Remove WebSocket headers and tool payloads from info logs [@chess-oai](https://github.com/chess-oai)
  - [#48724](https://github.com/openai/codex/pull/48724) Prevent Linux ETXTBSY races in MCP stdio tests [@jif-oai](https://github.com/jif-oai)
  - [#48725](https://github.com/openai/codex/pull/48725) Retain confirmed Code Mode messages for Guardian reviews [@ankushg](https://github.com/ankushg)
  - [#48727](https://github.com/openai/codex/pull/48727) Centralize executable fixture creation to avoid Linux ETXTBSY races [@jif-oai](https://github.com/jif-oai)
  - [#48754](https://github.com/openai/codex/pull/48754) Render `/status` without borders and wrap long values [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48757](https://github.com/openai/codex/pull/48757) Match TUI status shimmer timing to desktop headers [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48761](https://github.com/openai/codex/pull/48761) Show hidden output line counts in compact terminal activity [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48764](https://github.com/openai/codex/pull/48764) Preserve MCP app resource URIs without defaulting display mode [@victor-openai](https://github.com/victor-openai)
  - [#48772](https://github.com/openai/codex/pull/48772) Fix Unix socket connections through long symlink paths [@etraut-openai](https://github.com/etraut-openai)
  - [#48775](https://github.com/openai/codex/pull/48775) Match pinned transcript headers to the original prompt style [@etraut-openai](https://github.com/etraut-openai)
  - [#48776](https://github.com/openai/codex/pull/48776) Remove the `current` badge from TUI task rows [@etraut-openai](https://github.com/etraut-openai)
  - [#48779](https://github.com/openai/codex/pull/48779) Preserve independent Guardian history across parent compaction [@felixxia-oai](https://github.com/felixxia-oai)
  - [#48783](https://github.com/openai/codex/pull/48783) Add single-server MCP status discovery with thread connection reuse [@victor-openai](https://github.com/victor-openai)
  - [#48796](https://github.com/openai/codex/pull/48796) Add opt-in structured errors for Guardian circuit-breaker interruptions [@won-openai](https://github.com/won-openai)
  - [#48799](https://github.com/openai/codex/pull/48799) Fix SGR mouse reporting for Windows terminal capture [@etraut-openai](https://github.com/etraut-openai)
  - [#48800](https://github.com/openai/codex/pull/48800) Use the terminal palette for ordered Markdown list markers [@etraut-openai](https://github.com/etraut-openai)
  - [#48805](https://github.com/openai/codex/pull/48805) Allow transcript wheel scrolling while a modal is open [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48807](https://github.com/openai/codex/pull/48807) Show short turn durations in TUI completion footers [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48812](https://github.com/openai/codex/pull/48812) Add history-aware prewarming for idle threads [@vkg-oai](https://github.com/vkg-oai)
  - [#48814](https://github.com/openai/codex/pull/48814) Preserve punctuation and semicolons in Mermaid labels [@etraut-openai](https://github.com/etraut-openai)
  - [#48819](https://github.com/openai/codex/pull/48819) Use explicit histogram buckets for tool and skill context metrics [@mzeng-openai](https://github.com/mzeng-openai)
  - [#48824](https://github.com/openai/codex/pull/48824) Keep voice RTP timestamps aligned to 20 ms packets [@bc-openai](https://github.com/bc-openai)
  - [#48827](https://github.com/openai/codex/pull/48827) Show a hand pointer over transcript links in Ghostty and Kitty [@bc-openai](https://github.com/bc-openai)
  - [#48828](https://github.com/openai/codex/pull/48828) Allow archiving threads before their first turn [@bc-openai](https://github.com/bc-openai)
  - [#48829](https://github.com/openai/codex/pull/48829) Wait briefly for the Windows sandbox provisioning service to start [@zm-oai](https://github.com/zm-oai)
  - [#48830](https://github.com/openai/codex/pull/48830) Show a short, neutral TUI interruption notice [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48895](https://github.com/openai/codex/pull/48895) Expand native Mermaid flowchart syntax support [@etraut-openai](https://github.com/etraut-openai)
  - [#48973](https://github.com/openai/codex/pull/48973) Isolate realtime auth fallback test from startup prewarm [@jif-oai](https://github.com/jif-oai)
  - [#48982](https://github.com/openai/codex/pull/48982) Prevent message-board notifications from reopening final answers [@eknight-oai](https://github.com/eknight-oai)

[Full release on Github](https://github.com/openai/codex/releases/tag/rust-v0.159.0)

- 2026-09-28



### Codex CLI 0.158.0






```
$ npm install -g @openai/codex@0.158.0


```



View details



## New Features



  - Configure copy-on-select and right-click paste in the fullscreen TUI. Copied transcript selections now preserve Markdown formatting. ( [#47639](https://github.com/openai/codex/pull/47639), [#47896](https://github.com/openai/codex/pull/47896), [#48118](https://github.com/openai/codex/pull/48118))
  - Connect to MCP servers that require pre-registered OAuth client secrets, including through `codex mcp add --oauth-client-secret`. ( [#47891](https://github.com/openai/codex/pull/47891))
  - Secure direct exec-server WebSocket connections with bearer tokens, including connections configured through app-server. ( [#47601](https://github.com/openai/codex/pull/47601), [#47648](https://github.com/openai/codex/pull/47648))
  - Image generation and editing can explicitly request transparent backgrounds, and edits now accept file-backed conversation images. ( [#47484](https://github.com/openai/codex/pull/47484), [#47956](https://github.com/openai/codex/pull/47956))
  - Terminal input approval is enabled by default for commands running with elevated permissions; runtime-only grants no longer cause unnecessary reviews. ( [#47799](https://github.com/openai/codex/pull/47799), [#48073](https://github.com/openai/codex/pull/48073))

## Bug Fixes

  - Fixed Windows sandbox failures involving ordinary Windows 10 paths, rejected stored credentials, and large permission policies. ( [#47672](https://github.com/openai/codex/pull/47672), [#47695](https://github.com/openai/codex/pull/47695), [#47919](https://github.com/openai/codex/pull/47919))
  - Fixed Linux sandbox startup with nested writable roots and preserved Git metadata protections across writable roots on Linux and macOS. ( [#47623](https://github.com/openai/codex/pull/47623), [#47974](https://github.com/openai/codex/pull/47974))
  - macOS patch operations now recognize system path aliases covered by existing permissions, avoiding unnecessary approval prompts. ( [#47879](https://github.com/openai/codex/pull/47879))
  - Approval reviews now retry when new user input arrives, so a status question does not automatically abort a pending action. ( [#47819](https://github.com/openai/codex/pull/47819))
  - Mermaid flowcharts now render quoted labels and ampersands; unsupported diagrams explain why they fall back to source. ( [#47572](https://github.com/openai/codex/pull/47572), [#47678](https://github.com/openai/codex/pull/47678))
  - Command completion events now include early output and report process-launch failures to clients. ( [#47529](https://github.com/openai/codex/pull/47529), [#47665](https://github.com/openai/codex/pull/47665))

## Changelog

Full Changelog: [`rust-v0.157.0...rust-v0.158.0`](https://github.com/openai/codex/compare/rust-v0.157.0...rust-v0.158.0)

  - [#47441](https://github.com/openai/codex/pull/47441) Use secondary text styling for the transcript footer shortcut hint [@etraut-openai](https://github.com/etraut-openai)
  - [#47447](https://github.com/openai/codex/pull/47447) Extract WebSocket authentication into `codex-websocket-auth` [@euroelessar](https://github.com/euroelessar)
  - [#47458](https://github.com/openai/codex/pull/47458) Parallelize instruction refresh and tool preparation [@hlevy-openai](https://github.com/hlevy-openai)
  - [#47484](https://github.com/openai/codex/pull/47484) Add explicit background control to image generation [@alicec-oai](https://github.com/alicec-oai)
  - [#47520](https://github.com/openai/codex/pull/47520) Route session agent operations through `AgentControl` [@jif-oai](https://github.com/jif-oai)
  - [#47529](https://github.com/openai/codex/pull/47529) Emit command lifecycle events for unified exec launch failures [@steipete-oai](https://github.com/steipete-oai)
  - [#47536](https://github.com/openai/codex/pull/47536) Route agent lookups and V2 context through `AgentControl` [@jif-oai](https://github.com/jif-oai)
  - [#47539](https://github.com/openai/codex/pull/47539) Test interrupted one-shot command launch failure persistence [@jif-oai](https://github.com/jif-oai)
  - [#47540](https://github.com/openai/codex/pull/47540) Add an option to disable multi-agent v2 direct messaging [@jif-oai](https://github.com/jif-oai)
  - [#47565](https://github.com/openai/codex/pull/47565) Classify rollout read failures by reason and progress [@jif-oai](https://github.com/jif-oai)
  - [#47568](https://github.com/openai/codex/pull/47568) Record sandbox backends in command execution analytics [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#47571](https://github.com/openai/codex/pull/47571) Wait for idle before injecting remote compaction test history [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47572](https://github.com/openai/codex/pull/47572) Explain Mermaid rendering fallbacks in the TUI [@etraut-openai](https://github.com/etraut-openai)
  - [#47582](https://github.com/openai/codex/pull/47582) Retain assistant context for Guardian authorization reviews [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47584](https://github.com/openai/codex/pull/47584) Preserve streamed assistant message order in retained context [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47585](https://github.com/openai/codex/pull/47585) Preserve delivered assistant messages in Guardian retained context [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47589](https://github.com/openai/codex/pull/47589) Keep unfinished link destinations out of rich streaming previews [@etraut-openai](https://github.com/etraut-openai)
  - [#47590](https://github.com/openai/codex/pull/47590) Serialize numeric custom reasoning effort as JSON numbers [@dylan-hurd-oai](https://github.com/dylan-hurd-oai)
  - [#47591](https://github.com/openai/codex/pull/47591) Stream daemon executable hashing off the async runtime [@etraut-openai](https://github.com/etraut-openai)
  - [#47596](https://github.com/openai/codex/pull/47596) Refresh realtime context for each model request [@reia-oai](https://github.com/reia-oai)
  - [#47597](https://github.com/openai/codex/pull/47597) Guard prerelease channel and canary updates against older versions [@imac-oai](https://github.com/imac-oai)
  - [#47601](https://github.com/openai/codex/pull/47601) Add opt-in WebSocket authentication to exec-server [@euroelessar](https://github.com/euroelessar)
  - [#47603](https://github.com/openai/codex/pull/47603) Add a reap-only drop policy for child processes [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#47604](https://github.com/openai/codex/pull/47604) Extend child commands with session and descriptor controls [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#47605](https://github.com/openai/codex/pull/47605) Route pipe processes through the shared child launcher [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#47610](https://github.com/openai/codex/pull/47610) Use native POSIX spawning for command hooks [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#47611](https://github.com/openai/codex/pull/47611) Use the shared process launcher for Unix shell snapshots [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#47612](https://github.com/openai/codex/pull/47612) Launch Linux pipe processes through a fresh setup helper [@freeqaz-openai](https://github.com/freeqaz-openai)
  - [#47613](https://github.com/openai/codex/pull/47613) Expand Linux spawn-helper lifecycle test coverage [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#47617](https://github.com/openai/codex/pull/47617) Route Linux PTY launches through the process setup helper [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#47618](https://github.com/openai/codex/pull/47618) Prefer Shift-arrow hints for queued messages and questions [@imac-oai](https://github.com/imac-oai)
  - [#47619](https://github.com/openai/codex/pull/47619) Add bounded buffering for global operation metrics [@celia-oai](https://github.com/celia-oai)
  - [#47620](https://github.com/openai/codex/pull/47620) Add portable project trust lookup APIs [@seanh-oai](https://github.com/seanh-oai)
  - [#47623](https://github.com/openai/codex/pull/47623) Fix read-only metadata mount ordering for nested writable roots [@jif-oai](https://github.com/jif-oai)
  - [#47624](https://github.com/openai/codex/pull/47624) Recognize `user_message` tools in Guardian authorization context [@ankushg](https://github.com/ankushg)
  - [#47625](https://github.com/openai/codex/pull/47625) Allow history and notes without experimental context capability [@pmccrary-oai](https://github.com/pmccrary-oai)
  - [#47629](https://github.com/openai/codex/pull/47629) Route V2 child loading through `AgentControl` [@jif-oai](https://github.com/jif-oai)
  - [#47630](https://github.com/openai/codex/pull/47630) Bind Guardian reviews to the action's target environment [@jif-oai](https://github.com/jif-oai)
  - [#47633](https://github.com/openai/codex/pull/47633) Route message board agent resolution through the selected controller [@jif-oai](https://github.com/jif-oai)
  - [#47635](https://github.com/openai/codex/pull/47635) Overlap startup WebSocket preconnect with tool discovery [@bromano-oai](https://github.com/bromano-oai)
  - [#47638](https://github.com/openai/codex/pull/47638) Classify retryable exec-server preparation errors by type [@mtsui-oai](https://github.com/mtsui-oai)
  - [#47639](https://github.com/openai/codex/pull/47639) Add configurable copy-on-select for transcript selections [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47641](https://github.com/openai/codex/pull/47641) Honor Retry-After and preserve server retry deadlines [@anp-oai](https://github.com/anp-oai)
  - [#47642](https://github.com/openai/codex/pull/47642) Add model-specific prefixes to indirect tool descriptions [@rhan-oai](https://github.com/rhan-oai)
  - [#47647](https://github.com/openai/codex/pull/47647) Apply Guardian computer-use review to the Browser connector [@johnl-oai](https://github.com/johnl-oai)
  - [#47648](https://github.com/openai/codex/pull/47648) Support bearer tokens for app-server executor connections [@euroelessar](https://github.com/euroelessar)
  - [#47649](https://github.com/openai/codex/pull/47649) Add opt-in OTLP logging for final agent responses [@xli-oai](https://github.com/xli-oai)
  - [#47653](https://github.com/openai/codex/pull/47653) Attach inherited rollout history to diagnostic reports [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#47654](https://github.com/openai/codex/pull/47654) Make Linux descriptor cleanup fork-safe [@yuzhu-oai](https://github.com/yuzhu-oai)
  - [#47655](https://github.com/openai/codex/pull/47655) Bump the exec-server stable compatibility test to Codex 0.156.1 [@imac-oai](https://github.com/imac-oai)
  - [#47657](https://github.com/openai/codex/pull/47657) Restrict the default Bedrock GovCloud model catalog [@jackz100](https://github.com/jackz100)
  - [#47662](https://github.com/openai/codex/pull/47662) Expose tool dispatch and timing observations to extensions [@euroelessar](https://github.com/euroelessar)
  - [#47663](https://github.com/openai/codex/pull/47663) Preserve managed network policy in route-aware transports [@jackz100](https://github.com/jackz100)
  - [#47665](https://github.com/openai/codex/pull/47665) Preserve early unified exec output in completion events [@sdcoffey](https://github.com/sdcoffey)
  - [#47670](https://github.com/openai/codex/pull/47670) Support model-specific descriptions for agent message board tools [@eknight-oai](https://github.com/eknight-oai)
  - [#47672](https://github.com/openai/codex/pull/47672) Fix no-reparse directory opens on Windows 10 [@zm-oai](https://github.com/zm-oai)
  - [#47673](https://github.com/openai/codex/pull/47673) Clarify registered Windows sandbox setup errors [@zm-oai](https://github.com/zm-oai)
  - [#47677](https://github.com/openai/codex/pull/47677) Support model catalog overrides for MCP resource tool specs [@rhan-oai](https://github.com/rhan-oai)
  - [#47678](https://github.com/openai/codex/pull/47678) Support quoted labels and ampersands in Mermaid flowcharts [@etraut-openai](https://github.com/etraut-openai)
  - [#47679](https://github.com/openai/codex/pull/47679) Add extension hooks for model requests and response streams [@euroelessar](https://github.com/euroelessar)
  - [#47680](https://github.com/openai/codex/pull/47680) Add exec-server RPC timing and process startup tracing [@anp-oai](https://github.com/anp-oai)
  - [#47683](https://github.com/openai/codex/pull/47683) Add executor capability discovery V2 infrastructure [@TAFOYA-OAI](https://github.com/TAFOYA-OAI)
  - [#47686](https://github.com/openai/codex/pull/47686) Make thread-owned Guardian context always enabled [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47688](https://github.com/openai/codex/pull/47688) Remove legacy Guardian authorization evidence paths [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47689](https://github.com/openai/codex/pull/47689) Make Guardian thread context capture unconditional [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47690](https://github.com/openai/codex/pull/47690) Remove obsolete Guardian context capture mode branches [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47691](https://github.com/openai/codex/pull/47691) Materialize rollout persistence for pending inter-agent messages [@dermanyang-oai](https://github.com/dermanyang-oai)
  - [#47693](https://github.com/openai/codex/pull/47693) Configure curl retries for DotSlash installation in CI [@anp-oai](https://github.com/anp-oai)
  - [#47695](https://github.com/openai/codex/pull/47695) Repair rejected Windows sandbox credentials during provisioning [@zm-oai](https://github.com/zm-oai)
  - [#47696](https://github.com/openai/codex/pull/47696) Avoid the shutdown timeout in the lagged-event test [@jgershen-oai](https://github.com/jgershen-oai)
  - [#47698](https://github.com/openai/codex/pull/47698) Allow WebSocket test server shutdown while waiting for requests [@jgershen-oai](https://github.com/jgershen-oai)
  - [#47701](https://github.com/openai/codex/pull/47701) Allow idle threads to prewarm and repair WebSocket connections [@vkg-oai](https://github.com/vkg-oai)
  - [#47703](https://github.com/openai/codex/pull/47703) Preserve account network policy for ChatGPT backend requests [@jackz100](https://github.com/jackz100)
  - [#47704](https://github.com/openai/codex/pull/47704) Fix spawn flag typing and isolate project configuration tests [@seanh-oai](https://github.com/seanh-oai)
  - [#47709](https://github.com/openai/codex/pull/47709) Route resume prewarm through the cached WebSocket session [@vkg-oai](https://github.com/vkg-oai)
  - [#47712](https://github.com/openai/codex/pull/47712) Update unified exec output buffers atomically [@sdcoffey](https://github.com/sdcoffey)
  - [#47713](https://github.com/openai/codex/pull/47713) Reduce dependency coupling in shared configuration crates [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#47714](https://github.com/openai/codex/pull/47714) Preserve tool result metadata more selectively under size limits [@ningyi-oai](https://github.com/ningyi-oai)
  - [#47717](https://github.com/openai/codex/pull/47717) Avoid recursive TUI event dispatch for model picker selections [@etraut-openai](https://github.com/etraut-openai)
  - [#47741](https://github.com/openai/codex/pull/47741) Attribute tool telemetry to the invoking turn's product SKU [@rennie-openai](https://github.com/rennie-openai)
  - [#47742](https://github.com/openai/codex/pull/47742) Honor network policy in history notes and image generation extensions [@jackz100](https://github.com/jackz100)
  - [#47745](https://github.com/openai/codex/pull/47745) Skip startup prewarm preparation when the WebSocket is ready [@vkg-oai](https://github.com/vkg-oai)
  - [#47748](https://github.com/openai/codex/pull/47748) Align Cargo and Bazel Rust debug information defaults [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#47751](https://github.com/openai/codex/pull/47751) Reduce generic code duplication in RPC and Markdown rendering [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#47755](https://github.com/openai/codex/pull/47755) Centralize typed app-server response decoding [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#47757](https://github.com/openai/codex/pull/47757) Refactor tool telemetry product SKU matching to use an allowlist [@rennie-openai](https://github.com/rennie-openai)
  - [#47758](https://github.com/openai/codex/pull/47758) Preserve more tool metadata within outgoing message budgets [@ningyi-oai](https://github.com/ningyi-oai)
  - [#47773](https://github.com/openai/codex/pull/47773) Honor catalog schemas for asynchronous user input [@rhan-oai](https://github.com/rhan-oai)
  - [#47797](https://github.com/openai/codex/pull/47797) Support close-on-exec attachments without changing PTY semantics [@jif-oai](https://github.com/jif-oai)
  - [#47799](https://github.com/openai/codex/pull/47799) Enable terminal input approval by default [@jif-oai](https://github.com/jif-oai)
  - [#47808](https://github.com/openai/codex/pull/47808) Allow hosts to provide agent controllers through ThreadManager [@jif-oai](https://github.com/jif-oai)
  - [#47811](https://github.com/openai/codex/pull/47811) Preserve explicit user goal updates in Guardian authorization [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47813](https://github.com/openai/codex/pull/47813) Fix sleep interruption test event handling and fixture lifetime [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47814](https://github.com/openai/codex/pull/47814) Fix a lost wakeup in the unified exec termination test [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47817](https://github.com/openai/codex/pull/47817) Stabilize thread resume and memory dual-write tests [@jif-oai](https://github.com/jif-oai)
  - [#47819](https://github.com/openai/codex/pull/47819) Retry Guardian reviews when authorization changes [@teddywyly-oai](https://github.com/teddywyly-oai)
  - [#47820](https://github.com/openai/codex/pull/47820) Add integration coverage for host agent controllers [@jif-oai](https://github.com/jif-oai)
  - [#47824](https://github.com/openai/codex/pull/47824) Allow four concurrent threads in the multi-agent resume test [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47828](https://github.com/openai/codex/pull/47828) Wait for login completion in recommended plugin tests [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47830](https://github.com/openai/codex/pull/47830) Bind Guardian async scores to target environment permissions [@jif-oai](https://github.com/jif-oai)
  - [#47832](https://github.com/openai/codex/pull/47832) Stabilize Rosetta test timing and retry delay telemetry [@jif-oai](https://github.com/jif-oai)
  - [#47847](https://github.com/openai/codex/pull/47847) Keep the TUI responsive during clipboard copies [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47851](https://github.com/openai/codex/pull/47851) Preserve human overrides across repeated heartbeat instructions [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47852](https://github.com/openai/codex/pull/47852) Avoid blocking async proxy resolution on the system proxy cache [@jif-oai](https://github.com/jif-oai)
  - [#47856](https://github.com/openai/codex/pull/47856) Initialize media estimates outside the global cache lock [@jif-oai](https://github.com/jif-oai)
  - [#47858](https://github.com/openai/codex/pull/47858) Validate loaded plugins outside the cache lock [@jif-oai](https://github.com/jif-oai)
  - [#47861](https://github.com/openai/codex/pull/47861) Avoid nested read locking when rendering browser sign-in [@jif-oai](https://github.com/jif-oai)
  - [#47867](https://github.com/openai/codex/pull/47867) Render remote permission paths using executor context [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#47870](https://github.com/openai/codex/pull/47870) Add opt-in OTLP logging for Guardian assessments [@jif-oai](https://github.com/jif-oai)
  - [#47871](https://github.com/openai/codex/pull/47871) Fix PID reservation test race and update guardian heartbeat snapshot [@jif-oai](https://github.com/jif-oai)
  - [#47873](https://github.com/openai/codex/pull/47873) Measure deferred tool namespace fragments before and after truncation [@mzeng-openai](https://github.com/mzeng-openai)
  - [#47879](https://github.com/openai/codex/pull/47879) Fix macOS system-alias matching in patch permission checks [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47881](https://github.com/openai/codex/pull/47881) Use Tokio's clock for TUI paste timing [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#47886](https://github.com/openai/codex/pull/47886) Preserve diagnostic logs when SQLite logging fails [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#47887](https://github.com/openai/codex/pull/47887) Warn users when SQLite diagnostic log writes fail [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#47889](https://github.com/openai/codex/pull/47889) Include TUI client logs in diagnostic uploads [@etraut-openai](https://github.com/etraut-openai)
  - [#47891](https://github.com/openai/codex/pull/47891) Support client secrets for pre-registered MCP OAuth clients [@willwang-openai](https://github.com/willwang-openai)
  - [#47894](https://github.com/openai/codex/pull/47894) Clean up temporary Codex homes after TUI tests [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47896](https://github.com/openai/codex/pull/47896) Preserve Markdown formatting when copying transcript selections [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47898](https://github.com/openai/codex/pull/47898) Preserve local-binding inheritance in environment network policies [@seanh-oai](https://github.com/seanh-oai)
  - [#47899](https://github.com/openai/codex/pull/47899) Add diagnostic reasons to MCP attribution errors [@peilin-openai](https://github.com/peilin-openai)
  - [#47900](https://github.com/openai/codex/pull/47900) Default local threads to paginated history [@owenlin0](https://github.com/owenlin0)
  - [#47901](https://github.com/openai/codex/pull/47901) Add bounded credential-storage telemetry helpers [@celia-oai](https://github.com/celia-oai)
  - [#47902](https://github.com/openai/codex/pull/47902) Avoid repeated table clones during config merging [@imac-oai](https://github.com/imac-oai)
  - [#47903](https://github.com/openai/codex/pull/47903) Move config key alias normalization ahead of merging [@imac-oai](https://github.com/imac-oai)
  - [#47904](https://github.com/openai/codex/pull/47904) Support nested canonical paths in config key aliases [@imac-oai](https://github.com/imac-oai)
  - [#47908](https://github.com/openai/codex/pull/47908) Alias `tui.whimsy` to `tui.effects.starfield` [@imac-oai](https://github.com/imac-oai)
  - [#47912](https://github.com/openai/codex/pull/47912) Fix attestation routing during thread startup [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#47913](https://github.com/openai/codex/pull/47913) Add an opt-in flag to defer mailbox preemption [@jif-oai](https://github.com/jif-oai)
  - [#47915](https://github.com/openai/codex/pull/47915) Reuse verified V8 checksum manifests from the artifact cache [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#47918](https://github.com/openai/codex/pull/47918) Parameterize the turn-start originator header test [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#47919](https://github.com/openai/codex/pull/47919) Transport large Windows sandbox launch payloads through the environment [@malsamiri-oai](https://github.com/malsamiri-oai)
  - [#47920](https://github.com/openai/codex/pull/47920) Allow directory moves under global Seatbelt basename denies [@chess-oai](https://github.com/chess-oai)
  - [#47922](https://github.com/openai/codex/pull/47922) Allow full-access Windows setup to provision through registered Core [@zm-oai](https://github.com/zm-oai)
  - [#47924](https://github.com/openai/codex/pull/47924) Make project trust lookup paths explicit and defer root resolution [@seanh-oai](https://github.com/seanh-oai)
  - [#47926](https://github.com/openai/codex/pull/47926) Retry file blob uploads on HTTP 502 and 504 [@mtsui-oai](https://github.com/mtsui-oai)
  - [#47927](https://github.com/openai/codex/pull/47927) Use `127.0.0.1` for local login redirects [@willwang-openai](https://github.com/willwang-openai)
  - [#47932](https://github.com/openai/codex/pull/47932) Remove GPT-5.4 from bundled catalogs and preserve migration prompts [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#47934](https://github.com/openai/codex/pull/47934) Apply the unchanged-model compaction shortcut to all session sources [@hlevy-openai](https://github.com/hlevy-openai)
  - [#47935](https://github.com/openai/codex/pull/47935) Allow cached catalogs to satisfy MCP startup readiness [@hlevy-openai](https://github.com/hlevy-openai)
  - [#47936](https://github.com/openai/codex/pull/47936) Make MCP and Code Mode input schema budgets configurable [@vivi](https://github.com/vivi)
  - [#47937](https://github.com/openai/codex/pull/47937) Add direct replies for thread settings updates [@sayan-oai](https://github.com/sayan-oai)
  - [#47939](https://github.com/openai/codex/pull/47939) Separate selected plugin identities from MCP contributions [@sayan-oai](https://github.com/sayan-oai)
  - [#47943](https://github.com/openai/codex/pull/47943) Remove unused Windows world-writable audit code [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#47945](https://github.com/openai/codex/pull/47945) Parameterize the thread initialization analytics test by originator [@eddie-openai](https://github.com/eddie-openai)
  - [#47946](https://github.com/openai/codex/pull/47946) Add an in-memory agent message board for ephemeral sessions [@jif-oai](https://github.com/jif-oai)
  - [#47947](https://github.com/openai/codex/pull/47947) Expand root authorization context to 16 messages [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47951](https://github.com/openai/codex/pull/47951) Use prebuilt V8 archives for Bazel on macOS and GNU Linux [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#47952](https://github.com/openai/codex/pull/47952) Prune expired in-memory message board registry entries [@jif-oai](https://github.com/jif-oai)
  - [#47954](https://github.com/openai/codex/pull/47954) Move fullscreen startup tips into the transcript [@etraut-openai](https://github.com/etraut-openai)
  - [#47956](https://github.com/openai/codex/pull/47956) Support file references in image edit requests [@kchainani-oai](https://github.com/kchainani-oai)
  - [#47957](https://github.com/openai/codex/pull/47957) Bound tool-call observations to the outgoing Responses message budget [@ningyi-oai](https://github.com/ningyi-oai)
  - [#47962](https://github.com/openai/codex/pull/47962) Request transparent huge pages for Cargo and eligible Bazel rustc jobs [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#47964](https://github.com/openai/codex/pull/47964) Preserve the client-agent header for Amazon Bedrock Runtime [@celia-oai](https://github.com/celia-oai)
  - [#47967](https://github.com/openai/codex/pull/47967) Surface Flex capacity failures as a distinct terminal error [@sdcoffey](https://github.com/sdcoffey)
  - [#47968](https://github.com/openai/codex/pull/47968) Handle Btrfs device mismatches when masking daemon sockets [@etraut-openai](https://github.com/etraut-openai)
  - [#47970](https://github.com/openai/codex/pull/47970) Expose current environment selections for a running turn [@sayan-oai](https://github.com/sayan-oai)
  - [#47971](https://github.com/openai/codex/pull/47971) Add Pro Max plan support and update Pro display names [@etraut-openai](https://github.com/etraut-openai)
  - [#47974](https://github.com/openai/codex/pull/47974) Preserve Git directory protections across writable roots [@aionescu-oai](https://github.com/aionescu-oai)
  - [#47975](https://github.com/openai/codex/pull/47975) Prevent stale voice answers from reappearing during speech recovery [@etraut-openai](https://github.com/etraut-openai)
  - [#47981](https://github.com/openai/codex/pull/47981) Prepare MCP calls directly from advertised tool identities [@hlevy-openai](https://github.com/hlevy-openai)
  - [#47984](https://github.com/openai/codex/pull/47984) Add multi-agent spawn latency and failure metrics [@owenlin0](https://github.com/owenlin0)
  - [#47988](https://github.com/openai/codex/pull/47988) Reuse MCP handlers across equivalent bindings [@hlevy-openai](https://github.com/hlevy-openai)
  - [#47989](https://github.com/openai/codex/pull/47989) Add startup-only PID namespace inheritance to exec-server [@open-matt](https://github.com/open-matt)
  - [#48004](https://github.com/openai/codex/pull/48004) Respect configured authentication in the thread manager sample [@celia-oai](https://github.com/celia-oai)
  - [#48015](https://github.com/openai/codex/pull/48015) Validate tool suggestion install URLs before showing the app link [@aionescu-oai](https://github.com/aionescu-oai)
  - [#48017](https://github.com/openai/codex/pull/48017) Test same-cell permission grants and strict review in code mode [@anp-oai](https://github.com/anp-oai)
  - [#48035](https://github.com/openai/codex/pull/48035) Remove plugin extension metadata from discovery and summaries [@victor-openai](https://github.com/victor-openai)
  - [#48060](https://github.com/openai/codex/pull/48060) Deduplicate retained instructions across Guardian reviews [@felixxia-oai](https://github.com/felixxia-oai)
  - [#48069](https://github.com/openai/codex/pull/48069) Handle early command yields in the Guardian network approval test [@jif-oai](https://github.com/jif-oai)
  - [#48072](https://github.com/openai/codex/pull/48072) Skip message-board notification previews when there are no recipients [@jif-oai](https://github.com/jif-oai)
  - [#48073](https://github.com/openai/codex/pull/48073) Avoid stdin approval for runtime-only permission grants [@jif-oai](https://github.com/jif-oai)
  - [#48077](https://github.com/openai/codex/pull/48077) Add Serde support to agent message board request types [@jif-oai](https://github.com/jif-oai)
  - [#48078](https://github.com/openai/codex/pull/48078) Replay exec-server shell snapshots through unnamed files [@jif-oai](https://github.com/jif-oai)
  - [#48098](https://github.com/openai/codex/pull/48098) Preserve recent authorization context for Guardian reviews [@felixxia-oai](https://github.com/felixxia-oai)
  - [#48099](https://github.com/openai/codex/pull/48099) Honor shell environment policy in legacy snapshots [@jif-oai](https://github.com/jif-oai)
  - [#48100](https://github.com/openai/codex/pull/48100) Add an HTTP client for remote agent message boards [@jif-oai](https://github.com/jif-oai)
  - [#48101](https://github.com/openai/codex/pull/48101) Show multiline command previews in `/ps` [@etraut-openai](https://github.com/etraut-openai)
  - [#48109](https://github.com/openai/codex/pull/48109) Deduplicate retained instructions against Guardian transcripts [@felixxia-oai](https://github.com/felixxia-oai)
  - [#48110](https://github.com/openai/codex/pull/48110) Deduplicate retained instructions in async Guardian context [@felixxia-oai](https://github.com/felixxia-oai)
  - [#48115](https://github.com/openai/codex/pull/48115) Preserve user text parts during local compaction [@felixxia-oai](https://github.com/felixxia-oai)
  - [#48116](https://github.com/openai/codex/pull/48116) Allow reasoning shortcuts to reach Max [@etraut-openai](https://github.com/etraut-openai)
  - [#48118](https://github.com/openai/codex/pull/48118) Add configurable right-click paste to the fullscreen TUI [@fcoury-oai](https://github.com/fcoury-oai)
  - [#48119](https://github.com/openai/codex/pull/48119) Prevent worker completion races in the guardian authorization test [@felixxia-oai](https://github.com/felixxia-oai)
  - [#48121](https://github.com/openai/codex/pull/48121) Keep startup drafts visible during command center session handoff [@etraut-openai](https://github.com/etraut-openai)
  - [#48123](https://github.com/openai/codex/pull/48123) Add early yielding for code-mode observations [@pakrym-oai](https://github.com/pakrym-oai)
  - [#48130](https://github.com/openai/codex/pull/48130) Use request notifications in the cloud config loader lifetime test [@felixxia-oai](https://github.com/felixxia-oai)
  - [#48132](https://github.com/openai/codex/pull/48132) Allow Left to open the command center from read-only conversations [@etraut-openai](https://github.com/etraut-openai)

[Full release on Github](https://github.com/openai/codex/releases/tag/rust-v0.158.0)

- 2026-09-26



### Codex CLI 0.157.1






```
$ npm install -g @openai/codex@0.157.1


```



View details



## Chores



  - Release highlights could not be determined: the supplied PR index is empty, and the GitHub tag comparison returned 404.

## Changelog

Full Changelog: [`rust-v0.157.0...rust-v0.157.1`](https://github.com/openai/codex/compare/rust-v0.157.0...rust-v0.157.1)

[Full release on Github](https://github.com/openai/codex/releases/tag/rust-v0.157.1)

- 2026-09-25



### macOS security update  26.924




### Security fixes



  - Fixed CVE-2026-100754 on macOS in version 26.924.20706, with thanks to Patrick Wardle, Objective-See Foundation.

- 2026-09-25



### Codex CLI 0.157.0






```
$ npm install -g @openai/codex@0.157.0


```



View details



## New Features



  - Added GPT-6 Sol and Luna, including Amazon Bedrock support and migration prompts for older models. ( [#47332](https://github.com/openai/codex/pull/47332), [#47347](https://github.com/openai/codex/pull/47347))
  - Enabled fullscreen transcripts by default and added Shift-click to extend text selections. ( [#47178](https://github.com/openai/codex/pull/47178), [#47414](https://github.com/openai/codex/pull/47414))
  - Enabled automatic background-server startup for eligible interactive sessions, with recovery choices when server settings are incompatible. ( [#47179](https://github.com/openai/codex/pull/47179), [#47318](https://github.com/openai/codex/pull/47318))
  - Added an `f` shortcut to fork conversations open in another app, preserving drafts and queued prompts. ( [#47185](https://github.com/openai/codex/pull/47185))
  - Made `/import` available in remote sessions and local background-server sessions. ( [#47317](https://github.com/openai/codex/pull/47317))
  - Improved terminal rendering with Unicode bullets, checkboxes, aligned equations, and optimization notation. ( [#47191](https://github.com/openai/codex/pull/47191), [#47322](https://github.com/openai/codex/pull/47322))

## Bug Fixes

  - Preserved active voice conversations when switching threads. ( [#47381](https://github.com/openai/codex/pull/47381))
  - Recovered unsent question answers into the composer when turns end, without disrupting active history searches. ( [#47422](https://github.com/openai/codex/pull/47422), [#47423](https://github.com/openai/codex/pull/47423))
  - Respected tmux mouse settings and restored native scrollback for Terminal.app over SSH in automatic screen mode. ( [#47399](https://github.com/openai/codex/pull/47399), [#47417](https://github.com/openai/codex/pull/47417))
  - Fixed configured proxy routing for realtime connections and standalone web search, including search redirects. ( [#47101](https://github.com/openai/codex/pull/47101), [#47142](https://github.com/openai/codex/pull/47142), [#47204](https://github.com/openai/codex/pull/47204))
  - Added retries for transient file-upload failures and increased the upload timeout to five minutes. ( [#47122](https://github.com/openai/codex/pull/47122), [#47393](https://github.com/openai/codex/pull/47393))
  - Enforced network restrictions across redirects and ongoing HTTP and WebSocket traffic, including cancellation when policy changes revoke access. ( [#47389](https://github.com/openai/codex/pull/47389), [#47407](https://github.com/openai/codex/pull/47407))

## Changelog

Full Changelog: [`rust-v0.156.0...rust-v0.157.0`](https://github.com/openai/codex/compare/rust-v0.156.0...rust-v0.157.0)

  - [#47063](https://github.com/openai/codex/pull/47063) Add a partial index for agent message board root posts [@jif-oai](https://github.com/jif-oai)
  - [#47064](https://github.com/openai/codex/pull/47064) Stop redundant message-board reads when limits reach one [@jif-oai](https://github.com/jif-oai)
  - [#47065](https://github.com/openai/codex/pull/47065) Deduplicate deprecation notices in the TUI transcript [@etraut-openai](https://github.com/etraut-openai)
  - [#47068](https://github.com/openai/codex/pull/47068) Highlight selected newlines in the transcript view [@etraut-openai](https://github.com/etraut-openai)
  - [#47073](https://github.com/openai/codex/pull/47073) Wait for thread idle in Guardian context budget tests [@jif-oai](https://github.com/jif-oai)
  - [#47074](https://github.com/openai/codex/pull/47074) Refresh host-supplied cloud skills at turn startup [@TAFOYA-OAI](https://github.com/TAFOYA-OAI)
  - [#47075](https://github.com/openai/codex/pull/47075) Include attributed previews in agent message board notifications [@jif-oai](https://github.com/jif-oai)
  - [#47077](https://github.com/openai/codex/pull/47077) Serialize environment updates and cancel removed pending attachments [@sayan-oai](https://github.com/sayan-oai)
  - [#47079](https://github.com/openai/codex/pull/47079) Mask daemon socket paths exposed through ancestor bind mounts [@nicksteele-oai](https://github.com/nicksteele-oai)
  - [#47081](https://github.com/openai/codex/pull/47081) Track cumulative MCP attribution across requests and thread history [@peilin-openai](https://github.com/peilin-openai)
  - [#47082](https://github.com/openai/codex/pull/47082) Show the voice toggle in the TUI shortcut overlay [@etraut-openai](https://github.com/etraut-openai)
  - [#47083](https://github.com/openai/codex/pull/47083) Extract per-thread enrichment into a dedicated async helper [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#47084](https://github.com/openai/codex/pull/47084) Avoid building a host SQLite driver for SQLx macros [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#47085](https://github.com/openai/codex/pull/47085) Update model catalog descriptions and GPT-5.6-Sol priority [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#47086](https://github.com/openai/codex/pull/47086) Format analytics credit usage with consistent decimal precision [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47088](https://github.com/openai/codex/pull/47088) Disable unused default dependency features [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#47089](https://github.com/openai/codex/pull/47089) Centralize JSON-RPC response serialization through payloads [@aibrahim-oai](https://github.com/aibrahim-oai)
  - [#47094](https://github.com/openai/codex/pull/47094) Restrict Unix local MCP servers to stdio descriptors [@yuzhu-oai](https://github.com/yuzhu-oai)
  - [#47095](https://github.com/openai/codex/pull/47095) Remove the `rust-release-prepare` workflow [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#47096](https://github.com/openai/codex/pull/47096) Keep TUI hints immediately above the composer [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47100](https://github.com/openai/codex/pull/47100) Preserve assistant answers in bounded TUI task responses [@etraut-openai](https://github.com/etraut-openai)
  - [#47101](https://github.com/openai/codex/pull/47101) Honor configured proxies for realtime WebSocket connections [@celia-oai](https://github.com/celia-oai)
  - [#47106](https://github.com/openai/codex/pull/47106) Preserve originating turn metadata for yielded skill calls [@eddie-openai](https://github.com/eddie-openai)
  - [#47108](https://github.com/openai/codex/pull/47108) Preserve required Windows runtime variables for filesystem helpers [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#47112](https://github.com/openai/codex/pull/47112) Lowercase the retry hint for conversations open in another app [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47113](https://github.com/openai/codex/pull/47113) Persist thread creator identity in rollouts and SQLite [@nornagon-openai](https://github.com/nornagon-openai)
  - [#47114](https://github.com/openai/codex/pull/47114) Preserve and expose thread item lifecycle timestamps [@chiam-oai](https://github.com/chiam-oai)
  - [#47116](https://github.com/openai/codex/pull/47116) Honor the configured product SKU in remote plugin requests [@jessedu-oai](https://github.com/jessedu-oai)
  - [#47118](https://github.com/openai/codex/pull/47118) Support model-catalog overrides for Code Mode tool messages [@rhan-oai](https://github.com/rhan-oai)
  - [#47121](https://github.com/openai/codex/pull/47121) Pass thread IDs to attachment uploads [@kchainani-oai](https://github.com/kchainani-oai)
  - [#47122](https://github.com/openai/codex/pull/47122) Increase OpenAI file blob upload timeout from 60 seconds to 5 minutes [@wilkes-oai](https://github.com/wilkes-oai)
  - [#47125](https://github.com/openai/codex/pull/47125) Add extra policy configuration for Guardian reviews [@won-openai](https://github.com/won-openai)
  - [#47129](https://github.com/openai/codex/pull/47129) Preserve foreign working directories in extension tool environments [@anp-oai](https://github.com/anp-oai)
  - [#47130](https://github.com/openai/codex/pull/47130) Remove the `ultrafast` service tier from `gpt-5.6-sol` [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#47132](https://github.com/openai/codex/pull/47132) Support caller-provided MITM CAs in the network proxy [@viyatb-oai](https://github.com/viyatb-oai)
  - [#47137](https://github.com/openai/codex/pull/47137) Prevent horizontal transcript selection from triggering autoscroll [@imac-oai](https://github.com/imac-oai)
  - [#47142](https://github.com/openai/codex/pull/47142) Honor system proxy settings for standalone web search [@celia-oai](https://github.com/celia-oai)
  - [#47143](https://github.com/openai/codex/pull/47143) Extract exec-server CLI startup into a dedicated module [@anp-oai](https://github.com/anp-oai)
  - [#47149](https://github.com/openai/codex/pull/47149) Update code mode catalog snapshot hashes [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#47155](https://github.com/openai/codex/pull/47155) Ignore stale thread-close notifications after resuming a thread [@etraut-openai](https://github.com/etraut-openai)
  - [#47158](https://github.com/openai/codex/pull/47158) Harden gateway OAuth credential persistence and error redaction [@alexsong-oai](https://github.com/alexsong-oai)
  - [#47159](https://github.com/openai/codex/pull/47159) Expose HTTP origins in MCP server status [@frantic-openai](https://github.com/frantic-openai)
  - [#47162](https://github.com/openai/codex/pull/47162) Apply workspace routing to Guardian v2 classifier requests [@acrognale-oai](https://github.com/acrognale-oai)
  - [#47170](https://github.com/openai/codex/pull/47170) Add explicit gateway login control and authentication status [@alexsong-oai](https://github.com/alexsong-oai)
  - [#47174](https://github.com/openai/codex/pull/47174) Preserve empty cell metadata under pending tool-call pressure [@ningyi-oai](https://github.com/ningyi-oai)
  - [#47178](https://github.com/openai/codex/pull/47178) Enable the fullscreen transcript by default [@etraut-openai](https://github.com/etraut-openai)
  - [#47179](https://github.com/openai/codex/pull/47179) Enable automatic daemon startup by default [@etraut-openai](https://github.com/etraut-openai)
  - [#47185](https://github.com/openai/codex/pull/47185) Allow forking conversations locked by another app in the TUI [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47191](https://github.com/openai/codex/pull/47191) Render aligned equations and optimization notation in TUI math [@etraut-openai](https://github.com/etraut-openai)
  - [#47199](https://github.com/openai/codex/pull/47199) Separate thread preparation from execution persistence [@dermanyang-oai](https://github.com/dermanyang-oai)
  - [#47204](https://github.com/openai/codex/pull/47204) Resolve proxy routes for standalone web search redirects [@celia-oai](https://github.com/celia-oai)
  - [#47207](https://github.com/openai/codex/pull/47207) Add explicit gateway OAuth sign-in to app-server [@alexsong-oai](https://github.com/alexsong-oai)
  - [#47212](https://github.com/openai/codex/pull/47212) Preserve MCP request trace context across transport workers [@bromano-oai](https://github.com/bromano-oai)
  - [#47235](https://github.com/openai/codex/pull/47235) Route multi-agent spawning through `SpawnRequest` [@jif-oai](https://github.com/jif-oai)
  - [#47236](https://github.com/openai/codex/pull/47236) Suppress agent message board notifications to the post author [@jif-oai](https://github.com/jif-oai)
  - [#47240](https://github.com/openai/codex/pull/47240) Prevent V2 agent eviction from racing with queued messages [@jif-oai](https://github.com/jif-oai)
  - [#47244](https://github.com/openai/codex/pull/47244) Centralize agent resume handling in `LocalAgentControl` [@jif-oai](https://github.com/jif-oai)
  - [#47248](https://github.com/openai/codex/pull/47248) Add explicit app and account targets to MCP resource reads [@victor-openai](https://github.com/victor-openai)
  - [#47249](https://github.com/openai/codex/pull/47249) Drop descendant channel posts from retained remote compaction v2 history [@jif-oai](https://github.com/jif-oai)
  - [#47252](https://github.com/openai/codex/pull/47252) Return agent snapshots from `close_agent` [@jif-oai](https://github.com/jif-oai)
  - [#47257](https://github.com/openai/codex/pull/47257) Preserve explicit message-board unsubscribes when posting [@jif-oai](https://github.com/jif-oai)
  - [#47258](https://github.com/openai/codex/pull/47258) Test spawn settings reporting after child removal [@jif-oai](https://github.com/jif-oai)
  - [#47259](https://github.com/openai/codex/pull/47259) Subscribe authors to message-board channels created by posting [@jif-oai](https://github.com/jif-oai)
  - [#47263](https://github.com/openai/codex/pull/47263) Expose hosted plugin extensions in app-server summaries [@victor-openai](https://github.com/victor-openai)
  - [#47267](https://github.com/openai/codex/pull/47267) Stream agent snapshots from local status subscriptions [@jif-oai](https://github.com/jif-oai)
  - [#47271](https://github.com/openai/codex/pull/47271) Implement `AgentControl` for `LocalAgentControl` [@jif-oai](https://github.com/jif-oai)
  - [#47272](https://github.com/openai/codex/pull/47272) Allow Guardian sync review across compaction hash differences [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47275](https://github.com/openai/codex/pull/47275) Enable Guardian thread context by default [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47281](https://github.com/openai/codex/pull/47281) Add regression coverage for message board unsubscribe persistence [@jif-oai](https://github.com/jif-oai)
  - [#47287](https://github.com/openai/codex/pull/47287) Update the Guardian extra-policy snapshot for retained instructions [@felixxia-oai](https://github.com/felixxia-oai)
  - [#47292](https://github.com/openai/codex/pull/47292) Consolidate agent operations in the `AgentControl` implementation [@jif-oai](https://github.com/jif-oai)
  - [#47301](https://github.com/openai/codex/pull/47301) Separate local agent runtime state from controller handles [@jif-oai](https://github.com/jif-oai)
  - [#47302](https://github.com/openai/codex/pull/47302) Use compact display metadata for Guardian review threads [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#47303](https://github.com/openai/codex/pull/47303) Clean up legacy Guardian thread metadata in SQLite [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#47317](https://github.com/openai/codex/pull/47317) Enable `/import` in remote and local daemon sessions [@etraut-openai](https://github.com/etraut-openai)
  - [#47318](https://github.com/openai/codex/pull/47318) Offer explicit recovery for incompatible background servers [@etraut-openai](https://github.com/etraut-openai)
  - [#47319](https://github.com/openai/codex/pull/47319) Match agent status symbols to the selected row style [@etraut-openai](https://github.com/etraut-openai)
  - [#47320](https://github.com/openai/codex/pull/47320) Fix Escape navigation in read-only agent sessions [@etraut-openai](https://github.com/etraut-openai)
  - [#47321](https://github.com/openai/codex/pull/47321) Honor the system clock preference across more TUI timestamps [@etraut-openai](https://github.com/etraut-openai)
  - [#47322](https://github.com/openai/codex/pull/47322) Render TUI Markdown lists with Unicode bullets and checkboxes [@etraut-openai](https://github.com/etraut-openai)
  - [#47323](https://github.com/openai/codex/pull/47323) Persist resume metadata in compaction checkpoints [@owenlin0](https://github.com/owenlin0)
  - [#47325](https://github.com/openai/codex/pull/47325) Keep report reason tags within Sentry limits [@ningyi-oai](https://github.com/ningyi-oai)
  - [#47326](https://github.com/openai/codex/pull/47326) Restrict MCP OAuth authorization endpoints to HTTP(S) [@viyatb-oai](https://github.com/viyatb-oai)
  - [#47327](https://github.com/openai/codex/pull/47327) Preserve image generation request IDs on failure [@chrisdong-oai](https://github.com/chrisdong-oai)
  - [#47329](https://github.com/openai/codex/pull/47329) Standardize TUI menu description wording and punctuation [@etraut-openai](https://github.com/etraut-openai)
  - [#47330](https://github.com/openai/codex/pull/47330) Identify failed SQLite databases in `codex doctor` output [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#47331](https://github.com/openai/codex/pull/47331) Avoid redundant spacing above the transcript composer [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47332](https://github.com/openai/codex/pull/47332) Add GPT-6 Sol and Luna to the model catalog [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#47338](https://github.com/openai/codex/pull/47338) Move the activity inspection hint into keyboard shortcut help [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47340](https://github.com/openai/codex/pull/47340) Add conditional turn interruption that preserves pending input [@pmccrary-oai](https://github.com/pmccrary-oai)
  - [#47342](https://github.com/openai/codex/pull/47342) Skip stored title lookups for ephemeral forks [@keyz](https://github.com/keyz)
  - [#47347](https://github.com/openai/codex/pull/47347) Add GPT-6 Sol and Luna to Amazon Bedrock catalogs [@celia-oai](https://github.com/celia-oai)
  - [#47348](https://github.com/openai/codex/pull/47348) Overlap subagent spawn persistence and clean up cancelled children [@owenlin0](https://github.com/owenlin0)
  - [#47349](https://github.com/openai/codex/pull/47349) Move plugin recommendations into developer context [@adaley-openai](https://github.com/adaley-openai)
  - [#47350](https://github.com/openai/codex/pull/47350) Reuse cloud skill catalogs across turns until invalidated [@hlevy-openai](https://github.com/hlevy-openai)
  - [#47353](https://github.com/openai/codex/pull/47353) Preserve `invalid_prompt` as a distinct error classification [@rennie-openai](https://github.com/rennie-openai)
  - [#47355](https://github.com/openai/codex/pull/47355) Reserve spacing after recaps at the transcript tail [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47358](https://github.com/openai/codex/pull/47358) Color paths and URLs in `codex doctor` by check status [@dkovalenko-oai](https://github.com/dkovalenko-oai)
  - [#47360](https://github.com/openai/codex/pull/47360) Preserve user prompt URL destinations across terminal widths [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47361](https://github.com/openai/codex/pull/47361) Restrict Windows sandbox default object access to the logon session [@viyatb-oai](https://github.com/viyatb-oai)
  - [#47362](https://github.com/openai/codex/pull/47362) Bound inbound exec-server requests across client transports [@viyatb-oai](https://github.com/viyatb-oai)
  - [#47365](https://github.com/openai/codex/pull/47365) Resume model context from the latest compaction boundary [@owenlin0](https://github.com/owenlin0)
  - [#47369](https://github.com/openai/codex/pull/47369) Overlap agent metadata reads when resuming a V2 root [@vkg-oai](https://github.com/vkg-oai)
  - [#47375](https://github.com/openai/codex/pull/47375) Add an opt-in preference for the local MXC sandbox [@iceweasel-oai](https://github.com/iceweasel-oai)
  - [#47377](https://github.com/openai/codex/pull/47377) Add opt-in reasoning status for realtime V3 delegations [@guinness-oai](https://github.com/guinness-oai)
  - [#47380](https://github.com/openai/codex/pull/47380) Route TUI voice controls through the app [@etraut-openai](https://github.com/etraut-openai)
  - [#47381](https://github.com/openai/codex/pull/47381) Keep voice conversations running across TUI thread navigation [@etraut-openai](https://github.com/etraut-openai)
  - [#47382](https://github.com/openai/codex/pull/47382) Show a voice badge in the agents overview [@etraut-openai](https://github.com/etraut-openai)
  - [#47384](https://github.com/openai/codex/pull/47384) Restore composer hints after clearing selection at the transcript bottom [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47389](https://github.com/openai/codex/pull/47389) Enforce network policy throughout HTTP and WebSocket requests [@acrognale-oai](https://github.com/acrognale-oai)
  - [#47393](https://github.com/openai/codex/pull/47393) Retry transient OpenAI file blob upload failures [@mtsui-oai](https://github.com/mtsui-oai)
  - [#47397](https://github.com/openai/codex/pull/47397) Refresh bundled model metadata and instructions [@andrewgu-oai](https://github.com/andrewgu-oai)
  - [#47399](https://github.com/openai/codex/pull/47399) Respect tmux mouse settings in fullscreen and overlays [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47407](https://github.com/openai/codex/pull/47407) Enforce application network policy across app-server requests [@acrognale-oai](https://github.com/acrognale-oai)
  - [#47408](https://github.com/openai/codex/pull/47408) Enforce application network policy for AWS auth and telemetry [@acrognale-oai](https://github.com/acrognale-oai)
  - [#47410](https://github.com/openai/codex/pull/47410) Honor network policy in remote control and recover remote execution [@acrognale-oai](https://github.com/acrognale-oai)
  - [#47411](https://github.com/openai/codex/pull/47411) Apply shared network policy throughout embedded Codex startup [@acrognale-oai](https://github.com/acrognale-oai)
  - [#47413](https://github.com/openai/codex/pull/47413) Cache decrypted gateway OAuth secrets per backend [@charliemarsh-oai](https://github.com/charliemarsh-oai)
  - [#47414](https://github.com/openai/codex/pull/47414) Support Shift-click to extend transcript selections [@etraut-openai](https://github.com/etraut-openai)
  - [#47417](https://github.com/openai/codex/pull/47417) Use native scrollback for Terminal.app over SSH in auto mode [@fcoury-oai](https://github.com/fcoury-oai)
  - [#47422](https://github.com/openai/codex/pull/47422) Recover unsent question drafts when TUI turns end [@imac-oai](https://github.com/imac-oai)
  - [#47423](https://github.com/openai/codex/pull/47423) Preserve history search during background draft recovery [@imac-oai](https://github.com/imac-oai)
  - [#47424](https://github.com/openai/codex/pull/47424) Clear pending async question notifications when turns end [@imac-oai](https://github.com/imac-oai)
  - [#47428](https://github.com/openai/codex/pull/47428) Apply inherited environment settings at turn boundaries [@sayan-oai](https://github.com/sayan-oai)
  - [#47435](https://github.com/openai/codex/pull/47435) Allow environment selection updates during an active turn [@sayan-oai](https://github.com/sayan-oai)
  - [#47437](https://github.com/openai/codex/pull/47437) Stabilize retry timing and WebSocket tests [@anp-oai](https://github.com/anp-oai)

[Full release on Github](https://github.com/openai/codex/releases/tag/rust-v0.157.0)

- 2026-09-23



### ChatGPT for iOS  1.2026.258




### New features



  - Redesigned home screen.
  - New iPad split view keeps your task list beside the open task in landscape.
  - Added support for browsing changes inside nested Git repositories.

### Improvements and bug fixes

  - Side chats now carry over attachments, selected text, and review comments.
  - Fixed replies appearing blank or incomplete when the next queued prompt starts.
  - New tasks preserve your selected computer and better recognize project checkouts and worktrees.
  - More reliable file links, with clearer loading feedback when opening files and new tasks.
  - Clearer error messages explain why task history could not load and what to try next.
  - Smoother animations when adding photos from the camera or Photo Library.
  - Fixed pairing failures caused by an incorrect device clock and SSH connection issues on Mac and Linux.

- 2026-09-23



### Codex CLI 0.156.1






```
$ npm install -g @openai/codex@0.156.1


```



View details



## New Features



  - Choose GPT-6 Sol or GPT-6 Luna from the model picker. The rate-limit switch prompt now recommends GPT-6 Luna. ( [#47405](https://github.com/openai/codex/pull/47405))

## Changelog

Full Changelog: [`rust-v0.156.0...rust-v0.156.1`](https://github.com/openai/codex/compare/rust-v0.156.0...rust-v0.156.1)

  - [#47405](https://github.com/openai/codex/pull/47405) \[hotfix 0.156.0\] Add GPT-6 Sol and Luna to the model catalog ( [#47332](https://github.com/openai/codex/pull/47332)) [@imac-oai](https://github.com/imac-oai)

[Full release on Github](https://github.com/openai/codex/releases/tag/rust-v0.156.1)

- 2026-09-22



### Codex app  26.917




### New features



  - Added a notification sound setting for task completions, permission requests,
    and questions. Choose **Default**, **Classic**, or **None**. On macOS, you can
    also choose a system sound or import an audio file.

### Performance improvements and bug fixes

  - Added a sign-in recovery dialog for session errors that prevent app startup.
  - Preserved chat titles in the **Rename** dialog when worktree setup finishes.

- 2026-09-22



### GPT-6 Sol and Luna in Codex and ChatGPT Work




GPT-6 Sol and GPT-6 Luna are rolling out to Codex and ChatGPT Work at lower
token prices than their GPT-5.6 predecessors. Use Sol for complex coding and
agentic workflows, and Luna for focused, high-volume tasks.



Both models are rolling out to Plus, Pro, Business, Enterprise, and Edu users.
Free and Go users can access Luna in the desktop app. Availability depends on
rollout and workspace settings; Enterprise administrators must enable the new
models. In ChatGPT, the models are available in Work and Codex, but not Chat.



Choose a model in the picker when available. In the CLI, use `/model` or start
a task with `codex --model gpt-6-sol` or `codex --model gpt-6-luna`.



See [Models](https://learn.chatgpt.com/docs/models) for selection and migration guidance,
[Pricing](https://learn.chatgpt.com/docs/pricing) for credit rates and usage, and
[Workspace model availability](https://learn.chatgpt.com/docs/enterprise/workspace-model-availability#gpt-6-sol-and-luna-in-enterprise)
for administrator controls.

- 2026-09-18



### ChatGPT for iOS  1.2026.251




### New features



  - Create folders directly from the file picker.
  - Added support for writing blocks, with draft alternatives and copy actions.

### Improvements and bug fixes

  - New tasks remember your worktree mode and setup environment for each project.
  - Long queued prompts show a compact preview and expand on tap.
  - Fixed queued prompts missing or appearing outdated after reopening a task.
  - Worktree task cards now open correctly after setup completes.
  - Restored the new-task button for projects containing only worktree tasks.
  - Improved voice-call reliability during temporary connection interruptions.
  - Better alignment of project, environment, and Git controls on iPad.
  - Fixed the thinking timer resetting when a new task starts.

- 2026-09-17



### Codex app  26.915




### Performance improvements and bug fixes



  - Fixed WSL terminals opening in the wrong Linux distribution or project folder.
  - Fixed adding WSL project folders, including folders on mapped drives.
  - Updated sign-in screens to show only the methods allowed by your organization’s policy.

- 2026-09-16



### Codex app  26.911




### Performance improvements and bug fixes



  - Fixed back navigation getting stuck between settings and a chat.
  - Kept configuration warnings visible after app startup and window reloads.
  - Improved focus and alignment in answer fields for questions from Codex.

- 2026-09-14



### GPT-5.3-Codex-Spark deprecated




GPT-5.3-Codex-Spark was deprecated on September 14, 2026. The research
preview is no longer available in the ChatGPT desktop app, Codex CLI, or IDE
extension.



Switch to one of the [recommended models](https://learn.chatgpt.com/docs/models#recommended-models),
and update saved configurations, custom agents, and scripts that select
`gpt-5.3-codex-spark`.



For faster responses with a supported model, see
[Fast mode](https://learn.chatgpt.com/docs/agent-configuration/speed#fast-mode).

- 2026-09-14



### GPT-5.5 retires from ChatGPT, ChatGPT Work, and Codex on October 14




On October 14, 2026, GPT-5.5 will retire from ChatGPT, ChatGPT Work, and Codex
on all plans, including consumer, Business, Enterprise, and Edu plans. This
retirement does not apply to the OpenAI API.



For Codex with ChatGPT sign-in, choose an available replacement for your plan
and client. See [GPT-5.5 retirement](https://learn.chatgpt.com/docs/models#gpt-55-retirement) for
migration guidance.



Update workspace defaults, saved model settings, managed configurations,
custom agents, scheduled tasks, and scripts that still select `gpt-5.5`.



See [GPT-5.5 retirement](https://learn.chatgpt.com/docs/models#gpt-55-retirement) and
[workspace model availability](https://learn.chatgpt.com/docs/enterprise/workspace-model-availability#prepare-for-the-gpt-55-retirement)
for migration guidance.

- 2026-09-11



### Quick chats with Pets and Appshots on Windows  26.908




### Chat while you work



Keep ChatGPT close while you work in other apps. In the ChatGPT desktop app on
macOS and Windows, you can now type a quick chat from the floating Pets controls
and press **Enter** to send it. Use `@` to add context and `$` to choose a skill.
Select the bell icon to follow progress in your threads, then select a thread
to open the full conversation.



Choose a companion or show just the controls in **Settings > Pets**. Press
**Option+Space** on macOS or **Windows+Alt+P** on Windows to show the controls
and focus Quick Chat. Pressing the shortcut again keeps Quick Chat open.
You can change **Show pet** in **Settings > Keyboard shortcuts**. To hide the
controls, select **Hide pet** in the command menu or **Settings > Pets**.



On macOS, you can also send an appshot to the floating controls. Keep the main
ChatGPT window in the background and choose **Automatic** for **Appshot**
**destination**.



Learn more about [Pets](https://learn.chatgpt.com/docs/pets?surface=app).



### Share an app window on Windows



[Appshots](https://learn.chatgpt.com/docs/appshots) are now available in the ChatGPT desktop app on
Windows. Press both Alt keys to share the frontmost app window with ChatGPT,
then ask a question or describe what you want to do. An appshot includes a
screenshot and available text from that window. You can customize the shortcut
and choose which chat receives it in settings.



### Other improvements and bug fixes



  - Open files directly from a conversation’s **Sources** panel, or download
    files that ChatGPT can’t preview.
  - Assign a [Codex Micro](https://learn.chatgpt.com/docs/features/codex-micro) key to **Insert text** and
    add your own reusable text to the active prompt without sending it.
  - Reset a pet to its default size in settings. Custom pets also stay in place
    when you refresh their artwork.
  - Keep unfinished comments on response text when you switch chats and return.
  - ChatGPT dictation now respects your saved **Main language** preference.
  - Keep tab widths and scroll positions more stable as you close browser tabs
    in full and split views.

- 2026-09-08



### Codex app  26.903




### New features



  - Added a configurable shortcut to open web links in your default browser.
  - Added **Open with > New tab** to file diffs so you can open a source file at the selected line in the app.

### Performance improvements and bug fixes

  - Improved recovery and responsiveness when reopening chats or sending messages while a chat resumes.
  - Fixed duplicate follow-up messages appearing in restored chat history.

- 2026-09-08



### ChatGPT for iOS  1.2026.244




### New features



  - Reference other tasks directly in the composer with `@` mentions.
  - Answer live questions while Codex continues working, without losing your draft.
  - Explore files with Back navigation, recent files, and remembered reading positions.
  - Choose a starting branch for new worktrees, or include your current local changes.
  - Worktree setup can now continue in the background on iOS 26, with progress shown in a Live Activity.

### Improvements and bug fixes

  - Voice now respects your selected model and reasoning effort.
  - Restored missing delegated-task messages and fixed navigation between linked tasks.
  - Code reviews now complete more reliably, without duplicate activity or stuck running states.
  - Fixed crashes and stale queued messages when switching from Queue to Steer.
  - Improved reconnect reliability and preserved device pairing during temporary service outages.
  - Resolved duplicate plugin skills in composer suggestions.

- 2026-09-05



### Codex MCP server removed




The `codex mcp-server` command and standalone `codex-mcp-server` binary have
been removed after their deprecation on August 24, 2026. Update integrations
that launch either command before upgrading Codex.



Use the [Codex app server](https://learn.chatgpt.com/docs/app-server) for integrations. The app-server
command is experimental and isn’t supported for production workloads.



See the [migration guidance](https://learn.chatgpt.com/docs/mcp-server) for details. Codex continues to
support [connecting to external MCP servers](https://learn.chatgpt.com/docs/extend/mcp) through `codex mcp`.

- 2026-09-02



### Codex app  26.901




Includes updates through September 5, 2026.



### Performance improvements and bug fixes



  - Fixed the model picker closing while settings refresh.
  - Distinguished successfully submitted feedback from failed diagnostic uploads.
  - Fixed remote chats getting stuck when reopened after their host changes.
  - Preserved preferences for automatically connecting to SSH hosts after an app restart.

- 2026-09-01



### ChatGPT for iOS  1.2026.237




### New features



  - Attachments now work across all connected hosts, including Windows and Linux, and support videos from the Photo Library.
  - Press and hold the attachment button to attach recent photos.
  - A new Priority view brings running tasks, unread updates, and tasks awaiting your response to the top of the task list.
  - Queued prompts now sync with the connected host, remain editable, and send even when the app is in the background.
  - Long-running tasks now show their live working time.
  - Task menus now include an option to copy the thread ID.

### Improvements and bug fixes

  - Task list loading and organization are faster and more reliable, with simpler date sections and fewer stalls or disappearing projects.
  - Reconnects are more reliable, resolving stuck Send states, missing approvals, and stale task updates.
  - Long responses now stream with fewer visual interruptions.
  - Side chat messages remain available until you close them, even after the chat can no longer reconnect.

## August 2026

- 2026-08-31



### Codex app  26.831




### Performance improvements and bug fixes



  - Fixed new chats getting stuck after pasting a large amount of text.
  - Improved startup recovery on Windows and cleared stale startup errors after reconnection.
  - Fixed response streaming stalls in hidden app windows.

- 2026-08-27



### Codex app  26.825




### Performance improvements and bug fixes



  - Preserved saved chats and projects when renaming an SSH connection.

- 2026-08-26



### ChatGPT for iOS  1.2026.230




### New features



  - Added task search across titles and conversation content on connected hosts.
  - Added a compact composer gauge for viewing and adjusting reasoning effort.
  - Added a full-screen editor for longer prompts.
  - Added configurable Home Screen shortcuts for ChatGPT, Work, and Codex Remote.
  - Added optional comments to selected response annotations.

### Improvements and bug fixes

  - Improved loading for long threads, with older history fetched as needed.
  - Refined task list layout, ordering, and pinning to better match desktop.
  - Inline visualizations now follow iOS appearance and accent settings.

- 2026-08-25



### Browser extensions, site tools, and cloud sign-in  26.820




  - **More browsers:** Use the [ChatGPT browser extension](https://learn.chatgpt.com/docs/chrome-extension)
    in Microsoft Edge, Brave, Opera, and Vivaldi, as well as Chrome. Set up
    your browser in **Settings > Computer Use** in the ChatGPT desktop app.
    All five support tab mentions and browser control; Opera doesn’t support
    side chat.

  - **Site tools (WebMCP):** In the desktop app’s built-in browser, ChatGPT Work
    and Codex can use [tools provided by a website](https://learn.chatgpt.com/docs/webmcp) to work with
    the page. Use GPT-5.6 Sol or GPT-5.6 Terra and update to the latest desktop
    app. Site tools aren’t available with GPT-5.6 Luna or in Enterprise or Edu
    workspaces.

  - **Cloud browser sign-in:** On eligible plans, ChatGPT Work on the web, iOS,
    and Android can ask you to [sign in to a supported\\
    website](https://learn.chatgpt.com/docs/browser?surface=web#web-sign-in-to-a-website) through the cloud
    browser. Enter your details in the sign-in flow, not in the chat. Cloud
    browser sessions stay separate from your local browser. Website sign-in
    isn’t available for Enterprise or Edu workspaces.


Availability depends on rollout and workspace settings. Website-access and
action-confirmation requirements still apply.

### Performance improvements and bug fixes

  - Fixed browser tab mentions being lost when starting a chat from Home.
  - Improved right-to-left chat titles and Command+Arrow navigation in the composer.

- 2026-08-25



### Trigger scheduled tasks from Gmail, Slack, and GitHub events




ChatGPT scheduled tasks can now run when supported events occur in Gmail, Slack,
or GitHub. Filter Gmail messages by sender or subject, watch selected Slack
channels, or respond to pull request activity such as reviews, comments, commit
updates, and merges.



Event-triggered tasks are available in ChatGPT on the web and mobile for
eligible plans. Connect the relevant app and approve its requested access before
creating a task.
The ChatGPT Slack app must be a member of each watched channel, and the
connected GitHub app must have access to each watched repository.



An event-triggered task can’t also use a time-based schedule. When matching
events arrive close together, ChatGPT may combine them in one run.
Open **Scheduled** to review pending events or choose **Run now**.



[Learn how to trigger scheduled tasks from app\\
events](https://learn.chatgpt.com/docs/automations?surface=web#web-trigger-tasks-from-app-events).

- 2026-08-24



### Codex MCP server command deprecated




The `codex mcp-server` command is now deprecated. Use the [Codex app\\
server](https://learn.chatgpt.com/docs/app-server) instead.



**Update, September 5, 2026:** The command and standalone `codex-mcp-server`
binary have been removed. See the [migration guidance](https://learn.chatgpt.com/docs/mcp-server).

- 2026-08-20



### Codex and ChatGPT updates




### New features



  - **Apple Messages:** Use the [Apple Messages plugin](https://learn.chatgpt.com/docs/plugins?surface=app#app-use-apple-messages-from-codex) to read and search Messages chats on your Mac and prepare or send messages. It’s available on all plans in the ChatGPT desktop app for macOS. You can use the plugin in ChatGPT Work and Codex. By default, ChatGPT sends messages only after you approve the message and its recipients. See the plugin guide for persistent-approval risks, revocation steps, and the known issue with tasks that disable approval prompts.

  - **Site co-editing:** Where Site collaboration is available, owners can [invite active members of the same workspace as editors](https://learn.chatgpt.com/docs/sites#collaborate-on-a-site). Editors can read the Site’s live database data, update the Site, save versions, and publish changes after the owner publishes the Site for the first time. Owners retain control of the audience, settings, analytics, ownership, version restoration, and editor access.

  - **Editable Site URLs:** Where URL editing is available, owners can [change an existing Site’s ChatGPT-hosted address](https://learn.chatgpt.com/docs/sites#change-a-site-url) without creating another deployment. The previous address redirects to the new URL. Custom domains are a separate, existing feature and aren’t changed by this setting.

  - **Computer History in Europe:** [Computer History](https://learn.chatgpt.com/docs/customization/computer-history) is now available in the EEA, Switzerland, and the United Kingdom for ChatGPT Pro, Business, and Enterprise users in the ChatGPT desktop app on macOS. It’s off by default and requires Memories. Business and Enterprise administrators must enable access before workspace members can choose to turn it on.

  - **Shared thread snapshots:** On all Codex plans, [share a read-only snapshot of a local Codex thread](https://learn.chatgpt.com/docs/use-chatgpt#share-a-read-only-snapshot-of-a-codex-thread) from the ChatGPT desktop app for macOS. The snapshot doesn’t update when the original thread changes. Personal-account links can be opened by anyone with the link; workspace-account links are limited to members of the originating workspace. Codex redacts known secret patterns, but review the shared content because sensitive content may remain. View or revoke links in [ChatGPT data controls](https://chatgpt.com/#settings/DataControls), under **Shared links**.

  - **Unified pinned threads:** Keep the same [pinned chats](https://learn.chatgpt.com/docs/projects?surface=app#app-organize-projects-and-chats) across the ChatGPT desktop app and iOS.


- 2026-08-19



### Codex app  26.818




Includes updates through August 23, 2026.



### Performance improvements and bug fixes



  - Eligible local chats interrupted by an app update now resume automatically after the app restarts.
  - Preserved draft formatting and mentions when switching between chats.
  - Fixed a blue composer background on Windows virtual desktops.

- 2026-08-19



### GitLab support in Codex cloud (Beta)




GitLab support is available in beta on all ChatGPT plans. Connect a GitLab
project to Codex cloud, create an environment for it, start tasks from issues
or merge requests with `@codex`, and request one-off or automatic merge request
reviews.



The integration runs in Codex cloud. A managed workspace admin can disable the
connector. GitLab-triggered activity requires permission to configure the
applicable webhook. For GitLab Self-Managed or GitLab Dedicated, a workspace admin must
configure the connection, and webhook activity requires GitLab 19.0 or later.



Codex cannot complete a review when GitLab omits a collapsed or oversize diff.



Learn how to [use Codex with GitLab](https://learn.chatgpt.com/docs/third-party/gitlab).

- 2026-08-18



### ChatGPT for iOS  1.2026.223




### New features



  - Added a setting to open ChatGPT directly in Codex Remote on launch.
  - Added support for standard MCP forms and editable message approvals.
  - Linked folders now open directly in the files sheet.

### Improvements and bug fixes

  - Improved the New Thread project picker to reflect the selected host’s current projects.
  - Voice now works directly from existing task composers, connects more reliably, and continues task actions in the background.
  - Improved diff review stability and performance, especially in large workspaces.
  - Added a Retry action when task messages fail to load.
  - Fixed large task responses failing to load.
  - Fixed tasks disappearing or remaining unavailable after being idle, reconnecting, or returning to the task list.
  - Improved host pairing reliability and prevented enrollment checks from freezing the app.
  - Improved response annotations and preserved streamed activity when tasks complete.
  - Canceling or editing a steering message now prevents delivery.

- 2026-08-17



### Public plugin catalog CSV export




Eligible ChatGPT Enterprise workspace owners and admins can download a CSV of
the public plugins visible to their workspace. The export includes plugin, app,
and Chat skill names and descriptions, along with developer, version, date
added in UTC, and OpenAI verification metadata.



Open [Admin > Plugins](https://chatgpt.com/admin/plugins), select **Public**, and
then select the download icon ( **Export CSV**). The export uses a public-catalog
snapshot that can be up to 48 hours old and does not include plugins created for
the workspace.
It isn’t available in FedRAMP workspaces.



Learn more about [plugin controls](https://learn.chatgpt.com/docs/enterprise/apps-and-connectors).

- 2026-08-17



### Codex app  26.814




### Performance improvements and bug fixes



  - Kept sidebar projects in their saved order as chat activity changes.

- 2026-08-13



### Computer History  26.810




[Computer History](https://learn.chatgpt.com/docs/customization/computer-history) is an opt-in feature
in the ChatGPT desktop app on macOS that turns activity across apps and
websites into memories and a timeline that ChatGPT and Codex can use. Choose
which apps and websites contribute, pause collection, and review or delete
your history at any time.



Computer History is available to ChatGPT Pro, Business, and Enterprise users.
Business and Enterprise administrators must enable access before workspace
members can turn it on. Initial availability excludes the European Economic Area (EEA),
Switzerland, and the United Kingdom.



### Performance improvements and bug fixes



  - Preserved undo and redo history in the Markdown editor when switching chats.
  - Prevented duplicate pull request comments while comments are refreshing.

- 2026-08-11



### Linux desktop preview and agent imports




### Install the ChatGPT desktop app on Linux



The [ChatGPT desktop app for Linux](https://learn.chatgpt.com/docs/linux/linux-app) is available in
preview for supported Ubuntu, Debian, and Fedora desktop distributions on x64
and ARM64 processors. Download the `.deb` or `.rpm` package for your
distribution, then sign in to work with projects, local files, and Codex.



### Import setup and recent work from other agents



The desktop app supports **Claude Code**, **Claude Cowork**, and
**Cursor**. [Import instructions, settings, skills, plugins, projects, and\\
recent work](https://learn.chatgpt.com/docs/import), then turn on automatic updates in
**Settings > Import** to keep imported work in sync.



Codex CLI can also import supported setup and recent chats from Claude Code
and Cursor with `/import`.

- 2026-08-10



### Introducing Daybreak Blue and Daybreak Red




Daybreak now offers two access tiers for approved defenders: Daybreak Blue and
Daybreak Red. Use them to move from security findings to validated fixes in
explicitly authorized engagements.



Start with Daybreak Blue for most defensive security work. It provides access
to general-purpose models such as GPT-5.6 Sol for vulnerability discovery,
secure code review, detection engineering, incident response, malware analysis,
and patch validation.



Daybreak Red provides separately approved access to purpose-trained models such
as GPT-5.6 Cyber for authorized vulnerability reproduction, exploit validation,
penetration testing, red teaming, and complex system analysis.



Access requires approval through
[Trusted Access for Cyber](https://learn.chatgpt.com/docs/cyber-safety#trusted-access-for-cyber) and
applies only to the approved identity, workspace or API organization and
project, model, and product surface. Daybreak Red requires separate approval
and provisioning; Daybreak Blue access doesn’t grant access to Daybreak Red.



Work in an isolated environment, define your engagement scope, use
least-privilege [permission profiles](https://learn.chatgpt.com/docs/permissions), and configure
[Auto-review](https://learn.chatgpt.com/docs/sandboxing/auto-review) for eligible actions before they
cross the sandbox boundary.



Learn more about [Cyber Safety](https://learn.chatgpt.com/docs/cyber-safety),
[Codex credit rates](https://learn.chatgpt.com/docs/pricing#credits-overview), and
[API token prices](https://learn.chatgpt.com/api/docs/pricing).

- 2026-08-07



### ChatGPT for iOS  1.2026.209




### Improvements and bug fixes



  - Improved task reconnection with visible progress while keeping existing tasks usable during connection checks.
  - New tasks now preserve their first prompt and attachments while starting, preventing empty tasks that could not be reopened.
  - Improved editing performance for long prompts.
  - Voice conversations now follow your Background Conversations setting.
  - Approvals and user-input requests now recover reliably after reconnecting, with cleaner approval details in the transcript.
  - Fixed follow-up `/goal` prompts after completing a goal.
  - Fixed task-list freezes, disappearing task titles, flashing thinking summaries, and transcript crashes.

- 2026-08-06



### Codex app  26.803




### Performance improvements and bug fixes



  - Fixed an issue where typing in Find could edit the open code file.
  - Preserved the selected model and thinking level when moving a chat to a worktree.
  - Made search for @-mentions case-insensitive.

- 2026-08-04



### Codex app  26.730




### New features



  - Added source-folder shortcuts to the terminal for projects with more than one folder.

### Performance improvements and bug fixes

  - Fixed duplicate pinned chats in the sidebar.
  - Kept other project folders available when repairing worktree setup.

## July 2026

- 2026-07-31



### GPT-5.4 and GPT-5.4 mini retire from Codex on August 31




On August 31, 2026, GPT-5.4 and GPT-5.4 mini will no longer be available in
Codex for users signed in with ChatGPT. GPT-5.4 and GPT-5.4 mini will remain
available on the OpenAI API and Codex sessions authenticated with an API key.



Switch to their recommended replacements:



  - Replace `gpt-5.4` with `gpt-5.6-terra` (GPT-5.6 Terra).
  - Replace `gpt-5.4-mini` with `gpt-5.6-luna` (GPT-5.6 Luna).

Before the cutoff, update workspace defaults, saved model settings, managed
configurations, custom agents, and scheduled tasks that use either model.

See [Codex models](https://learn.chatgpt.com/docs/models#deprecated-codex-models) and
[workspace model availability](https://learn.chatgpt.com/docs/enterprise/workspace-model-availability)
for details.

- 2026-07-31



### Record & Replay expands to the EU, UK, and Switzerland




[Record & Replay](https://learn.chatgpt.com/docs/extend/record-and-replay) is now available in the
European Union, the United Kingdom, and Switzerland. On macOS, demonstrate a
workflow and turn it into a reusable skill. Computer Use must also be available
and enabled.

- 2026-07-30



### Browser upgrades, multi-repository review, and image editing  26.727




The latest ChatGPT desktop app update makes browsing, reviewing code, and
editing generated images faster and easier.



### Browse and find context faster



  - Type in the built-in browser’s address bar to revisit pages from your
    browsing history or search Google when there’s no match.
  - Manage your browsing history in Settings, and let ChatGPT search that
    history when a task needs to find a page you visited before.
  - Use the Chrome extension to mention open tabs or bring highlighted page
    text into your side chat.
  - Ask questions about any YouTube video in the Chrome extension and get
    answers in seconds.
  - Right-click a webpage and select **Ask ChatGPT**.

Learn more about the [built-in browser](https://learn.chatgpt.com/docs/browser) and the
[Chrome extension](https://learn.chatgpt.com/docs/chrome-extension).

### Review changes across repositories

See all repositories in a [multi-folder project](https://learn.chatgpt.com/docs/projects#use-local-projects-for-folders-and-codebases)
and the lines changed in each one. Select **Review** to inspect diffs across
those repositories without switching between separate review views.

### Refine generated images

Open generated images in an expanded viewer, and switch between **Focused view**
and **Canvas view**. Add comments across images, choose the ones you want, and
send targeted edits without leaving your conversation. Learn more about
[image generation](https://learn.chatgpt.com/docs/image-generation).

### Other improvements and bug fixes

  - Added a new “Activity view” in the sidebar to view which chats you engaged with recently and require attention. Click the bell or use `Cmd`/ `Ctrl` + `Opt` + `U` to change to the new view.
  - Updated browser settings to show only supported browsers.
  - Improved Windows installation reliability when package file paths are long.
  - Other performance and bug fixes.

- 2026-07-29



### Sign in with ChatGPT (beta)




Sign in with ChatGPT is beginning to roll out in beta across select plugins and
partner sites, starting with Airtable, GitLab, HubSpot, Notion, Supabase, and
Vercel.



When you connect a supported plugin from the ChatGPT plugin directory, you can
use Sign in with ChatGPT to create or link an account with that service in fewer
steps. On participating partner sites, you can also select **Sign in with**
**ChatGPT** to create or access your account.



This makes it easier to start working with supported tools in ChatGPT and Codex.



When you sign in, the partner receives only your name, email address, and profile
picture, if available. You must still review and approve each plugin’s requested
access as a separate step.

- 2026-07-27



### ChatGPT for iOS  1.2026.202




### Improvements and bug fixes



  - Voice conversations now use your selected ChatGPT voice and show usage-limit warnings.
  - Improved task reconnection and continuity when returning to the app or unlocking with Face ID.
  - Composer autocomplete now matches desktop plugin mentions and includes skills from installed plugins.
  - Selected-text references remain available after sending so you can preview them again.
  - Improved goal controls with clearer progress when pausing or resuming.
  - Inline visualizations now render tables and visual themes more reliably.
  - Large workspace diffs are more responsive.
  - Fixed restored tasks changing the selected model.
  - Prevented the composer from becoming stuck after a prompt started.
  - Corrected browser and computer tool labels, icons, and placeholder output.

- 2026-07-23



### ChatGPT Voice and multi-folder projects  26.715




Powered by GPT-Live, ChatGPT Voice lets you talk through work and coordinate
tasks in Chat, Work, and Codex in the ChatGPT desktop app.



Start a new chat or task in voice mode, then ask ChatGPT to start, check, or
steer work in other threads. On macOS, turn on **Screen context** to share an
[appshot](https://learn.chatgpt.com/docs/appshots) of your frontmost window.



Voice is available with Plus, Pro, Business, Edu, and Enterprise plans in the
desktop app and through [Remote on iOS](https://learn.chatgpt.com/docs/remote-connections#set-up-mobile-access).



Local projects in the ChatGPT desktop app can now include multiple related
folders. From a project’s menu, select **Edit project** to add folders and choose
the primary folder. New chats, Git operations, and automatic discovery of
`AGENTS.md`, skills, and `config.toml` use the primary folder. Secondary
folders remain available for file search, reading, and editing.



Get started with [ChatGPT Voice](https://learn.chatgpt.com/docs/features/voice) and [multi-folder local\\
projects](https://learn.chatgpt.com/docs/projects#use-local-projects-for-folders-and-codebases).



### Performance improvements and bug fixes



Also includes fixes from version 26.721.



  - Improved screen reader navigation between messages.
  - Fixed Git detection on Windows.
  - Fixed a freeze caused by missing icons in the **Open in** menu.

- 2026-07-20



### ChatGPT for iOS  1.2026.195




### New features



  - Added support for rendering Mermaid diagrams inline in task transcripts.
  - Added support for interactive forms in Codex tasks.
  - Added support for restoring unsent prompts when switching between tasks,
    hosts, and workspaces.

### Improvements and bug fixes

  - Improved task lists to sort by recent activity and show unavailable hosts when
    creating a task.
  - Improved the composer with selected-text previews and smoother new-task
    transitions.
  - Improved goals with support for resuming blocked or usage-limited runs.
  - Improved plan progress, Fast controls, and inline dictation.
  - Improved Remote onboarding, composer guidance, and iPad navigation.
  - Fixed an issue that could close the app when duplicate task-list entries
    appeared while starting a task.
  - Fixed iOS 18 task actions and task-list styling.
  - Fixed composer spacing, attachment menu padding, and duplicate transcription
    indicators.

- 2026-07-13



### ChatGPT for iOS  1.2026.188




### New features



  - Added support for inline visualizations in Codex tasks.

### Improvements and bug fixes

  - Improved creating and managing tasks from conversations, with reliable links
    to newly created tasks.
  - Improved tool activity styling and progress indicators.
  - Improved file-opening feedback.
  - Improved the composer so controls remain visible above the keyboard for long
    prompts and larger text sizes.
  - Fixed Fast mode selection and restoration for each task.
  - Fixed initial prompts ignoring the selected approval preset.
  - Fixed autocomplete backgrounds and task rows becoming unresponsive during
    swipe gestures.

- 2026-07-09



### Codex joins the ChatGPT desktop app  26.707




Codex is now part of the ChatGPT desktop app on macOS and Windows. Existing
Codex app users can update as usual and keep their projects, settings, and
workflows. You can make Codex the default view and, on macOS, keep the Codex
app icon.



### New features



  - Edit Markdown and code directly in the app, use inline annotations, and ask
    Codex to revise selected content.
  - Use PR Chat to review GitHub pull requests and ask Codex about changes in
    context. Send inline review feedback, inspect proposed patches, and edit,
    accept, or reject them without leaving the app.
  - Connect custom domains to published Sites.

### Performance improvements and bug fixes

  - Made Computer Use faster with GPT-5.6.
  - Made task and subagent activity easier to follow while Codex works.
  - Simplified plugin management by moving it into Settings.
  - Improved permission handling when resuming tasks or sending follow-ups.
  - Added clearer Full access warnings and a dialog when combining Full access with Ultra.
  - Improved macOS and Windows setup, including macOS installation, Git-backed
    workflows, and Computer Use on Windows.
  - Fixed task resumption for local projects and onboarding retry loops.
  - Fixed scrolling in pull request reviews and expanded Mermaid diagram labels.
  - Improved mobile connection reliability and fixed video rendering for SSH
    projects.
  - Additional performance improvements and bug fixes.

- 2026-07-06



### ChatGPT for iOS  1.2026.181




### New features



  - Added support for creating, searching, opening, forking, and managing Codex
    tasks directly from a conversation.
  - Added filters for staged, unstaged, branch, and last-turn changes, with controls
    for comparing branches.
  - Added support for adding selected transcript text directly to the composer.
  - Added previews for image and file attachments before sending.
  - Added inline Photos and Camera pickers to the attachment menu.
  - Added a connection shortcut and support for SSH hosts using private keys or no
    credentials.
  - Added usage limits and credit details to the task menu.

### Improvements and bug fixes

  - Improved the task list with consistent task terminology, clearer delegated
    task titles, and a Needs input status.
  - Improved initial task loading and foreground recovery.
  - Improved autocomplete by selecting the first result automatically and
    accepting it with Return.
  - Improved model, reasoning, and Fast settings so changes remain scoped to the
    current task.
  - Improved task-management and dynamic tool activity presentation.
  - Improved side chats to open directly when only one conversation is available.
  - Improved plugin autocomplete with installed plugins and their icons.
  - Improved workspace diff accuracy and expand-and-collapse navigation.
  - Improved recovery by preserving thread state across reconnects and host
    pairings across sign-out.
  - Fixed stuck thread-list loading, prompt mode deadlocks, stale images, and
    microphone permission alerts.
  - Fixed shake to undo and keyboard refocusing after sending a prompt.

## June 2026

- 2026-06-25



### Codex Remote reaches general availability  26.623




Codex Remote has reached general availability. Use Codex from the ChatGPT mobile
app to start or continue work on a connected Mac or Windows host, review
progress, and approve actions from your phone.



Remote Control now uses authenticated one-to-one QR pairing between each iOS or
Android device and each host. Update the ChatGPT mobile app and Codex App to the
latest versions before connecting. Connections used since June 8, 2026, remain
paired; older inactive connections need to pair again.



The new [DigitalOcean plugin](https://chatgpt.com/plugins/share/5dc672c7116c44ff92595d48e72df522)
lets Codex provision a DigitalOcean Droplet, configure SSH access, and connect
it to the Codex App as a remote workspace.



See [Remote connections](https://learn.chatgpt.com/docs/remote-connections) for setup and
troubleshooting.



### Performance improvements and bug fixes



  - Improved recovery after a remote connection drops and reconnects.
  - Restored the message composer immediately after connecting an app.
  - Reduced browser flashing when Codex takes screenshots.

- 2026-06-22



### ChatGPT for iOS  1.2026.167




### New features



  - Added per-host personality settings with Friendly and Pragmatic options.
  - Added support for editing goals directly in the composer.
  - Added a link from forked conversations back to the original thread.

### Improvements and bug fixes

  - Improved side chat visibility with separate conversations above the composer.
  - Improved composer autocomplete for commands, skills, and plugins from any
    prefix.
  - Improved progress visibility for subagents, tasks, and worktree creation.
  - Fixed long threads loading.
  - Improved workspace file search, code review drafts, steering, and host setup
    and recovery.
  - Fixed Face ID unlocking, stopping responses, collapsed sections, and dark-mode
    host indicators.

- 2026-06-18



### Record & Replay and remote task handoff  26.616




### New features



  - Added [Record & Replay](https://learn.chatgpt.com/docs/extend/record-and-replay), a macOS feature that turns
    a demonstrated workflow into a reusable skill. Initial availability excludes
    the European Economic Area, the United Kingdom, and Switzerland. You or your
    administrator must also enable Computer Use.
  - Added bulk actions to [automation](https://learn.chatgpt.com/docs/automations) run history so you
    can mark every run as read or archive eligible runs.
  - Added [thread handoff between local and remote hosts](https://learn.chatgpt.com/docs/remote-connections#hand-off-a-task-between-hosts),
    so you can move a thread to a matching project on a connected host and
    continue it there. Codex can also coordinate the handoff for you.

### Performance improvements and bug fixes

  - Added new [deep links](https://learn.chatgpt.com/docs/reference/commands#settings) to manage SSH connections.
  - Improved Browser Use so visible-tab routing and annotations persist when a
    draft browser session moves to the server.
  - Additional performance improvements and bug fixes.

- 2026-06-16



### More Codex features in the EEA, UK, and Switzerland  26.611




More Codex app capabilities are rolling out to users in the European Economic
Area, the United Kingdom, and Switzerland:



  - [Computer Use](https://learn.chatgpt.com/docs/computer-use) is available on macOS and Windows in
    these regions, so Codex can operate desktop apps by seeing, clicking, and
    typing.
  - The [Codex Chrome extension](https://learn.chatgpt.com/docs/chrome-extension) is available for
    browser tasks that need signed-in Chrome context, working across tabs in the
    background without taking over your browser.
  - [Memories](https://learn.chatgpt.com/docs/customization/memories) can remember useful preferences, recurring
    workflows, tech stacks, and repository conventions when enabled. Memories are
    off by default in the European Economic Area, the United Kingdom, and
    Switzerland.
  - [Chronicle](https://learn.chatgpt.com/docs/customization/computer-history) is available as an opt-in research
    preview for ChatGPT Pro subscribers on macOS, helping Codex build memories
    from recent screen context.

- 2026-06-15



### ChatGPT for iOS  1.2026.160




### New features



  - Added a workspace file browser for previewing files and linking workspace paths
    into prompts.
  - Added a directory picker for choosing a workspace folder when starting a new
    thread.
  - Added controls to expand or collapse all diffs while reviewing changed files.
  - Added MCP approval choices for allowing requested actions in the current chat
    or across chats.
  - Added LaTeX rendering in Codex messages and plans.

### Improvements and bug fixes

  - Improved status indicators for running threads, queued prompts, side chats,
    and subagents.
  - Improved pairing and onboarding with clearer errors, manual pairing-code
    support, and more reliable host selection after pairing.
  - Improved task-list recovery, reconnect state, host-specific refresh, and
    thread performance.
  - Improved Codex profile sharing, activity history, and settings layout.
  - Improved goal workflows with a composer shortcut, desktop-aligned goal message
    actions, and better resumed question handling.
  - Improved assistant message actions, transcript layout, and public rate-limit
    names.
  - Fixed stuck thread-list swipe actions, duplicate messages when reopening a new
    thread, spawned subagents appearing as top-level task rows, and misleading
    connection errors when sending prompts.

- 2026-06-11



### Usage resets and Browser Developer mode  26.609




### New features



  - Added rate-limit reset banking for Plus and Pro users, including one free
    reset at launch and
    [referral invitations](https://learn.chatgpt.com/docs/pricing#invite-friends-and-coworkers) for
    earning more during the current promotion. Eligible Business members can
    invite coworkers to earn shared workspace credits through a separate
    referral program.
  - Added [Developer mode](https://learn.chatgpt.com/docs/browser?surface=app#app-developer-mode) for Browser use in
    Chrome and the Codex in-app browser. It gives Codex controlled Chrome
    DevTools Protocol (CDP) access for performance profiling and deeper debugging
    of network traffic, console output, runtime errors, and page state.
  - Added the `/init` command to the app composer for creating project
    instructions with the same initialization workflow as the Codex CLI.
  - Added customizable macOS Dock icons with light and dark Codex variants.
  - Added Computer Use for Enterprise users outside the European Economic Area,
    the United Kingdom, and Switzerland.
  - Added support for configuring per-app access controls for Computer Use on
    Windows.
  - Added an **Unread chats** section to the command menu, with the most recently
    updated unread chat selected by default.

### Performance improvements and bug fixes

  - Made Browser use up to 2x faster through CDP and DOM snapshot optimizations
    that reduce browser round trips.
  - Made command, browser, integration, and source activity summaries easier to
    understand, and improved how completed chats present files, automations, and
    other durable output.
  - Improved plugin management by including workspace plugins, refreshing plugin
    state more reliably after installation or removal, and letting you upload a
    new version of an already-shared plugin without changing its access.
  - Improved usage-limit errors with inline plan and workspace guidance,
    including reset timing when available.
  - Added `Cmd` + `Enter` and `Ctrl` + `Enter` as
    shortcuts for submitting custom approval feedback.
  - Fixed Browser use download handling and improved Developer mode recovery and
    diagnostics.
  - Fixed scheduled automations so they honor the selected approval mode, and
    fixed manual project ordering, Browser tab dragging, MCP app sizing after
    right-pane transitions, and clickable ChatGPT thread mentions.
  - Fixed issues affecting background agent tab restoration, commit and pull
    request message generation, sidebar pull request status updates, Codex Mobile
    QR pairing, remote-control MFA, remote SSH installation and connection,
    updater prompts, and overlay positioning at non-default zoom levels.
  - Additional performance improvements and bug fixes.

- 2026-06-09



### Codex app  26.608




### New features



  - Added [Import to Codex](https://learn.chatgpt.com/docs/import) flows for importing supported setup
    from Claude Code and Claude Cowork, including during onboarding.
  - Revamped plugins screen with separate tabs, marketplace and
    category filters, keyboard navigation, and clearer install actions.
  - Expanded Settings search to find options from more panels, including Git and
    pets.

### Performance improvements and bug fixes

  - Fixed goal timer overlap in narrow layouts.
  - Reduced unread notifications while an active goal continues running.
  - Kept review diff ordering consistent with the file tree.
  - Improved window rendering on systems that don’t support translucent
    backdrops, including Windows 10.
  - Additional performance improvements and bug fixes.

- 2026-06-09



### ChatGPT for iOS  1.2026.153




### New features



  - Added support for choosing a branch, creating a worktree, and running an
    environment setup script for new threads.
  - Added a Codex profile screen with usage stats and token activity charts.
  - Added `/goal` support for creating and managing goals from Codex Mobile.
  - Added inline review comments when viewing changed files.
  - Added support for asking in side chat from selected transcript text.
  - Added support for editing the latest sent prompt.

### Improvements and bug fixes

  - Improved attachment support on Windows hosts.
  - Skills and plugins now appear directly inline in the composer.
  - Improved side chat and queued prompt visibility while a thread is running.
  - Improved message styling, navigation, tool activity, Face ID behavior,
    archived-thread browsing, and thread UI polish.

- 2026-06-04



### Codex app updates  26.602




### New features



  - Added activity insights and share cards to the
    [Profile section](https://learn.chatgpt.com/docs/reference/settings#profile). You can review Codex usage
    highlights and save a profile card; sharing is available on consumer ChatGPT
    plans.

### Performance improvements and bug fixes

  - Improved Computer Use startup readiness and appshot error reporting.
  - Fixed browser and review UI issues, including fullscreen browser composer
    controls, hex color swatches, terminal scrollbar alignment, and animated diff
    stat alignment.
  - Expanded onboarding with more role choices so Codex can tailor first-run
    suggestions more accurately.
  - Fixed configuration writes after plugin installation.
  - Additional performance improvements and bug fixes.

- 2026-06-02



### Build and deploy websites with Sites




[**Sites**](https://learn.chatgpt.com/docs/sites) is now available in preview in the Codex app. Use the
Sites plugin to create, save, deploy, and inspect websites, dashboards, internal
tools, web apps, and games hosted by OpenAI.



Open **Sites** in the app sidebar to return to your projects and manage hosted
environment variables and secrets.



ChatGPT Business workspaces include Sites by default. ChatGPT Enterprise admins
can enable Sites for the appropriate roles through role-based access control
(RBAC).

- 2026-06-02



### ChatGPT for iOS  1.2026.146




### New features



  - Added an optional Face ID or passcode lock for Codex.
  - Added a new settings screen for choosing Queue or Steer as the default
    follow-up behavior and toggling line wrapping for code diffs.
  - Added support for connecting to Windows machines over SSH.

### Improvements and bug fixes

  - Added support for `/side <prompt>` to start a side
    conversation with an initial question.
  - Improved follow-up prompts, the Codex home screen, and viewing changed files.
  - Fixed issues with reconnecting, archiving threads, loading tasks, and
    connecting to hosts.

- 2026-06-01



### Use Codex with Amazon Bedrock




Codex can now use supported OpenAI models available through Amazon Bedrock.
Configure [Amazon Bedrock as your model provider](https://learn.chatgpt.com/docs/amazon-bedrock) to run
Codex locally with AWS-managed authentication, account controls, and billing.

- 2026-06-01



### Terminal placement controls  26.601




### New features



  - Added **Default terminal location** in [General settings](https://learn.chatgpt.com/docs/reference/settings#general).
    When the bottom panel is enabled, choose whether the terminal shortcut and
    environment actions open terminal tabs in the bottom panel or the right panel.

### Performance improvements and bug fixes

  - Additional performance improvements and bug fixes.

## May 2026

- 2026-05-29



### Computer use and mobile access on Windows  26.527




### New features



  - [Computer Use](https://learn.chatgpt.com/docs/computer-use) now works on Windows. Codex can
    operate Windows desktop apps by seeing, clicking, and typing in the
    foreground while it works.
  - [Remote control](https://learn.chatgpt.com/docs/remote-connections) now supports Windows devices. You
    can start Codex work on a Windows device from ChatGPT on iOS or Android, or
    from a Mac running Codex, and check its progress remotely.
  - The [Profile section](https://learn.chatgpt.com/docs/reference/settings#profile) now shows your profile
    details, usage stats, and token activity.
  - Added thread coordination for local projects and worktrees, including
    separate background threads when explicitly requested.
  - Expanded search for past Codex app threads to include conversation content
    and Git branch names.
  - Added stable identicons for background subagents across the app.
  - Improved keyboard shortcut settings with keypress search and a reset-all
    action.
  - Improved Chrome context capture for Google Docs, Sheets, and Slides tabs.

### Performance improvements and bug fixes

  - Additional performance improvements and bug fixes.

- 2026-05-26



### GPT-5.3-Codex and GPT-5.2 deprecated




GPT-5.3-Codex and GPT-5.2 are now deprecated as user-selectable models in Codex
for users signed in with ChatGPT. API-key workflows aren’t affected.



Use a current Codex model, such as GPT-5.5, GPT-5.4, or GPT-5.4 mini. See
[Codex models](https://learn.chatgpt.com/docs/models#deprecated-codex-models) for model availability
and [Codex pricing](https://learn.chatgpt.com/docs/pricing#credits-overview) for credit rates.

- 2026-05-25



### ChatGPT for iOS  1.2026.139




### New features



  - Added Spotlight and Shortcuts support for opening Codex Mobile directly.
  - Added browsing for archived Codex threads.
  - Added `/side` for opening a side conversation.
  - Added options to save or copy rendered images.

### Improvements and bug fixes

  - Improved iPad keyboard shortcuts.
  - Improved setup and relaunch reliability.
  - Fixed issues with task progress, loading archived threads, previewing code
    changes, and switching hosts.

- 2026-05-21



### Appshots, goal mode, and more  26.519




[Appshots](https://learn.chatgpt.com/docs/appshots) are now available in the Codex app on macOS. Press
both Command keys to send the frontmost app window to Codex with a screenshot
and available text, so Codex can work from context in another app without you
copying, pasting, or describing it manually.



This launch also includes:



  - [Goal mode](https://learn.chatgpt.com/docs/prompting#goal-mode) is no longer an experimental feature
    and is available in the Codex app, IDE extension, and CLI. With Goal mode, you
    can have Codex drive toward a specific objective for hours or even days.
  - [Remote computer use](https://learn.chatgpt.com/docs/computer-use#locked-use), so Codex can use
    desktop apps after your Mac locks, including remotely via Codex Mobile. Codex
    scopes locked use to active, trusted computer use turns and includes
    safeguards such as short-lived authorization, covered displays, relock on
    local input, and manual-unlock fallback.
  - [Plugin sharing](https://learn.chatgpt.com/plugins/build/plugins#share-a-local-plugin-with-your-workspace)
    through marketplace sources is available for ChatGPT Business. Enterprise
    support is coming soon. Teams can distribute reusable plugin bundles that
    include skills, MCP servers, and lifecycle hooks.
  - [Advanced in-app browser annotations](https://learn.chatgpt.com/docs/browser?surface=app#app-styling-feedback)
    let you tweak styling such as font size, colors, and spacing directly using
    annotations. This gives Codex a clearer signal for changes.
  - Browser-use improvements across in-app browser & Chrome:
    - Codex can now download and extract all image assets from a page much more
      quickly.
    - Codex can now extract structured data from pages more effectively and find
      information more quickly with a read-only JS sandbox.
  - Chrome extension will create less clutter when using it. Codex will no longer
    create tab groups when taking over existing tabs, and at the end of a task for
    handoff. Instead, it uses tab icons to indicate status.
  - Significantly improved reliability for browser use. We fixed bugs on Windows,
    flaky availability of the plugin to non geo-blocked regions, and many other
    issues impacting performance.

- 2026-05-18



### ChatGPT for iOS  1.2026.132




### New features



  - Added support for opening completed Codex tasks directly from iOS
    notifications.
  - Added the ability to open changed files directly while reviewing a task.

### Improvements and bug fixes

  - Improved task resume, reconnection, and foreground reliability.
  - Improved task progress updates, code review, and message composition.

- 2026-05-14



### Work with Codex from anywhere  26.513




You can now use Codex from the ChatGPT mobile app by connecting it to a Mac
running the Codex app. Codex runs from the connected host, so the same projects,
files, credentials, plugins, skills, and configuration are available from your
phone.



See [Remote connections](https://learn.chatgpt.com/docs/remote-connections) for mobile setup, choosing
a host, what comes from the connected machine, and SSH hosts. This launch also
includes [Hooks](https://learn.chatgpt.com/docs/hooks) general availability,
[Codex access tokens](https://learn.chatgpt.com/docs/enterprise/access-tokens) for trusted automation,
and [Enterprise admin setup](https://learn.chatgpt.com/docs/enterprise/admin-setup) guidance.

- 2026-05-11



### Expanded Auto-review documentation




Added a dedicated
[Auto-review](https://learn.chatgpt.com/docs/sandboxing/auto-review) page covering the
reviewer lifecycle, trigger conditions, failure behavior, and local or managed
configuration.



Also updated the [Agent approvals & security](https://learn.chatgpt.com/docs/agent-approvals-security)
and [Sandbox](https://learn.chatgpt.com/docs/sandboxing) docs so they explain more clearly how
Auto-review relates to the sandbox boundary.

- 2026-05-08



### Codex app  26.506




### New features



  - Added an in-app trust review flow for hooks and kept Hooks settings reachable even before hooks are fully configured.

### Performance improvements and bug fixes

  - Restored tooltip-wrapped dropdowns that could stop opening after the tooltip rewrite.
  - Preserved in-progress message edits across thread switches.
  - Fixed several desktop workflow regressions, including `Ctrl+V` paste in the Windows terminal, opening modified external links outside the in-app browser, and keeping feedback slash commands attached to the right thread.
  - Improved loading and panel polish by showing model loading while a thread resumes, hiding unavailable model controls during load, and bundling summary-panel layout and hover fixes.
  - Kept the Computer Use settings control visible even when uninstalled and disabled problematic extension hover panels.
  - Additional performance improvements and bug fixes.

- 2026-05-07



### Codex for Chrome




With the new extension for Chrome, Codex is even better at working with apps
and websites in your browser. It works in parallel across tabs in the
background without taking over your browser, and you stay in control of which
websites Codex can use.



Learn more in the [Codex Chrome extension documentation](https://learn.chatgpt.com/docs/chrome-extension).

- 2026-05-06



### Codex analytics governance docs update




Updated the Codex enterprise governance guide with more detailed coverage of the
Analytics dashboard charts, data export options, and enterprise Analytics API
endpoints.

- 2026-05-05



### Create Codex access tokens




ChatGPT Enterprise workspace owners and admins can allow permitted members to
create Codex access tokens for trusted, non-interactive Codex local workflows.
Members can use access tokens to run Codex from scripts, schedulers, and private
CI runners with their ChatGPT workspace identity.



Learn more in [Access tokens](https://learn.chatgpt.com/docs/enterprise/access-tokens).

- 2026-05-05



### Codex app  26.429




### New features



  - Added dictation cleanup plus a configurable dictation dictionary for names, file paths, and code symbols.
  - Added zoom and download controls to the image lightbox.

### Performance improvements and bug fixes

  - Improved voice and dictation error messages for microphone, connection, and quota failures.
  - Fixed in-app browser comment markers so they stay aligned across scrolling, zoom, and responsive layout changes.
  - Made pull request creation and recovery flows more reliable by preserving newly created pull request state, classifying more app-server failures as restart-required, and stopping exhausted remote reconnect loops.
  - Additional performance improvements and bug fixes.

## April 2026

- 2026-04-24



### Codex app  26.423




### New features



  - Added a tooltip on realtime delegation messages to clarify that Codex uses the surrounding voice conversation as context.

### Performance improvements and bug fixes

  - Fixed search in long review files so next and previous results reliably jump to off-screen matches.
  - Kept embedded MCP app panels from restarting or losing state during fullscreen changes and thread reloads.
  - Fixed several desktop regressions, including tray crashes when the local connection is missing, duplicate macOS fullscreen menu entries, and broken global dictation hotkeys on older macOS versions.
  - Additional performance improvements and bug fixes.

- 2026-04-23



### GPT-5.5 and Codex app updates  26.422




[GPT-5.5 is now available in Codex](https://openai.com/index/introducing-gpt-5-5/)
as OpenAI’s newest frontier model for complex coding, computer use, knowledge
work, and research workflows.



#### GPT-5.5 in Codex



GPT-5.5 is the recommended choice for most Codex tasks when it appears in your
model picker. It’s especially useful for implementation, refactors, debugging,
testing, validation, and knowledge-work artifacts.



To switch to GPT-5.5:



  - In the CLI, start a new thread with:


    ```
    codex --model gpt-5.5


    ```


    Or use `/model` during a session.
  - In the IDE extension, choose GPT-5.5 from the model selector in the composer.
  - In the Codex app, choose GPT-5.5 from the model selector in the composer.

If you don’t see GPT-5.5 yet, update the CLI, IDE extension, or Codex app to
the latest version. During the rollout, continue using GPT-5.4 if GPT-5.5 is
not yet available.

#### Browser use in the Codex app

The Codex app can now let Codex operate the in-app browser for local
development servers and file-backed pages. Ask Codex to use the browser when it
needs to click through a rendered UI, reproduce a visual bug, or verify a local
fix inside the app.

Browser use runs through the bundled Browser plugin. In settings, you can
manage the plugin and review allowed or blocked websites.

#### Automatic approval reviews

Codex can route eligible approval prompts through an automatic reviewer agent
before the request runs. When configured, the Codex app shows an automatic
review item with the review status and risk level, so you can see whether the
reviewer approved, denied, stopped, or timed out before deciding.

#### Performance improvements and bug fixes

  - Fixed duplicate queued follow-up messages across app windows.
  - Fixed new chats reverting to outdated model and thinking settings.
  - Kept edits to the same file grouped together after reopening a chat.

- 2026-04-20



### Codex app  26.417




### New features



  - Added local branch search and non-image file pasting in the composer.
  - Added collapsible sidebar sections, tray usage-limit surfacing, and a command-palette theme switcher.

### Performance improvements and bug fixes

  - Made review faster and more stable with better diff batching and preserved diff and search state.
  - Fixed projectless cwd and permissions handling, default file opening, spreadsheet suggestions, and remote-control reconnect issues.
  - Additional performance improvements and bug fixes.

- 2026-04-16



### Codex can now help with more of your work  26.415




Codex is becoming a broader workspace for getting work done with AI. This
update makes it easier to start work with less setup, verify what Codex is
building, create richer outputs, and keep momentum across longer-running tasks.



#### Verify more of your work



The Codex app now includes an early [**in-app browser**](https://learn.chatgpt.com/docs/browser?surface=app). You
can open local or public pages that don’t require sign-in, comment directly on
the rendered page, and ask Codex to address page-level feedback.



![Codex app showing a browser comment on a local web app preview](https://learn.chatgpt.com/images/codex/app/in-app-browser-light.webp)![Codex app showing a browser comment on a local web app preview](https://learn.chatgpt.com/images/codex/app/in-app-browser-dark.webp)



![Codex app showing a browser comment on a local web app preview](https://learn.chatgpt.com/images/codex/app/in-app-browser-light.webp)![Codex app showing a browser comment on a local web app preview](https://learn.chatgpt.com/images/codex/app/in-app-browser-dark.webp)







[**Computer use**](https://learn.chatgpt.com/docs/computer-use) lets Codex operate macOS apps by seeing,
clicking, and typing, which helps with native app testing, simulator flows,
low-risk app settings, and GUI-only bugs.



The feature isn’t available in the European Economic Area, the United Kingdom, or
Switzerland at launch.



#### Start, follow, and steer work



[**Chats**](https://learn.chatgpt.com/docs/projects#start-without-a-project) are threads you can start
without choosing a project folder first. They’re useful for research, writing,
planning, analysis, source gathering, and tool-driven work that doesn’t begin in
a codebase.



For work that needs a later check-in,
[**thread automations**](https://learn.chatgpt.com/docs/automations#schedule-work-from-a-task) can wake up
the same thread on a schedule while preserving the conversation context. Use
them to check a long-running process, watch for updates, or continue a
follow-up loop without starting from scratch.



[**The task sidebar**](https://learn.chatgpt.com/docs/artifacts-viewer#follow-artifact-work) makes plans, sources,
generated artifacts, and summaries easier to follow while Codex works.
[**Context-aware suggestions**](https://learn.chatgpt.com/docs/reference/settings#context-aware-suggestions)
can also help you pick up relevant follow-ups when you start or return to Codex.



#### Stronger for software development



Codex now brings more of the **pull request workflow** into the app. You can
inspect [**GitHub pull requests**](https://learn.chatgpt.com/docs/code-review?surface=app#app-pull-request-reviews) in the
sidebar, review comments in the diff, review changed files, then ask Codex to
explain feedback, make changes, check them, and keep the review moving.



#### Review richer outputs



The [**artifact viewer**](https://learn.chatgpt.com/docs/artifacts-viewer) can preview
generated files such as PDF files, spreadsheets, documents, and presentations in
the sidebar before you commit or share them. [**Memories**](https://learn.chatgpt.com/docs/customization/memories),
where available, can also carry useful context from past tasks into future
threads, including stable preferences, project conventions, and recurring work
patterns.



#### Other features



  - [Remote connections](https://learn.chatgpt.com/docs/remote-connections) \- We’re gradually rolling out SSH remote connections in alpha
  - Support for [multiple terminals](https://learn.chatgpt.com/docs/integrated-terminal)
  - macOS menu bar and [Windows system tray](https://learn.chatgpt.com/docs/windows/windows-app) support
  - [Multi-window support](https://learn.chatgpt.com/docs/reference/settings#keep-a-task-near-your-work)
  - [Intel Mac support](https://learn.chatgpt.com/docs/app)
  - [New plugins](https://learn.chatgpt.com/docs/plugins)
  - Improved thread and tool rendering

- 2026-04-12



### Codex app  26.410




### New features



  - Added command-menu file search, including `Cmd+P` routing into workspace file search.
  - Added rich previews in the sidebar file viewer for images, PDFs, and Markdown.
  - Added terminal tabs per thread, a selected-text Ask Codex overlay, and a Help menu feedback entry.

### Performance improvements and bug fixes

  - Improved review diff whitespace handling and search highlighting.
  - Fixed in-app browser address bar and external-open issues, plus several file viewer and side-panel bugs.
  - Additional performance improvements and bug fixes.

- 2026-04-10



### Codex app  26.409




### New features



  - Added Windows Store updater support.
  - Expanded pull request workflows with an activity timeline, PR-page commenting, and push choices in the push modal.
  - Added workspace file tabs in the thread side panel, drag-and-drop tab reordering, run action editing, and a logout confirmation dialog.

### Performance improvements and bug fixes

  - Improved pull request board performance and comment flyouts.
  - Improved update and navigation resilience, and fixed projectless visibility, unread-state, and pinned-row edge cases.
  - Additional performance improvements and bug fixes.

- 2026-04-09



### Codex app  26.406




### New features



  - Added collapsible inline review comments and inline or detached review modes.
  - Added a Git summary and Sources section in the thread side panel.
  - Added a New Quick Chat command and local video embeds in the app.

### Performance improvements and bug fixes

  - Preserved thread scroll position per conversation and unread state across windows.
  - Improved review refresh reliability, and fixed dictation loss, right-panel reset, and GitHub reconnect messaging.
  - Additional performance improvements and bug fixes.

- 2026-04-07



### Codex model availability update




We’re updating model availability for users who sign in with ChatGPT. Starting
April 7, the model picker no longer shows `gpt-5.2-codex`,
`gpt-5.1-codex-mini`, `gpt-5.1-codex-max`, `gpt-5.1-codex`, `gpt-5.1`, or
`gpt-5`. On April 14, we’ll remove those models from Codex for ChatGPT sign-in.



Users can still choose from `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.3-codex`, and
`gpt-5.2`. ChatGPT Pro users can also choose `gpt-5.3-codex-spark`.



To use another API-supported model in Codex, sign in with an API key or
configure a model provider.

- 2026-04-01



### Codex app  26.325, 26.331, 26.401




### New features



  - Added workspace settings to the app.
  - Added “Don’t ask again” handling and polish for custom MCP approval panels.
  - Added native Windows updater support, including MSIX support, plus a Windows system tray menu so Codex can stay resident after the last window closes.
  - Added app and file `@` mentions in the automation composer, surfaced subagent diff stats in the composer, and added artifact cards for generated file citations.
  - Added a Quick Chat app-menu shortcut, a review file tree open menu, early heartbeat automation affordances in threads, and image support for remote connections.

### Performance improvements and bug fixes

  - Fixed review panel scroll jumps and PR status actions while a conversation is still running.
  - Fixed several multi-window issues, plus `@`-mention results, duplicate project labeling, Windows `runGit` behavior, and revert, unstage, and stage-all actions.
  - Improved remote-thread and sidebar polish, Windows update recovery, unsupported-version guidance, and overall thread search speed.
  - Fixed sticky review issues such as diff hunk expansion, header overlap, archive-thread crashes, and window-zoom shell sizing.
  - Additional performance improvements and bug fixes.

## March 2026

- 2026-03-25



### Build and install plugins in Codex




Codex now supports **plugins**: installable bundles that package skills, app
integrations, and MCP server configuration for reusable workflows.



Plugins are available in the Codex app, CLI, and IDE extensions.



You can install curated plugins from the plugin directory, or scaffold a local
plugin with `@plugin-creator` and test it with workspace-scoped or home-scoped
marketplaces.



Learn more in the [plugins documentation](https://learn.chatgpt.com/docs/plugins).



![](https://learn.chatgpt.com/images/codex/plugins/directory.webp)



#### Plugin structure



Every plugin is a folder with a required `.codex-plugin/plugin.json` manifest
and optional supporting files:



```
my-plugin/
    .codex-plugin/
      plugin.json   # Required: plugin manifest
    skills/         # Optional: packaged skills
    .app.json       # Optional: app or connector mappings
    .mcp.json       # Optional: MCP server configuration
    assets/         # Optional: icons, logos, screenshots


```



#### Install plugins per-user or per-repo



You can install plugins for just yourself with
`~/.agents/plugins/marketplace.json` and `~/.codex/plugins/`, or for everyone
on a project with `.agents/plugins/marketplace.json` and a repo-local plugin
directory such as `./plugins/`.



#### Curated plugins and local development



Codex surfaces curated public plugins in the plugin directory. Codex also ships
with the built-in `@plugin-creator` skill to help you scaffold a plugin, add a
local marketplace entry, and test it before sharing it with teammates.

- 2026-03-25



### Codex app  26.324




### New features



  - Redesigned the skills and plugins browse and manage pages.
  - Added per-window zoom and a clearer edited-files state in review.
  - Added automation titles and icons in the sidebar, plus bundled Raycast themes.

### Performance improvements and bug fixes

  - Kept loaded threads and projects visible during reconnects and made navigation feel faster.
  - Fixed archive freezes, markdown wrapping, hotkey-window regressions, and several permissions, terminal, and worktree issues.
  - Additional performance improvements and bug fixes.

- 2026-03-24



### Codex app  26.323




### New features



  - Added search for past Codex app threads, including a sidebar shortcut and keyboard shortcuts for jumping to recent threads.
  - Added a one-click option to archive all local threads in a project.
  - Synced key settings between the Codex app and the VS Code extension, and added a settings entry point in the extension.

### Performance improvements and bug fixes

  - Additional performance improvements and bug fixes.

- 2026-03-20



### Codex app  26.320




### New features



  - Added Floating Composer v2.
  - Added terminal shortcuts for jumping by word and line.
  - Improved plugin discovery surfaces and file-path rendering for saved images.

### Performance improvements and bug fixes

  - Fixed sidebar crashes when subagent turn items are missing.
  - Fixed pop-out thread routing and preserved local paths for composer image attachments.
  - Additional performance improvements and bug fixes.

- 2026-03-19



### Codex app  26.318, 26.319




### New features



  - Added skills to the `@` menu so you can insert them from the composer alongside other mentions.
  - `Cmd/Ctrl+F` now starts with your current text selection, which makes searching reviews and diffs faster, alongside broader review navigation improvements such as a refreshed file tree and percentage-based file tree resizing.
  - Added a branded loading shimmer while the app starts.

### Performance improvements and bug fixes

  - Improved collapsed diff summaries in review.
  - Fixed slash-command focus and composer alignment issues, and polished plugin cards and step details.
  - Additional performance improvements and bug fixes.

- 2026-03-18



### Codex app  26.317




### New features



  - You can now fork a conversation from an earlier message, not just the latest turn.
  - Added slash commands for switching models and reasoning levels, and made slash commands work in the middle of a draft prompt.
  - Added notifications for plan mode questions so it’s easier to notice when Codex needs input.

### Performance improvements and bug fixes

  - Fixed thread handoff and subagent navigation issues across worktrees and the VS Code extension.
  - Additional performance improvements and bug fixes.

- 2026-03-17



### Introducing GPT-5.4 mini in Codex




GPT-5.4 mini is now available in Codex as a fast, efficient model for lighter
coding tasks and subagents.



It improves over GPT-5 mini across coding, reasoning, image understanding, and
tool use while running more than 2x faster. In Codex, GPT-5.4 mini uses 30% as
much of your included limits as GPT-5.4, so comparable tasks can last about
3.3x longer before you hit those limits.



GPT-5.4 mini is available in the Codex app, the CLI, the IDE extension, and
Codex on the web. GPT-5.4 mini is also available in the API.



Use GPT-5.4 mini for codebase exploration, large-file review, processing
supporting documents, and other less reasoning-intensive subagent work. For
more complex planning, coordination, and final judgment, start with GPT-5.4.



To switch to GPT-5.4 mini:



  - In the CLI, start a new thread with:


    ```
    codex --model gpt-5.4-mini


    ```


    Or use `/model` during a session.
  - In the IDE extension, choose GPT-5.4 mini from the model selector in the
    composer.
  - In the Codex app, choose GPT-5.4 mini from the model selector in the
    composer.

If you don’t see GPT-5.4 mini yet, update the CLI, IDE extension, or Codex app
to the latest version.

- 2026-03-16



### Codex app  26.313




### New features



  - Added back and forward buttons in the header so you can move between recent screens more quickly.
  - Added an **Open in Finder**, **Open in Explorer**, or **Open in File Manager** action from thread menus to jump straight to a thread’s project folder.

### Performance improvements and bug fixes

  - Improved resume and thread error toasts with clearer details when something goes wrong.
  - Additional performance improvements and bug fixes.

- 2026-03-12



### Codex app  26.312




### Themes



Change the Codex app appearance in **Settings** by choosing a base theme,
adjusting accent, background, and foreground colors, and changing the UI and
code fonts. You can also share your custom theme with friends.



![Codex app theme settings showing custom themes, color controls, and font settings](https://learn.chatgpt.com/images/codex/app/themes-side-by-side.webp)![Codex app theme settings showing custom themes, color controls, and font settings](https://learn.chatgpt.com/images/codex/app/themes-side-by-side.webp)



![Codex app theme settings showing custom themes, color controls, and font settings](https://learn.chatgpt.com/images/codex/app/themes-side-by-side.webp)![Codex app theme settings showing custom themes, color controls, and font settings](https://learn.chatgpt.com/images/codex/app/themes-side-by-side.webp)







### Revamped Automations



You can now choose whether automations run locally or on a worktree, define
custom reasoning levels and models, and use templates to find inspiration for
new automations.



![Automations settings showing local and worktree options alongside scheduling controls](https://learn.chatgpt.com/images/codex/app/codex-automations-light.webp)![Automations settings showing local and worktree options alongside scheduling controls](https://learn.chatgpt.com/images/codex/app/codex-automations-dark.webp)



![Automations settings showing local and worktree options alongside scheduling controls](https://learn.chatgpt.com/images/codex/app/codex-automations-light.webp)![Automations settings showing local and worktree options alongside scheduling controls](https://learn.chatgpt.com/images/codex/app/codex-automations-dark.webp)







### Performance improvements and bug fixes



Various bug fixes and performance improvements.

- 2026-03-11



### Codex app  26.311




Also covers version 26.309.



### New features



  - Codex can now read the integrated terminal for the current thread, so it can check the status of a running development server or refer back to failed build output while it works with you.

### Performance improvements and bug fixes

  - Remembered the last local, worktree, or cloud selection after restarting the app.
  - Restored the button for adding inline comments from the diff gutter.
  - Refreshed branch information after creating a branch.
  - Additional performance improvements and bug fixes.

- 2026-03-05



### Introducing GPT-5.4 in Codex




GPT-5.4 is now available in Codex as OpenAI’s most capable and efficient
frontier model for professional work.



It combines recent advances in reasoning, coding, and agentic workflows in one
model, and it’s the recommended choice for most Codex tasks.



In Codex, GPT-5.4 is the first general-purpose model with native computer-use
capabilities. GPT-5.4 in Codex includes experimental support for the 1M
context window. It supports complex workflows across applications and
long-horizon tasks, with stronger tool use and tool search that help agents
find and use the right tools more efficiently.



GPT-5.4 is available everywhere you can use Codex: the Codex app, the CLI, the
IDE extension, and Codex Cloud on the web. GPT-5.4 is also available in the
API.



To switch to GPT-5.4:



  - In the CLI, start a new thread with:


    ```
    codex --model gpt-5.4


    ```


    Or use `/model` during a session.
  - In the IDE extension, choose GPT-5.4 from the model selector in the
    composer.
  - In the Codex app, choose GPT-5.4 from the model selector in the composer.

If you don’t see GPT-5.4 yet, update the CLI, IDE extension, or Codex app to
the latest version.

- 2026-03-05



### Codex app  26.305




### Performance improvements and bug fixes



  - Improved remote connections with clearer connection errors, better status updates, and clearer host labels in thread and settings views.
  - Fixed copy and paste shortcuts in the integrated terminal on Windows.
  - Fixed an issue where archived pinned threads could reappear in the sidebar.
  - Fixed an issue where repeated `codex://new` links could stop prefilling a new conversation when the app was already open.
  - Additional performance improvements and bug fixes.

- 2026-03-04



### Codex app  26.304




#### Codex app for Windows



![Codex app for Windows showing a project sidebar, active thread, and review pane](https://learn.chatgpt.com/images/codex/windows/codex-windows-light.webp)![Codex app for Windows showing a project sidebar, active thread, and review pane](https://learn.chatgpt.com/images/codex/windows/codex-windows-dark.webp)



![Codex app for Windows showing a project sidebar, active thread, and review pane](https://learn.chatgpt.com/images/codex/windows/codex-windows-light.webp)![Codex app for Windows showing a project sidebar, active thread, and review pane](https://learn.chatgpt.com/images/codex/windows/codex-windows-dark.webp)







The Codex app is now available on Windows. The app gives you one interface
for working across projects, running parallel agent threads, and reviewing
results in one place.



The Codex app runs natively on Windows using PowerShell and a native Windows
sandbox for bounded permissions, so you can use Codex on Windows without
moving your workflow into WSL, onto a virtual machine, or by deactivating the
sandbox.



The Windows app includes the same core features as the rest of the Codex app:



  - [Skills](https://learn.chatgpt.com/docs/build-skills) to discover and extend Codex
    capabilities.
  - [Automations](https://learn.chatgpt.com/docs/automations) to run work in the background.
  - [Worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees) to handle independent tasks in the same
    project.

If you prefer to develop in WSL, you can also switch the Codex agent and the
integrated terminal to run there.

Download it from the
[Microsoft Store](https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi)
and sign in with your ChatGPT account or an API key. For setup and
configuration details, see [Setup](https://learn.chatgpt.com/docs/windows/windows-app#download-the-chatgpt-desktop-app), [Use WSL with the\\
Codex app](https://learn.chatgpt.com/docs/windows/windows-app#windows-subsystem-for-linux-wsl), and [Customize the\\
app for your development setup](https://learn.chatgpt.com/docs/windows/windows-app#customize-for-your-dev-setup).

- 2026-03-03



### Codex app  26.303




### New features



  - Added a Worktrees setting to turn automatic cleanup of Codex-managed worktrees on or off.
  - Added Handoff support for moving a thread between Local and [Worktree](https://learn.chatgpt.com/docs/environments/git-worktrees).
  - Added an explicit English option in the language menu.

### Performance improvements and bug fixes

  - Improved GitHub and pull request workflows.
  - Improved approval prompts and app connection sign-in flows.
  - Additional performance improvements and bug fixes.

## February 2026

- 2026-02-28



### Codex app  26.228




### Performance improvements and bug fixes



  - Fixed a regression where conversation and task views could stop updating while Codex was streaming a response.
  - Additional performance improvements and bug fixes.

- 2026-02-27



### Codex app  26.227




### New features



  - Added pull request status badges in task rows and PR buttons, including draft, open, merged, and closed states.
  - Added a Worktrees setting to choose how many Codex-managed worktrees to keep before older ones are cleaned up.

### Performance improvements and bug fixes

  - Improved scrolling and navigation in long conversations and code review, including fixes for thread jumpiness, sidebar jitter, and diff scrolling.
  - Improved app startup reliability and keyboard zoom behavior.
  - Additional performance improvements and bug fixes.

- 2026-02-26



### Codex app  26.226




### New features



  - Added new MCP shortcuts in the composer, including install keyword suggestions and an MCP server submenu in **Add context**.
  - Added support for `@mentions` and skill mentions in inline review comments.

### Performance improvements and bug fixes

  - Improved rendering of MCP tool calls and Mermaid diagram error handling.
  - Fixed an issue where stopped terminal commands could continue appearing as running.
  - Additional performance improvements and bug fixes.

- 2026-02-24



### Codex app  26.224




### New features



  - Added an option to run automations in a dedicated worktree or directly in a project folder.

### Performance improvements and bug fixes

  - Moved configuration warnings to settings, with links to the affected files.
  - Improved prompt history navigation and preserved line breaks in draft messages.

- 2026-02-17



### Codex app  26.217




### New features



  - Added drag-and-drop support to reorder queued messages.
  - Added a warning when the selected model is downgraded.

### Improvements and bug fixes

  - Improved file workflows with fuzzy file search and better attachment recovery after restart.
  - Additional performance improvements and bug fixes.

- 2026-02-12



### Introducing GPT-5.3-Codex-Spark




[Today, we’re releasing a research preview of GPT-5.3-Codex-Spark](https://openai.com/index/introducing-gpt-5-3-codex-spark/),
a smaller version of GPT-5.3-Codex and our first model designed for real-time
coding. Codex-Spark is optimized to feel near-instant, delivering more than 1000 tokens per second while remaining highly capable for real-world coding tasks.



Codex-Spark is available in research preview for ChatGPT Pro users in
the latest Codex app, CLI, and IDE extension. This release also marks the first
milestone in our partnership with Cerebras.



At launch, Codex-Spark is text-only with a 128k context window. During
the research preview, usage has separate model-specific limits and doesn’t
count against standard Codex limits. During high demand, access may slow down
or queue while we balance reliability across users.



To switch to GPT-5.3-Codex-Spark:



  - In the CLI, start a new thread with:


    ```
    codex --model gpt-5.3-codex-spark


    ```


    Or use `/model` during a session.
  - In the IDE extension, choose GPT-5.3-Codex-Spark from the model selector in
    the composer.
  - In the Codex app, choose GPT-5.3-Codex-Spark from the model selector in the
    composer.

If you don’t see GPT-5.3-Codex-Spark yet, update the CLI, IDE extension, or
Codex app to the latest version.

GPT-5.3-Codex-Spark isn’t available in the API at launch.
For API-key workflows, continue using `gpt-5.2-codex`.

- 2026-02-12



### Codex app  26.212




### New features



  - Support for GPT-5.3-Codex-Spark
  - Added conversation forking
  - Added [floating pop-out window](https://learn.chatgpt.com/docs/reference/settings#keep-a-task-near-your-work) to take a conversation with you

### Bug fixes

  - Improved performance and bug fixes

Alpha testing for the Codex app on Windows is also starting. [Sign up here](https://openai.com/form/codex-app/) to be a potential alpha tester.

- 2026-02-10



### Codex app  26.210




### New features



  - Added branch search in the branch picker.
  - Added clearer guidance for entering plan mode when you type `plan` in the composer.
  - Added support for parallel approvals.

### Improvements and bug fixes

  - Additional performance improvements and bug fixes.

- 2026-02-09



### GPT-5.3-Codex in Cursor and VS Code




Starting today, GPT-5.3-Codex is available natively in Cursor and VS Code.



API access is starting with a small set of customers as part of a phased
release.



This is the first model treated as a high security capability under the
Preparedness Framework.



Safety controls will continue to scale, and API access will expand over the
next few weeks.

- 2026-02-08



### Codex app  26.208




### New features



  - Added MCP and personality actions to the command palette.
  - Updated follow-up behavior to queue by default.

### Improvements and bug fixes

  - Additional performance improvements and bug fixes.

- 2026-02-06



### Codex app  26.206




### New features



  - Added a file-reference action to reveal files directly in your OS file manager.

### Improvements and bug fixes

  - Improved handling of large reviews by removing the overall diff-size cap in the review pane.
  - Additional performance improvements and bug fixes.

- 2026-02-05



### Introducing GPT-5.3-Codex




[Today we’re releasing GPT-5.3-Codex](https://openai.com/index/introducing-gpt-5-3-codex/),
the most capable agentic coding model to date for complex, real-world software
engineering.



GPT-5.3-Codex combines the frontier coding performance of GPT-5.2-Codex with
stronger reasoning and professional knowledge capabilities, and runs 25% faster
for Codex users. It’s also better at collaboration while the agent is
working—delivering more frequent progress updates and responding to steering in
real time.



GPT-5.3-Codex is available with paid ChatGPT plans everywhere you can use
Codex: the Codex app, the CLI, the IDE extension, and Codex Cloud on the web.
API access for the model will come soon.



To switch to GPT-5.3-Codex:



  - In the CLI, start a new thread with:


    ```
    codex --model gpt-5.3-codex


    ```


    Or use `/model` during a session.
  - In the IDE extension, make sure you are signed in with ChatGPT, then choose
    GPT-5.3-Codex from the model selector in the composer.
  - In the Codex app, make sure you are signed in with ChatGPT, then choose
    GPT-5.3-Codex from the model selector in the composer.
  - If you don’t see GPT-5.3-Codex, update the CLI, IDE extension, or Codex app
    to the latest version.

For API-key workflows, continue using `gpt-5.2-codex` while API support rolls
out.

- 2026-02-05



### Codex app  26.205




### New features



  - Support for **[GPT-5.3-Codex](https://openai.com/index/introducing-gpt-5-3-codex/)**.
  - Added mid-turn steering. Submit a message while Codex is working to direct its behavior.
  - Attach or drop any file type.

### Bug fixes

  - Fix flickering of the app.

- 2026-02-04



### Codex app  26.204




### New features



  - Added **Zed** and **Textmate** as options to open files and folders.
  - Added PDF preview in the review panel.

### Bug fixes

  - Performance improvements.

- 2026-02-03



### Codex app  26.203




### New features



  - Added thread renaming on double-click in the thread list.

### Improvements and bug fixes

  - Renamed **Sync** to **Handoff** and added clearer source/destination stats in the handoff UI.
  - Additional performance improvements and bug fixes.

- 2026-02-02



### Introducing the Codex app




#### Codex app



![Codex app showing a project sidebar, thread list, and review pane](https://learn.chatgpt.com/images/codex/app/codex-app-basic-light.webp)![Codex app showing a project sidebar, thread list, and review pane](https://learn.chatgpt.com/images/codex/app/codex-app-basic-dark.webp)



![Codex app showing a project sidebar, thread list, and review pane](https://learn.chatgpt.com/images/codex/app/codex-app-basic-light.webp)![Codex app showing a project sidebar, thread list, and review pane](https://learn.chatgpt.com/images/codex/app/codex-app-basic-dark.webp)







The Codex app for macOS is a desktop interface for running agent threads in parallel and collaborating with agents on long-running tasks. It includes a project sidebar, thread list, and review pane for tracking work across projects.



Key features:



  - [Multitask across projects](https://learn.chatgpt.com/docs/projects)
  - [Built-in worktree support](https://learn.chatgpt.com/docs/environments/git-worktrees)
  - [Voice dictation](https://learn.chatgpt.com/docs/prompting#use-voice-dictation)
  - [Built-in Git tooling](https://learn.chatgpt.com/docs/environments/local-environment#use-built-in-git-tools)
  - [Skills](https://learn.chatgpt.com/docs/build-skills)
  - [Automations](https://learn.chatgpt.com/docs/automations)

For a limited time, **ChatGPT Free and Go include Codex**, and **Plus, Pro, Business, Enterprise, and Edu** plans get **double rate limits**. Those higher limits apply in the app, the CLI, your IDE, and the cloud.

Learn more in the [Introducing the Codex app](https://openai.com/index/introducing-the-codex-app/) blog post.

Check out the [Codex app documentation](https://learn.chatgpt.com/docs/app) for more.

[Get started with the Codex app](https://persistent.oaistatic.com/codex-app-prod/Codex.dmg)

## January 2026

- 2026-01-28



### Web search is now enabled by default




Codex now enables web search for local tasks in the Codex CLI and IDE Extension.
By default, Codex uses a web search cache, which is an OpenAI-maintained index of web results. Cached mode returns pre-indexed results instead of fetching live pages, while live mode fetches the most recent data from the web. If you are using `--yolo` or another [full access sandbox setting](https://learn.chatgpt.com/docs/agent-approvals-security), web search defaults to live results. To disable this behavior or switch modes, use the `web_search` configuration option:



  - `web_search = "cached"` (default; serves results from the web search cache)
  - `web_search = "live"` (fetches the most recent data from the web; same as `--search`)
  - `web_search = "disabled"` to remove the tool

To learn more, check out the [configuration documentation](https://learn.chatgpt.com/docs/config-file/config-basic).

- 2026-01-23



### Team Config for shared configuration




Team Config groups the files teams use to standardize Codex across repositories and machines. Use it to share:



  - `config.toml` defaults
  - `rules/` for command controls outside the sandbox
  - `skills/` for reusable workflows

Codex loads these layers from `.codex/` folders in the current working directory, parent folders, and the repo root, plus user (`~/.codex/`) and system (`/etc/codex/`) locations. Higher-precedence locations override lower-precedence ones.

Admins can still enforce constraints with `requirements.toml`, which overrides defaults regardless of location.

Learn more in [Team Config](https://learn.chatgpt.com/docs/enterprise/admin-setup#step-4-standardize-local-configuration-with-team-config).

- 2026-01-22



### Custom prompts deprecated




Custom prompts are now deprecated. Use [skills](https://learn.chatgpt.com/docs/build-skills) for reusable instructions and workflows instead.

- 2026-01-14



### GPT-5.2-Codex API availability




GPT-5.2-Codex is now available in the API and for users who sign into Codex with the API.



To learn more about using GPT-5.2-Codex check out our [API documentation](https://platform.openai.com/docs/models/gpt-5.2-codex).


## December 2025

- 2025-12-19



### Agent skills in Codex




Codex now supports **agent skills**: reusable bundles of instructions (plus optional scripts and resources) that help Codex reliably complete specific tasks.



Skills are available in both the Codex CLI and IDE extensions.



You can invoke a skill explicitly by typing `$skill-name` (for example, `$skill-installer` or the experimental `$create-plan` skill after installing it), or let Codex select a skill automatically based on your prompt.



Learn more in the [skills documentation](https://learn.chatgpt.com/docs/build-skills).





![](https://learn.chatgpt.com/images/codex/skills/skills-selector-cli-light.webp)![](https://learn.chatgpt.com/images/codex/skills/skills-selector-cli-dark.webp)



![](https://learn.chatgpt.com/images/codex/skills/skills-selector-ide-light.webp)![](https://learn.chatgpt.com/images/codex/skills/skills-selector-ide-dark.webp)





#### Folder-based standard (agentskills.io)



Following the open [agent skills specification](https://agentskills.io/specification), a skill is a folder with a required `SKILL.md` and optional supporting files:



```
my-skill/
    SKILL.md       # Required: instructions + metadata
    scripts/       # Optional: executable code
    references/    # Optional: documentation
    assets/        # Optional: templates, resources


```



#### Install skills per-user or per-repo



You can install skills for just yourself in `~/.codex/skills`, or for everyone on a project by checking them into `.codex/skills` in the repository.



Codex also ships with a few built-in system skills to get started, including `$skill-creator` and `$skill-installer`. The `$create-plan` skill is experimental and needs to be installed (for example: `$skill-installer install the create-plan skill from the .experimental folder`).



#### Curated skills directory



Codex ships with a [small curated set of skills](https://github.com/openai/skills) inspired by popular workflows at OpenAI. Install them with `$skill-installer`, and expect more over time.

- 2025-12-18



### Introducing GPT-5.2-Codex




[Today we are releasing GPT-5.2-Codex](https://openai.com/index/gpt-5-2-codex), the most advanced agentic coding model yet for complex, real-world software engineering.



GPT-5.2-Codex is a version of [GPT-5.2](https://openai.com/index/introducing-gpt-5-2/) further optimized for agentic coding in Codex, including improvements on long-horizon work through context compaction, stronger performance on large code changes like refactors and migrations, improved performance in Windows environments, and significantly stronger cybersecurity capabilities.



Starting today, the CLI and IDE Extension will default to `gpt-5.2-codex` for users who are signed in with ChatGPT. API access for the model will come soon.



If you have a model specified in your [`config.toml` configuration file](https://learn.chatgpt.com/docs/config-file/config-basic), you can instead try out `gpt-5.2-codex` for a new Codex CLI session using:



```
codex --model gpt-5.2-codex


```



You can also use the `/model` slash command in the CLI. In the Codex IDE Extension you can select GPT-5.2-Codex from the dropdown menu.



If you want to switch for all sessions, you can change your default model to `gpt-5.2-codex` by updating your `config.toml` [configuration file](https://learn.chatgpt.com/docs/config-file/config-basic):



```
model = "gpt-5.2-codex”


```

- 2025-12-04



### Introducing Codex for Linear




Assign or mention @Codex in an issue to kick-off a Codex cloud task. As Codex works, it posts updates back to Linear, providing a link to the completed task so you can review, open a PR, or keep working.



![Screenshot of a successful Codex task started in Linear](https://learn.chatgpt.com/images/codex/integrations/linear-codex-example.png)



To learn more about how to connect Codex to Linear both locally through MCP and through the new integration, check out the [Codex for Linear documentation](https://learn.chatgpt.com/docs/third-party/linear).


## November 2025

- 2025-11-24



### Usage and credits fixes




Minor updates to address a few issues with Codex usage and credits:



  - Adjusted all usage dashboards to show “limits remaining” for consistency. The CLI previously displayed “limits used.”
  - Fixed an issue preventing users from buying credits if their ChatGPT subscription was purchased via iOS or Google Play.
  - Fixed an issue where the CLI could display stale usage information; it now refreshes without needing to send a message first.
  - Optimized the backend to help smooth out usage throughout the day, irrespective of overall Codex load or how traffic is routed. Before, users could get unlucky and hit a few cache misses in a row, leading to much less usage.

- 2025-11-18



### Introducing GPT-5.1-Codex-Max




[Today we are releasing GPT-5.1-Codex-Max](https://openai.com/index/gpt-5-1-codex-max), our new frontier agentic coding model.



GPT‑5.1-Codex-Max is built on an update to our foundational reasoning model, which is trained on agentic tasks across software engineering, math, research, and more. GPT‑5.1-Codex-Max is faster, more intelligent, and more token-efficient at every stage of the development cycle–and a new step towards becoming a reliable coding partner.



Starting today, the CLI and IDE Extension will default to `gpt-5.1-codex-max` for users that are signed in with ChatGPT. API access for the model will come soon.



For non-latency-sensitive tasks, we’ve also added a new Extra High (`xhigh`) reasoning effort, which lets the model think for an even longer period of time for a better answer. We still recommend medium as your daily driver for most tasks.



If you have a model specified in your [`config.toml` configuration file](https://learn.chatgpt.com/docs/config-file/config-basic), you can instead try out `gpt-5.1-codex-max` for a new Codex CLI session using:



```
codex --model gpt-5.1-codex-max


```



You can also use the `/model` slash command in the CLI. In the Codex IDE Extension you can select GPT-5.1-Codex from the dropdown menu.



If you want to switch for all sessions, you can change your default model to `gpt-5.1-codex-max` by updating your `config.toml` [configuration file](https://learn.chatgpt.com/docs/config-file/config-basic):



```
model = "gpt-5.1-codex-max”


```

- 2025-11-13



### Introducing GPT-5.1-Codex and GPT-5.1-Codex-Mini




Along with the [GPT-5.1 launch in the API](https://openai.com/index/gpt-5-1-for-developers/), we are introducing new `gpt-5.1-codex-mini` and `gpt-5.1-codex` model options in Codex, a version of GPT-5.1 optimized for long-running, agentic coding tasks and use in coding agent harnesses in Codex or Codex-like harnesses.



Starting today, the CLI and IDE Extension will default to `gpt-5.1-codex` on macOS and Linux and `gpt-5.1` on Windows.



If you have a model specified in your [`config.toml` configuration file](https://learn.chatgpt.com/docs/config-file/config-basic), you can instead try out `gpt-5.1-codex` for a new Codex CLI session using:



```
codex --model gpt-5.1-codex


```



You can also use the `/model` slash command in the CLI. In the Codex IDE Extension you can select GPT-5.1-Codex from the dropdown menu.



If you want to switch for all sessions, you can change your default model to `gpt-5.1-codex` by updating your `config.toml` [configuration file](https://learn.chatgpt.com/docs/config-file/config-basic):



```
model = "gpt-5.1-codex”


```

- 2025-11-07



### Introducing GPT-5-Codex-Mini




Today we are introducing a new `gpt-5-codex-mini` model option to Codex CLI and the IDE Extension. The model is a smaller, more cost-effective, but less capable version of `gpt-5-codex` that provides approximately 4x more usage as part of your ChatGPT subscription.



Starting today, the CLI and IDE Extension will automatically suggest switching to `gpt-5-codex-mini` when you reach 90% of your 5-hour usage limit, to help you work longer without interruptions.



You can try the model for a new Codex CLI session using:



```
codex --model gpt-5-codex-mini


```



You can also use the `/model` slash command in the CLI. In the Codex IDE Extension you can select GPT-5-Codex-Mini from the dropdown menu.



Alternatively, you can change your default model to `gpt-5-codex-mini` by updating your `config.toml` [configuration file](https://learn.chatgpt.com/docs/config-file/config-basic):



```
model = "gpt-5-codex-mini”


```

- 2025-11-06



### GPT-5-Codex model update




We’ve shipped a minor update to GPT-5-Codex:



  - More reliable file edits with `apply_patch`.
  - Fewer destructive actions such as `git reset`.
  - More collaborative behavior when encountering user edits in files.
  - 3% more efficient in time and usage.

## October 2025

- 2025-10-30



### Credits on ChatGPT Pro and Plus




Codex users on ChatGPT Plus and Pro can now use on-demand credits for more Codex usage beyond what’s included in your plan. [Learn more.](https://learn.chatgpt.com/docs/pricing)

- 2025-10-22



### Tag @Codex on GitHub Issues and PRs




You can now tag `@codex` on a teammate’s pull request to ask clarifying questions, request a follow-up, or ask Codex to make changes. GitHub Issues now also support `@codex` mentions, so you can kick off tasks from any issue, without leaving your workflow.



![Codex responding to a GitHub pull request and issue after an @Codex mention.](https://learn.chatgpt.com/images/codex/integrations/github-example.png)

- 2025-10-06



### Codex is now GA




Codex is now generally available with 3 new features — @Codex in Slack, Codex SDK, and new admin tools.



#### @Codex in Slack



![](https://learn.chatgpt.com/images/codex/integrations/slack-example.png)



You can now questions and assign tasks to Codex directly from Slack. See the [Slack guide](https://learn.chatgpt.com/docs/third-party/slack) to get started.



#### Codex SDK



Integrate the same agent that powers the Codex CLI inside your own tools and workflows with the Codex SDK in Typescript. With the new Codex GitHub Action, you can easily add Codex to CI/CD workflows. See the [Codex SDK guide](https://learn.chatgpt.com/docs/codex-sdk) to get started.



```
import { Codex } from "@openai/codex-sdk";

const agent = new Codex();
const thread = await agent.startThread();

const result = await thread.run("Explore this repo");
console.log(result);

const result2 = await thread.run("Propose changes");
console.log(result2);


```



#### New admin controls and analytics



![](https://learn.chatgpt.com/images/codex/enterprise/analytics.png)



ChatGPT workspace admins can now edit or delete Codex Cloud environments. With managed config files, they can set safe defaults for CLI and IDE usage and monitor how Codex uses commands locally. New analytics dashboards help you track Codex usage and code review feedback. Learn more in the [enterprise admin guide.](https://learn.chatgpt.com/docs/enterprise/admin-setup)



#### Availability and pricing updates



The Slack integration and Codex SDK are available to developers on ChatGPT Plus, Pro, Business, Edu, and Enterprise plans starting today, while the new admin features will be available to Business, Edu, and Enterprise.
Beginning October 20, Codex Cloud tasks will count toward your Codex usage. Review the [Codex pricing guide](https://learn.chatgpt.com/docs/pricing) for plan-specific details.


## September 2025

- 2025-09-23



### GPT-5-Codex in the API




GPT-5-Codex is now available in the Responses API, and you can also use it with your API Key in the Codex CLI.
We plan on regularly updating this model snapshot.
It is available at the same price as GPT-5. You can learn more about pricing and rate limits for this model on our [model page](https://platform.openai.com/docs/models/gpt-5-codex).

- 2025-09-15



### Introducing GPT-5-Codex




#### New model: GPT-5-Codex



![codex-switch-model](https://cdn.openai.com/devhub/docs/codex-switch-model.png)



GPT-5-Codex is a version of GPT-5 further optimized for agentic coding in Codex.
It’s available in the IDE extension and CLI when you sign in with your ChatGPT account.
It also powers the cloud agent and Code Review in GitHub.



To learn more about GPT-5-Codex and how it performs compared to GPT-5 on software engineering tasks, see our [announcement blog post](https://openai.com/index/introducing-upgrades-to-codex/).



#### Image outputs



![codex-image-outputs](https://cdn.openai.com/devhub/docs/codex-image-output.png)



When working in the cloud on front-end engineering tasks, GPT-5-Codex can now display screenshots of the UI in Codex web for you to review. With image output, you can iterate on the design without needing to check out the branch locally.



#### New in Codex CLI



  - You can now resume sessions where you left off with `codex resume`.
  - Context compaction automatically summarizes the session as it approaches the context window limit.

Learn more in the [latest release notes](https://github.com/openai/codex/releases/tag/rust-v0.36.0)

## August 2025

- 2025-08-27



### Late August update




#### IDE extension (Compatible with VS Code, Cursor, Windsurf)



Codex now runs in your IDE with an interactive UI for fast local iteration. Easily switch between modes and reasoning efforts.



#### Sign in with ChatGPT (IDE & CLI)



One-click authentication that removes API keys and uses ChatGPT Enterprise credits.



#### Move work between local ↔ cloud



Hand off tasks to Codex web from the IDE with the ability to apply changes locally so you can delegate jobs without leaving your editor.



#### Code Reviews



Codex goes beyond static analysis. It checks a PR against its intent, reasons across the codebase and dependencies, and can run code to validate the behavior of changes.

- 2025-08-21



### Mid August update




#### Image inputs



![](https://learn.chatgpt.com/images/codex/changelog/image_input.png)



You can now attach images to your prompts in Codex web to ask for frontend changes or follow up on whiteboard sessions.



#### Container caching



![](https://learn.chatgpt.com/images/codex/changelog/container_caching.png)



Codex now caches containers to start new tasks and follow-ups 90% faster, reducing the median start time from 48 seconds to 5 seconds. You can configure a maintenance script to update the cached environment before new tasks.



#### Automatic environment setup



Environments without manual setup scripts now run the standard installation commands for common package managers like yarn, pnpm, npm, go mod, Gradle, pip, poetry, uv, and cargo. This reduces test failures for new environments by 40%.


## June 2025

- 2025-06-13



### Best of N




![](https://learn.chatgpt.com/images/codex/changelog/best-of-n.png)



Codex can now generate multiple responses simultaneously for a single task, helping you quickly explore possible solutions to pick the best approach.



#### Fixes & improvements



  - Added some keyboard shortcuts and a page to explore them. Open it by pressing ⌘-/ on macOS and Ctrl+/ on other platforms.

  - Added a “branch” query parameter in addition to the existing “environment”, “prompt” and “tab=archived” parameters.

  - Added a loading indicator when downloading a repo during container setup.

  - Added support for cancelling tasks.

  - Fixed issues causing tasks to fail during setup.

  - Fixed issues running followups in environments where the setup script changes files that are gitignored.

  - Improved how the agent understands and reacts to network access restrictions.

  - Increased the update rate of text describing what Codex is doing.

  - Increased the limit for setup script duration to 20 minutes for Pro and Business users.

  - Polished code diffs: You can now option-click a code diff header to expand/collapse all of them.


- 2025-06-03



### June update




#### Agent internet access



![](https://learn.chatgpt.com/images/codex/changelog/internet_access.png)



Now you can give Codex access to the internet during task execution to install dependencies, upgrade packages, run tests that need external resources, and more.



Internet access is off by default. Plus, Pro, and Business users can enable it for specific environments, with granular control of which domains and HTTP methods Codex can access. Internet access for Enterprise users is coming soon.



Learn more about usage and risks in the [docs](https://learn.chatgpt.com/docs/cloud/internet-access).



#### Update existing PRs



![](https://learn.chatgpt.com/images/codex/changelog/update_prs.png)



Now you can update existing pull requests when following up on a task.



#### Voice dictation



Now you can dictate tasks to Codex.



#### Fixes & improvements



  - Added a link to this changelog from the profile menu.

  - Added support for binary files: When applying patches, all file operations are supported. When using PRs, only deleting or renaming binary files is supported for now.

  - Fixed an issue on iOS where follow up tasks where shown duplicated in the task list.

  - Fixed an issue on iOS where pull request statuses were out of date.

  - Fixed an issue with follow ups where the environments were incorrectly started with the state from the first turn, rather than the most recent state.

  - Fixed internationalization of task events and logs.

  - Improved error messages for setup scripts.

  - Increased the limit on task diffs from 1 MB to 5 MB.

  - Increased the limit for setup script duration from 5 to 10 minutes.

  - Polished GitHub connection flow.

  - Re-enabled Live Activities on iOS after resolving an issue with missed notifications.

  - Removed the mandatory two-factor authentication requirement for users using SSO or social logins.


## May 2025

- 2025-05-22



### Reworked environment page




It’s now easier and faster to set up code execution.



![](https://learn.chatgpt.com/images/codex/changelog/environment_setup.png)



#### Fixes & improvements



  - Added a button to retry failed tasks

  - Added indicators to show that the agent runs without network access after setup

  - Added options to copy git patches after pushing a PR

  - Added support for unicode branch names

  - Fixed a bug where secrets were not piped to the setup script

  - Fixed creating branches when there’s a branch name conflict.

  - Fixed rendering diffs with multi-character emojis.

  - Improved error messages when starting tasks, running setup scripts, pushing PRs, or disconnected from GitHub to be more specific and indicate how to resolve the error.

  - Improved onboarding for teams.

  - Polished how new tasks look while loading.

  - Polished the followup composer.

  - Reduced GitHub disconnects by 90%.

  - Reduced PR creation latency by 35%.

  - Reduced tool call latency by 50%.

  - Reduced task completion latency by 20%.

  - Started setting page titles to task names so Codex tabs are easier to tell apart.

  - Tweaked the system prompt so that agent knows it’s working without network, and can suggest that the user set up dependencies.

  - Updated the docs.


- 2025-05-19



### Codex in the ChatGPT iOS app




Start tasks, view diffs, and push PRs—while you’re away from your desk.



![](https://learn.chatgpt.com/images/codex/changelog/mobile_support.png)


Ask AI

Loading docs agent...