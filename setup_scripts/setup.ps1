# PowerShell setup script for automated_template project
# Run this after cloning to install Git hooks and configure the environment

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Setting up automated_template..." 
Write-Host ""

# Install Git hooks
Write-Host "Installing Git hooks..." 
& "$ScriptDir\..\.automations\git_hooks\powershell\install-hooks.ps1"
Write-Host ""

Write-Host "Setup complete!"
Write-Host ""
Write-Host "Your repository is now configured with:" 
Write-Host "  - Pre-commit hook to auto-update README file structure"
Write-Host ""
