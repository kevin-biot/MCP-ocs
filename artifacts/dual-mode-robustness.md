# Dual-mode Robustness Report

| Scenario | Model | structuralStable | toolSuccessRate | jsonValidRate | answerStability | rubricStability | jsonEqual | rubricEqual | PASS |
|---|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| ingress-pending-demo | mistralai/devstral-small-2507 | ✔ | 1.00 | 0.00 | 0.00 | 1.00 | ✖ | ✖ | ✖ |
| ingress-pending-demo | qwen/qwen3-coder-30b | ✔ | 1.00 | 1.00 | 0.33 | 1.00 | ✖ | ✖ | ✖ |
| route-5xx-demo | mistralai/devstral-small-2507 | ✔ | 1.00 | 0.00 | 0.00 | 1.00 | ✖ | ✖ | ✖ |
| route-5xx-demo | qwen/qwen3-coder-30b | ✔ | 1.00 | 1.00 | 0.33 | 1.00 | ✖ | ✖ | ✖ |
| pvc-binding-demo | mistralai/devstral-small-2507 | ✔ | 1.00 | 0.33 | 0.00 | 1.00 | ✖ | ✖ | ✖ |
| pvc-binding-demo | qwen/qwen3-coder-30b | ✔ | 1.00 | 1.00 | 0.33 | 1.00 | ✖ | ✖ | ✖ |
| scheduling-failures-demo | mistralai/devstral-small-2507 | ✔ | 1.00 | 0.00 | 0.00 | 1.00 | ✖ | ✖ | ✖ |
| scheduling-failures-demo | qwen/qwen3-coder-30b | ✖ | 1.00 | 1.00 | 0.33 | 1.00 | ✖ | ✖ | ✖ |
| cluster-health-demo | mistralai/devstral-small-2507 | ✔ | 1.00 | 0.33 | 0.00 | 1.00 | ✖ | ✖ | ✖ |
| cluster-health-demo | qwen/qwen3-coder-30b | ✖ | 1.00 | 0.33 | 0.33 | 1.00 | ✖ | ✖ | ✖ |

## Failures and Diagnoses
- ingress-pending-demo × mistralai/devstral-small-2507
  - Transcript diff (first pair):
    # logs/transcripts/ingress-pending-demo/ingress-pending-demo__mistralai_devstral-small-2507__t0_p1_s7__1755512276989.json <> logs/transcripts/ingress-pending-demo/ingress-pending-demo__mistralai_devstral-small-2507__t0_p1_s13__1755512309272.json
      idx=0 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-ingress"},"dataHash":"77d858c4"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-ingress"},"dataHash":"a62ba773"}
    
- ingress-pending-demo × qwen/qwen3-coder-30b
  - Observed evidence_keys: router_pods_pending, no_evidence
  - JSON diff: priority: LLM=P1 vs ENG=P2; confidence: LLM=High vs ENG=Low; slo: LLM= vs ENG=CRITICAL; evidence_keys: LLM=["no_evidence","router_pods_pending"] vs ENG=["ingress_controller_degraded","router_pods_pending"]
  - Transcript diff (first pair):
    # logs/transcripts/ingress-pending-demo/ingress-pending-demo__qwen_qwen3-coder-30b__t0_p1_s7__1755511989747.json <> logs/transcripts/ingress-pending-demo/ingress-pending-demo__qwen_qwen3-coder-30b__t0_p1_s13__1755511991563.json
      idx=0 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-ingress","selector":"app=router"},"dataHash":"75e326cd"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-ingress","selector":"app=router"},"dataHash":"3645e44c"}
    
- route-5xx-demo × mistralai/devstral-small-2507
  - Transcript diff (first pair):
    # logs/transcripts/route-5xx-demo/route-5xx-demo__mistralai_devstral-small-2507__t0_p1_s7__1755512409858.json <> logs/transcripts/route-5xx-demo/route-5xx-demo__mistralai_devstral-small-2507__t0_p1_s13__1755512428389.json
      idx=0 A={"name":"oc_read_describe","args":{"resourceType":"endpoints","namespace":"shop"},"dataHash":"0d898b07"} B={"name":"oc_read_describe","args":{"resourceType":"endpoints","namespace":"shop"},"dataHash":"aeb74e8a"}
    
- route-5xx-demo × qwen/qwen3-coder-30b
  - Observed evidence_keys: no_evidence, endpoints_empty, backend_pods_failing
  - JSON diff: priority: LLM=P1 vs ENG=P2; confidence: LLM=High vs ENG=Low; slo: LLM= vs ENG=HIGH
  - Transcript diff (first pair):
    # logs/transcripts/route-5xx-demo/route-5xx-demo__qwen_qwen3-coder-30b__t0_p1_s7__1755511999047.json <> logs/transcripts/route-5xx-demo/route-5xx-demo__qwen_qwen3-coder-30b__t0_p1_s13__1755512002555.json
      idx=0 A={"name":"oc_read_describe","args":{"resourceType":"Route","namespace":"shop","name":"checkout"},"dataHash":"94889027"} B={"name":"oc_read_describe","args":{"resourceType":"Route","namespace":"shop","name":"checkout"},"dataHash":"ecabe801"}
      idx=1 A={"name":"oc_read_describe","args":{"resourceType":"Endpoints","namespace":"shop","name":"checkout"},"dataHash":"6897d3d7"} B={"name":"oc_read_describe","args":{"resourceType":"Endpoints","namespace":"shop","name":"checkout"},"dataHash":"dd2b3d07"}
      idx=2 A={"name":"oc_read_get_pods","args":{"namespace":"shop","selector":"app=checkout"},"dataHash":"b24e35cf"} B={"name":"oc_read_get_pods","args":{"namespace":"shop","selector":"app=checkout"},"dataHash":"7a4079a5"}
    
- pvc-binding-demo × mistralai/devstral-small-2507
  - Observed evidence_keys: pvc_pending
  - Transcript diff (first pair):
    # logs/transcripts/pvc-binding-demo/pvc-binding-demo__mistralai_devstral-small-2507__t0_p1_s7__1755512467912.json <> logs/transcripts/pvc-binding-demo/pvc-binding-demo__mistralai_devstral-small-2507__t0_p1_s13__1755512487380.json
      idx=0 A={"name":"oc_read_describe","args":{"resourceType":"pvc","namespace":"student35","name":"shared-pvc"},"dataHash":"3d9da35d"} B={"name":"oc_read_describe","args":{"resourceType":"pvc","namespace":"student35","name":"shared-pvc"},"dataHash":"a13fcbfc"}
    
- pvc-binding-demo × qwen/qwen3-coder-30b
  - Observed evidence_keys: pvc_pending, zone_mismatch, storage_class_missing
  - JSON diff: priority: LLM=P2 vs ENG=P3; confidence: LLM=High vs ENG=Medium; slo: LLM= vs ENG=HIGH; evidence_keys: LLM=["pvc_pending","zone_mismatch"] vs ENG=["pvc_pending","storage_class_missing"]
  - Transcript diff (first pair):
    # logs/transcripts/pvc-binding-demo/pvc-binding-demo__qwen_qwen3-coder-30b__t0_p1_s7__1755512011329.json <> logs/transcripts/pvc-binding-demo/pvc-binding-demo__qwen_qwen3-coder-30b__t0_p1_s13__1755512014776.json
      idx=0 A={"name":"oc_read_describe","args":{"resourceType":"persistentvolumeclaim","namespace":"student35","name":"shared-pvc"},"dataHash":"fa218e8f"} B={"name":"oc_read_describe","args":{"resourceType":"persistentvolumeclaim","namespace":"student35","name":"shared-pvc"},"dataHash":"257b313f"}
      idx=1 A={"name":"oc_read_describe","args":{"resourceType":"storageclass","name":"gp3-csi"},"dataHash":"4406008b"} B={"name":"oc_read_describe","args":{"resourceType":"storageclass","name":"gp3-csi"},"dataHash":"54c417e2"}
      idx=2 A={"name":"oc_read_describe","args":{"resourceType":"resourcequota","namespace":"student35"},"dataHash":"939ba3c2"} B={"name":"oc_read_describe","args":{"resourceType":"resourcequota","namespace":"student35"},"dataHash":"362f8d60"}
    
- scheduling-failures-demo × mistralai/devstral-small-2507
  - Transcript diff (first pair):
    # logs/transcripts/scheduling-failures-demo/scheduling-failures-demo__mistralai_devstral-small-2507__t0_p1_s7__1755512553905.json <> logs/transcripts/scheduling-failures-demo/scheduling-failures-demo__mistralai_devstral-small-2507__t0_p1_s13__1755512675477.json
      idx=0 A={"name":"oc_read_describe","args":{"resourceType":"pod","namespace":"openshift-gitops","name":"openshift-gitops-repo-server-5cddfbc756-gdcd4"},"dataHash":"2cf10855"} B={"name":"oc_read_describe","args":{"resourceType":"pod","namespace":"openshift-gitops","name":"openshift-gitops-repo-server-5cddfbc756-gdcd4"},"dataHash":"3a433830"}
    
- scheduling-failures-demo × qwen/qwen3-coder-30b
  - Observed evidence_keys: failed_scheduling, node_taints, machineset_zone_skew
  - JSON diff: priority: LLM=P1 vs ENG=P3; slo: LLM= vs ENG=LOW
  - Transcript diff (first pair):
    # logs/transcripts/scheduling-failures-demo/scheduling-failures-demo__qwen_qwen3-coder-30b__t0_p1_s7__1755512025391.json <> logs/transcripts/scheduling-failures-demo/scheduling-failures-demo__qwen_qwen3-coder-30b__t0_p1_s13__1755512032038.json
      idx=0 A={"name":"oc_read_describe","args":{"resourceType":"pod","namespace":"openshift-gitops","name":"openshift-gitops-repo-server-5cddfbc756-gdcd4"},"dataHash":"cb0caca6"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-gitops","selector":"name=openshift-gitops-repo-server-5cddfbc756-gdcd4"},"dataHash":"c7dd9682"}
      idx=1 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-gitops","selector":"app.kubernetes.io/name=repo-server"},"dataHash":"33dee2e1"} B={"name":"oc_read_describe","args":{"resourceType":"pod","namespace":"openshift-gitops","name":"openshift-gitops-repo-server-5cddfbc756-gdcd4"},"dataHash":"a49fecfa"}
      idx=2 A={"name":"oc_read_describe","args":{"resourceType":"machineset","namespace":"openshift-machine-api","name":"ocp-5428f-worker-us-east-1a"},"dataHash":"1d1f8797"} B={"name":"oc_read_describe","args":{"resourceType":"node","name":"ip-10-0-123-456.ec2.internal"},"dataHash":"28f315e6"}
      idx=3 A=null B={"name":"oc_read_describe","args":{"resourceType":"machineset","namespace":"openshift-machine-api","name":"ocp-4123-5g89s-worker-us-east-1a"},"dataHash":"c2945c11"}
    
- cluster-health-demo × mistralai/devstral-small-2507
  - Observed evidence_keys: no_evidence
  - Transcript diff (first pair):
    # logs/transcripts/cluster-health-demo/cluster-health-demo__mistralai_devstral-small-2507__t0_p1_s7__1755512817052.json <> logs/transcripts/cluster-health-demo/cluster-health-demo__mistralai_devstral-small-2507__t0_p1_s13__1755512832787.json
      idx=0 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-operator-lifecycle-manager","selector":"clusteroperator"},"dataHash":"a07abcb1"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-operator-lifecycle-manager","selector":"clusteroperator"},"dataHash":"cbbc3f55"}
    
- cluster-health-demo × qwen/qwen3-coder-30b
  - Observed evidence_keys: ingress_controller_degraded, network_degraded, storage_degraded
  - JSON diff: priority: LLM=P1 vs ENG=P3; confidence: LLM=High vs ENG=Low; slo: LLM= vs ENG=LOW; evidence_keys: LLM=["ingress_controller_degraded","network_degraded","storage_degraded"] vs ENG=["no_evidence"]
  - Transcript diff (first pair):
    # logs/transcripts/cluster-health-demo/cluster-health-demo__qwen_qwen3-coder-30b__t0_p1_s7__1755512089935.json <> logs/transcripts/cluster-health-demo/cluster-health-demo__qwen_qwen3-coder-30b__t0_p1_s13__1755512122230.json
      idx=0 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-operator-lifecycle-manager"},"dataHash":"2050c72a"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-operator-lifecycle-manager"},"dataHash":"c155dbda"}
      idx=1 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-apiserver"},"dataHash":"3008342b"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-ingress-operator"},"dataHash":"196d304f"}
      idx=2 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-ingress"},"dataHash":"9f826fc0"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-network-operator"},"dataHash":"bb30ebc7"}
      idx=3 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-network-operator"},"dataHash":"fa49d7d1"} B={"name":"oc_read_get_pods","args":{"namespace":"openshift-storage"},"dataHash":"bf5a9fef"}
      idx=4 A={"name":"oc_read_get_pods","args":{"namespace":"openshift-storage"},"dataHash":"6757ddc4"} B={"name":"oc_read_describe","args":{"resourceType":"ClusterOperator","name":"ingress"},"dataHash":"17319567"}
      idx=5 A={"name":"oc_read_describe","args":{"resourceType":"ClusterOperator","namespace":"openshift-apiserver","name":"apiserver"},"dataHash":"f3dddbf9"} B={"name":"oc_read_describe","args":{"resourceType":"ClusterOperator","name":"network"},"dataHash":"dc28c704"}
      idx=6 A={"name":"oc_read_describe","args":{"resourceType":"ClusterOperator","namespace":"openshift-ingress-operator","name":"ingress"},"dataHash":"7a5e4add"} B={"name":"oc_read_describe","args":{"resourceType":"ClusterOperator","name":"storage"},"dataHash":"9dbb9685"}
      idx=7 A={"name":"oc_read_describe","args":{"resourceType":"ClusterOperator","namespace":"openshift-network-operator","name":"network"},"dataHash":"29432c2f"} B={"name":"oc_read_descr