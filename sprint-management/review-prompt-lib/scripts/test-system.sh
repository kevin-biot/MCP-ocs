#!/bin/bash

# Test Runner for Review-Prompt-Lib
# Safe testing with cleanup capability

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$SCRIPT_DIR/.."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Review-Prompt-Lib Test Runner ===${NC}"

# Test configuration
DOMAIN_NAME="async-correctness"
TEST_PREFIX="TEST"
BACKUP_DIR="/tmp/review-lib-backup-$$"

echo -e "${YELLOW}Setting up test environment...${NC}"

# Create backup of registry before testing
REGISTRY_FILE="$LIB_DIR/domains/$DOMAIN_NAME/historical/finding-registry.json"
HISTORICAL_DIR="$LIB_DIR/domains/$DOMAIN_NAME/historical"

mkdir -p "$BACKUP_DIR"
if [ -f "$REGISTRY_FILE" ]; then
    cp "$REGISTRY_FILE" "$BACKUP_DIR/"
    echo -e "${GREEN}✓ Backed up existing registry${NC}"
fi

# Backup any existing scan results
cp -r "$HISTORICAL_DIR"/*.json "$BACKUP_DIR/" 2>/dev/null || true

function cleanup_test() {
    echo -e "${YELLOW}Cleaning up test artifacts...${NC}"
    
    # Remove test scan results
    rm -f "$HISTORICAL_DIR"/$TEST_PREFIX-*
    rm -f "$HISTORICAL_DIR"/$(date +%Y-%m-%d)-scan-results.json
    rm -f "$HISTORICAL_DIR"/$(date +%Y-%m-%d)-processing-report.json
    
    # Restore original registry
    if [ -f "$BACKUP_DIR/finding-registry.json" ]; then
        cp "$BACKUP_DIR/finding-registry.json" "$REGISTRY_FILE"
        echo -e "${GREEN}✓ Restored original registry${NC}"
    fi
    
    # Clean up backup
    rm -rf "$BACKUP_DIR"
    echo -e "${GREEN}✓ Test cleanup complete${NC}"
}

function test_dry_run() {
    echo -e "${BLUE}Test 1: Dry Run Validation${NC}"
    
    cd "$LIB_DIR/.."
    bash "$SCRIPT_DIR/run-weekly-sweep.sh" "$DOMAIN_NAME" --dry-run
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Dry run completed successfully${NC}"
    else
        echo -e "${RED}✗ Dry run failed${NC}"
        return 1
    fi
}

function test_full_sweep() {
    echo -e "${BLUE}Test 2: Full Sweep with Placeholder Data${NC}"
    
    cd "$LIB_DIR/.."
    bash "$SCRIPT_DIR/run-weekly-sweep.sh" "$DOMAIN_NAME"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Full sweep completed${NC}"
        
        # Check if files were created
        SCAN_DATE=$(date +%Y-%m-%d)
        SCAN_FILE="$HISTORICAL_DIR/$SCAN_DATE-scan-results.json"
        REPORT_FILE="$HISTORICAL_DIR/$SCAN_DATE-processing-report.json"
        
        if [ -f "$SCAN_FILE" ]; then
            echo -e "${GREEN}✓ Scan results file created${NC}"
        else
            echo -e "${RED}✗ Scan results file missing${NC}"
            return 1
        fi
        
        if [ -f "$REPORT_FILE" ]; then
            echo -e "${GREEN}✓ Processing report created${NC}"
        else
            echo -e "${RED}✗ Processing report missing${NC}"
            return 1
        fi
        
    else
        echo -e "${RED}✗ Full sweep failed${NC}"
        return 1
    fi
}

function test_deduplication() {
    echo -e "${BLUE}Test 3: Deduplication Logic${NC}"
    
    # Run sweep twice to test deduplication
    cd "$LIB_DIR/.."
    
    echo -e "${YELLOW}First sweep...${NC}"
    bash "$SCRIPT_DIR/run-weekly-sweep.sh" "$DOMAIN_NAME" > /dev/null
    
    # Check registry after first run
    FINDINGS_COUNT_1=$(node -e "
        const registry = JSON.parse(require('fs').readFileSync('$REGISTRY_FILE', 'utf8'));
        console.log(registry.findings.length);
    ")
    
    echo -e "${YELLOW}Second sweep (should deduplicate)...${NC}"
    bash "$SCRIPT_DIR/run-weekly-sweep.sh" "$DOMAIN_NAME" > /dev/null
    
    # Check registry after second run
    FINDINGS_COUNT_2=$(node -e "
        const registry = JSON.parse(require('fs').readFileSync('$REGISTRY_FILE', 'utf8'));
        console.log(registry.findings.length);
    ")
    
    if [ "$FINDINGS_COUNT_1" -eq "$FINDINGS_COUNT_2" ]; then
        echo -e "${GREEN}✓ Deduplication working - no duplicate findings created${NC}"
        echo -e "${GREEN}  Findings after first run: $FINDINGS_COUNT_1${NC}"
        echo -e "${GREEN}  Findings after second run: $FINDINGS_COUNT_2${NC}"
    else
        echo -e "${RED}✗ Deduplication failed - duplicate findings created${NC}"
        echo -e "${RED}  Findings after first run: $FINDINGS_COUNT_1${NC}"
        echo -e "${RED}  Findings after second run: $FINDINGS_COUNT_2${NC}"
        return 1
    fi
}

function test_registry_structure() {
    echo -e "${BLUE}Test 4: Registry Structure Validation${NC}"
    
    # Validate registry JSON structure
    node -e "
        const registry = JSON.parse(require('fs').readFileSync('$REGISTRY_FILE', 'utf8'));
        
        // Check required fields
        const required = ['domain', 'version', 'findings', 'statistics', 'scan_history'];
        const missing = required.filter(field => !(field in registry));
        
        if (missing.length > 0) {
            console.error('Missing required fields:', missing);
            process.exit(1);
        }
        
        // Check statistics structure
        const stats = registry.statistics;
        const statsRequired = ['total_findings_ever', 'active_findings', 'resolved_findings'];
        const statsMissing = statsRequired.filter(field => !(field in stats));
        
        if (statsMissing.length > 0) {
            console.error('Missing statistics fields:', statsMissing);
            process.exit(1);
        }
        
        console.log('✓ Registry structure validation passed');
        console.log('  Domain:', registry.domain);
        console.log('  Total findings:', registry.statistics.total_findings_ever);
        console.log('  Active findings:', registry.statistics.active_findings);
    "
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Registry structure is valid${NC}"
    else
        echo -e "${RED}✗ Registry structure validation failed${NC}"
        return 1
    fi
}

function show_test_results() {
    echo -e "${BLUE}=== Test Results Summary ===${NC}"
    
    SCAN_DATE=$(date +%Y-%m-%d)
    SCAN_FILE="$HISTORICAL_DIR/$SCAN_DATE-scan-results.json"
    REPORT_FILE="$HISTORICAL_DIR/$SCAN_DATE-processing-report.json"
    
    echo -e "${YELLOW}Generated Files:${NC}"
    if [ -f "$SCAN_FILE" ]; then
        echo -e "${GREEN}✓ $SCAN_FILE${NC}"
        echo "  Size: $(wc -l < "$SCAN_FILE") lines"
    fi
    
    if [ -f "$REPORT_FILE" ]; then
        echo -e "${GREEN}✓ $REPORT_FILE${NC}"
        echo "  Size: $(wc -l < "$REPORT_FILE") lines"
    fi
    
    echo -e "${YELLOW}Registry Status:${NC}"
    if [ -f "$REGISTRY_FILE" ]; then
        node -e "
            const registry = JSON.parse(require('fs').readFileSync('$REGISTRY_FILE', 'utf8'));
            console.log('  Total findings ever:', registry.statistics.total_findings_ever);
            console.log('  Active findings:', registry.statistics.active_findings);
            console.log('  Scan history entries:', (registry.scan_history || []).length);
        "
    fi
}

# Trap to ensure cleanup on exit
trap cleanup_test EXIT

# Run tests
echo -e "${YELLOW}Starting test sequence...${NC}"

test_dry_run || { echo -e "${RED}Test 1 failed${NC}"; exit 1; }
test_full_sweep || { echo -e "${RED}Test 2 failed${NC}"; exit 1; }
test_deduplication || { echo -e "${RED}Test 3 failed${NC}"; exit 1; }
test_registry_structure || { echo -e "${RED}Test 4 failed${NC}"; exit 1; }

show_test_results

echo -e "${GREEN}=== ALL TESTS PASSED ===${NC}"
echo -e "${YELLOW}The Review-Prompt-Lib automation is working correctly!${NC}"
echo -e "${YELLOW}Test artifacts will be cleaned up automatically.${NC}"
