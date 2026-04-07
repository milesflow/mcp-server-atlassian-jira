# jira-profiles Specification

## Purpose
TBD - created by archiving change add-jira-profiles. Update Purpose after archive.
## Requirements
### Requirement: Jira server supports named profiles
The Jira MCP server SHALL support configuring multiple named Jira profiles, where each profile defines the Jira Cloud site name and the credentials required to authenticate requests for that site.

#### Scenario: Multiple profiles are configured
- **WHEN** the server loads Jira configuration that contains more than one named profile
- **THEN** it SHALL make those profiles available for Jira request resolution within the same server instance

#### Scenario: Default profile is configured
- **WHEN** the server loads a configured default Jira profile name
- **THEN** it SHALL use that profile as the default Jira target for requests that do not specify a profile

### Requirement: Jira tools allow per-request profile selection
Each Jira MCP tool SHALL accept an optional `profile` input that selects which configured Jira profile to use for that request.

#### Scenario: Request specifies a known profile
- **WHEN** a Jira MCP tool call includes a `profile` value that matches a configured Jira profile
- **THEN** the server SHALL execute the request against that profile's Jira site

#### Scenario: Request omits profile and default exists
- **WHEN** a Jira MCP tool call omits `profile`
- **THEN** the server SHALL use the configured default Jira profile if one exists

### Requirement: Legacy single-site configuration remains supported
The Jira MCP server SHALL preserve support for the existing single-site configuration based on `ATLASSIAN_SITE_NAME`, `ATLASSIAN_USER_EMAIL`, and `ATLASSIAN_API_TOKEN`.

#### Scenario: Legacy credentials are the only Jira config
- **WHEN** no Jira profiles are configured and the legacy single-site credentials are present
- **THEN** the server SHALL execute Jira requests using the legacy single-site configuration

#### Scenario: Existing request omits profile under legacy configuration
- **WHEN** a Jira MCP tool call omits `profile` and the server is configured only with legacy single-site credentials
- **THEN** the request SHALL behave the same as it did before profile support was added

### Requirement: Unknown profile errors are actionable
The Jira MCP server SHALL reject requests that specify an unknown Jira profile with an error that clearly identifies the requested profile and indicates that the profile is not configured.

#### Scenario: Request specifies unknown profile
- **WHEN** a Jira MCP tool call includes a `profile` value that does not match any configured Jira profile
- **THEN** the server SHALL fail the request before making an outbound Jira API call

#### Scenario: Unknown profile error is returned
- **WHEN** the server rejects a request because the requested profile is not configured
- **THEN** the error message SHALL include the unknown profile name and guidance to review the Jira profile configuration

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

