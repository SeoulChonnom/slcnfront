# Design Audit Result

디자인 감사(audit) 수정 결과 보고서입니다.  
수정 전 스크린샷: `docs/design-audit/`  
수정 후 스크린샷: `docs/design-audit-after/`

---

## 수정 요약

| 우선순위 | 항목 | 파일 | 상태 |
|---|---|---|---|
| P0 | 모바일 상단 바 이모지 제거 (기록, 일정, 신발, 경로) | `MainMobileShell.tsx`, `DetailMobileShell.tsx` | ✅ 완료 |
| P1 | 나들이 등록 페이지 타이틀·설명 텍스트 업데이트 | `TripRegisterWizard.tsx` | ✅ 완료 |
| P1 | 단계 인디케이터 번호 뱃지 + 필 스타일 재설계 | `components-common.css` | ✅ 완료 |

---

## 수정 상세

### P0 · 모바일 상단 바 이모지 제거

디자인 원본에는 이모지가 없으나 구현에는 이모지가 삽입되어 있었습니다.

**변경 파일**
- `src/app/shells/MainMobileShell.tsx`
- `src/app/shells/DetailMobileShell.tsx`

| 화면 | 수정 전 | 수정 후 |
|---|---|---|
| 나들이 기록 탭 | `서울 촌놈 나들이 기록 📷` | `서울 촌놈 나들이 기록` |
| 나들이 일정 탭 | `서울 촌놈 나들이 일정 🗓️` | `서울 촌놈 나들이 일정` |
| 신발 추천 탭 | `서울 촌놈's 신발 추천 👟` | `서울 촌놈's 신발 추천` |
| 나들이 경로 (상세) | `서울 촌놈 나들이 경로 😎` | `서울 촌놈 나들이 경로` |

**스크린샷 비교**

| 화면 | Before | After |
|---|---|---|
| 나들이 기록 (모바일) | `docs/design-audit/18-trip-list-mobile.png` | `docs/design-audit-after/18-trip-list-mobile.png` |
| 나들이 일정 월간 (모바일) | `docs/design-audit/21-calendar-month-mobile.png` | `docs/design-audit-after/21-calendar-month-mobile.png` |
| 나들이 일정 주간 (모바일) | `docs/design-audit/22-calendar-week-mobile.png` | `docs/design-audit-after/22-calendar-week-mobile.png` |
| 신발 추천 (모바일) | `docs/design-audit/23-shoes-catalog-mobile.png` | `docs/design-audit-after/23-shoes-catalog-mobile.png` |
| 신발 상세 (모바일) | `docs/design-audit/24-shoe-detail-mobile.png` | `docs/design-audit-after/24-shoe-detail-mobile.png` |
| 나들이 경로 (모바일) | `docs/design-audit/20-trip-detail-mobile.png` | `docs/design-audit-after/20-trip-detail-mobile.png` |

---

### P1 · 나들이 등록 타이틀 및 설명 업데이트

디자인 원본의 헤더 텍스트와 일치하도록 타이틀·설명을 수정했습니다.

**변경 파일**: `src/domains/trip/components/TripRegisterWizard.tsx`

| 항목 | 수정 전 | 수정 후 |
|---|---|---|
| 타이틀 | `새 나들이 기록` | `새 나들이 기록하기` |
| 설명 | `(없음)` | `날짜 · 지도 · 퀴즈 정보를 차례로 입력해 기록을 남겨요.` |

---

### P1 · 단계 인디케이터 번호 뱃지 + 필 스타일 재설계

디자인 원본의 스텝 탭은 번호 뱃지가 포함된 필(pill) 형태였으나, 구현은 단순 텍스트 탭이었습니다.

**변경 파일**: `src/styles/components-common.css`, `src/domains/trip/components/TripRegisterWizard.tsx`

변경 내용:
- 각 스텝 `<span>` 안에 `<span class="slcn-trip-register-wizard__step-num">` 번호 뱃지 추가
- 비활성 탭: `border: 1px solid #ead9df`, `background: #fff`, 번호 뱃지 `background: #f1e3e8`
- 활성 탭: `background: var(--color-brand-pink)`, 번호 뱃지 `background: var(--color-ink)` (검정 원형)

**스크린샷 비교**

| 화면 | Before | After |
|---|---|---|
| 등록 Step 1 (데스크탑) | `docs/design-audit/07-trip-register-step1.png` | `docs/design-audit-after/07-trip-register-step1.png` |
| 등록 Step 2 (데스크탑) | `docs/design-audit/08-trip-register-step2.png` | `docs/design-audit-after/08-trip-register-step2.png` |
| 등록 Step 3 (데스크탑) | `docs/design-audit/09-trip-register-step3.png` | `docs/design-audit-after/09-trip-register-step3.png` |
| 등록 Step 1 (모바일) | `docs/design-audit/25-trip-register-mobile.png` | `docs/design-audit-after/25-trip-register-mobile.png` |

---

## 변경 없는 화면

아래 화면은 디자인과 구현 간 차이가 없거나, 의도적인 기능 차이로 수정 대상에서 제외했습니다.

| 화면 | 비고 |
|---|---|
| 로그인 (데스크탑/모바일) | 일치 |
| 홈 허브 (데스크탑/모바일) | 일치 |
| 나들이 목록 (데스크탑) | 일치 |
| 퀴즈 모달 (데스크탑/모바일) | 일치 |
| 나들이 상세 (데스크탑) | 일치 |
| 캘린더 월간/주간 (데스크탑) | 일치 |
| 일정 추가/캘린더 관리 모달 | 일치 |
| 신발 목록/상세 (데스크탑) | 일치 |
| 신발 브랜드 앵커 내비게이션 | 디자인과 다르지만 기능적 선택 (유지) |

---

## 테스트 결과

```
pnpm test → 155/155 passed
pnpm build → 빌드 성공
```

- `src/app/shells/__tests__/shells.test.tsx` — 이모지 제거에 따른 기대값 업데이트 포함
