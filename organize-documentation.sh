#!/bin/zsh
# Documentation Organization Script
# This script helps maintain documentation organization by moving Markdown files to the project-documentation folder

# Ensure the project-documentation folder exists
mkdir -p project-documentation

# Function to move a file to the documentation folder with a new name if needed
move_doc_file() {
  local source_file=$1
  local target_name=${2:-$(basename "$source_file")}
  
  if [[ "$source_file" != "README.md" && "$source_file" != "project-documentation/"* ]]; then
    echo "Moving $source_file to project-documentation/$target_name"
    cp "$source_file" "project-documentation/$target_name"
    # Comment out the removal to keep a copy in the original location if needed
    # rm "$source_file"
  fi
}

# Move all Markdown files in the root directory (except README.md)
for file in *.md; do
  if [[ "$file" != "README.md" ]]; then
    move_doc_file "$file"
  fi
done

# Find and move any Markdown files in the frontend directory
for file in frontend/*.md; do
  if [[ -f "$file" && "$file" != "frontend/README.md" ]]; then
    move_doc_file "$file" "FRONTEND_$(basename "$file")"
  fi
done

# Find and move any Markdown files in the backend directory
for file in backend/*.md; do
  if [[ -f "$file" ]]; then
    move_doc_file "$file" "BACKEND_$(basename "$file")"
  fi
done

# Special handling for the frontend README
if [[ -f "frontend/README.md" && ! -f "project-documentation/FRONTEND_README.md" ]]; then
  move_doc_file "frontend/README.md" "FRONTEND_README.md"
fi

# Special handling for the backend README
if [[ -f "backend/README.md" && ! -f "project-documentation/BACKEND_README.md" ]]; then
  move_doc_file "backend/README.md" "BACKEND_README.md"
fi

echo "Documentation organization complete."
echo "Remember to update the TABLE_OF_CONTENTS.md file if you've added new documentation."
