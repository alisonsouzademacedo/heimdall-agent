<!-- source: https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya -->
[Skip to main content](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#__docusaurus_skipToContent_fallback)

On this page

Himalaya CLI: IMAP/SMTP email from terminal.

## Skill metadata [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#skill-metadata "Direct link to Skill metadata")

|  |  |
| --- | --- |
| Source | Bundled (installed by default) |
| Path | `skills/email/himalaya` |
| Version | `1.1.0` |
| Author | community |
| License | MIT |
| Platforms | linux, macos, windows |
| Tags | `Email`, `IMAP`, `SMTP`, `CLI`, `Communication` |

## Reference: full SKILL.md [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#reference-full-skillmd "Direct link to Reference: full SKILL.md")

info

The following is the complete skill definition that Hermes loads when this skill is triggered. This is what the agent sees as instructions when the skill is active.

# Himalaya Email CLI

Himalaya is a CLI email client that lets you manage emails from the terminal using IMAP, SMTP, Notmuch, or Sendmail backends.

This skill is separate from the Hermes Email gateway adapter. The gateway
adapter lets people email the agent and uses Hermes' built-in IMAP/SMTP
adapter; this skill lets the agent operate a mailbox from terminal tools and
requires the external `himalaya` CLI.

## References [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#references "Direct link to References")

- `references/configuration.md` (config file setup + IMAP/SMTP authentication)
- `references/message-composition.md` (MML syntax for composing emails)

## Prerequisites [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#prerequisites "Direct link to Prerequisites")

1. Himalaya CLI installed (`himalaya --version` to verify)
2. A configuration file at `~/.config/himalaya/config.toml`
3. IMAP/SMTP credentials configured (password stored securely)

### Installation [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#installation "Direct link to Installation")

```bash
# Pre-built binary (Linux/macOS — recommended)

curl -sSL https://raw.githubusercontent.com/pimalaya/himalaya/master/install.sh | PREFIX=~/.local sh

# macOS via Homebrew

brew install himalaya

# Or via cargo (any platform with Rust)

cargo install himalaya --locked
```

## Configuration Setup [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#configuration-setup "Direct link to Configuration Setup")

Run the interactive wizard to set up an account:

```bash
himalaya account configure
```

Or create `~/.config/himalaya/config.toml` manually:

```toml
[accounts.personal]

email = "you@example.com"

display-name = "Your Name"

default = true

backend.type = "imap"

backend.host = "imap.example.com"

backend.port = 993

backend.encryption.type = "tls"

backend.login = "you@example.com"

backend.auth.type = "password"

backend.auth.cmd = "pass show email/imap"  # or use keyring

message.send.backend.type = "smtp"

message.send.backend.host = "smtp.example.com"

message.send.backend.port = 587

message.send.backend.encryption.type = "start-tls"

message.send.backend.login = "you@example.com"

message.send.backend.auth.type = "password"

message.send.backend.auth.cmd = "pass show email/smtp"

# Folder aliases (himalaya v1.2.0+ syntax). Required whenever the

# server's folder names don't match himalaya's canonical names

# (inbox/sent/drafts/trash). Gmail is the common case — see

# `references/configuration.md` for the `[Gmail]/Sent Mail` mapping.

folder.aliases.inbox = "INBOX"

folder.aliases.sent = "Sent"

folder.aliases.drafts = "Drafts"

folder.aliases.trash = "Trash"
```

> **Heads up on the alias syntax.** Pre-v1.2.0 docs used a
> `[accounts.NAME.folder.alias]` sub-section (singular `alias`).
> v1.2.0 silently ignores that form — TOML parses fine, but the
> alias resolver never reads it, so every lookup falls through to
> the canonical name. On Gmail this means save-to-Sent fails _after_
> SMTP delivery succeeds, and `himalaya message send` exits non-zero.
> Any caller (agent, script, user) that retries on that exit code
> will re-run the entire send — including SMTP — producing duplicate
> emails to recipients. Always use `folder.aliases.X` (plural, dotted
> keys, directly under `[accounts.NAME]`).

## Hermes Integration Notes [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#hermes-integration-notes "Direct link to Hermes Integration Notes")

- **Reading, listing, searching, moving, deleting** all work directly through the terminal tool
- **Composing/replying/forwarding** — piped input (`cat << EOF | himalaya template send`) is recommended for reliability. Interactive `$EDITOR` mode works with `pty=true` \+ background + process tool, but requires knowing the editor and its commands
- Use `--output json` for structured output that's easier to parse programmatically
- The `himalaya account configure` wizard requires interactive input — use PTY mode: `terminal(command="himalaya account configure", pty=true)`

## Common Operations [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#common-operations "Direct link to Common Operations")

### List Folders [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#list-folders "Direct link to List Folders")

```bash
himalaya folder list
```

### List Emails [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#list-emails "Direct link to List Emails")

List emails in INBOX (default):

```bash
himalaya envelope list
```

List emails in a specific folder:

```bash
himalaya envelope list --folder "Sent"
```

List with pagination:

```bash
himalaya envelope list --page 1 --page-size 20
```

### Search Emails [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#search-emails "Direct link to Search Emails")

```bash
himalaya envelope list from john@example.com subject meeting
```

### Read an Email [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#read-an-email "Direct link to Read an Email")

Read email by ID (shows plain text):

```bash
himalaya message read 42
```

Export raw MIME:

```bash
himalaya message export 42 --full
```

### Reply to an Email [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#reply-to-an-email "Direct link to Reply to an Email")

To reply non-interactively from Hermes, read the original message, compose a reply, and pipe it:

```bash
# Get the reply template, edit it, and send

himalaya template reply 42 | sed 's/^$/\nYour reply text here\n/' | himalaya template send
```

Or build the reply manually:

```bash
cat << 'EOF' | himalaya template send

From: you@example.com

To: sender@example.com

Subject: Re: Original Subject

In-Reply-To: <original-message-id>

Your reply here.

EOF
```

Reply-all (interactive — needs $EDITOR, use template approach above instead):

```bash
himalaya message reply 42 --all
```

### Forward an Email [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#forward-an-email "Direct link to Forward an Email")

```bash
# Get forward template and pipe with modifications

himalaya template forward 42 | sed 's/^To:.*/To: newrecipient@example.com/' | himalaya template send
```

### Write a New Email [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#write-a-new-email "Direct link to Write a New Email")

**Non-interactive (use this from Hermes)** — pipe the message via stdin:

```bash
cat << 'EOF' | himalaya template send

From: you@example.com

To: recipient@example.com

Subject: Test Message

Hello from Himalaya!

EOF
```

Or with headers flag:

```bash
himalaya message write -H "To:recipient@example.com" -H "Subject:Test" "Message body here"
```

Note: `himalaya message write` without piped input opens `$EDITOR`. This works with `pty=true` \+ background mode, but piping is simpler and more reliable.

### Move/Copy Emails [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#movecopy-emails "Direct link to Move/Copy Emails")

Move to folder (target folder comes first, then the message ID):

```bash
himalaya message move "Archive" 42
```

Copy to folder (target folder comes first, then the message ID):

```bash
himalaya message copy "Important" 42
```

### Delete an Email [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#delete-an-email "Direct link to Delete an Email")

```bash
himalaya message delete 42
```

### Manage Flags [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#manage-flags "Direct link to Manage Flags")

Add flag:

```bash
himalaya flag add 42 --flag seen
```

Remove flag:

```bash
himalaya flag remove 42 --flag seen
```

## Multiple Accounts [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#multiple-accounts "Direct link to Multiple Accounts")

List accounts:

```bash
himalaya account list
```

Use a specific account:

```bash
himalaya --account work envelope list
```

## Attachments [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#attachments "Direct link to Attachments")

Save attachments from a message:

```bash
himalaya attachment download 42
```

Save to specific directory:

```bash
himalaya attachment download 42 --downloads-dir ~/Downloads
```

## Output Formats [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#output-formats "Direct link to Output Formats")

Most commands support `--output` for structured output:

```bash
himalaya envelope list --output json

himalaya envelope list --output plain
```

## Debugging [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#debugging "Direct link to Debugging")

Enable debug logging:

```bash
RUST_LOG=debug himalaya envelope list
```

Full trace with backtrace:

```bash
RUST_LOG=trace RUST_BACKTRACE=1 himalaya envelope list
```

## Tips [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya\#tips "Direct link to Tips")

- Use `himalaya --help` or `himalaya <command> --help` for detailed usage.
- Message IDs are relative to the current folder; re-list after folder changes.
- For composing rich emails with attachments, use MML syntax (see `references/message-composition.md`).
- Store passwords securely using `pass`, system keyring, or a command that outputs the password.

- [Skill metadata](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#skill-metadata)
- [Reference: full SKILL.md](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#reference-full-skillmd)
- [References](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#references)
- [Prerequisites](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#prerequisites)
  - [Installation](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#installation)
- [Configuration Setup](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#configuration-setup)
- [Hermes Integration Notes](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#hermes-integration-notes)
- [Common Operations](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#common-operations)
  - [List Folders](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#list-folders)
  - [List Emails](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#list-emails)
  - [Search Emails](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#search-emails)
  - [Read an Email](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#read-an-email)
  - [Reply to an Email](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#reply-to-an-email)
  - [Forward an Email](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#forward-an-email)
  - [Write a New Email](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#write-a-new-email)
  - [Move/Copy Emails](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#movecopy-emails)
  - [Delete an Email](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#delete-an-email)
  - [Manage Flags](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#manage-flags)
- [Multiple Accounts](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#multiple-accounts)
- [Attachments](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#attachments)
- [Output Formats](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#output-formats)
- [Debugging](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#debugging)
- [Tips](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/email/email-himalaya#tips)
