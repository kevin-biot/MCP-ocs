#!/bin/bash
# 
# MCP-ocs Script Cleanup - Organize Your Chaos
# Run this to clean up your scattered shell scripts

echo "🚀 MCP-ocs Script Organization Cleanup"
echo "===================================="

# Change to project directory
cd /Users/kevinbrown/MCP-ocs

echo "📁 Working in: $(pwd)"

# Create clean directory structure
echo ""
echo "🏗️ Creating organized directory structure..."
mkdir -p scripts/{build,test,deploy,dev,utils,ci}

# Move existing scripts to their appropriate locations
echo ""
echo "📂 Organizing existing scripts..."

# Build scripts - Move all build-related files
if [ -f "build-and-test-scale-down.sh" ]; then
    mv build-and-test-scale-down.sh scripts/build/
    echo "✅ Moved build-and-test-scale-down.sh"
fi

if [ -f "build-and-test-v2.sh" ]; then
    mv build-and-test-v2.sh scripts/build/
    echo "✅ Moved build-and-test-v2.sh"
fi

if [ -f "quick-build.sh" ]; then
    mv quick-build.sh scripts/build/
    echo "✅ Moved quick-build.sh"
fi

if [ -f "final-build.sh" ]; then
    mv final-build.sh scripts/build/
    echo "✅ Moved final-build.sh"
fi

if [ -f "test-build.sh" ]; then
    mv test-build.sh scripts/build/
    echo "✅ Moved test-build.sh"
fi

if [ -f "validate-and-build.sh" ]; then
    mv validate-and-build.sh scripts/build/
    echo "✅ Moved validate-and-build.sh"
fi

if [ -f "final-build-and-commit.sh" ]; then
    mv final-build-and-commit.sh scripts/build/
    echo "✅ Moved final-build-and-commit.sh"
fi

if [ -f "quick-build-and-test.sh" ]; then
    mv quick-build-and-test.sh scripts/build/
    echo "✅ Moved quick-build-and-test.sh"
fi

# Test scripts - Move all test-related files
if [ -f "quick-test.sh" ]; then
    mv quick-test.sh scripts/test/
    echo "✅ Moved quick-test.sh"
fi

if [ -f "final-test.sh" ]; then
    mv final-test.sh scripts/test/
    echo "✅ Moved final-test.sh"
fi

# Commit scripts - Move all commit-related files
if [ -f "commit-skeleton.sh" ]; then
    mv commit-skeleton.sh scripts/utils/
    echo "✅ Moved commit-skeleton.sh"
fi

if [ -f "commit-knowledge-seeding.sh" ]; then
    mv commit-knowledge-seeding.sh scripts/utils/
    echo "✅ Moved commit-knowledge-seeding.sh"
fi

if [ -f "commit-production.sh" ]; then
    mv commit-production.sh scripts/utils/
    echo "✅ Moved commit-production.sh"
fi

if [ -f "commit-scale-down-enhancement.sh" ]; then
    mv commit-scale-down-enhancement.sh scripts/utils/
    echo "✅ Moved commit-scale-down-enhancement.sh"
fi

if [ -f "commit-production-enhanced.sh" ]; then
    mv commit-production-enhanced.sh scripts/utils/
    echo "✅ Moved commit-production-enhanced.sh"
fi

if [ -f "commit-mcp-development-guide.sh" ]; then
    mv commit-mcp-development-guide.sh scripts/utils/
    echo "✅ Moved commit-mcp-development-guide.sh"
fi

echo ""
echo "✅ Script organization process completed!"

# Create clean, standardized scripts
echo ""
echo "📝 Creating clean, standardized scripts..."

# Build scripts directory
mkdir -p scripts/build

cat > scripts/build/build.sh << 'EOF'
#!/bin/bash
# 
# Main build process for MCP-ocs project
# Usage: ./scripts/build/build.sh

echo "🏗️ Building MCP-ocs..."
cd /Users/kevinbrown/MCP-ocs

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Type checking
echo "🔍 Running TypeScript type checking..."
npm run typecheck

# Build project
echo "🏗️ Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📦 Build artifacts available in: dist/"
else
    echo "❌ Build failed!"
    exit 1
fi
EOF

# Quick build script
cat > scripts/build/quick-build.sh << 'EOF'
#!/bin/bash
# 
# Quick development build for MCP-ocs project
# Usage: ./scripts/build/quick-build.sh

echo "🔨 Quick build for development..."
cd /Users/kevinbrown/MCP-ocs
npm run build -- --watch
EOF

# Test scripts directory
mkdir -p scripts/test

cat > scripts/test/unit-tests.sh << 'EOF'
#!/bin/bash
# 
# Run unit tests for MCP-ocs project
# Usage: ./scripts/test/unit-tests.sh

echo "🧪 Running unit tests..."
cd /Users/kevinbrown/MCP-ocs
npm run test:unit -- --coverage
EOF

cat > scripts/test/integration-tests.sh << 'EOF'
#!/bin/bash
# 
# Run integration tests for MCP-ocs project  
# Usage: ./scripts/test/integration-tests.sh

echo "🧪 Running integration tests..."
cd /Users/kevinbrown/MCP-ocs
npm run test:integration
EOF

cat > scripts/test/security-tests.sh << 'EOF'
#!/bin/bash
# 
# Run security tests for MCP-ocs project
# Usage: ./scripts/test/security-tests.sh

echo "🛡️ Running security tests..."
cd /Users/kevinbrown/MCP-ocs
npm run test:security
EOF

# Utility scripts directory
mkdir -p scripts/utils

cat > scripts/utils/commit.sh << 'EOF'
#!/bin/bash
# 
# Commit script for MCP-ocs project with validation
# Usage: ./scripts/utils/commit.sh "Commit message"

echo "🚀 Committing changes..."
cd /Users/kevinbrown/MCP-ocs

# Add all changes
git add .

# Commit with message if provided
if [ -n "$1" ]; then
    git commit -m "$1"
    echo "✅ Committed with message: $1"
else
    git commit -m "chore: Automated commit"
    echo "✅ Committed with default message"
fi
EOF

# Make all new scripts executable
chmod +x scripts/build/*.sh
chmod +x scripts/test/*.sh
chmod +x scripts/utils/*.sh

echo ""
echo "✅ All new scripts made executable!"

# Create documentation
cat > scripts/README.md << 'EOF'
# MCP-ocs Script Organization

## Build Scripts
- `build/build.sh` - Main project build with validation
- `build/quick-build.sh` - Fast development build

## Test Scripts  
- `test/unit-tests.sh` - Unit tests with coverage
- `test/integration-tests.sh` - Integration tests
- `test/security-tests.sh` - Security validation tests

## Utility Scripts
- `utils/commit.sh` - Commit with basic validation

## Usage Examples

```bash
# Build project
./scripts/build/build.sh

# Run unit tests
./scripts/test/unit-tests.sh

# Commit changes
./scripts/utils/commit.sh "Update documentation"
```

## Development Workflow

1. Make changes to source code
2. Build project: `./scripts/build/build.sh`
3. Run tests: `./scripts/test/unit-tests.sh`
4. Commit changes: `./scripts/utils/commit.sh "Your message"`
EOF

echo ""
echo "🎉 Script organization cleanup completed!"
echo ""
echo "📁 Your scripts are now organized in the 'scripts' directory"
echo ""
echo "📝 Example usage:"
echo "   ./scripts/build/build.sh       # Build the project"
echo "   ./scripts/test/unit-tests.sh   # Run unit tests"
echo "   ./scripts/utils/commit.sh      # Commit changes"

# Show the new structure
echo ""
echo "📁 New script organization:"
ls -la scripts/