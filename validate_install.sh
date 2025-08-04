#!/bin/bash

# FivemAC Installation Validator
# Checks if the resource is properly installed

echo "🔍 FivemAC Installation Validator"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "fxmanifest.lua" ]; then
    echo -e "${RED}❌ Error: fxmanifest.lua not found. Are you in the resource directory?${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found fxmanifest.lua${NC}"

# Check required files
required_files=(
    "config.json"
    "client/client.lua"
    "server/server.lua"
    "ui/index.html"
    "ui/admin.js"
    "ui/logs.js"
    "ui/styles.css"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ Found $file${NC}"
    else
        echo -e "${RED}❌ Missing $file${NC}"
        missing_files+=("$file")
    fi
done

# Check config.json syntax
if [ -f "config.json" ]; then
    if python3 -m json.tool config.json > /dev/null 2>&1; then
        echo -e "${GREEN}✅ config.json syntax is valid${NC}"
    else
        echo -e "${YELLOW}⚠️  config.json syntax might be invalid${NC}"
    fi
fi

# Summary
if [ ${#missing_files[@]} -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All required files are present!${NC}"
    echo ""
    echo "📝 Next steps:"
    echo "1. Edit config.json with your Discord webhook and database settings"
    echo "2. Add 'ensure fivem-ac' to your server.cfg"
    echo "3. Ensure oxmysql is loaded before fivem-ac if using database"
    echo "4. Set up admin permissions in server.cfg"
    echo ""
    echo "Example server.cfg entries:"
    echo "ensure oxmysql"
    echo "ensure fivem-ac"
    echo "add_ace group.admin fivemac.admin allow"
else
    echo ""
    echo -e "${RED}❌ Missing ${#missing_files[@]} required files:${NC}"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "Please ensure all files are properly installed."
fi