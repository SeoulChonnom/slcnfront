---
target: 여행 조회 화면 (목록+상세, PC/모바일)
total_score: 19
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 4
timestamp: 2026-09-02T05-51-35Z
slug: rc-domains-travel-components-travellistsection-tsx
---
Method: dual-agent (A: 디자인 리뷰 · B: 디텍터/브라우저 증거, 둘 다 Sonnet, 격리 실행)
검증 범위: /main/travel · /main/travel/:id @1440x900, /mobile/travel · /mobile/travel/:id @390x844 (로그인 후 실렌더 캡처 4장 + 인페이지 측정)

## Design Health Score

| # | 휴리스틱 | 점수 | 핵심 이슈 |
|---|---|---|---|
| 1 | 시스템 상태 가시성 | 1 | 상세의 장소/사진/태그 추가·삭제 4개 컨트롤이 전부 `() => {}` |
| 2 | 시스템과 현실의 일치 | 2 | "대표" 배지가 카드 전부에 붙음 |
| 3 | 사용자 제어와 자유 | 2 | 삭제 진입점 부재, useDeleteTravel 호출처 0곳 |
| 4 | 일관성과 표준 | 2 | 나들이 목록엔 검색 있음/여행 목록 없음, 지역칩 토큰 불일치 |
| 5 | 오류 예방 | 2 | 작동하지 않는 버튼이 헛클릭 유도 |
| 6 | 인지보다 재인 | 3 | 날짜 레일·카테고리 아이콘 양호 |
| 7 | 유연성과 효율 | 1 | 검색/필터/정렬/연도 그룹 전무 |
| 8 | 미학적·미니멀 | 2 | 1440px 상세에서 앨범 118px 썸네일 한 줄 |
| 9 | 오류 인식·복구 | 2 | ErrorState는 양호, img onError 폴백 전무 |
| 10 | 도움말·문서화 | 2 | "대표" 라벨 설명 없음 |
| **합계** | | **19/40** | **Needs significant work** |

## Design Specificity Verdict

범용 여행 다이어리 SaaS의 목록/상세로 읽힘. 제품 고유성은 빈 상태 문구 "같이 다녀온 여행" 한 곳뿐. D-day·두 사람의 이름·"우리의 N번째 여행" 등 PRODUCT.md가 핵심이라 한 사적 맥락이 부재. 후기 섹션은 라벨+값 박스 2x2 격자라 다이어리가 아닌 비활성 폼 리드아웃으로 읽힘.

결정론적 스캔: detect.mjs exit 0, findings 0건 (--no-config 재실행도 동일).
인페이지 detect.js: main list 2 / main detail 6 / mobile list 2 / mobile detail 2 anti-patterns.
- 실제 결함: low-contrast 2.01:1 (상세 지역칩 + "+ 장소 추가")
- 오탐: cream-palette(#FFF8F8은 DESIGN.md 확정 캔버스), dark-glow, flat-type-hierarchy(의도된 절제)
- 판단 필요: gpt-thin-border-wide-shadow = 카드 hover의 0 8px 28px, DESIGN.md "카드는 평면" 규칙과 divergence
오버레이: 주입 성공·인페이지 디텍터 실행 확인, live-server(8400)는 정지 확인. 사용자 브라우저에 남은 오버레이 탭 없음.

실측: 44px 미만 터치타겟 main목록 7 / main상세 17 / mobile목록 1 / mobile상세 11. 대비 미달 상세만 2쌍. 390px 가로 오버플로 없음. alt 누락 0건. 포커스 링 8개 샘플 전부 있음. fonts.check('16px Pretendard') 4페이지 모두 true.

## What's Working
1. 빈 상태 카피의 관계적 톤 (TravelListSection.tsx:63)
2. 후기 섹션의 세만틱 색 오용 회피 (TravelReviewSection.tsx:12-19)
3. 날짜 레일 패턴 (TravelDayList.tsx)

## Priority Issues

[P0] 상세 화면 인터랙션 4개가 전부 죽어 있음 — TravelDetailSection.tsx:140,149,162,163. readOnly prop 도입 또는 수정 경로로 라우팅. → /impeccable harden
[P1] 상세 지역칩·"+ 장소 추가" 대비 2.01:1 — travel-detail.css:162,304이 primary-focus 사용, 목록(travel-list.css:164)은 accent-muted 사용. accent-muted로 교체. 터치타겟 태그 ✕ 17.59px 포함. → /impeccable audit
[P1] "대표" 배지 정보값 0 — TravelListSection.tsx:77, coverPhotoId 필수화로 항상 참. 제거 또는 재정의. → /impeccable clarify
[P1] 아카이브에 검색·필터·정렬·연도 그룹 부재 — TripListSection.tsx:34,55-71엔 검색 존재. DESIGN.md의 search-input/floating-filter-bar/floating-add-button 미사용. → /impeccable shape
[P1] 이미지 onError 폴백 부재 — TravelCard.tsx:28-34, TravelDetailSection.tsx:67-74, TravelPhotoAlbum.tsx:41-48, TravelPlaceItem.tsx:38-46. 캡처 4장 전부 깨진 이미지 + alt 누출. 프로덕션 재현은 미검증. → /impeccable harden
[P2] 데스크톱 상세에서 사진이 가장 작은 요소 — 앨범 118px 썸네일 한 줄, 모바일보다 작음. 후기 2x2 폼 격자. → /impeccable layout

## Persona Red Flags
- 함께 기록하는 커플: 사진/장소/태그 추가가 전부 무반응. 삭제 경로도 없음.
- Jordan(첫 사용자): 전부 붙은 "대표" 배지 해석 부담, 깨진 이미지 + 파일명형 alt 노출로 고장 오인.
- Alex(기록 50건): 검색·필터·정렬 없음, 나들이 탭엔 있는데 여행 탭엔 없는 비대칭.
- Sam(보조기술): 2.01:1 지역칩, 17.6px 태그 ✕, 앨범 tablist에 aria-controls 없음.

## Minor Observations
- TravelCard.tsx:74 제목 line-clamp 없음 (travel-list.css:180-187), 격자 높이 어긋남 위험
- useDeleteTravel(useTravelMutations.ts:34) 호출처 0곳 (고아 코드)
- 모바일 상단바 제목과 페이지 H1이 "여행 기록"으로 중복
- TravelPlaceItem.tsx:10 description ?? memo 구분 라벨 없음
- 카드가 border-strong 사용, DESIGN.md outing-card 스펙은 hairline
- 10일+ 장기 여행 렌더 미검증(시드 1박2일뿐)
- 모바일 탭바 겹침은 fullPage 캡처 아티팩트로 판단, 실사용 미검증

## Questions to Consider
- 이 화면은 읽는 화면인가 고치는 화면인가? (이슈 6개 중 3개가 이 결정에서 파생)
- 삭제 진입점 부재가 의도적 정책이라면 왜 문서화가 없는가?
- 사적 맥락(D-day, 두 사람 이름, N번째 여행)이 왜 이 화면엔 "같이" 한 단어뿐인가?
- 기록 40건 시점에 이 격자는 어떤 모습인가?

## 미검증 항목
프로덕션 이미지 로드, 장기 여행/사진0/태그0 극단 케이스, 모바일 탭바 겹침 실사용 재현, 포커스 링 전수조사(8개 샘플만). 로그인 데이터가 전부 E2E 시드라 실제 콘텐츠의 정서적 울림은 카피 소스로만 판단.
