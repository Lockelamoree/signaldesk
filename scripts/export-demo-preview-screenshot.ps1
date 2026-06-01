param(
  [string]$HtmlPath = "docs/demo-preview.html",
  [string]$OutputPath = "docs/demo-preview.png",
  [int]$Width = 1440,
  [int]$Height = 1000
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

function Resolve-RepoPath {
  param([string]$PathValue)

  if ([System.IO.Path]::IsPathRooted($PathValue)) {
    return $PathValue
  }

  return Join-Path $root $PathValue
}

$htmlFullPath = Resolve-RepoPath $HtmlPath
$outputFullPath = Resolve-RepoPath $OutputPath
$outputDir = Split-Path -Parent $outputFullPath

if (-not (Test-Path -LiteralPath $htmlFullPath)) {
  throw "HTML preview not found: $htmlFullPath"
}

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$browserCandidates = @(
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

if (-not $browserCandidates.Length) {
  throw "No Chrome or Edge executable found for headless screenshot export."
}

$htmlUri = [System.Uri]::new($htmlFullPath).AbsoluteUri
$screenshotArg = "--screenshot=$outputFullPath"
$sizeArg = "--window-size=$Width,$Height"

if (Test-Path -LiteralPath $outputFullPath) {
  Remove-Item -LiteralPath $outputFullPath -Force
}

$success = $false
$errors = @()

foreach ($browser in $browserCandidates) {
  $userDataDir = Join-Path $env:TEMP ("signaldesk-preview-" + [System.Guid]::NewGuid().ToString("N"))
  $arguments = @(
    "--headless=new",
    "--disable-gpu",
    "--disable-gpu-compositing",
    "--disable-software-rasterizer",
    "--disable-dev-shm-usage",
    "--disable-features=VizDisplayCompositor",
    "--run-all-compositor-stages-before-draw",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-extensions",
    "--user-data-dir=$userDataDir",
    $sizeArg,
    $screenshotArg,
    $htmlUri
  )

  try {
    & $browser @arguments | Out-Null
    if (Test-Path -LiteralPath $outputFullPath) {
      $success = $true
      break
    }
    $errors += "$browser exited without creating a screenshot."
  } catch {
    $errors += "$browser failed: $($_.Exception.Message)"
  } finally {
    if (Test-Path -LiteralPath $userDataDir) {
      Remove-Item -LiteralPath $userDataDir -Recurse -Force
    }
  }
}

if (-not $success) {
  Write-Warning "Headless browser screenshot failed. Rendering deterministic storyboard fallback. Attempts: $($errors -join ' / ')"

  Add-Type -AssemblyName System.Drawing

  function New-Brush {
    param([string]$Hex)

    $hexValue = $Hex.TrimStart("#")
    $r = [Convert]::ToInt32($hexValue.Substring(0, 2), 16)
    $g = [Convert]::ToInt32($hexValue.Substring(2, 2), 16)
    $b = [Convert]::ToInt32($hexValue.Substring(4, 2), 16)
    return New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($r, $g, $b))
  }

  function New-Pen {
    param([string]$Hex, [float]$Width = 1)

    $brush = New-Brush $Hex
    $pen = New-Object System.Drawing.Pen($brush.Color, $Width)
    $brush.Dispose()
    return $pen
  }

  function New-RoundPath {
    param([float]$X, [float]$Y, [float]$W, [float]$H, [float]$R)

    $d = $R * 2
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($X, $Y, $d, $d, 180, 90)
    $path.AddArc($X + $W - $d, $Y, $d, $d, 270, 90)
    $path.AddArc($X + $W - $d, $Y + $H - $d, $d, $d, 0, 90)
    $path.AddArc($X, $Y + $H - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
  }

  function Fill-Round {
    param($Graphics, $Brush, [float]$X, [float]$Y, [float]$W, [float]$H, [float]$R)

    $path = New-RoundPath $X $Y $W $H $R
    $Graphics.FillPath($Brush, $path)
    $path.Dispose()
  }

  function Stroke-Round {
    param($Graphics, $Pen, [float]$X, [float]$Y, [float]$W, [float]$H, [float]$R)

    $path = New-RoundPath $X $Y $W $H $R
    $Graphics.DrawPath($Pen, $path)
    $path.Dispose()
  }

  function Text {
    param($Graphics, [string]$Value, $Font, $Brush, [float]$X, [float]$Y)

    $Graphics.DrawString($Value, $Font, $Brush, [System.Drawing.PointF]::new($X, $Y))
  }

  $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $white = New-Brush "#ffffff"
  $sidebar = New-Brush "#3f0e40"
  $channel = New-Brush "#f8f8f8"
  $accent = New-Brush "#1264a3"
  $green = New-Brush "#007a5a"
  $red = New-Brush "#e01e5a"
  $muted = New-Brush "#616061"
  $ink = New-Brush "#1d1c1d"
  $panelBg = New-Brush "#f7f7f7"
  $briefBg = New-Brush "#ffffff"
  $soft = New-Brush "#f6f6f6"
  $linePen = New-Pen "#d6d3d6" 1
  $redPen = New-Pen "#e01e5a" 4
  $fontTitle = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $fontHeader = New-Object System.Drawing.Font("Arial", 18, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $fontLabel = New-Object System.Drawing.Font("Arial", 15, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $fontText = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $fontSmall = New-Object System.Drawing.Font("Arial", 12, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $fontMono = New-Object System.Drawing.Font("Consolas", 13, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)

  try {
    $graphics.Clear([System.Drawing.Color]::FromArgb(232, 232, 232))
    $graphics.FillRectangle($sidebar, 0, 0, 250, $Height)
    Text $graphics "Helping Hands Org" $fontHeader $white 18 20
    Text $graphics "# general" $fontText $white 28 75
    Fill-Round $graphics $accent 16 105 210 34 6
    Text $graphics "# security-help" $fontText $white 28 114
    Text $graphics "# ops" $fontText $white 28 157
    Text $graphics "# volunteer-support" $fontText $white 28 199

    $graphics.FillRectangle($white, 250, 0, 830, $Height)
    $graphics.FillRectangle($panelBg, 1080, 0, 360, $Height)
    Text $graphics "# security-help" $fontHeader $ink 275 18
    Text $graphics "Nonprofit operations team - synthetic demo data - storyboard preview" $fontSmall $muted 275 47
    Fill-Round $graphics (New-Brush "#effaf6") 844 18 205 30 6
    Text $graphics "MCP + Block Kit" $fontSmall (New-Brush "#0b684f") 862 27
    $graphics.DrawLine($linePen, 250, 68, 1080, 68)

    Text $graphics "Max  10:14 AM" $fontLabel $ink 325 100
    Fill-Round $graphics $channel 325 128 690 72 8
    Text $graphics "/signaldesk demo" $fontMono $ink 345 143
    Text $graphics "Canonical synthetic OAuth phishing fixture" $fontMono $ink 345 166

    Fill-Round $graphics $briefBg 325 235 700 610 8
    Stroke-Round $graphics $linePen 325 235 700 610 8
    $graphics.DrawLine($redPen, 327, 240, 327, 840)
    Text $graphics "SignalDesk: HIGH triage" $fontHeader $ink 350 258
    Text $graphics "HIGH confidence triage for Token or OAuth Exposure; extracted 1 URL(s), 1 IP address(es)." $fontText $ink 350 292

    $fieldY = 332
    $labels = @(
      @("Scenario", "Token or OAuth Exposure"),
      @("Severity", "100/100"),
      @("Runtime", "MCP stdio"),
      @("Suggested Channel", "#inc-token-exposure")
    )
    for ($i = 0; $i -lt $labels.Length; $i++) {
      $x = 350 + ($i * 160)
      Fill-Round $graphics $soft $x $fieldY 145 62 6
      Stroke-Round $graphics $linePen $x $fieldY 145 62 6
      Text $graphics $labels[$i][0] $fontSmall $ink ($x + 10) ($fieldY + 9)
      Text $graphics $labels[$i][1] $fontSmall $muted ($x + 10) ($fieldY + 32)
    }

    $y = 425
    Text $graphics "Evidence IDs" $fontLabel $ink 350 $y
    Text $graphics "EV-001 source_report  EV-002 indicator_ips  EV-003 indicator_domains  EV-004 indicator_urls" $fontText $muted 350 ($y + 25)
    $y += 70
    Text $graphics "Detection Checks" $fontLabel $ink 350 $y
    Text $graphics "DET-001 Slack source  DET-002 identity sign-in  DET-004 DNS/proxy sweep" $fontText $muted 350 ($y + 25)
    $y += 70
    Text $graphics "First-Response Readiness" $fontLabel $ink 350 $y
    Text $graphics "100/100 strong readiness from evidence, detections, roles, guardrails, and Slack coordination." $fontText $muted 350 ($y + 25)
    Text $graphics "Live impact still requires responders to validate logs and execute containment." $fontText $muted 350 ($y + 48)
    $y += 95
    Text $graphics "Next Actions" $fontLabel $ink 350 $y
    Text $graphics "- Revoke or rotate exposed tokens if confirmed." $fontText $muted 350 ($y + 25)
    Text $graphics "- Preserve message, thread, timestamps, user IDs, and clicked links." $fontText $muted 350 ($y + 48)
    Text $graphics "- Create an incident channel and assign owner, comms lead, and evidence lead." $fontText $muted 350 ($y + 71)

    Fill-Round $graphics $green 350 780 130 36 6
    Text $graphics "Create channel" $fontLabel $white 368 789
    Fill-Round $graphics $white 495 780 100 36 6
    Stroke-Round $graphics $linePen 495 780 100 36 6
    Text $graphics "Evidence" $fontLabel $ink 515 789
    Fill-Round $graphics $white 610 780 110 36 6
    Stroke-Round $graphics $linePen 610 780 110 36 6
    Text $graphics "Detections" $fontLabel $ink 625 789
    Fill-Round $graphics $white 735 780 90 36 6
    Stroke-Round $graphics $linePen 735 780 90 36 6
    Text $graphics "Report" $fontLabel $ink 754 789

    Fill-Round $graphics $white 1102 24 310 112 8
    Stroke-Round $graphics $linePen 1102 24 310 112 8
    Text $graphics "Demo Proof Moments" $fontLabel $ink 1120 44
    Text $graphics "Show Slack triage, channel creation," $fontSmall $muted 1120 72
    Text $graphics "readiness, evidence, detections, report," $fontSmall $muted 1120 92
    Text $graphics "and MCP smoke output." $fontSmall $muted 1120 112

    Fill-Round $graphics $white 1102 158 310 164 8
    Stroke-Round $graphics $linePen 1102 158 310 164 8
    Text $graphics "MCP Tools" $fontLabel $ink 1120 178
    Text $graphics "triage_slack_alert" $fontMono $ink 1120 207
    Text $graphics "build_response_checklist" $fontMono $ink 1120 229
    Text $graphics "build_impact_summary" $fontMono $ink 1120 251
    Text $graphics "build_detection_plan" $fontMono $ink 1120 273
    Text $graphics "generate_incident_report" $fontMono $ink 1120 295

    Fill-Round $graphics $white 1102 344 310 135 8
    Stroke-Round $graphics $linePen 1102 344 310 135 8
    Text $graphics "Guardrail" $fontLabel $ink 1120 364
    Text $graphics "Candidate findings only." $fontSmall $muted 1120 392
    Text $graphics "No compromise or impact claims" $fontSmall $muted 1120 414
    Text $graphics "until logs validate them." $fontSmall $muted 1120 436

    Fill-Round $graphics $white 1102 500 310 112 8
    Stroke-Round $graphics $linePen 1102 500 310 112 8
    Text $graphics "Submission Track" $fontLabel $ink 1120 520
    Text $graphics "Slack Agent for Good" $fontSmall $muted 1120 550
    Text $graphics "Safe first 15 minutes for" $fontSmall $muted 1120 572
    Text $graphics "teams without a full SOC." $fontSmall $muted 1120 594

    $bitmap.Save($outputFullPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $graphics.Dispose()
    $bitmap.Dispose()
    foreach ($resource in @($white, $sidebar, $channel, $accent, $green, $red, $muted, $ink, $panelBg, $briefBg, $soft, $linePen, $redPen, $fontTitle, $fontHeader, $fontLabel, $fontText, $fontSmall, $fontMono)) {
      if ($resource) { $resource.Dispose() }
    }
  }
}

$info = Get-Item -LiteralPath $outputFullPath
Write-Host "Demo preview screenshot written to $($info.FullName) ($($info.Length) bytes)."
