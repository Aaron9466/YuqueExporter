// 定义颜色常量
const COLORS = {
    RESET: '\x1b[0m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    GREEN: '\x1b[32m'
};

// 定义日志级别和对应的颜色
const LOG_LEVELS = {
    INFO: { color: COLORS.BLUE, label: 'INFO' },
    WARN: { color: COLORS.YELLOW, label: 'WARN' },
    ERROR: { color: COLORS.RED, label: 'ERROR' },
    SUCCESS: { color: COLORS.GREEN, label: 'SUCCESS' }
};

// 打印日志的函数
export function print(type, message) {
    const logLevel = LOG_LEVELS[type.toUpperCase()];
    let errorMessage = message;

    if (message instanceof Error) {
        errorMessage = `${message.name}: ${message.message}\nStack: ${message.stack}`;
    }

    if (logLevel) {
        console.log(`${logLevel.color}[${logLevel.label}] ${errorMessage}${COLORS.RESET}`);
    } else {
        console.log(`[UNKNOWN] ${errorMessage}`);
    }
}