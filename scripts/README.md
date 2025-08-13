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
