# LLM Prompt Testing Rig for MCP-ocs v0.8.0-beta-3

## Purpose
Test MCP-ocs tools with different LLMs (Qwen, LM Studio, Claude alternatives) to validate:
- Tool discoverability and understanding
- Parameter passing accuracy  
- Output interpretation quality
- Error handling and recovery
- Real-world usage patterns

## Setup Instructions

### 1. Start MCP-ocs Server
```bash
cd /Users/kevinbrown/MCP-ocs
npm run start:beta
# Server runs on stdio, ready for MCP clients
```

### 2. LM Studio Configuration
```json
{
  "mcpServers": {
    "mcp-ocs": {
      "command": "node",
      "args": ["/Users/kevinbrown/MCP-ocs/dist/src/index.beta.js"],
      "env": {}
    }
  }
}
```

### 3. Qwen Local Setup
Configure Qwen to connect to MCP server using your preferred MCP client.

## Test Scenarios

### Level 1: Basic Tool Discovery
**Goal**: Verify LLM can discover and understand available tools

**Test Prompts**: See `prompts/01-discovery.md`

### Level 2: Simple Operations  
**Goal**: Execute basic cluster health checks

**Test Prompts**: See `prompts/02-basic-ops.md`

### Level 3: Complex Workflows
**Goal**: Multi-step diagnostics and analysis

**Test Prompts**: See `prompts/03-complex-workflows.md`

### Level 4: RCA Scenarios
**Goal**: Root cause analysis with real cluster problems

**Test Prompts**: See `prompts/04-rca-scenarios.md`

### Level 5: Edge Cases
**Goal**: Error handling and parameter validation

**Test Prompts**: See `prompts/05-edge-cases.md`

## Evaluation Criteria

### Success Metrics
- **Tool Selection**: Chooses appropriate tools for task
- **Parameter Accuracy**: Passes correct parameters
- **Output Interpretation**: Understands and explains results
- **Error Recovery**: Handles failures gracefully
- **Workflow Logic**: Sequences operations logically

### Scoring System
- **5/5**: Professional operator level
- **4/5**: Competent with minor issues
- **3/5**: Functional but needs guidance  
- **2/5**: Basic understanding, frequent errors
- **1/5**: Confused or incorrect usage

## Running Tests

1. **Start server**: `npm run start:beta`
2. **Open LLM client** (LM Studio, Qwen, etc.)
3. **Work through prompt levels** 1-5 systematically
4. **Record results** in `results/` directory
5. **Compare LLM performance** across different models

## Results Tracking

Create files in `results/` directory:
- `qwen-results.md`
- `lmstudio-results.md` 
- `claude-comparison.md`

Track success rates, common errors, and improvement recommendations.
