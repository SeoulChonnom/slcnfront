import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useInspectionAreaList } from '@/domains/inspection/hooks/inspection-queries';
import type { AreaChoice } from '@/domains/inspection/hooks/useInspectionRegisterWizard';
import { formatVisitedAtDate } from '@/domains/inspection/utils/inspection-format';
import { cn } from '@/lib/utils/cn';

type RegisterStepAreaProps = {
  value: AreaChoice | null;
  onChange: (choice: AreaChoice) => void;
  error?: string;
};

export function RegisterStepArea({
  value,
  onChange,
  error,
}: RegisterStepAreaProps) {
  const [keyword, setKeyword] = useState('');
  const [isNewAreaOpen, setIsNewAreaOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaDescription, setNewAreaDescription] = useState('');

  const areaListQuery = useInspectionAreaList({ keyword, size: 10 });
  const areas = areaListQuery.data?.items ?? [];

  function handleCreateNewArea() {
    if (!newAreaName.trim()) {
      return;
    }

    onChange({
      kind: 'new',
      name: newAreaName.trim(),
      description: newAreaDescription.trim(),
    });
  }

  return (
    <div className='slcn-inspection-register-step'>
      <h2 className='slcn-inspection-register-step__title'>
        어느 지역을 임장했나요?
      </h2>
      <p className='slcn-inspection-register-step__lead'>
        먼저 기록할 지역을 고르거나 새로 만들어 주세요.
      </p>

      {value ? (
        <div className='slcn-inspection-register-area-selected' role='status'>
          <span>
            선택한 지역 <strong>{value.name}</strong>
            {value.kind === 'new' ? ' (새 지역)' : ''}
          </span>
        </div>
      ) : null}

      <TextField
        label='지역 검색'
        placeholder='동네 이름으로 검색'
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />

      <ul className='slcn-inspection-register-area-results'>
        {areas.map((area) => {
          const isSelected =
            value?.kind === 'existing' && value.areaId === area.areaId;

          return (
            <li key={area.areaId}>
              <button
                type='button'
                className={cn(
                  'slcn-inspection-register-area-result',
                  isSelected && 'slcn-inspection-register-area-result--selected'
                )}
                aria-pressed={isSelected}
                onClick={() =>
                  onChange({
                    kind: 'existing',
                    areaId: area.areaId,
                    name: area.name,
                  })
                }
              >
                <span className='slcn-inspection-register-area-result__name'>
                  {area.name}
                </span>
                {area.description ? (
                  <span className='slcn-inspection-register-area-result__desc'>
                    {area.description}
                  </span>
                ) : null}
                <span className='slcn-inspection-register-area-result__meta'>
                  임장 {area.visitCount}회
                  {area.lastVisitedAt
                    ? ` · 최근 ${formatVisitedAtDate(area.lastVisitedAt)}`
                    : ''}
                </span>
                <span className='slcn-inspection-register-area-result__chip'>
                  {area.visitCount + 1}번째 회차로 기록
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {areaListQuery.isLoading ? (
        <p className='slcn-inspection-register-step__hint'>찾는 중...</p>
      ) : null}

      {!areaListQuery.isLoading && areas.length === 0 && keyword.trim() ? (
        <p className='slcn-inspection-register-step__hint'>
          "{keyword}"와 일치하는 지역이 없어요. 아래에서 새로 만들어 주세요.
        </p>
      ) : null}

      <div className='slcn-inspection-register-new-area'>
        {!isNewAreaOpen ? (
          <Button variant='ghost' onClick={() => setIsNewAreaOpen(true)}>
            + 새 지역 만들기
          </Button>
        ) : (
          <div className='slcn-inspection-register-new-area__form'>
            <TextField
              label='지역명'
              required
              value={newAreaName}
              onChange={(event) => setNewAreaName(event.target.value)}
            />
            <TextField
              label='지역 설명'
              hint='선택 입력'
              value={newAreaDescription}
              onChange={(event) => setNewAreaDescription(event.target.value)}
            />
            <Button
              variant='secondary'
              disabled={!newAreaName.trim()}
              onClick={handleCreateNewArea}
            >
              이 지역으로 선택
            </Button>
          </div>
        )}
      </div>

      {error ? (
        <p className='slcn-inspection-register-step__error' role='alert'>
          {error}
        </p>
      ) : null}
    </div>
  );
}
