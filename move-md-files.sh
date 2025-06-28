#!/bin/bash
# Move Markdown files to project-documentation folder

# Create the project-documentation folder if it doesn't exist
mkdir -p /Users/screechin_03/EcoNest/project-documentation

# List of Markdown files to move
MD_FILES=(
  "BOOKING_OVERLAY_FEATURE.md"
  "CONTACT_FEATURE_CHANGELOG.md"
  "CONTACT_PAGE_IMPLEMENTATION.md"
  "DEPLOYMENT.md"
  "DEPLOYMENT_FIX.md"
  "DEPLOYMENT_SUMMARY.md"
  "DEVELOPER_GUIDE.md"
  "DYNAMIC_CITIES_AND_REVIEWS_COMPLETION.md"
  "EMAIL_ENHANCEMENT_SUMMARY.md"
  "EMAIL_SYSTEM_STATUS.md"
  "ENHANCEMENT_SUMMARY.md"
  "GOOGLE_OAUTH_REMOVED.md"
  "HOMEPAGE_COMPLETION_SUMMARY.md"
  "HOST_PROPERTIES_AND_REVIEWS_ENHANCEMENT.md"
  "IMPLEMENTATION_SUMMARY.md"
  "MULTIPLE_ROOM_BOOKING_FIX.md"
  "PROJECT_DESCRIPTION.md"
  "REPOSITORY_CLEANUP.md"
  "SEARCH_FILTER_ENHANCEMENT.md"
  "SECRETS_MANAGEMENT_GUIDE.md"
  "TEST_PLAN.md"
)

# README.md should stay in the root directory for GitHub
# We'll make a copy of it in the documentation folder
cp /Users/screechin_03/EcoNest/README.md /Users/screechin_03/EcoNest/project-documentation/

# Move each file to the project-documentation folder
for file in "${MD_FILES[@]}"; do
  if [ "$file" != "README.md" ]; then
    echo "Moving $file to project-documentation folder"
    mv "/Users/screechin_03/EcoNest/$file" "/Users/screechin_03/EcoNest/project-documentation/"
  fi
done

echo "All Markdown files have been moved to project-documentation folder"
echo "README.md has been copied to project-documentation and kept in the root directory"

# Create a table of contents file
echo "Creating table of contents file..."
echo "# Boulevard Documentation" > /Users/screechin_03/EcoNest/project-documentation/TABLE_OF_CONTENTS.md
echo "" >> /Users/screechin_03/EcoNest/project-documentation/TABLE_OF_CONTENTS.md
echo "This directory contains all documentation for the Boulevard (formerly EcoNest) project." >> /Users/screechin_03/EcoNest/project-documentation/TABLE_OF_CONTENTS.md
echo "" >> /Users/screechin_03/EcoNest/project-documentation/TABLE_OF_CONTENTS.md
echo "## Contents" >> /Users/screechin_03/EcoNest/project-documentation/TABLE_OF_CONTENTS.md
echo "" >> /Users/screechin_03/EcoNest/project-documentation/TABLE_OF_CONTENTS.md

# Add each file to the table of contents
for file in $(ls -1 /Users/screechin_03/EcoNest/project-documentation/*.md | sort); do
  filename=$(basename "$file")
  if [ "$filename" != "TABLE_OF_CONTENTS.md" ]; then
    # Extract the title from the file (first line that starts with #)
    title=$(grep -m 1 "^# " "$file" | sed 's/^# //')
    if [ -z "$title" ]; then
      title=${filename%.md}
    fi
    echo "- [${title}](${filename})" >> /Users/screechin_03/EcoNest/project-documentation/TABLE_OF_CONTENTS.md
  fi
done

echo "Table of contents created at project-documentation/TABLE_OF_CONTENTS.md"
