/**
 * Application configuration constants
 */
export const AppConfig = {
    /**
     * Heartbeat timeout threshold in milliseconds
     * If a station hasn't sent a heartbeat within this time,
     * it will be considered offline (unless actively connected via WebSocket)
     * 
     * Default: 5 minutes (300000 ms)
     * Can be overridden via HEARTBEAT_TIMEOUT_MS environment variable
     */
    HEARTBEAT_TIMEOUT_MS: parseInt(process.env.HEARTBEAT_TIMEOUT_MS || '300000', 10),

    /**
     * Heartbeat timeout in seconds (convenience getter)
     */
    get HEARTBEAT_TIMEOUT_SECONDS(): number {
        return this.HEARTBEAT_TIMEOUT_MS / 1000;
    },
} as const;
