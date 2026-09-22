import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { Button } from '@/components/ui/Button';
import { RevisitIntentMark } from '@/domains/inspection/components/RevisitIntentMark';
import { buildPropertyDraftReason } from '@/domains/inspection/components/register/build-draft-reason';
import type {
  RevisitIntent,
  ViewedPropertyDetail,
} from '@/domains/inspection/types';
import { formatVisitedAt } from '@/domains/inspection/utils/inspection-format';
import { buildDeviceInspectionPropertyEditPath } from '@/lib/routing/route-builders';

type CompletionChecklistProps = {
  device: DeviceType;
  areaId: string;
  visitId: string;
  areaName: string;
  visitedAt: string;
  revisitIntent: RevisitIntent | null;
  draftProperties: ViewedPropertyDetail[];
  serverMessage: string | null;
  onDismiss: () => void;
};

/**
 * screen_design.md §5.4 ④, trimmed to one choice per
 * fe_implementation_decisions.md §5: no "빼고 완료하기" branch, only a link to
 * each blocked property's edit screen so this never becomes a dead end.
 */
export function CompletionChecklist({
  device,
  areaId,
  visitId,
  areaName,
  visitedAt,
  revisitIntent,
  draftProperties,
  serverMessage,
  onDismiss,
}: CompletionChecklistProps) {
  const navigate = useNavigate();

  return (
    <div
      className='slcn-inspection-register-completion'
      role='alertdialog'
      aria-label='임장 완료 조건 확인'
    >
      <h2 className='slcn-inspection-register-completion__title'>
        아직 완료할 수 없어요
      </h2>
      {serverMessage ? (
        <p className='slcn-inspection-register-completion__server-message'>
          {serverMessage}
        </p>
      ) : null}

      <ul className='slcn-inspection-register-completion__checklist'>
        <li data-state='ok'>
          <span aria-hidden='true'>✓</span> 임장 지역이 정해졌습니다 —{' '}
          {areaName}
        </li>
        <li data-state='ok'>
          <span aria-hidden='true'>✓</span> 임장 일시가 입력됐습니다 —{' '}
          {formatVisitedAt(visitedAt)}
        </li>
        <li data-state={revisitIntent ? 'ok' : 'blocked'}>
          <span aria-hidden='true'>{revisitIntent ? '✓' : '⚠'}</span> 재방문
          의사 — <RevisitIntentMark intent={revisitIntent} variant='text' />
        </li>
        {draftProperties.length > 0 ? (
          <li data-state='blocked'>
            <span aria-hidden='true'>⚠</span> 매물 {draftProperties.length}건이
            아직 작성 중입니다
            <ul className='slcn-inspection-register-completion__property-list'>
              {draftProperties.map((property) => (
                <li key={property.propertyId}>
                  <span>
                    {property.complexName} · {property.name} —{' '}
                    {buildPropertyDraftReason(property.incompleteSummary)}
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() =>
                      navigate(
                        buildDeviceInspectionPropertyEditPath(
                          device,
                          areaId,
                          visitId,
                          property.propertyId
                        )
                      )
                    }
                  >
                    이어서 쓰기 →
                  </Button>
                </li>
              ))}
            </ul>
          </li>
        ) : (
          <li data-state='ok'>
            <span aria-hidden='true'>✓</span> 매물이 모두 완료됐습니다
          </li>
        )}
      </ul>

      <div className='slcn-inspection-register-completion__actions'>
        <Button onClick={onDismiss}>남은 매물을 마저 쓰기</Button>
      </div>
    </div>
  );
}
