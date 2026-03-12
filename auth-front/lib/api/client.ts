import axios from 'axios'

// axios 기본 설정 파일
// axios : API 호출 편하게 해주는 라이브러리
const apiClient = axios.create({ // 공통 설정 적어두기
  baseURL: 'http://localhost:9000', // 백엔드 인가 서버 주소
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 로그인 쿠키를 요청에 같이 보냄. 없으면 로그인 상태 유지 안됨
})

export default apiClient