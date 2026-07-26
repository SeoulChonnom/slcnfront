# Profile & Settings 구현·검증 기록

## 구현 요약

사용자 프로필 이미지와 사용자 정보 수정 흐름을 추가했다. 사용자는 프로필 메뉴에서
정보 화면으로 이동하고, 비밀번호로 본인 확인을 거친 뒤 이름·비밀번호·프로필 이미지를
수정할 수 있다. 빈 문자열 필드는 그대로 전송하며, 변경하지 않는 처리는 백엔드 계약에
따른다.

## API 흐름

수정 제출 시 요청 순서는 다음과 같다.

1. 이미지가 선택된 경우 업로드 API로 이미지를 먼저 업로드한다.
2. 업로드 응답의 이미지 경로를 포함해 사용자 수정 `PUT` 요청을 보낸다.
3. 비밀번호 변경을 포함한 수정 성공 후 `/users/token/`을 호출한다.
4. 새 access token을 저장한 뒤, 새 토큰으로 프로필 asset을 다시 `GET`한다.

E2E 네트워크 검증에서도 `upload → PUT → token → new-token asset GET` 순서를 확인했다.
현재 실제 개발 백엔드는 테스트 계정 `string/string`으로 401을 반환해, 네트워크 순서는
MSW mock E2E에서 검증했다.

## 화면 및 라우트 흐름

| 구분 | 흐름 |
| --- | --- |
| Desktop | `/main/...` 로그인 → 사용자 정보 클릭 → 정보 화면 → 정보 수정 → 비밀번호 확인 → 수정 화면 → 저장 |
| Mobile | `/mobile/...` 로그인 → 사용자 정보 클릭 → 정보 화면 → 정보 수정 → 비밀번호 확인 → 수정 화면 → 저장 |

수정 가능 항목은 이름, 비밀번호, 프로필 이미지다. 확인 화면과 수정 화면의 주요 액션은
모바일에서 하단 고정 영역으로 제공된다. 비밀번호 검증 성공을 알리는 중간 UI는 제거했으며,
검증에 성공하면 즉시 정보 수정 화면을 열거나 해당 라우트로 이동한다.

## 캡처 및 시각 비교 매트릭스

프로토타입 `docs/new_design/SLCN Profile & Settings.dc.html`과 앱 화면을 각각 캡처해
비교했다. Aside daemon을 사용할 수 없어 Playwright 캡처·비교로 대체했다.

| 상태 | Prototype / App 대표 경로 | 비교 결과 |
| --- | --- | --- |
| 사용자 팝오버 | prototype profile popover / desktop 사용자 메뉴 | 실제 `.slcn-profile-popover__surface`가 `292×223`으로 정확 일치 (arrow를 포함한 accessibility wrapper는 `292×226`) |
| 비밀번호 확인 | prototype verify / desktop·mobile verify | `418×274` 정확 일치 |
| 정보 수정 | prototype edit / desktop·mobile edit | `512×550` 정확 일치 |
| 모바일 정보 카드 | prototype mobile profile / mobile 정보 화면 | 카드 `332×98` 일치 |
| 모바일 확인 액션 | prototype verify / mobile verify | 고정 영역 y=`732–811`, 버튼 y=`745–797` 일치 |
| 모바일 수정 액션 | prototype edit / mobile edit | 고정 영역 y=`728–811`, 버튼 y=`741–793` 일치 |

Aside 비교가 불가했던 만큼, 최종 UI도 Playwright로 다시 캡처하여 위 결과를 재확인했다.

최종 비교에 사용한 임시 캡처는 검증 완료 후 저장소에서 제거했다.

Playwright에서 desktop 수정 dialog 외곽은 `overflowY=hidden`, 내부 body는
`clientHeight=548`, `scrollHeight=703`, `overflowY=auto`로 측정되었고, 최대 스크롤 시
내부 `scrollTop=155`, 외곽 `scrollTop=0`에 도달했다. Mobile 비밀번호 영역의
gap/margin은 `9px`로 확인했다. Avatar SVG는 viewBox 중심이 `[12, 13]`,
graphic 중심이 약 `[12, 12.95]`였고 `align-items: center`가 적용되어 시각 중심이
일치했다.

## 폰트 검증

렌더링 결과에서 Inter가 실제 적용됨을 확인했다. 대표 제목의 computed style은
`Inter`, `font-weight: 800`, `font-size: 19px`였고, 폰트 로드 이후
`document.fonts.check(...)`는 `true`를 반환했다. 로컬 Inter의
`400/500/600/700/800` weight도 각각 `document.fonts.load(...)` 이후 실제 로드를
확인했다.

## 최종 명령 증거

| 검증 | 결과 |
| --- | --- |
| `npx @biomejs/biome check --write src/` | 273개 파일 clean |
| `pnpm typecheck` | 통과 |
| `pnpm test` | 통과: 72개 파일, 322개 테스트 |
| 시각 diff-check | 통과 |
| `pnpm run knip` | `docs/new_design/support.js`만 실패; 이번 변경과 무관한 기존 항목 |

## 남은 API 제약

이미지 업로드 성공 뒤 사용자 수정 `PUT`이 실패하면, 업로드된 asset이 고아 상태로 남을 수
있다. 현재 API 명세에는 이를 정리할 삭제/rollback endpoint가 없으므로 프런트엔드에서
완결적으로 처리할 수 없다.
