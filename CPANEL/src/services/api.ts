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
  role: 'SUPER_ADMIN' | 'OPERATOR' | 'VIEWER'
  createdAt: string
  updatedAt: string
}

// Station API
export const stationService = {
  getAll: () => apiClient.get<Station[]>('/stations'),
  getById: (id: number) => apiClient.get<Station>(`/stations/${id}`),
  getConnected: () => apiClient.get<Station[]>('/stations/connected/list'),
  // Add CRUD operations
  create: (data: Partial<Station>) => apiClient.post<Station>('/stations', data),
  update: (ocppIdentifier: string, data: Partial<Station>) => apiClient.put<Station>(`/stations/${ocppIdentifier}`, data),
  delete: (id: number) => apiClient.delete(`/stations/${id}`),
}

// Session API
export const sessionService = {
  getAll: (params?: { from?: string; to?: string; stationId?: number }) =>
    apiClient.get<Session[]>('/sessions', { params }),
  getById: (id: number) => apiClient.get<Session>(`/sessions/${id}`),
  getByStation: (stationId: string) =>
    apiClient.get<Session[]>(`/sessions/station/${stationId}`),
  // Add CRUD operations
  create: (data: Partial<Session>) => apiClient.post<Session>('/sessions', data),
  update: (id: number, data: Partial<Session>) => apiClient.put<Session>(`/sessions/${id}`, data),
  delete: (id: number) => apiClient.delete(`/sessions/${id}`),
}

// RFID API
export const rfidService = {
  getAll: () => apiClient.get<RfidCard[]>('/rfid'),
  getById: (tagId: string) => apiClient.get<RfidCard>(`/rfid/${tagId}`),
  create: (data: Partial<RfidCard>) => apiClient.post<RfidCard>('/rfid', data),
  block: (tagId: string) => apiClient.post(`/rfid/${tagId}/block`),
  activate: (tagId: string) => apiClient.post(`/rfid/${tagId}/activate`),
  // Add CRUD operations
  update: (tagId: string, data: Partial<RfidCard>) => apiClient.put<RfidCard>(`/rfid/${tagId}`, data),
  delete: (tagId: string) => apiClient.delete(`/rfid/${tagId}`),
}

// Reservation API
export const reservationService = {
  getAll: () => apiClient.get<Reservation[]>('/reservations'),
  getById: (id: number) => apiClient.get<Reservation>(`/reservations/${id}`),
  create: (data: Partial<Reservation>) => apiClient.post<Reservation>('/reservations', data),
  update: (id: number, data: Partial<Reservation>) => apiClient.put<Reservation>(`/reservations/${id}`, data),
  delete: (id: number) => apiClient.delete(`/reservations/${id}`),
}

// Operations API
export const operationsService = {
  remoteStart: (cpId: string, data: { connectorId: number; idTag: string }) =>
    apiClient.post(`/admin/${cpId}/start-transaction`, data),
  remoteStop: (cpId: string, data: { transactionId: number }) =>
    apiClient.post(`/admin/${cpId}/stop-transaction`, data),
  changeAvailability: (cpId: string, data: { connectorId: number; type: string }) =>
    apiClient.post(`/admin/${cpId}/change-availability`, data),
  reset: (cpId: string, data: { type: 'Soft' | 'Hard' }) =>
    apiClient.post(`/admin/${cpId}/reset`, data),
  unlockConnector: (cpId: string, data: { connectorId: number }) =>
    apiClient.post(`/admin/${cpId}/unlock-connector`, data),
}

// User API
export const userService = {
  getAll: () => apiClient.get<User[]>('/users'),
  getById: (id: number) => apiClient.get<User>(`/users/${id}`),
  create: (data: Partial<User>) => apiClient.post<User>('/users', data),
  update: (id: number, data: Partial<User>) => apiClient.put<User>(`/users/${id}`, data),
  delete: (id: number) => apiClient.delete(`/users/${id}`),
}