#!/bin/bash

# Create a fresh git history
# This will remove all previous commits and start with a single initial commit

echo "Creating fresh git history..."

# Create a new orphan branch (no history)
git checkout --orphan fresh-start

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit"

# Delete the old main branch
git branch -D main

# Rename current branch to main
git branch -m main

echo "Done! Your repo now has a fresh history."
echo "To push to GitHub, you'll need to force push:"
echo "  git push -f origin main"
echo ""
echo "⚠️  WARNING: This will overwrite the remote history!"
