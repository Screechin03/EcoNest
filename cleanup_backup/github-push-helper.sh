#!/bin/zsh

# Script to help push to GitHub despite secret detection
# Created: 27 June 2025

echo "=====================================================
GITHUB PUSH HELPER
=====================================================
"

echo "This script will help you push to GitHub despite secret detection."
echo ""

# Option 1: Allow the secrets in GitHub
echo "OPTION 1: ALLOW THE SECRETS (RECOMMENDED)"
echo "---------------------------------------"
echo "Visit these URLs to allow the detected secrets:"
echo ""
echo "1. https://github.com/Screechin03/EcoNest/security/secret-scanning/unblock-secret/2z5XeI7JmRNoZp7wPI8UZrjHece"
echo "2. https://github.com/Screechin03/EcoNest/security/secret-scanning/unblock-secret/2z5VyvxvCTxt5cb107x3YQ7GViy"
echo "3. https://github.com/Screechin03/EcoNest/security/secret-scanning/unblock-secret/2z5XeNIj9ZD5z0OHdMMMqANpGro"
echo "4. https://github.com/Screechin03/EcoNest/security/secret-scanning/unblock-secret/2z5VyxMQV6RgrEmpO0rPmirtb6f"
echo ""
echo "After allowing these secrets, you can push normally with:"
echo "git push origin main"
echo ""

# Option 2: Create a new repository and push there
echo "OPTION 2: PUSH TO NEW REPOSITORY"
echo "---------------------------------------"
echo "If you can't allow the secrets, you can create a new repository and push there:"
echo ""
echo "1. Create a new empty repository on GitHub"
echo "2. Add the new repository as a remote:"
echo "   git remote add newrepo https://github.com/YourUsername/NewRepoName.git"
echo "3. Push to the new repository:"
echo "   git push newrepo main"
echo ""

# Option 3: Force push branch by branch
echo "OPTION 3: FORCE PUSH CURRENT CHANGES ONLY"
echo "---------------------------------------"
echo "This will push only your current state, losing history:"
echo ""
echo "1. Create a new branch with only the current state:"
echo "   git checkout --orphan temp-branch"
echo "   git add -A"
echo "   git commit -m \"Initial commit\""
echo "2. Delete the main branch and rename the new one:"
echo "   git branch -D main"
echo "   git branch -m main"
echo "3. Force push to GitHub:"
echo "   git push -f origin main"
echo ""

# Ask which option to execute
echo "Which option would you like to execute? (1/2/3 or q to quit)"
read choice

case $choice in
  1)
    echo "Remember to visit the URLs above to allow the secrets."
    echo "After that, run: git push origin main"
    ;;
  2)
    echo "Enter the URL of your new repository (e.g., https://github.com/YourUsername/NewRepoName.git):"
    read new_repo_url
    git remote add newrepo $new_repo_url
    echo "Now run: git push newrepo main"
    ;;
  3)
    echo "Warning: This will permanently lose your Git history."
    echo "Are you sure you want to continue? (y/n)"
    read confirm
    if [[ $confirm == "y" ]]; then
      # Create an orphan branch
      git checkout --orphan temp-branch
      # Add all files
      git add -A
      # Commit
      git commit -m "Initial commit"
      # Delete the main branch
      git branch -D main
      # Rename the current branch to main
      git branch -m main
      # Force push
      git push -f origin main
      echo "Force push completed. Your repository now has only one commit."
    else
      echo "Operation cancelled."
    fi
    ;;
  q)
    echo "Exiting without changes."
    ;;
  *)
    echo "Invalid option selected."
    ;;
esac

echo ""
echo "=====================================================
IMPORTANT SECURITY REMINDER
=====================================================
"
echo "Remember to revoke and regenerate your Google OAuth credentials:"
echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
echo "2. Navigate to APIs & Services > Credentials"
echo "3. Delete the existing credentials and create new ones"
echo "4. Update your .env file and deployment environment variables"
echo ""
echo "Never commit credentials to Git repositories!"
