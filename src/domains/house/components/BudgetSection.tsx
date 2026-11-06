import { useEffect } from 'react';
import { useBudgetInput } from '@/domains/house/hooks/useBudgetInput';
import { useBudgetPolicy } from '@/domains/house/hooks/useBudgetPolicy';
import { calculateBudget } from '@/domains/house/utils/calculate-budget';
import { formatEok } from '@/domains/house/utils/format-eok';
import { BudgetForm } from './BudgetForm';
import { BudgetResult } from './BudgetResult';
import './budget.css';

type BudgetSectionProps = {
  onRangeChange: (range: { minPrice: number; maxPrice: number } | null) => void;
};

export function BudgetSection({ onRangeChange }: BudgetSectionProps) {
  const policy = useBudgetPolicy();
  const input = useBudgetInput((state) => state.input);
  const result =
    policy.data && !policy.isError
      ? calculateBudget(input, policy.data)
      : undefined;
  const minPrice = result?.status === 'SUCCESS' ? result.minPrice : undefined;
  const maxPrice = result?.status === 'SUCCESS' ? result.maxPrice : undefined;
  useEffect(() => {
    onRangeChange(
      minPrice !== undefined && maxPrice !== undefined
        ? { minPrice, maxPrice }
        : null
    );
  }, [minPrice, maxPrice, onRangeChange]);

  return (
    <section
      className='house-section house-budget'
      id='budget'
      aria-labelledby='house-budget-heading'
    >
      <div className='house-wrap'>
        <div className='house-section__head'>
          <h2 className='house-section__title' id='house-budget-heading'>
            내 예산
          </h2>
          <p className='house-section__desc'>
            브라우저에서만 계산해요. 입력값은 서버와 링크로 보내지 않습니다.
          </p>
        </div>
        {policy.isError ? (
          <div className='budget-state' role='alert'>
            <p>예산 계산 규칙을 불러오지 못했어요</p>
            <button
              type='button'
              className='house-button house-button--outline'
              onClick={() => void policy.refetch()}
            >
              다시 시도
            </button>
          </div>
        ) : !policy.data ? (
          <div className='budget-state' role='status'>
            예산 계산 규칙을 불러오고 있어요
          </div>
        ) : (
          <>
            <div className='budget-grid'>
              <BudgetForm
                defaultReserve={policy.data.defaultReserveManwon}
                errors={
                  result?.status === 'INVALID' ? result.errors : undefined
                }
              />
              <div className='budget-result' aria-live='polite'>
                {result?.status === 'SUCCESS' ? (
                  <BudgetResult
                    result={result}
                    policy={policy.data}
                    input={input}
                  />
                ) : (
                  <div className='budget-state'>
                    {result?.status === 'INVALID' ? (
                      <>
                        <h3>입력값을 확인해 주세요</h3>
                        <ul>
                          {Object.entries(result.errors).map(
                            ([field, message]) => (
                              <li key={field}>{message}</li>
                            )
                          )}
                        </ul>
                      </>
                    ) : result?.status === 'NO_BUDGET' ? (
                      <p>
                        보유현금이 안전여유금보다 적어 매수 예산을 계산할 수
                        없습니다
                      </p>
                    ) : (
                      <p>
                        보유현금, 연소득, 예상 금리를 입력하면 예산을 계산해
                        드려요
                      </p>
                    )}
                    <p className='house-fine'>
                      예산 계산 전에도 집 찾기와 공부 레퍼런스를 이용할 수
                      있어요.
                    </p>
                  </div>
                )}
              </div>
            </div>
            {result?.status === 'SUCCESS' ? (
              <>
                <section className='range-band' aria-label='탐색 범위'>
                  <div className='range-band__heading'>
                    <div className='range-band__label'>탐색 범위</div>
                    <div className='range-band__value num'>
                      {formatEok(result.minPrice)} ~{' '}
                      {formatEok(result.maxPrice)}
                    </div>
                  </div>
                  <div className='range-band__track' aria-hidden='true'>
                    <div className='range-band__fill' />
                    <span className='range-band__tick range-band__tick--lo num'>
                      {formatEok(result.minPrice)} · 예산의 80%
                    </span>
                    <span className='range-band__tick range-band__tick--hi num'>
                      {formatEok(result.maxPrice)}
                    </span>
                  </div>
                  <button
                    type='button'
                    className='range-band__to'
                    onClick={() =>
                      document
                        .getElementById('find')
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }
                  >
                    지도 가격 필터로 적용 <span aria-hidden='true'>↓</span>
                  </button>
                </section>
                <div className='flow-tail' aria-hidden='true' />
              </>
            ) : null}
            <p className='policy-line'>
              정책 기준일 {policy.data.effectiveFrom} · {policy.data.sourceNote}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
