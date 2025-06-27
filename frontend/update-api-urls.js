// Helper function to update all fetch calls to use the config API_URL
// This script can be run with Node.js to automatically update all fetch calls in the codebase

const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src');
const importStatement = "import { API_URL } from './config';";
const configImportRegex = /import\s+{\s*API_URL\s*}\s+from\s+['"]\.\/config['"];/;

// Patterns to match and replace
const fetchPatterns = [
    {
        pattern: /fetch\(['"]http:\/\/localhost:8000\/api\/(.*?)['"]/g,
        replacement: "fetch(`${API_URL}/$1`"
    },
    {
        pattern: /fetch\(['"]\/api\/(.*?)['"]/g,
        replacement: "fetch(`${API_URL}/$1`"
    }
];

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            scanDirectory(filePath);
        } else if (stats.isFile() && (file.endsWith('.js') || file.endsWith('.jsx'))) {
            updateFile(filePath);
        }
    });
}

function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Check if file has fetch calls that need replacing
        let needsImport = false;
        fetchPatterns.forEach(({ pattern }) => {
            const hasPattern = pattern.test(content);
            if (hasPattern) {
                needsImport = true;
                console.log(`Found pattern in ${filePath}`);
            }
        });

        // Add import if needed and doesn't already exist
        if (needsImport && !configImportRegex.test(content)) {
            console.log(`Adding import to ${filePath}`);
            // Try to add after other imports
            const lastImportIdx = content.lastIndexOf('import');
            if (lastImportIdx !== -1) {
                const importEndIdx = content.indexOf('\n', lastImportIdx) + 1;
                content = content.slice(0, importEndIdx) + importStatement + '\n' + content.slice(importEndIdx);
                modified = true;
            } else {
                // Add at the beginning if no other imports
                content = importStatement + '\n' + content;
                modified = true;
            }
        }

        // Replace fetch calls
        fetchPatterns.forEach(({ pattern, replacement }) => {
            // Use a callback to track replacements since we need a global regex
            const matches = [];
            content.replace(pattern, (match) => {
                matches.push(match);
                return match;
            });

            if (matches.length > 0) {
                console.log(`Found ${matches.length} matches in ${filePath}`);
                const newContent = content.replace(pattern, replacement);
                if (newContent !== content) {
                    content = newContent;
                    modified = true;
                    console.log(`Replaced fetch calls in ${filePath}`);
                }
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated and saved: ${filePath}`);
        } else {
            console.log(`No changes needed for: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

console.log('Starting API URL updates...');
scanDirectory(srcDir);
console.log('Finished updating API URLs in fetch calls.');
