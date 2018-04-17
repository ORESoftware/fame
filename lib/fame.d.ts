export interface AuthorType {
    commits: number;
    changes: number;
    overall: number;
    added: number;
    removed: number;
    author: string;
    files: number;
    uniqueFiles: {
        [key: string]: boolean;
    };
    totals?: {
        added: number;
        removed: number;
        files: number;
        commits: number;
        changed: number;
    };
}
