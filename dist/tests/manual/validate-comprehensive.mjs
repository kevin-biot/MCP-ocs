#!/usr/bin/env node
/**
 * Comprehensive Tool Validation Suite
 * Compares MCP tool outputs with real oc command results
 */
import { spawn } from 'child_process';
import { execSync } from 'child_process';
import { setTimeout } from 'timers/promises';
console.log('🧪 Comprehensive MCP Tool Validation');
console.log('====================================');
// Get real cluster data first
console.log('📊 Gathering real cluster data...');
const realData = {
    version: execSync('oc version --output=json').toString(),
    clusterInfo: execSync('oc cluster-info').toString(),
    namespaces: execSync('oc get namespaces --output=json').toString(),
    kubeSystemPods: execSync('oc get pods -n kube-system --output=json').toString(),
    devopsPods: execSync('oc get pods -n devops --output=json 2>/dev/null || echo "{}"').toString()
};
console.log('✅ Real data collected');
// Parse real data
const realVersionData = JSON.parse(realData.version);
const realNamespaceData = JSON.parse(realData.namespaces);
const realKubePodsData = JSON.parse(realData.kubeSystemPods);
console.log('\n📋 Real Cluster Facts:');
console.log(`- OpenShift Version: ${realVersionData.openshiftVersion}`);
console.log(`- Server Version: ${realVersionData.serverVersion?.gitVersion}`);
console.log(`- Namespaces: ${realNamespaceData.items.length}`);
console.log(`- kube-system pods: ${realKubePodsData.items?.length || 0}`);
// Now test MCP tools
console.log('\n🚀 Starting MCP server for tool testing...');
const server = spawn('node', ['dist/index.js'], {
    cwd: '/Users/kevinbrown/MCP-ocs',
    stdio: ['pipe', 'pipe', 'inherit']
});
let messageId = 1;
const toolResults = {};
function sendMCPMessage(method, params = {}) {
    const message = {
        jsonrpc: "2.0",
        id: messageId++,
        method: method,
        params: params
    };
    server.stdin.write(JSON.stringify(message) + '\\n');
    return messageId - 1;
}
server.stdout.on('data', (data) => {
    const response = data.toString().trim();
    try {
        const parsed = JSON.parse(response);
        if (parsed.id && parsed.result) {
            toolResults[parsed.id] = parsed.result;
        }
    }
    catch (e) {
        // Ignore non-JSON responses
    }
});
async function runValidationTests() {
    try {
        // Wait for server startup
        await setTimeout(3000);
        console.log('\\n🔧 Testing MCP tools...');
        // Test 1: Cluster health
        console.log('\\n📊 Test 1: Cluster Health Diagnostic');
        const healthId = sendMCPMessage('tools/call', {
            name: 'oc_diagnostic_cluster_health',
            arguments: { sessionId: 'validation-health' }
        });
        await setTimeout(2000);
        // Test 2: Pod listing
        console.log('📊 Test 2: Pod Listing (kube-system)');
        const podsId = sendMCPMessage('tools/call', {
            name: 'oc_read_get_pods',
            arguments: {
                sessionId: 'validation-pods',
                namespace: 'kube-system'
            }
        });
        await setTimeout(2000);
        // Test 3: Another namespace
        console.log('📊 Test 3: Pod Listing (devops)');
        const devopsPodsId = sendMCPMessage('tools/call', {
            name: 'oc_read_get_pods',
            arguments: {
                sessionId: 'validation-devops',
                namespace: 'devops'
            }
        });
        await setTimeout(3000);
        // Analyze results
        console.log('\\n📈 VALIDATION RESULTS:');
        console.log('======================');
        // Check cluster health result
        if (toolResults[healthId]) {
            const healthText = toolResults[healthId].content?.[0]?.text || '';
            console.log('\\n🔍 Cluster Health Tool Analysis:');
            // Extract version from tool output
            const toolVersionMatch = healthText.match(/version[:\\s]*(\\d+\\.\\d+\\.\\d+)/i);
            const toolVersion = toolVersionMatch ? toolVersionMatch[1] : 'Not found';
            console.log(`- Tool reported version: ${toolVersion}`);
            console.log(`- Real OpenShift version: ${realVersionData.openshiftVersion}`);
            console.log(`- Match: ${toolVersion === realVersionData.openshiftVersion ? '✅' : '❌'}`);
            if (toolVersion !== realVersionData.openshiftVersion) {
                console.log('⚠️  VERSION MISMATCH DETECTED!');
            }
        }
        // Check pod counts
        if (toolResults[podsId]) {
            const podsText = toolResults[podsId].content?.[0]?.text || '';
            console.log('\\n🔍 Pod Count Analysis (kube-system):');
            // Count pods mentioned in tool output
            const toolPodMatches = podsText.match(/pod[s]?/gi) || [];
            const toolPodCount = toolPodMatches.length;
            const realPodCount = realKubePodsData.items?.length || 0;
            console.log(`- Tool mentioned pods: ${toolPodCount} times`);
            console.log(`- Real pod count: ${realPodCount}`);
            console.log(`- Accuracy: ${Math.abs(toolPodCount - realPodCount) <= 2 ? '✅' : '❌'}`);
        }
        console.log('\\n🎯 RECOMMENDATIONS:');
        if (toolResults[healthId]) {
            const healthText = toolResults[healthId].content?.[0]?.text || '';
            const toolVersionMatch = healthText.match(/version[:\\s]*(\\d+\\.\\d+\\.\\d+)/i);
            const toolVersion = toolVersionMatch ? toolVersionMatch[1] : null;
            if (!toolVersion || toolVersion !== realVersionData.openshiftVersion) {
                console.log('❌ Tool version reporting needs calibration');
                console.log(`   Expected: ${realVersionData.openshiftVersion}`);
                console.log(`   Got: ${toolVersion || 'undefined'}`);
            }
            else {
                console.log('✅ Version reporting accurate');
            }
        }
        console.log('\\n📋 Tool Response Samples:');
        Object.entries(toolResults).forEach(([id, result]) => {
            const text = result.content?.[0]?.text || '';
            console.log(`\\n🔧 Tool Response ${id}:`);
            console.log(text.substring(0, 200) + (text.length > 200 ? '...' : ''));
        });
    }
    catch (error) {
        console.error('❌ Validation failed:', error.message);
    }
    finally {
        server.kill();
        process.exit(0);
    }
}
setTimeout(() => runValidationTests(), 1000);
server.on('error', (error) => {
    console.error('❌ Server error:', error.message);
    process.exit(1);
});
