import apiClient from './client'

// API 호출 코드 모아두기(유지보수 용이)

// 앱 등록할 때 쓰는 함수
// 폼에서 입력받은 데이터를 백엔드로 POST 요청 보냄
// 응답으로 client_id, client_secret 받아옴
export const registerClient = async (data: {
  clientName: string
  redirectUris: string[]
  scopes: string[]
  authorizationGrantTypes: string[]
}) => {
  const response = await apiClient.post('/api/clients/register', data)
  return response.data
}

// 등록된 앱 목록을 GET으로 불러오는 함수
export const getClients = async () => {
  const response = await apiClient.get('/api/clients')
  return response.data
}

// 특정 앱을 삭제하는 함수
// clientId를 URL에 넣어서 어떤 앱 지울지 서버한테 알려줌
export const deleteClient = async (clientId: string) => {
  const response = await apiClient.delete(`/api/clients/${clientId}`)
  return response.data
}