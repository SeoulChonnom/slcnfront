# 프로젝트 메모리

> 마지막 업데이트: 2026-06-25
> 코드에서 읽을 수 있는 정보는 적지 않음. 코드를 읽으면 알 수 없는 결정/상태/발견만 기록.

## 현재 상태

- 최근 완료: 전체 UI 리디자인 + 파일 API 재설계 (`8ba7f76`)
- CI 없음 — `.github/workflows/` 미설정 상태, 로컬에서만 검증 중
- `.claude/settings.json`에 Biome + TypeScript 증분 체크 PostToolUse 훅 설정됨 (2026-06-25)

## 설계 결정 및 배경

- `pnpm knip`은 기존부터 알려진 미사용 항목을 보고함 — 새 작업이 이를 **늘리지만 않으면** 무시해도 됨. 해결 예정 없음.
- 데스크탑/모바일 분기는 서버 사이드 UA 감지가 아닌 클라이언트 사이드 `DeviceRedirect`로 처리 중 — SEO가 중요하지 않은 앱이기 때문.

## 참고 문서 위치

- API 스펙: `docs/api_spec.json`
- 디자인 분석/감사 결과: `docs/design-audit-report.md`, `docs/design-audit-result.md`
- 리팩토링 계획: `docs/refactoring_plan/`
- 버전 업그레이드 계획: `docs/version_upgrade_plan/`

## 작업 중 발견사항

_세션에서 발견한 내용을 여기에 추가_
