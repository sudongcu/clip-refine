# FREE/PRO 버전 구분 구현 완료 ✅

## 구현된 기능

### 1. 라이센스 관리 시스템 ✅
- **파일**: `utils/license.js`
- Lemon Squeezy API 연동을 위한 핵심 유틸리티
- 라이센스 상태 관리, 기능 제한 체크, 활성화/비활성화 기능

### 2. FREE 버전 제한사항 ✅

#### 최대 5개 규칙 제한
- 6번째 규칙 추가 시 업그레이드 모달 표시
- 규칙 카운터 표시 (예: "3/5")

#### 규칙당 최대 3개 도메인 제한
- 3개 초과 시 경고 메시지

#### Import/Export 차단
- 버튼에 PRO 배지 표시
- 클릭 시 업그레이드 모달

#### 개별 규칙 토글 불가
- 팝업에서 전체 ON/OFF만 가능
- PRO 사용자만 개별 토글 가능

### 3. PRO 버전 기능 ✅

#### 무제한 규칙 & 도메인
- 제한 없이 자유롭게 추가

#### Import/Export 가능
- 백업 및 공유 기능 활성화

#### 개별 규칙 토글
- 팝업에서 각 규칙 즉시 ON/OFF

#### 라이센스 관리
- License 탭에서 키 입력 및 활성화
- 활성화 상태 표시
- 비활성화 기능

### 4. UI/UX 개선 ✅

#### PRO 배지
- 네비게이션 메뉴
- Import/Export 버튼
- License 탭 헤더

#### 업그레이드 모달
- 기능 설명
- PRO 혜택 안내
- 즉시 업그레이드 또는 나중에

#### 시각적 피드백
- 규칙 제한 표시
- 비활성화 버튼 스타일
- 그라디언트 강조 효과

## 파일 변경 사항

### 새로 생성된 파일
1. `utils/license.js` - 라이센스 관리 유틸리티
2. `config.example.js` - Lemon Squeezy 설정 예시
3. `docs/LICENSE_IMPLEMENTATION.md` - 구현 상세 문서

### 수정된 파일
1. `background.js` - 기본 라이센스 상태 초기화
2. `manifest.json` - license.js 리소스 추가
3. `options.js` - 모든 FREE/PRO 제한 로직 구현
4. `options.html` - license.js 스크립트 추가
5. `popup.js` - 개별 토글 로직 (PRO 전용)
6. `popup.html` - 토글 스타일 및 license.js 추가

## 사용 방법

### 테스트 (FREE 버전)
1. 확장 프로그램 로드 - 기본값은 FREE
2. 규칙 5개까지 추가 가능
3. 6번째 추가 시도 → 업그레이드 모달
4. Import/Export 클릭 → 업그레이드 모달
5. 팝업 확인 → 개별 토글 없음

### 테스트 (PRO 활성화)
1. Options 페이지 → License 탭
2. 라이센스 키 입력 (20자 이상 아무 텍스트)
3. Activate 버튼 클릭
4. 성공 메시지 확인
5. 무제한 규칙 추가 가능
6. Import/Export 정상 작동
7. 팝업에서 개별 토글 표시

### 실제 배포 시
1. `config.example.js` → `config.js` 복사
2. Lemon Squeezy 정보 입력:
   - STORE_ID
   - API_KEY
   - PRODUCT_ID
   - PAYMENT_URL
3. `options.js`의 라이센스 검증을 실제 API 호출로 변경

## Storage 구조

\`\`\`javascript
{
  license: {
    isPro: false,           // PRO 버전 여부
    licenseKey: null,       // 라이센스 키
    activatedAt: null,      // 활성화 시간
    expiresAt: null,        // 만료 시간 (평생 라이센스는 null)
    isActive: false,        // 활성 상태
    customerId: null        // 고객 ID (Lemon Squeezy)
  }
}
\`\`\`

## 다음 단계

### 필수 (배포 전)
- [ ] Lemon Squeezy 계정 생성 및 제품 등록
- [ ] `config.js` 파일 생성 및 실제 API 정보 입력
- [ ] 실제 라이센스 검증 로직으로 교체
- [ ] 결제 페이지 링크 업데이트
- [ ] 프로덕션 환경 테스트

### 선택 (향후 개선)
- [ ] 멀티 프로필 시스템 구현
- [ ] 라이센스 자동 검증 (주기적)
- [ ] Trial 기간 제공
- [ ] 사용 통계 수집

## 주요 제한사항

| 기능 | FREE | PRO |
|------|------|-----|
| 규칙 개수 | 최대 5개 | 무제한 |
| 도메인/규칙 | 최대 3개 | 무제한 |
| Import/Export | ❌ | ✅ |
| 개별 토글 | ❌ | ✅ |
| 프로필 시스템 | ❌ | ✅ (향후) |

## 문의
구현 관련 질문이나 문제가 있으시면 말씀해주세요!
