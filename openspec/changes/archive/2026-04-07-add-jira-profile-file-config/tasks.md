## 1. File-Based Profile Source

- [x] 1.1 Add support for `ATLASSIAN_PROFILES_FILE` and load a JSON file containing `profiles` and optional `defaultProfile`.
- [x] 1.2 Resolve file paths predictably and fail with actionable errors when the configured file is missing, unreadable, or invalid.
- [x] 1.3 Merge file-derived profile settings into the existing Jira profile resolution flow without breaking legacy single-site behavior.

## 2. Precedence And Compatibility

- [x] 2.1 Implement and document precedence between `ATLASSIAN_PROFILES_FILE` and legacy `ATLASSIAN_*` credentials.
- [x] 2.2 Preserve `ATLASSIAN_DEFAULT_PROFILE` as an override when the file also defines `defaultProfile`.
- [x] 2.3 Remove `ATLASSIAN_PROFILES_JSON` support and return an actionable migration error when it is still configured.

## 3. Docs And Verification

- [x] 3.1 Update `README.md` with a cleaner Cursor configuration example using `ATLASSIAN_PROFILES_FILE`.
- [x] 3.2 Update `.env.example` or related examples to show the recommended file-based setup alongside legacy single-site credentials.
- [x] 3.3 Add tests for valid file loading, default profile overrides, invalid file errors, rejection of `ATLASSIAN_PROFILES_JSON`, and backward compatibility with legacy single-site credentials.
