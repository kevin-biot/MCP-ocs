// Sequential thinking safety: constrain planning
// Inputs: bounded:boolean, thoughtsUsed:number, maxThoughts:number
export const SEQUENTIAL_THINKING_SAFETY_V1 = {
    id: 'sequential_thinking.safety.v1',
    kind: 'guards',
    guards: [
        'bounded == true',
        'thoughtsUsed <= maxThoughts'
    ],
    decision: { allowAuto: 'all guards true' }
};
