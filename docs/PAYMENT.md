## 결제 기능 완성

### FREE / PRO 구분

### Feature Comparison Table

| Feature | Free | Pro |
|---------|------|---------|
| **Custom Rules** | Max 5 Rules | ✅ Unlimited |
| **Target Domains** | Max 3 Domains per Rule | ✅ Unlimited |
| **Regex Complexity** | ✅ Full Support | ✅ Full Support |
| **Import / Export** | ❌ Blocked | ✅ Available (Backup & Share) |
| **Popup Control** | Global Switch Only<br/>(전체 끄기/켜기만 가능) | ✅ Individual Toggles<br/>(개별 규칙 즉시 ON/OFF 가능) |
| **Profile System** | Single Default Mode | ✅ Multi-Profile Switching<br/>(coding, editing, etc…) |
| **Toast Notifications** | ✅ Available | ✅ Available |
| **Console Logging** | ✅ Available | ✅ Available |

### 결제방식
Lemon Squeezy 사용 ( api 사용하여 인증 및 유지 확인 )
- DB 및 별도의 API 개발 없이 lemon squeezy로 결제 및 라이센스키 인증 방식 활용
- 라이센스키 인증되면 PRO 전환 후 추가 기능 활성화
- 라이센스키 인증 실패 시 실패 modal 노출

하단에 비활성화 클릭 버튼으로 비활성화 처리 가능