# Step 08. Shoes Domain

## 1. 목적

정적 데이터 기반의 신발 추천 기능을 React 구조로 옮기면서, Pencil 디자인의 카탈로그/상세 비주얼을 적용하는 단계다. 이 단계는 API 연동보다 정적 데이터 정규화와 라우트 안정성이 중요하다.

## 2. 범위

- `/main/shoesRecom`, `/mobile/shoesRecom`
- `/main/:brand/:shoesName`, `/mobile/:brand/:shoesName`
- brand section 목록
- 상세 페이지
- video 유무 분기
- review 링크 카드
- invalid slug 처리

## 3. 참조 소스

- `../old/slcnfront/src/global/global.js`
- `../old/slcnfront/src/views/shoesRecom.vue`
- `../old/slcnfront/src/views/shoesInfo.vue`
- `docs/design/design.pen`
- `docs/new_design_improvement_report.md`

## 4. 확정 결정

- 데이터 소스는 `globalShoes`를 유지한다.
- 브랜드는 `뉴발란스`, `나이키`, `아식스`를 모두 유지한다.
- 신규 디자인보다 실제 데이터 구조가 우선이다.
- 잘못된 brand/shoesName은 항상 404로 처리한다.
- 공개 라우트 정의에서 `/:brand/:shoesName`는 모든 정적 경로 뒤에 둔다.

## 5. 구현 대상

### 5.1 목록

- 브랜드별 섹션 헤더
- 신발 카드 목록
- 가격, 설명, 썸네일 표시
- 클릭 시 상세 진입

### 5.2 상세

- 대표 이미지
- 설명 텍스트
- 영상 영역
  - video 있음: video 또는 외부 링크 렌더링
  - video 없음: 블록 숨김
- 리뷰 카드 2개
- 뒤로가기 진입 affordance

## 6. 파일/폴더 목표 구조

```text
src/
  domains/
    shoes/
      components/
        ShoeBrandSection.tsx
        ShoeCard.tsx
        ShoeDetailHero.tsx
        ShoeVideoPanel.tsx
        ShoeReviewCard.tsx
      data/
        shoes-data.ts
        shoes-normalizer.ts
      hooks/
        useShoeCatalog.ts
        useShoeDetail.ts
      utils/
        shoes-slug.ts
      __tests__/
  pages/
    main/
      ShoesCatalogPage.tsx
      ShoeDetailPage.tsx
    mobile/
      ShoesCatalogPage.tsx
      ShoeDetailPage.tsx
```

## 7. 타입/API/라우트 계약

### 7.1 정식 타입

```ts
type ShoeBrand = {
  brandId: string
  name: string
  desc: string
  img: string
  shoes: ShoeItem[]
}

type ShoeItem = {
  shoesId: string
  name: string
  desc: string
  price: string
  img: string
  videoLink?: string
  video?: string
  videoDesc?: string
  reviewImg1: string
  reviewDesc1: string
  reviewLink1: string
  reviewImg2: string
  reviewDesc2: string
  reviewLink2: string
}
```

### 7.2 slug 규칙

- brand slug는 기존 `brandId`
- shoe slug는 기존 `shoesId`
- 상세 탐색은 `(brandId, shoesId)` 쌍 기준

### 7.3 라우트 계약

- 목록
  - `/main/shoesRecom`
  - `/mobile/shoesRecom`
- 상세
  - `/main/:brand/:shoesName`
  - `/mobile/:brand/:shoesName`

예약 세그먼트 규칙:

- 아래 문자열은 `brand` slug로 사용할 수 없다.
  - `login`
  - `map`
  - `calendar`
  - `shoesRecom`
  - `main`
  - `mobile`

## 8. 작업 순서

1. `globalShoes`를 ESM import 가능한 형태로 정규화한다.
2. brand/shoe 타입과 slug helper를 만든다.
3. 목록 카탈로그 UI를 구현한다.
4. 상세 로더와 invalid slug 처리 로직을 구현한다.
5. 영상 유무 분기와 리뷰 카드 UI를 구현한다.

## 9. 단계 종료 직후 단위 테스트

필수 테스트:

- `shoes-normalizer.test.ts`
  - raw data → normalized catalog 검증
- `shoes-slug.test.ts`
  - brand/shoe slug 매칭 검증
- `useShoeDetail.test.ts`
  - valid/invalid slug 처리 검증
- `ShoeCard.test.tsx`
  - 목록 카드 렌더링과 상세 이동 검증
- `ShoeDetailPage.test.tsx`
  - video 있음/없음, 리뷰 링크, fallback 처리 검증

테스트 게이트:

- shoes domain 테스트 통과 전 Step 09 진행 금지

## 10. 완료 기준

- `globalShoes` 기반 목록과 상세가 React에서 동일하게 동작한다.
- 브랜드 3개와 상품 전체가 누락 없이 렌더링된다.
- 잘못된 slug 진입이 안전하게 처리된다.
- 단계 전용 단위 테스트가 모두 통과했다.

## 11. 리스크 / 보류 항목

- old Vue의 `require()` 자산 참조는 Vite ESM import로 바로 옮기기 어렵다.
  - 정규화 단계에서 asset import를 명시적으로 변환한다.
- 외부 이미지 URL이 깨질 수 있다.
  - 실패 시 alt/placeholder 처리 방식을 남긴다.
- 동적 상세 라우트가 정적 공개 URL을 가로챌 수 있다.
  - Step 04의 예약 세그먼트와 라우트 순서를 그대로 따른다.

## 12. 코딩 에이전트 가이드

### 권장 역할

- 퍼블리셔 + FE

### 권장 스킬

- `frontend-design`

### 구현 주의사항

- 상세 페이지는 디자인을 위해 데이터를 재구성하되, 실제 콘텐츠는 임의로 변경하지 않는다.
- 잘못된 파라미터를 침묵 처리하지 말고 명시적인 fallback으로 보낸다.
