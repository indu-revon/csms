import { apiClient } from './apiClient'

export interface Station {
  id: number
  ocppIdentifier: string
  vendor?: string
  model?: string
  firmwareVersion?: string
  serialNumber?: string
  status?: string
  lastHeartbeatAt?: string
  createdAt: string
  updatedAt: string
  connectors?: Connector[]
  // Hardware info
  powerOutputKw?: number
  maxCurrentAmp?: number
  maxVoltageV?: number
  modelId?: number
  // Real-time connection info
  isConnected?: boolean
  computedStatus?: string
}


export interface Connector {
  id: number
  chargingStationId: number
  connectorId: number
  status?: string
  lastStatusAt?: string
  maxPowerKw?: number
}

export interface Session {
  id: number
  chargingStationId: number
  connectorId: number
  ocppTransactionId: bigint
  ocppIdTag: string
  startTimestamp: string
  stopTimestamp?: string
  startMeterValue?: number
  stopMeterValue?: number
  energyKwh?: number
  sessionStatus?: string
  createdAt: string
  updatedAt: string
}

export interface RfidCard {
  id: number
  tagId: string
  status: string
  validFrom?: string
  validUntil?: string
  userId?: number
  createdAt: string
  updatedAt: string
}

export interface Reservation {
  id: number
  chargingStationId: number
  connectorId?: number
  ocppReservationId: number
  ocppIdTag: string
  expiryDatetime: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  email: string
  name: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: number
  userId?: number
  actionType: string
  targetType: string
  targetId?: number
  timestamp: string
  metadata?: string
  status?: string
  request?: string
  response?: string
}

export interface OcppMessageLog {
  id: number
  chargingStationId: number
  chargingStation?: {
    id: number
    ocppIdentifier: string
  }
  direction: 'INCOMING' | 'OUTGOING'
  logType: 'CALL' | 'CALL_RESULT' | 'CALL_ERROR'
  actionType?: string
  messageId: string
  request?: string
  response?: string
  timestamp: string
}

class StationService {
  private readonly baseUrl = '/stations'

  async getAll(): Promise<Station[]> {
    return await apiClient.get<Station[]>(this.baseUrl)
  }

  async getById(id: string): Promise<Station> {
    return await apiClient.get<Station>(`${this.baseUrl}/${id}`)
  }

  async create(data: Partial<Station>): Promise<Station> {
    return await apiClient.post<Station>(this.baseUrl, data)
  }

  async update(id: string, data: Partial<Station>): Promise<Station> {
    return await apiClient.put<Station>(`${this.baseUrl}/${id}`, data)
  }

  async delete(ocppIdentifier: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${ocppIdentifier}`)
  }
}

class SessionService {
  private readonly baseUrl = '/sessions'

  async getAll(params?: {
    search?: string;
    stationId?: string | number;
    connectorId?: string | number;
    idTag?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Session[]; total: number; page: number; limit: number } | Session[]> {
    if (!params || Object.keys(params).length === 0) {
      // Backward compatibility: if no params, return as before
      return await apiClient.get<Session[]>(this.baseUrl)
    }

    const urlParams = new URLSearchParams()
    if (params.search) urlParams.append('search', params.search)
    if (params.stationId) urlParams.append('stationId', params.stationId.toString())
    if (params.connectorId) urlParams.append('connectorId', params.connectorId.toString())
    if (params.idTag) urlParams.append('idTag', params.idTag)
    if (params.page) urlParams.append('page', params.page.toString())
    if (params.limit) urlParams.append('limit', params.limit.toString())

    const queryString = urlParams.toString()
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

    return await apiClient.get<{ data: Session[]; total: number; page: number; limit: number }>(url)
  }

  async getByStation(cpId: string): Promise<Session[]> {
    return await apiClient.get<Session[]>(`${this.baseUrl}/station/${cpId}`)
  }

  async getActiveByStation(cpId: string): Promise<Session[]> {
    return await apiClient.get<Session[]>(`${this.baseUrl}/station/${cpId}/active`)
  }

  async getById(id: number): Promise<Session> {
    return await apiClient.get<Session>(`${this.baseUrl}/${id}`)
  }

  async create(data: Partial<Session>): Promise<Session> {
    return await apiClient.post<Session>(this.baseUrl, data)
  }

  async update(id: number, data: Partial<Session>): Promise<Session> {
    return await apiClient.put<Session>(`${this.baseUrl}/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class RfidService {
  private readonly baseUrl = '/rfid'

  async getAll(): Promise<RfidCard[]> {
    return await apiClient.get<RfidCard[]>(this.baseUrl)
  }

  async getById(tagId: string): Promise<RfidCard> {
    return await apiClient.get<RfidCard>(`${this.baseUrl}/${tagId}`)
  }

  async create(data: Partial<RfidCard>): Promise<RfidCard> {
    return await apiClient.post<RfidCard>(this.baseUrl, data)
  }

  async update(tagId: string, data: Partial<RfidCard>): Promise<RfidCard> {
    return await apiClient.put<RfidCard>(`${this.baseUrl}/${tagId}`, data)
  }

  async block(tagId: string): Promise<RfidCard> {
    return await apiClient.post<RfidCard>(`${this.baseUrl}/${tagId}/block`)
  }

  async activate(tagId: string): Promise<RfidCard> {
    return await apiClient.post<RfidCard>(`${this.baseUrl}/${tagId}/activate`)
  }

  async delete(tagId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${tagId}`)
  }
}

class ReservationService {
  private readonly baseUrl = '/reservations'

  async getAll(): Promise<Reservation[]> {
    return await apiClient.get<Reservation[]>(this.baseUrl)
  }

  async getById(id: number): Promise<Reservation> {
    return await apiClient.get<Reservation>(`${this.baseUrl}/${id}`)
  }

  async create(data: Partial<Reservation>): Promise<Reservation> {
    return await apiClient.post<Reservation>(this.baseUrl, data)
  }

  async update(id: number, data: Partial<Reservation>): Promise<Reservation> {
    return await apiClient.put<Reservation>(`${this.baseUrl}/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class UserService {
  private readonly baseUrl = '/users'

  async getAll(): Promise<User[]> {
    return await apiClient.get<User[]>(this.baseUrl)
  }

  async getById(id: number): Promise<User> {
    return await apiClient.get<User>(`${this.baseUrl}/${id}`)
  }

  async create(data: Partial<User>): Promise<User> {
    return await apiClient.post<User>(this.baseUrl, data)
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    return await apiClient.put<User>(`${this.baseUrl}/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class AuditLogService {
  private readonly baseUrl = '/audit'

  async getByStationId(stationId: number): Promise<AuditLog[]> {
    return await apiClient.get<AuditLog[]>(`${this.baseUrl}/station/${stationId}`)
  }
}

interface OcppLogFilters {
  search?: string
  stationId?: number
  direction?: 'INCOMING' | 'OUTGOING'
  logType?: 'CALL' | 'CALL_RESULT' | 'CALL_ERROR'
  actionType?: string
  page?: number
  limit?: number
}

interface OcppLogResponse {
  data: OcppMessageLog[]
  total: number
  page: number
  limit: number
}

class OcppLogService {
  private readonly baseUrl = '/ocpp-logs'

  async getAll(filters?: OcppLogFilters): Promise<OcppLogResponse> {
    const params = new URLSearchParams()

    if (filters?.search) params.append('search', filters.search)
    if (filters?.stationId) params.append('stationId', filters.stationId.toString())
    if (filters?.direction) params.append('direction', filters.direction)
    if (filters?.logType) params.append('logType', filters.logType)
    if (filters?.actionType) params.append('actionType', filters.actionType)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const queryString = params.toString()
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

    return await apiClient.get<OcppLogResponse>(url)
  }

  async getByStation(cpId: string, filters?: Omit<OcppLogFilters, 'stationId'>): Promise<OcppLogResponse> {
    const params = new URLSearchParams()

    if (filters?.search) params.append('search', filters.search)
    if (filters?.direction) params.append('direction', filters.direction)
    if (filters?.logType) params.append('logType', filters.logType)
    if (filters?.actionType) params.append('actionType', filters.actionType)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const queryString = params.toString()
    const url = queryString ? `${this.baseUrl}/station/${cpId}?${queryString}` : `${this.baseUrl}/station/${cpId}`

    return await apiClient.get<OcppLogResponse>(url)
  }

  async getById(id: number): Promise<OcppMessageLog> {
    return await apiClient.get<OcppMessageLog>(`${this.baseUrl}/${id}`)
  }
}

class OperationsService {
  private readonly baseUrl = '/admin'

  async remoteStart(cpId: string, data: { connectorId?: number; idTag: string }) {
    return await apiClient.post(`${this.baseUrl}/${cpId}/start-transaction`, data)
  }

  async remoteStop(cpId: string, data: { transactionId: number }) {
    return await apiClient.post(`${this.baseUrl}/${cpId}/stop-transaction`, data)
  }

  async changeAvailability(cpId: string, data: { connectorId: number; type: string }) {
    return await apiClient.post(`${this.baseUrl}/${cpId}/change-availability`, data)
  }

  async reset(cpId: string, data?: { type?: string }) {
    return await apiClient.post(`${this.baseUrl}/${cpId}/reset`, data)
  }

  async unlockConnector(cpId: string, data: { connectorId: number }) {
    return await apiClient.post(`${this.baseUrl}/${cpId}/unlock-connector`, data)
  }

  async clearCache(cpId: string) {
    return await apiClient.post(`${this.baseUrl}/${cpId}/clear-cache`)
  }

  async triggerMessage(cpId: string, data: { requestedMessage: string; connectorId?: number }) {
    return await apiClient.post(`${this.baseUrl}/${cpId}/trigger-message`, data)
  }

  async dataTransfer(cpId: string, data: { vendorId: string; messageId?: string; data?: string }) {
    return await apiClient.post(`${this.baseUrl}/${cpId}/data-transfer`, data)
  }

  async reserveNow(cpId: string, data: { connectorId: number; expiryDate: Date; idTag: string; reservationId: number; parentIdTag?: string }) {
    return await apiClient.post(`${this.baseUrl}/${cpId}/reserve-now`, data)
  }

  async cancelReservation(cpId: string, data: { reservationId: number }) {
    return await apiClient.post(`${this.baseUrl}/${cpId}/cancel-reservation`, data)
  }
}

export const stationService = new StationService()
export const sessionService = new SessionService()
export const rfidService = new RfidService()
export const reservationService = new ReservationService()
export const userService = new UserService()
export const auditLogService = new AuditLogService()
export const ocppLogService = new OcppLogService()
export const operationsService = new OperationsService()