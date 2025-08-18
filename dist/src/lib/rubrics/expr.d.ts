export declare class ExprEvaluator {
    private tokens;
    private pos;
    private ctx;
    evaluate(expression: string, context: Record<string, any>): boolean;
    private current;
    private eat;
    private expect;
    private parseOr;
    private parseAnd;
    private parseComp;
    private parseTerm;
    private toValue;
}
export declare function normalize(value: number, spec?: string): number;
