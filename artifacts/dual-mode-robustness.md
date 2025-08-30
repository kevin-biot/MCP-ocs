# Dual-mode Robustness Report

| Scenario | Model | structuralStable | toolSuccessRate | jsonValidRate | answerStability | rubricStability | jsonEqual | rubricEqual | PASS |
|---|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| ingress-pending-demo | mistralai/devstral-small-2507 | ✔ | 1.00 | 0.00 | 0.00 | 1.00 | ✖ | ✖ | ✖ |
| ingress-pending-demo | qwen/qwen3-coder-30b | ✔ | 1.00 | 1.00 | 0.33 | 1.00 | ✖ | ✖ | ✖ |
| route-5xx-demo | mistralai/devstral-small-2507 | ✔ | 1.00 | 0.00 | 0.00 | 1.00 | ✖ | ✖ | ✖ |
| route-5xx-demo | qwen/qwen3-coder-30b | ✔ | 1.00 | 1.00 | 1.00 | 1.00 | ✖ | ✖ | ✖ |
| pvc-binding-demo | mistralai/devstral-small-2507 | ✔ | 1.00 | 1.00 | 1.00 | 1.00 | ✖ | ✖ | ✖ |
| pvc-binding-demo | qwen/qwen3-coder-30b | ✔ | 1.00 | 1.00 | 1.00 | 1.00 | ✖ | ✖ | ✖ |
| scheduling-failures-demo | mistralai/devstral-small-2507 | ✔ | 1.00 | 0.00 | 0.00 | 1.00 | ✖ | ✖ | ✖ |
| scheduling-failures-demo | qwen/qwen3-coder-30b | ✖ | 1.00 | 1.00 | 0.33 | 1.00 | ✖ | ✖ | ✖ |
| cluster-health-demo | mistralai/devstral-small-2507 | ✔ | 1.00 | 1.00 | 1.00 | 1.00 | ✖ | ✖ | ✖ |
| cluster-health-demo | qwen/qwen3-coder-30b | ✖ | 1.00 | 0.67 | 0.33 | 1.00 | ✖ | ✖ | ✖ |

## Failures and Diagnoses
- ingress-pending-demo × mistralai/devstral-small-2507
  - Transcript diff (first pair):
    # logs/transcripts/ingress-pending-demo/ingress-pending-demo__mistralai_devstral-small-2507__t0_p1_s7__1755543248657.json <> logs/transcripts/ingress-pending-demo/ingress-pending-demo__mistralai_devstral-small-2507__t0_p1_s13__1755543267347.json
      idx=0 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-ingress"},"dataHash":"44837838"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-ingress"},"dataHash":"56bbe9fb"}
    
- ingress-pending-demo × qwen/qwen3-coder-30b
  - Observed evidence_keys: router_pods_pending, no_evidence
  - JSON diff: priority: LLM=P1 vs ENG=P2; confidence: LLM=High vs ENG=Low; slo: LLM= vs ENG=CRITICAL; evidence_keys: LLM=["no_evidence","router_pods_pending"] vs ENG=["ingress_controller_degraded","router_pods_pending"]
  - Transcript diff (first pair):
    # logs/transcripts/ingress-pending-demo/ingress-pending-demo__qwen_qwen3-coder-30b__t0_p1_s7__1755542819673.json <> logs/transcripts/ingress-pending-demo/ingress-pending-demo__qwen_qwen3-coder-30b__t0_p1_s13__1755542821387.json
      idx=0 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-ingress","selector":"app=router"},"dataHash":"93846ed8"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-ingress","selector":"app=router"},"dataHash":"f7aebd81"}
    
- route-5xx-demo × mistralai/devstral-small-2507
  - Transcript diff (first pair):
    # logs/transcripts/route-5xx-demo/route-5xx-demo__mistralai_devstral-small-2507__t0_p1_s7__1755543379728.json <> logs/transcripts/route-5xx-demo/route-5xx-demo__mistralai_devstral-small-2507__t0_p1_s13__1755543393335.json
      idx=0 A={"name":"oc_read_describe","args":{"resourceType":"endpoints","namespace":"openshift-gitops"},"dataHash":"844baf1c"} B={"name":"oc_read_describe","args":{"resourceType":"endpoints","namespace":"openshift-gitops"},"dataHash":"2ae6d23b"}
    
- route-5xx-demo × qwen/qwen3-coder-30b
  - Observed evidence_keys: route_tls_mismatch, backend_pods_failing
  - JSON diff: slo: LLM= vs ENG=HIGH; evidence_keys: LLM=["backend_pods_failing","route_tls_mismatch"] vs ENG=["backend_pods_failing","service_selector_mismatch"]
  - Transcript diff (first pair):
    # logs/transcripts/route-5xx-demo/route-5xx-demo__qwen_qwen3-coder-30b__t0_p1_s7__1755542846148.json <> logs/transcripts/route-5xx-demo/route-5xx-demo__qwen_qwen3-coder-30b__t0_p1_s13__1755542850358.json
      idx=0 A={"name":"oc_read_describe","args":{"resourceType":"Route","namespace":"openshift-gitops","name":"openshift-gitops-server"},"dataHash":"ef1ada5b"} B={"name":"oc_read_describe","args":{"resourceType":"Route","namespace":"openshift-gitops","name":"openshift-gitops-server"},"dataHash":"8313b7b4"}
      idx=1 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-gitops","selector":"app.kubernetes.io/name=openshift-gitops-server"},"dataHash":"c7979e44"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-gitops","selector":"app.kubernetes.io/name=openshift-gitops-server"},"dataHash":"6ad7ace5"}
    
- pvc-binding-demo × mistralai/devstral-small-2507
  - Observed evidence_keys: no_evidence
  - JSON diff: slo: LLM= vs ENG=HIGH
  - Transcript diff (first pair):
    # logs/transcripts/pvc-binding-demo/pvc-binding-demo__mistralai_devstral-small-2507__t0_p1_s7__1755543420589.json <> logs/transcripts/pvc-binding-demo/pvc-binding-demo__mistralai_devstral-small-2507__t0_p1_s13__1755543427141.json
      idx=0 A={"name":"oc_read_describe","args":{"resourceType":"pvc","namespace":"test-student","name":"shared-pvc"},"dataHash":"bc64752b"} B={"name":"oc_read_describe","args":{"resourceType":"pvc","namespace":"test-student","name":"shared-pvc"},"dataHash":"333e6169"}
    
- pvc-binding-demo × qwen/qwen3-coder-30b
  - Observed evidence_keys: pvc_pending, storage_class_missing, no_evidence
  - JSON diff: priority: LLM=P2 vs ENG=P3; confidence: LLM=Medium vs ENG=Low; slo: LLM= vs ENG=HIGH; evidence_keys: LLM=["no_evidence","pvc_pending","storage_class_missing"] vs ENG=["no_evidence"]
  - Transcript diff (first pair):
    # logs/transcripts/pvc-binding-demo/pvc-binding-demo__qwen_qwen3-coder-30b__t0_p1_s7__1755542867948.json <> logs/transcripts/pvc-binding-demo/pvc-binding-demo__qwen_qwen3-coder-30b__t0_p1_s13__1755542872314.json
      idx=0 A={"name":"oc_read_describe","args":{"resourceType":"persistentvolumeclaim","namespace":"test-student","name":"shared-pvc"},"dataHash":"f180118c"} B={"name":"oc_read_describe","args":{"resourceType":"persistentvolumeclaim","namespace":"test-student","name":"shared-pvc"},"dataHash":"1e5111e1"}
      idx=1 A={"name":"oc_read_describe","args":{"resourceType":"storageclass","name":"gp3-csi"},"dataHash":"0039b634"} B={"name":"oc_read_describe","args":{"resourceType":"storageclass","name":"gp3-csi"},"dataHash":"057f01fb"}
      idx=2 A={"name":"oc_read_describe","args":{"resourceType":"resourcequota","namespace":"test-student"},"dataHash":"d3d977c9"} B={"name":"oc_read_describe","args":{"resourceType":"resourcequota","namespace":"test-student"},"dataHash":"44b3207a"}
    
- scheduling-failures-demo × mistralai/devstral-small-2507
  - Transcript diff (first pair):
    # logs/transcripts/scheduling-failures-demo/scheduling-failures-demo__mistralai_devstral-small-2507__t0_p1_s7__1755543562979.json <> logs/transcripts/scheduling-failures-demo/scheduling-failures-demo__mistralai_devstral-small-2507__t0_p1_s13__1755543709425.json
      idx=0 A={"name":"oc_read_describe","args":{"resourceType":"pod","namespace":"openshift-gitops","name":"openshift-gitops-repo-server-5cddfbc756-gdcd4"},"dataHash":"a8bc1a71"} B={"name":"oc_read_describe","args":{"resourceType":"pod","namespace":"openshift-gitops","name":"openshift-gitops-repo-server-5cddfbc756-gdcd4"},"dataHash":"4353ba48"}
    
- scheduling-failures-demo × qwen/qwen3-coder-30b
  - Observed evidence_keys: failed_scheduling, node_taints, machineset_zone_skew
  - JSON diff: priority: LLM=P1 vs ENG=P3; slo: LLM= vs ENG=LOW
  - Transcript diff (first pair):
    # logs/transcripts/scheduling-failures-demo/scheduling-failures-demo__qwen_qwen3-coder-30b__t0_p1_s7__1755542890085.json <> logs/transcripts/scheduling-failures-demo/scheduling-failures-demo__qwen_qwen3-coder-30b__t0_p1_s13__1755542897868.json
      idx=0 A={"name":"oc_read_describe","args":{"resourceType":"pod","namespace":"openshift-gitops","name":"openshift-gitops-repo-server-5cddfbc756-gdcd4"},"dataHash":"461bd718"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-gitops","selector":"name=openshift-gitops-repo-server-5cddfbc756-gdcd4"},"dataHash":"926b1de6"}
      idx=1 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-gitops","selector":"app.kubernetes.io/name=repo-server"},"dataHash":"4b1b6cd3"} B={"name":"oc_read_describe","args":{"resourceType":"pod","namespace":"openshift-gitops","name":"openshift-gitops-repo-server-5cddfbc756-gdcd4"},"dataHash":"84638a9f"}
      idx=2 A={"name":"oc_read_describe","args":{"resourceType":"machineset","namespace":"openshift-machine-api","name":"ocp-5428f-worker-us-east-1a"},"dataHash":"728c38a3"} B={"name":"oc_read_describe","args":{"resourceType":"node","name":"ip-10-0-123-456.ec2.internal"},"dataHash":"43628653"}
      idx=3 A=null B={"name":"oc_read_describe","args":{"resourceType":"machineset","namespace":"openshift-machine-api","name":"ocp-4123-5g89s-worker-us-east-1a"},"dataHash":"ffeb44b8"}
    
- cluster-health-demo × mistralai/devstral-small-2507
  - Observed evidence_keys: no_evidence
  - JSON diff: priority: LLM=P2 vs ENG=P3; confidence: LLM=Medium vs ENG=Low; slo: LLM= vs ENG=LOW
  - Transcript diff (first pair):
    # logs/transcripts/cluster-health-demo/cluster-health-demo__mistralai_devstral-small-2507__t0_p1_s7__1755543789590.json <> logs/transcripts/cluster-health-demo/cluster-health-demo__mistralai_devstral-small-2507__t0_p1_s13__1755543805165.json
      idx=0 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-operator-lifecycle-manager","selector":"clusteroperator"},"dataHash":"79cb9fff"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-operator-lifecycle-manager","selector":"clusteroperator"},"dataHash":"03d5980a"}
    
- cluster-health-demo × qwen/qwen3-coder-30b
  - Observed evidence_keys: ingress_controller_degraded, network_degraded, storage_degraded, control_plane_unhealthy
  - JSON diff: priority: LLM=P1 vs ENG=P3; confidence: LLM=High vs ENG=Low; slo: LLM= vs ENG=LOW; evidence_keys: LLM=["ingress_controller_degraded","network_degraded","storage_degraded"] vs ENG=["no_evidence"]
  - Transcript diff (first pair):
    # logs/transcripts/cluster-health-demo/cluster-health-demo__qwen_qwen3-coder-30b__t0_p1_s7__1755542954183.json <> logs/transcripts/cluster-health-demo/cluster-health-demo__qwen_qwen3-coder-30b__t0_p1_s13__1755542985370.json
      idx=0 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-operator-lifecycle-manager"},"dataHash":"39c8e76d"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-operator-lifecycle-manager"},"dataHash":"6e1abfec"}
      idx=1 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-ingress-operator"},"dataHash":"413bc270"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-ingress-operator"},"dataHash":"b575fcb0"}
      idx=2 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-network-operator"},"dataHash":"0ff445cc"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-network-operator"},"dataHash":"fcbf24cb"}
      idx=3 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-storage"},"dataHash":"91a515d7"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-storage"},"dataHash":"aeed18ee"}
      idx=4 A={"name":"oc_read_describe","args":{"resourceType":"ClusterOperator","namespace":"openshift-ingress-operator","name":"ingress"},"dataHash":"4d647692"} B={"name":"oc_read_describe","args":{"resourceType":"ClusterOperator","name":"ingress"},"dataHash":"d7ee74c8"}
      idx=5 A={"name":"oc_read_describe","args":{"resourceType":"ClusterOperator","namespace":"openshift-network-operator","name":"network"},"dataHash":"9a2e28e1"} B={"name":"oc_read_describe","args":{"resourceType":"ClusterOperator","name":"network"},"dataHash":"c8de3ba6"}
      idx=6 A={"name":"oc_read_describe","args":{"resourceType":"ClusterOperator","namespace":"openshift-storage","name":"storage"},"dataHash":"4e1152d7"} B={"name":"oc_read_describe","args":{"resourceType":"ClusterOperator","name":"storage"},"dataHash":"0782e3cf"}
      idx=7 A={"name":"oc_read_describe","args":{"resourceType":"ClusterOperator","namespace":"openshift-cluster-version","nam