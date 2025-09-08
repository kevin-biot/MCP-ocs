#!/bin/bash

# Make all scripts executable
chmod +x *.sh

echo "🔧 Scripts made executable:"
ls -la *.sh

echo ""
echo "📋 Available commands:"
echo "./check-production-status.sh  - Check production readiness"
echo "./commit-production.sh        - Commit production improvements"
echo "./check-status.sh             - Original status check"
echo "./commit-skeleton.sh          - Original skeleton commit"

echo ""
echo "🚀 Ready to commit production-ready improvements!"
