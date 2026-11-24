#!/usr/bin/env bash
set -euo pipefail

jq -e '
  .SchemaVersion as $version |
  select($version != null) |
  [.Results[]?.Vulnerabilities[]? |
    select(.Severity == "CRITICAL" or
      (.Severity == "HIGH" and ((.FixedVersion // "") | length > 0))) |
    {VulnerabilityID, PkgName, InstalledVersion, FixedVersion, Severity}]
' "$1" > "$1.blocking"
cat "$1.blocking"
if [[ "${GITHUB_ACTIONS:-}" == true ]]; then
  jq -r '.[] | "::error title=Trivy::" + ([.VulnerabilityID, .PkgName,
    .InstalledVersion, (.FixedVersion // "sem correção"), .Severity] |
    map(tostring | gsub("[^a-zA-Z0-9._+:~-]"; "_")) | join(" "))' "$1.blocking"
fi
jq -e 'length == 0' "$1.blocking" > /dev/null
