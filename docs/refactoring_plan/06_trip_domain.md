# Step 06. Trip Domain

## 1. 목적

나들이 도메인 전체를 old Vue 기준 기능 보존 + Pencil 시안 반영 형태로 구현하는 단계다. 이 도메인은 목록, 퀴즈, 상세, 등록 4개 흐름이 연결되어 있으므로, 화면별 분리보다 사용자 플로우 전체를 기준으로 설계한다.

## 2. 범위

- `/main/map`, `/mobile/map`
- `/main/map/:date`, `/mobile/map/:date`
- `/main/map/register`, `/mobile/map/register`
- 목록 데이터 로드
- 퀴즈 모달 흐름
- 상세 멀티맵 전환
- 등록 3-step 폼
- multipart 업로드

## 3. 참조 소스

- `docs/refactoring_plan/03_design_system_and_pencil_mapping.md`
- `docs/refactoring_plan/05_auth_and_shared_data_layer.md`
- `../old/slcnfront/src/components/trip/tripList.vue`
- `../old/slcnfront/src/views/mapPage.vue`
- `../old/slcnfront/src/views/tripPage.vue`
- `../old/slcnfront/src/views/mapRegisterPage.vue`
- `docs/design/design.pen`
- `docs/new_design_improvement_report.md`

## 4. 확정 결정

- `/map` 검색은 구현하지 않는다.
- 목록 카드 클릭 시 퀴즈를 먼저 통과해야 상세 진입 가능하다.
- 상세는 단일맵/멀티맵 모두 지원한다.
- 등록은 3-step wizard로 구현한다.
- 기존 필드는 모두 유지한다.
- 드라이브 비밀번호 안내는 입력 필드가 아니라 고정 안내 문구로 처리한다.

## 5. 구현 대상

### 5.1 목록

- 타이틀
- 카드 목록
- 관리자용 `새 나들이 기록하기` CTA
- loading / empty / error 상태
- 퀴즈 모달 연결

### 5.2 퀴즈

- 문제 텍스트
- 보기 4개
- 정답/오답 후속 UI
- 정답 시 상세 라우트 이동
- 오답 시 목록 잔류

### 5.3 상세

- 지도 이미지 표시
- map1/map2 토글
- button1/button2 라벨 적용
- 드라이브 링크 CTA
- 파일 다운로드/이미지 로딩 상태 처리

### 5.4 등록

#### Step 1. 기본 정보

- `type`
- `date`
- `info2`(나들이 이름)
- `logo`

#### Step 2. 경로/지도

- `map1`
- `map2` optional
- `button1`
- `button2`
- `drive`

#### Step 3. 퀴즈

- `quizTitle`
- 보기 4개
- `quizAnswer`
- `quizAnswerTitle`
- `quizAnswerText`
- `quizErrorTitle`
- `quizErrorText`

## 6. 파일/폴더 목표 구조

```text
src/
  domains/
    trip/
      components/
        TripCard.tsx
        TripListSection.tsx
        TripQuizModal.tsx
        TripDetailSection.tsx
        TripMapSwitcher.tsx
        TripRegisterWizard.tsx
        TripRegisterStepBasic.tsx
        TripRegisterStepMaps.tsx
        TripRegisterStepQuiz.tsx
      hooks/
        useTripList.ts
        useTripDetail.ts
        useTripQuiz.ts
        useTripRegisterForm.ts
      mappers/
        trip-mappers.ts
      utils/
        trip-form-data.ts
        trip-validation.ts
      __tests__/
  pages/
    main/
      TripListPage.tsx
      TripDetailPage.tsx
      TripRegisterPage.tsx
    mobile/
      TripListPage.tsx
      TripDetailPage.tsx
      TripRegisterPage.tsx
```

## 7. 타입/API/라우트 계약

### 7.1 주요 타입

```ts
type TripListItem = {
  date: string
  info2: string
  logo: string
  quizTitle: string
  quizAnswer: number
  quizResponses: { quizIndex: string; answer: string }[]
  quizAnswerTitle: string
  quizAnswerText: string
  quizErrorTitle: string
  quizErrorText: string
}

type TripDetail = {
  date: string
  map1: string
  map2?: string | null
  button1?: string | null
  button2?: string | null
  drive: string
}
```

### 7.2 등록 payload 계약

- JSON blob key: `tripRegisterRequest`
- 파일 key:
  - `logo`
  - `map1`
  - `map2`

`tripRegisterRequest` 내부 payload는 최소 아래 필드를 가진다.

- `date`
- `type`
- `info1`
- `info2`
- `button1`
- `button2`
- `drive`
- `quizTitle`
- `quizAnswer`
- `quizAnswerTitle`
- `quizAnswerText`
- `quizErrorTitle`
- `quizErrorText`
- `quizRegisterRequestList`

퀴즈 값 정규화 규칙은 아래로 고정한다.

- UI에서 정답 선택은 1, 2, 3, 4 중 하나를 선택하게 한다.
- API payload의 `quizAnswer`는 old Vue와 동일하게 zero-based index로 변환한다.
  - UI 1번 선택 → payload `quizAnswer = 0`
  - UI 4번 선택 → payload `quizAnswer = 3`
- `quizRegisterRequestList`는 아래 shape를 유지한다.
  - `{ quizIndex: '0', answer: '...' }`
  - `{ quizIndex: '1', answer: '...' }`
  - `{ quizIndex: '2', answer: '...' }`
  - `{ quizIndex: '3', answer: '...' }`
- 빈 보기 항목은 submit 직전에 제거하되, 정답 인덱스와 충돌하지 않도록 validation에서 먼저 막는다.

### 7.3 라우트 계약

- 목록
  - `/main/map`
  - `/mobile/map`
- 상세
  - `/main/map/:date`
  - `/mobile/map/:date`
- 등록
  - `/main/map/register`
  - `/mobile/map/register`

## 8. 작업 순서

1. 목록 mapper와 `useTripList`를 구현한다.
2. `TripCard`와 `TripQuizModal`을 구현한다.
3. 목록 페이지 PC/Mobile 프레젠테이션을 구현한다.
4. 상세 mapper와 `useTripDetail`을 구현한다.
5. 멀티맵 토글과 드라이브 CTA를 구현한다.
6. 등록 wizard 상태 모델과 validation schema를 구현한다.
7. 각 step 컴포넌트와 최종 multipart submit을 구현한다.

## 9. 단계 종료 직후 단위 테스트

필수 테스트:

- `useTripQuiz.test.ts`
  - 정답/오답 판정과 후속 흐름 검증
- `TripCard.test.tsx`
  - 카드 클릭 시 퀴즈 모달 오픈 검증
- `TripDetailSection.test.tsx`
  - 단일맵/멀티맵 분기, 버튼 라벨, drive CTA 검증
- `trip-form-data.test.ts`
  - multipart payload builder 검증
- `TripRegisterWizard.test.tsx`
  - step 이동, validation, submit 조건 검증
- `TripListPage.test.tsx`
  - loading/empty/error/normal 상태 검증

테스트 게이트:

- trip domain 테스트 통과 전 Step 07, 08, 09 진행 금지

## 10. 완료 기준

- 목록, 퀴즈, 상세, 등록이 old Vue 기능 기준으로 동작한다.
- 등록 화면의 기존 필드가 누락되지 않았다.
- PC/Mobile 페이지가 공통 도메인 로직을 공유한다.
- 단계 전용 단위 테스트가 모두 통과했다.

## 11. 리스크 / 보류 항목

- `date`가 unique key가 아닐 수 있다는 old store 주석이 있다.
  - 현재 공개 URL과 기존 구현을 유지하기 위해 우선 `date`를 route param으로 계속 사용한다.
- 파일 업로드 validation 규칙이 실제 운영 환경에서 더 엄격할 수 있다.
  - old validation 규칙을 우선 이식한다.
- 퀴즈 정답 인덱스가 UI와 API 사이에서 어긋날 수 있다.
  - submit 직전 zero-based 변환과 validation 테스트를 반드시 둔다.

## 12. 코딩 에이전트 가이드

### 권장 역할

- FE + 퍼블리셔 동시 작업
- PM은 기능 누락 체크

### 권장 스킬

- `frontend-design`
- `vercel-react-best-practices`

### 권장 MCP / 도구

- Pencil MCP로 아래 화면 확인
  - `outing_record_list_view`
  - `outing_unlock_quiz_modal`
  - `outing_details_storyboard`
  - `outing_registration_form_redesign`

### 구현 주의사항

- 등록 wizard를 단순 시각 분할로 구현하지 말고, step별 validation scope를 분리한다.
- 상세에서 map1/map2와 button1/button2의 노출 조건을 명확히 분리한다.
