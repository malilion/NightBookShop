export declare const securityHeaders: Record<string, string>;
export declare const cacheRules: { source: string; pattern: string; value: string }[];
export declare function netlifyHeaders(): string;
export declare function vercelHeaders(): { source: string; headers: { key: string; value: string }[] }[];
