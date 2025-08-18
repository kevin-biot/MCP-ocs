export type RubricKind = 'weighted' | 'guards' | 'mapping';
export interface WeightedRubric {
    id: string;
    kind: 'weighted';
    inputs: string[];
    weights: Record<string, number>;
    normalize?: Record<string, string>;
    bands: Record<string, string>;
}
export interface GuardsRubric {
    id: string;
    kind: 'guards';
    guards: string[];
    decision: {
        allowAuto: string;
    };
}
export interface MappingRubric {
    id: string;
    kind: 'mapping';
    inputs: string[];
    mapping: Record<string, string>;
}
export type ScoringRubric = WeightedRubric | GuardsRubric | MappingRubric;
export interface TemplateRubrics {
    triage?: ScoringRubric;
    confidence?: ScoringRubric;
    safety?: ScoringRubric;
    slo?: ScoringRubric;
    similarity?: ScoringRubric;
    runbookFitness?: ScoringRubric;
}
export declare class RubricRegistry {
    private byId;
    register(r: ScoringRubric): void;
    getById(id: string): ScoringRubric | undefined;
    list(): ScoringRubric[];
}
export declare function loadCoreRubrics(reg: RubricRegistry): Promise<void>;
