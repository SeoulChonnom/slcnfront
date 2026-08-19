---
target: 현재 페이지(홈 허브 /main·/mobile)
total_score: 16
max_score: 28
na_heuristics: 5,9,10
p0_count: 2
p1_count: 4
timestamp: 2026-08-19T01-33-15Z
slug: src-pages-shared-homehubpage-tsx
---
Method: dual-agent (A: 디자인 리뷰 / B: 디텍터·브라우저 증거). 스크린샷 판정은 메인 에이전트 직접 수행.
캡처: screenshots/critique-home/home-desktop-1440.png (/main, 1440x900), home-mobile-390.png (/mobile, 390x844). 로그인은 /users/login·/users/token 목킹으로 통과(홈은 API 미호출).

# AI Slop Verdict

판정: AI-generated. 단 앱 전체가 아니라 홈 허브 화면 + 전역 크롬에 집중. 지수: 높음(홈 허브 한정).

결정적 근거: DESIGN.md가 "A Quiet Seoul Photo Journal — 크롬은 개인 사진 뒤로 물러난다"로 규정하는데, 홈에는 사진이 0장(로고 제외 img 없음, 기록 fetch 자체 없음)이고 그 자리를 유리 효과 헤더와 아이콘 칩이 채운다. 자기 시스템의 핵심 명제를 정확히 뒤집은 상태.

반대 증거(공정성): 카드 자체는 런타임 계산값 box-shadow:none, radius 18px, background-image:none으로 절제됨. 카피는 한국어 구어체 톤 유지. D-day는 제품 고유. 하위 페이지(TripCard)는 실제 사진 + 플랫 카드 규율 준수 → 시스템이 아니라 홈 한 화면의 이탈.

## 증거

정적 디텍터: detect.mjs --json HomeHubPage.tsx / src/components → 둘 다 findings 0, exit 0. 억제 설정·인라인 waiver 없음(--no-config 재확인). CLI는 CSS를 렌더링하지 않음.

브라우저 오버레이(실렌더 주입 성공): /main 19건, /mobile 24건.
low-contrast 13/13, undersized-ui-text 1/6, skipped-heading 1/1, overused-font 1/1, gpt-thin-border-wide-shadow 1/1, cream-palette 1/1, dark-glow 1/0, kicker-above-heading 0/1.

정정: 리뷰 에이전트의 "Inter 미로드" 주장은 오류. main.tsx:1-5에서 @fontsource/inter 400~800 임포트, 실행 페이지에서 document.fonts.check('16px Inter')=true, status=loaded 확인.

## 항목별 분석

1. 불필요한 card / nested card — 부분 해당 · P1 · 변경
   HomeHubPage.tsx 76-207(데스크톱 5), 217-367(모바일 4). 모바일 히어로는 D-day/Film 서브카드를 품은 nested card. 헤더 내비에 이미 있는 4개 목적지를 카드로 재반복.

2. 과도한 border-radius — 일부 해당 · P2 · 카드 유지 / 크롬 변경
   카드 18px(적정), D-day 배지 9999px, 데스크톱 헤더 캡슐 2.5rem(40px), 모바일 탭바 999px. DESIGN.md §8.1은 56px 플랫 바 + 1px 헤어라인 규정.

3. gradient / glow / shadow / glass — 해당, 최대 단일 문제 · P0 · 제거
   LiquidGlassFilter.tsx(feTurbulence + feDisplacementMap), 전역 마운트 AppRoot.tsx:16. 소비처 components-pc.css:19(헤더), components-mobile.css:83(하단 탭바), profile.css 3곳, travel-detail.css:242. inset 유리 하이라이트 + 0 8px 26px rgba(197,142,163,.16) 컬러 앰비언트. 그라디언트는 .pink-mesh(utilities.css:26) 푸터·모바일 상단바 2곳. DESIGN.md §6 위반.

4. icon tile + title + description 반복 — 정확히 해당 · P1 · 변경
   [틴트 아이콘 칩][영문 대문자 eyebrow][볼드 한글 제목][뮤트 설명] ×5(데스크톱)/×4(모바일). DOM 카운트 확인.

5. 균일 grid / spacing — 해당 + 반대 방향 문제 공존 · P1 · 변경
   components-pc.css:215 repeat(3,1fr)에 5개 → 2행 우측 빈 슬롯. 반대로 spacing은 0.6875/0.1875/2.375/1.625rem 등 파편적이며 --space-* 토큰 미사용.

6. generic typography — 해당 · P2 · 변경
   overused-font: 텍스트 100% Inter. tokens.css:47-55의 display/body/caption 토큰 값이 완전 동일. font-weight:800이 34회(DESIGN.md 상한 600). Inter에 한글 글리프 없음 → 한글은 전부 OS 기본 고딕으로 렌더. 한국어 타이포 정체성이 사실상 시스템 기본값.

7. 동일 구조 section / 약한 hierarchy — 해당 · P1 · 변경
   시각적 무게가 동일한 선택지 5개. 위계 신호는 "New" 배지 하나뿐.

8. 목적 무관 decorative — 해당 · P0~P3
   liquid-glass(P0 제거), .display-hand 이름-동작 불일치(P2 정리), .surface-blob/.dot-grid 잔재(P3 제거), fold 내 로고 2회 중복(P3 변경).

9. generic SaaS landing 요소 — 해당 · P1 · 제거
   영문 대문자 eyebrow MAP/JOURNEY/CALENDAR/SHOES/FILM/D-DAY(디텍터 kicker-above-heading), 푸터 "This is for Seoul Trip Records."(Footer.tsx:12, Brand Commitments 위반), hover shadow-lift(components-pc.css:244 translateY(-3px)+0 12px 30px, DESIGN.md §8.3 명시 금지). "New" 배지는 두 사람 맥락에서 의미 가능 → 판단 보류.

10. 접근성 — 디텍터가 잡고 리뷰가 놓침 · P1 · 변경
    low-contrast 13건(#c58ea3 on #ffe8ef = 2.3:1, #9b8c92 on #fff8f8 = 3.1:1). undersized-ui-text 데스크톱 1 / 모바일 6(10px D-day, Film↗, 탭바 라벨 4개). 야외 사용 제품에서 치명적.

11. 모바일 하단 탭바가 콘텐츠 가림 · P2
    390px 첫 화면에서 "신발 추천" 설명이 고정 탭바에 잘림. 문서 948px / 뷰포트 844px. 스크롤 최하단 상태는 미검증(서버 종료).

## Design Health Score

1 시스템 상태 가시성 3 / 2 현실 세계 일치 2 / 3 제어와 자유 3 / 4 일관성 2 / 5 오류 방지 n/a / 6 재인식 우선 3 / 7 유연성·효율 2 / 8 심미성·미니멀 1 / 9 오류 복구 n/a / 10 도움말 n/a
합계 16/28 (57%) — Acceptable

## 강점
1. D-day 배지 — PRODUCT.md 확정 사실(2024-11-10)이 UI에 실제로 들어간 지점.
2. 설명 문구의 조용하고 다정한 한국어 톤.
3. 카드 rest 상태의 flat 규율 준수(계산값 확인).

## 페르소나 레드플래그
- "그 둘": 여는 순간 사진이 아니라 라벨 카드 5개. 추억 앱이 아니라 관리자 도구 느낌.
- Casey(모바일): 야외에서 2.3:1 eyebrow, 3.1:1 캡션, 10px 탭바 라벨이 먼저 사라짐.
- Alex(파워): 자주 쓰는 목적지도 첫 방문자와 동일한 탐색 비용. 이어보기 경로 없음.

## 사소한 관찰
- h1 → h3 점프(skipped-heading).
- cream-palette(#FFF8F8)는 DESIGN.md 확정 warm paper 정체성 → 오탐 처리.
- dark-glow가 /main 1건, /mobile 0건 — 뷰포트 차이인지 디텍터 아티팩트인지 미확인.
- 홈은 API 미호출이라 렌더 결과는 백엔드 없이도 실제와 동일. 로그인만 목킹.

## 생각해볼 질문
1. 헤더에 이미 4개 목적지가 있는데 홈이 같은 4개를 반복하는 이유는? 이 페이지는 존재 이유가 있는가?
2. 홈이 "지난주 사진 한 장 + D-day + 다음 버튼 하나"였다면?
3. feTurbulence 유리 필터를 오늘 밤 지우면 둘 중 누구든 알아챌까?
4. 한글 서체가 OS 기본값인 것은 의도인가, 아무도 확인하지 않은 결과인가?
