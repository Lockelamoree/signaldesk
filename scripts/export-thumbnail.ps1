param(
  [string]$OutputPath = "docs/thumbnail.png"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
if ([System.IO.Path]::IsPathRooted($OutputPath)) {
  $target = $OutputPath
} else {
  $target = Join-Path $root $OutputPath
}

$targetDir = Split-Path -Parent $target
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

Add-Type -AssemblyName System.Drawing

function New-ColorBrush {
  param([string]$Hex)

  $hexValue = $Hex.TrimStart("#")
  $r = [Convert]::ToInt32($hexValue.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($hexValue.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($hexValue.Substring(4, 2), 16)
  return New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($r, $g, $b))
}

function New-AlphaBrush {
  param([int]$Alpha, [string]$Hex)

  $hexValue = $Hex.TrimStart("#")
  $r = [Convert]::ToInt32($hexValue.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($hexValue.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($hexValue.Substring(4, 2), 16)
  return New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($Alpha, $r, $g, $b))
}

function New-RoundRectPath {
  param([float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$Radius)

  $diameter = $Radius * 2
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-RoundRect {
  param($Graphics, $Brush, [float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$Radius)

  $path = New-RoundRectPath $X $Y $Width $Height $Radius
  $Graphics.FillPath($Brush, $path)
  $path.Dispose()
}

function Stroke-RoundRect {
  param($Graphics, $Pen, [float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$Radius)

  $path = New-RoundRectPath $X $Y $Width $Height $Radius
  $Graphics.DrawPath($Pen, $path)
  $path.Dispose()
}

function Draw-Text {
  param($Graphics, [string]$Text, $Font, $Brush, [float]$X, [float]$Y)

  $Graphics.DrawString($Text, $Font, $Brush, [System.Drawing.PointF]::new($X, $Y))
}

$bitmap = New-Object System.Drawing.Bitmap(1280, 720)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.Color]::FromArgb(244, 246, 248))

$brushes = @()
$pens = @()
function Brush([string]$Hex) {
  $brush = New-ColorBrush $Hex
  $script:brushes += $brush
  return $brush
}
function AlphaBrush([int]$Alpha, [string]$Hex) {
  $brush = New-AlphaBrush $Alpha $Hex
  $script:brushes += $brush
  return $brush
}
function Pen([string]$Hex, [float]$Width = 1) {
  $pen = New-Object System.Drawing.Pen((Brush $Hex).Color, $Width)
  $script:pens += $pen
  return $pen
}

$bg = Brush "#f4f6f8"
$sidebar = Brush "#3f0e40"
$white = Brush "#ffffff"
$accent = Brush "#1264a3"
$green = Brush "#007a5a"
$red = Brush "#e01e5a"
$muted = Brush "#64748b"
$ink = Brush "#111827"
$chip = Brush "#effaf6"
$card = Brush "#f8fafc"
$borderPen = Pen "#d8dee6" 2
$chipPen = Pen "#8bd7bd" 2

$fontTitle = New-Object System.Drawing.Font("Arial", 58, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fontSubtitle = New-Object System.Drawing.Font("Arial", 28, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fontLabel = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fontText = New-Object System.Drawing.Font("Arial", 18, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$fontSmall = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$fontMono = New-Object System.Drawing.Font("Consolas", 18, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

$graphics.FillRectangle($sidebar, 0, 0, 230, 720)
Draw-Text $graphics "Helping Hands" $fontLabel $white 32 36
Fill-RoundRect $graphics $accent 22 116 182 44 8
Draw-Text $graphics "# security-help" $fontSmall $white 42 128
Draw-Text $graphics "# ops" $fontSmall $white 42 190
Draw-Text $graphics "# volunteers" $fontSmall $white 42 234
Draw-Text $graphics "# general" $fontSmall $white 42 278

$graphics.FillRectangle($white, 230, 0, 1050, 720)
Draw-Text $graphics "SignalDesk" $fontTitle $ink 276 22
Draw-Text $graphics "MCP-backed security triage in Slack" $fontSubtitle $muted 278 96
Fill-RoundRect $graphics $chip 862 44 320 50 10
Stroke-RoundRect $graphics $chipPen 862 44 320 50 10
Draw-Text $graphics "Runtime: MCP stdio" $fontMono $green 888 59

$shadow = AlphaBrush 34 "#0f172a"
Fill-RoundRect $graphics $shadow 290 178 800 470 16
Fill-RoundRect $graphics $white 274 158 800 470 16
Stroke-RoundRect $graphics $borderPen 274 158 800 470 16
Fill-RoundRect $graphics $red 274 158 12 470 6

Draw-Text $graphics "SignalDesk: HIGH triage" $fontLabel $ink 318 188
Draw-Text $graphics "Token or OAuth Exposure - fake donor portal link" $fontText $muted 318 226

Fill-RoundRect $graphics $card 318 280 176 82 10
Stroke-RoundRect $graphics $borderPen 318 280 176 82 10
Draw-Text $graphics "Severity" $fontSmall $muted 338 298
Draw-Text $graphics "100/100" $fontLabel $red 338 324

Fill-RoundRect $graphics $card 514 280 224 82 10
Stroke-RoundRect $graphics $borderPen 514 280 224 82 10
Draw-Text $graphics "Evidence" $fontSmall $muted 534 298
Draw-Text $graphics "EV-001..004" $fontMono $ink 534 324

Fill-RoundRect $graphics $card 758 280 260 82 10
Stroke-RoundRect $graphics $borderPen 758 280 260 82 10
Draw-Text $graphics "Detection Checks" $fontSmall $muted 778 298
Draw-Text $graphics "DET-001..005" $fontMono $green 778 324

Draw-Text $graphics "Candidate ATT&CK" $fontLabel $ink 318 389
Draw-Text $graphics "T1566 Phishing - T1528 Token Theft" $fontText $muted 318 424

Draw-Text $graphics "Claim Audit" $fontLabel $ink 318 473
Draw-Text $graphics "CL-004 guardrail: confirm impact with logs" $fontText $muted 318 507

Fill-RoundRect $graphics $green 318 560 188 46 8
Draw-Text $graphics "Create channel" $fontLabel $white 338 573

Fill-RoundRect $graphics $white 526 560 116 46 8
Stroke-RoundRect $graphics $borderPen 526 560 116 46 8
Draw-Text $graphics "Evidence" $fontLabel $ink 552 573

Fill-RoundRect $graphics $white 658 560 138 46 8
Stroke-RoundRect $graphics $borderPen 658 560 138 46 8
Draw-Text $graphics "Detections" $fontLabel $ink 683 573

Fill-RoundRect $graphics $white 812 560 104 46 8
Stroke-RoundRect $graphics $borderPen 812 560 104 46 8
Draw-Text $graphics "Report" $fontLabel $ink 840 573

Fill-RoundRect $graphics $white 924 405 270 150 16
Stroke-RoundRect $graphics $borderPen 924 405 270 150 16
Draw-Text $graphics "Proof in one shot" $fontLabel $ink 950 425
Draw-Text $graphics "Slack Agent for Good" $fontSmall $muted 950 462
Draw-Text $graphics "Readiness 100/100" $fontSmall $muted 950 493
Draw-Text $graphics "Evidence-gated response" $fontSmall $muted 950 524

$bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)

$fontTitle.Dispose()
$fontSubtitle.Dispose()
$fontLabel.Dispose()
$fontText.Dispose()
$fontSmall.Dispose()
$fontMono.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
foreach ($penItem in $pens) { $penItem.Dispose() }
foreach ($brushItem in $brushes) { $brushItem.Dispose() }

$info = Get-Item -LiteralPath $target
Write-Host "Thumbnail PNG written to $($info.FullName) ($($info.Length) bytes)."
