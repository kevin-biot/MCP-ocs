#!/usr/bin/env node

/**
 * Findings Processor - Core Deduplication Engine
 * Prevents backlog chaos by tracking finding fingerprints
 * 
 * Usage: node process-findings.js <domain-name> <scan-results-file>
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m', 
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadJSON(filepath) {
    try {
        const content = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        throw new Error(`Failed to load JSON from ${filepath}: ${error.message}`);
    }
}

function saveJSON(filepath, data) {
    try {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    } catch (error) {
        throw new Error(`Failed to save JSON to ${filepath}: ${error.message}`);
    }
}

function generateFingerprint(finding, domainName) {
    // Handle both partial fingerprints from LLM and full fingerprint generation
    const { file, line, category, evidence, fingerprint } = finding;
    
    if (fingerprint && !fingerprint.includes('{content_hash}')) {
        // LLM provided partial fingerprint (domain:file:line:category)
        const contentHash = generateContentHash(evidence);
        return `${fingerprint}:${contentHash}`;
    } else {
        // Generate complete fingerprint (fallback for old format)
        const contentHash = generateContentHash(evidence);
        return `${domainName}:${file}:${line}:${category}:${contentHash}`;
    }
}

function generateContentHash(evidence) {
    // Simple hash of code content to detect actual changes vs moves
    if (!evidence) return 'no-evidence';
    
    // Normalize whitespace and extract meaningful code
    const normalized = evidence
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\/\/.*$/gm, '')           // Remove line comments
        .replace(/\s+/g, ' ')              // Normalize whitespace
        .trim();
    
    // Simple hash function (good enough for deduplication)
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
        const char = normalized.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36).substring(0, 8); // 8-char hash
}

function findByFingerprint(registry, fingerprint) {
    return registry.findings.find(f => f.fingerprint === fingerprint);
}

function processFindings(domainName, scanResultsFile) {
    log('blue', '=== Processing Findings - Deduplication Engine ===');
    
    const scriptDir = __dirname;
    const libDir = path.dirname(scriptDir);
    const domainDir = path.join(libDir, 'domains', domainName);
    const registryFile = path.join(domainDir, 'historical', 'finding-registry.json');
    
    log('yellow', `Domain: ${domainName}`);
    log('yellow', `Scan results: ${scanResultsFile}`);
    log('yellow', `Registry: ${registryFile}`);
    
    // Load scan results
    const scanResults = loadJSON(scanResultsFile);
    const newFindings = scanResults.findings || [];
    log('green', `✓ Loaded ${newFindings.length} new findings from scan`);
    
    // Load historical registry
    const registry = loadJSON(registryFile);
    log('green', `✓ Loaded registry with ${registry.findings.length} historical findings`);
    
    // Process each new finding
    const actions = {
        create: [],      // New findings never seen before
        skip: [],        // Existing findings, no action needed
        reopen: [],      // Previously resolved findings now back (regression)
        update: []       // Existing findings with changes
    };
    
    log('blue', 'Analyzing findings against historical registry...');
    
    newFindings.forEach((finding, index) => {
        const fingerprint = generateFingerprint(finding, domainName);
        const existing = findByFingerprint(registry, fingerprint);
        
        if (!existing) {
            // NEW: Never seen this issue before
            actions.create.push({
                finding: finding,
                fingerprint: fingerprint,
                reason: 'New issue discovered'
            });
            log('green', `  NEW: ${fingerprint}`);
            
        } else if (existing.status === 'resolved') {
            // REGRESSION: Previously resolved, now back!
            actions.reopen.push({
                finding: finding,
                fingerprint: fingerprint,
                existing: existing,
                reason: 'Previously resolved issue has returned'
            });
            log('red', `  REGRESSION: ${fingerprint} (was resolved ${existing.resolved_date})`);
            
        } else if (existing.status === 'active') {
            // EXISTING: Already in registry and still active
            actions.skip.push({
                finding: finding,
                fingerprint: fingerprint,
                existing: existing,
                reason: 'Issue already tracked and active'
            });
            log('yellow', `  EXISTING: ${fingerprint} (seen ${existing.weeks_seen} times)`);
            
        } else {
            // UPDATE: Some other status change
            actions.update.push({
                finding: finding,
                fingerprint: fingerprint,
                existing: existing,
                reason: 'Status or details changed'
            });
            log('blue', `  UPDATE: ${fingerprint}`);
        }
    });
    
    // Check for resolved issues (in registry but not in current findings)
    const resolved = [];
    registry.findings.forEach(registryFinding => {
        if (registryFinding.status === 'active') {
            const stillExists = newFindings.some(f => 
                generateFingerprint(f, domainName) === registryFinding.fingerprint
            );
            
            if (!stillExists) {
                resolved.push({
                    fingerprint: registryFinding.fingerprint,
                    existing: registryFinding,
                    reason: 'Issue no longer found in scan'
                });
                log('green', `  RESOLVED: ${registryFinding.fingerprint}`);
            }
        }
    });
    
    // Update registry with processed findings
    log('blue', 'Updating historical registry...');
    
    const currentDate = new Date().toISOString();
    const scanDate = scanResults.scan_metadata?.date || currentDate.split('T')[0];
    
    // Add new findings to registry
    actions.create.forEach(action => {
        registry.findings.push({
            fingerprint: action.fingerprint,
            first_seen: scanDate,
            last_seen: scanDate,
            status: 'active',
            weeks_seen: 1,
            scan_history: [scanDate],
            backlog_task_id: null, // Will be set when task is created
            finding_data: action.finding
        });
    });
    
    // Update existing findings
    actions.skip.forEach(action => {
        const existing = action.existing;
        existing.last_seen = scanDate;
        existing.weeks_seen = (existing.weeks_seen || 0) + 1;
        if (!existing.scan_history.includes(scanDate)) {
            existing.scan_history.push(scanDate);
        }
        // Update finding data in case details changed
        existing.finding_data = action.finding;
    });
    
    // Reopen resolved findings (regressions)
    actions.reopen.forEach(action => {
        const existing = action.existing;
        existing.status = 'regressed';
        existing.last_seen = scanDate;
        existing.regressed_date = currentDate;
        if (!existing.scan_history.includes(scanDate)) {
            existing.scan_history.push(scanDate);
        }
        existing.finding_data = action.finding;
    });
    
    // Mark resolved findings
    resolved.forEach(action => {
        const existing = action.existing;
        existing.status = 'resolved';
        existing.resolved_date = currentDate;
    });
    
    // Update registry metadata
    registry.last_updated = currentDate;
    registry.statistics = {
        total_findings_ever: registry.findings.length,
        active_findings: registry.findings.filter(f => f.status === 'active').length,
        resolved_findings: registry.findings.filter(f => f.status === 'resolved').length,
        regressed_findings: registry.findings.filter(f => f.status === 'regressed').length,
        findings_by_severity: {},
        findings_by_category: {}
    };
    
    // Add this scan to history
    if (!registry.scan_history) registry.scan_history = [];
    registry.scan_history.push({
        date: scanDate,
        timestamp: currentDate,
        files_scanned: scanResults.scan_metadata?.files_scanned || 0,
        findings_count: newFindings.length,
        new_findings: actions.create.length,
        resolved_findings: resolved.length,
        regressed_findings: actions.reopen.length
    });
    
    // Save updated registry
    saveJSON(registryFile, registry);
    log('green', '✓ Registry updated successfully');
    
    // Generate action report
    const reportFile = path.join(domainDir, 'historical', `${scanDate}-processing-report.json`);
    const report = {
        scan_date: scanDate,
        processed_at: currentDate,
        domain: domainName,
        summary: {
            new_findings: actions.create.length,
            existing_findings: actions.skip.length,
            regressed_findings: actions.reopen.length,
            resolved_findings: resolved.length,
            total_processed: newFindings.length
        },
        actions: {
            create: actions.create,
            skip: actions.skip,
            reopen: actions.reopen,
            resolved: resolved
        },
        registry_stats: registry.statistics
    };
    
    saveJSON(reportFile, report);
    log('green', `✓ Processing report saved: ${reportFile}`);
    
    // Print summary
    log('blue', '=== Processing Summary ===');
    log('green', `✓ New findings to create tasks: ${actions.create.length}`);
    log('yellow', `→ Existing findings (skipped): ${actions.skip.length}`);
    log('red', `⚠ Regressed findings (reopen): ${actions.reopen.length}`);
    log('green', `✓ Resolved findings (close): ${resolved.length}`);
    
    if (actions.create.length > 0) {
        log('blue', 'New findings requiring backlog tasks:');
        actions.create.forEach(action => {
            log('green', `  → ${action.fingerprint} (${action.finding.severity})`);
        });
    }
    
    if (actions.reopen.length > 0) {
        log('red', 'REGRESSIONS requiring immediate attention:');
        actions.reopen.forEach(action => {
            log('red', `  ⚠ ${action.fingerprint} (was resolved ${action.existing.resolved_date})`);
        });
    }
    
    log('green', '=== Deduplication Processing Complete ===');
    log('yellow', `Next: Review report at ${reportFile}`);
    
    return report;
}

// Main execution
if (require.main === module) {
    const domainName = process.argv[2];
    const scanResultsFile = process.argv[3];
    
    if (!domainName || !scanResultsFile) {
        log('red', 'Usage: node process-findings.js <domain-name> <scan-results-file>');
        process.exit(1);
    }
    
    try {
        processFindings(domainName, scanResultsFile);
    } catch (error) {
        log('red', `Error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = { processFindings };
