import { useId } from 'react';
import { useBudgetInput } from '@/domains/house/hooks/useBudgetInput';
import type { BudgetInput } from '@/domains/house/utils/calculate-budget';

type BudgetFormProps = {
  defaultReserve: number;
  errors?: Partial<Record<keyof BudgetInput, string>>;
};

const fields = [
  { key: 'cashManwon', label: '보유현금', unit: '만원' },
  { key: 'annualIncomeManwon', label: '부부합산 연소득', unit: '만원' },
  { key: 'interestRatePct', label: '예상 대출금리', unit: '%' },
  {
    key: 'existingMonthlyPaymentManwon',
    label: '기존대출 월 상환',
    unit: '만원/월',
  },
  { key: 'reserveManwon', label: '안전여유금', unit: '만원' },
] as const;

export function BudgetForm({ defaultReserve, errors }: BudgetFormProps) {
  const id = useId();
  const input = useBudgetInput((state) => state.input);
  const setField = useBudgetInput((state) => state.setField);
  const clear = useBudgetInput((state) => state.clear);
  return (
    <form
      className='budget-form'
      aria-label='예산 입력'
      onSubmit={(event) => event.preventDefault()}
    >
      {fields.map(({ key, label, unit }) => (
        <div
          className={`field${key === 'reserveManwon' ? ' field--reserve' : ''}${errors?.[key] ? ' is-error' : ''}`}
          key={key}
        >
          <label className='field__label' htmlFor={`${id}-${key}`}>
            {label}
          </label>
          <div className='field__control'>
            <input
              id={`${id}-${key}`}
              inputMode={key === 'interestRatePct' ? 'decimal' : 'numeric'}
              value={input[key]}
              placeholder={
                key === 'reserveManwon'
                  ? `${defaultReserve.toLocaleString('ko-KR')} (기본값)`
                  : undefined
              }
              onChange={(event) => setField(key, event.target.value)}
              aria-invalid={Boolean(errors?.[key])}
              aria-describedby={
                errors?.[key] ? `${id}-${key}-error` : undefined
              }
              autoComplete='off'
            />
            <span className='field__unit'>{unit}</span>
          </div>
          {errors?.[key] ? (
            <span className='field__error' id={`${id}-${key}-error`}>
              {errors[key]}
            </span>
          ) : null}
        </div>
      ))}
      <div className='field field--check'>
        <label className='check'>
          <input
            type='checkbox'
            checked={input.firstTimeBuyer}
            onChange={(event) =>
              setField('firstTimeBuyer', event.target.checked)
            }
          />
          생애최초 주택 구매
        </label>
      </div>
      <div className='form-actions'>
        <button
          className='house-button house-button--outline'
          type='button'
          onClick={clear}
        >
          입력값 지우기
        </button>
        <span className='house-fine'>이 브라우저 세션에만 저장돼요</span>
      </div>
    </form>
  );
}
