## ADDED Requirements

### Requirement: Jira profiles can be loaded from a file
The Jira MCP server SHALL support loading named Jira profiles from a JSON file referenced by `ATLASSIAN_PROFILES_FILE`.

#### Scenario: Profile file is configured
- **WHEN** `ATLASSIAN_PROFILES_FILE` points to a valid JSON file containing Jira profile definitions
- **THEN** the server SHALL load those profiles and make them available for Jira request resolution

#### Scenario: File contains a default profile
- **WHEN** the configured profiles file includes a `defaultProfile`
- **THEN** the server SHALL use that file-defined default profile when no explicit request profile is provided and no env override exists

### Requirement: File-based profiles have deterministic precedence
The Jira MCP server SHALL resolve Jira profile sources using a deterministic precedence order so configuration behavior remains predictable.

#### Scenario: File-based profiles are configured
- **WHEN** `ATLASSIAN_PROFILES_FILE` is present and valid
- **THEN** the server SHALL use the profiles loaded from `ATLASSIAN_PROFILES_FILE` before considering legacy single-site credentials

#### Scenario: Env default profile overrides file default profile
- **WHEN** the configured profiles file defines `defaultProfile` and `ATLASSIAN_DEFAULT_PROFILE` is also set
- **THEN** the server SHALL use `ATLASSIAN_DEFAULT_PROFILE` as the effective default profile

### Requirement: Serialized profile JSON is no longer supported
The Jira MCP server SHALL no longer use `ATLASSIAN_PROFILES_JSON` as a supported Jira profile configuration source.

#### Scenario: Serialized profile JSON is configured
- **WHEN** `ATLASSIAN_PROFILES_JSON` is set
- **THEN** the server SHALL reject that configuration with an actionable error instructing the user to migrate to `ATLASSIAN_PROFILES_FILE`

### Requirement: Invalid profile files fail with actionable errors
The Jira MCP server SHALL reject invalid file-based Jira profile configuration with an error that identifies the file-based source as the cause.

#### Scenario: Profile file does not exist
- **WHEN** `ATLASSIAN_PROFILES_FILE` points to a file path that does not exist or cannot be read
- **THEN** the server SHALL fail configuration resolution with an actionable error before making an outbound Jira request

#### Scenario: Profile file contains invalid JSON or invalid shape
- **WHEN** `ATLASSIAN_PROFILES_FILE` points to a file whose contents are not valid JSON or do not contain the expected Jira profile structure
- **THEN** the server SHALL fail configuration resolution with an actionable validation error
