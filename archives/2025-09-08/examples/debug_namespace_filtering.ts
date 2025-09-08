// Let's examine the namespace filtering logic in detail to understand why some namespaces might not be found

const filterUserNamespaces = (namespaces: any[]) => {
  return namespaces.items
    .filter((ns: any) => !ns.metadata.name.startsWith('openshift-') && 
                       !ns.metadata.name.startsWith('kube-'))
    .slice(0, 10); // Limit to first 10 user namespaces
};

// Example of how the filtering might work in context:
const exampleNamespaces = {
  items: [
    { metadata: { name: 'openshift-apiserver' } },
    { metadata: { name: 'openshift-etcd' } },
    { metadata: { name: 'kube-system' } },
    { metadata: { name: 'default' } },
    { metadata: { name: 'myapp-prod' } },
    { metadata: { name: 'myapp-staging' } },
    { metadata: { name: 'test-namespace' } }
  ]
};

console.log('Filtering user namespaces...');
const filtered = filterUserNamespaces(exampleNamespaces);
console.log('Filtered results:', filtered.map((ns: any) => ns.metadata.name));