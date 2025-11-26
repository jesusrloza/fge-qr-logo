type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
interface LogEntry {
    timestamp: string;
    level: LogLevel;
    context: string;
    message: string;
    metadata?: Record<string, unknown>;
}
export declare class Logger {
    private context;
    constructor(context: string);
    private log;
    debug(message: string, metadata?: Record<string, unknown>): void;
    info(message: string, metadata?: Record<string, unknown>): void;
    warn(message: string, metadata?: Record<string, unknown>): void;
    error(message: string, metadata?: Record<string, unknown>): void;
}
export declare function createLogger(context: string): Logger;
export declare function cleanupOldLogs(): void;
export type { LogLevel, LogEntry };
