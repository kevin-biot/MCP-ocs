/**
 * Unit tests for ToolNamespaceManager and ToolRegistry (namespace-aware)
 */

import {
  ToolNamespaceManager,
  ToolRegistry,
  type NamespaceConfig,
  type OperationalContext,
  type ToolDefinition,
} from '../../../src/lib/tools/namespace-manager';

describe('ToolNamespaceManager + ToolRegistry', () => {
  let manager: ToolNamespaceManager;
  let registry: ToolRegistry;
  let restoreConsole: (() => void) | null = null;

  function silenceConsole() {
    const mocks: jest.SpyInstance[] = [];
    mocks.push(jest.spyOn(console, 'error').mockImplementation(() => {}));
    mocks.push(jest.spyOn(console, 'warn').mockImplementation(() => {}));
    mocks.push(jest.spyOn(console, 'log').mockImplementation(() => {}));
    return () => mocks.forEach((m) => m.mockRestore());
  }

  beforeEach(() => {
    // Silence console before constructing manager to avoid init logs
    restoreConsole = silenceConsole();

    const cfg: NamespaceConfig = {
      mode: 'single',
      enabledDomains: ['cluster', 'filesystem', 'knowledge', 'system'],
      contextFiltering: true,
      currentContext: 'general',
    };
    manager = new ToolNamespaceManager(cfg);
    registry = new ToolRegistry(manager);
  });

  afterEach(() => {
    if (restoreConsole) restoreConsole();
  });

  function makeToolDef(partial: Partial<ToolDefinition>): ToolDefinition {
    return {
      name: 'read_file',
      namespace: 'mcp-files',
      fullName: 'file_read_file',
      domain: 'filesystem',
      capabilities: [{ type: 'read', level: 'basic', riskLevel: 'safe' }],
      dependencies: [],
      contextRequirements: [],
      description: 'read',
      inputSchema: { type: 'object' },
      priority: 10,
      ...partial,
    } as ToolDefinition;
  }

  it('enables expected namespaces in single mode with cluster active', async () => {
    const ctx: OperationalContext = {
      mode: 'single',
      primaryDomain: 'cluster',
      activeDomains: ['cluster', 'filesystem', 'knowledge', 'system'],
      workflowPhase: 'diagnostic',
      environment: 'dev',
      contextType: 'file_memory',
    };
    await manager.setOperationalContext(ctx);
    const enabled = manager.getEnabledNamespaces(ctx);
    // Single stream allows these; file_memory filtering should not remove them
    expect(enabled).toEqual(
      expect.arrayContaining(['mcp-core', 'mcp-files', 'mcp-memory', 'mcp-openshift'])
    );
    // Atlassian is excluded in single stream
    expect(enabled).not.toContain('mcp-atlassian');
  });

  it('rejects tool with wrong fullName prefix for namespace', async () => {
    const bad = makeToolDef({ fullName: 'wrong_read_file' });
    await expect(registry.registerTool(bad)).rejects.toThrow(/does not follow namespace prefix/);
  });

  it('flags conflicts via warning when conflicting tool already registered', async () => {
    const a = makeToolDef({ name: 'a', fullName: 'file_a' });
    const b = makeToolDef({ name: 'b', fullName: 'file_b', conflictsWith: ['file_a'] as any });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await registry.registerTool(a);
    await registry.registerTool(b); // should warn but still register
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('filters tools by enabled namespaces and context requirements', async () => {
    const ctx: OperationalContext = {
      mode: 'single',
      primaryDomain: 'cluster',
      activeDomains: ['cluster', 'filesystem', 'knowledge', 'system'],
      workflowPhase: 'diagnostic',
      environment: 'test',
      contextType: 'file_memory',
    };
    await manager.setOperationalContext(ctx);

    // Files tool is in enabled namespace and meets env requirement
    const fileTool = makeToolDef({
      name: 'list',
      fullName: 'file_list_directory',
      contextRequirements: [{ type: 'environment', value: 'test', required: true } as any],
    });

    // Atlassian tool should be excluded by domain filtering in file_memory context
    const atlassianTool = makeToolDef({
      name: 'get_issue',
      namespace: 'mcp-atlassian',
      fullName: 'atlassian_get_issue',
      domain: 'collaboration',
    });

    await registry.registerTool(fileTool);
    await registry.registerTool(atlassianTool);

    const available = await registry.getAvailableTools(ctx);
    const names = available.map((t) => t.fullName);
    expect(names).toContain('file_list_directory');
    expect(names).not.toContain('atlassian_get_issue');
  });

  it('sorts tools by relevance (domain boosts, prefix boosts, and priority) and penalizes writes in diagnostic phase', async () => {
    const ctx: OperationalContext = {
      mode: 'single',
      primaryDomain: 'cluster',
      activeDomains: ['cluster', 'filesystem', 'knowledge', 'system'],
      workflowPhase: 'diagnostic',
      environment: 'dev',
      contextType: 'cluster_ops',
    };
    await manager.setOperationalContext(ctx);

    const ocRead = makeToolDef({
      name: 'describe_pod',
      namespace: 'mcp-openshift',
      fullName: 'oc_describe_pod',
      domain: 'cluster',
      capabilities: [{ type: 'read', level: 'basic', riskLevel: 'safe' }],
      priority: 5,
    });

    const fileRead = makeToolDef({ name: 'read_file', fullName: 'file_read_file', priority: 20 });

    const ocWrite = makeToolDef({
      name: 'apply_config',
      namespace: 'mcp-openshift',
      fullName: 'oc_apply_config',
      domain: 'cluster',
      capabilities: [{ type: 'write', level: 'advanced', riskLevel: 'dangerous' }],
      // Base priority set low enough that diagnostic write penalty drops it below ocRead
      priority: 10,
    });

    await registry.registerTool(ocRead);
    await registry.registerTool(fileRead);
    await registry.registerTool(ocWrite);

    const available = await registry.getAvailableTools(ctx);
    const ordered = available.map((t) => t.fullName);
    // oc_* gets priorityBoost in cluster_ops, and domain matches primaryDomain
    expect(ordered.indexOf('oc_describe_pod')).toBeLessThan(ordered.indexOf('file_read_file'));
    // write tool should be penalized in diagnostic phase despite high base priority
    expect(ordered.indexOf('oc_describe_pod')).toBeLessThan(ordered.indexOf('oc_apply_config'));
  });
});
