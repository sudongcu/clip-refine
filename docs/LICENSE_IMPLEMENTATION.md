# ClipRefine - FREE/PRO License Implementation

이 문서는 ClipRefine 확장 프로그램의 FREE/PRO 버전 구분 기능 구현에 대한 설명입니다.

## 📋 기능 개요

### FREE 버전 제한사항
- ✅ **최대 5개의 규칙** - 더 많은 규칙을 추가하려면 PRO 버전 필요
- ✅ **규칙당 최대 3개의 도메인** - 도메인 제한 초과 시 경고
- ❌ **Import/Export 기능 차단** - 업그레이드 모달 표시
- ❌ **개별 규칙 토글 불가** - 팝업에서 전체 ON/OFF만 가능
- ❌ **멀티 프로필 시스템 불가**

### PRO 버전 기능
- ✅ **무제한 규칙 생성**
- ✅ **무제한 도메인 설정**
- ✅ **Import/Export 기능** - 백업 및 공유 가능
- ✅ **개별 규칙 토글** - 팝업에서 각 규칙 즉시 ON/OFF
- ✅ **멀티 프로필 시스템** (향후 구현 예정)

## 🏗️ 구현 구조

### 1. License 관리 유틸리티 (`utils/license.js`)
라이센스 상태 관리, 기능 제한 체크, Lemon Squeezy API 연동을 위한 핵심 유틸리티

**주요 함수:**
- `getLicenseStatus()` - 현재 라이센스 상태 조회
- `isPro()` - PRO 버전 여부 확인
- `getFeatureLimits()` - 버전별 기능 제한 조회
- `hasFeature(feature)` - 특정 기능 사용 가능 여부 확인
- `validateLicenseKey(licenseKey, storeId, apiKey)` - Lemon Squeezy API를 통한 라이센스 키 검증
- `activateLicense(licenseKey, storeId, apiKey)` - PRO 라이센스 활성화
- `deactivateLicense()` - 라이센스 비활성화
- `canAddRule(currentRuleCount)` - 규칙 추가 가능 여부 확인
- `canAddDomain(currentDomainCount)` - 도메인 추가 가능 여부 확인

### 2. Background Script (`background.js`)
확장 프로그램 설치 시 기본 라이센스 상태(FREE) 초기화

```javascript
const defaultLicense = {
  isPro: false,
  licenseKey: null,
  activatedAt: null,
  expiresAt: null,
  isActive: false
};
```

### 3. Options Page (`options.js`, `options.html`)

**기능별 구현:**

#### 규칙 추가 제한
```javascript
// FREE 사용자는 최대 5개까지만
if (!editingRuleId && !licenseStatus.isPro) {
  const MAX_RULES_FREE = 5;
  if (rules.length >= MAX_RULES_FREE) {
    showUpgradeModal(`More than ${MAX_RULES_FREE} rules`);
    return;
  }
}
```

#### 도메인 제한
```javascript
// FREE 사용자는 규칙당 최대 3개 도메인
if (!licenseStatus.isPro) {
  const MAX_DOMAINS_FREE = 3;
  if (targetDomains.length > MAX_DOMAINS_FREE) {
    alert(`FREE version allows maximum ${MAX_DOMAINS_FREE} domains per rule`);
    return;
  }
}
```

#### Import/Export 차단
```javascript
function exportRules() {
  if (!licenseStatus.isPro) {
    showUpgradeModal('Export Rules');
    return;
  }
  // Export 로직...
}
```

#### 라이센스 탭 UI
- FREE 버전: 업그레이드 카드 + 라이센스 키 입력
- PRO 버전: 활성화 상태 표시 + 비활성화 버튼

### 4. Popup (`popup.js`, `popup.html`)

**개별 규칙 토글 (PRO 전용):**
- PRO 사용자: 각 규칙마다 개별 토글 스위치 표시
- FREE 사용자: 규칙 목록만 표시 (토글 없음)

```javascript
if (licenseStatus.isPro && licenseStatus.isActive) {
  // PRO: 개별 토글 표시
  rulesList.innerHTML = activeRules.map(rule => `
    <div>
      <!-- 규칙 정보 -->
      <input type="checkbox" class="rule-toggle-checkbox" data-rule-id="${rule.id}">
    </div>
  `).join('');
} else {
  // FREE: 토글 없이 목록만
  rulesList.innerHTML = activeRules.map(rule => `
    <div><!-- 규칙 정보만 --></div>
  `).join('');
}
```

## 🔐 Lemon Squeezy 연동

### 설정 방법

1. `config.example.js`를 `config.js`로 복사
2. Lemon Squeezy 대시보드에서 필요한 정보 입력:
   ```javascript
   const CONFIG = {
     LEMON_SQUEEZY: {
       STORE_ID: 'your_store_id',
       API_KEY: 'your_api_key',
       PRODUCT_ID: 'your_product_id',
       PAYMENT_URL: 'https://your-store.lemonsqueezy.com/checkout/buy/...'
     }
   };
   ```

3. `options.js`에서 실제 API 호출 활성화:
   ```javascript
   // 현재는 데모 모드 (라이센스 키 길이만 체크)
   // 실제 운영 시에는 validateLicenseKey 함수 사용
   const result = await validateLicenseKey(licenseKey, CONFIG.LEMON_SQUEEZY.STORE_ID, CONFIG.LEMON_SQUEEZY.API_KEY);
   ```

### API 엔드포인트
- **License Validation**: `POST /v1/licenses/validate`
- 필요 헤더: `Authorization: Bearer {API_KEY}`
- 요청 본문: `{ license_key, instance_name }`

## 🎨 UI/UX 특징

### 업그레이드 모달
제한된 기능 사용 시도 시 표시되는 모달:
- 기능 이름 표시
- PRO 기능 목록 안내
- "Maybe Later" / "Upgrade Now" 버튼

### PRO 배지
- 네비게이션: FREE/PRO 배지 표시
- Import/Export 버튼: PRO 배지 오버레이
- License 탭 헤더: 상태에 따른 배지 스타일 변경

### 시각적 피드백
- FREE 버전에서 제한 도달 시 버튼 비활성화
- 규칙 카운터 표시 (예: "3/5")
- PRO 기능에 그라디언트 강조 효과

## 📦 Storage 구조

```javascript
chrome.storage.sync.set({
  license: {
    isPro: boolean,
    licenseKey: string | null,
    activatedAt: string | null,  // ISO 8601
    expiresAt: string | null,     // ISO 8601 (Lifetime은 null)
    isActive: boolean,
    customerId: string | null
  }
});
```

## 🧪 테스트 방법

### FREE 버전 테스트
1. 확장 프로그램 설치 (기본값은 FREE)
2. 규칙 5개 추가 시도 → 6번째부터 차단 확인
3. 규칙에 도메인 4개 입력 시도 → 경고 메시지 확인
4. Import/Export 버튼 클릭 → 업그레이드 모달 확인
5. 팝업 열기 → 개별 토글 없음 확인

### PRO 버전 테스트
1. License 탭에서 테스트 키 입력 (20자 이상)
2. Activate 버튼 클릭 → 성공 메시지 확인
3. 규칙 6개 이상 추가 가능 확인
4. 규칙에 도메인 4개 이상 입력 가능 확인
5. Import/Export 정상 작동 확인
6. 팝업에서 개별 토글 표시 확인

### 라이센스 비활성화 테스트
1. PRO 활성화 상태에서 License 탭 이동
2. "Deactivate License" 버튼 클릭
3. 확인 다이얼로그 승인
4. FREE 버전으로 전환 확인

## 🚀 배포 전 체크리스트

- [ ] `config.js` 파일 생성 및 실제 Lemon Squeezy 정보 입력
- [ ] `options.js`의 라이센스 검증 로직을 실제 API 호출로 변경
- [ ] Lemon Squeezy 제품 및 웹훅 설정 완료
- [ ] 결제 페이지 URL 업데이트
- [ ] 프로덕션 환경에서 라이센스 검증 테스트
- [ ] 에러 핸들링 및 사용자 피드백 검증
- [ ] 크롬 웹 스토어 설명에 FREE/PRO 기능 차이 명시

## 📝 향후 개선 사항

1. **멀티 프로필 시스템** (PRO 전용)
   - 코딩, 편집 등 상황별 규칙 세트
   - 프로필 간 빠른 전환

2. **라이센스 자동 검증**
   - 주기적으로 Lemon Squeezy API 호출하여 라이센스 상태 확인
   - 만료/취소 시 자동으로 FREE 버전으로 전환

3. **사용 통계**
   - PRO 사용자의 기능 사용 패턴 분석
   - 개선점 도출

4. **Trial 기간**
   - 신규 사용자에게 7일 PRO 기능 체험 제공

## 🐛 문제 해결

### 라이센스 활성화 실패
1. API 키가 올바른지 확인
2. 네트워크 연결 확인
3. Lemon Squeezy 서비스 상태 확인
4. 브라우저 콘솔에서 에러 메시지 확인

### Import/Export 버튼이 작동하지 않음
1. 라이센스 상태 확인 (chrome.storage.sync 확인)
2. PRO 배지가 표시되는지 확인
3. 버튼의 disabled 상태 확인

### 개별 토글이 표시되지 않음
1. 팝업에서 라이센스 상태 로드 확인
2. `licenseStatus.isPro` 값 확인
3. 브라우저 콘솔에서 에러 확인

## 📞 지원

문제가 발생하거나 질문이 있으신 경우:
- GitHub Issues: [프로젝트 이슈 페이지]
- 이메일: support@cliprefine.com (예시)

---

**구현 완료일**: 2026-01-28  
**버전**: 1.0.0  
**개발자**: ClipRefine Team
