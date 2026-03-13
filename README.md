# 🌙 Flex Payroll & Security System

현대적인 인터페이스와 안전한 권한 관리를 제공하는 차세대 급여 및 야근 관리 시스템입니다. JSP 기반의 레거시 시스템을 Next.js 기반의 고성능 SPA로 현대화하고, 인사 관리 중심의 유연한 프로세스를 구현했습니다.

## 🚀 프로젝트 개요

- **목표**: 복잡한 직급 체계에 대응하는 유연한 야근 승인 워크플로우와 직관적인 급여 지급 시스템 구축
- **핵심 가치**: 사용자 경험(UX) 극대화, 데이터 무결성 보장, 역할 기반 권한 제어(RBAC)
- **현대화**: 기존 JSP/HTML 정적 사이트에서 Next.js App Router 기반의 반응형 웹 앱으로 완전 전환

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Modern/Premium Design)
- **State Management**: React Context API (`AuthContext`)
- **Animations**: Custom Particles.js, CSS Keyframes

### Backend
- **Framework**: Spring Boot 3+
- **Database**: MySQL
- **ORM**: Spring Data JPA
- **Security**: Spring Security (RBAC 적용)

## ✨ 주요 기능

### 1. 인증 및 권한 (Auth & Security)
- **보안 로그인**: 백엔드 API 연동을 통한 보안 인증
- **역할 기반 제어**: ADMIN, HR, EMPLOYEE 역할별 자동 메뉴 구성 및 접근 제한
- **세션 유지**: LocalStorage 기반의 영구적인 사용자 세션 관리

### 2. 야근 및 결재 시스템 (Overtime & Approval)
- **야근 신청**: 날짜, 시간, 사유를 입력하여 실시간 신청
- **승인 체인 (Workflow)**: 직급 레벨에 따른 자동 결재선 구성
  - 하위 직급 신청 시 차상위 직급자들에게 순차적으로 노출
- **실시간 추적**: 내 신청서의 현재 결재 위치와 결재자 의견을 시각적 그래프로 확인
- **취소 기능**: 대기 상태의 신청서를 사원이 직접 회수 가능

### 3. 직급 및 인사 관리 (Management)
- **유연한 직급 체계**: 레벨 숫자가 높을수록 상위 직급으로 동작하는 커스텀 계층 설정
- **사용자 관리**: 신규 사원 등록, 직급 배정, 퇴사(비활성화) 처리

### 4. 급여 및 통계 (Payroll & Dashboard)
- **자동 수당 계산**: 승인된 야근 시간을 기준으로 시간당 1.5배 수당 자동 산출
- **일괄 지급**: HR 담당자가 해당 월의 미지급 급여를 원클릭으로 일괄 지급 처리
- **데이터 시각화**: 직관적인 대시보드 카드로 회사/개인의 활동 현황 요약

## 📐 핵심 비즈니스 로직

### 승인 워크플로우 규칙
- **Rank Level**: `Higher Integer = Higher Rank` (예: 레벨 1 계장, 레벨 5 부장)
- **Chain of Command**: 신청 사원의 레벨보다 높은 레벨을 가진 상급자들이 관리 페이지에서 승인 대기 목록을 확인합니다.

### 급여 산정 공식
- `총 급여 = 기본급 + (야근 시간 * 통상 임금 * 1.5)`

## 💻 실행 방법

### Backend
1. IntelliJ에서 `BackendApplication.java` 실행 (Port 8080)
2. `application.yml`의 DB 설정 확인 (MySQL)

### Frontend
```bash
cd business/frontend
npm install
npm run dev
```
- `http://localhost:3000` 접속

---
*본 프로젝트는 OAuth 2.0 보안 연동을 염두에 둔 아키텍처로 설계되었습니다.*
