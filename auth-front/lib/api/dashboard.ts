import apiClient from './client'

// 앱 등록
export const registerClient = async (data: {
    clientName: string
    redirectUris: string[]
    scopes: string[]
    authorizationGrantTypes: string[]
}) => {
    const response = await apiClient.post('/api/clients/register', data)
    return response.data
}

// 앱 목록 조회
export const getClients = async () => {
    const response = await apiClient.get('/api/clients')
    return response.data
}

// 앱 상세 조회
export const getClientDetail = async (clientId: string) => {
    const response = await apiClient.get(`/api/clients/${clientId}`)
    return response.data
}

// 앱 삭제
export const deleteClient = async (clientId: string) => {
    const response = await apiClient.delete(`/api/clients/${clientId}`)
    return response.data
}