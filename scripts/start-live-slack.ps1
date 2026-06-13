param(
  [switch]$Help,
  [switch]$UseExistingEnv
)

$ErrorActionPreference = "Stop"

function Show-Usage {
  @"
Usage:
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\start-live-slack.ps1
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\start-live-slack.ps1 -UseExistingEnv

Prompts for Slack tokens, keeps them only in this process, runs:
  npm.cmd run sandbox:doctor -- --strict
  npm.cmd run start

Required Slack token types:
  SLACK_BOT_TOKEN starts with xoxb-
  SLACK_APP_TOKEN starts with xapp-
"@
}

function Convert-SecureStringToPlainText {
  param([Parameter(Mandatory = $true)][securestring]$SecureValue)

  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
  try {
    [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

if ($Help) {
  Show-Usage
  exit 0
}

if (-not $UseExistingEnv) {
  Write-Host "Enter Slack tokens. Input is hidden and tokens are not written to disk."
  $botToken = Convert-SecureStringToPlainText (Read-Host "SLACK_BOT_TOKEN (xoxb-...)" -AsSecureString)
  $appToken = Convert-SecureStringToPlainText (Read-Host "SLACK_APP_TOKEN (xapp-...)" -AsSecureString)

  $env:SLACK_BOT_TOKEN = $botToken
  $env:SLACK_APP_TOKEN = $appToken
}

$env:SIGNALDESK_TRIAGE_MODE = "mcp"
if (-not $env:SIGNALDESK_PERSIST_BRIEFS) {
  $env:SIGNALDESK_PERSIST_BRIEFS = "0"
}

npm.cmd run sandbox:doctor -- --strict
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

npm.cmd run start

