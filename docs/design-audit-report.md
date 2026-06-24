# Design Audit Report

## Summary

스크린샷과 디자인 시안(`SLCNScreens.dc.html`) 비교 결과, 디자인 시안은 이모지를 전혀 사용하지 않는 반면 모바일 셸의 상단 바 제목들에 이모지가 남아있는 것이 가장 큰 불일치 항목입니다. 또한 나들이 추가 페이지의 제목/설명 문구가 디자인과 다르며, 단계 표시기(step indicator)에 번호 배지가 없습니다.

## Screenshot Coverage

| No | Screenshot | Route | State |
|---|---|---|---|
| 01 | 01-login-main.png | /main/login | 로그인 화면 (데스크탑) |
| 02 | 02-home-main.png | /main | 홈 화면 (데스크탑) |
| 03 | 03-trip-list-main.png | /main/map | 나들이 목록 (데스크탑) |
| 04 | 04-trip-quiz-modal.png | /main/map | 퀴즈 모달 열린 상태 |
| 05 | 05-trip-quiz-correct.png | /main/map | 퀴즈 정답 피드백 |
| 06 | 06-trip-detail-main.png | /main/map/TRIP-0001 | 나들이 상세 (데스크탑) |
| 07 | 07-trip-register-step1.png | /main/map/register | 나들이 추가 1단계 |
| 08 | 08-trip-register-step2.png | /main/map/register | 나들이 추가 2단계 |
| 09 | 09-trip-register-step3.png | /main/map/register | 나들이 추가 3단계 |
| 10 | 10-calendar-month.png | /main/calendar | 캘린더 월간 뷰 |
| 11 | 11-calendar-week.png | /main/calendar/week | 캘린더 주간 뷰 |
| 12 | 12-calendar-event-modal.png | /main/calendar/week | 일정 추가 모달 |
| 13 | 13-calendar-manage-modal.png | /main/calendar/week | 캘린더 관리 모달 |
| 14 | 14-shoes-catalog.png | /main/shoesRecom | 신발 추천 목록 |
| 15 | 15-shoe-detail.png | /main/asics/jog100 | 신발 상세 |
| 16 | 16-login-mobile.png | /mobile/login | 로그인 화면 (모바일) |
| 17 | 17-home-mobile.png | /mobile | 홈 화면 (모바일) |
| 18 | 18-trip-list-mobile.png | /mobile/map | 나들이 목록 (모바일) |
| 19 | 19-trip-quiz-mobile.png | /mobile/map | 퀴즈 정답 피드백 (모바일) |
| 20 | 20-trip-detail-mobile.png | /mobile/map/TRIP-0001 | 나들이 상세 (모바일) |
| 21 | 21-calendar-month-mobile.png | /mobile/calendar | 캘린더 월간 뷰 (모바일) |
| 22 | 22-calendar-week-mobile.png | /mobile/calendar/week | 캘린더 주간 뷰 (모바일) |
| 23 | 23-shoes-catalog-mobile.png | /mobile/shoesRecom | 신발 추천 목록 (모바일) |
| 24 | 24-shoe-detail-mobile.png | /mobile/asics/jog100 | 신발 상세 (모바일) |
| 25 | 25-trip-register-mobile.png | /mobile/map/register | 나들이 추가 (모바일) |

## Global Issues

- 모바일 셸 상단 바 제목에 이모지(📷, 🗓️, 😎, 👟)가 남아 있음 — 디자인 시안에는 이모지 없음
- 나들이 추가 페이지 제목/설명 문구가 디자인과 다름

## Page-by-Page Issues

### Mobile Shell (MainMobileShell, DetailMobileShell)

- Screenshot: `17-home-mobile.png`, `18-trip-list-mobile.png`, `24-shoe-detail-mobile.png`
- 디자인 시안과 다른 점:
  - 상단 바에 이모지 포함 (📷, 🗓️, 😎, 👟)
  - `getMainMobileTitle`의 캘린더: '서울촌놈 나들이 일정 🗓️' — 공백 없음 + 이모지
- 수정 필요 항목:
  - `MainMobileShell.tsx`: 모든 제목에서 이모지 제거, 캘린더 '서울촌놈' → '서울 촌놈' 수정
  - `DetailMobileShell.tsx`: '서울 촌놈 나들이 경로 😎' → '서울 촌놈 나들이 경로', 신발 이모지 제거

### Trip Register Page

- Screenshot: `07-trip-register-step1.png`
- Route: `/main/map/register`
- 디자인 시안과 다른 점:
  - 제목: "서울 촌놈 나들이 추가" vs 디자인 "새 나들이 기록하기"
  - 설명: 문구 다름
  - Step indicator: 번호 배지(1, 2, 3)가 없음 — 디자인은 각 탭에 흑색 원형 번호 포함
- 수정 필요 항목:
  - `TripRegisterWizard.tsx`: 제목, 설명 문구 변경
  - Step indicator에 번호 배지 추가

## Component-Level Issues

- `MainMobileShell.tsx` → `getMainMobileTitle()`: 이모지 제거, 스페이스 수정
- `DetailMobileShell.tsx` → `getDetailMobileTitle()`: 이모지 제거
- `TripRegisterWizard.tsx`: 제목/설명 + step indicator 번호 배지

## Priority

**P0:**
- 모바일 셸 상단 바 이모지 제거 (캘린더/기록/신발/경로 화면 모두 영향)

**P1:**
- 나들이 추가 페이지 제목/설명 문구
- Step indicator 번호 배지 추가

**P2 (현재 구현이 기능적으로 동등하거나 의도적 선택으로 판단):**
- 신발 카탈로그 브랜드 네비게이션: 디자인은 sticky + 활성 상태 chip이나 현재 anchor 링크도 적절히 작동함
- 나들이 카드: 디자인에 trip.desc 필드 있으나 API에 미포함
