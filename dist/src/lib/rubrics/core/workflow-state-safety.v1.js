// Workflow state safety: ensure operations remain within boundaries
// Inputs: withinBoundaries:boolean
export const WORKFLOW_STATE_SAFETY_V1 = {
    id: 'workflow_state.safety.v1',
    kind: 'guards',
    guards: [
        'withinBoundaries == true'
    ],
    decision: { allowAuto: 'all guards true' }
};
