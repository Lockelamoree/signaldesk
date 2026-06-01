# Supply-Chain Notes

## Dependency Decision

Planned packages:

- `@slack/bolt@4.7.2`: official Slack Bolt for JavaScript package, MIT license, repository `slackapi/bolt-js`.
- `@modelcontextprotocol/sdk@1.29.0`: official Model Context Protocol TypeScript SDK package, MIT license, repository `modelcontextprotocol/typescript-sdk`.
- `zod@4.4.3`: schema validation used by the MCP SDK examples, MIT license, repository `colinhacks/zod`.

## Check Result

The preinstall checker was run on June 1, 2026.

- `@slack/bolt@4.7.2`: high-risk flag because package metadata declares a `prepare` lifecycle script. It was not newly published, but script execution remains a supply-chain risk.
- `@modelcontextprotocol/sdk@1.29.0`: no high-risk indicators observed from the checks performed.
- `zod@4.4.3`: medium-risk flag because the package has a single maintainer account.

## Constraint

Install with scripts disabled first:

```powershell
npm.cmd install --package-lock-only --ignore-scripts
npm.cmd ci --ignore-scripts
```

Review the lockfile before public push. Do not install with Slack or OpenAI tokens in the process environment if avoidable.
