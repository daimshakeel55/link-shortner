$ErrorActionPreference = "SilentlyContinue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Stopping servers on ports 3000-3010..."
3000..3010 | ForEach-Object {
  $port = $_
  netstat -ano | Select-String "LISTENING" | Select-String ":$port " | ForEach-Object {
    if ($_ -match '\s+(\d+)\s*$') {
      $procId = [int]$Matches[1]
      Write-Host "  Killing PID $procId (port $port)"
      taskkill /PID $procId /F | Out-Null
    }
  }
}

Start-Sleep -Seconds 2

Write-Host "Clearing .next cache..."
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue

Write-Host "Building..."
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Starting dev server on http://localhost:3000 ..."
npm run dev
