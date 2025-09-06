export function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
export function isOperationalMemory(data) {
    if (!isRecord(data))
        return false;
    return typeof data.incidentId === 'string'
        && typeof data.domain === 'string'
        && typeof data.timestamp === 'number'
        && Array.isArray(data.symptoms)
        && Array.isArray(data.affectedResources)
        && Array.isArray(data.diagnosticSteps)
        && Array.isArray(data.tags)
        && (data.environment === 'dev' || data.environment === 'test' || data.environment === 'staging' || data.environment === 'prod');
}
export function hasErrorCode(error) {
    return isRecord(error) && (typeof error.code === 'string' || typeof error.code === 'number');
}
export function hasErrorStderr(error) {
    return isRecord(error) && typeof error.stderr === 'string';
}
