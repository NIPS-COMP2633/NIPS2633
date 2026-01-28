# PowerShell script to install Git hooks for this repository

$ErrorActionPreference = "Stop"

# Get paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = git rev-parse --show-toplevel
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to find git repository root"
    exit 1
}
$HooksDir = Join-Path (Join-Path $RepoRoot ".git") "hooks"

Write-Host "Installing Git hooks..."

# Ensure hooks directory exists
if (-not (Test-Path $HooksDir)) {
    New-Item -ItemType Directory -Path $HooksDir -Force | Out-Null
}

# Copy pre-commit hook
$PreCommitSource = Join-Path $ScriptDir "pre-commit"
$PreCommitDest = Join-Path $HooksDir "pre-commit"

Copy-Item -Path $PreCommitSource -Destination $PreCommitDest -Force

# On Windows, Git hooks need to be executable (Git for Windows handles this)
# But we'll set it explicitly if possible
if (Get-Command bash -ErrorAction SilentlyContinue) {
    bash -c "chmod +x '$($PreCommitDest -replace '\\', '/')'"
}

Write-Host "Pre-commit hook installed" 
Write-Host ""
Write-Host "The README.md file structure will now be updated automatically before each commit."
