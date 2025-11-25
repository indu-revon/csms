import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
    @Get('health')
    checkHealth() {
        return {
            status: 'ok',
            service: 'OCPP Gateway',
            timestamp: new Date().toISOString(),
        };
    }

    @Get()
    root() {
        return {
            service: 'REVON OCPP Gateway',
            version: '3.0.0',
            protocol: 'OCPP 1.6J',
            endpoints: {
                health: '/health',
                api: '/api',
                websocket: 'ws://localhost:3000/:cpId',
            },
        };
    }
}
