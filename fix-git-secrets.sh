#!/bin/bash

# Script to help fix sensitive information in git history
# Created on 27 June 2025

echo "=== Git History Cleanup Script ==="
echo "This script will help you remove sensitive information from your Git history."
echo "IMPORTANT: This will rewrite Git history. Only use on branches you haven't shared yet."
echo "=== ------------------------- ==="
echo ""

read -p "Do you want to proceed? (y/n): " proceed

if [[ $proceed != "y" && $proceed != "Y" ]]; then
  echo "Operation cancelled."
  exit 0
fi

echo "Here are some suggestions to fix the GitHub secrets issue:"
echo ""
echo "Option 1: Use BFG Repo-Cleaner (recommended for large repositories)"
echo "Option 2: Use git-filter-repo (more powerful but requires Python)"
echo "Option 3: Use git filter-branch (native Git command but slower)"
echo ""

read -p "Which option do you want to use? (1/2/3): " option

case $option in
  1)
    echo "=== Using BFG Repo-Cleaner ==="
    
    # Check if BFG is installed
    if ! command -v bfg &> /dev/null; then
      echo "BFG is not installed. Would you like to install it using brew? (y/n): "
      read install_bfg
      
      if [[ $install_bfg == "y" || $install_bfg == "Y" ]]; then
        brew install bfg
      else
        echo "Please install BFG manually and run this script again."
        echo "You can download it from: https://rtyley.github.io/bfg-repo-cleaner/"
        exit 1
      fi
    fi
    
    echo "Creating a text file with secrets to remove..."
    
    cat > secrets.txt << EOF
GOOGLE_CLIENT_ID_PLACEHOLDER
GOOGLE_CLIENT_SECRET_PLACEHOLDER
EOF
    
    echo "Running BFG to remove secrets from Git history..."
    bfg --replace-text secrets.txt
    
    echo "Cleaning up the repository..."
    git reflog expire --expire=now --all && git gc --prune=now --aggressive
    
    echo "Secrets should now be removed from Git history."
    echo "Use 'git push --force' to update the remote repository."
    ;;
    
  2)
    echo "=== Using git-filter-repo ==="
    
    # Check if git-filter-repo is installed
    if ! command -v git-filter-repo &> /dev/null; then
      echo "git-filter-repo is not installed. Would you like to install it using pip? (y/n): "
      read install_filter_repo
      
      if [[ $install_filter_repo == "y" || $install_filter_repo == "Y" ]]; then
        pip install git-filter-repo
      else
        echo "Please install git-filter-repo manually and run this script again."
        echo "You can install it with: pip install git-filter-repo"
        exit 1
      fi
    fi
    
    echo "Creating a Python script to remove secrets..."
    
    cat > remove_secrets.py << EOF
#!/usr/bin/env python3
import re
from git_filter_repo import FilteringOptions, RepoFilter

patterns = [
    rb'YOUR_SENSITIVE_DATA_PATTERN_1',
    rb'YOUR_SENSITIVE_DATA_PATTERN_2',
]

def clean_content(content):
    for pattern in patterns:
        content = re.sub(pattern, b'YOUR_PLACEHOLDER_HERE', content)
    return content

filter = RepoFilter(callback_for_rewrite_blob=clean_content)
filter.run()
EOF
    
    echo "Running git-filter-repo to remove secrets..."
    chmod +x remove_secrets.py
    ./remove_secrets.py
    
    echo "Secrets should now be removed from Git history."
    echo "Use 'git push --force' to update the remote repository."
    ;;
    
  3)
    echo "=== Using git filter-branch ==="
    
    echo "This process might take a while for large repositories..."
    
    git filter-branch --force --index-filter \
      "git ls-files -z | xargs -0 sed -i '' \
        -e 's/YOUR_SENSITIVE_DATA_PATTERN_1/YOUR_PLACEHOLDER_HERE/g' \
        -e 's/YOUR_SENSITIVE_DATA_PATTERN_2/YOUR_PLACEHOLDER_HERE/g'" \
      --prune-empty -- --all
      
    echo "Cleaning up the repository..."
    git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
    git reflog expire --expire=now --all && git gc --prune=now --aggressive
    
    echo "Secrets should now be removed from Git history."
    echo "Use 'git push --force' to update the remote repository."
    ;;
    
  *)
    echo "Invalid option selected."
    exit 1
    ;;
esac

echo ""
echo "Don't forget to:"
echo "1. Verify that the secrets are removed from your Git history"
echo "2. Update your .env file with valid credentials (but don't commit it)"
echo "3. Update your deployment platform (Render.com) with the environment variables"
echo ""
echo "=== Script completed ==="
