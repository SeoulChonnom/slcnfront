import { useId, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { fetchCurrentLocation } from '@/domains/geo/api/geo-api';
import type { AddressCandidate } from '@/domains/geo/api/geo-schemas';
import { AddressSearchField } from '@/domains/geo/components/AddressSearchField';
import { RouteMap } from '@/domains/geo/map/RouteMap';
import { useKakaoMaps } from '@/domains/geo/map/useKakaoMaps';
import {
  buildSegments,
  buildStops,
  type GeoPoint,
} from '@/domains/geo/utils/route-geometry';
import { useReorderInspectionVisitProperties } from '@/domains/inspection/hooks/inspection-queries';
import type {
  OrderItem,
  ViewedPropertyDetail,
} from '@/domains/inspection/types';
import { formatPropertyName } from '@/domains/inspection/utils/inspection-format';
import { recommendRouteOrder } from '@/domains/inspection/utils/route-order';
import type { VisitPhase } from '@/domains/inspection/utils/visit-phase';
import { AppError } from '@/lib/api/errors';

type RecommendProperty = Pick<
  ViewedPropertyDetail,
  'propertyId' | 'complexName' | 'name' | 'sortOrder' | 'location'
>;

type RecommendOrderPanelProps = {
  visitId: string;
  phase: VisitPhase;
  /** In screen (API array) order. */
  properties: RecommendProperty[];
};

const MESSAGES = {
  coordinateNotFound: '이 주소는 좌표가 없어요. 가까운 다른 건물을 골라 주세요',
  lookupFailed: '주소 확인에 실패했어요. 잠시 후 다시 시도해 주세요',
  unavailable: '지금은 주소를 쓸 수 없어요',
  reorderFailed:
    '순서를 바꾸지 못했어요. 원래 순서로 되돌렸어요. 잠시 뒤 다시 시도해 주세요',
} as const;

function describeLookupError(error: unknown) {
  if (error instanceof AppError) {
    if (error.apiCode === 'ADDRESS_COORDINATE_NOT_FOUND') {
      return { message: MESSAGES.coordinateNotFound, unavailable: false };
    }
    if (error.apiCode === 'ADDRESS_LOOKUP_UNAVAILABLE') {
      return { message: MESSAGES.unavailable, unavailable: true };
    }
  }

  return { message: MESSAGES.lookupFailed, unavailable: false };
}

function formatDistance(meters: number) {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)}km`
    : `${Math.round(meters)}m`;
}

function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

/** Restores with the old sortOrder values when they still encode the order. */
function buildRestoreItems(previous: RecommendProperty[]): OrderItem[] {
  const strictlyAscending = previous.every(
    (property, index) =>
      index === 0 || property.sortOrder > previous[index - 1].sortOrder
  );

  return previous.map((property, index) => ({
    id: property.propertyId,
    sortOrder: strictlyAscending ? property.sortOrder : index,
  }));
}

function hasLocation(
  property: RecommendProperty
): property is RecommendProperty & {
  location: NonNullable<RecommendProperty['location']>;
} {
  return property.location !== null;
}

function countDistinctLocations(properties: RecommendProperty[]) {
  return new Set(
    properties
      .filter(hasLocation)
      .map((p) => `${p.location.latitude},${p.location.longitude}`)
  ).size;
}

type PanelBodyProps = {
  visitId: string;
  properties: RecommendProperty[];
  onClose: () => void;
};

/**
 * Mounted only while the dialog is open, so everything held here — above all
 * the current location — is discarded on close. The location lives in plain
 * component state: no query, mutation, storage, URL or log ever sees it.
 */
function RecommendOrderBody({ visitId, properties, onClose }: PanelBodyProps) {
  const checkId = useId();
  const kakaoMaps = useKakaoMaps();
  const reorder = useReorderInspectionVisitProperties(visitId);
  const requestToken = useRef(0);
  const [selected, setSelected] = useState<AddressCandidate | null>(null);
  const [origin, setOrigin] = useState<GeoPoint | null>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [lookupError, setLookupError] = useState<string | undefined>();
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [returnToOrigin, setReturnToOrigin] = useState(false);
  const [applied, setApplied] = useState<{
    previous: RecommendProperty[];
    appliedIds: string[];
  } | null>(null);
  const [reorderFailed, setReorderFailed] = useState(false);

  async function handleSelect(candidate: AddressCandidate) {
    const token = requestToken.current + 1;
    requestToken.current = token;
    setIsLooking(true);
    setLookupError(undefined);
    setApplied(null);
    setReorderFailed(false);

    try {
      const point = await fetchCurrentLocation(candidate.coordKey);
      if (requestToken.current !== token) {
        return;
      }
      setSelected(candidate);
      setOrigin({ latitude: point.latitude, longitude: point.longitude });
    } catch (error) {
      if (requestToken.current !== token) {
        return;
      }
      const described = describeLookupError(error);
      setSelected(null);
      setOrigin(null);
      setLookupError(described.message);
      if (described.unavailable) {
        setIsUnavailable(true);
      }
    } finally {
      if (requestToken.current === token) {
        setIsLooking(false);
      }
    }
  }

  function handleClear() {
    requestToken.current += 1;
    setSelected(null);
    setOrigin(null);
    setIsLooking(false);
    setLookupError(undefined);
    setApplied(null);
  }

  const currentIds = useMemo(
    () => properties.map((p) => p.propertyId),
    [properties]
  );

  const recommendation = useMemo(() => {
    if (!origin) {
      return null;
    }

    return recommendRouteOrder({
      origin,
      returnToOrigin,
      items: properties.map((p) => ({
        id: p.propertyId,
        location: p.location
          ? { latitude: p.location.latitude, longitude: p.location.longitude }
          : null,
      })),
    });
  }, [origin, returnToOrigin, properties]);

  const ordered = useMemo(() => {
    if (!recommendation) {
      return [];
    }
    const byId = new Map(properties.map((p) => [p.propertyId, p]));

    return recommendation.orderedIds.flatMap((id) => {
      const property = byId.get(id);

      return property ? [property] : [];
    });
  }, [recommendation, properties]);

  const stops = useMemo(
    () =>
      buildStops(
        ordered.map((p) => ({ propertyId: p.propertyId, location: p.location }))
      ),
    [ordered]
  );
  const segments = useMemo(() => buildSegments(stops), [stops]);

  const alreadyShortest =
    recommendation !== null &&
    (sameOrder(recommendation.orderedIds, currentIds) ||
      (recommendation.unlocatedIds.length === 0 &&
        recommendation.distanceMeters >=
          recommendation.currentDistanceMeters - 1));
  const showUndo =
    applied !== null && sameOrder(applied.appliedIds, currentIds);

  function handleApply() {
    if (!recommendation) {
      return;
    }
    const previous = properties;
    const appliedIds = recommendation.orderedIds;
    setReorderFailed(false);
    reorder.mutate(
      appliedIds.map((id, index) => ({ id, sortOrder: index })),
      {
        onSuccess: () => setApplied({ previous, appliedIds }),
        onError: () => setReorderFailed(true),
      }
    );
  }

  function handleUndo() {
    if (!applied) {
      return;
    }
    setReorderFailed(false);
    reorder.mutate(buildRestoreItems(applied.previous), {
      onSuccess: () => setApplied(null),
      onError: () => setReorderFailed(true),
    });
  }

  return (
    <div className='slcn-recommend-order__body'>
      <AddressSearchField
        label='현재 위치'
        value={
          selected
            ? {
                bdMgtSn: selected.bdMgtSn,
                roadAddress: selected.roadAddress ?? selected.jibunAddress,
              }
            : null
        }
        onSelect={handleSelect}
        onClear={handleClear}
        disabled={isUnavailable || isLooking}
        error={lookupError}
      />
      <label className='slcn-recommend-order__check' htmlFor={checkId}>
        <input
          id={checkId}
          type='checkbox'
          checked={returnToOrigin}
          onChange={(event) => setReturnToOrigin(event.target.checked)}
        />
        출발지로 돌아오기
      </label>

      {isLooking ? (
        <p className='slcn-recommend-order__note' role='status'>
          위치를 확인하는 중…
        </p>
      ) : null}

      {recommendation ? (
        <section aria-label='추천 순서 미리보기'>
          <p className='slcn-recommend-order__summary'>
            현재 순서 {formatDistance(recommendation.currentDistanceMeters)} →
            추천 {formatDistance(recommendation.distanceMeters)}
          </p>
          <p className='slcn-recommend-order__note'>직선 기준 추정</p>
          {alreadyShortest && !showUndo ? (
            <p className='slcn-recommend-order__note' role='status'>
              지금 순서가 이미 가장 짧아요
            </p>
          ) : null}
          {recommendation.unlocatedIds.length > 0 ? (
            <p className='slcn-recommend-order__note'>
              위치 미지정 {recommendation.unlocatedIds.length}건은 마지막에
              배치됨
            </p>
          ) : null}
          {kakaoMaps.status === 'ready' && stops.length > 0 ? (
            <RouteMap
              maps={kakaoMaps.maps}
              stops={stops}
              segments={segments}
              origin={origin}
            />
          ) : null}
          <ol className='slcn-recommend-order__list'>
            {ordered.map((property) => (
              <li key={property.propertyId}>
                {property.complexName} · {formatPropertyName(property.name)}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {reorderFailed ? (
        <p className='slcn-recommend-order__note' role='alert'>
          {MESSAGES.reorderFailed}
        </p>
      ) : null}
      {showUndo ? (
        <p className='slcn-recommend-order__note' role='status'>
          추천 순서를 적용했어요
        </p>
      ) : null}

      <div className='slcn-recommend-order__actions'>
        {recommendation ? (
          <Button
            variant='primary'
            onClick={handleApply}
            disabled={alreadyShortest || reorder.isPending || showUndo}
          >
            적용
          </Button>
        ) : null}
        {showUndo ? (
          <Button
            variant='secondary'
            onClick={handleUndo}
            disabled={reorder.isPending}
          >
            되돌리기
          </Button>
        ) : null}
        <Button variant='ghost' onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
}

/**
 * FC6 — "현재 위치 기준 추천 순서 정렬". Hidden for completed visits (the
 * order of a finished visit is a record, not a plan).
 */
export function RecommendOrderPanel({
  visitId,
  phase,
  properties,
}: RecommendOrderPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hintId = useId();

  if (phase === 'COMPLETED') {
    return null;
  }

  const canRecommend = countDistinctLocations(properties) >= 2;

  return (
    <div className='slcn-recommend-order__trigger'>
      <Button
        variant='secondary'
        size='sm'
        disabled={!canRecommend}
        aria-describedby={canRecommend ? undefined : hintId}
        onClick={() => setIsOpen(true)}
      >
        추천 순서로 정렬
      </Button>
      {canRecommend ? null : (
        <span id={hintId} className='slcn-recommend-order__hint'>
          위치가 있는 매물이 2곳 이상 필요해요
        </span>
      )}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='추천 순서로 정렬'
        description='현재 위치에서 가까운 순서로 방문 순서를 추천해요'
        align='left'
        titleVariant='heading'
      >
        <RecommendOrderBody
          visitId={visitId}
          properties={properties}
          onClose={() => setIsOpen(false)}
        />
      </Modal>
    </div>
  );
}
