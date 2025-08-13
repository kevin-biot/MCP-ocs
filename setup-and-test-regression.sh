#!/bin/bash
echo "🎯 Setting up and testing regression framework..."
chmod +x create-regression-framework.sh
./create-regression-framework.sh
echo ""
echo "🧪 Running preliminary test..."
scripts/test/regression-daily.sh
