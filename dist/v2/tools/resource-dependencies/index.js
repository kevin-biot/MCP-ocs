/**
 * Resource Dependency Analyzer v2.0
 *
 * Maps OpenShift/Kubernetes resource relationships for complex troubleshooting
 */
export class ResourceDependencyAnalyzer {
    ocWrapper;
    constructor(ocWrapper) {
        this.ocWrapper = ocWrapper;
    }
    async analyzeDependencies(input) {
        const { resourceType, resourceName, namespace } = input;
        const graph = {
            resourceType, resourceName, namespace,
            edges: [], hotspots: [],
            summary: { totalResources: 0, brokenDependencies: 0, healthyDependencies: 0 },
            recommendations: [], human: ''
        };
        try {
            switch (resourceType) {
                case 'pod':
                    await this.analyzePodDependencies(namespace, resourceName, graph);
                    break;
                case 'deployment':
                    await this.analyzeDeploymentDependencies(namespace, resourceName, graph);
                    break;
            }
            this.analyzeGraphHealth(graph);
            this.generateRecommendations(graph);
            graph.human = this.generateHumanSummary(graph);
            return graph;
        }
        catch (error) {
            throw new Error(`Dependency analysis failed: ${error instanceof Error ? error.message : 'Unknown'}`);
        }
    }
    async analyzePodDependencies(namespace, podName, graph) {
        try {
            const podResult = await this.ocWrapper.executeOc(['get', 'pod', podName, '-o', 'json'], { namespace });
            const pod = JSON.parse(podResult.stdout);
            // 1. Owner references
            await this.traceOwnerReferences(pod, graph);
            // 2. Volume dependencies
            await this.traceVolumeDependencies(pod, graph);
            // 3. Service selection
            await this.traceServiceSelection(namespace, pod, graph);
        }
        catch (error) {
            graph.hotspots.push(`Failed to analyze pod ${podName}: ${error instanceof Error ? error.message : 'Error'}`);
        }
    }
    async traceOwnerReferences(resource, graph) {
        const ownerRefs = resource.metadata?.ownerReferences || [];
        for (const owner of ownerRefs) {
            const ownerKey = `${owner.kind.toLowerCase()}/${owner.name}`;
            const resourceKey = `pod/${resource.metadata.name}`;
            graph.edges.push({
                from: ownerKey, to: resourceKey,
                relationship: 'owns', status: 'healthy',
                details: `${owner.kind} owns Pod`
            });
        }
    }
    async traceVolumeDependencies(pod, graph) {
        const volumes = pod.spec?.volumes || [];
        const namespace = pod.metadata.namespace;
        for (const volume of volumes) {
            if (volume.persistentVolumeClaim) {
                const pvcName = volume.persistentVolumeClaim.claimName;
                const podKey = `pod/${pod.metadata.name}`;
                const pvcKey = `pvc/${pvcName}`;
                try {
                    const pvcResult = await this.ocWrapper.executeOc(['get', 'pvc', pvcName, '-o', 'json'], { namespace });
                    const pvc = JSON.parse(pvcResult.stdout);
                    const pvcStatus = pvc.status?.phase;
                    graph.edges.push({
                        from: podKey, to: pvcKey,
                        relationship: 'mounts',
                        status: pvcStatus === 'Bound' ? 'healthy' : 'broken',
                        details: `Pod mounts PVC (status: ${pvcStatus})`
                    });
                    if (pvcStatus !== 'Bound') {
                        graph.hotspots.push(`PVC ${pvcName} is ${pvcStatus}`);
                    }
                }
                catch (error) {
                    graph.hotspots.push(`PVC ${pvcName} not found or inaccessible`);
                }
            }
        }
    }
    async traceServiceSelection(namespace, pod, graph) {
        try {
            const servicesResult = await this.ocWrapper.executeOc(['get', 'services', '-o', 'json'], { namespace });
            const services = JSON.parse(servicesResult.stdout);
            const podLabels = pod.metadata?.labels || {};
            const podKey = `pod/${pod.metadata.name}`;
            for (const service of services.items) {
                const serviceSelector = service.spec?.selector || {};
                const isSelected = Object.entries(serviceSelector).every(([key, value]) => podLabels[key] === value);
                if (isSelected) {
                    const serviceKey = `service/${service.metadata.name}`;
                    graph.edges.push({
                        from: serviceKey, to: podKey,
                        relationship: 'selects', status: 'healthy',
                        details: `Service selects pod via labels`
                    });
                }
            }
        }
        catch (error) {
            graph.hotspots.push(`Failed to analyze service selection: ${error instanceof Error ? error.message : 'Error'}`);
        }
    }
    async analyzeDeploymentDependencies(namespace, deploymentName, graph) {
        // Implementation for deployment analysis
        try {
            const deploymentResult = await this.ocWrapper.executeOc(['get', 'deployment', deploymentName, '-o', 'json'], { namespace });
            const deployment = JSON.parse(deploymentResult.stdout);
            // Find owned ReplicaSets and Pods
            const replicaSetsResult = await this.ocWrapper.executeOc(['get', 'replicasets', '-o', 'json'], { namespace });
            const replicaSets = JSON.parse(replicaSetsResult.stdout);
            const deploymentKey = `deployment/${deploymentName}`;
            for (const rs of replicaSets.items) {
                const ownerRefs = rs.metadata?.ownerReferences || [];
                const isOwned = ownerRefs.some((ref) => ref.kind === 'Deployment' && ref.name === deploymentName);
                if (isOwned) {
                    const rsKey = `replicaset/${rs.metadata.name}`;
                    graph.edges.push({
                        from: deploymentKey, to: rsKey,
                        relationship: 'manages', status: 'healthy',
                        details: 'Deployment manages ReplicaSet'
                    });
                }
            }
        }
        catch (error) {
            graph.hotspots.push(`Failed to analyze deployment: ${error instanceof Error ? error.message : 'Error'}`);
        }
    }
    analyzeGraphHealth(graph) {
        const resources = new Set();
        let broken = 0, healthy = 0;
        for (const edge of graph.edges) {
            resources.add(edge.from);
            resources.add(edge.to);
            if (edge.status === 'broken')
                broken++;
            else if (edge.status === 'healthy')
                healthy++;
        }
        graph.summary = {
            totalResources: resources.size,
            brokenDependencies: broken,
            healthyDependencies: healthy
        };
    }
    generateRecommendations(graph) {
        const recs = [];
        if (graph.hotspots.some(h => h.includes('PVC') && h.includes('Pending'))) {
            recs.push('Check StorageClass: oc get sc');
        }
        if (graph.hotspots.some(h => h.includes('endpoints'))) {
            recs.push('Check service endpoints: oc get endpoints -n ' + graph.namespace);
        }
        graph.recommendations = recs.slice(0, 3);
    }
    generateHumanSummary(graph) {
        return `${graph.resourceType}/${graph.resourceName}: ${graph.summary.totalResources} resources, ` +
            `${graph.summary.brokenDependencies} issues found. ${graph.hotspots.length > 0 ?
                'Key issues: ' + graph.hotspots.slice(0, 2).join('; ') : 'All dependencies healthy'}.`;
    }
}
