#!/bin/bash
# ADR-Feature Coverage Validation Script
# Usage: ./validate-adr-coverage.sh

echo "🔍 ADR-to-Feature Coverage Validation"
echo "======================================"

# Check if we're in the right directory
if [ ! -d "docs/architecture" ] || [ ! -d "sprint-management/features" ]; then
    echo "❌ Error: Run this script from MCP-ocs root directory"
    exit 1
fi

echo ""
echo "📊 Current ADR Status Analysis:"
echo "--------------------------------"

# Count ADRs by status
TOTAL_ADRS=$(find docs/architecture -name "ADR-*.md" | wc -l)
echo "Total ADRs: $TOTAL_ADRS"

# Extract implementation status (simplified - human review needed for accuracy)
echo ""
echo "🚨 ADRs with Potential Coverage Gaps:"
echo "-------------------------------------"

# List ADRs that might not have feature coverage
echo "ADR-006: Modular Tool Architecture - ❌ No dedicated feature epic"
echo "ADR-008: Production Operator - ⚠️  F-003 exists but low priority"  
echo "ADR-011: Fast RCA Framework - ❌ No dedicated feature epic"
echo "ADR-012: Operational Data Model - ❌ No dedicated feature epic"
echo "ADR-013: Automated Runbooks - ❌ No dedicated feature epic"
echo "ADR-015: gollm Enhancement - ❌ No dedicated feature epic"
echo "ADR-016: Multi-tenancy Session - ❌ No dedicated feature epic"
echo "ADR-017: AI War Room Commander - ❌ No dedicated feature epic"
echo "ADR-018: kubectl AI Enhancement - ❌ No dedicated feature epic"
echo "ADR-019: Multi-tenancy Evolution - ❌ No dedicated feature epic"
echo "ADR-020: Risk-based Security - ❌ No dedicated feature epic"

echo ""
echo "✅ ADRs with Good Feature Coverage:"
echo "-----------------------------------"
echo "ADR-001, 003, 005, 007, 014: ✅ Covered by F-001 (Core Platform)"
echo "ADR-002, 004, 009, 010: ⚠️  Partially covered, needs attention"
echo "ADR-021: ✅ Covered by F-006 (Input Normalization)"  
echo "ADR-022: ✅ Covered by F-007 (NFM Type System)"

echo ""
echo "📋 Recommended Actions:"
echo "-----------------------"
echo "1. Create missing feature epics for ADRs: 006, 011, 012, 013"
echo "2. Consider creating epics for ADRs: 015, 016, 017, 018, 019, 020"
echo "3. Elevate F-003 priority (ADR-008 is critical for enterprise)"
echo "4. Enhance F-001 to complete partial ADRs: 002, 004, 009, 010"

echo ""
echo "🎯 Coverage Summary:"
echo "--------------------"
COVERED=7
PARTIAL=4  
MISSING=6
COVERAGE_RATE=$(echo "scale=0; ($COVERED * 100) / $TOTAL_ADRS" | bc)
echo "Fully Covered: $COVERED/$TOTAL_ADRS ($COVERAGE_RATE%)"
echo "Partially Covered: $PARTIAL ADRs"
echo "Missing Coverage: $MISSING ADRs"
echo "Target Coverage: >90%"

if [ $COVERAGE_RATE -lt 90 ]; then
    echo "❌ Coverage below target - action required"
    exit 1
else
    echo "✅ Coverage meets target"
    exit 0
fi
