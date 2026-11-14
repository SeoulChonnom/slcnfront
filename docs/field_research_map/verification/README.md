# 임장 방문 순서 지도 검증 결과

검증일: 2026-11-15

[FE 연동 가이드](../06-visit-map-fe-guide.md)를 기준으로 기존 지도·주소 기능을 보완했다. 기준 커밋은 최신 `main`의 `05d0fd8`이다. API 계약, 주소 편집, 지도 상태 처리를 서브에이전트가 구현하고 별도 에이전트가 코드 리뷰와 Playwright 검증을 수행했다. 화면 비교와 최종 시각 판정은 메인 에이전트가 직접 수행했다.

## 변경 범위

- 위치가 누락된 매물 상세 응답을 거부하고, 기본 정보 PUT에서 위치를 명시적으로 보존·변경·해제한다. 저장 요청에는 조회된 위경도를 보내지 않는다.
- 새 주소 저장에 실패하면 선택 주소와 입력을 유지한다. 이전 주소로 자동 복구하거나 PUT을 자동 재전송하지 않으며, 저장 실패 시 완료도 진행하지 않는다.
- 주소 검색에 페이지 이동, 일반 오류 안내·명시적 재시도, 취소 신호, 입력 변경 시 오래된 후보 숨김을 적용한다.
- 도보 결과는 패널 메모리에만 유지한다. 중복 클릭을 합치고 회차·순서·위치·패널 상태가 바뀌면 요청과 결과를 폐기한다. 서버의 지점 ID·좌표를 요청 시점과 대조한다.
- 빈 경로·잘못된 경로를 직선으로 대체해 실제 도보 결과로 표시하지 않는다. 선택 회차의 기본 지도는 추정 도보 시간 없이 직선과 번호를 표시한다.
- 같은 위치를 재방문할 때 마커의 모든 번호가 보이도록 표시만 합친다. A→B→A 방문 순서와 선은 유지한다.
- 개발 환경의 빈 카카오 키 덮어쓰기를 제거한다. 키 값은 이 변경에 포함하지 않는다.

## 자동 검사

최종 코드 수정 이후 수행한 결과다.

| 검사 | 결과 |
| --- | --- |
| `npx @biomejs/biome check --write src/` | 492개 파일 검사, 수정 사항과 남은 문제 없음 |
| `pnpm typecheck` | 통과 |
| `pnpm build` | 통과, 폰트 정리 및 미디어 용량 검사 통과 |
| `pnpm test --maxWorkers=2` | 132개 파일, 915개 테스트 통과. 로컬의 기존 인증 작업도 포함한 결과 |
| PR에 포함할 파일만 별도 디렉터리에서 검사 | TypeScript 전체 재검사·Vite 빌드·미디어 검사 통과. 130개 파일, 907개 테스트 통과 |
| `git diff --cached --check` | 통과 |
| 변경 UI 대상 Impeccable detector | 발견 항목 0개 |
| `pnpm run knip` | 실패. 아래 기존 미사용 CSS 3개가 원인 |

PR 파일만 검증할 때는 최신 기준 커밋에 staged diff를 적용한 격리 디렉터리에서 설치된 동일 의존성을 사용했다. `node node_modules/typescript/bin/tsc -b --force --pretty false`, `node node_modules/vite/bin/vite.js build`, `node scripts/strip-legacy-woff.mjs`, `node scripts/check-media-budget.mjs`, `node node_modules/vitest/vitest.mjs run --maxWorkers=2`를 실행했다. 기존에 진행 중이던 인증 갱신 코드와 테스트는 PR에 포함하지 않는다.

Knip의 실제 실패 출력은 다음과 같다. 변경 전 `05d0fd8`만 추출한 격리 디렉터리에서도 동일한 Knip 버전으로 같은 3개를 확인했다. 이번 변경에서 추가된 미사용 항목은 없다.

```text
Unused files (3)
docs/myseoulhouse/design/house-mobile.css
docs/myseoulhouse/design/house-states.css
docs/myseoulhouse/design/house.css
```

## 브라우저 검증

Playwright로 개발 계정의 로그인 UI를 거친 뒤 `/main/inspection/{areaId}`를 1440px, `/mobile/inspection/{areaId}`를 390px에서 검증했다. 로그인·주소·매물·도보 API는 명시적인 모의 응답이며 화면의 아파트와 기록은 검증용 예시다. 기본 화면의 카카오 SDK와 지도 타일은 실제 제공자에서 로드했다.

| 확인 항목 | 결과 |
| --- | --- |
| 실제 카카오 SDK 및 타일 | PC 16개, 모바일 7개 타일 이미지 로드 완료 |
| Pretendard | PC·모바일·편집 화면에서 `document.fonts.check(...)` 참 |
| 가로 넘침 | PC `scrollWidth=1440`, 모바일 `scrollWidth=390`. 편집 화면도 각 viewport와 동일 |
| `A, 위치 없음, A, B, A` | 원래 번호 유지. 지도에 `1·3 / 5`, `4` 표시. 목록에는 위치 없는 2번도 유지 |
| 메모만 수정 | PUT에 기존 건물 `bdMgtSn`이 명시적으로 포함되고 위경도는 포함되지 않음 |
| 도보 버튼 연속 클릭 | POST 1회. 화면 진입만으로는 도보 호출 없음 |
| 직선·도보 전환 | 같은 패널의 응답 재사용, POST 총 1회 유지 |
| 정상 도보 모의 응답 | 서버 응답 기준 14분·1.0km 표시 |
| 429·빈 경로·잘못된 선·다른 지점 응답 | 각 요청 POST 1회, 기본 직선과 목록 유지, 실제 도보 결과로 표시하지 않음 |
| 요청 중 A→B→A 회차 전환 | 늦게 도착한 A 응답 폐기 |
| SDK 요청 차단 | 지도 없이 4개 목록 행과 도보 버튼 유지 |

메인 에이전트가 아래 캡처를 직접 열어 기존 지역 상세 디자인과 비교했다. 기존 글꼴·팔레트·회차 구조를 유지하고, PC·모바일의 번호·출처 표시·주소 편집·실패 상태에서 잘림이나 가로 넘침이 없음을 확인했다. 첫 검사에서 발견한 재방문 마커 겹침은 수정 후 다시 확인했다.

- [PC 전체 화면](desktop-1440.png) · [PC 지도](desktop-map-1440.png)
- [모바일 전체 화면](mobile-390.png) · [모바일 지도](mobile-map-390.png)
- [PC 매물 편집](desktop-edit-1440.png) · [모바일 매물 편집](mobile-edit-390.png)
- [SDK 실패 시 모바일 화면](mobile-sdk-fallback-390.png)
- [브라우저 검사 수치 및 사례별 결과](browser-results.json)

## 미검증 범위

- 로컬 BE `localhost:8080` 연결이 거부되어 실제 로그인과 API는 502로 실패했다. 실제 주소 검색·좌표 조회·DB 저장 및 BE와의 최종 통합은 검증하지 않았다.
- 실제 유료 도보 경로 API는 호출하지 않았다. 도보 UI·오류·중복·응답 폐기는 모의 API로 검증했다.
- 다른 사용자의 동시 수정까지 엄격히 보장하는 서버 revision은 현재 계약에 없다. FE가 아는 변경과 응답 스냅샷 검증 범위만 확인했다.
