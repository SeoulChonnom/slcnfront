# Seoul Quiet Editorial — 디자인 리디자인 작업 보고서

작업일: 2026-06-18  
브랜치: `feature/redesign`

---

## 1. DESIGN.md 분석 요약

DESIGN.md는 **Seoul Quiet Editorial** 시스템을 정의한다. 기존 "스크랩북/낙서장" 스타일에서 "조용한 에디토리얼 포토저널" 스타일로 전환이 목표다.

### 핵심 방향

| 축           | 기존 스타일                             | DESIGN.md 목표                          |
| ------------ | --------------------------------------- | --------------------------------------- |
| 폰트         | Patrick Hand / Comic Sans (필기체)      | Inter / system-ui (에디토리얼 산세리프) |
| 배경         | 핑크 그라디언트 (`#fe9fc8 → #f793c2`)   | Warm Paper 단색 (`#FFF8F8`)             |
| 테두리       | 두꺼운 검정선 (2–4px solid black)       | 1px hairline (`rgba(27,27,27,0.12)`)    |
| 그림자       | 블록 그림자 (`0 4px 0 0 #000`)          | 없음 (이미지·플로팅 UI만 허용)          |
| 모달         | 4px 검정 테두리 + `-2deg` 회전          | 24px 라운드 + 절제된 그림자             |
| 버튼         | 잉크 배경 + 핑크 텍스트 + 오프셋 그림자 | 서울 핑크 배경 + 잉크 텍스트 + pill     |
| 카드         | 두꺼운 검정 테두리 + blob 형태          | 1px hairline + 18–24px 라운드           |
| 헤더/네비    | `border: 2px solid black` + 불투명 배경 | 반투명 + `backdrop-filter: blur(12px)`  |
| 홈 허브 패널 | 불규칙 blob (40%–60% 반지름)            | 정형 24px 라운드                        |
| 회전 요소    | 카드·모달·데코 회전 존재                | 회전 금지                               |

---

## 2. 수정된 파일 목록

### CSS (핵심)

| 파일                               | 주요 변경 내용                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/styles/tokens.css`            | 전면 교체 — 색상 팔레트, 폰트, 그림자, 반지름 토큰 DESIGN.md 기준으로 재정의              |
| `src/styles/globals.css`           | 배경 그라디언트 → Warm Paper 단색, focus outline 수정                                     |
| `src/styles/utilities.css`         | `pink-mesh` 그라디언트 → `var(--color-canvas)`, blob radius 제거                          |
| `src/styles/components-common.css` | 버튼·카드·모달·세그먼트 컨트롤·라디오 그룹·캘린더·슈즈·홈 허브 등 전 컴포넌트 스타일 수정 |
| `src/styles/components-pc.css`     | 헤더 반투명+blur, 푸터 surface-soft 배경, 테두리 1px 수정                                 |
| `src/styles/components-mobile.css` | 모바일 상단바·하단 내비 반투명+blur, 테두리 1px 수정                                      |

---

## 3. 항목별 변경 상세

### 3.1 Design Tokens (`tokens.css`)

**색상 팔레트 — 이전 → 이후**

```
--color-ink:           #000000          → #1B1B1B
--color-canvas:        (없음)            → #FFF8F8  (Warm Paper)
--color-canvas-pure:   (없음)            → #FFFFFF
--color-surface-soft:  (없음)            → #FFE8EF
--color-surface-muted: #fff7fb           → #F8EEF1
--color-divider-soft:  (없음)            → rgba(27,27,27,0.08)
--color-hairline:      (없음)            → rgba(27,27,27,0.12)
--color-primary:       (없음)            → #FE9FC8  (Seoul Pink)
--color-on-primary:    (없음)            → #1B1B1B
```

**폰트**

```
--font-display: "Patrick Hand", "Comic Sans MS", cursive
              → Inter, system-ui, -apple-system, …

--font-body:   "Plus Jakarta Sans", "Inter", …
              → Inter, system-ui, -apple-system, …
```

**그림자**

```
--shadow-card:     0 4px 0 0 #000000           → none
--shadow-pink:     3px 3px 0 0 #fe9fc8         → none
--shadow-floating: 0 18px 32px rgba(0,0,0,0.14) → 0 8px 30px rgba(27,27,27,0.08)
--shadow-modal:    (없음)                       → 0 24px 80px rgba(27,27,27,0.16)
--shadow-image:    (없음)                       → 3px 5px 30px rgba(27,27,27,0.18)
```

**반지름**

```
--radius-blob: 2rem 2.5rem 1.75rem 2.25rem → 삭제
추가: --radius-xs(6px), --radius-sm(8px), --radius-md(12px),
      --radius-lg(18px), --radius-xl(24px), --radius-pill(9999px)
```

**테두리**

```
--border-thick:  4px → 1px
--border-medium: 2px → 1px
```

---

### 3.2 버튼 (`slcn-button`)

| 속성            | 이전                        | 이후                                               |
| --------------- | --------------------------- | -------------------------------------------------- |
| `border`        | `2px solid black`           | `none`                                             |
| `border-radius` | `0.75rem`                   | `var(--radius-pill)` (9999px)                      |
| `min-height`    | `2.75–3.5rem`               | `2.75rem` (sm), `44px` 기준                        |
| primary 배경    | 잉크 + 핑크 텍스트          | `var(--color-primary)` + `var(--color-on-primary)` |
| secondary 배경  | 흰색 + 블록 그림자          | `var(--color-canvas-pure)` + `1px hairline`        |
| `box-shadow`    | 블록 그림자 (`3px 3px 0 0`) | `none`                                             |
| 액티브          | —                           | `transform: scale(var(--press-scale))`             |

---

### 3.3 모달 (`slcn-modal`)

| 속성            | 이전                                | 이후                                  |
| --------------- | ----------------------------------- | ------------------------------------- |
| `border`        | `4px solid black`                   | `1px solid var(--color-divider-soft)` |
| `border-radius` | 없음                                | `var(--radius-xl)` (24px)             |
| `box-shadow`    | `0 4px 0 0 var(--color-ink)` (블록) | `var(--shadow-modal)` (소프트)        |
| `transform`     | `rotate(-2deg)`                     | 제거                                  |
| `__sticker`     | 좌상단 스티커 데코                  | 삭제                                  |
| `__close` 버튼  | 두꺼운 border, 핑크 배경            | `1px hairline`, `border-radius: full` |

---

### 3.4 세그먼트 컨트롤 (`slcn-segmented-control`)

| 속성          | 이전                      | 이후                         |
| ------------- | ------------------------- | ---------------------------- |
| `border`      | `3px solid black`         | 없음                         |
| `box-shadow`  | `4px 4px 0 0 black`       | 없음                         |
| 배경          | `var(--color-surface)`    | `var(--color-surface-muted)` |
| 활성 세그먼트 | `var(--color-brand-pink)` | `var(--color-canvas-pure)`   |

---

### 3.5 헤더 / 내비게이션

**데스크탑 헤더**

```css
/* 이전 */
border-bottom: 2px solid var(--color-border-strong);

/* 이후 */
border-bottom: 1px solid var(--color-divider-soft);
background: rgba(255, 248, 248, 0.85);
backdrop-filter: blur(12px);
```

**모바일 상단바 · 하단 내비**

```css
/* 이전 */
border-top/bottom: 2px solid var(--color-border-strong);

/* 이후 */
border-top/bottom: 1px solid var(--color-divider-soft);
background: rgba(255, 248, 248, 0.85);
backdrop-filter: blur(12px);
```

---

### 3.6 홈 허브 패널 (`slcn-home-hub__desktop-panel`)

| 속성                    | 이전                             | 이후                           |
| ----------------------- | -------------------------------- | ------------------------------ |
| 각 패널 `border-radius` | 불규칙 blob (`38%–62%` 등)       | `var(--radius-xl)` (24px) 통일 |
| `border`                | `2px solid black`                | 없음                           |
| `box-shadow`            | `0 0 0 3px ..., 0 16px 26px ...` | `var(--shadow-floating)`       |
| 로고 blob               | `45% 55% 52% 48% / ...` (blob)   | `var(--radius-xl)` (24px)      |

---

### 3.7 배경 시스템 (`utilities.css`, `globals.css`)

```css
/* 이전 — globals.css */
background: radial-gradient(
    circle at top,
    rgba(254, 159, 200, 0.28),
    transparent 28%
  ), linear-gradient(180deg, #fffdfd 0%, #fff4f9 100%);

/* 이후 */
background: var(--color-canvas); /* #FFF8F8 Warm Paper */
```

```css
/* 이전 — utilities.css .pink-mesh */
background: linear-gradient(180deg, #fe9fc8 0%, #f793c2 100%);

/* 이후 */
background: var(--color-canvas); /* Shell 배경 → Warm Paper */
```

**컴포넌트별 배경 재정의**

| 컴포넌트            | 배경                                   |
| ------------------- | -------------------------------------- |
| 푸터                | `var(--color-surface-soft)` (#FFE8EF)  |
| 빈 상태(EmptyState) | `var(--color-surface-muted)` (#F8EEF1) |
| 파일 드롭존         | `var(--color-surface-soft)` (#FFE8EF)  |

---

### 3.8 기타 컴포넌트

| 컴포넌트            | 주요 변경                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------- |
| 카드 (`.slcn-card`) | `2px solid black` → `1px solid hairline`, blob radius → `var(--radius-xl)`                   |
| 라디오 그룹         | `3px solid black` + 블록 그림자 → `1px hairline`, 체크 시 `surface-soft`                     |
| 트립 카드           | media `2px solid` → `1px hairline` + `radius-lg`, lock/tag 스타일 정리                       |
| 슈즈 카드           | hover `rotate(-1deg)` 제거, 그라디언트 배경 → `surface-soft`, brand badge blob → `radius-lg` |
| 캘린더 서피스       | `2px solid` + 블록 그림자 → `1px divider-soft`, `radius-md`, fc-event blob → `radius-xs`     |
| 검색 입력           | `2px solid black` → `1px hairline`                                                           |
| 로그인 페이지       | `::after` 장식 원 제거, brand pill 배경 제거                                                 |

---

## 4. 정적 검증 결과

| 항목                        | 결과             | 비고                                                           |
| --------------------------- | ---------------- | -------------------------------------------------------------- |
| TypeScript (`tsc --noEmit`) | **PASS**         | 에러·경고 없음                                                 |
| ESLint                      | 설정 파일 미존재 | `eslint.config.js` 파일이 원래부터 없음 (리디자인 작업과 무관) |
| Vite 빌드 (`pnpm build`)    | **PASS**         | 311개 모듈, ~283ms                                             |

---

## 5. Playwright 시각 검증 결과

| 항목                                | 결과                         |
| ----------------------------------- | ---------------------------- |
| 두꺼운 검정 테두리 (2px+) 없는지    | **PASS**                     |
| 버튼이 pill 형태인지                | **PASS**                     |
| 블록 그림자 없는지                  | **PASS**                     |
| 폰트가 시스템/Inter (필기체 아닌지) | **PASS**                     |
| 카드 회전 없는지                    | **PASS**                     |
| 배경이 Warm Paper 단색인지          | **PASS** (pink-mesh 수정 후) |

> Playwright 검증에서 `pink-mesh` 그라디언트 오버라이드 문제가 발견되어 즉시 수정 완료.

---

## 6. 알려진 잔여 사항

- **ESLint 설정 파일 미존재**: 리디자인 이전부터 `eslint.config.js`가 없어 lint 검증 불가. 별도 작업 필요.
- **로고 에셋**: DESIGN.md는 "별도 제공된 로고 에셋 사용"을 명시함. 현재 `SLCNLogoBlob` 텍스트 로고 컴포넌트가 일부 페이지에서 사용 중이며, 실제 로고 이미지(`src/assets/img/SLCN.png`) 사용 확대 여부는 제품 결정 필요.
- **다크 모드**: DESIGN.md 명시적으로 이번 버전에서 제외.
- **Floating Add Button (FAB)**: DESIGN.md 8.8절 스펙만 있고 미구현 상태.
- **EmptyState `display-hand` 클래스**: 폰트 토큰은 Inter로 변경됐지만, 클래스명 자체 정리 여지 있음.
