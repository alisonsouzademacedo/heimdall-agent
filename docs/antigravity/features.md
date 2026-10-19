# Antigravity App features

### Projects

In the Antigravity App, agents work in **projects** (previously in Agent Manager, agents were strictly mapped to a single workspace folder):

*   **Worktree support**: Projects natively support Git worktrees, allowing agents to operate in isolated background folders.
*   **Scoped settings**: Settings are scoped, allowing you to have different security settings per project. This means you can have a more permissive setting for a trusted project and a more restrictive security setting for an untrusted folder. The three main presets are “Default”, “Full machine”, and “Unrestricted” (refer to the **Settings** tab for the full list).
*   **Scoped permissions**: Attach permission grants to projects to control what the agents are allowed to access. Permissions manually granted during a conversation can persist, allowing the agent to learn trusted actions and enabling a more seamless experience over time.
*   **Multi-folder access**: You can configure a project to work in multiple folders, allowing agents to operate across different codebases within the same conversation.

### Conversations outside of projects

Start quick, one-off conversations outside of any project. These sessions run in an isolated local scratch folder. They have their own settings and permissions in addition to inheriting from global permissions.

### Scheduled tasks

Scheduled tasks let you plan ahead with your projects. Using the Gemini 3.8 Flash model, you can schedule messages to be sent to your agents while you’re away:

*   **Repeatable**: Set up time-based triggers to start conversations periodically.
*   **Minute-level precision**: Tasks repeat on the exact minute you set them.

### Secure by default

Antigravity puts you in the driver’s seat with robust security controls:

*   **Interactive approvals**: By default, agents request your explicit permission before running terminal commands outside the isolated [Terminal sandbox](/docs/sandbox) (macOS and Linux) or before running any terminal command (Windows).
*   **Bounded access**: By default, your agent can only read and write within the provided folders of a project. If you broaden your permission settings (for example, the “Turbo” preset on macOS and Linux, or the “Full machine” or “Unrestricted” security presets on Windows), the agent has read and write access over your full machine.

### Voice transcription

Antigravity features built-in live voice transcription, allowing you to prompt agents and leave feedback using natural speech.

To use voice transcription:

*   **Start or stop**: Click the microphone button next to the text input box to start recording, and click it again to stop.
*   **Live view**: As you speak, your words are transcribed in real time directly into the input field.
*   **Shortcut**: You can start recording by pressing Ctrl + M. Once you’re done, press Ctrl + M to stop recording.

Voice transcription includes the following key features:

*   **Smart cleanup**: Speak naturally without worrying about pauses or perfect phrasing. Once you stop recording, the system automatically cleans up the transcription, resolving self-corrections, repetitions, and filler words into a cohesive prompt.
*   **Conversational awareness**: Because the model has context from your conversation, you can use project-specific terminology and expect accurate results.

Voice input is available across all primary interaction surfaces:

*   **Agent input**: For starting conversations and sending prompt updates.
*   **Artifact comments**: For leaving precise, inline feedback on plans, code diffs, and deliverables.

### JSON hooks

JSON hooks allow you to execute custom local shell scripts at critical stages of an Antigravity agent’s execution cycle. You can intercept and control the agent’s behavior before tool calls, after model responses, or at loop stopping conditions—configured globally or per workspace using simple JSON files.

[Explore the JSON hooks and rules documentation](/docs/hooks).

### Browser

The reworked browser subagent in the Antigravity App includes the following capabilities:

*   **On-demand**: Invoke the browser subagent through the [`/browser` command](/docs/commands/browser).
*   **Chrome DevTools integration**: Integrate natively with Chrome DevTools MCP.
*   **Video recording**: Record browser sessions as WebM videos.

### Remote Control

Antigravity App Remote Control allows you to drive and monitor your desktop agent sessions across multiple machines from any web browser:

*   **Untethered mobility**: Launch long-running agent workflows on your desktop workstation and continue monitoring or approving actions from a mobile device or laptop.
*   **Local context retained**: Keep full access to your workstation’s local filesystem, toolchains, credentials, and Git worktrees without duplicating environments.
*   **Proactive push notifications**: Receive browser push notifications when tasks complete or when your input is needed.

[Learn more about Antigravity App Remote Control](/docs/remote-control).

### Integrated terminal

The Antigravity App provides terminal support directly from the sidebar. Access the terminal at any time by clicking the terminal button () or by using the Ctrl/Cmd + \` keyboard shortcut.

### Version control system (VCS) panel

The Antigravity App provides a Git-native VCS review panel directly from the sidebar. Access the panel at any time by clicking the version control button () to perform the following actions:

*   **Review panel diffs**:
    *   **Uncommitted diffs**: View all staged and unstaged working tree changes.
    *   **Branch diffs**: Review changes made on the current branch.
    *   **Agent edits**: Inspect diffs originating specifically from agent tool edits.
*   **File actions**: Stage, unstage, or discard changes per file.
*   **Repo actions**:
    *   **Commit**: Create local commits with the option to automatically generate commit messages.
    *   **Push**: Send branch commits to a remote repository.