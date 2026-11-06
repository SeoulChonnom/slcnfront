import type { ReactNode } from 'react';
import type { CompareColumn } from '@/domains/house/types';
import {
  formatChangeManwon,
  formatChangePct,
  formatEok,
} from '@/domains/house/utils/format-eok';

function ChangeCell({ change }: { change: CompareColumn['change1y'] }) {
  if (change === null) return <>정보 없음</>;
  const hasFrom = change.fromManwon !== null;
  const hasTo = change.toManwon !== null;
  return (
    <>
      {hasFrom || hasTo ? (
        <span className='house-cell-main'>
          {hasFrom
            ? `${!hasTo ? '과거 ' : ''}${formatEok(change.fromManwon as number)}`
            : ''}
          {hasFrom && hasTo ? ' → ' : ''}
          {hasTo
            ? `${!hasFrom ? '최근 ' : ''}${formatEok(change.toManwon as number)}`
            : ''}
        </span>
      ) : null}
      {change.sampleStatus === 'INSUFFICIENT' ? (
        <span className='house-tag'>표본 부족</span>
      ) : change.pct !== null ? (
        <span
          className={`house-cell-change ${change.pct > 0 ? 'house-change-up' : change.pct < 0 ? 'house-change-down' : ''}`}
        >
          {change.pct > 0 ? '▲ ' : change.pct < 0 ? '▼ ' : ''}
          {formatChangePct(change.pct)}
          {change.changeManwon !== null
            ? ` · ${formatChangeManwon(change.changeManwon)}`
            : ''}
        </span>
      ) : null}
      <span className='house-cell-sub'>
        표본 {change.sampleFrom}건 → {change.sampleTo}건{' '}
        {change.sampleStatus === 'LOW' ? (
          <span className='house-tag'>낮은 표본</span>
        ) : null}
      </span>
    </>
  );
}

function RedevelopmentCell({
  projects,
}: {
  projects: CompareColumn['redevelopments'];
}) {
  if (projects === null) return <>정보 없음</>;
  if (projects.length === 0) return <>직접 연관 사업 없음</>;
  function projectLine(
    project: NonNullable<CompareColumn['redevelopments']>[number]
  ) {
    return (
      <div key={`${project.name}:${project.distanceM}`}>
        <strong>{project.name}</strong> · {project.projectType} ·{' '}
        {project.stage} · 약 {project.distanceM.toLocaleString('ko-KR')}m
        {project.sourceUrl ? (
          <>
            {' '}
            ·{' '}
            <a href={project.sourceUrl} target='_blank' rel='noreferrer'>
              출처 보기
            </a>
          </>
        ) : null}
      </div>
    );
  }
  return (
    <div className='house-cell-lines'>
      {projects.slice(0, 3).map(projectLine)}
      {projects.length > 3 ? (
        <details>
          <summary>정비사업 {projects.length - 3}개 더 보기</summary>
          {projects.slice(3).map(projectLine)}
        </details>
      ) : null}
    </div>
  );
}

const rows: {
  label: string;
  note?: string;
  render: (column: CompareColumn) => ReactNode;
}[] = [
  {
    label: '최근 실거래가',
    render: ({ recentPrice }) =>
      recentPrice ? (
        <>
          <span className='house-cell-main'>
            {formatEok(recentPrice.priceManwon)}
          </span>
          <span className='house-cell-sub'>
            최근 {recentPrice.windowMonths}개월 · {recentPrice.sample}건{' '}
            {recentPrice.sample < 3 ? (
              <span className='house-tag'>표본 적음</span>
            ) : null}
          </span>
        </>
      ) : (
        '최근 6개월 거래 없음'
      ),
  },
  {
    label: '세대수',
    render: ({ households }) =>
      households === null
        ? '정보 없음'
        : `${households.toLocaleString('ko-KR')}세대`,
  },
  {
    label: '연식',
    render: ({ buildYear, ageYears }) =>
      buildYear === null
        ? '정보 없음'
        : `${buildYear}년${ageYears === null ? '' : ` · ${ageYears}년차`}`,
  },
  {
    label: '평형',
    render: ({ areaInfo }) =>
      `${areaInfo.avgExclusiveArea === null ? '' : `${areaInfo.avgExclusiveArea}㎡ 평균 · `}${areaInfo.bucket.slice(1)} 구간`,
  },
  {
    label: '용적률',
    render: ({ far }) =>
      far === null ? (
        '정보 없음'
      ) : (
        <>
          {far.pct.toFixed(2)}%
          <span className='house-cell-sub'>
            {far.source === 'RECAP' ? '총괄표제부' : '표제부'}
          </span>
        </>
      ),
  },
  {
    label: '교육·통학 참고',
    note: '직선거리 · 학교 배정 보장 아님',
    render: ({ schools }) =>
      schools.length === 0 ? (
        '정보 없음'
      ) : (
        <div className='house-cell-lines'>
          {schools.map((school) => (
            <span key={school.level}>
              {{ E: '초', M: '중', H: '고' }[school.level]}{' '}
              <strong>{school.name}</strong> · 약{' '}
              {school.distanceM.toLocaleString('ko-KR')}m
            </span>
          ))}
        </div>
      ),
  },
  {
    label: '호재·정비사업',
    render: ({ redevelopments }) => (
      <RedevelopmentCell projects={redevelopments} />
    ),
  },
  {
    label: '1년 실거래 변동',
    render: ({ change1y }) => <ChangeCell change={change1y} />,
  },
  {
    label: '3년 실거래 변동',
    render: ({ change3y }) => <ChangeCell change={change3y} />,
  },
];

export function CompareTable({ columns }: { columns: CompareColumn[] }) {
  return (
    <div className='house-compare-wrap'>
      <table className='house-compare-table'>
        <caption className='slcn-visually-hidden'>단지 9개 지표 비교</caption>
        <thead>
          <tr>
            <th scope='col'>지표</th>
            {columns.map((column) => (
              <th scope='col' key={`${column.complexId}:${column.area}`}>
                {column.name} · {column.area.slice(1)}㎡
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope='row'>
                {row.label}
                {row.note ? (
                  <span className='house-cell-sub'>{row.note}</span>
                ) : null}
              </th>
              {columns.map((column) => (
                <td key={`${column.complexId}:${column.area}`}>
                  <span className='house-compare-who' aria-hidden='true'>
                    {column.name}
                    <br />
                    {column.area.slice(1)}㎡
                  </span>
                  <div>{row.render(column)}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
