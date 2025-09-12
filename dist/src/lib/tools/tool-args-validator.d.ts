export interface PlaceholderHit {
    field: string;
    value: string;
}
export declare function findUnresolvedPlaceholdersShallow(args: unknown): PlaceholderHit[];
