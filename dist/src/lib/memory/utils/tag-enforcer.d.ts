export type Kind = 'conversation' | 'operational' | 'tool_exec';
export interface TagContext {
    kind: Kind;
    domain?: string;
    environment?: 'dev' | 'test' | 'staging' | 'prod';
    severity?: 'low' | 'medium' | 'high' | 'critical';
}
export declare function tagEnforcer(existing: string[] | undefined, ctx: TagContext): string[];
