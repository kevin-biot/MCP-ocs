// Storage Intelligence Test Fixtures
// Deterministic mock data for PVC RCA and Namespace Analytics tests

export const student03PendingPVCScenario = {
  namespace: 'student03',
  pvcName: 'shared-pvc',
  storageClassName: 'gp2-wffc',
  volumeBindingMode: 'WaitForFirstConsumer',
  pvc: {
    apiVersion: 'v1',
    kind: 'PersistentVolumeClaim',
    metadata: { name: 'shared-pvc', namespace: 'student03' },
    spec: { accessModes: ['ReadWriteOnce'], resources: { requests: { storage: '10Gi' } }, storageClassName: 'gp2' },
    status: { phase: 'Pending' }
  },
  events: [
    {
      type: 'Normal',
      reason: 'WaitForFirstConsumer',
      message: 'binding required for volume provisioning will be completed by the scheduler',
      involvedObject: { kind: 'PersistentVolumeClaim', name: 'shared-pvc' }
    }
  ],
  expectedResolution: {
    action: 'Create a pod that mounts the PVC to trigger binding',
    command: 'oc run pvc-consumer --image=busybox --restart=Never --overrides=' +
      `'{"apiVersion":"v1","kind":"Pod","metadata":{"name":"pvc-consumer"},"spec":{"containers":[{"name":"c","image":"busybox","command":["sh","-c","sleep 60"],"volumeMounts":[{"mountPath":"/mnt","name":"vol"}]}],"volumes":[{"name":"vol","persistentVolumeClaim":{"claimName":"shared-pvc"}}]}}' -n student03`,
  }
};

export const multiNamespacePVCs = {
  namespaces: [
    {
      name: 'student01',
      pvcs: [
        { name: 'data-a', status: 'Bound', storage: '5Gi', class: 'standard' },
        { name: 'data-b', status: 'Bound', storage: '10Gi', class: 'premium' }
      ]
    },
    {
      name: 'student02',
      pvcs: [
        { name: 'cache', status: 'Bound', storage: '2Gi', class: 'standard' },
        { name: 'backup', status: 'Pending', storage: '20Gi', class: 'gp2' }
      ]
    },
    {
      name: 'student03',
      pvcs: [
        { name: 'shared-pvc', status: 'Pending', storage: '10Gi', class: 'gp2' }
      ]
    }
  ],
  storageClasses: [
    { name: 'standard', provisioner: 'kubernetes.io/aws-ebs', costTier: 'standard' },
    { name: 'premium', provisioner: 'kubernetes.io/aws-ebs', costTier: 'premium' },
    { name: 'gp2', provisioner: 'ebs.csi.aws.com', costTier: 'standard' }
  ]
};

export const costAssumptions = {
  costPerGB: 0.1, // $0.10/GB-month for standard
  premiumMultiplier: 2.0
};

export const eventDataForPendingPVCs = [
  {
    type: 'Warning',
    reason: 'ProvisioningFailed',
    message: 'failed to provision volume with StorageClass "gp2"',
  },
  {
    type: 'Normal',
    reason: 'ExternalProvisioning',
    message: 'waiting for a volume to be created by external provisioner',
  },
  {
    type: 'Normal',
    reason: 'WaitForFirstConsumer',
    message: 'binding required for volume provisioning will be completed by the scheduler',
  }
];

