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

export interface Driver {
  id: number
  name: string
  email: string
  phone?: string
  virtualRfidTag?: string
  status: string
  balance: number
  holdBalance: number
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

  async getAll(limit?: number): Promise<Session[]> {
    const url = limit ? `${this.baseUrl}?limit=${limit}` : this.baseUrl
    return await apiClient.get<Session[]>(url)
  }

  async getByStation(cpId: string): Promise<Session[]> {
    return await apiClient.get<Session[]>(`${this.baseUrl}/station/${cpId}`)
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
}

class DriverService {
  private readonly baseUrl = '/drivers'

  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
  }): Promise<{ data: Driver[]; total: number }> {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.search) query.append('search', params.search)
    if (params?.sortBy) query.append('sortBy', params.sortBy)
    const url = query.toString() ? `${this.baseUrl}?${query.toString()}` : this.baseUrl
    return await apiClient.get<{ data: Driver[]; total: number }>(url)
  }

  async getById(id: number): Promise<Driver> {
    return await apiClient.get<Driver>(`${this.baseUrl}/${id}`)
  }

  async create(data: { name: string; email: string }): Promise<Driver> {
    return await apiClient.post<Driver>(this.baseUrl, data)
  }

  async update(id: number, data: { name?: string; email?: string; phone?: string; virtualRfidTag?: string }): Promise<Driver> {
    return await apiClient.put<Driver>(`${this.baseUrl}/${id}`, data)
  }

  async blockDriver(id: number): Promise<Driver> {
    return await apiClient.put<Driver>(`${this.baseUrl}/${id}`, { status: 'Blocked' })
  }

  async unblockDriver(id: number): Promise<Driver> {
    return await apiClient.put<Driver>(`${this.baseUrl}/${id}`, { status: 'Active' })
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  // Wallet Operations
  async topUpWallet(id: number, amount: number): Promise<Driver> {
    return await apiClient.post<Driver>(`${this.baseUrl}/${id}/wallet/topup`, { amount })
  }

  async deductWallet(id: number, amount: number): Promise<Driver> {
    return await apiClient.post<Driver>(`${this.baseUrl}/${id}/wallet/deduct`, { amount })
  }

  async freezeBalance(id: number, amount: number): Promise<Driver> {
    return await apiClient.post<Driver>(`${this.baseUrl}/${id}/wallet/freeze`, { amount })
  }

  async unfreezeBalance(id: number, amount: number): Promise<Driver> {
    return await apiClient.post<Driver>(`${this.baseUrl}/${id}/wallet/unfreeze`, { amount })
  }

  // Transactions and Reservations
  async getTransactions(id: number): Promise<any[]> {
    return await apiClient.get<any[]>(`${this.baseUrl}/${id}/transactions`)
  }

  async getReservations(id: number): Promise<any[]> {
    return await apiClient.get<any[]>(`${this.baseUrl}/${id}/reservations`)
  }
}

export const stationService = new StationService()
export const sessionService = new SessionService()
export const rfidService = new RfidService()
export const reservationService = new ReservationService()
export const userService = new UserService()
export const auditLogService = new AuditLogService()
export const operationsService = new OperationsService()
export const driverService = new DriverService()