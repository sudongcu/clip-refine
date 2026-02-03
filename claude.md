# ClipRefine - Chrome Extension Development Guide

## Project Overview

ClipRefine은 Chrome Manifest V3 기반 확장 프로그램으로, 클립보드 복사 시 텍스트를 자동으로 처리/변환하는 도구입니다.

## Tech Stack

- **Chrome Extension**: Manifest V3, Content Scripts, Service Worker, Storage Sync API
- **JavaScript**: ES6+ 순수 바닐라 JS (프레임워크 없음)
- **CSS**: Tailwind CSS 3.4.19 + @tailwindcss/forms
- **결제**: Lemon Squeezy API (라이선스 관리)
- **폰트**: Manrope, Material Symbols Outlined (아이콘)

## Project Structure

```
clip-refine/
├── manifest.json          # 확장 프로그램 설정
├── background.js          # Service Worker (초기화, 메시징)
├── content.js             # Content Script (클립보드 이벤트)
├── popup.html/js          # 팝업 UI
├── options.html/js        # 설정 페이지
├── utils/license.js       # 라이선스 유틸리티
├── src/input.css          # Tailwind 소스
└── styles.css             # 컴파일된 CSS
```

## Coding Conventions

### JavaScript

- **Async/Await** 사용 (Storage, API 호출)
- **camelCase**: 변수, 함수명
- **Template Literals**: HTML 문자열 생성 시
- **const/let**: var 사용 금지

### Storage 패턴

```javascript
// 읽기
const { rules } = await chrome.storage.sync.get(['rules']);

// 쓰기
await chrome.storage.sync.set({ rules: updatedRules });

// 변경 감지
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.rules) {
    // 처리
  }
});
```

### 메시지 통신

```javascript
// 메시지 전송
chrome.runtime.sendMessage({ action: 'actionName', data: payload });

// 메시지 수신 (background.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'actionName') {
    // 처리
    sendResponse({ success: true });
  }
  return true; // 비동기 응답 시 필수
});
```

## Security Rules

### XSS 방지

- **필수**: 사용자 입력을 HTML에 삽입할 때 `textContent` 사용
- **금지**: `innerHTML`에 사용자 입력 직접 삽입 금지

```javascript
// 올바른 방법
const div = document.createElement('div');
div.textContent = userInput;
const escaped = div.innerHTML;

// 금지
element.innerHTML = userInput; // XSS 취약점!
```

### Regex 검증

사용자 입력 Regex는 반드시 저장 전 검증:

```javascript
try {
  new RegExp(pattern, flags);
} catch (e) {
  showError('Invalid regex pattern');
  return;
}
```

## FREE vs PRO Features

### FREE 제한

- 커스텀 규칙: 최대 5개
- 도메인 필터: 규칙당 최대 3개
- 개별 규칙 토글: 불가 (전역 ON/OFF만)
- Import/Export: 불가

### PRO 전용

- 무제한 규칙 및 도메인
- 개별 규칙 토글
- Import/Export 기능

### Feature Gate 사용법

```javascript
import { isProUser, canAddMoreRules } from './utils/license.js';

// PRO 확인
if (await isProUser()) {
  // PRO 기능 활성화
}

// 규칙 추가 가능 여부
if (await canAddMoreRules(currentRuleCount)) {
  // 규칙 추가 허용
}
```

## UI/UX Guidelines

### 색상 시스템

- **Primary**: Gradient `#818cf8` → `#22d3ee`
- **Dark Mode**: `dark:` Tailwind 프리픽스 사용
- **배경**: Light `bg-gray-50`, Dark `dark:bg-gray-900`

### Toast 알림

```javascript
// content.js 패턴 참고
showToast(message, duration = 2000);
```

### 모달

- `z-index: 9999` 사용
- 배경 클릭 시 닫기
- ESC 키로 닫기

## Build Commands

```bash
# CSS 빌드 (프로덕션)
npm run build:css

# CSS 감시 모드 (개발)
npm run watch:css
```

## File Modification Rules

### manifest.json 수정 시

- `version` 증가 필수
- 새 권한 추가 시 문서화
- `host_permissions` 변경 주의

### 새 Storage 키 추가 시

- `background.js`의 기본값 초기화에 추가
- 마이그레이션 로직 고려

### CSS 수정 시

- `src/input.css` 수정 후 `npm run build:css` 실행
- `styles.css` 직접 수정 금지 (덮어씌워짐)

## Testing Checklist

변경 후 수동 테스트:

- [ ] 확장 프로그램 로드/리로드
- [ ] 팝업 열기/닫기
- [ ] 설정 페이지 모든 탭
- [ ] 규칙 생성/수정/삭제
- [ ] 클립보드 복사 테스트 (여러 사이트)
- [ ] Dark/Light 모드 전환
- [ ] FREE/PRO 기능 분리 확인

## Documentation

- 주요 문서: `docs/` 폴더
- 한국어/영어 혼용 가능
- 기술 결정사항은 해당 docs 파일에 기록

## Common Patterns

### 규칙 적용 순서

1. 전역 활성화 확인
2. 도메인 필터 확인
3. 규칙 활성화 확인
4. Regex 패턴 순차 적용

### 에러 처리

```javascript
try {
  // 작업
} catch (error) {
  console.error('[ClipRefine]', error);
  // 사용자에게 피드백
}
```

## Do NOT

- `eval()` 또는 `new Function()` 사용 금지
- 외부 CDN 스크립트 로드 금지 (CSP 위반)
- `chrome.storage.local` 대신 `sync` 사용 (동기화용)
- 불필요한 권한 요청 금지
- 사용자 데이터 외부 전송 금지 (프라이버시)
