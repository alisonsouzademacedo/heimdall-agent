# Marketplace

The Marketplace lets you discover, install, and manage curated [plugins](/docs/plugins) that extend your agent with reusable [skills](/docs/skills), [MCP servers](/docs/mcp), [rules](/docs/rules), and [subagents](/docs/subagents).

Note

**Cross-surface synchronization**: Plugins installed in the **Antigravity App** are automatically updated and displayed in the **Antigravity CLI**’s **Installed** tab.

## Antigravity App

### Browse and install plugins

To browse and install Marketplace plugins in the Antigravity App, follow these steps:

1.  In the left sidebar, click the **Customizations** tab (below **Scheduled Tasks**):
    
    ![Customization tab](/assets/image/docs/plugins/customization-tab.png)
    
2.  Click the **Marketplace** tab to view available plugins:
    
    ![Marketplace tab](/assets/image/docs/plugins/marketplace-plugins.png)
    
3.  Click any plugin card to inspect its details and bundled capabilities:
    
    ![Plugin details view](/assets/image/docs/plugins/plugin-card.png)
    
4.  Click **+** on the plugin card to install it.
    

### Manage installed plugins

To inspect, toggle, or uninstall existing plugins:

1.  In the **Customizations** panel, click the **Installed** tab:
    
    ![Installed plugins](/assets/image/docs/plugins/installed-plugins.png)
    
2.  Click the toggle switch beside any plugin to enable or disable it.
    
3.  To uninstall a plugin, click the plugin card and select **Uninstall**.
    

Any plugins you install in the Antigravity App automatically sync and appear in the Antigravity CLI’s **Installed** tab.

## Antigravity CLI

#### Open the plugin manager in the CLI

In the Antigravity CLI, open the interactive plugin manager using the `/plugin` slash command (or its alias `/plugins`):

```
/plugin
```

Press Tab to switch between the **Installed** tab and the **Discover** tab.

* * *

#### Discover tab

Use the **Discover** tab to browse the Marketplace catalog and install new plugins:

*   **Search plugins**: Start typing to search and filter for specific plugins.
*   **Install from a local directory**: Highlight **Install from local directory** and press Enter to provide a local filesystem path for plugin installation.
*   **View plugin details**: Highlight a plugin and press Enter to expand its details view. The details view displays the following information:
    *   Description
    *   Included components (MCP servers, skills, rules, agents, and more)
    *   Marketplace name
    *   Version
*   **Install or uninstall**: Press Ctrl + S on an uninstalled plugin to install it, or press Ctrl + S on an installed plugin to uninstall it.

##### After installation

Once a plugin is installed, the interface updates as follows:

*   **Discover tab**: A green dot (`●`) appears beside the plugin name indicating its installed status.
*   **Installed tab**: The plugin name appears in the **Installed** tab list.

#### Installed tab

Use the **Installed** tab to inspect and manage the plugins you have installed:

*   **Search installed plugins**: Start typing to filter your installed plugins.
*   **Enable or disable**: Press Space on an installed plugin to toggle it between enabled and disabled.
*   **View plugin details**: Press Enter on an installed plugin to expand its details view. The details view displays the following information:
    *   Description
    *   Skills (if applicable)
    *   MCP servers (if applicable)
    *   Rules (if applicable)
    *   Agents (if applicable)
    *   Marketplace name
    *   Local installation path
    *   Version
*   **Uninstall**: Press Ctrl + S on an installed plugin to uninstall it.

##### Keyboard shortcuts

The following keyboard shortcuts are available in the plugin manager:

| Key | Tab | Action |
| :-- | :-- | :-- |
| Tab | Both | Switch between the **Installed** tab and **Discover** tab. |
| Any key | Both | Search and filter plugins in the active tab. |
| Enter | Both | Expand plugin details (or select **Install from local directory** in **Discover**). |
| Ctrl + S | Both | Install an uninstalled plugin, or uninstall an installed plugin. |
| Space | **Installed** | Toggle enable or disable on an installed plugin. |

* * *

#### Inline `/plugin` commands

In addition to the interactive panel, `/plugin` supports inline commands to `install`, `uninstall`, `enable`, `disable`, and `list` plugins directly from the prompt without opening the plugin manager UI:

*   **Install from the official marketplace or a local directory**: Run the following commands (`<marketplace-name>` supports the official marketplace, `antigravity-plugins-official`):
    
    ```
    /plugin install <plugin-name>@antigravity-plugins-official
    /plugin install <local-path>
    ```
    
    For example, running `/plugin install firebase@antigravity-plugins-official` outputs:
    
    ```
    Successfully installed plugin "firebase" from "antigravity-plugins-official".
    ```
    
*   **Manage and list plugins inline**: Run the following commands:
    
    ```
    /plugin uninstall <plugin-name>
    /plugin enable <plugin-name>
    /plugin disable <plugin-name>
    /plugin list
    ```
    

* * *

### Install from your shell (`agy plugin`)

Outside an interactive TUI session, you can install and manage plugins directly from your shell using `agy plugin`:

*   **Install from the official marketplace**: Specify `<plugin-name>@antigravity-plugins-official` (`<marketplace-name>` only supports the official marketplace, `antigravity-plugins-official`), or pass a bare `<plugin-name>`, which defaults to `<plugin-name>@antigravity-plugins-official`:
    
    ```
    agy plugin install firebase@antigravity-plugins-official
    agy plugin install firebase
    ```
    
*   **Install from a GitHub link**: Clone and stage a plugin directly from a GitHub repository URL:
    
    ```
    agy plugin install https://github.com/<owner>/<repo>
    ```
    
*   **Install from a local directory**: Stage a local plugin folder into your profile:
    
    ```
    agy plugin install </path/to/local/plugin>
    ```
    
*   **List installed plugins**: Run `agy plugin list` for a human-readable summary of installed plugins and their component counts, or pass `--json` to output a JSON array with installation paths and component names:
    
    ```
    agy plugin list
    agy plugin list --json
    ```
    
*   **Enable, disable, or uninstall plugins**:
    
    ```
    agy plugin enable <plugin-name>
    agy plugin disable <plugin-name>
    agy plugin uninstall <plugin-name>
    ```

* * *

## Next steps

Explore related documentation and guides:

*   **[Get your plugin in the marketplace](https://forms.gle/2EX5RFYPoJe1UgxR9)**: Fill out this interest form to learn more about how to get your plugin listed in the Antigravity Marketplace.
*   **[Plugins](/docs/plugins)**: Learn how to author custom `plugin.json` manifests and package your own plugins.
*   **[Build with Google](/docs/build-with-google)**: Explore curated Google plugins for Firebase, Android, Flutter, Chrome DevTools, BigQuery, and more.
*   **[CLI reference](/docs/cli/reference)**: View all slash commands and keyboard shortcuts in the Antigravity CLI.