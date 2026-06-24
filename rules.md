# SLCN Frontend Rules

이 문서는 `slcnfront` 작업 시 따라야 할 프로젝트별 운영 규칙이다. 현재 React 코드베이스의 구조, 내부 디바이스 라우팅, API 계약, 테스트, UI 기준을 우선한다.

## 1. 기본 원칙

- 이 프로젝트는 현재 React 구현을 기준으로 유지·개선한다. 명시 요청 없이 신규 기능을 추가하지 않는다.
- 현재 코드에 없는 legacy 호환 레이어나 공개 URL 계약을 임의로 되살리지 않는다.
- 작업 전에는 관련 문서와 주변 코드를 먼저 읽고, 기존 패턴을 따른다.
- 변경은 요청 범위에 가깝게 제한한다. 관련 없는 리팩터링, 포맷팅, 파일 이동은 하지 않는다.
- 사용자나 다른 에이전트가 만든 변경사항을 되돌리지 않는다.
- 삭제, `git reset`, 강제 checkout 같은 파괴적 작업은 명시 요청 없이는 수행하지 않는다.

## 2. 기준 문서 우선순위

충돌이 있을 때는 아래 순서로 판단한다.

1. 사용자의 최신 요청
2. `rules.md`
3. `AGENTS.md`
4. `README.md`
5. `docs/api_spec.json`
6. `docs/design/design.pen`

기능과 데이터 계약은 현재 React 구현과 API 명세를 우선하고, 시각 표현은 Pencil 디자인과 현재 React 구현을 우선한다.

## 3. 기술 스택

- 런타임: Node.js 24
- 패키지 매니저: `pnpm`
- 프레임워크: Vite, React 19, TypeScript
- 라우팅: `react-router-dom`
- 서버 상태: `@tanstack/react-query`
- 클라이언트 전역 상태: 필요한 최소 범위에서 `zustand`
- 폼: `react-hook-form` + `zod`
- 캘린더: FullCalendar
- 스타일: Tailwind CSS v4 + `src/styles/*` CSS 토큰/컴포넌트 레이어
- 테스트: Vitest, Testing Library, jsdom, msw

## 4. 명령어

- 개발 서버: `pnpm dev`
- 전체 테스트: `pnpm test`
- 빌드: `pnpm build`
- 린트: `pnpm lint`
- 테스트 watch: `pnpm test:watch`

변경 후에는 영향 범위에 맞는 테스트를 먼저 실행하고, 라우팅/인증/API/공통 UI를 건드렸다면 가능한 한 `pnpm test`, `pnpm build`, `pnpm lint`까지 확인한다.

## 5. 폴더 규칙

애플리케이션 코드는 `src/` 아래 책임별로 배치한다.

- `src/app/`: 앱 부트스트랩, providers, router, shells
- `src/pages/`: route-level page. `main`, `mobile`, `shared` 기준을 유지한다.
- `src/domains/`: `auth`, `trip`, `calendar`, `shoes` 등 도메인별 API, hook, mapper, util, component
- `src/components/`: 재사용 layout/UI primitives
- `src/lib/`: API client, env, routing, 범용 utility
- `src/styles/`: global tokens, utilities, component CSS layers
- `src/test/`: setup, helper, regression smoke tests
- `docs/`: 계획, API 명세, 디자인 자료

새 코드는 가능한 한 해당 도메인 안에 둔다. 예를 들어 나들이 목록 hook은 `src/domains/trip/hooks/`에 둔다.

## 6. 라우팅 규칙

라우트는 내부 디바이스 경로만 사용한다.

- PC 내부 URL: `/main/*`
- Mobile 내부 URL: `/mobile/*`

라우팅 작업 시 아래를 반드시 지킨다.

- 정적 경로는 동적 경로보다 먼저 매칭되어야 한다.
- `/:brand/:shoesName`는 최후순위 라우트다.
- `login`, `map`, `calendar`, `shoesRecom`, `main`, `mobile`은 신발 브랜드 동적 세그먼트로 해석하지 않는다.
- 로그인 redirect는 현재 디바이스 prefix 내부 경로만 허용한다.

## 7. 도메인 구현 규칙

- API 호출은 `src/lib/api/api-client.ts`의 `apiClient` 또는 같은 인터페이스를 주입받는 factory를 사용한다.
- API DTO와 앱 내부 모델은 mapper로 분리한다.
- 컴포넌트 안에서 DTO shape에 직접 의존하지 않는다.
- 서버 상태는 TanStack Query hook으로 감싸고 query key는 도메인별로 관리한다.
- 폼 검증은 Zod schema와 React Hook Form 흐름을 우선한다.
- 파일 업로드는 `FormData`를 사용하고 JSON part는 현재 백엔드 계약에 맞춘다.
- 인증 토큰은 공통 auth store/API client 흐름을 따른다. 임의 localStorage 접근을 늘리지 않는다.

## 8. UI와 스타일 규칙

- 현재 디자인 방향은 핑크/블랙 중심의 SLCN 라이트 테마다.
- 색상, radius, shadow, font는 `src/styles/tokens.css`의 CSS 변수와 기존 utility/component class를 우선 사용한다.
- 공통 UI는 `src/components/ui/`, 레이아웃은 `src/components/layout/`에 둔다.
- PC와 Mobile은 도메인 로직을 공유하고 shell/page presentation만 분리한다.
- 반복 UI는 공통 컴포넌트로 추출하되, 의미 없는 조기 추상화는 피한다.
- Loading, Empty, Error 상태를 빠뜨리지 않는다.
- 버튼, 링크, 모달, 폼 컨트롤은 키보드 접근성과 `aria-*`를 고려한다.
- 모바일에서는 bottom nav/top bar의 가시성과 상세 화면의 뒤로가기 흐름을 우선 확인한다.

## 9. 테스트 규칙

- 테스트 파일은 `*.test.ts` 또는 `*.test.tsx`로 작성한다.
- 기능 테스트는 가능한 한 코드 옆 `__tests__/`에 둔다.
- 회귀 smoke test는 `src/test/regression/__tests__/`에 둔다.
- 라우팅, 인증 bootstrap, API client, mapper, form validation 변경은 회귀 테스트를 추가하거나 갱신한다.
- 테스트에서는 실제 브라우저 전역과 서버 응답을 직접 꾸미기보다 `src/test/helpers/`와 msw 패턴을 우선한다.
- 테스트 편의를 위해 구현을 약하게 만들지 않는다. 현재 internal route/API contract 기준으로 검증한다.

## 10. 코딩 스타일

- TypeScript + React 기존 패턴을 따른다.
- 2-space indentation을 유지한다.
- 컴포넌트와 페이지는 `PascalCase`, hook과 utility는 `camelCase` 또는 기존 파일명 패턴을 따른다.
- ES module import를 사용한다.
- `any`는 피하고, 외부 입력/API 응답에는 명시 타입과 mapper를 둔다.
- 의미가 분명한 작은 함수로 나누되, 파일을 불필요하게 세분화하지 않는다.
- 주석은 복잡한 의도나 계약 설명이 필요할 때만 짧게 작성한다.

## 11. 작업 절차

1. 관련 문서와 주변 구현을 먼저 확인한다.
2. `rg` 또는 `rg --files`로 기존 패턴과 테스트를 찾는다.
3. 변경 범위를 정하고, 관련 없는 파일은 건드리지 않는다.
4. 구현한다.
5. 영향 범위의 테스트를 실행한다.
6. 실패하면 원인을 수정하고 다시 확인한다.
7. 최종 응답에는 변경 파일, 검증 결과, 남은 리스크만 간결하게 남긴다.

## 12. Git 규칙

- 커밋 메시지는 `feat:`, `fix:`, `chore:`, `test:`, `docs:` 같은 짧은 conventional style을 사용한다.
- 한 커밋에는 하나의 논리적 변경만 담는다.
- 사용자가 요청하지 않으면 커밋, push, PR 생성은 하지 않는다.
- 작업 중 `git status`가 더러워도 사용자 변경으로 간주하고 보존한다.
