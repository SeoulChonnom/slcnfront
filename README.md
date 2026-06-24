# SLCN Frontend

기존 Vue 기반 SLCN 서비스를 `Vite + React + TypeScript` 구조로 옮긴 프론트엔드입니다. 라우트는 `/main/*`, `/mobile/*` 내부 디바이스 경로만 사용합니다.

## 실행

```bash
pnpm install
pnpm dev
```

Node.js 24 기준으로 작업합니다.

## 스크립트

```bash
pnpm dev
pnpm test
pnpm build
pnpm lint
```

## 라우트

- `/main/*`
- `/mobile/*`

## 도메인

- `trip`: 나들이 목록, 퀴즈, 상세, 등록
- `calendar`: FullCalendar 기반 월간/주간/CRUD
- `shoes`: 정적 신발 카탈로그/상세

## 테스트 구조

- 도메인: `src/domains/**/__tests__`
- 라우터/페이지: `src/app/**/__tests__`, `src/pages/**/__tests__`
- 회귀 smoke: `src/test/regression/__tests__`

## 참고 문서

- 프로젝트 규칙: `rules.md`
- API 명세: `docs/api_spec.json`
- 디자인 기준: `docs/design/design.pen`
