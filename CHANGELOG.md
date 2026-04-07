# Changelog

All notable changes to **mcp-jira-tempo** are documented in this file.

## [1.0.0] - 2026-04-08

### Added

- Initial release under the package name **`mcp-jira-tempo`** (Jira Cloud multi-profile + Tempo Cloud).

### Changed

- **BREAKING** for anyone coming from the old scoped package: CLI / global binary is **`mcp-jira-tempo`**. Update MCP configs and `npx` invocations accordingly.
- Global MCP config (`~/.mcp/configs.json`) accepts the **`mcp-jira-tempo`** key for Jira environment blocks, alongside `jira` and `atlassian-jira`.

### Notes

- Older release notes referred to a different package name; history remains in git.
