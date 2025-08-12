# 🔧 MCP Tool Development Guide - Rules, Return Values & Best Practices

*Born from battle-tested experience with the Knowledge Seeding Framework v0.3.1*

## 🎯 **The Golden Rules of MCP Tool Development**

### **Rule #1: Tools MUST Return Strings, Never Objects**
**❌ The Bad Way (What We Did Wrong):**
```typescript
async execute(args: MyToolArgs): Promise<any> {
  return {
    success: true,
    data: "some data",
    timestamp: new Date().toISOString()
  };
}
```

**✅ The Force Way (What Works):**
```typescript
async execute(args: MyToolArgs): Promise<string> {
  const result = {
    success: true,
    data: "some data", 
    timestamp: new Date().toISOString()
  };
  
  return JSON.stringify(result, null, 2);
}
```

**💡 Why:** MCP expects tools to return strings. LM Studio/Qwen receives these strings and can parse JSON as needed.

---

### **Rule #2: Handle Argument Type Conversion Gracefully**
**❌ The Bad Way:**
```typescript
// In routing logic - assumes perfect typing
result = await knowledgeSeedingTool.execute(args || {});
```
*Error: Property 'operation' missing but required*

**✅ The Force Way:**
```typescript
// Provide defaults for required fields
const knowledgeArgs = {
  operation: 'seed' as const,
  ...(args || {})
};
result = await knowledgeSeedingTool.execute(knowledgeArgs as any);
```

**💡 Why:** MCP passes generic `Record<string, unknown>` but tools expect specific interfaces.

---

### **Rule #3: Comprehensive Error Handling with String Returns**
**❌ The Bad Way:**
```typescript
async execute(args: MyToolArgs): Promise<any> {
  try {
    // ... tool logic
    return result;
  } catch (error) {
    throw error; // Crashes the MCP server!
  }
}
```

**✅ The Force Way:**
```typescript
async execute(args: MyToolArgs): Promise<string> {
  try {
    const result = await this.performOperation(args);
    return JSON.stringify(result, null, 2);
  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      operation: args.operation || 'unknown'
    };
    return JSON.stringify(errorResult, null, 2);
  }
}
```

**💡 Why:** Never let exceptions bubble up to MCP server. Always return formatted error strings.

---

### **Rule #4: Tool Registration Routing Must Handle All Tools**
**❌ The Bad Way:**
```typescript
// In src/index.ts - Missing routing for new tools
if (name.startsWith('oc_diagnostic_')) {
  result = await diagnosticTools.executeTool(name, args || {});
} else if (name.startsWith('oc_read_')) {
  result = await readOpsTools.executeTool(name, args || {});
} else {
  throw new Error(`Unknown tool: ${name}`); // New tools hit this!
}
```

**✅ The Force Way:**
```typescript
// Add explicit routing for each tool type
if (name.startsWith('oc_diagnostic_')) {
  result = await diagnosticTools.executeTool(name, args || {});
} else if (name.startsWith('oc_read_')) {
  result = await readOpsTools.executeTool(name, args || {});
} else if (name.startsWith('memory_') || name.startsWith('core_')) {
  result = await stateMgmtTools.executeTool(name, args || {});
} else if (name === 'knowledge_seed_pattern') {
  const knowledgeArgs = { operation: 'seed' as const, ...(args || {}) };
  result = await knowledgeSeedingTool.execute(knowledgeArgs as any);
} else {
  throw new Error(`Unknown tool: ${name}`);
}
```

**💡 Why:** Every tool needs explicit routing logic. Don't assume naming patterns will catch everything.

---

## 🧠 **MCP Response Format Deep Dive**

### **What MCP Expects vs What We Return**

**MCP Server Response Format:**
```typescript
return {
  content: [
    {
      type: 'text',
      text: result!  // This must be a string!
    }
  ]
};
```

**Tool Return Value Journey:**
1. **Tool executes** → Returns string (JSON formatted)
2. **MCP server wraps** → In `content[0].text` structure  
3. **LM Studio receives** → Parses and displays to user
4. **AI model reads** → Can parse JSON for structured data

### **Debug Output Analysis**
From our successful deployment:
```bash
🔧 Executing tool: knowledge_seed_pattern
📝 Stored conversation in JSON (ChromaDB unavailable)
📊 Stored operational memory in JSON (ChromaDB unavailable)
🔖 Auto-captured: knowledge_seed_pattern with 1 tags
```

**What This Tells Us:**
- ✅ Tool executed successfully 
- ✅ Auto-memory system captured the execution
- ✅ Graceful degradation when ChromaDB unavailable
- ✅ No format errors = proper string return

---

## 🚀 **Best Practices for New Tools**

### **1. Tool Interface Design**
```typescript
export interface MyToolArguments {
  // Always include operation for routing
  operation: 'primary' | 'secondary' | 'search';
  
  // Required fields
  requiredField: string;
  
  // Optional fields with defaults
  optionalField?: string;
  
  // Enums for validation
  mode?: 'fast' | 'thorough' | 'comprehensive';
}

export class MyTool implements Tool {
  name = 'my_tool_name';
  fullName = 'my_tool_name';  // Always include both
  description = `Clear description with examples...`;
  
  inputSchema = {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['primary', 'secondary', 'search'],
        description: 'Operation to perform'
      },
      // ... other properties
    },
    required: ['operation', 'requiredField']
  };
}
```

### **2. Execution Pattern**
```typescript
async execute(args: MyToolArguments): Promise<string> {
  try {
    // Validate inputs
    if (!args.operation) {
      throw new Error('Operation is required');
    }
    
    // Route to appropriate handler
    let result: any;
    switch (args.operation) {
      case 'primary':
        result = await this.handlePrimary(args);
        break;
      case 'secondary':
        result = await this.handleSecondary(args);
        break;
      case 'search':
        result = await this.handleSearch(args);
        break;
      default:
        throw new Error(`Unknown operation: ${args.operation}`);
    }
    
    // Always return JSON string
    return JSON.stringify(result, null, 2);
    
  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      operation: args.operation || 'unknown',
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(errorResult, null, 2);
  }
}
```

### **3. Integration Checklist**
- [ ] Tool class implements `Tool` interface
- [ ] `name` and `fullName` properties set
- [ ] `inputSchema` properly defined with validation
- [ ] `execute` method returns `Promise<string>`
- [ ] All responses are JSON.stringify'd
- [ ] Error handling returns formatted error strings
- [ ] Tool added to appropriate tool suite's `getTools()` method
- [ ] Routing logic added to `src/index.ts`
- [ ] TypeScript compilation successful
- [ ] Integration test passes

---

## 🎯 **Testing Your Tools**

### **Quick Test Pattern**
```javascript
// test-my-tool.mjs
import { MyTool } from './dist/tools/my-tool.js';

async function testTool() {
  const tool = new MyTool();
  
  // Test successful operation
  const result1 = await tool.execute({
    operation: 'primary',
    requiredField: 'test-value'
  });
  console.log('Success test:', JSON.parse(result1));
  
  // Test error handling
  const result2 = await tool.execute({} as any);
  console.log('Error test:', JSON.parse(result2));
}

testTool().catch(console.error);
```

### **MCP Server Integration Test**
1. **Add tool to routing** in `src/index.ts`
2. **Build:** `npm run build`
3. **Start server:** `npm start`
4. **Check debug output:** Tool should appear in registered tools list
5. **Test with LM Studio:** Verify tool calls work end-to-end

---

## ⚡ **Performance Considerations**

### **Efficient Response Formatting**
```typescript
// Good: Pre-format common responses
const SUCCESS_TEMPLATE = {
  success: true,
  timestamp: new Date().toISOString()
};

// In tool execution:
const result = {
  ...SUCCESS_TEMPLATE,
  operation: args.operation,
  data: processedData
};
return JSON.stringify(result, null, 2);
```

### **Memory Management**
```typescript
// Good: Clean up large objects
async execute(args: MyToolArguments): Promise<string> {
  let largeData = await this.processData(args);
  
  const result = {
    success: true,
    summary: this.summarize(largeData),
    timestamp: new Date().toISOString()
  };
  
  // Clean up before returning
  largeData = null;
  
  return JSON.stringify(result, null, 2);
}
```

---

## 🚨 **Common Pitfalls to Avoid**

### **1. The Object Return Trap**
**Never return raw objects from execute methods!**

### **2. The Missing Route Trap**  
**Every new tool needs explicit routing logic in src/index.ts**

### **3. The Type Mismatch Trap**
**Always handle the generic args → specific interface conversion**

### **4. The Silent Failure Trap**
**Never let exceptions bubble up - always return error strings**

### **5. The ChromaDB Dependency Trap**
**Design for graceful degradation when external services unavailable**

---

## 🏆 **Success Indicators**

When your tool is working correctly, you'll see:

### **Build Phase:**
```bash
✅ npm run build completes without TypeScript errors
```

### **Server Start:**
```bash
✅ Tool appears in debug tool names list
✅ No registration errors in console
```

### **Execution Phase:**
```bash
✅ "🔧 Executing tool: your_tool_name" appears
✅ No "Tool execution failed" errors
✅ Auto-memory capture working
```

### **Response Phase:**
```bash
✅ JSON response properly formatted
✅ LM Studio displays results correctly
✅ No MCP format errors
```

---

## 🎓 **Graduation Test**

Create a simple tool that:
1. ✅ Takes an operation parameter
2. ✅ Returns different responses based on operation
3. ✅ Handles errors gracefully
4. ✅ Integrates with the MCP server
5. ✅ Works in LM Studio

If it passes all these criteria, you've mastered **The Force of MCP Tool Development**! 🌟

---

*"In tool development, there is no try. There is only return strings or return nothing."* - MCP Yoda 🧙‍♂️

**Remember:** The Knowledge Seeding Framework victory was built on these principles. Follow The Force, and your tools will bring balance to the MCP! ⚡
