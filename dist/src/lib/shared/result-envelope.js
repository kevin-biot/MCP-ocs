export function makeEnvelope(data, meta) {
    return {
        data,
        metadata: {
            partial: false,
            exhaustedBudget: false,
            namespaceErrors: [],
            signals: {},
            summary: "",
            executionTimeMs: 0,
            ...(meta ?? {}),
        },
    };
}
