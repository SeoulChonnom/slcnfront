import {
  ConIcon,
  ProIcon,
} from '@/domains/inspection/components/area-detail/icons';

type VisitProsConsProps = {
  pros: string | null;
  cons: string | null;
};

/**
 * screen_design.md §5.2: pros/cons are free text with no separate Entity
 * (§28) — split into lines here rather than a colored card grid, one line
 * per bullet, blank lines dropped.
 */
function splitLines(value: string | null): string[] {
  if (!value) {
    return [];
  }
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function VisitProsCons({ pros, cons }: VisitProsConsProps) {
  const proLines = splitLines(pros);
  const conLines = splitLines(cons);

  if (proLines.length === 0 && conLines.length === 0) {
    return null;
  }

  return (
    <dl className='slcn-inspection-area-detail-proscons'>
      <div className='slcn-inspection-area-detail-proscons__group'>
        <dt
          className='slcn-inspection-area-detail-proscons__label'
          data-kind='pro'
        >
          <ProIcon /> 장점
        </dt>
        <dd>
          {proLines.length > 0 ? (
            <ul>
              {proLines.map((line, index) => (
                <li key={`pro-${index}`}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className='slcn-inspection-area-detail-proscons__empty'>
              적어 둔 장점이 없어요.
            </p>
          )}
        </dd>
      </div>
      <div className='slcn-inspection-area-detail-proscons__group'>
        <dt
          className='slcn-inspection-area-detail-proscons__label'
          data-kind='con'
        >
          <ConIcon /> 단점
        </dt>
        <dd>
          {conLines.length > 0 ? (
            <ul>
              {conLines.map((line, index) => (
                <li key={`con-${index}`}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className='slcn-inspection-area-detail-proscons__empty'>
              적어 둔 단점이 없어요.
            </p>
          )}
        </dd>
      </div>
    </dl>
  );
}
