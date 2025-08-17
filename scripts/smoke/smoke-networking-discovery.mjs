#!/usr/bin/env node
// Local smoke: demonstrate Route→Service→BackendPod discovery and variable resolution
// Uses fabricated outputs to keep it offline and fast.

function extractServiceFromRouteDescribe(text){
  const m = String(text||'').match(/Service\s*:\s*([A-Za-z0-9-_.]+)/);
  return m ? m[1] : null;
}

function pickBackendPodFromPodsList(pods){
  const list = Array.isArray(pods) ? pods : [];
  const ready = list.find(p=>String(p?.ready||'')==='1/1');
  return (ready?.name) || (list[0]?.name) || null;
}

function main(){
  const vars = { ns:'demo-ns', route:'route-a' };
  // Step 1: simulate route describe → infer service
  const routeDescribe = 'Name: route-a\nNamespace: demo-ns\nService: svc-a\nTLS: edge';
  const service = extractServiceFromRouteDescribe(routeDescribe);
  if (service) vars.service = service;
  // Step 2: simulate get pods by service selector → choose backend pod
  const simulatedPods = [ { name:'pod-a', ready:'1/1' }, { name:'pod-b', ready:'0/1' } ];
  const backendPod = pickBackendPodFromPodsList(simulatedPods);
  if (backendPod) vars.backendPod = backendPod;
  // Resolved steps for route-5xx template
  const steps = [
    { tool:'oc_read_describe', params: { resourceType:'endpoints', namespace: vars.ns, name: vars.service } },
    { tool:'oc_read_describe', params: { resourceType:'route', namespace: vars.ns, name: vars.route } },
    { tool:'oc_read_describe', params: { resourceType:'pod', namespace: vars.ns, name: vars.backendPod } }
  ];
  const out = { input: { ns:vars.ns, route:vars.route }, inferred: { service:vars.service, backendPod:vars.backendPod }, steps };
  console.log(JSON.stringify(out, null, 2));
}

main();

