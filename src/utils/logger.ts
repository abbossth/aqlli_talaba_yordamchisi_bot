// src/utils/logger.ts
type LogLevel = "info" | "error" | "warn" | "debug";

const getTimestamp = (): string => {
  return new Date().toISOString();
};

const formatMessage = (level: LogLevel, message: string, data?: any): string => {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (data) {
    return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`;
  }
  
  return `${prefix} ${message}`;
};

export const logger = {
  info: (message: string, data?: any) => {
    console.log(formatMessage("info", message, data));
  },
  
  error: (message: string, error?: any) => {
    console.error(formatMessage("error", message, error));
  },
  
  warn: (message: string, data?: any) => {
    console.warn(formatMessage("warn", message, data));
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(formatMessage("debug", message, data));
    }
  },
};


