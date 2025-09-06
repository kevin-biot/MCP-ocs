#!/bin/bash

# Make all sprint management scripts executable

chmod +x /Users/kevinbrown/MCP-ocs/sprint-management/scripts/get-sprint-context.sh
echo "✓ Made get-sprint-context.sh executable"

chmod +x /Users/kevinbrown/MCP-ocs/sprint-management/scripts/collect-sprint-metrics.sh
echo "✓ Made collect-sprint-metrics.sh executable"

chmod +x /Users/kevinbrown/MCP-ocs/sprint-management/scripts/generate-closure-reports.sh
echo "✓ Made generate-closure-reports.sh executable"

chmod +x /Users/kevinbrown/MCP-ocs/sprint-management/scripts/finalize-sprint.sh
echo "✓ Made finalize-sprint.sh executable"

chmod +x /Users/kevinbrown/MCP-ocs/sprint-management/review-prompt-lib/scripts/prepare-human-review.sh
echo "✓ Made prepare-human-review.sh executable"

chmod +x /Users/kevinbrown/MCP-ocs/sprint-management/review-prompt-lib/scripts/test-all-domains.sh
echo "✓ Made test-all-domains.sh executable"

chmod +x /Users/kevinbrown/MCP-ocs/sprint-management/review-prompt-lib/scripts/compare-llm-results.sh
echo "✓ Made compare-llm-results.sh executable"

chmod +x /Users/kevinbrown/MCP-ocs/sprint-management/review-prompt-lib/scripts/determine-domains.sh
echo "✓ Made determine-domains.sh executable"

chmod +x /Users/kevinbrown/MCP-ocs/sprint-management/review-prompt-lib/scripts/sprint-quality-check.sh
echo "✓ Made sprint-quality-check.sh executable"

chmod +x /Users/kevinbrown/MCP-ocs/sprint-management/review-prompt-lib/scripts/test-domain-rules.sh
echo "✓ Made test-domain-rules.sh executable"

echo ""
echo "✅ All Process v3.3 + Sprint Closure scripts are now executable"
