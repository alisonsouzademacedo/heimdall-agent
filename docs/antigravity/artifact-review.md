# Artifact review

When starting a new agent conversation, you can choose between two primary execution modes that determine how changes are proposed and reviewed:

*   **Planning mode**: The agent plans thoroughly before executing tasks. In this mode, the agent organizes its work in [task groups](/docs/ide/agent-side-panel), produces structured implementation plans called [artifacts](/docs/artifacts), and thoroughly researches the codebase for optimal quality.
*   **Fast mode**: The agent executes tasks directly without a dedicated planning phase. Use this for simple, highly localized tasks that can be completed quickly, such as variable renaming, running a specific Bash command, or small refactors.

When working in **Planning mode**, the artifact review policy controls how you interact with and approve these plans before changes are made to your codebase.

## Artifact review policy

You can customize the review workflow in the **Agent** tab of the **Settings** pane. Choose between two policies:

### Request review (recommended)

The agent always halts and requests your explicit approval before proceeding with proposed changes:

*   When the agent generates an implementation plan or code diff, it pauses execution and notifies you.
*   This allows you to thoroughly review the proposed changes, add inline comments, and verify the plan in your workspace.
*   Once you’re satisfied, you can approve the plan to let the agent proceed.

![Settings Review Policy Manual](/assets/image/docs/agent/settings-review-policy-manual.png)

### Always proceed

The agent never halts for manual review and immediately proceeds with executing its plans:

*   When the agent decides to request a review, it immediately bypasses the pause and continues with the implementation.
*   Use this if you want a fully autonomous workflow and don’t need to manually verify plans before code is modified.

![Settings Review Policy Proceed](/assets/image/docs/agent/settings-review-policy-proceed.png)