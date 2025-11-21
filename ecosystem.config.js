module.exports = {
    apps: [
        {
            name: 'ocpp-gateway',
            cwd: './OCPP_GATEWAY',
            script: 'npm',
            args: 'run start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            error_file: './logs/ocpp-gateway-error.log',
            out_file: './logs/ocpp-gateway-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
        },
        {
            name: 'cpanel',
            cwd: './CPANEL',
            script: 'npm',
            args: 'run dev',
            env: {
                NODE_ENV: 'development',
                PORT: 3003
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
            error_file: './logs/cpanel-error.log',
            out_file: './logs/cpanel-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
        }
    ]
}
