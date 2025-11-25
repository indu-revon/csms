# OCPP 1.6 Development Guidelines

**Version:** 1.0  
**Last Updated:** November 2025  
**Applies To:** OCPP_GATEWAY NestJS Application

---

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Code Quality Standards](#code-quality-standards)
4. [Handler Development Guidelines](#handler-development-guidelines)
5. [Error Handling Patterns](#error-handling-patterns)
6. [Data Validation](#data-validation)
7. [Logging Best Practices](#logging-best-practices)
8. [Database Schema Guidelines](#database-schema-guidelines)
9. [Testing Requirements](#testing-requirements)
10. [OCPP Specification Compliance](#ocpp-specification-compliance)
11. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
12. [AI Agent Instructions](#ai-agent-instructions)

---

## Introduction

This document provides comprehensive guidelines for developing and maintaining the OCPP 1.6 implementation. It is based on real-world improvements made to achieve **9.2/10 code quality** from an initial **6.5/10** rating.

**Target Audience:**
- New developers joining the project
- AI coding agents assisting with development
- Code reviewers
- DevOps engineers deploying the system

---

## Architecture Overview

### Project Structure

```
OCPP_GATEWAY/
├── src/
│   ├── ocpp/
│   │   ├── handlers/          # OCPP message handlers
│   │   ├── dtos/              # Data Transfer Objects with validation
│   │   ├── ocpp.service.ts    # Core OCPP service
│   │   ├── ocpp.gateway.ts    # WebSocket gateway
│   │   └── ocpp.module.ts     # OCPP module definition
│   ├── charging/
│   │   ├── stations/          # Station management
│   │   ├── sessions/          # Charging session management
│   │   ├── connectors/        # Connector status management
│   │   └── rfid/              # RFID card management
│   ├── api/                   # REST API controllers
│   └── config/                # Configuration files
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
└── test/                      # Test files
```

### Core Components

1. **OCPP Gateway** - WebSocket server handling charge point connections
2. **Handlers** - Process individual OCPP message types
3. **Services** - Business logic for charging operations
4. **DTOs** - Validated data structures for OCPP messages
5. **Database** - Prisma ORM with SQLite/PostgreSQL

---

## Code Quality Standards

### TypeScript Guidelines

1. **Use Strict Type Checking**
   ```typescript
   // ✅ Good - Explicit types
   async handle(cpId: string, payload: BootNotificationRequest): Promise<BootNotificationResponse> {
     // ...
   }

   // ❌ Bad - Implicit any
   async handle(cpId, payload) {
     // ...
   }
   ```

2. **Prefer Interfaces for DTOs, Classes for Services**
   ```typescript
   // ✅ Good - Interface for response
   export interface BootNotificationResponse {
     status: BootNotificationStatus;
     currentTime: string;
     interval: number;
   }

   // ✅ Good - Class for request with validation
   export class BootNotificationRequest {
     @IsString()
     chargePointVendor: string;
   }
   ```

3. **Use Enums for OCPP Values**
   ```typescript
   // ✅ Good - Type-safe enum
   export enum ChargePointStatus {
     Available = 'Available',
     Preparing = 'Preparing',
     Charging = 'Charging',
     // ...
   }

   // ❌ Bad - String literals everywhere
   if (status === 'Available') { /* ... */ }
   ```

### Code Organization

1. **One Handler Per File** - Each OCPP message type has its own handler
2. **Separate DTOs** - Request/Response types in dedicated DTO files
3. **Service Layer** - Business logic separated from handlers
4. **No Business Logic in Controllers** - Keep API controllers thin

---

## Handler Development Guidelines

### Standard Handler Template

Every OCPP handler should follow this pattern:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { SomeService } from '../../path/to/service';
import { SomeRequest, SomeResponse } from '../dtos/some.dto';

@Injectable()
export class SomeHandler {
  private readonly logger = new Logger(SomeHandler.name);

  constructor(
    private readonly someService: SomeService,
  ) {}

  async handle(cpId: string, payload: SomeRequest): Promise<SomeResponse> {
    try {
      // 1. Validate station exists
      const station = await this.stationsService.findByOcppIdentifier(cpId);
      
      if (!station) {
        this.logger.error(`[${cpId}] Handler failed: Station not found`);
        return this.getErrorResponse();
      }

      // 2. Perform business logic
      const result = await this.someService.doSomething(station.id, payload);

      // 3. Log success
      this.logger.log(`[${cpId}] Operation successful`);

      // 4. Return OCPP-compliant response
      return {
        status: 'Accepted',
        // ... other fields
      };

    } catch (error) {
      this.logger.error(`[${cpId}] Handler error: ${error.message}`, error.stack);
      return this.getErrorResponse();
    }
  }

  private getErrorResponse(): SomeResponse {
    return {
      status: 'Rejected',
      // ... appropriate error response fields
    };
  }
}
```

### Handler Checklist

When creating or modifying a handler, ensure:

- [ ] Logger instance created with handler name
- [ ] Try-catch block wraps all logic
- [ ] Station validation performed
- [ ] All success paths logged
- [ ] All error paths logged with stack trace
- [ ] Returns valid OCPP response even on errors
- [ ] No thrown errors escape the handler
- [ ] Uses injected services, not direct database access

---

## Error Handling Patterns

### Critical Rules

1. **Never Throw Errors from Handlers**
   ```typescript
   // ❌ BAD - Throws error, breaks WebSocket connection
   async handle(cpId: string, payload: Request): Promise<Response> {
     const station = await this.stationsService.findByOcppIdentifier(cpId);
     if (!station) {
       throw new Error(`Station not found: ${cpId}`);
     }
   }

   // ✅ GOOD - Returns error response
   async handle(cpId: string, payload: Request): Promise<Response> {
     const station = await this.stationsService.findByOcppIdentifier(cpId);
     if (!station) {
       this.logger.error(`[${cpId}] Station not found`);
       return { status: 'Rejected' };
     }
   }
   ```

2. **Always Use Try-Catch**
   ```typescript
   // ✅ GOOD - Handles all errors gracefully
   async handle(cpId: string, payload: Request): Promise<Response> {
     try {
       // ... handler logic
     } catch (error) {
       this.logger.error(`[${cpId}] Error: ${error.message}`, error.stack);
       return this.getErrorResponse();
     }
   }
   ```

3. **Log Errors with Context**
   ```typescript
   // ✅ GOOD - Includes charge point ID and details
   this.logger.error(`[${cpId}] Transaction ${transactionId} failed: ${error.message}`, error.stack);
   
   // ❌ BAD - No context
   console.log('Error:', error);
   ```

### Error Response Guidelines

Different OCPP messages have different error responses:

```typescript
// Messages with status field
return {
  status: 'Rejected',  // or 'Invalid', 'Blocked', etc.
  // ... other required fields
};

// Messages with no error status (StatusNotification, MeterValues)
return {};  // Empty response is valid

// Transaction messages
return {
  transactionId: 0,  // 0 indicates failure
  idTagInfo: {
    status: 'Invalid',
  },
};
```

---

## Data Validation

### Use Class-Validator Decorators

All request DTOs must be validated classes:

```typescript
import { IsString, IsInt, IsOptional, IsDateString, Min } from 'class-validator';

export class StartTransactionRequest {
  @IsInt()
  @Min(1)
  connectorId: number;

  @IsString()
  idTag: string;

  @IsInt()
  @Min(0)
  meterStart: number;

  @IsDateString()
  timestamp: string;

  @IsOptional()
  @IsInt()
  reservationId?: number;
}
```

### Validation Decorator Reference

| Decorator | Use Case | Example |
|-----------|----------|---------|
| `@IsString()` | String fields | `chargePointVendor: string` |
| `@IsInt()` | Integer fields | `connectorId: number` |
| `@IsEnum(EnumType)` | Enum validation | `status: ChargePointStatus` |
| `@IsDateString()` | ISO 8601 timestamps | `timestamp: string` |
| `@IsOptional()` | Optional fields | `reservationId?: number` |
| `@Min(value)` | Minimum value | `@Min(0) meterStart: number` |
| `@IsArray()` | Array fields | `meterValue: MeterValue[]` |
| `@ValidateNested()` | Nested objects | Complex structures |
| `@Type(() => Class)` | Type transformation | Nested validation |

### Nested Validation Example

```typescript
export class SampledValue {
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  measurand?: string;
}

export class MeterValue {
  @IsDateString()
  timestamp: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SampledValue)
  sampledValue: SampledValue[];
}
```

---

## Logging Best Practices

### Log Levels

Use appropriate log levels:

```typescript
// DEBUG - Detailed information for diagnosing issues
this.logger.debug(`[${cpId}] Connector ${connectorId} status updated to ${status}`);

// LOG - Normal operations and successes
this.logger.log(`[${cpId}] Transaction ${transactionId} started successfully`);

// WARN - Unexpected but handled situations
this.logger.warn(`[${cpId}] Session ${transactionId} not found - may already be stopped`);

// ERROR - Errors and failures
this.logger.error(`[${cpId}] Handler error: ${error.message}`, error.stack);
```

### Log Message Format

Always include:
1. **Charge Point ID** - `[${cpId}]` prefix
2. **Context** - What operation/handler
3. **Relevant Data** - Transaction IDs, connector IDs, status values
4. **Stack Trace** - For errors

```typescript
// ✅ GOOD - Complete context
this.logger.log(`[${cpId}] Transaction ${transactionId} stopped. Energy: ${energyKwh?.toFixed(2)} kWh`);

// ❌ BAD - Missing context
this.logger.log('Transaction stopped');
```

### Never Use console.log

```typescript
// ❌ BAD
console.log('Station connected:', cpId);

// ✅ GOOD
this.logger.log(`[${cpId}] Station connected`);
```

---

## Database Schema Guidelines

### Prisma Schema Best Practices

1. **Always Use Auto-Increment IDs**
   ```prisma
   model ChargingSession {
     id  Int  @id @default(autoincrement())
     // Never use: Date.now() + random
   }
   ```

2. **Index Foreign Keys**
   ```prisma
   model ChargingSession {
     chargingStationId Int
     
     @@index([chargingStationId])
   }
   ```

3. **Use Composite Unique Constraints**
   ```prisma
   model ChargingSession {
     chargingStationId  Int
     ocppTransactionId  BigInt
     
     @@unique([chargingStationId, ocppTransactionId])
   }
   ```

4. **Add All OCPP Fields**
   ```prisma
   model ChargingStation {
     // OCPP BootNotification fields
     vendor            String?
     model             String?
     serialNumber      String?
     firmwareVersion   String?
     iccid             String?  // SIM card ID
     imsi              String?  // Mobile network ID
     meterType         String?
     meterSerialNumber String?
   }
   ```

### Migration Guidelines

1. **Always Test Migrations on Staging First**
2. **Use Descriptive Migration Names** - `npx prisma migrate dev --name add_ocpp_fields`
3. **Backup Database Before Production Migration**
4. **Make Additive Changes** - Add optional fields, don't remove

---

## Testing Requirements

### Unit Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SomeHandler } from './some.handler';
import { SomeService } from '../../services/some.service';

describe('SomeHandler', () => {
  let handler: SomeHandler;
  let service: SomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SomeHandler,
        {
          provide: SomeService,
          useValue: {
            someMethod: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<SomeHandler>(SomeHandler);
    service = module.get<SomeService>(SomeService);
  });

  describe('handle', () => {
    it('should return success response for valid request', async () => {
      const cpId = 'CP001';
      const payload = { /* valid payload */ };

      jest.spyOn(service, 'someMethod').mockResolvedValue(/* mock data */);

      const result = await handler.handle(cpId, payload);

      expect(result.status).toBe('Accepted');
      expect(service.someMethod).toHaveBeenCalledWith(/* expected args */);
    });

    it('should return error response when service throws', async () => {
      const cpId = 'CP001';
      const payload = { /* valid payload */ };

      jest.spyOn(service, 'someMethod').mockRejectedValue(new Error('Test error'));

      const result = await handler.handle(cpId, payload);

      expect(result.status).toBe('Rejected');
    });
  });
});
```

### Test Coverage Requirements

- **Minimum Coverage: 80%**
- Required test scenarios:
  - ✅ Valid request succeeds
  - ✅ Invalid request returns error
  - ✅ Station not found returns error
  - ✅ Database error handled gracefully
  - ✅ Edge cases (expired cards, unavailable connectors, etc.)

---

## OCPP Specification Compliance

### Key OCPP 1.6 Requirements

1. **Transaction ID Generation**
   - ✅ Use database auto-increment
   - ❌ Never use `Date.now() + Math.random()`
   - Must be unique and sequential

2. **Required vs Optional Fields**
   ```typescript
   // Required fields must be validated
   export class BootNotificationRequest {
     @IsString()
     chargePointVendor: string;  // REQUIRED

     @IsString()
     chargePointModel: string;   // REQUIRED
     
     @IsOptional()
     @IsString()
     firmwareVersion?: string;   // OPTIONAL
   }
   ```

3. **Error Code Returns**
   - Return `status: 'Rejected'` for validation failures
   - Return `status: 'Invalid'` for authorization failures
   - Return `status: 'Blocked'` for blocked RFID cards
   - Return `transactionId: 0` for failed transaction starts

4. **Connector Status Values** (OCPP 1.6 spec)
   ```typescript
   Available | Preparing | Charging | SuspendedEVSE | 
   SuspendedEV | Finishing | Reserved | Unavailable | Faulted
   ```

### OCPP Message Flow

```
Charge Point → Gateway → Handler → Service → Database
                  ↓
            Validation (class-validator)
                  ↓
            Error Handling (try-catch)
                  ↓
            Logging (Logger)
                  ↓
            Response → Charge Point
```

---

## Common Pitfalls and Solutions

### 1. Transaction ID Collisions

**Problem:**
```typescript
// ❌ BAD - Can create duplicate IDs
const transactionId = Date.now() + Math.floor(Math.random() * 1000);
```

**Solution:**
```typescript
// ✅ GOOD - Use database ID
const session = await this.sessionsService.createSession({...});
const transactionId = session.id;
await this.sessionsService.updateTransactionId(session.id, transactionId);
```

### 2. Missing Authorization Checks

**Problem:**
```typescript
// ❌ BAD - Only checks if tag exists
const isValid = await this.rfidService.validateTag(payload.idTag);
```

**Solution:**
```typescript
// ✅ GOOD - Check status and expiry
const card = await this.rfidService.findByTagId(payload.idTag);
if (!card || card.status !== 'Active') {
  return { idTagInfo: { status: 'Blocked' } };
}
if (card.validUntil && new Date(card.validUntil) < new Date()) {
  return { idTagInfo: { status: 'Expired' } };
}
```

### 3. Missing Connector Availability Checks

**Problem:**
```typescript
// ❌ BAD - Starts transaction on any connector
await this.sessionsService.createSession({...});
```

**Solution:**
```typescript
// ✅ GOOD - Validate connector first
const connector = await this.connectorsService.findConnector(stationId, connectorId);
if (connector.status === 'Faulted' || connector.status === 'Unavailable') {
  return { transactionId: 0, idTagInfo: { status: 'Invalid' } };
}
```

### 4. Inconsistent Error Handling

**Problem:**
```typescript
// ❌ BAD - Throws in some places, returns in others
if (!station) throw new Error('Not found');
if (!session) return { status: 'Invalid' };
```

**Solution:**
```typescript
// ✅ GOOD - Always return, never throw
if (!station) {
  this.logger.error(`[${cpId}] Station not found`);
  return this.getErrorResponse();
}
if (!session) {
  this.logger.warn(`[${cpId}] Session not found`);
  return this.getErrorResponse();
}
```

---

## AI Agent Instructions

When an AI agent is working on this codebase, follow these specific instructions:

### 1. Before Making Changes

- **Read the quality assessment** (`ocpp_quality_assessment.md` if available)
- **Check implementation plan** for context on improvements
- **Review walkthrough** to understand what has been done

### 2. Code Modification Rules

1. **Always preserve existing patterns** established in Phase 1 & 2:
   - Try-catch error handling
   - Logger usage
   - Validation decorators

2. **Never remove error handling** - Only improve it

3. **Update tests** when modifying handlers

4. **Run build** after changes:
   ```bash
   npm run build
   ```

5. **Generate Prisma client** after schema changes:
   ```bash
   npx prisma generate
   ```

### 3. File Modification Guidelines

**When modifying handlers:**
- Keep the established pattern (Logger, try-catch, logging)
- Don't change function signatures without checking all callers
- Update corresponding DTO if adding fields

**When modifying DTOs:**
- Add validators for all new fields
- Use proper OCPP enums
- Regenerate Prisma client if affecting database

**When modifying services:**
- Update TypeScript interfaces
- Consider impact on all handlers using the service
- Add proper error handling

### 4. Commit Message Format

Use conventional commits:

```
feat(ocpp): Add support for ReserveNow message
fix(ocpp): Fix transaction ID collision in high-traffic scenarios  
refactor(handlers): Extract common validation logic
test(ocpp): Add unit tests for authorize handler
docs(ocpp): Update development guidelines
```

### 5. Testing Checklist

Before committing:
- [ ] Code builds successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Tests pass (if tests exist)
- [ ] Manually tested critical path (if applicable)

### 6. When Stuck

1. **Check existing patterns** in similar handlers
2. **Refer to OCPP 1.6 specification** for message formats
3. **Review quality assessment** for known issues
4. **Check git history** for how similar problems were solved

---

## Extensibility Patterns

### Vendor Handler Pattern

When dealing with vendor-specific logic (e.g., DataTransfer), use the handler pattern:

**1. Define Interface**
```typescript
export interface VendorHandler {
  readonly vendorId: string;
  handle(cpId: string, payload: Request): Promise<Response>;
}
```

**2. Create Generic Handler**
```typescript
@Injectable()
export class GenericVendorHandler implements VendorHandler {
  readonly vendorId = '*'; // Wildcard
  
  async handle(cpId: string, payload: Request): Promise<Response> {
    // Fallback logic for unknown vendors
    return { status: 'Accepted' };
  }
}
```

**3. Create Vendor-Specific Handlers**
```typescript
@Injectable()
export class ABBVendorHandler implements VendorHandler {
  readonly vendorId = 'ABB';
  
  async handle(cpId: string, payload: Request): Promise<Response> {
    switch (payload.messageId) {
      case 'DiagnosticsLog':
        return this.handleDiagnostics(cpId, payload);
      default:
        return { status: 'UnknownMessageId' };
    }
  }
}
```

**4. Route in Main Handler**
```typescript
private vendorHandlers: Map<string, VendorHandler>;

constructor() {
  this.vendorHandlers = new Map();
  this.registerVendorHandler(new ABBVendorHandler());
  this.registerVendorHandler(new SchneiderVendorHandler());
}

const handler = this.vendorHandlers.get(vendorId) || this.genericHandler;
return await handler.handle(cpId, payload);
```

**Benefits:**
- Easy to add new vendors
- Clean separation of concerns
- Testable in isolation
- No impact on existing vendors

---

## Measurand Processing Best Practices

### Multiple Measurands in MeterValues

**OCPP Spec:** Each MeterValue can contain multiple SampledValues with different measurands.

**Processing Strategy:**
```typescript
for (const meterValue of payload.meterValue) {
  const timestamp = new Date(meterValue.timestamp);
  
  // Process EACH sampled value
  for (const sampledValue of meterValue.sampledValue) {
    const measurand = sampledValue.measurand || 'Energy.Active.Import.Register';
    const numericValue = parseFloat(sampledValue.value);
    
    // Store based on measurand type
    await this.storeMeasurand(measurand, numericValue, timestamp);
  }
}
```

**Value Parsing:**
```typescript
// ✅ GOOD - Handles decimals
const value = parseFloat(sampledValue.value);

// ❌ BAD - Loses decimal precision
const value = parseInt(sampledValue.value, 10);
```

**Supported Measurands:**
- `Energy.Active.Import.Register` - Wh (billing)
- `Power.Active.Import` - W (real-time power)
- `Voltage` - V (grid quality)
- `Current.Import` - A (load analysis)
- `SoC` - % (EV battery state)
- `Temperature` - °C (system health)

**Logging Best Practice:**
```typescript
// Track counts for observability
const measurandCounts: Record<string, number> = {};
measurandCounts[measurand] = (measurandCounts[measurand] || 0) + 1;

// Log summary
this.logger.log(
  `[${cpId}] Stored ${total} values. ` +
  `Measurands: ${Object.entries(measurandCounts)
    .map(([m, count]) => `${m}=${count}`)
    .join(', ')}`
);
```

---

## Production Deployment Checklist

### Pre-Deployment

**1. Environment Configuration**
```bash
# .env.production
DATABASE_URL="postgresql://user:pass@host:5432/ocpp_prod"
HEARTBEAT_INTERVAL="60"
BOOT_NOTIFICATION_STATUS="Accepted"
PORT="3000"
NODE_ENV="production"
```

**2. Database Migrations**
```bash
# Test on staging first
npx prisma migrate deploy

# Verify schema
npx prisma db pull
```

**3. Build Verification**
```bash
# Clean build
rm -rf dist/ node_modules/
npm ci
npm run build

# Check for warnings
npm run build 2>&1 | grep -i warning
```

**4. Port Availability**
```bash
# Check if port is free
lsof -i :3000

# Kill existing process if needed
kill -9 $(lsof -t -i:3000)
```

### Deployment Steps

**1. Backup Database**
```bash
pg_dump ocpp_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

**2. Deploy Code**
```bash
git pull origin main
npm ci --production
npm run build
```

**3. Run Migrations**
```bash
npx prisma migrate deploy
npx prisma generate
```

**4. Restart Service**
```bash
pm2 reload ocpp-gateway
pm2 logs ocpp-gateway --lines 100
```

**5. Verify Health**
```bash
# Check logs for startup
pm2 logs ocpp-gateway | grep "Registered vendor handler"
pm2 logs ocpp-gateway | grep "Nest application successfully started"

# Test endpoints
curl http://localhost:3000/health
```

### Post-Deployment Monitoring

**First 15 Minutes:**
- Watch logs for errors: `pm2 logs ocpp-gateway`
- Verify charge points reconnect
- Test one charging session end-to-end

**First Hour:**
- Check error rates in logs
- Verify meter values being stored
- Monitor memory usage: `pm2 monit`

**First 24 Hours:**
- Review all error logs
- Verify no transaction ID collisions
- Check database growth is normal

---

## Performance Optimization

### Database Query Optimization

**1. Use Indexes**
```prisma
model ChargingSession {
  chargingStationId Int
  ocppTransactionId BigInt
  
  @@index([chargingStationId])  // Fast station lookups
  @@index([ocppTransactionId])  // Fast transaction queries
  @@unique([chargingStationId, ocppTransactionId])  // Prevent duplicates
}
```

**2. Select Only Needed Fields**
```typescript
// ✅ GOOD - Select specific fields
const session = await this.prisma.chargingSession.findUnique({
  where: { id: sessionId },
  select: { id: true, startMeterValue: true }
});

// ❌ BAD - Fetches all fields and relations
const session = await this.prisma.chargingSession.findUnique({
  where: { id: sessionId },
  include: { meterValues: true, station: true }
});
```

**3. Batch Operations**
```typescript
// ✅ GOOD - Batch inserts
await this.prisma.meterValue.createMany({
  data: meterValues,
  skipDuplicates: true
});

// ❌ BAD - Individual inserts
for (const mv of meterValues) {
  await this.prisma.meterValue.create({ data: mv });
}
```

### Memory Management

**1. Limit Array Sizes**
```typescript
// Validate payload size
if (payload.meterValue.length > 100) {
  this.logger.warn(`Large MeterValues payload: ${payload.meterValue.length} values`);
}
```

**2. Stream Large Queries**
```typescript
// For large result sets, use cursor-based pagination
const sessions = await this.prisma.chargingSession.findMany({
  take: 100,
  skip: offset,
  orderBy: { id: 'desc' }
});
```

---

## Common Development Issues

### Issue 1: Port Already in Use

**Symptom:** `Error: listen EADDRINUSE: address already in use 0.0.0.0:3000`

**Solution:**
```bash
# Find and kill process
lsof -t -i:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run start:dev
```

### Issue 2: ValidationPipe Not Working

**Symptom:** class-validator decorators don't validate

**Solution:**
```typescript
// main.ts
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(new ValidationPipe({
  transform: true,
  whitelist: true,
}));
```

### Issue 3: Prisma Client Not Updated

**Symptom:** TypeScript errors after schema changes

**Solution:**
```bash
npx prisma generate
npm run build
```

### Issue 4: Database Lock Errors

**Symptom:** `database is locked` (SQLite)

**Solution:**
```typescript
// Use transactions for related writes
await this.prisma.$transaction(async (tx) => {
  await tx.chargingSession.update(...);
  await tx.meterValue.create(...);
});
```

### Issue 5: Circular Dependencies

**Symptom:** `Nest can't resolve dependencies`

**Solution:**
```typescript
// Use forwardRef
constructor(
  @Inject(forwardRef(() => StationsService))
  private stationsService: StationsService
) {}
```

---

## Quick Reference

### Essential Commands

```bash
# Build project
npm run build

# Run in development
npm run start:dev

# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Key Files

| File | Purpose |
|------|---------|
| `src/ocpp/handlers/*.handler.ts` | OCPP message handlers |
| `src/ocpp/dtos/*.dto.ts` | Request/response validation |
| `prisma/schema.prisma` | Database schema |
| `src/ocpp/ocpp.gateway.ts` | WebSocket gateway |
| `src/ocpp/ocpp.service.ts` | Core OCPP service |

### Environment Variables

```env
DATABASE_URL="file:./dev.db"
HEARTBEAT_INTERVAL="60"
BOOT_NOTIFICATION_STATUS="Accepted"
PORT="3000"
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 2025 | Initial guidelines based on Phase 1 & 2 improvements |

---

## Contributing

When contributing to this codebase:

1. **Follow these guidelines strictly**
2. **Update this document** if you discover new patterns or best practices
3. **Review PR checklist** before submitting pull requests
4. **Add tests** for new functionality
5. **Update documentation** for API changes

---

## Support

For questions or clarifications:
- Review the walkthrough document
- Check git commit history for examples
- Refer to OCPP 1.6 specification
- Consult with team leads

---

**Remember: The goal is production-ready, maintainable, OCPP-compliant code with 90%+ specification compliance and comprehensive error handling.**
