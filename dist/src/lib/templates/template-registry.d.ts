import { DiagnosticTemplate, TemplateSelection } from './template-types.js';
export declare class TemplateRegistry {
    private baseDir;
    private templates;
    private byTarget;
    constructor(baseDir?: string);
    load(): Promise<void>;
    getById(id: string): DiagnosticTemplate | undefined;
    selectByTarget(target: string): TemplateSelection | undefined;
}
