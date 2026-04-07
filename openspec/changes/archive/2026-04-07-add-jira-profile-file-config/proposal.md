## Why

The current profile setup works, but passing `ATLASSIAN_PROFILES_JSON` as an escaped JSON string inside `Cursor`'s `mcp.json` is hard to read, edit, and maintain. Replacing that path with a file-based profile source would make multi-site Jira configuration cleaner and easier to support in real-world Cursor setups.

## What Changes

- Add support for loading Jira profiles from a file path via `ATLASSIAN_PROFILES_FILE`.
- Remove `ATLASSIAN_PROFILES_JSON` from the supported Jira profile configuration paths.
- Keep legacy single-site `ATLASSIAN_*` variables as the backward-compatible fallback path.
- Define precedence rules between file-based profiles and legacy single-site credentials.
- Document the cleaner `Cursor`/MCP setup flow using a separate profiles file.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `jira-profiles`: Replace serialized env-based profile configuration with file-based profile loading while preserving legacy single-site credentials.

## Impact

- Jira configuration loading in `src/utils/config.util.ts`.
- Jira credential resolution in `src/utils/transport.util.ts`.
- User-facing setup docs in `README.md` and `.env.example`.
- Tests for file parsing, removal of serialized profile JSON support, and backward compatibility with legacy single-site credentials.
