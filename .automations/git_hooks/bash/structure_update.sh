
#!/bin/bash
# Update README with current file structure

# Get the repository root
REPO_ROOT="$(git rev-parse --show-toplevel)"

tree "$REPO_ROOT" -F | tail -n +2 > /tmp/tree_output.txt
echo '```' > /tmp/tree_final.txt
cat /tmp/tree_output.txt >> /tmp/tree_final.txt
echo '```' >> /tmp/tree_final.txt
sed -i '/<!-- FILE_STRUCTURE_START -->/,/<!-- FILE_STRUCTURE_END -->/{//!d}' "$REPO_ROOT/README.md"
line=$(grep -n "<!-- FILE_STRUCTURE_START -->" "$REPO_ROOT/README.md")
line=$(echo $line | cut -d: -f1)
sed -i "${line}r /tmp/tree_final.txt" "$REPO_ROOT/README.md"