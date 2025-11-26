import fs from 'fs';
import path from 'path';
// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    // Foreground colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    // Background colors
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
};
const levelColors = {
    DEBUG: colors.dim + colors.white,
    INFO: colors.cyan,
    WARN: colors.yellow,
    ERROR: colors.red,
};
const levelEmojis = {
    DEBUG: '🔍',
    INFO: '📋',
    WARN: '⚠️',
    ERROR: '❌',
};
// Get the current quarter string (e.g., "2025-Q4")
function getQuarterString(date = new Date()) {
    const year = date.getFullYear();
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    return `${year}-Q${quarter}`;
}
// Format timestamp like "2025-11-26 14:30:22"
function formatTimestamp(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
// Ensure logs directory exists
function ensureLogsDir() {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    return logsDir;
}
// Get the current log file path
function getLogFilePath() {
    const logsDir = ensureLogsDir();
    const quarter = getQuarterString();
    return path.join(logsDir, `${quarter}.log`);
}
// Write to log file (append)
function writeToFile(entry) {
    const logPath = getLogFilePath();
    const logLine = JSON.stringify({
        ...entry,
        timestamp: entry.timestamp,
    }) + '\n';
    fs.appendFileSync(logPath, logLine, 'utf8');
}
// Format console output with colors
function formatConsoleOutput(entry) {
    const levelColor = levelColors[entry.level];
    const emoji = levelEmojis[entry.level];
    const levelPadded = entry.level.padEnd(5);
    let output = `${colors.dim}${entry.timestamp}${colors.reset} `;
    output += `${levelColor}${levelPadded}${colors.reset} `;
    output += `${colors.magenta}[${entry.context}]${colors.reset} `;
    output += `${emoji} ${entry.message}`;
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        output += ` ${colors.dim}${JSON.stringify(entry.metadata)}${colors.reset}`;
    }
    return output;
}
// Main logger class
export class Logger {
    context;
    constructor(context) {
        this.context = context;
    }
    log(level, message, metadata) {
        const entry = {
            timestamp: formatTimestamp(),
            level,
            context: this.context,
            message,
            metadata,
        };
        // Output to console with colors
        console.log(formatConsoleOutput(entry));
        // Write to file (JSON format for easier parsing)
        writeToFile(entry);
    }
    debug(message, metadata) {
        this.log('DEBUG', message, metadata);
    }
    info(message, metadata) {
        this.log('INFO', message, metadata);
    }
    warn(message, metadata) {
        this.log('WARN', message, metadata);
    }
    error(message, metadata) {
        this.log('ERROR', message, metadata);
    }
}
// Factory function to create loggers with context
export function createLogger(context) {
    return new Logger(context);
}
// Cleanup old logs (keep only 4 quarters)
// Example: when 2026Q4 starts, delete 2025Q4 (keeping 2026Q1, Q2, Q3, Q4)
export function cleanupOldLogs() {
    const logger = createLogger('LogCleanup');
    const logsDir = ensureLogsDir();
    try {
        const files = fs.readdirSync(logsDir);
        const logFiles = [];
        // Parse and collect all log files
        for (const file of files) {
            if (!file.endsWith('.log'))
                continue;
            const match = file.match(/^(\d{4})-Q([1-4])\.log$/);
            if (!match)
                continue;
            const [, yearStr, quarterStr] = match;
            logFiles.push({
                file,
                year: parseInt(yearStr, 10),
                quarter: parseInt(quarterStr, 10),
            });
        }
        // Sort by year and quarter (newest first)
        logFiles.sort((a, b) => {
            if (a.year !== b.year)
                return b.year - a.year;
            return b.quarter - a.quarter;
        });
        // Keep only the 4 most recent quarter files
        const filesToDelete = logFiles.slice(4);
        for (const { file } of filesToDelete) {
            const filePath = path.join(logsDir, file);
            fs.unlinkSync(filePath);
            logger.info(`🗑️ Eliminado archivo de log antiguo: ${file}`);
        }
        if (filesToDelete.length > 0) {
            logger.info(`Limpieza completada: ${filesToDelete.length} archivo(s) eliminado(s)`);
        }
    }
    catch (error) {
        logger.error('Error cleaning up old logs', { error: String(error) });
    }
}
