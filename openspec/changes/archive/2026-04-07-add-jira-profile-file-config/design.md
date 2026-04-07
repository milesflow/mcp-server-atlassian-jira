## Context

The recently added Jira profile support solves the multi-site problem, but the most visible configuration path for Cursor users still requires embedding escaped JSON in `mcp.json` via `ATLASSIAN_PROFILES_JSON`. That is technically functional but ergonomically poor: it is hard to read, hard to diff, and awkward to update when profiles change.

This change should improve configuration ergonomics by moving profile-based configuration to a file path while preserving the current request-level `profile` selector and the existing legacy single-site fallback.

## Goals / Non-Goals

**Goals:**
- Provide a cleaner way to load Jira profiles when using Cursor or any MCP host that only supports flat env values.
- Replace `ATLASSIAN_PROFILES_JSON` with a cleaner file-based configuration path.
- Keep the current `profile` request contract unchanged.
- Define deterministic precedence between file-based profiles and legacy credentials.
- Produce clear errors when the configured profile file is missing or invalid.

**Non-Goals:**
- Keeping multiple profile-based sources active at the same time.
- Adding YAML/TOML/INI profile formats.
- Adding profile management commands or UI helpers.
- Changing Tempo configuration behavior.

## Decisions

### Replace `ATLASSIAN_PROFILES_JSON` with `ATLASSIAN_PROFILES_FILE`

The server will accept an optional `ATLASSIAN_PROFILES_FILE` environment variable pointing to a JSON file on disk, and the profile-based configuration model will use that file as its only supported source. This gives Cursor users a clean `mcp.json` because they only need to pass a file path instead of a fully escaped JSON object.

Alternatives considered:
- Keep `ATLASSIAN_PROFILES_JSON` alongside the file path: more backward-compatible for recent adopters, but it preserves the ugly Cursor UX and leaves two profile-based sources to support.
- Add many flat env vars per profile: avoids JSON, but naming and scaling become brittle.

### Use a structured file format with `defaultProfile` and `profiles`

The file should contain both the profile map and an optional default profile so it can serve as the single source of truth:

```json
{
  "defaultProfile": "al2ar",
  "profiles": {
    "al2ar": {
      "siteName": "al2ar",
      "userEmail": "user@example.com",
      "apiToken": "..."
    }
  }
}
```

This keeps the file self-contained and easier to share across MCP hosts.

Alternatives considered:
- File contains only the `profiles` map and keeps default profile elsewhere: workable, but less self-contained.

### Preserve env override for the default profile

If both the file and the environment specify a default profile, `ATLASSIAN_DEFAULT_PROFILE` should win. This preserves the existing override pattern and lets users switch the default target without editing the file.

### Keep precedence simple: file-based profiles first, then legacy credentials

When resolving configured profiles, precedence should be:
1. `ATLASSIAN_PROFILES_FILE`
2. Legacy single-site `ATLASSIAN_*`

This keeps the model simple: one modern profile-based source and one legacy fallback source.

### Fail fast on invalid file configuration

If `ATLASSIAN_PROFILES_FILE` is set but the file does not exist, cannot be read, or contains invalid JSON/shape, the server should return an actionable configuration error instead of silently falling back to legacy credentials. Silent fallback would make debugging configuration mistakes much harder.

## Risks / Trade-offs

- File paths may be absolute or relative and could confuse users -> Document path expectations clearly and resolve relative paths predictably.
- Removing `ATLASSIAN_PROFILES_JSON` changes the profile-based configuration contract -> Document migration clearly and keep legacy single-site credentials available.
- Users may put secrets in a file outside their usual secret-management flow -> Recommend keeping the file local and uncommitted.
- Invalid file content can break startup-time expectations -> Fail with explicit validation errors naming the file path.

## Migration Plan

1. Add `ATLASSIAN_PROFILES_FILE` parsing and file validation.
2. Thread file-based profiles into the existing Jira credential resolution path.
3. Remove `ATLASSIAN_PROFILES_JSON` support while preserving `ATLASSIAN_DEFAULT_PROFILE` and legacy `ATLASSIAN_*`.
4. Update docs with a recommended Cursor setup using a separate profiles JSON file.
5. Add tests covering file loading, default profile overrides, invalid file errors, and backward compatibility with legacy single-site credentials.

Rollback strategy:
- Restore the previous profile-loading behavior if file-based configuration proves problematic, or continue using legacy single-site credentials only.

## Open Questions

- Whether relative paths should resolve from the process working directory only, or also support resolution relative to the `.env` file location.
