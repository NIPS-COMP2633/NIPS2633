#!/bin/bash
# Setup script for automated_template project
# Run this after cloning to install Git hooks and configure the environment

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Setting up automated_template..."
echo ""

# Install Git hooks
echo "Installing Git hooks..."
bash "$SCRIPT_DIR/../.automations/git_hooks/bash/install-hooks.sh"
echo ""

echo "Setup complete!"
echo ""
echo "Your repository is now configured with:"
echo "  - Pre-commit hook to auto-update README file structure"
echo ""
echo "============="
