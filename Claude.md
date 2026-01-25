# Project Specification: ClipFlow (가제)

## 1. 개요 (Overview)
**ClipFlow**는 브라우저 기반의 스마트 클립보드 매니저 확장 프로그램입니다. 사용자가 웹상의 텍스트를 복사(`Ctrl+C` 또는 우클릭 복사)하는 시점에, 미리 정의된 **규칙(Rule)**에 따라 텍스트를 자동으로 가공하여 클립보드에 저장합니다.

* **핵심 가치:** 불필요한 2차 가공(엑셀 붙여넣기 후 수정 등) 시간을 단축하고 휴먼 에러를 방지합니다.
* **Target Audience:** 개발자, 데이터 엔트리 담당자, 재무/회계 실무자.

---

## 2. 핵심 기능 (Features)

### 2.1 MVP (Minimum Viable Product)
초기 버전은 가장 빈번한 니즈(숫자 포맷팅) 해결에 집중하며, 확장성을 검증합니다.

1.  **Global On/Off:** 확장 프로그램 아이콘 클릭으로 전체 기능 활성/비활성 제어.
2.  **기본 프리셋 (Built-in Rules):**
    * **Remove Commas (숫자 콤마 제거):** `1,000,000` → `1000000` (재무/회계용)
    * **Trim Whitespace:** 앞뒤 공백 제거.
3.  **커스텀 규칙 추가 (User Defined Rules):**
    * 정규식(RegEx) 기반의 치환 규칙 작성 기능.
    * `Find Pattern` (Regex) -> `Replace Pattern` (String).

### 2.2 고도화 기능 (Scalability)
다양한 사용자의 니즈를 수용하기 위한 확장 기능입니다.

1.  **도메인별 설정 (Per-Domain Config):**
    * 특정 사이트(예: `finance.google.com`)에서만 특정 규칙이 작동하도록 설정.
2.  **규칙 체이닝 (Rule Chaining):**
    * 여러 규칙을 순서대로 적용 (예: `Trim` 실행 후 -> `Remove Commas` 실행).
3.  **컨텍스트 메뉴 통합:**
    * 우클릭 시 적용할 규칙을 선택하여 복사 (`Copy as JSON`, `Copy as Plain Number` 등).
4.  **프리셋 공유 (Import/Export):**
    * JSON 형태로 규칙 세트를 내보내거나 공유받을 수 있음.

---

## 3. 기술 스택 및 아키텍처 (Technical Spec)

* **Platform:** Chrome Extension (Manifest V3)
* **Language:** JavaScript (ES6+), HTML/CSS
* **Storage:** `chrome.storage.sync` (사용자 설정의 브라우저 간 동기화)

### 3.1 핵심 로직 (Event Pipeline)
1.  **Event Capture:** Content Script에서 `copy` 이벤트 리스너 등록.
2.  **Filter:** 현재 활성화된 규칙 및 도메인 일치 여부 확인.
3.  **Process:**
    * 선택된 텍스트(`window.getSelection().toString()`) 추출.
    * 활성 규칙들의 정규식을 순차적으로 적용 (`String.replace()`).
4.  **Injection:** 가공된 텍스트를 `clipboardData`에 `setData` 후 `preventDefault()` 호출.

---

## 4. 데이터 구조 (Data Schema)

사용자 설정과 규칙을 저장하기 위한 JSON 스키마입니다.

```json
{
  "settings": {
    "isGlobalActive": true,
    "showToast": true  // 변환 시 알림 표시 여부
  },
  "rules": [
    {
      "id": "rule_001",
      "name": "Remove Commas",
      "description": "숫자 사이의 쉼표를 제거합니다.",
      "findPattern": "[\\d,]+",  // 정규식 문자열
      "replacePattern": "",       // 치환 로직 (특수 처리는 별도 플래그 필요)
      "isRegex": true,
      "isActive": true,
      "targetDomains": []         // 비어있으면 전체 적용
    },
    {
      "id": "rule_user_01",
      "name": "Clean URL",
      "description": "URL에서 파라미터 제거",
      "findPattern": "\\?.*$",
      "replacePattern": "",
      "isRegex": true,
      "isActive": false,
      "targetDomains": ["youtube.com", "notion.so"]
    }
  ]
}