#!/usr/bin/env tsx

import { testClusterHealth, TestResult } from './modules/cluster-health.test';

async function runAllTests(): Promise<void> {
  console.log('🚀 Starting MCP-OCS Pre-Server Test Harness\n');

  const tests = [
    { name: 'Cluster Health', fn: testClusterHealth },
  ];

  const results: TestResult[] = [];

  for (const test of tests) {
    console.log(`🔍 Running: ${test.name}`);
    try {
      const result = await test.fn();
      results.push(result);
      console.log(result.success ? '✅ PASS' : '❌ FAIL');
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    } catch (error: any) {
      results.push({ test: test.name, success: false, error: error?.message || String(error) });
      console.log(`❌ FAIL - ${error?.message || String(error)}`);
    }
    console.log('');
  }

  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`\n📊 Summary: ${passed}/${total} tests passed`);
  if (passed === total) {
    console.log('🎉 All tests passed! MCP server should work correctly.');
  } else {
    console.log('⚠️  Some tests failed. Review before starting MCP server.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

