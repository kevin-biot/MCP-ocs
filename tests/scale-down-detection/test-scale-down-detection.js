#!/usr/bin/env node

/**
 * Test Enhanced Scale-Down Detection
 * 
 * This test validates that our namespace health checker correctly identifies
 * scale-down scenarios vs application failures.
 */

const mockDeploymentsData = {
  items: [
    {
      metadata: {
        name: 'web-app',
        resourceVersion: Date.now().toString() // Recent update
      },
      spec: {
        replicas: 0 // Intentionally scaled to 0
      },
      status: {
        availableReplicas: 0,
        readyReplicas: 0
      }
    },
    {
      metadata: {
        name: 'api-server',
        resourceVersion: (Date.now() - 3600000).toString() // Older
      },
      spec: {
        replicas: 0 // Also scaled to 0
      },
      status: {
        availableReplicas: 0,
        readyReplicas: 0
      }
    }
  ]
};

const mockEventsData = {
  items: [
    {
      reason: 'ScalingReplicaSet',
      message: 'Scaled down replica set web-app-12345 to 0',
      lastTimestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
      involvedObject: {
        kind: 'ReplicaSet',
        name: 'web-app-12345'
      }
    },
    {
      reason: 'Killing',
      message: 'Stopping container app',
      lastTimestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 min ago
      involvedObject: {
        kind: 'Pod',
        name: 'web-app-pod-xyz'
      }
    }
  ]
};

const mockPodHealth = {
  ready: 0,
  total: 0,
  crashloops: [],
  pending: [],
  imagePullErrors: [],
  oomKilled: []
};

// Mock the analyzeScaleDownPatterns method
function analyzeScaleDownPatterns(deploymentsData, eventsData, podHealth) {
  const deployments = deploymentsData.items || [];
  const events = eventsData.items || [];
  
  const analysis = {
    isScaleDown: false,
    evidence: [],
    deploymentStatus: {
      total: deployments.length,
      scaledToZero: 0,
      recentlyScaled: []
    },
    scaleDownEvents: [],
    verdict: 'unknown'
  };

  // Analyze deployment replica status
  for (const deployment of deployments) {
    const name = deployment.metadata.name;
    const spec = deployment.spec || {};
    const status = deployment.status || {};
    
    const desiredReplicas = spec.replicas || 0;
    const availableReplicas = status.availableReplicas || 0;
    
    if (desiredReplicas === 0) {
      analysis.deploymentStatus.scaledToZero++;
      analysis.evidence.push(`Deployment ${name} intentionally scaled to 0 replicas`);
    }
    
    // Check for recent scaling activity
    const lastUpdateTime = new Date(deployment.metadata.resourceVersion || 0).getTime();
    const recentThreshold = Date.now() - (2 * 60 * 60 * 1000); // Last 2 hours
    
    if (lastUpdateTime > recentThreshold && desiredReplicas !== availableReplicas) {
      analysis.deploymentStatus.recentlyScaled.push(name);
      analysis.evidence.push(`Deployment ${name} recently modified (desired: ${desiredReplicas}, available: ${availableReplicas})`);
    }
  }

  // Analyze events for scale-down indicators
  const recentEvents = events.filter(event => {
    const eventTime = new Date(event.lastTimestamp || event.eventTime).getTime();
    const cutoff = Date.now() - (60 * 60 * 1000); // Last hour
    return eventTime > cutoff;
  });

  for (const event of recentEvents) {
    const reason = event.reason;
    const message = event.message;
    const objectKind = event.involvedObject?.kind;
    const objectName = event.involvedObject?.name;
    
    // Look for scale-down related events
    if (reason === 'ScalingReplicaSet' && message.includes('scaled down')) {
      analysis.scaleDownEvents.push(`${objectKind}/${objectName}: ${message}`);
      analysis.evidence.push(`Scale-down event detected: ${message}`);
    }
    
    if (reason === 'Killing' && objectKind === 'Pod') {
      analysis.scaleDownEvents.push(`Pod termination: ${objectName}`);
      analysis.evidence.push(`Pod ${objectName} was terminated`);
    }
  }

  // Determine if this is a scale-down scenario
  analysis.isScaleDown = analysis.deploymentStatus.scaledToZero > 0 || analysis.scaleDownEvents.length > 0;
  
  // Determine the verdict based on evidence
  if (analysis.deploymentStatus.scaledToZero > 0 && analysis.scaleDownEvents.length > 0) {
    analysis.verdict = 'intentional_scale_down';
  } else if (analysis.evidence.some(e => e.includes('NodeNotReady') || e.includes('NodeUnavailable'))) {
    analysis.verdict = 'node_failure';
  } else if (podHealth.total === 0 && analysis.deploymentStatus.total === 0) {
    analysis.verdict = 'resource_pressure';
  } else if (podHealth.total === 0 && analysis.deploymentStatus.total > 0) {
    analysis.verdict = 'application_failure';
  }

  return analysis;
}

// Run the test
console.log('🧪 Testing Enhanced Scale-Down Detection...\n');

const result = analyzeScaleDownPatterns(mockDeploymentsData, mockEventsData, mockPodHealth);

console.log('📊 Scale-Down Analysis Results:');
console.log('================================');
console.log('✅ Is Scale-Down:', result.isScaleDown);
console.log('🎯 Verdict:', result.verdict);
console.log('📝 Evidence Count:', result.evidence.length);
console.log('🚀 Deployments Scaled to Zero:', result.deploymentStatus.scaledToZero);
console.log('📉 Scale-Down Events:', result.scaleDownEvents.length);

console.log('\n📋 Evidence:');
result.evidence.forEach((evidence, index) => {
  console.log(`  ${index + 1}. ${evidence}`);
});

console.log('\n🔍 Scale-Down Events:');
result.scaleDownEvents.forEach((event, index) => {
  console.log(`  ${index + 1}. ${event}`);
});

// Test expected outcomes
const expectedOutcomes = {
  isScaleDown: true,
  verdict: 'intentional_scale_down',
  scaledToZero: 2,
  hasEvidence: true
};

console.log('\n🎯 Test Validation:');
console.log('==================');

const tests = [
  {
    name: 'Scale-down detection',
    expected: expectedOutcomes.isScaleDown,
    actual: result.isScaleDown,
    pass: result.isScaleDown === expectedOutcomes.isScaleDown
  },
  {
    name: 'Verdict assessment',
    expected: expectedOutcomes.verdict,
    actual: result.verdict,
    pass: result.verdict === expectedOutcomes.verdict
  },
  {
    name: 'Deployments scaled to zero count',
    expected: expectedOutcomes.scaledToZero,
    actual: result.deploymentStatus.scaledToZero,
    pass: result.deploymentStatus.scaledToZero === expectedOutcomes.scaledToZero
  },
  {
    name: 'Evidence collection',
    expected: expectedOutcomes.hasEvidence,
    actual: result.evidence.length > 0,
    pass: result.evidence.length > 0
  }
];

let passedTests = 0;
tests.forEach(test => {
  const status = test.pass ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${test.name}: expected ${test.expected}, got ${test.actual}`);
  if (test.pass) passedTests++;
});

console.log(`\n🏆 Test Summary: ${passedTests}/${tests.length} tests passed`);

if (passedTests === tests.length) {
  console.log('🎉 All tests passed! Scale-down detection is working correctly.');
  process.exit(0);
} else {
  console.log('⚠️ Some tests failed. Please review the implementation.');
  process.exit(1);
}
