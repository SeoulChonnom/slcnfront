import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { InterestStars } from '@/domains/inspection/components/InterestStars';
import {
  DownIcon,
  LinkIcon,
  SameIcon,
  UpIcon,
} from '@/domains/inspection/components/property-detail/icons';
import { useInspectionAreaProperties } from '@/domains/inspection/hooks/inspection-queries';
import type { AreaViewedProperty } from '@/domains/inspection/types';
import { formatVisitedAtDate } from '@/domains/inspection/utils/inspection-format';
import { buildDeviceInspectionPropertyDetailPath } from '@/lib/routing/route-builders';

type PropertyLineageStripProps = {
  device: DeviceType;
  areaId: string;
  areaName: string;
  complexName: string;
  name: string;
  currentPropertyId: string;
};

type Delta = {
  label: string;
  dir: 'up' | 'down' | 'same';
};

/**
 * §1.4/§4.6/fe_implementation_decisions.md §3-② — a FE-only grouping: rows
 * sharing this area's normalized `complexName`+`name`, newest visit first.
 * This is a heuristic, not a guaranteed identity match, so the copy never
 * asserts it and "연결 해제" is always offered. Disconnecting only hides the
 * strip for this page view — there is no server endpoint to persist it.
 */
export function PropertyLineageStrip({
  device,
  areaId,
  areaName,
  complexName,
  name,
  currentPropertyId,
}: PropertyLineageStripProps) {
  const [dismissed, setDismissed] = useState(false);
  const { data, isPending, isError } = useInspectionAreaProperties(areaId, {
    complexName,
    name,
  });

  if (dismissed || isPending || isError || !data || data.length <= 1) {
    return null;
  }

  const rows = [...data].sort((a, b) => (a.visitedAt < b.visitedAt ? 1 : -1));

  return (
    <div className='slcn-inspection-lineage'>
      <p className='slcn-inspection-lineage__head'>
        <LinkIcon />
        같은 이름으로 기록된 다른 회차
        <button
          type='button'
          className='slcn-inspection-lineage__dismiss'
          onClick={() => setDismissed(true)}
        >
          연결 해제
        </button>
      </p>
      <p className='slcn-inspection-lineage__note'>
        {areaName}에서 단지와 매물명이 같은 기록을 자동으로 묶었습니다. 다른
        집이라면 연결을 해제할 수 있습니다.
      </p>
      <div className='slcn-inspection-lineage__list'>
        {rows.map((row, index) => {
          const isCurrent = row.propertyId === currentPropertyId;
          const olderRow: AreaViewedProperty | undefined = rows[index + 1];
          const delta = computeDelta(row, olderRow, isCurrent);
          const rowContent = (
            <>
              <span className='slcn-inspection-lineage__date slcn-num'>
                {formatVisitedAtDate(row.visitedAt)}
              </span>
              <InterestStars level={row.interestLevel} />
              <span
                className='slcn-inspection-lineage__delta'
                data-dir={delta.dir}
              >
                {delta.dir === 'up' && <UpIcon />}
                {delta.dir === 'down' && <DownIcon />}
                {delta.dir === 'same' && <SameIcon />}
                {delta.label}
              </span>
            </>
          );

          if (isCurrent) {
            return (
              <div
                key={row.propertyId}
                className='slcn-inspection-lineage__row'
                aria-current='true'
              >
                {rowContent}
              </div>
            );
          }

          return (
            <Link
              key={row.propertyId}
              className='slcn-inspection-lineage__row'
              to={buildDeviceInspectionPropertyDetailPath(
                device,
                areaId,
                row.propertyId
              )}
            >
              {rowContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function computeDelta(
  row: AreaViewedProperty,
  olderRow: AreaViewedProperty | undefined,
  isCurrent: boolean
): Delta {
  const suffix = isCurrent ? ' · 지금 보는 기록' : '';

  if (!olderRow) {
    return { label: `처음 본 회차${suffix}`, dir: 'same' };
  }

  if (row.interestLevel === null || olderRow.interestLevel === null) {
    return { label: `관심도 미입력${suffix}`, dir: 'same' };
  }

  const diff = row.interestLevel - olderRow.interestLevel;

  if (diff > 0) {
    return { label: `${diff}단계 올림${suffix}`, dir: 'up' };
  }

  if (diff < 0) {
    return { label: `${Math.abs(diff)}단계 내림${suffix}`, dir: 'down' };
  }

  return { label: `변화 없음${suffix}`, dir: 'same' };
}
