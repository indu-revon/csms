import { apiClient } from './apiClient'

export interface Model {
  id: number
  name: string
  vendor?: string
  powerOutputKw?: number
  maxCurrentAmp?: number
  maxVoltageV?: number
  createdAt: string
  updatedAt: string
}

export interface CreateModelDto {
  name: string
  vendor?: string
  powerOutputKw?: number
  maxCurrentAmp?: number
  maxVoltageV?: number
}

class ModelService {
  private readonly baseUrl = '/models'

  async getAll(): Promise<Model[]> {
    return await apiClient.get<Model[]>(this.baseUrl)
  }

  async getById(id: number): Promise<Model> {
    return await apiClient.get<Model>(`${this.baseUrl}/${id}`)
  }

  async create(data: CreateModelDto): Promise<Model> {
    return await apiClient.post<Model>(this.baseUrl, data)
  }

  async update(id: number, data: Partial<CreateModelDto>): Promise<Model> {
    return await apiClient.put<Model>(`${this.baseUrl}/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

export const modelService = new ModelService()