# PowerShell script to update README with current file structure

$ErrorActionPreference = "Stop"

# Get the repository root using git
$RepoRoot = git rev-parse --show-toplevel
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to find git repository root"
    exit 1
}

# Generate tree output
$TempTreeFile = Join-Path $env:TEMP "tree_output.txt"
$TempFinalFile = Join-Path $env:TEMP "tree_final.txt"

# Use tree command if available, otherwise use PowerShell alternative
Push-Location $RepoRoot
try {
    # Windows tree command (different output format than Unix)
    tree /F /A | Select-Object -Skip 2 | Out-File -FilePath $TempTreeFile -Encoding utf8
} finally {
    Pop-Location
}

# Wrap in code block
"``````" | Out-File -FilePath $TempFinalFile -Encoding utf8
Get-Content $TempTreeFile | Out-File -FilePath $TempFinalFile -Append -Encoding utf8
"``````" | Out-File -FilePath $TempFinalFile -Append -Encoding utf8

# Read README
$ReadmePath = Join-Path $RepoRoot "README.md"
$ReadmeContent = Get-Content $ReadmePath -Raw

# Find the markers
$StartMarker = "<!-- FILE_STRUCTURE_START -->"
$EndMarker = "<!-- FILE_STRUCTURE_END -->"

if ($ReadmeContent -match "(?s)($StartMarker).*?($EndMarker)") {
    # Get the new tree content
    $TreeContent = Get-Content $TempFinalFile -Raw
    
    # Replace the content between markers
    $UpdatedContent = $ReadmeContent -replace "(?s)($StartMarker).*?($EndMarker)", "`$1`n$TreeContent`$2"
    
    # Write back to README
    $UpdatedContent | Out-File -FilePath $ReadmePath -Encoding utf8 -NoNewline
    
    Write-Host "README.md file structure updated successfully"
} else {
    Write-Warning "Could not find FILE_STRUCTURE_START and FILE_STRUCTURE_END markers in README.md"
}

# Cleanup temp files
Remove-Item $TempTreeFile -ErrorAction SilentlyContinue
Remove-Item $TempFinalFile -ErrorAction SilentlyContinue
