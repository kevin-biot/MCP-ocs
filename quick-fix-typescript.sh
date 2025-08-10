#!/bin/bash

echo "🔧 MCP-ocs TypeScript Error Fix Script"
echo "======================================"

cd /Users/kevinbrown/MCP-ocs

# Create a TypeScript error fix pattern file
cat > fix-typescript-errors.sh << 'EOF'
#!/bin/bash

echo "Applying systematic TypeScript fixes..."

# Fix 1: Add affectedResources to all storeOperational calls
echo "🔧 Fix 1: Adding missing affectedResources field..."
find src -name "*.ts" -exec sed -i '' 's/diagnosticSteps: \[/affectedResources: [],\
      diagnosticSteps: [/g' {} \;

# Fix 2: Fix error type handling (unknown -> Error)
echo "🔧 Fix 2: Fixing error type handling..."
find src -name "*.ts" -exec sed -i '' 's/error\.message/error instanceof Error ? error.message : "Unknown error"/g' {} \;

# Fix 3: Fix tool level from 'detailed' to 'advanced'
echo "🔧 Fix 3: Fixing tool capability levels..."
find src -name "*.ts" -exec sed -i '' 's/level: '\''detailed'\''/level: '\''advanced'\''/g' {} \;

# Fix 4: Add type annotations for implicitly typed parameters
echo "🔧 Fix 4: Adding type annotations..."
find src -name "*.ts" -exec sed -i '' 's/forEach(domain =>/forEach((domain: string) =>/g' {} \;
find src -name "*.ts" -exec sed -i '' 's/\.find(s =>/\.find((s: any) =>/g' {} \;
find src -name "*.ts" -exec sed -i '' 's/\.map(tool =>/\.map((tool: any) =>/g' {} \;

# Fix 5: Fix union type property access
echo "🔧 Fix 5: Fixing union type property access..."
find src -name "*.ts" -exec sed -i '' 's/r\.memory\.incidentId/("incidentId" in r.memory) ? r.memory.incidentId : ""/g' {} \;
find src -name "*.ts" -exec sed -i '' 's/r\.memory\.symptoms/("symptoms" in r.memory) ? r.memory.symptoms : []/g' {} \;
find src -name "*.ts" -exec sed -i '' 's/r\.memory\.resolution/("resolution" in r.memory) ? r.memory.resolution : ""/g' {} \;
find src -name "*.ts" -exec sed -i '' 's/r\.memory\.sessionId/("sessionId" in r.memory) ? r.memory.sessionId : ""/g' {} \;
find src -name "*.ts" -exec sed -i '' 's/r\.memory\.userMessage/("userMessage" in r.memory) ? r.memory.userMessage : ""/g' {} \;
find src -name "*.ts" -exec sed -i '' 's/r\.memory\.assistantResponse/("assistantResponse" in r.memory) ? r.memory.assistantResponse : ""/g' {} \;

# Fix 6: Fix index signature issues
echo "🔧 Fix 6: Fixing index signature issues..."
find src -name "*.ts" -exec sed -i '' 's/TOOL_NAMESPACES\[tool\.namespace\]/TOOL_NAMESPACES[tool.namespace as keyof typeof TOOL_NAMESPACES]/g' {} \;
find src -name "*.ts" -exec sed -i '' 's/TOOL_NAMESPACES\[ns\]/TOOL_NAMESPACES[ns as keyof typeof TOOL_NAMESPACES]/g' {} \;
find src -name "*.ts" -exec sed -i '' 's/TOOL_NAMESPACES\[namespace\]/TOOL_NAMESPACES[namespace as keyof typeof TOOL_NAMESPACES]/g' {} \;

# Fix 7: Fix specific property issues
echo "🔧 Fix 7: Fixing specific property issues..."
find src -name "*.ts" -exec sed -i '' 's/contextRules\.disabledDomains/("disabledDomains" in contextRules) ? contextRules.disabledDomains : []/g' {} \;
find src -name "*.ts" -exec sed -i '' 's/suggestions\[evidenceType\]/suggestions[evidenceType as keyof typeof suggestions]/g' {} \;

# Fix 8: Fix environment variable typing
echo "🔧 Fix 8: Fixing environment variable typing..."
find src -name "*.ts" -exec sed -i '' 's/env\[key\] = process\.env\[key\];/if (process.env[key]) env[key] = process.env[key];/g' {} \;

# Fix 9: Fix logger.warn parameter count
echo "🔧 Fix 9: Fixing logger parameter issues..."
find src -name "*.ts" -exec sed -i '' 's/logger\.warn(\`Non-critical shutdown handler failed: \${handler\.name}\`, error, { duration });/logger.warn(\`Non-critical shutdown handler failed: \${handler.name}: \${error instanceof Error ? error.message : "Unknown"}\`);/g' {} \;

echo "✅ All TypeScript error fixes applied!"
EOF

chmod +x fix-typescript-errors.sh
./fix-typescript-errors.sh

echo ""
echo "🧪 Testing the fixes..."
npm run build

echo ""
echo "🏁 Fix script complete!"
