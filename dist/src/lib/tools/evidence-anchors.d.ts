export interface AnchorOptions {
    startIso: string;
    endIso: string;
    toolId: string;
}
export declare function collectAnchors(opts: AnchorOptions): Promise<string[]>;
