import { GuardsRubric, MappingRubric, TemplateRubrics, WeightedRubric } from './rubric-registry.js';
export interface WeightedRubricResult {
    id: string;
    kind: 'weighted';
    score: number;
    label?: string | undefined;
    bands?: Record<string, string>;
    inputs: Record<string, number>;
    breakdown: Record<string, number>;
}
export interface GuardsRubricResult {
    id: string;
    kind: 'guards';
    allowAuto: boolean;
    guards: string[];
    failing: string[];
}
export interface MappingRubricResult {
    id: string;
    kind: 'mapping';
    label: string;
    matched: string;
}
export interface RubricResultsMap {
    triage?: WeightedRubricResult | MappingRubricResult;
    confidence?: MappingRubricResult;
    safety?: GuardsRubricResult;
    slo?: MappingRubricResult;
    similarity?: MappingRubricResult;
    runbookFitness?: WeightedRubricResult | MappingRubricResult;
    [key: string]: any;
}
export declare function evaluateWeighted(r: WeightedRubric, inputs: Record<string, any>): WeightedRubricResult;
export declare function evaluateGuards(r: GuardsRubric, inputs: Record<string, any>): GuardsRubricResult;
export declare function evaluateMapping(r: MappingRubric, inputs: Record<string, any>): MappingRubricResult;
export declare function evaluateRubrics(rubrics: TemplateRubrics | undefined, inputs: Record<string, any>): RubricResultsMap;
