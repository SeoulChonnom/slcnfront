export function DataAsOf({
  dataAsOf,
  policyAsOf,
  policyIsError,
  isError,
  onRetry,
}: {
  dataAsOf: string | null | undefined;
  policyAsOf: string | undefined;
  policyIsError: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  return (
    <div className='house-asof'>
      <div className='house-wrap'>
        <span>
          {isError ? (
            '데이터 기준일을 불러오지 못했어요'
          ) : dataAsOf === null ? (
            '데이터 준비 중'
          ) : dataAsOf ? (
            <>
              데이터 기준일 <strong>{dataAsOf}</strong>
            </>
          ) : (
            '데이터 기준일 확인 중'
          )}
        </span>
        <span>
          정책 기준일{' '}
          <strong>
            {policyAsOf ?? (policyIsError ? '확인 불가' : '확인 중')}
          </strong>
        </span>
        {isError && (
          <button type='button' onClick={onRetry}>
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}
